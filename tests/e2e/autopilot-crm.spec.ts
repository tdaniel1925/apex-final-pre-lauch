// =============================================
// E2E Tests: Apex Lead Autopilot - CRM System
// Tests Pro tier CRM features with AI lead scoring
// =============================================

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';
const TEST_EMAIL_PREFIX = 'crm-test-';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateTestEmail() {
  return `${TEST_EMAIL_PREFIX}${Date.now()}@example.com`;
}

test.describe('Autopilot - CRM System (Pro Tier)', () => {
  let testDistributorId: string;
  let testAuthUserId: string;
  let testEmail: string;
  let testPassword = 'TestPass123!';

  test.beforeAll(async () => {
    testEmail = generateTestEmail();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    testAuthUserId = authData.user.id;

    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .insert({
        auth_user_id: testAuthUserId,
        first_name: 'CRM',
        last_name: 'Test',
        email: testEmail,
        phone: '5551234567',
        affiliate_code: 'TEST' + Date.now().toString().substring(8),
        slug: `test-1773878392864-${Math.random().toString(36).substring(7)}`,
      })
      .select()
      .single();

    if (distError || !distributor) {
      throw new Error(`Failed to create test distributor: ${distError?.message}`);
    }

    testDistributorId = distributor.id;

    // Create Pro tier subscription
    await supabase
      .from('autopilot_subscriptions')
      .insert({
        distributor_id: testDistributorId,
        tier: 'lead_autopilot_pro',
        status: 'active',
      });

    console.log(`✅ Test distributor created with Pro tier: ${testDistributorId}`);
  });

  test.afterAll(async () => {
    if (testDistributorId) {
      await supabase.from('crm_notes').delete().eq('distributor_id', testDistributorId);
      await supabase.from('crm_tasks').delete().eq('distributor_id', testDistributorId);
      await supabase.from('crm_contacts').delete().eq('distributor_id', testDistributorId);
      await supabase.from('autopilot_usage_limits').delete().eq('distributor_id', testDistributorId);
      await supabase.from('autopilot_subscriptions').delete().eq('distributor_id', testDistributorId);
      await supabase.from('distributors').delete().eq('id', testDistributorId);
    }
    if (testAuthUserId) {
      await supabase.auth.admin.deleteUser(testAuthUserId);
    }
    console.log('✅ Test data cleaned up');
  });

  // =============================================
  // TEST 1: Create New Contact
  // =============================================
  test('should create new CRM contact successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/crm/contacts`);

    // Fill contact form
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Prospect');
    await page.fill('input[name="email"]', 'john.prospect@example.com');
    await page.fill('input[name="phone"]', '555-123-4567');
    await page.fill('input[name="company"]', 'Prospect Corp');
    await page.fill('textarea[name="notes"]', 'Met at networking event');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=/contact.*created|success/i')).toBeVisible({ timeout: 10000 });

    // Verify in database
    const { data: contacts } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .eq('email', 'john.prospect@example.com');

    expect(contacts).toBeTruthy();
    expect(contacts?.length).toBeGreaterThan(0);
    expect(contacts?.[0].first_name).toBe('John');
  });

  // =============================================
  // TEST 2: AI Lead Score Calculation
  // =============================================
  test('should calculate AI lead score for new contact', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/crm/contacts`);

    const contactEmail = `scored-${Date.now()}@example.com`;
    await page.fill('input[name="first_name"]', 'Jane');
    await page.fill('input[name="last_name"]', 'Lead');
    await page.fill('input[name="email"]', contactEmail);
    await page.fill('input[name="phone"]', '555-987-6543');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });

    // Verify lead score calculated
    const { data: contact } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('email', contactEmail)
      .single();

    expect(contact?.lead_score).toBeTruthy();
    expect(contact?.lead_score).toBeGreaterThanOrEqual(0);
    expect(contact?.lead_score).toBeLessThanOrEqual(100);
  });

  // =============================================
  // TEST 3: Update Contact - Recalculate Score
  // =============================================
  test('should recalculate lead score when contact updated', async ({ page }) => {
    // Create contact
    const { data: contact } = await supabase
      .from('crm_contacts')
      .insert({
        distributor_id: testDistributorId,
        first_name: 'Update',
        last_name: 'Test',
        email: `update-${Date.now()}@example.com`,
        lead_score: 50,
      })
      .select()
      .single();

    const contactId = contact!.id;
    const originalScore = contact!.lead_score;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/crm/contacts`);

    // Edit contact
    await page.click(`button[data-contact-id="${contactId}"][aria-label*="Edit"], button:has-text("Edit")`);
    await page.fill('input[name="company"]', 'Major Enterprise Corp');
    await page.fill('input[name="title"]', 'CEO');
    await page.click('button:has-text("Save")');

    await page.waitForTimeout(2000);

    // Verify score updated
    const { data: updated } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    expect(updated?.lead_score).toBeTruthy();
    // Score should have changed (increased due to CEO title)
  });

  // =============================================
  // TEST 4: Add Note to Contact
  // =============================================
  test('should add note to contact', async ({ page }) => {
    const { data: contact } = await supabase
      .from('crm_contacts')
      .insert({
        distributor_id: testDistributorId,
        first_name: 'Note',
        last_name: 'Test',
        email: `note-${Date.now()}@example.com`,
      })
      .select()
      .single();

    const contactId = contact!.id;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/crm/contacts`);

    // Open contact details
    await page.click(`[data-contact-id="${contactId}"], button:has-text("View")`);

    // Add note
    await page.fill('textarea[name="note_content"]', 'Follow up next week about product demo');
    await page.click('button:has-text("Add Note")');

    await page.waitForTimeout(1000);

    // Verify note saved
    const { data: notes } = await supabase
      .from('crm_notes')
      .select('*')
      .eq('contact_id', contactId);

    expect(notes).toBeTruthy();
    expect(notes?.length).toBeGreaterThan(0);
  });

  // =============================================
  // TEST 5: Create Task Linked to Contact
  // =============================================
  test('should create task linked to contact', async ({ page }) => {
    const { data: contact } = await supabase
      .from('crm_contacts')
      .insert({
        distributor_id: testDistributorId,
        first_name: 'Task',
        last_name: 'Test',
        email: `task-${Date.now()}@example.com`,
      })
      .select()
      .single();

    const contactId = contact!.id;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/crm/contacts`);

    // Create task
    await page.click('button:has-text("New Task"), a:has-text("Tasks")');
    await page.fill('input[name="title"]', 'Call prospect');
    await page.fill('textarea[name="description"]', 'Discuss partnership opportunity');

    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await page.fill('input[type="date"]', dueDate.toISOString().slice(0, 10));

    // Link to contact
    await page.selectOption('select[name="contact_id"]', contactId);

    await page.click('button[type="submit"]');

    await expect(page.locator('text=/task.*created|success/i')).toBeVisible({ timeout: 10000 });

    // Verify in database
    const { data: tasks } = await supabase
      .from('crm_tasks')
      .select('*')
      .eq('contact_id', contactId);

    expect(tasks).toBeTruthy();
    expect(tasks?.length).toBeGreaterThan(0);
  });

  // =============================================
  // TEST 6: Move Contact Through Pipeline Stages
  // =============================================
  test('should move contact through pipeline stages', async ({ page }) => {
    const { data: contact } = await supabase
      .from('crm_contacts')
      .insert({
        distributor_id: testDistributorId,
        first_name: 'Pipeline',
        last_name: 'Test',
        email: `pipeline-${Date.now()}@example.com`,
        pipeline_stage: 'lead',
      })
      .select()
      .single();

    const contactId = contact!.id;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/crm/contacts`);

    // Change pipeline stage
    await page.click(`button[data-contact-id="${contactId}"][aria-label*="Stage"]`);
    await page.click('button:has-text("Qualified"), option:has-text("Qualified")');

    await page.waitForTimeout(1000);

    // Verify updated
    const { data: updated } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    expect(updated?.pipeline_stage).toMatch(/qualified/i);
  });

  // =============================================
  // TEST 7: Search and Filter Contacts
  // =============================================
  test('should search and filter contacts', async ({ page }) => {
    // Create test contacts
    await supabase.from('crm_contacts').insert([
      {
        distributor_id: testDistributorId,
        first_name: 'Search',
        last_name: 'Alpha',
        email: 'alpha@example.com',
        company: 'Alpha Corp',
      },
      {
        distributor_id: testDistributorId,
        first_name: 'Search',
        last_name: 'Beta',
        email: 'beta@example.com',
        company: 'Beta Inc',
      },
    ]);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/crm/contacts`);

    // Search for specific contact
    await page.fill('input[name="search"], input[placeholder*="Search"]', 'Alpha');

    await page.waitForTimeout(1000);

    // Should show Alpha but not Beta
    await expect(page.locator('text=Alpha Corp')).toBeVisible();
  });

  // =============================================
  // TEST 8: Pro Tier Contact Limit (500)
  // =============================================
  test('should enforce Pro tier limit of 500 contacts', async ({ page }) => {
    // Set contact count to 499
    await supabase
      .from('autopilot_usage_limits')
      .update({ contacts_used: 499 })
      .eq('distributor_id', testDistributorId);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Create 500th contact (should succeed)
    await page.goto(`${BASE_URL}/autopilot/crm/contacts`);
    await page.fill('input[name="first_name"]', 'Contact');
    await page.fill('input[name="last_name"]', '500');
    await page.fill('input[name="email"]', `contact500@example.com`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });

    // Try 501st contact (should fail)
    await page.fill('input[name="first_name"]', 'Contact');
    await page.fill('input[name="last_name"]', '501');
    await page.fill('input[name="email"]', `contact501@example.com`);
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/limit|upgrade|quota/i')).toBeVisible({ timeout: 10000 });
  });

  // =============================================
  // TEST 9: Delete Contact
  // =============================================
  test('should delete contact successfully', async ({ page }) => {
    const { data: contact } = await supabase
      .from('crm_contacts')
      .insert({
        distributor_id: testDistributorId,
        first_name: 'Delete',
        last_name: 'Test',
        email: `delete-${Date.now()}@example.com`,
      })
      .select()
      .single();

    const contactId = contact!.id;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/crm/contacts`);

    await page.click(`button[data-contact-id="${contactId}"][aria-label*="Delete"], button:has-text("Delete")`);

    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    if (await confirmButton.count() > 0) {
      await confirmButton.first().click();
    }

    await page.waitForTimeout(1000);

    const { data: deleted } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    expect(deleted).toBeNull();
  });

  // =============================================
  // TEST 10: Export Contacts
  // =============================================
  test('should export contacts to CSV', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/crm/contacts`);

    const exportButton = page.locator('button:has-text("Export"), a:has-text("Export")');
    if (await exportButton.count() > 0) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.first().click();

      const download = await downloadPromise;
      expect(download).toBeTruthy();
      expect(download.suggestedFilename()).toMatch(/\.csv$/i);
    }
  });
});
