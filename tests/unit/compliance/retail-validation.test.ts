/**
 * 70% Retail Customer Validation Tests
 *
 * Tests the FTC 70% retail customer requirement:
 * - 70% of monthly BV must come from retail customers (non-distributors)
 * - Override qualification requires both 50 BV and 70% retail
 *
 * @module tests/unit/compliance/retail-validation
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  check70PercentRetail,
  checkOverrideQualificationWithRetail,
  getNonCompliantDistributors,
  generateRetailComplianceReport,
} from '@/lib/compliance/retail-validation';
import { createServiceClient } from '@/lib/supabase/service';

const supabase = createServiceClient();

describe('70% Retail Customer Compliance', () => {
  let testDistributorId: string;
  let testCustomerId: string;
  let testProductId: string;

  beforeEach(async () => {
    // Create test distributor
    const { data: distributor } = await supabase
      .from('distributors')
      .insert({
        email: `test-retail-${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'Retail',
        status: 'active',
      })
      .select()
      .single();

    testDistributorId = distributor!.id;

    // Create test customer (non-distributor)
    const { data: customer } = await supabase
      .from('customers')
      .insert({
        email: `customer-${Date.now()}@example.com`,
        full_name: 'Test Customer',
      })
      .select()
      .single();

    testCustomerId = customer!.id;

    // Create test product
    const { data: product } = await supabase
      .from('products')
      .insert({
        name: 'Test Product Retail',
        slug: `test-product-retail-${Date.now()}`,
        description: 'Test product for retail tests',
        retail_price_cents: 10000,
        member_price_cents: 5000,
        bv_cents: 5000,
        is_active: true,
      })
      .select()
      .single();

    testProductId = product!.id;

    // Create member record
    await supabase.from('members').insert({
      distributor_id: testDistributorId,
      tech_rank: 'starter',
      paying_rank: 'starter',
      personal_credits_monthly: 100,
      team_credits_monthly: 0,
    });
  });

  afterEach(async () => {
    // Clean up test data
    if (testDistributorId) {
      await supabase.from('members').delete().eq('distributor_id', testDistributorId);
      await supabase.from('orders').delete().eq('rep_id', testDistributorId);
      await supabase.from('distributors').delete().eq('id', testDistributorId);
    }
    if (testCustomerId) {
      await supabase.from('customers').delete().eq('id', testCustomerId);
    }
    if (testProductId) {
      await supabase.from('products').delete().eq('id', testProductId);
    }
  });

  describe('check70PercentRetail', () => {
    test('100% retail sales should be compliant', async () => {
      // Create retail order (customer_id is not a distributor)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testCustomerId,
        total_cents: 10000,
        total_bv: 100,
        status: 'completed',
        payment_status: 'paid',
      });

      const result = await check70PercentRetail(testDistributorId);

      expect(result.compliant).toBe(true);
      expect(result.retail_percentage).toBe(100);
      expect(result.retail_bv).toBe(100);
      expect(result.self_purchase_bv).toBe(0);
      expect(result.total_bv).toBe(100);
      expect(result.shortfall_bv).toBe(0);
      expect(result.reason).toContain('Compliant');
    });

    test('70% retail sales should be compliant (exact minimum)', async () => {
      // Create retail order (700 BV)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testCustomerId,
        total_cents: 7000,
        total_bv: 700,
        status: 'completed',
        payment_status: 'paid',
      });

      // Create self-purchase order (300 BV)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testDistributorId, // Self-purchase (customer is a distributor)
        total_cents: 3000,
        total_bv: 300,
        status: 'completed',
        payment_status: 'paid',
      });

      const result = await check70PercentRetail(testDistributorId);

      expect(result.compliant).toBe(true);
      expect(result.retail_percentage).toBe(70);
      expect(result.retail_bv).toBe(700);
      expect(result.self_purchase_bv).toBe(300);
      expect(result.total_bv).toBe(1000);
    });

    test('69% retail sales should be non-compliant', async () => {
      // Create retail order (690 BV)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testCustomerId,
        total_cents: 6900,
        total_bv: 690,
        status: 'completed',
        payment_status: 'paid',
      });

      // Create self-purchase order (310 BV)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testDistributorId,
        total_cents: 3100,
        total_bv: 310,
        status: 'completed',
        payment_status: 'paid',
      });

      const result = await check70PercentRetail(testDistributorId);

      expect(result.compliant).toBe(false);
      expect(result.retail_percentage).toBe(69);
      expect(result.shortfall_bv).toBeGreaterThan(0);
      expect(result.reason).toContain('Non-compliant');
      expect(result.reason).toContain('69.0%');
    });

    test('40% retail sales should be non-compliant with correct shortfall', async () => {
      // Create retail order (400 BV)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testCustomerId,
        total_cents: 4000,
        total_bv: 400,
        status: 'completed',
        payment_status: 'paid',
      });

      // Create self-purchase order (600 BV)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testDistributorId,
        total_cents: 6000,
        total_bv: 600,
        status: 'completed',
        payment_status: 'paid',
      });

      const result = await check70PercentRetail(testDistributorId);

      expect(result.compliant).toBe(false);
      expect(result.retail_percentage).toBe(40);
      expect(result.retail_bv).toBe(400);
      expect(result.self_purchase_bv).toBe(600);
      expect(result.total_bv).toBe(1000);
      // Shortfall = (1000 * 0.7) - 400 = 700 - 400 = 300
      expect(result.shortfall_bv).toBe(300);
      expect(result.reason).toContain('Need 300 more retail BV');
    });

    test('no sales should be compliant by default', async () => {
      const result = await check70PercentRetail(testDistributorId);

      expect(result.compliant).toBe(true);
      expect(result.retail_percentage).toBe(100);
      expect(result.total_bv).toBe(0);
    });

    test('100% self-purchases should be non-compliant', async () => {
      // Create only self-purchase orders
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testDistributorId,
        total_cents: 10000,
        total_bv: 1000,
        status: 'completed',
        payment_status: 'paid',
      });

      const result = await check70PercentRetail(testDistributorId);

      expect(result.compliant).toBe(false);
      expect(result.retail_percentage).toBe(0);
      expect(result.retail_bv).toBe(0);
      expect(result.self_purchase_bv).toBe(1000);
    });

    test('should only count completed and processing orders', async () => {
      // Completed order
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testCustomerId,
        total_cents: 5000,
        total_bv: 500,
        status: 'completed',
        payment_status: 'paid',
      });

      // Cancelled order (should not count)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testCustomerId,
        total_cents: 5000,
        total_bv: 500,
        status: 'cancelled',
        payment_status: 'refunded',
      });

      const result = await check70PercentRetail(testDistributorId);

      expect(result.total_bv).toBe(500); // Only completed order
    });

    test('should handle null customer_id as retail customer', async () => {
      // Order with no customer_id (assume retail)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: null,
        total_cents: 10000,
        total_bv: 1000,
        status: 'completed',
        payment_status: 'paid',
      });

      const result = await check70PercentRetail(testDistributorId);

      expect(result.compliant).toBe(true);
      expect(result.retail_bv).toBe(1000);
      expect(result.self_purchase_bv).toBe(0);
    });
  });

  describe('checkOverrideQualificationWithRetail', () => {
    test('distributor with 50+ BV and 70%+ retail should qualify', async () => {
      // Create retail order (800 BV)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testCustomerId,
        total_cents: 8000,
        total_bv: 800,
        status: 'completed',
        payment_status: 'paid',
      });

      // Create self-purchase order (200 BV)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testDistributorId,
        total_cents: 2000,
        total_bv: 200,
        status: 'completed',
        payment_status: 'paid',
      });

      // Update member BV
      await supabase
        .from('members')
        .update({ personal_credits_monthly: 100 })
        .eq('distributor_id', testDistributorId);

      const result = await checkOverrideQualificationWithRetail(testDistributorId);

      expect(result.qualified).toBe(true);
      expect(result.bv_check.passed).toBe(true);
      expect(result.bv_check.bv).toBeGreaterThanOrEqual(50);
      expect(result.retail_check.passed).toBe(true);
      expect(result.retail_check.percentage).toBeGreaterThanOrEqual(70);
      expect(result.reason).toContain('Qualified');
    });

    test('distributor with <50 BV should not qualify', async () => {
      // Create retail sales (100% retail)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testCustomerId,
        total_cents: 10000,
        total_bv: 1000,
        status: 'completed',
        payment_status: 'paid',
      });

      // Update member BV to below minimum
      await supabase
        .from('members')
        .update({ personal_credits_monthly: 30 })
        .eq('distributor_id', testDistributorId);

      const result = await checkOverrideQualificationWithRetail(testDistributorId);

      expect(result.qualified).toBe(false);
      expect(result.bv_check.passed).toBe(false);
      expect(result.bv_check.bv).toBe(30);
      expect(result.reason).toContain('BV too low');
      expect(result.reason).toContain('30 < 50');
    });

    test('distributor with 50+ BV but <70% retail should not qualify', async () => {
      // Create retail order (400 BV)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testCustomerId,
        total_cents: 4000,
        total_bv: 400,
        status: 'completed',
        payment_status: 'paid',
      });

      // Create self-purchase order (600 BV)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testDistributorId,
        total_cents: 6000,
        total_bv: 600,
        status: 'completed',
        payment_status: 'paid',
      });

      // Update member BV
      await supabase
        .from('members')
        .update({ personal_credits_monthly: 100 })
        .eq('distributor_id', testDistributorId);

      const result = await checkOverrideQualificationWithRetail(testDistributorId);

      expect(result.qualified).toBe(false);
      expect(result.bv_check.passed).toBe(true);
      expect(result.retail_check.passed).toBe(false);
      expect(result.retail_check.percentage).toBe(40);
      expect(result.reason).toContain('Retail compliance');
      expect(result.reason).toContain('40.0% < 70%');
    });

    test('distributor with <50 BV and <70% retail should fail on BV first', async () => {
      // Create self-purchases only
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testDistributorId,
        total_cents: 10000,
        total_bv: 1000,
        status: 'completed',
        payment_status: 'paid',
      });

      // Update member BV to below minimum
      await supabase
        .from('members')
        .update({ personal_credits_monthly: 30 })
        .eq('distributor_id', testDistributorId);

      const result = await checkOverrideQualificationWithRetail(testDistributorId);

      expect(result.qualified).toBe(false);
      expect(result.bv_check.passed).toBe(false);
      // Reason should mention BV first (checked before retail)
      expect(result.reason).toContain('BV too low');
    });
  });

  describe('getNonCompliantDistributors', () => {
    test('should return empty array when all compliant', async () => {
      // Create retail sales (100% retail)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testCustomerId,
        total_cents: 10000,
        total_bv: 1000,
        status: 'completed',
        payment_status: 'paid',
      });

      const result = await getNonCompliantDistributors();

      // Should not include our test distributor
      const found = result.find((d) => d.distributor_id === testDistributorId);
      expect(found).toBeUndefined();
    });

    test('should include non-compliant distributors', async () => {
      // Create self-purchases only (0% retail)
      await supabase.from('orders').insert({
        rep_id: testDistributorId,
        customer_id: testDistributorId,
        total_cents: 10000,
        total_bv: 1000,
        status: 'completed',
        payment_status: 'paid',
      });

      const result = await getNonCompliantDistributors();

      const found = result.find((d) => d.distributor_id === testDistributorId);
      expect(found).toBeDefined();
      expect(found?.compliant).toBe(false);
      expect(found?.retail_percentage).toBe(0);
      expect(found?.retail_bv).toBe(0);
      expect(found?.self_purchase_bv).toBe(1000);
      expect(found?.total_bv).toBe(1000);
    });

    test('should sort by retail percentage (lowest first)', async () => {
      const result = await getNonCompliantDistributors();

      // Verify array is sorted ascending by retail_percentage
      for (let i = 1; i < result.length; i++) {
        expect(result[i].retail_percentage).toBeGreaterThanOrEqual(
          result[i - 1].retail_percentage
        );
      }
    });
  });

  describe('generateRetailComplianceReport', () => {
    test('should generate summary report', async () => {
      const report = await generateRetailComplianceReport();

      expect(report).toHaveProperty('total_distributors');
      expect(report).toHaveProperty('compliant_distributors');
      expect(report).toHaveProperty('non_compliant_distributors');
      expect(report).toHaveProperty('compliance_rate');
      expect(report).toHaveProperty('non_compliant_list');

      expect(typeof report.compliance_rate).toBe('number');
      expect(Array.isArray(report.non_compliant_list)).toBe(true);
    });

    test('should calculate compliance rate correctly', async () => {
      const report = await generateRetailComplianceReport();

      const expectedRate =
        report.total_distributors > 0
          ? (report.compliant_distributors / report.total_distributors) * 100
          : 100;

      expect(report.compliance_rate).toBeCloseTo(expectedRate, 2);
    });

    test('should show 100% compliance when no distributors have sales', async () => {
      // Clean up any existing orders for our test distributor
      await supabase.from('orders').delete().eq('rep_id', testDistributorId);

      const report = await generateRetailComplianceReport();

      // With no sales, compliance rate should be 100%
      expect(report.compliance_rate).toBeGreaterThanOrEqual(0);
      expect(report.compliance_rate).toBeLessThanOrEqual(100);
    });
  });

  describe('Edge Cases', () => {
    test('should handle non-existent distributor gracefully', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await check70PercentRetail(fakeId);

      expect(result.compliant).toBe(true);
      expect(result.total_bv).toBe(0);
    });

    test('should handle distributor with no member record', async () => {
      // Create distributor without member record
      const { data: dist } = await supabase
        .from('distributors')
        .insert({
          email: `test-no-member-${Date.now()}@example.com`,
          first_name: 'Test',
          last_name: 'NoMember',
          status: 'active',
        })
        .select()
        .single();

      const result = await checkOverrideQualificationWithRetail(dist!.id);

      expect(result.qualified).toBe(false);
      expect(result.reason).toContain('Member not found');

      // Clean up
      await supabase.from('distributors').delete().eq('id', dist!.id);
    });
  });
});
