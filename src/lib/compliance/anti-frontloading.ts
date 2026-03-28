/**
 * Anti-Frontloading Compliance
 *
 * FTC compliance rule: Max 1 self-subscription per product counts toward BV credits.
 *
 * This prevents distributors from "loading up" on inventory purchases to artificially
 * inflate their BV and qualify for ranks/overrides.
 *
 * Rule: Only the FIRST purchase of each product by a distributor counts toward their
 * personal BV credits. Subsequent purchases of the same product do NOT count.
 *
 * @module lib/compliance/anti-frontloading
 */

import { createClient } from '@supabase/supabase-js';

// =============================================
// TYPES
// =============================================

export interface FrontloadingCheckResult {
  allowed: boolean;
  reason: string;
  previous_purchase_count: number;
  counts_toward_bv: boolean;
}

export interface ProductPurchaseHistory {
  product_id: string;
  product_name: string;
  purchase_count: number;
  first_purchase_date: string | null;
  last_purchase_date: string | null;
}

// =============================================
// CONSTANTS
// =============================================

/**
 * Maximum self-purchases of same product that count toward BV
 */
const MAX_SELF_PURCHASES_FOR_BV = 1;

// =============================================
// CORE FUNCTIONS
// =============================================

/**
 * Check if a self-purchase should count toward BV credits
 *
 * FTC Rule: Only the first self-purchase of each product counts toward BV.
 * Subsequent purchases of the same product are allowed but don't count toward
 * personal BV credits (anti-frontloading).
 *
 * @param distributorId - Distributor making the purchase
 * @param productId - Product being purchased
 * @returns Check result with allowed flag and reason
 *
 * @example
 * ```typescript
 * const check = await checkAntiFrontloading(repId, productId);
 * if (!check.counts_toward_bv) {
 *   // Don't credit BV for this purchase
 *   console.log(check.reason);
 * }
 * ```
 */
export async function checkAntiFrontloading(
  distributorId: string,
  productId: string
): Promise<FrontloadingCheckResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Count previous purchases of this product by this distributor
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('rep_id', distributorId)
    .in('status', ['completed', 'processing']) // Don't count cancelled/refunded
    .gte('created_at', getMonthStart()); // Current month only

  if (error) {
    console.error('Error checking purchase history:', error);
    return {
      allowed: true, // Allow purchase on error (don't block sales)
      reason: 'Error checking history - allowing purchase',
      previous_purchase_count: 0,
      counts_toward_bv: true, // Err on side of allowing BV
    };
  }

  const purchaseCount = count || 0;

  // FTC Rule: Only first purchase counts toward BV
  const countsTowardBV = purchaseCount < MAX_SELF_PURCHASES_FOR_BV;

  return {
    allowed: true, // Always allow the purchase
    reason: countsTowardBV
      ? 'First self-purchase - counts toward BV'
      : `Anti-frontloading: ${purchaseCount + 1} self-purchases this month. Only first purchase counts toward BV.`,
    previous_purchase_count: purchaseCount,
    counts_toward_bv: countsTowardBV,
  };
}

/**
 * Get purchase history for a distributor (all products)
 *
 * @param distributorId - Distributor ID
 * @returns Array of purchase history per product
 */
export async function getDistributorPurchaseHistory(
  distributorId: string
): Promise<ProductPurchaseHistory[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Get all completed orders with items
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      order_items (
        product_id,
        quantity,
        products (
          id,
          name
        )
      )
    `)
    .eq('rep_id', distributorId)
    .in('status', ['completed', 'processing'])
    .gte('created_at', getMonthStart())
    .order('created_at', { ascending: true });

  if (error || !orders) {
    console.error('Error fetching purchase history:', error);
    return [];
  }

  // Aggregate by product
  const productMap = new Map<string, ProductPurchaseHistory>();

  for (const order of orders) {
    if (!order.order_items) continue;

    for (const item of order.order_items as any[]) {
      const productId = item.product_id;
      const productName = item.products?.name || 'Unknown Product';

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product_id: productId,
          product_name: productName,
          purchase_count: 0,
          first_purchase_date: null,
          last_purchase_date: null,
        });
      }

      const history = productMap.get(productId)!;
      history.purchase_count += item.quantity;
      history.last_purchase_date = order.created_at;

      if (!history.first_purchase_date) {
        history.first_purchase_date = order.created_at;
      }
    }
  }

  return Array.from(productMap.values());
}

/**
 * Calculate how much BV should be credited for a purchase
 *
 * Applies anti-frontloading rule: Only first self-purchase counts.
 *
 * @param distributorId - Distributor making purchase
 * @param productId - Product ID
 * @param baseBV - Base BV for the product
 * @returns Actual BV to credit (may be 0 if frontloading)
 */
export async function calculateCreditedBV(
  distributorId: string,
  productId: string,
  baseBV: number
): Promise<{ credited_bv: number; reason: string }> {
  const check = await checkAntiFrontloading(distributorId, productId);

  if (check.counts_toward_bv) {
    return {
      credited_bv: baseBV,
      reason: 'First self-purchase - full BV credited',
    };
  }

  return {
    credited_bv: 0,
    reason: `Anti-frontloading: Purchase #${check.previous_purchase_count + 1} this month. No BV credited (max 1 self-purchase per month).`,
  };
}

/**
 * Get report of all distributors who hit anti-frontloading limits
 *
 * @returns Array of distributors with multiple self-purchases
 */
export async function getAntiFrontloadingReport(): Promise<Array<{
  distributor_id: string;
  distributor_name: string;
  total_self_purchases: number;
  bv_not_credited: number;
}>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Get all self-purchases this month
  const { data: selfPurchases, error } = await supabase
    .from('orders')
    .select(`
      rep_id,
      total_bv,
      distributors!orders_rep_id_fkey (
        first_name,
        last_name
      )
    `)
    .not('rep_id', 'is', null)
    .in('status', ['completed', 'processing'])
    .gte('created_at', getMonthStart());

  if (error || !selfPurchases) {
    console.error('Error fetching self-purchases:', error);
    return [];
  }

  // Group by distributor
  const repMap = new Map<string, {
    name: string;
    purchases: number;
    total_bv: number;
  }>();

  for (const order of selfPurchases) {
    const repId = order.rep_id!;
    const dist = order.distributors as any;
    const name = dist ? `${dist.first_name} ${dist.last_name}` : 'Unknown';

    if (!repMap.has(repId)) {
      repMap.set(repId, { name, purchases: 0, total_bv: 0 });
    }

    const rep = repMap.get(repId)!;
    rep.purchases++;
    rep.total_bv += order.total_bv || 0;
  }

  // Filter to only those with multiple purchases
  const violations = [];
  for (const [repId, data] of repMap.entries()) {
    if (data.purchases > MAX_SELF_PURCHASES_FOR_BV) {
      violations.push({
        distributor_id: repId,
        distributor_name: data.name,
        total_self_purchases: data.purchases,
        bv_not_credited: data.total_bv * (data.purchases - 1) / data.purchases, // Estimated
      });
    }
  }

  return violations;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Get start of current month (for monthly purchase counting)
 */
function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// =============================================
// EXPORTS
// =============================================

export default {
  checkAntiFrontloading,
  getDistributorPurchaseHistory,
  calculateCreditedBV,
  getAntiFrontloadingReport,
  MAX_SELF_PURCHASES_FOR_BV,
};
