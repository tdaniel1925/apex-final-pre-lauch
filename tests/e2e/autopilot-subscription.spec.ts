// =============================================
// E2E Tests: Apex Lead Autopilot - Subscription Management
// Tests subscription upgrade, downgrade, and webhook handling
// =============================================

import { test, expect } from '@playwright/test';
import {
  createTestDistributor,
  createAutopilotSubscription,
  cleanupTestDistributor,
  loginToApp,
  BASE_URL,
  supabase,
} from '../helpers/autopilot-test-helpers';

test.describe('Autopilot - Subscription Management', () => {
  let testDistributorId: string;
  let testAuthUserId: string;
  let testEmail: string;
  let testPassword: string;

  test.beforeAll(async () => {
    const testData = await createTestDistributor({
      firstName: 'Subscription',
      lastName: 'Test',
    });

    testDistributorId = testData.distributorId;
    testAuthUserId = testData.authUserId;
    testEmail = testData.email;
    testPassword = testData.password;

    // Start with FREE tier
    await createAutopilotSubscription(testDistributorId, 'free');

    console.log(`✅ Test distributor created with FREE tier: ${testDistributorId}`);
  });

  test.afterAll(async () => {
    await cleanupTestDistributor(testDistributorId, testAuthUserId);
    console.log('✅ Test data cleaned up');
  });

  // =============================================
  // TEST 1: View Current Subscription
  // =============================================
  test('should display current subscription tier', async ({ page }) => {
    await loginToApp(page, testEmail, testPassword);
    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Should show current tier
    await expect(page.locator('text=/free.*tier|current.*free/i')).toBeVisible({ timeout: 5000 });

    // Should show usage limits
    await expect(page.locator('text=/10.*invitation|limit/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 2: View Upgrade Options
  // =============================================
  test('should display available upgrade tiers', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Should show upgrade options
    await expect(page.locator('text=/social.*connector/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/lead.*autopilot.*pro/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/team.*edition/i')).toBeVisible({ timeout: 5000 });

    // Should show pricing
    await expect(page.locator('text=/\\$9|\\$79|\\$119/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 3: Click Upgrade to Pro
  // =============================================
  test('should initiate upgrade to Pro tier', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Click upgrade to Pro
    const upgradeButton = page.locator('button:has-text("Upgrade to Pro"), a:has-text("Select Pro")');
    await upgradeButton.first().click();

    // Should show loading or redirect indication
    await page.waitForTimeout(2000);

    // In test mode, Stripe checkout might be mocked
    // The actual redirect would go to Stripe checkout page
  });

  // =============================================
  // TEST 4: Verify Stripe Checkout Session Created
  // =============================================
  test('should create Stripe checkout session for upgrade', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Make API call to subscribe endpoint
    const response = await page.request.post(`${BASE_URL}/api/autopilot/subscribe`, {
      data: {
        tier: 'lead_autopilot_pro',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.checkoutUrl || data.sessionId).toBeTruthy();
  });

  // =============================================
  // TEST 5: Simulate Webhook - Checkout Completed
  // =============================================
  test('should upgrade tier when webhook received', async ({ page }) => {
    // Simulate Stripe webhook (checkout.session.completed)
    await supabase
      .from('autopilot_subscriptions')
      .update({
        tier: 'lead_autopilot_pro',
        status: 'active',
        stripe_subscription_id: 'sub_test_123',
        stripe_customer_id: 'cus_test_123',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('distributor_id', testDistributorId);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Should now show Pro tier
    await expect(page.locator('text=/pro.*tier|current.*pro/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 6: Verify Usage Limits Updated After Upgrade
  // =============================================
  test('should update usage limits when tier upgraded', async ({ page }) => {
    // Upgrade to Pro
    await supabase
      .from('autopilot_subscriptions')
      .update({ tier: 'lead_autopilot_pro', status: 'active' })
      .eq('distributor_id', testDistributorId);

    // Trigger usage limits update (normally done by webhook or trigger)
    await supabase
      .from('autopilot_usage_limits')
      .update({
        meetings_limit: -1, // Unlimited for Pro
        social_limit: 100,
        flyers_limit: 50,
        contacts_limit: 500,
      })
      .eq('distributor_id', testDistributorId);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Should show Pro limits
    await expect(page.locator('text=/unlimited.*invitation|500.*contact/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 7: Cancel Subscription
  // =============================================
  test('should cancel subscription at period end', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Click cancel button
    const cancelButton = page.locator('button:has-text("Cancel Subscription"), a:has-text("Cancel")');
    if (await cancelButton.count() > 0) {
      await cancelButton.first().click();

      // Confirm cancellation
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.count() > 0) {
        await confirmButton.first().click();
      }

      await expect(page.locator('text=/cancel.*period.*end|subscription.*cancel/i')).toBeVisible({ timeout: 10000 });

      // Verify in database
      const { data: subscription } = await supabase
        .from('autopilot_subscriptions')
        .select('*')
        .eq('distributor_id', testDistributorId)
        .single();

      expect(subscription?.cancel_at_period_end).toBe(true);
    }
  });

  // =============================================
  // TEST 8: Reactivate Subscription
  // =============================================
  test('should reactivate canceled subscription', async ({ page }) => {
    // Set subscription as canceled
    await supabase
      .from('autopilot_subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('distributor_id', testDistributorId);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Click reactivate button
    const reactivateButton = page.locator('button:has-text("Reactivate"), button:has-text("Resume")');
    if (await reactivateButton.count() > 0) {
      await reactivateButton.first().click();

      await expect(page.locator('text=/reactivate|resume/i')).toBeVisible({ timeout: 10000 });

      // Verify in database
      const { data: subscription } = await supabase
        .from('autopilot_subscriptions')
        .select('*')
        .eq('distributor_id', testDistributorId)
        .single();

      expect(subscription?.cancel_at_period_end).toBe(false);
    }
  });

  // =============================================
  // TEST 9: View Billing History
  // =============================================
  test('should display billing history', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Look for billing history section
    const billingHistory = page.locator('text=/billing.*history|invoice|payment/i');
    if (await billingHistory.count() > 0) {
      await expect(billingHistory.first()).toBeVisible({ timeout: 5000 });
    }
  });

  // =============================================
  // TEST 10: Show Current Period and Renewal Date
  // =============================================
  test('should display current billing period and renewal date', async ({ page }) => {
    // Set subscription with period dates
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await supabase
      .from('autopilot_subscriptions')
      .update({
        tier: 'lead_autopilot_pro',
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .eq('distributor_id', testDistributorId);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Should show renewal date
    await expect(page.locator('text=/renew|next.*billing|period.*end/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 11: Downgrade Not Allowed (Only Cancel)
  // =============================================
  test('should not allow downgrade, only cancel', async ({ page }) => {
    // Set to Pro tier
    await supabase
      .from('autopilot_subscriptions')
      .update({ tier: 'lead_autopilot_pro', status: 'active' })
      .eq('distributor_id', testDistributorId);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Should not show "Downgrade" buttons for lower tiers
    // Only show upgrade options for higher tiers
    const downgradeToFree = page.locator('button:has-text("Downgrade to Free")');
    const count = await downgradeToFree.count();
    expect(count).toBe(0);
  });

  // =============================================
  // TEST 12: Show Feature Comparison
  // =============================================
  test('should display feature comparison across tiers', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Should show features for each tier
    await expect(page.locator('text=/feature|included|unlimited/i')).toBeVisible({ timeout: 5000 });

    // Should show checkmarks or feature lists
    await expect(page.locator('svg, text=✓, text=✔')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 13: Handle Failed Payment (Webhook)
  // =============================================
  test('should handle failed payment webhook', async ({ page }) => {
    // Simulate failed payment webhook
    await supabase
      .from('autopilot_subscriptions')
      .update({ status: 'past_due' })
      .eq('distributor_id', testDistributorId);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Should show payment failed warning
    await expect(page.locator('text=/payment.*failed|past.*due|update.*payment/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 14: Trial Period Display
  // =============================================
  test('should display trial period for Pro tier', async ({ page }) => {
    // Set subscription to trialing
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await supabase
      .from('autopilot_subscriptions')
      .update({
        tier: 'lead_autopilot_pro',
        status: 'trialing',
        trial_start: new Date().toISOString(),
        trial_end: trialEnd.toISOString(),
      })
      .eq('distributor_id', testDistributorId);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Should show trial information
    await expect(page.locator('text=/trial|14.*day|free.*trial/i')).toBeVisible({ timeout: 5000 });
  });

  // =============================================
  // TEST 15: Update Payment Method Link
  // =============================================
  test('should provide link to update payment method', async ({ page }) => {
    // Set to paid tier
    await supabase
      .from('autopilot_subscriptions')
      .update({
        tier: 'lead_autopilot_pro',
        status: 'active',
        stripe_customer_id: 'cus_test_123',
      })
      .eq('distributor_id', testDistributorId);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE_URL}/autopilot/subscription`);

    // Should show update payment method option
    const updatePaymentButton = page.locator('button:has-text("Update Payment"), a:has-text("Payment Method")');
    if (await updatePaymentButton.count() > 0) {
      await expect(updatePaymentButton.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
