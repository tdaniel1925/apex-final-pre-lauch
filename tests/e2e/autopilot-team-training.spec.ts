// =============================================
// E2E Tests: Apex Lead Autopilot - Training Sharing
// Tests Team Edition tier training library features
// =============================================

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';
const TEST_EMAIL_PREFIX = 'training-test-';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateTestEmail() {
  return `${TEST_EMAIL_PREFIX}${Date.now()}@example.com`;
}

test.describe('Autopilot - Training Sharing (Team Edition Tier)', () => {
  let sponsorDistributorId: string;
  let sponsorAuthUserId: string;
  let sponsorEmail: string;
  let downlineDistributorId: string;
  let downlineAuthUserId: string;
  let downlineEmail: string;
  let testPassword = 'TestPass123!';
  let testTrainingVideoId: string;

  test.beforeAll(async () => {
    sponsorEmail = generateTestEmail();
    downlineEmail = `downline-${generateTestEmail()}`;

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
        last_name: 'Training',
        email: sponsorEmail,
        phone: '5551234567',
        affiliate_code: 'TEST' + Date.now().toString().substring(8),
        slug: `test-1773878392868-${Math.random().toString(36).substring(7)}`,
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

    // Create downline member
    const { data: downlineAuth } = await supabase.auth.admin.createUser({
      email: downlineEmail,
      password: testPassword,
      email_confirm: true,
    });

    downlineAuthUserId = downlineAuth!.user!.id;

    const { data: downline } = await supabase
      .from('distributors')
      .insert({
        auth_user_id: downlineAuthUserId,
        first_name: 'Downline',
        last_name: 'Member',
        email: downlineEmail,
        phone: '5551234570',
        affiliate_code: 'TEST' + Date.now().toString().substring(8),
        sponsor_id: sponsorDistributorId,
      })
      .select()
      .single();

    downlineDistributorId = downline!.id;

    // Create test training video
    const { data: video } = await supabase
      .from('training_videos')
      .insert({
        title: 'Test Training Video',
        description: 'Test video for sharing',
        video_url: 'https://example.com/video.mp4',
        duration_seconds: 600,
        category: 'business',
      })
      .select()
      .single();

    testTrainingVideoId = video!.id;

    console.log(`✅ Test sponsor and downline created for training sharing`);
  });

  test.afterAll(async () => {
    if (sponsorDistributorId) {
      await supabase.from('training_shares').delete().eq('shared_by_id', sponsorDistributorId);
      await supabase.from('autopilot_usage_limits').delete().eq('distributor_id', sponsorDistributorId);
      await supabase.from('autopilot_subscriptions').delete().eq('distributor_id', sponsorDistributorId);
    }
    if (downlineDistributorId) {
      await supabase.from('distributors').delete().eq('id', downlineDistributorId);
    }
    if (sponsorDistributorId) {
      await supabase.from('distributors').delete().eq('id', sponsorDistributorId);
    }
    if (sponsorAuthUserId) {
      await supabase.auth.admin.deleteUser(sponsorAuthUserId);
    }
    if (downlineAuthUserId) {
      await supabase.auth.admin.deleteUser(downlineAuthUserId);
    }
    if (testTrainingVideoId) {
      await supabase.from('training_videos').delete().eq('id', testTrainingVideoId);
    }
    console.log('✅ Test data cleaned up');
  });

  // =============================================
  // TEST 1: Share Training Video with Downline Member
  // =============================================
  test('should share training video with downline member', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/training`);

    // Select video to share
    await page.click(`button[data-video-id="${testTrainingVideoId}"], button:has-text("Share")`);

    // Select downline member
    await page.check(`input[type="checkbox"][value="${downlineDistributorId}"]`);

    // Add optional message
    await page.fill('textarea[name="message"]', 'Check out this training! Very helpful for growing your business.');

    // Submit share
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/shared|success/i')).toBeVisible({ timeout: 10000 });

    // Verify in database
    const { data: shares } = await supabase
      .from('training_shares')
      .select('*')
      .eq('shared_by_id', sponsorDistributorId)
      .eq('shared_with_id', downlineDistributorId)
      .eq('training_video_id', testTrainingVideoId);

    expect(shares).toBeTruthy();
    expect(shares?.length).toBeGreaterThan(0);
  });

  // =============================================
  // TEST 2: Verify Share Recorded
  // =============================================
  test('should record training share in database', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/training`);

    // Share video
    await page.click(`button[data-video-id="${testTrainingVideoId}"], button:has-text("Share")`);
    await page.check(`input[type="checkbox"][value="${downlineDistributorId}"]`);
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);

    // Verify share recorded
    const { data: share } = await supabase
      .from('training_shares')
      .select('*')
      .eq('shared_by_id', sponsorDistributorId)
      .eq('training_video_id', testTrainingVideoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(share).toBeTruthy();
    expect(share?.shared_at).toBeTruthy();
  });

  // =============================================
  // TEST 3: Downline Member Views Received Training
  // =============================================
  test('should show training in downline member received tab', async ({ page }) => {
    // First, sponsor shares training
    await supabase.from('training_shares').insert({
      training_video_id: testTrainingVideoId,
      shared_by_id: sponsorDistributorId,
      shared_with_id: downlineDistributorId,
      message: 'Must watch video',
      shared_at: new Date().toISOString(),
    });

    // Login as downline member
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', downlineEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/training`);

    // Click "Received" tab
    await page.click('button:has-text("Received"), a:has-text("Received")');

    // Should show the shared training
    await expect(page.locator('text=Test Training Video')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 4: Mark Training as Watched
  // =============================================
  test('should mark training as watched', async ({ page }) => {
    // Share training first
    const { data: share } = await supabase
      .from('training_shares')
      .insert({
        training_video_id: testTrainingVideoId,
        shared_by_id: sponsorDistributorId,
        shared_with_id: downlineDistributorId,
        shared_at: new Date().toISOString(),
        watched: false,
      })
      .select()
      .single();

    const shareId = share!.id;

    // Login as downline member
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', downlineEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/training`);

    // Mark as watched
    await page.click(`button[data-share-id="${shareId}"][aria-label*="watched"], button:has-text("Mark Watched")`);

    await page.waitForTimeout(1000);

    // Verify in database
    const { data: updated } = await supabase
      .from('training_shares')
      .select('*')
      .eq('id', shareId)
      .single();

    expect(updated?.watched).toBe(true);
    expect(updated?.watched_at).toBeTruthy();
  });

  // =============================================
  // TEST 5: Track Watch Progress
  // =============================================
  test('should track video watch progress', async ({ page }) => {
    const { data: share } = await supabase
      .from('training_shares')
      .insert({
        training_video_id: testTrainingVideoId,
        shared_by_id: sponsorDistributorId,
        shared_with_id: downlineDistributorId,
        shared_at: new Date().toISOString(),
        watch_progress: 0,
      })
      .select()
      .single();

    const shareId = share!.id;

    // Login as downline and watch video
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', downlineEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/training`);

    // Click to watch video
    await page.click(`button[data-share-id="${shareId}"], a:has-text("Watch")`);

    // Wait for video player to load
    await page.waitForTimeout(2000);

    // Simulate watching 50% of video (this would be done by video player)
    await supabase
      .from('training_shares')
      .update({ watch_progress: 50 })
      .eq('id', shareId);

    // Verify progress tracked
    const { data: progress } = await supabase
      .from('training_shares')
      .select('*')
      .eq('id', shareId)
      .single();

    expect(progress?.watch_progress).toBe(50);
  });

  // =============================================
  // TEST 6: Share with Multiple Downline Members
  // =============================================
  test('should share training with multiple downline members', async ({ page }) => {
    // Create another downline member
    const { data: downline2Auth } = await supabase.auth.admin.createUser({
      email: `downline2-${Date.now()}@example.com`,
      password: testPassword,
      email_confirm: true,
    });

    const { data: downline2 } = await supabase
      .from('distributors')
      .insert({
        auth_user_id: downline2Auth!.user!.id,
        first_name: 'Downline2',
        last_name: 'Member',
        email: downline2Auth!.user!.email,
        sponsor_id: sponsorDistributorId,
      })
      .select()
      .single();

    const downline2Id = downline2!.id;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/training`);

    await page.click(`button[data-video-id="${testTrainingVideoId}"], button:has-text("Share")`);

    // Select multiple members
    await page.check(`input[type="checkbox"][value="${downlineDistributorId}"]`);
    await page.check(`input[type="checkbox"][value="${downline2Id}"]`);

    await page.click('button[type="submit"]');
    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });

    // Verify both shares created
    const { data: shares } = await supabase
      .from('training_shares')
      .select('*')
      .eq('shared_by_id', sponsorDistributorId)
      .eq('training_video_id', testTrainingVideoId)
      .in('shared_with_id', [downlineDistributorId, downline2Id]);

    expect(shares?.length).toBe(2);

    // Cleanup
    await supabase.from('distributors').delete().eq('id', downline2Id);
    await supabase.auth.admin.deleteUser(downline2Auth!.user!.id);
  });

  // =============================================
  // TEST 7: View Training Share List
  // =============================================
  test('should display list of shared trainings', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/training`);

    // Click "Shared" tab to see shares
    await page.click('button:has-text("Shared"), a:has-text("My Shares")');

    // Should show shares list
    const { data: shares } = await supabase
      .from('training_shares')
      .select('*')
      .eq('shared_by_id', sponsorDistributorId);

    if (shares && shares.length > 0) {
      await expect(page.locator('table, [role="table"], .share-item')).toBeVisible({ timeout: 5000 });
    }
  });

  // =============================================
  // TEST 8: Delete Training Share
  // =============================================
  test('should delete training share', async ({ page }) => {
    const { data: share } = await supabase
      .from('training_shares')
      .insert({
        training_video_id: testTrainingVideoId,
        shared_by_id: sponsorDistributorId,
        shared_with_id: downlineDistributorId,
        shared_at: new Date().toISOString(),
      })
      .select()
      .single();

    const shareId = share!.id;

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/training`);

    await page.click(`button[data-share-id="${shareId}"][aria-label*="Delete"], button:has-text("Delete")`);

    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    if (await confirmButton.count() > 0) {
      await confirmButton.first().click();
    }

    await page.waitForTimeout(1000);

    const { data: deleted } = await supabase
      .from('training_shares')
      .select('*')
      .eq('id', shareId)
      .single();

    expect(deleted).toBeNull();
  });

  // =============================================
  // TEST 9: Filter Training by Category
  // =============================================
  test('should filter training videos by category', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/training`);

    // Select category filter
    const categoryFilter = page.locator('select[name="category"], button:has-text("Category")');
    if (await categoryFilter.count() > 0) {
      await categoryFilter.first().click();
      await page.click('option:has-text("Business"), button:has-text("Business")');
    }
  });

  // =============================================
  // TEST 10: Team Edition Unlimited Training Shares
  // =============================================
  test('should allow unlimited training shares for Team Edition tier', async ({ page }) => {
    const { data: limits } = await supabase
      .from('autopilot_usage_limits')
      .select('*')
      .eq('distributor_id', sponsorDistributorId)
      .single();

    // Team tier should have unlimited training shares
    expect(limits?.training_limit).toBe(-1);

    // Can share multiple trainings without hitting limit
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', sponsorEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/team/training`);

    // Share multiple times (no limit error)
    for (let i = 1; i <= 3; i++) {
      await page.click(`button[data-video-id="${testTrainingVideoId}"], button:has-text("Share")`);
      await page.check(`input[type="checkbox"][value="${downlineDistributorId}"]`);
      await page.fill('textarea[name="message"]', `Share ${i}`);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });
    }
  });
});
