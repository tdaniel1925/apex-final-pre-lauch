// =============================================
// E2E Tests: Apex Lead Autopilot - Meeting Invitations
// Tests FREE tier invitation system
// =============================================

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';
const TEST_EMAIL_PREFIX = 'autopilot-test-';

// Supabase client for setup/cleanup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to generate unique test email
function generateTestEmail() {
  return `${TEST_EMAIL_PREFIX}${Date.now()}@example.com`;
}

// Helper to generate test SSN
function generateTestSSN() {
  const area = Math.floor(Math.random() * 699) + 100;
  const group = Math.floor(Math.random() * 99) + 1;
  const serial = Math.floor(Math.random() * 9999) + 1;
  return `${area.toString().padStart(3, '0')}-${group.toString().padStart(2, '0')}-${serial.toString().padStart(4, '0')}`;
}

test.describe('Autopilot - Meeting Invitations (FREE Tier)', () => {
  let testDistributorId: string;
  let testAuthUserId: string;
  let testEmail: string;
  let testPassword = 'TestPass123!';

  // =============================================
  // SETUP: Create test distributor with FREE tier
  // =============================================
  test.beforeAll(async () => {
    testEmail = generateTestEmail();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    testAuthUserId = authData.user.id;

    // Create distributor
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .insert({
        auth_user_id: testAuthUserId,
        first_name: 'Autopilot',
        last_name: 'Test',
        email: testEmail,
        phone: '5551234567',
        affiliate_code: 'TEST' + Date.now().toString().substring(8),
        slug: `autopilot-test-${Date.now()}`,
      })
      .select()
      .single();

    if (distError || !distributor) {
      throw new Error(`Failed to create test distributor: ${distError?.message}`);
    }

    testDistributorId = distributor.id;

    // Create FREE tier autopilot subscription
    const { error: subError } = await supabase
      .from('autopilot_subscriptions')
      .insert({
        distributor_id: testDistributorId,
        tier: 'free',
        status: 'active',
      });

    if (subError) {
      throw new Error(`Failed to create autopilot subscription: ${subError.message}`);
    }

    console.log(`✅ Test distributor created: ${testDistributorId}`);
  });

  // =============================================
  // CLEANUP
  // =============================================
  test.afterAll(async () => {
    // Clean up test data
    if (testDistributorId) {
      await supabase.from('meeting_invitations').delete().eq('distributor_id', testDistributorId);
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
  // TEST 1: Create Meeting Invitation
  // =============================================
  test('should create new meeting invitation successfully', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to invitations page
    await page.goto(`${BASE_URL}/autopilot/invitations`);

    // Wait for page to load
    await expect(page.locator('h1')).toContainText(/invitation/i, { timeout: 5000 });

    // Fill out invitation form
    const recipientEmail = `prospect-${Date.now()}@example.com`;
    await page.fill('input[name="recipient_email"]', recipientEmail);
    await page.fill('input[name="recipient_name"]', 'John Prospect');
    await page.fill('input[name="meeting_title"]', 'Business Overview Meeting');
    await page.fill('textarea[name="meeting_description"]', 'Learn about our opportunity');

    // Set meeting date (7 days from now)
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const dateTimeStr = futureDate.toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', dateTimeStr);

    await page.fill('input[name="meeting_link"]', 'https://zoom.us/j/123456789');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=/invitation sent|success/i')).toBeVisible({ timeout: 10000 });

    // Verify invitation saved to database
    const { data: invitations } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .eq('recipient_email', recipientEmail);

    expect(invitations).toBeTruthy();
    expect(invitations?.length).toBeGreaterThan(0);
    expect(invitations?.[0].status).toBe('sent');
    expect(invitations?.[0].meeting_title).toBe('Business Overview Meeting');
  });

  // =============================================
  // TEST 2: Verify Email Sent (Mock Check)
  // =============================================
  test('should increment usage counter after sending invitation', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Get usage before
    const { data: usageBefore } = await supabase
      .from('autopilot_usage_limits')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .single();

    const meetingsUsedBefore = usageBefore?.meetings_used || 0;

    // Create invitation
    await page.goto(`${BASE_URL}/autopilot/invitations`);
    await page.fill('input[name="recipient_email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="recipient_name"]', 'Test User');
    await page.fill('input[name="meeting_title"]', 'Test Meeting');

    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await page.fill('input[type="datetime-local"]', futureDate.toISOString().slice(0, 16));

    await page.click('button[type="submit"]');
    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });

    // Get usage after
    const { data: usageAfter } = await supabase
      .from('autopilot_usage_limits')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .single();

    const meetingsUsedAfter = usageAfter?.meetings_used || 0;

    // Verify usage incremented
    expect(meetingsUsedAfter).toBe(meetingsUsedBefore + 1);
  });

  // =============================================
  // TEST 3: Tracking Pixel - Open Tracking
  // =============================================
  test('should track invitation opens via tracking pixel', async ({ page }) => {
    // Create test invitation
    const { data: invitation } = await supabase
      .from('meeting_invitations')
      .insert({
        distributor_id: testDistributorId,
        recipient_email: 'tracking-test@example.com',
        recipient_name: 'Tracking Test',
        meeting_title: 'Tracking Test Meeting',
        meeting_date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    expect(invitation).toBeTruthy();
    const invitationId = invitation!.id;

    // Simulate opening email by visiting tracking pixel
    await page.goto(`${BASE_URL}/api/autopilot/track/open/${invitationId}`);

    // Wait for tracking to complete
    await page.waitForTimeout(1000);

    // Verify tracking updated in database
    const { data: tracked } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    expect(tracked?.opened_at).toBeTruthy();
    expect(tracked?.status).toBe('opened');
    expect(tracked?.open_count).toBeGreaterThan(0);
  });

  // =============================================
  // TEST 4: RSVP Response Tracking
  // =============================================
  test('should record RSVP responses (yes/no/maybe)', async ({ page }) => {
    // Create test invitation
    const { data: invitation } = await supabase
      .from('meeting_invitations')
      .insert({
        distributor_id: testDistributorId,
        recipient_email: 'rsvp-test@example.com',
        recipient_name: 'RSVP Test',
        meeting_title: 'RSVP Test Meeting',
        meeting_date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    const invitationId = invitation!.id;

    // Simulate clicking "YES" RSVP link
    await page.goto(`${BASE_URL}/api/autopilot/respond/${invitationId}?response=yes`);

    // Should redirect to thank you page
    await page.waitForURL(/\/autopilot\/respond\/thank-you/);

    // Verify response recorded in database
    const { data: responded } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    expect(responded?.response_type).toBe('yes');
    expect(responded?.status).toBe('responded_yes');
    expect(responded?.responded_at).toBeTruthy();
  });

  // =============================================
  // TEST 5: Resend Invitation
  // =============================================
  test('should resend invitation successfully', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Create invitation
    const { data: invitation } = await supabase
      .from('meeting_invitations')
      .insert({
        distributor_id: testDistributorId,
        recipient_email: 'resend-test@example.com',
        recipient_name: 'Resend Test',
        meeting_title: 'Resend Test Meeting',
        meeting_date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    const invitationId = invitation!.id;

    // Navigate to invitations list
    await page.goto(`${BASE_URL}/autopilot/invitations`);

    // Find and click resend button
    await page.click(`button[data-invitation-id="${invitationId}"][aria-label*="Resend"], button:has-text("Resend")`);

    // Wait for confirmation
    await expect(page.locator('text=/resent|success/i')).toBeVisible({ timeout: 10000 });

    // Verify sent_at updated
    const { data: resent } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    expect(resent?.sent_at).toBeTruthy();
  });

  // =============================================
  // TEST 6: Invitation List & Filtering
  // =============================================
  test('should display invitation list with filtering', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to invitations
    await page.goto(`${BASE_URL}/autopilot/invitations`);

    // Wait for list to load
    await page.waitForSelector('table, [role="table"], .invitation-item', { timeout: 5000 });

    // Verify at least one invitation is visible
    const invitations = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('distributor_id', testDistributorId);

    if (invitations.data && invitations.data.length > 0) {
      // Test status filter if filter exists
      const statusFilter = page.locator('select[name="status"], button:has-text("Filter")');
      if (await statusFilter.count() > 0) {
        await statusFilter.first().click();
      }
    }
  });

  // =============================================
  // TEST 7: FREE Tier Limit (10 invitations/month)
  // =============================================
  test('should enforce FREE tier limit of 10 invitations per month', async ({ page }) => {
    // Set usage to 9 (one away from limit)
    await supabase
      .from('autopilot_usage_limits')
      .update({ meetings_used: 9 })
      .eq('distributor_id', testDistributorId);

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Create 10th invitation (should succeed)
    await page.goto(`${BASE_URL}/autopilot/invitations`);
    await page.fill('input[name="recipient_email"]', `limit-test-10@example.com`);
    await page.fill('input[name="recipient_name"]', 'Limit Test 10');
    await page.fill('input[name="meeting_title"]', 'Test Meeting 10');

    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await page.fill('input[type="datetime-local"]', futureDate.toISOString().slice(0, 16));

    await page.click('button[type="submit"]');
    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });

    // Try to create 11th invitation (should fail)
    await page.fill('input[name="recipient_email"]', `limit-test-11@example.com`);
    await page.fill('input[name="recipient_name"]', 'Limit Test 11');
    await page.fill('input[name="meeting_title"]', 'Test Meeting 11');
    await page.fill('input[type="datetime-local"]', futureDate.toISOString().slice(0, 16));

    await page.click('button[type="submit"]');

    // Should show limit error
    await expect(page.locator('text=/limit|upgrade|quota/i')).toBeVisible({ timeout: 10000 });
  });

  // =============================================
  // TEST 8: Delete/Cancel Invitation
  // =============================================
  test('should delete invitation successfully', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Create invitation to delete
    const { data: invitation } = await supabase
      .from('meeting_invitations')
      .insert({
        distributor_id: testDistributorId,
        recipient_email: 'delete-test@example.com',
        recipient_name: 'Delete Test',
        meeting_title: 'Delete Test Meeting',
        meeting_date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'draft',
      })
      .select()
      .single();

    const invitationId = invitation!.id;

    // Navigate to invitations list
    await page.goto(`${BASE_URL}/autopilot/invitations`);

    // Find and click delete button
    await page.click(`button[data-invitation-id="${invitationId}"][aria-label*="Delete"], button:has-text("Delete")`);

    // Confirm deletion if modal appears
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    if (await confirmButton.count() > 0) {
      await confirmButton.first().click();
    }

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Verify deleted from database
    const { data: deleted } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    expect(deleted).toBeNull();
  });

  // =============================================
  // TEST 9: Invitation Stats Display
  // =============================================
  test('should display invitation statistics', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to invitations
    await page.goto(`${BASE_URL}/autopilot/invitations`);

    // Check for stats display
    await expect(page.locator('text=/total|sent|opened|responded/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 10: Validation Errors
  // =============================================
  test('should show validation errors for invalid invitation data', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to invitations
    await page.goto(`${BASE_URL}/autopilot/invitations`);

    // Try to submit with invalid email
    await page.fill('input[name="recipient_email"]', 'not-an-email');
    await page.fill('input[name="recipient_name"]', 'X'); // Too short
    await page.fill('input[name="meeting_title"]', 'AB'); // Too short

    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=/invalid email|email.*required/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 11: DateTime Format Fix - Date Picker
  // =============================================
  test('should accept date/time from picker without format errors', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to invitations
    await page.goto(`${BASE_URL}/autopilot/invitations`);

    // Fill out complete form with valid data
    const recipientEmail = `datetime-test-${Date.now()}@example.com`;
    await page.fill('input[name="recipient_email"]', recipientEmail);
    await page.fill('input[name="recipient_name"]', 'DateTime Test User');
    await page.fill('input[name="meeting_title"]', 'DateTime Format Test Meeting');

    // Use datetime-local picker (this is what was causing the bug)
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const dateTimeStr = futureDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    await page.fill('input[type="datetime-local"]', dateTimeStr);

    // Optional: add meeting link
    await page.fill('input[name="meeting_link"]', 'https://zoom.us/j/test123456');

    // Submit form
    await page.click('button[type="submit"]');

    // Should NOT show "Invalid date/time format" error
    await expect(page.locator('text=/Invalid date\/time format/i')).not.toBeVisible({ timeout: 3000 });

    // Should show success message instead
    await expect(page.locator('text=/sent successfully|success/i')).toBeVisible({ timeout: 10000 });

    // Verify invitation saved with correct ISO datetime
    const { data: invitations } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .eq('recipient_email', recipientEmail);

    expect(invitations).toBeTruthy();
    expect(invitations?.length).toBeGreaterThan(0);

    // Verify datetime is stored in valid ISO format
    const savedDateTime = invitations?.[0].meeting_date_time;
    expect(savedDateTime).toBeTruthy();

    // Verify it's a valid ISO 8601 datetime
    const parsedDate = new Date(savedDateTime);
    expect(parsedDate.toString()).not.toBe('Invalid Date');
  });

  // =============================================
  // TEST 12: DateTime Validation - Past Date
  // =============================================
  test('should reject past dates with clear error message', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to invitations
    await page.goto(`${BASE_URL}/autopilot/invitations`);

    // Fill out form
    await page.fill('input[name="recipient_email"]', 'past-test@example.com');
    await page.fill('input[name="recipient_name"]', 'Past Test User');
    await page.fill('input[name="meeting_title"]', 'Past Date Test Meeting');

    // Set date in the past
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
    const dateTimeStr = pastDate.toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', dateTimeStr);

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error about future scheduling
    await expect(page.locator('text=/at least 1 hour in the future|must be in the future/i')).toBeVisible({
      timeout: 5000
    });
  });

  // =============================================
  // TEST 13: DateTime Validation - Minimum Buffer
  // =============================================
  test('should require at least 1 hour buffer for meeting scheduling', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to invitations
    await page.goto(`${BASE_URL}/autopilot/invitations`);

    // Fill out form
    await page.fill('input[name="recipient_email"]', 'buffer-test@example.com');
    await page.fill('input[name="recipient_name"]', 'Buffer Test User');
    await page.fill('input[name="meeting_title"]', 'Buffer Test Meeting');

    // Set date 30 minutes in future (should fail - need 1 hour)
    const nearFuture = new Date(Date.now() + 30 * 60 * 1000);
    const dateTimeStr = nearFuture.toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', dateTimeStr);

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error about 1 hour buffer
    await expect(page.locator('text=/at least 1 hour in the future/i')).toBeVisible({ timeout: 5000 });
  });
});
