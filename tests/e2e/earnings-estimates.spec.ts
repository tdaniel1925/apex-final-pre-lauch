/**
 * Playwright E2E Test: Real-Time Earnings Estimates
 *
 * Tests the complete purchase flow from UI:
 * 1. Login as distributor
 * 2. Navigate to store
 * 3. Click "Buy" on Business Center
 * 4. Complete Stripe checkout with test card
 * 5. Verify estimated earnings appear
 * 6. Check qualification status
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Stripe test card numbers
const STRIPE_TEST_CARDS = {
  VISA_SUCCESS: '4242424242424242',
  VISA_DECLINE: '4000000000000002',
  VISA_3DS: '4000002500003155',
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

test.describe('Real-Time Earnings Estimates E2E', () => {
  let testEmail: string;
  let testPassword: string;
  let distributorId: string;
  let memberId: string;

  test.beforeEach(async () => {
    // Create unique test user for each test
    testEmail = `test-earnings-${Date.now()}@example.com`;
    testPassword = 'TestPassword123!';

    // Create test distributor via Supabase
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .insert({
        email: testEmail,
        first_name: 'Test',
        last_name: 'Earnings',
        rank: 'silver', // Silver gets L1-L3 overrides
        status: 'active',
      })
      .select()
      .single();

    if (distError) throw new Error(`Failed to create distributor: ${distError.message}`);
    distributorId = distributor.id;

    // Create auth user
    const { error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        distributor_id: distributorId,
        first_name: 'Test',
        last_name: 'Earnings',
      },
    });

    if (authError) throw new Error(`Failed to create auth user: ${authError.message}`);

    // Create member record with initial PV above minimum
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        distributor_id: distributorId,
        full_name: 'Test Earnings',
        personal_credits_monthly: 100, // Above 50 PV minimum
        team_credits_monthly: 300,
      })
      .select()
      .single();

    if (memberError) throw new Error(`Failed to create member: ${memberError.message}`);
    memberId = member.member_id;
  });

  test.afterEach(async () => {
    // Cleanup test data
    if (memberId) {
      await supabase.from('estimated_earnings').delete().match({ member_id: memberId });
      await supabase.from('transactions').delete().match({ seller_distributor_id: memberId });
      await supabase.from('members').delete().eq('member_id', memberId);
    }
    if (distributorId) {
      await supabase.from('distributors').delete().eq('id', distributorId);
      // Delete auth user
      const { data: authUser } = await supabase.auth.admin.listUsers();
      const user = authUser.users.find((u) => u.email === testEmail);
      if (user) {
        await supabase.auth.admin.deleteUser(user.id);
      }
    }
  });

  test('should create estimated earnings after successful purchase', async ({ page }) => {
    // STEP 1: Login
    await page.goto('http://localhost:3050/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**');
    await expect(page.locator('text=Test Earnings')).toBeVisible();

    // STEP 2: Navigate to store
    await page.goto('http://localhost:3050/dashboard/store');
    await page.waitForLoadState('networkidle');

    // STEP 3: Find Business Center and click Buy
    const businessCenterCard = page.locator('text=Business Center').locator('..');
    await expect(businessCenterCard).toBeVisible();

    const buyButton = businessCenterCard.locator('button:has-text("Buy")');
    await buyButton.click();

    // STEP 4: Wait for Stripe Checkout to load
    await page.waitForURL('**/checkout.stripe.com/**', { timeout: 10000 });

    // Fill in Stripe test card details
    const emailField = page.frameLocator('iframe').locator('input[name="email"]');
    await emailField.fill(testEmail);

    const cardNumberField = page.frameLocator('iframe').locator('input[name="cardnumber"]');
    await cardNumberField.fill(STRIPE_TEST_CARDS.VISA_SUCCESS);

    const expiryField = page.frameLocator('iframe').locator('input[name="exp-date"]');
    await expiryField.fill('12/30'); // December 2030

    const cvcField = page.frameLocator('iframe').locator('input[name="cvc"]');
    await cvcField.fill('123');

    const zipField = page.frameLocator('iframe').locator('input[name="zip"]');
    await zipField.fill('12345');

    // Submit payment
    const submitButton = page.frameLocator('iframe').locator('button:has-text("Pay")');
    await submitButton.click();

    // STEP 5: Wait for redirect back to app
    await page.waitForURL('**/dashboard**', { timeout: 30000 });

    // Wait a moment for webhook to process
    await page.waitForTimeout(3000);

    // STEP 6: Verify estimated earnings were created in database
    const { data: estimates, error: estimatesError } = await supabase
      .from('estimated_earnings')
      .select('*')
      .eq('member_id', memberId)
      .order('earning_type');

    expect(estimatesError).toBeNull();
    expect(estimates).toBeTruthy();
    expect(estimates!.length).toBeGreaterThan(0);

    // Should have at least seller commission
    const sellerCommission = estimates!.find((e) => e.earning_type === 'seller_commission');
    expect(sellerCommission).toBeTruthy();
    expect(sellerCommission!.estimated_amount_cents).toBeGreaterThan(0);
    expect(sellerCommission!.current_qualification_status).toBe('pending');

    console.log(`✅ Created ${estimates!.length} estimated earnings`);
    estimates!.forEach((est) => {
      console.log(`   - ${est.earning_type}: $${est.estimated_amount_cents / 100}`);
    });

    // STEP 7: Navigate to earnings page (if exists)
    // This would show the estimated earnings in the UI
    // For now, we verify in the database

    // STEP 8: Run daily qualification check
    const response = await fetch('http://localhost:3050/api/cron/update-estimates');
    expect(response.ok).toBeTruthy();

    const result = await response.json();
    expect(result.success).toBe(true);
    console.log('✅ Daily qualification update ran successfully');

    // STEP 9: Verify estimates were updated with qualification status
    const { data: updatedEstimates } = await supabase
      .from('estimated_earnings')
      .select('*')
      .eq('member_id', memberId)
      .order('earning_type');

    updatedEstimates!.forEach((est) => {
      expect(est.last_checked_at).toBeTruthy();
      expect(['qualified', 'at_risk', 'disqualified', 'pending']).toContain(
        est.current_qualification_status
      );
      console.log(`   ${est.earning_type}: ${est.current_qualification_status}`);
    });

    console.log('🎉 E2E Test Passed!');
  });

  test('should show seller commission qualified but overrides disqualified when retail % < 70%', async ({
    page,
  }) => {
    // Add multiple personal purchases (non-retail) to drop retail % below 70%
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('slug', 'business-center')
      .single();

    if (!product) throw new Error('Business Center product not found');

    const retailPrice = product.wholesale_price_cents;
    const bvAmount = Math.round(retailPrice * 0.65); // Approximate BV

    // Create 10 personal purchases (0% retail)
    for (let i = 0; i < 10; i++) {
      await supabase.from('transactions').insert({
        distributor_id: distributorId,
        seller_distributor_id: memberId,
        transaction_type: 'product_sale',
        amount_cents: retailPrice,
        bv_amount: bvAmount,
        product_slug: product.slug,
        description: `Personal purchase ${i + 1}`,
        is_retail: false, // All personal
      });
    }

    // Login
    await page.goto('http://localhost:3050/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    // Make one more purchase through UI
    await page.goto('http://localhost:3050/dashboard/store');
    const businessCenterCard = page.locator('text=Business Center').locator('..');
    const buyButton = businessCenterCard.locator('button:has-text("Buy")');
    await buyButton.click();

    await page.waitForURL('**/checkout.stripe.com/**', { timeout: 10000 });

    // Fill Stripe form and submit
    const iframe = page.frameLocator('iframe');
    await iframe.locator('input[name="email"]').fill(testEmail);
    await iframe.locator('input[name="cardnumber"]').fill(STRIPE_TEST_CARDS.VISA_SUCCESS);
    await iframe.locator('input[name="exp-date"]').fill('12/30');
    await iframe.locator('input[name="cvc"]').fill('123');
    await iframe.locator('input[name="zip"]').fill('12345');
    await iframe.locator('button:has-text("Pay")').click();

    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Run daily qualification
    const response = await fetch('http://localhost:3050/api/cron/update-estimates');
    expect(response.ok).toBeTruthy();

    // Check estimates
    const { data: estimates } = await supabase
      .from('estimated_earnings')
      .select('*')
      .eq('member_id', memberId)
      .order('earning_type');

    // Seller commission should be qualified (not affected by retail %)
    const sellerCommission = estimates!.find((e) => e.earning_type === 'seller_commission');
    expect(sellerCommission).toBeTruthy();
    expect(['qualified', 'at_risk']).toContain(sellerCommission!.current_qualification_status);

    // Overrides should be disqualified (affected by retail %)
    const overrides = estimates!.filter((e) => e.earning_type.startsWith('override_'));
    overrides.forEach((override) => {
      expect(override.current_qualification_status).toBe('disqualified');
      expect(override.disqualification_reasons).toContain(
        expect.stringContaining('Below 70% retail requirement')
      );
    });

    console.log('✅ 70% retail rule enforced correctly!');
    console.log('   Seller commission: qualified ✅');
    console.log('   Overrides: disqualified ❌ (retail % < 70%)');
  });

  test('should mark estimates as at_risk when close to disqualification', async ({ page }) => {
    // Update member to have PV just above minimum (at risk)
    await supabase
      .from('members')
      .update({ personal_credits_monthly: 54 }) // Just above 50 minimum, within at-risk threshold
      .eq('member_id', memberId);

    // Login and make purchase
    await page.goto('http://localhost:3050/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto('http://localhost:3050/dashboard/store');
    const buyButton = page.locator('text=Business Center').locator('..').locator('button:has-text("Buy")');
    await buyButton.click();

    await page.waitForURL('**/checkout.stripe.com/**', { timeout: 10000 });

    const iframe = page.frameLocator('iframe');
    await iframe.locator('input[name="email"]').fill(testEmail);
    await iframe.locator('input[name="cardnumber"]').fill(STRIPE_TEST_CARDS.VISA_SUCCESS);
    await iframe.locator('input[name="exp-date"]').fill('12/30');
    await iframe.locator('input[name="cvc"]').fill('123');
    await iframe.locator('input[name="zip"]').fill('12345');
    await iframe.locator('button:has-text("Pay")').click();

    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Run daily qualification
    await fetch('http://localhost:3050/api/cron/update-estimates');

    // Check for at_risk status
    const { data: estimates } = await supabase
      .from('estimated_earnings')
      .select('*')
      .eq('member_id', memberId);

    const atRiskEstimates = estimates!.filter((e) => e.current_qualification_status === 'at_risk');
    expect(atRiskEstimates.length).toBeGreaterThan(0);

    console.log(`✅ Found ${atRiskEstimates.length} estimates marked as at_risk`);
    console.log('   Warning user about potential disqualification!');
  });
});
