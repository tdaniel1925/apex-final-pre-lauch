// =============================================
// E2E Tests: Apex Lead Autopilot - Social Posting
// Tests Social Connector tier social media features
// =============================================

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';
const TEST_EMAIL_PREFIX = 'social-test-';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateTestEmail() {
  return `${TEST_EMAIL_PREFIX}${Date.now()}@example.com`;
}

function generateTestSSN() {
  const area = Math.floor(Math.random() * 699) + 100;
  const group = Math.floor(Math.random() * 99) + 1;
  const serial = Math.floor(Math.random() * 9999) + 1;
  return `${area.toString().padStart(3, '0')}-${group.toString().padStart(2, '0')}-${serial.toString().padStart(4, '0')}`;
}

test.describe('Autopilot - Social Posting (Social Connector Tier)', () => {
  let testDistributorId: string;
  let testAuthUserId: string;
  let testEmail: string;
  let testPassword = 'TestPass123!';

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
        first_name: 'Social',
        last_name: 'Test',
        email: testEmail,
        phone: '5551234567',
        affiliate_code: 'TEST' + Date.now().toString().substring(8),
        slug: `social-test-${Date.now()}`,
      })
      .select()
      .single();

    if (distError || !distributor) {
      throw new Error(`Failed to create test distributor: ${distError?.message}`);
    }

    testDistributorId = distributor.id;

    // Create Social Connector tier subscription
    const { error: subError } = await supabase
      .from('autopilot_subscriptions')
      .insert({
        distributor_id: testDistributorId,
        tier: 'social_connector',
        status: 'active',
      });

    if (subError) {
      throw new Error(`Failed to create autopilot subscription: ${subError.message}`);
    }

    console.log(`✅ Test distributor created with Social Connector tier: ${testDistributorId}`);
  });

  test.afterAll(async () => {
    if (testDistributorId) {
      await supabase.from('social_posts').delete().eq('distributor_id', testDistributorId);
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
  // TEST 1: Create Social Post for Multiple Platforms
  // =============================================
  test('should create social post for multiple platforms', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to social posting
    await page.goto(`${BASE_URL}/autopilot/social`);

    // Wait for page to load
    await expect(page.locator('h1')).toContainText(/social/i, { timeout: 5000 });

    // Fill post content
    const postContent = 'Excited to share our amazing business opportunity! Join us today! #BusinessGrowth #Success';
    await page.fill('textarea[name="content"]', postContent);

    // Select multiple platforms
    await page.check('input[type="checkbox"][value="facebook"]');
    await page.check('input[type="checkbox"][value="twitter"]');
    await page.check('input[type="checkbox"][value="linkedin"]');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator('text=/created|success/i')).toBeVisible({ timeout: 10000 });

    // Verify in database
    const { data: posts } = await supabase
      .from('social_posts')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .eq('content', postContent);

    expect(posts).toBeTruthy();
    expect(posts?.length).toBeGreaterThan(0);
    expect(posts?.[0].platforms).toContain('facebook');
  });

  // =============================================
  // TEST 2: Character Limit Enforcement
  // =============================================
  test('should enforce character limits per platform', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to social posting
    await page.goto(`${BASE_URL}/autopilot/social`);

    // Create very long content (over Twitter's limit)
    const longContent = 'A'.repeat(300);
    await page.fill('textarea[name="content"]', longContent);

    // Select Twitter (280 char limit)
    await page.check('input[type="checkbox"][value="twitter"]');

    // Should show character count warning
    await expect(page.locator('text=/280|character.*limit|too long/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 3: Schedule Post for Future Date
  // =============================================
  test('should schedule post for future date', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to social posting
    await page.goto(`${BASE_URL}/autopilot/social`);

    // Fill content
    await page.fill('textarea[name="content"]', 'This post will be scheduled for later!');
    await page.check('input[type="checkbox"][value="facebook"]');

    // Schedule for tomorrow
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const scheduleTime = tomorrow.toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', scheduleTime);

    // Submit
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/scheduled|success/i')).toBeVisible({ timeout: 10000 });

    // Verify in database
    const { data: posts } = await supabase
      .from('social_posts')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .eq('status', 'scheduled');

    expect(posts).toBeTruthy();
    expect(posts?.length).toBeGreaterThan(0);
    expect(posts?.[0].scheduled_at).toBeTruthy();
  });

  // =============================================
  // TEST 4: Save as Draft
  // =============================================
  test('should save post as draft', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to social posting
    await page.goto(`${BASE_URL}/autopilot/social`);

    // Fill content
    const draftContent = 'This is a draft post for later editing';
    await page.fill('textarea[name="content"]', draftContent);
    await page.check('input[type="checkbox"][value="linkedin"]');

    // Click save as draft
    await page.click('button:has-text("Save as Draft"), button:has-text("Draft")');

    // Wait for success
    await expect(page.locator('text=/saved.*draft|draft.*saved/i')).toBeVisible({ timeout: 10000 });

    // Verify in database
    const { data: drafts } = await supabase
      .from('social_posts')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .eq('status', 'draft')
      .eq('content', draftContent);

    expect(drafts).toBeTruthy();
    expect(drafts?.length).toBeGreaterThan(0);
  });

  // =============================================
  // TEST 5: Post Immediately
  // =============================================
  test('should post immediately to selected platforms', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to social posting
    await page.goto(`${BASE_URL}/autopilot/social`);

    // Fill content
    const immediateContent = 'Posting this right now! #Immediate';
    await page.fill('textarea[name="content"]', immediateContent);
    await page.check('input[type="checkbox"][value="facebook"]');

    // Click post now
    await page.click('button:has-text("Post Now"), button[type="submit"]');

    // Wait for success
    await expect(page.locator('text=/posted|success|published/i')).toBeVisible({ timeout: 10000 });

    // Verify in database
    const { data: posts } = await supabase
      .from('social_posts')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .eq('content', immediateContent);

    expect(posts).toBeTruthy();
    expect(posts?.length).toBeGreaterThan(0);
    expect(posts?.[0].status).toMatch(/published|posted/i);
  });

  // =============================================
  // TEST 6: Usage Counter Incremented
  // =============================================
  test('should increment usage counter after posting', async ({ page }) => {
    // Get usage before
    const { data: usageBefore } = await supabase
      .from('autopilot_usage_limits')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .single();

    const socialUsedBefore = usageBefore?.social_used || 0;

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Create post
    await page.goto(`${BASE_URL}/autopilot/social`);
    await page.fill('textarea[name="content"]', `Usage test post ${Date.now()}`);
    await page.check('input[type="checkbox"][value="twitter"]');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });

    // Get usage after
    const { data: usageAfter } = await supabase
      .from('autopilot_usage_limits')
      .select('*')
      .eq('distributor_id', testDistributorId)
      .single();

    const socialUsedAfter = usageAfter?.social_used || 0;

    // Verify incremented
    expect(socialUsedAfter).toBe(socialUsedBefore + 1);
  });

  // =============================================
  // TEST 7: Social Connector Tier Limit (30/month)
  // =============================================
  test('should enforce Social Connector tier limit of 30 posts/month', async ({ page }) => {
    // Set usage to 29 (one away from limit)
    await supabase
      .from('autopilot_usage_limits')
      .update({ social_used: 29 })
      .eq('distributor_id', testDistributorId);

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Create 30th post (should succeed)
    await page.goto(`${BASE_URL}/autopilot/social`);
    await page.fill('textarea[name="content"]', 'Post #30');
    await page.check('input[type="checkbox"][value="facebook"]');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 10000 });

    // Try 31st post (should fail)
    await page.fill('textarea[name="content"]', 'Post #31');
    await page.check('input[type="checkbox"][value="facebook"]');
    await page.click('button[type="submit"]');

    // Should show limit error
    await expect(page.locator('text=/limit|upgrade|quota/i')).toBeVisible({ timeout: 10000 });
  });

  // =============================================
  // TEST 8: View Post List
  // =============================================
  test('should display list of posts with filters', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to social posts
    await page.goto(`${BASE_URL}/autopilot/social`);

    // Should show posts list or table
    await expect(page.locator('table, [role="table"], .post-item')).toBeVisible({ timeout: 5000 });

    // Verify posts from this distributor
    const { data: posts } = await supabase
      .from('social_posts')
      .select('*')
      .eq('distributor_id', testDistributorId);

    if (posts && posts.length > 0) {
      // Check if post content visible
      await expect(page.locator(`text=${posts[0].content.substring(0, 20)}`)).toBeVisible();
    }
  });

  // =============================================
  // TEST 9: Edit Draft Post
  // =============================================
  test('should edit draft post', async ({ page }) => {
    // Create draft
    const { data: draft } = await supabase
      .from('social_posts')
      .insert({
        distributor_id: testDistributorId,
        content: 'Original draft content',
        platforms: ['facebook'],
        status: 'draft',
      })
      .select()
      .single();

    const postId = draft!.id;

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to posts
    await page.goto(`${BASE_URL}/autopilot/social`);

    // Click edit on draft
    await page.click(`button[data-post-id="${postId}"][aria-label*="Edit"], button:has-text("Edit")`);

    // Update content
    const updatedContent = 'Updated draft content';
    await page.fill('textarea[name="content"]', updatedContent);
    await page.click('button:has-text("Save")');

    // Verify updated in database
    const { data: updated } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', postId)
      .single();

    expect(updated?.content).toBe(updatedContent);
  });

  // =============================================
  // TEST 10: Delete Post
  // =============================================
  test('should delete post', async ({ page }) => {
    // Create post to delete
    const { data: post } = await supabase
      .from('social_posts')
      .insert({
        distributor_id: testDistributorId,
        content: 'Post to delete',
        platforms: ['twitter'],
        status: 'draft',
      })
      .select()
      .single();

    const postId = post!.id;

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to posts
    await page.goto(`${BASE_URL}/autopilot/social`);

    // Delete post
    await page.click(`button[data-post-id="${postId}"][aria-label*="Delete"], button:has-text("Delete")`);

    // Confirm if modal appears
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    if (await confirmButton.count() > 0) {
      await confirmButton.first().click();
    }

    await page.waitForTimeout(1000);

    // Verify deleted
    const { data: deleted } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', postId)
      .single();

    expect(deleted).toBeNull();
  });
});
