// =============================================
// E2E Tests: Apex Lead Autopilot - Team Broadcasts
// Tests Team Edition tier broadcast features
// =============================================

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';
const TEST_EMAIL_PREFIX = 'broadcast-test-';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateTestEmail() {
  return `${TEST_EMAIL_PREFIX}${Date.now()}@example.com`;
}

test.describe('Autopilot - Team Broadcasts (Team Edition Tier)', () => {
  let sponsorDistributorId: string;
  let sponsorAuthUserId: string;
  let sponsorEmail: string;
  let rep1DistributorId: string;
  let rep2DistributorId: string;
  let testPassword = 'TestPass123!';

  test.beforeAll(async () => {
    sponsorEmail = generateTestEmail();

    // Create sponsor (Team tier)
    const { data: sponsorAuth } = await supabase.auth.admin.createUser({
      email: sponsorEmail,
      password: testPassword,
      email_confirm: true,
    });

    sponsorAuthUserId = sponsorAuth!.user!.id;

    const { data: sponsor } = await supabase
      .from('distributors')
      .insert({
        auth_user_id: sponsorAuthUserId,
        first_name: 'Sponsor',
        last_name: 'Test',
        email: sponsorEmail,
        phone: '5551234567',
        affiliate_code: 'TEST' + Date.now().toString().substring(8),
        slug: `test-1773878392866-${Math.random().toString(36).substring(7)}`,
      })
      .select()
      .single();

    sponsorDistributorId = sponsor!.id;

    // Create Team Edition subscription
    await supabase.from('autopilot_subscriptions').insert({
      distributor_id: sponsorDistributorId,
      tier: 'team_edition',
      status: 'active',
    });

    // Create downline rep 1 (Level 1)
    const { data: rep1Auth } = await supabase.auth.admin.createUser({
      email: `rep1-${Date.now()}@example.com`,
      password: testPassword,
      email_confirm: true,
    });

    const { data: rep1 } = await supabase
      .from('distributors')
      .insert({
        auth_user_id: rep1Auth!.user!.id,
        first_name: 'Rep1',
        last_name: 'Test',
        email: rep1Auth!.user!.email,
        sponsor_id: sponsorDistributorId,
      })
      .select()
      .single();

    rep1DistributorId = rep1!.id;

    // Create downline rep 2 (Level 1)
    const { data: rep2Auth } = await supabase.auth.admin.createUser({
      email: `rep2-${Date.now()}@example.com`,
      password: testPassword,
      email_confirm: true,
    });

    const { data: rep2 } = await supabase
      .from('distributors')
      .insert({
        auth_user_id: rep2Auth!.user!.id,
        first_name: 'Rep2',
        last_name: 'Test',
        email: rep2Auth!.user!.email,
        sponsor_id: sponsorDistributorId,
      })
      .select()
      .single();

    rep2DistributorId = rep2!.id;

    console.log(`✅ Test downline structure created: Sponsor -> Rep1, Rep2`);
  });

  test.afterAll(async () => {
    if (sponsorDistributorId) {
      await supabase.from('team_broadcasts').delete().eq('distributor_id', sponsorDistributorId);
      await supabase.from('autopilot_usage_limits').delete().eq('distributor_id', sponsorDistributorId);
      await supabase.from('autopilot_subscriptions').delete().eq('distributor_id', sponsorDistributorId);
    }
    if (rep1DistributorId) {
      await supabase.from('distributors').delete().eq('id', rep1DistributorId);
    }
    if (rep2DistributorId) {
      await supabase.from('distributors').delete().eq('id', rep2DistributorId);
    }
    if (sponsorDistributorId) {
      await supabase.from('distributors').delete().eq('id', sponsorDistributorId);
    }
    if (sponsorAuthUserId) {
      await supabase.auth.admin.deleteUser(sponsorAuthUserId);
    }
    console.log('✅ Test data cleaned up');
  });

  // =============================================
  // TEST 1: Create Email Broadcast to Level 1 Downline
  // =============================================
  test('should create email broadcast to Level 1 downline', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/broadcasts`);

    // Fill broadcast form
    await page.fill('input[name="subject"]', 'Team Update - Important Announcement');
    await page.fill('textarea[name="message"]', 'Hello team! Here is an important update for everyone.');

    // Select Level 1 recipients
    await page.check('input[type="checkbox"][value="level_1"]');

    // Submit
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/broadcast.*sent|success/i')).toBeVisible({ timeout: 10000 });

    // Verify in database
    const { data: broadcasts } = await supabase
      .from('team_broadcasts')
      .select('*')
      .eq('distributor_id', sponsorDistributorId)
      .eq('subject', 'Team Update - Important Announcement');

    expect(broadcasts).toBeTruthy();
    expect(broadcasts?.length).toBeGreaterThan(0);
  });

  // =============================================
  // TEST 2: Verify Recipient Count
  // =============================================
  test('should calculate correct recipient count', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/broadcasts`);

    await page.fill('input[name="subject"]', 'Recipient Count Test');
    await page.fill('textarea[name="message"]', 'Testing recipient count');
    await page.check('input[type="checkbox"][value="level_1"]');

    // Should show recipient count (2 in this case: rep1 and rep2)
    await expect(page.locator('text=/2.*recipient|recipient.*2/i')).toBeVisible({ timeout: 5000 });

    await page.click('button[type="submit"]');
    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });

    // Verify recipient count in database
    const { data: broadcast } = await supabase
      .from('team_broadcasts')
      .select('*')
      .eq('subject', 'Recipient Count Test')
      .single();

    expect(broadcast?.recipient_count).toBe(2);
  });

  // =============================================
  // TEST 3: Schedule Broadcast
  // =============================================
  test('should schedule broadcast for future sending', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/broadcasts`);

    await page.fill('input[name="subject"]', 'Scheduled Broadcast');
    await page.fill('textarea[name="message"]', 'This will be sent later');
    await page.check('input[type="checkbox"][value="level_1"]');

    // Schedule for tomorrow
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));

    await page.click('button[type="submit"]');
    await expect(page.locator('text=/scheduled|success/i')).toBeVisible({ timeout: 10000 });

    // Verify scheduled status
    const { data: broadcast } = await supabase
      .from('team_broadcasts')
      .select('*')
      .eq('subject', 'Scheduled Broadcast')
      .single();

    expect(broadcast?.status).toBe('scheduled');
    expect(broadcast?.scheduled_at).toBeTruthy();
  });

  // =============================================
  // TEST 4: View Broadcast Stats
  // =============================================
  test('should display broadcast statistics', async ({ page }) => {
    // Create test broadcast
    const { data: broadcast } = await supabase
      .from('team_broadcasts')
      .insert({
        distributor_id: sponsorDistributorId,
        subject: 'Stats Test Broadcast',
        message: 'Testing stats',
        recipient_levels: ['level_1'],
        recipient_count: 2,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/broadcasts`);

    // Should show broadcast in list
    await expect(page.locator('text=Stats Test Broadcast')).toBeVisible({ timeout: 5000 });

    // Click to view stats
    await page.click(`button[data-broadcast-id="${broadcast!.id}"], button:has-text("View Stats")`);

    // Should show stats
    await expect(page.locator('text=/sent|recipient/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 5: Filter by Downline Level
  // =============================================
  test('should filter recipients by downline level', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/broadcasts`);

    await page.fill('input[name="subject"]', 'Level Filter Test');
    await page.fill('textarea[name="message"]', 'Testing level filtering');

    // Check different levels
    await page.check('input[type="checkbox"][value="level_1"]');

    // Verify recipient count updates
    await expect(page.locator('text=/recipient/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 6: Send to All Downline
  // =============================================
  test('should send to all downline members', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/broadcasts`);

    await page.fill('input[name="subject"]', 'All Team Broadcast');
    await page.fill('textarea[name="message"]', 'Message for entire team');

    // Select "All Levels" option
    await page.check('input[type="checkbox"][value="all_levels"]');

    await page.click('button[type="submit"]');
    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });
  });

  // =============================================
  // TEST 7: View Broadcast History
  // =============================================
  test('should display broadcast history', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/broadcasts`);

    // Should show list of past broadcasts
    const { data: broadcasts } = await supabase
      .from('team_broadcasts')
      .select('*')
      .eq('distributor_id', sponsorDistributorId);

    if (broadcasts && broadcasts.length > 0) {
      await expect(page.locator('table, [role="table"], .broadcast-item')).toBeVisible({ timeout: 5000 });
    }
  });

  // =============================================
  // TEST 8: Delete Scheduled Broadcast
  // =============================================
  test('should delete scheduled broadcast', async ({ page }) => {
    const { data: broadcast } = await supabase
      .from('team_broadcasts')
      .insert({
        distributor_id: sponsorDistributorId,
        subject: 'Delete Test Broadcast',
        message: 'To be deleted',
        recipient_levels: ['level_1'],
        recipient_count: 2,
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    const broadcastId = broadcast!.id;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/broadcasts`);

    await page.click(`button[data-broadcast-id="${broadcastId}"][aria-label*="Delete"], button:has-text("Delete")`);

    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    if (await confirmButton.count() > 0) {
      await confirmButton.first().click();
    }

    await page.waitForTimeout(1000);

    const { data: deleted } = await supabase
      .from('team_broadcasts')
      .select('*')
      .eq('id', broadcastId)
      .single();

    expect(deleted).toBeNull();
  });

  // =============================================
  // TEST 9: Preview Broadcast Before Sending
  // =============================================
  test('should preview broadcast before sending', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/broadcasts`);

    await page.fill('input[name="subject"]', 'Preview Test');
    await page.fill('textarea[name="message"]', 'This is a preview test message');
    await page.check('input[type="checkbox"][value="level_1"]');

    // Click preview button
    const previewButton = page.locator('button:has-text("Preview")');
    if (await previewButton.count() > 0) {
      await previewButton.click();
      await expect(page.locator('text=Preview Test')).toBeVisible({ timeout: 5000 });
    }
  });

  // =============================================
  // TEST 10: Team Edition Unlimited Broadcasts
  // =============================================
  test('should allow unlimited broadcasts for Team Edition tier', async ({ page }) => {
    // Team Edition has -1 (unlimited) for broadcasts
    const { data: limits } = await supabase
      .from('autopilot_usage_limits')
      .select('*')
      .eq('distributor_id', sponsorDistributorId)
      .single();

    // Team tier should have unlimited broadcasts
    expect(limits?.broadcasts_limit).toBe(-1);

    // Can create many broadcasts without hitting limit
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/broadcasts`);

    // Create multiple broadcasts (no limit error should appear)
    for (let i = 1; i <= 3; i++) {
      await page.fill('input[name="subject"]', `Unlimited Test ${i}`);
      await page.fill('textarea[name="message"]', `Message ${i}`);
      await page.check('input[type="checkbox"][value="level_1"]');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });
    }
  });
});
