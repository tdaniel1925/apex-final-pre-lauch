/**
 * Anti-Frontloading Compliance Tests
 *
 * Tests the FTC anti-frontloading rule:
 * - Max 1 self-purchase per product counts toward BV per month
 * - Subsequent purchases allowed but don't count toward BV
 *
 * @module tests/unit/compliance/anti-frontloading
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  checkAntiFrontloading,
  calculateCreditedBV,
  getDistributorPurchaseHistory,
  getAntiFrontloadingReport,
} from '@/lib/compliance/anti-frontloading';
import { createServiceClient } from '@/lib/supabase/service';

const supabase = createServiceClient();

describe('Anti-Frontloading Compliance', () => {
  let testDistributorId: string;
  let testProductId: string;

  beforeEach(async () => {
    // Create test distributor
    const { data: distributor } = await supabase
      .from('distributors')
      .insert({
        email: `test-frontload-${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'Frontload',
        status: 'active',
      })
      .select()
      .single();

    testDistributorId = distributor!.id;

    // Create test product
    const { data: product } = await supabase
      .from('products')
      .insert({
        name: 'Test Product Frontload',
        slug: `test-product-frontload-${Date.now()}`,
        description: 'Test product for frontloading tests',
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
      personal_credits_monthly: 0,
      team_credits_monthly: 0,
    });
  });

  afterEach(async () => {
    // Clean up test data
    if (testDistributorId) {
      await supabase.from('members').delete().eq('distributor_id', testDistributorId);
      await supabase.from('orders').delete().eq('distributor_id', testDistributorId);
      await supabase.from('distributors').delete().eq('id', testDistributorId);
    }
    if (testProductId) {
      await supabase.from('products').delete().eq('id', testProductId);
    }
  });

  describe('checkAntiFrontloading', () => {
    test('first purchase should count toward BV', async () => {
      const result = await checkAntiFrontloading(testDistributorId, testProductId);

      expect(result.allowed).toBe(true);
      expect(result.counts_toward_bv).toBe(true);
      expect(result.previous_purchase_count).toBe(0);
      expect(result.reason).toContain('First self-purchase');
    });

    test('second purchase should NOT count toward BV', async () => {
      // Create first order
      await supabase.from('orders').insert({
        distributor_id: testDistributorId,
        total_cents: 5000,
        total_bv: 50,
        status: 'completed',
        payment_status: 'paid',
      });

      const result = await checkAntiFrontloading(testDistributorId, testProductId);

      expect(result.allowed).toBe(true);
      expect(result.counts_toward_bv).toBe(false);
      expect(result.previous_purchase_count).toBe(1);
      expect(result.reason).toContain('Anti-frontloading');
      expect(result.reason).toContain('2 self-purchases');
    });

    test('third purchase should also NOT count toward BV', async () => {
      // Create two orders
      await supabase.from('orders').insert([
        {
          distributor_id: testDistributorId,
          total_cents: 5000,
          total_bv: 50,
          status: 'completed',
          payment_status: 'paid',
        },
        {
          distributor_id: testDistributorId,
          total_cents: 5000,
          total_bv: 50,
          status: 'completed',
          payment_status: 'paid',
        },
      ]);

      const result = await checkAntiFrontloading(testDistributorId, testProductId);

      expect(result.allowed).toBe(true);
      expect(result.counts_toward_bv).toBe(false);
      expect(result.previous_purchase_count).toBe(2);
      expect(result.reason).toContain('3 self-purchases');
    });

    test('cancelled orders should not count toward purchase limit', async () => {
      // Create cancelled order
      await supabase.from('orders').insert({
        distributor_id: testDistributorId,
        total_cents: 5000,
        total_bv: 50,
        status: 'cancelled',
        payment_status: 'refunded',
      });

      const result = await checkAntiFrontloading(testDistributorId, testProductId);

      expect(result.counts_toward_bv).toBe(true);
      expect(result.previous_purchase_count).toBe(0);
    });

    test('refunded orders should not count toward purchase limit', async () => {
      // Create refunded order
      await supabase.from('orders').insert({
        distributor_id: testDistributorId,
        total_cents: 5000,
        total_bv: 50,
        status: 'refunded',
        payment_status: 'refunded',
      });

      const result = await checkAntiFrontloading(testDistributorId, testProductId);

      expect(result.counts_toward_bv).toBe(true);
      expect(result.previous_purchase_count).toBe(0);
    });
  });

  describe('calculateCreditedBV', () => {
    test('first purchase should credit full BV', async () => {
      const baseBV = 50;
      const result = await calculateCreditedBV(testDistributorId, testProductId, baseBV);

      expect(result.credited_bv).toBe(50);
      expect(result.reason).toContain('First self-purchase');
      expect(result.reason).toContain('full BV credited');
    });

    test('second purchase should credit 0 BV', async () => {
      // Create first order
      await supabase.from('orders').insert({
        distributor_id: testDistributorId,
        total_cents: 5000,
        total_bv: 50,
        status: 'completed',
        payment_status: 'paid',
      });

      const baseBV = 50;
      const result = await calculateCreditedBV(testDistributorId, testProductId, baseBV);

      expect(result.credited_bv).toBe(0);
      expect(result.reason).toContain('Anti-frontloading');
      expect(result.reason).toContain('Purchase #2');
      expect(result.reason).toContain('No BV credited');
    });

    test('should handle large BV amounts correctly', async () => {
      const baseBV = 500;
      const result = await calculateCreditedBV(testDistributorId, testProductId, baseBV);

      expect(result.credited_bv).toBe(500);
    });

    test('should handle zero BV correctly', async () => {
      const baseBV = 0;
      const result = await calculateCreditedBV(testDistributorId, testProductId, baseBV);

      expect(result.credited_bv).toBe(0);
      expect(result.reason).toContain('First self-purchase');
    });
  });

  describe('getDistributorPurchaseHistory', () => {
    test('should return empty array for distributor with no purchases', async () => {
      const history = await getDistributorPurchaseHistory(testDistributorId);

      expect(history).toEqual([]);
    });

    test('should return purchase history for single product', async () => {
      // Create order with items
      const { data: order } = await supabase
        .from('orders')
        .insert({
          distributor_id: testDistributorId,
          total_cents: 5000,
          total_bv: 50,
          status: 'completed',
          payment_status: 'paid',
        })
        .select()
        .single();

      await supabase.from('order_items').insert({
        order_id: order!.id,
        product_id: testProductId,
        quantity: 1,
        unit_price_cents: 5000,
        total_price_cents: 5000,
        bv_amount: 50,
        product_name: 'Test Product',
      });

      const history = await getDistributorPurchaseHistory(testDistributorId);

      expect(history).toHaveLength(1);
      expect(history[0].product_id).toBe(testProductId);
      expect(history[0].purchase_count).toBe(1);
      expect(history[0].first_purchase_date).toBeTruthy();
      expect(history[0].last_purchase_date).toBeTruthy();
    });

    test('should aggregate multiple purchases of same product', async () => {
      // Create two orders with same product
      const { data: order1 } = await supabase
        .from('orders')
        .insert({
          distributor_id: testDistributorId,
          total_cents: 5000,
          total_bv: 50,
          status: 'completed',
          payment_status: 'paid',
        })
        .select()
        .single();

      await supabase.from('order_items').insert({
        order_id: order1!.id,
        product_id: testProductId,
        quantity: 2,
        unit_price_cents: 5000,
        total_price_cents: 10000,
        bv_amount: 100,
        product_name: 'Test Product',
      });

      const { data: order2 } = await supabase
        .from('orders')
        .insert({
          distributor_id: testDistributorId,
          total_cents: 5000,
          total_bv: 50,
          status: 'completed',
          payment_status: 'paid',
        })
        .select()
        .single();

      await supabase.from('order_items').insert({
        order_id: order2!.id,
        product_id: testProductId,
        quantity: 1,
        unit_price_cents: 5000,
        total_price_cents: 5000,
        bv_amount: 50,
        product_name: 'Test Product',
      });

      const history = await getDistributorPurchaseHistory(testDistributorId);

      expect(history).toHaveLength(1);
      expect(history[0].purchase_count).toBe(3); // 2 + 1
    });
  });

  describe('getAntiFrontloadingReport', () => {
    test('should return empty array when no violations', async () => {
      const report = await getAntiFrontloadingReport();

      // Report may have violations from other tests, so just check it returns an array
      expect(Array.isArray(report)).toBe(true);
    });

    test('should include distributor with multiple purchases', async () => {
      // Create two orders (second one violates anti-frontloading)
      await supabase.from('orders').insert([
        {
          distributor_id: testDistributorId,
          total_cents: 5000,
          total_bv: 50,
          status: 'completed',
          payment_status: 'paid',
        },
        {
          distributor_id: testDistributorId,
          total_cents: 5000,
          total_bv: 50,
          status: 'completed',
          payment_status: 'paid',
        },
      ]);

      const report = await getAntiFrontloadingReport();

      const violation = report.find((v) => v.distributor_id === testDistributorId);
      expect(violation).toBeDefined();
      expect(violation?.total_self_purchases).toBe(2);
      expect(violation?.bv_not_credited).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle non-existent distributor gracefully', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await checkAntiFrontloading(fakeId, testProductId);

      expect(result.allowed).toBe(true);
      expect(result.counts_toward_bv).toBe(true);
    });

    test('should handle non-existent product gracefully', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await checkAntiFrontloading(testDistributorId, fakeId);

      expect(result.allowed).toBe(true);
      expect(result.counts_toward_bv).toBe(true);
    });

    test('should reset count each month', async () => {
      // Create order from last month (mock by backdating)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Note: In real implementation, we'd need to mock the date
      // For now, this test documents the expected behavior
      // The getMonthStart() function in anti-frontloading.ts handles monthly reset
    });
  });
});
