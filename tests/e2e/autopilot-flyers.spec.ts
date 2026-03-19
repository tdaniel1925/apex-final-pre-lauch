// =============================================
// E2E Tests: Apex Lead Autopilot - Flyer Generator
// Tests Social Connector tier flyer generation features
// =============================================

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';
const TEST_EMAIL_PREFIX = 'flyer-test-';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateTestEmail() {
  return `${TEST_EMAIL_PREFIX}${Date.now()}@example.com`;
}

test.describe('Autopilot - Flyer Generator (Social Connector Tier)', () => {
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
        first_name: 'Flyer',
        last_name: 'Test',
        email: testEmail,
        phone: '5551234567',
        affiliate_code: 'TEST' + Date.now().toString().substring(8),
        slug: `test-1773878392863-${Math.random().toString(36).substring(7)}`,
      })
      .select()
      .single();

    if (distError || !distributor) {
      throw new Error(`Failed to create test distributor: ${distError?.message}`);
    }

    testDistributorId = distributor.id;

    await supabase
      .from('autopilot_subscriptions')
      .insert({
        distributor_id: testDistributorId,
        tier: 'social_connector',
        status: 'active',
      });

    console.log(`✅ Test distributor created: ${testDistributorId}`);
  });

  test.afterAll(async () => {
    if (testDistributorId) {
      await supabase.from('event_flyers').delete().eq('distributor_id', testDistributorId);
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
  // TEST 1: Select Flyer Template
  // =============================================
  test('should display available flyer templates', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/flyers`);

    // Should show templates
    await expect(page.locator('text=/template|design/i')).toBeVisible({ timeout: 5000 });

    // Should have at least one template option
    const templates = page.locator('[data-template-id], .template-card, button:has-text("Select")');
    await expect(templates.first()).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 2: Customize Flyer Content
  // =============================================
  test('should customize flyer with text, date, and location', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/flyers`);

    // Select first template
    await page.click('[data-template-id], .template-card, button:has-text("Select")');

    // Fill customization fields
    await page.fill('input[name="event_title"]', 'Grand Business Launch');
    await page.fill('textarea[name="event_description"]', 'Join us for an exciting opportunity presentation');

    const eventDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await page.fill('input[type="date"]', eventDate.toISOString().slice(0, 10));

    await page.fill('input[name="event_location"]', '123 Main St, Business City');
    await page.fill('input[name="contact_info"]', 'contact@example.com');

    // Generate flyer
    await page.click('button:has-text("Generate"), button:has-text("Create")');

    await expect(page.locator('text=/generated|created|success/i')).toBeVisible({ timeout: 10000 });
  });

  // =============================================
  // TEST 3: Generate Flyer
  // =============================================
  test('should generate flyer successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/flyers`);

    // Create flyer
    await page.click('[data-template-id], .template-card, button:has-text("Select")');
    await page.fill('input[name="event_title"]', 'Test Event');
    await page.fill('input[name="event_location"]', 'Test Location');
    await page.click('button:has-text("Generate"), button:has-text("Create")');

    await page.waitForTimeout(2000);

    // Verify flyer saved in database
    const { data: flyers } = await supabase
      .from('event_flyers')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .eq('event_title', 'Test Event');

    expect(flyers).toBeTruthy();
    expect(flyers?.length).toBeGreaterThan(0);
  });

  // =============================================
  // TEST 4: Download Flyer
  // =============================================
  test('should download generated flyer', async ({ page }) => {
    // Create flyer first
    const { data: flyer } = await supabase
      .from('event_flyers')
      .insert({
        distributor_id: testDistributorId,
        template_id: 'modern',
        event_title: 'Download Test Event',
        event_location: 'Download Location',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        flyer_svg: '<svg></svg>',
      })
      .select()
      .single();

    const flyerId = flyer!.id;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/flyers`);

    // Wait for download to start
    const downloadPromise = page.waitForEvent('download');
    await page.click(`button[data-flyer-id="${flyerId}"][aria-label*="Download"], a:has-text("Download")`);

    const download = await downloadPromise;
    expect(download).toBeTruthy();
  });

  // =============================================
  // TEST 5: Download Tracking
  // =============================================
  test('should track flyer downloads', async ({ page }) => {
    const { data: flyer } = await supabase
      .from('event_flyers')
      .insert({
        distributor_id: testDistributorId,
        template_id: 'classic',
        event_title: 'Track Download Event',
        event_location: 'Track Location',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        flyer_svg: '<svg></svg>',
        download_count: 0,
      })
      .select()
      .single();

    const flyerId = flyer!.id;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Trigger download via API
    await page.goto(`${BASE_URL}/api/autopilot/flyers/${flyerId}/download`);
    await page.waitForTimeout(1000);

    // Verify download tracked
    const { data: tracked } = await supabase
      .from('event_flyers')
      .select('*')
      .eq('id', flyerId)
      .single();

    expect(tracked?.download_count).toBeGreaterThan(0);
  });

  // =============================================
  // TEST 6: Usage Counter Incremented
  // =============================================
  test('should increment usage counter after generating flyer', async ({ page }) => {
    const { data: usageBefore } = await supabase
      .from('autopilot_usage_limits')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .single();

    const flyersUsedBefore = usageBefore?.flyers_used || 0;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/flyers`);
    await page.click('[data-template-id], .template-card, button:has-text("Select")');
    await page.fill('input[name="event_title"]', `Usage Test ${Date.now()}`);
    await page.fill('input[name="event_location"]', 'Usage Location');
    await page.click('button:has-text("Generate"), button:has-text("Create")');
    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });

    const { data: usageAfter } = await supabase
      .from('autopilot_usage_limits')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .single();

    const flyersUsedAfter = usageAfter?.flyers_used || 0;

    expect(flyersUsedAfter).toBe(flyersUsedBefore + 1);
  });

  // =============================================
  // TEST 7: Social Connector Tier Limit (10/month)
  // =============================================
  test('should enforce Social Connector tier limit of 10 flyers/month', async ({ page }) => {
    await supabase
      .from('autopilot_usage_limits')
      .update({ flyers_used: 9 })
      .eq('distributor_id', testDistributorId);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Create 10th flyer (should succeed)
    await page.goto(`${BASE_URL}/autopilot/flyers`);
    await page.click('[data-template-id], .template-card, button:has-text("Select")');
    await page.fill('input[name="event_title"]', 'Flyer #10');
    await page.fill('input[name="event_location"]', 'Location 10');
    await page.click('button:has-text("Generate"), button:has-text("Create")');
    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });

    // Try 11th flyer (should fail)
    await page.click('[data-template-id], .template-card, button:has-text("Select")');
    await page.fill('input[name="event_title"]', 'Flyer #11');
    await page.fill('input[name="event_location"]', 'Location 11');
    await page.click('button:has-text("Generate"), button:has-text("Create")');

    await expect(page.locator('text=/limit|upgrade|quota/i')).toBeVisible({ timeout: 10000 });
  });

  // =============================================
  // TEST 8: View Flyer Gallery
  // =============================================
  test('should display gallery of generated flyers', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/flyers`);

    const { data: flyers } = await supabase
      .from('event_flyers')
      .select('*')
      .eq('distributor_id', testDistributorId);

    if (flyers && flyers.length > 0) {
      await expect(page.locator('.flyer-card, [data-flyer-id]')).toBeVisible({ timeout: 5000 });
    }
  });

  // =============================================
  // TEST 9: Delete Flyer
  // =============================================
  test('should delete flyer successfully', async ({ page }) => {
    const { data: flyer } = await supabase
      .from('event_flyers')
      .insert({
        distributor_id: testDistributorId,
        template_id: 'modern',
        event_title: 'Delete Test Flyer',
        event_location: 'Delete Location',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        flyer_svg: '<svg></svg>',
      })
      .select()
      .single();

    const flyerId = flyer!.id;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/flyers`);

    await page.click(`button[data-flyer-id="${flyerId}"][aria-label*="Delete"], button:has-text("Delete")`);

    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    if (await confirmButton.count() > 0) {
      await confirmButton.first().click();
    }

    await page.waitForTimeout(1000);

    const { data: deleted } = await supabase
      .from('event_flyers')
      .select('*')
      .eq('id', flyerId)
      .single();

    expect(deleted).toBeNull();
  });

  // =============================================
  // TEST 10: Template Preview
  // =============================================
  test('should preview template before customization', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/flyers`);

    // Click preview on first template
    const previewButton = page.locator('button:has-text("Preview"), button[aria-label*="Preview"]');
    if (await previewButton.count() > 0) {
      await previewButton.first().click();
      await expect(page.locator('.preview, [role="dialog"]')).toBeVisible({ timeout: 5000 });
    }
  });
});
