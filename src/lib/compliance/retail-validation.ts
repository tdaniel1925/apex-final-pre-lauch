/**
 * 70% Retail Customer Validation
 *
 * FTC compliance rule: 70% of a distributor's BV credits must come from
 * retail customers (non-distributors).
 *
 * This ensures the comp plan is driven by actual retail sales, not just
 * recruitment and distributor self-purchases.
 *
 * Rule: At least 70% of monthly personal BV must come from orders where
 * the customer is NOT a distributor.
 *
 * @module lib/compliance/retail-validation
 */

import { createClient } from '@supabase/supabase-js';

// =============================================
// TYPES
// =============================================

export interface RetailComplianceResult {
  compliant: boolean;
  retail_percentage: number;
  retail_bv: number;
  self_purchase_bv: number;
  total_bv: number;
  required_retail_percentage: number;
  shortfall_bv: number; // How much more retail BV needed
  reason: string;
}

export interface DistributorSalesBreakdown {
  distributor_id: string;
  distributor_name: string;
  retail_orders: number;
  retail_bv: number;
  self_purchase_orders: number;
  self_purchase_bv: number;
  total_bv: number;
  retail_percentage: number;
  compliant: boolean;
}

// =============================================
// CONSTANTS
// =============================================

/**
 * Minimum percentage of BV that must come from retail customers
 */
const REQUIRED_RETAIL_PERCENTAGE = 0.70; // 70%

// =============================================
// CORE FUNCTIONS
// =============================================

/**
 * Check if a distributor meets 70% retail customer requirement
 *
 * FTC Rule: At least 70% of personal BV must come from retail customers.
 *
 * @param distributorId - Distributor to check
 * @param monthStart - Start of month to check (defaults to current month)
 * @returns Compliance result with breakdown
 *
 * @example
 * ```typescript
 * const result = await check70PercentRetail(repId);
 * if (!result.compliant) {
 *   console.log(`Need ${result.shortfall_bv} more retail BV`);
 * }
 * ```
 */
export async function check70PercentRetail(
  distributorId: string,
  monthStart?: string
): Promise<RetailComplianceResult> {
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

  const startDate = monthStart || getMonthStart();

  // Get all completed orders for this distributor this month
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      rep_id,
      customer_id,
      total_bv,
      status,
      created_at
    `)
    .eq('rep_id', distributorId)
    .in('status', ['completed', 'processing'])
    .gte('created_at', startDate);

  if (error || !orders) {
    console.error('Error fetching orders:', error);
    return {
      compliant: true, // Assume compliant on error (don't block)
      retail_percentage: 100,
      retail_bv: 0,
      self_purchase_bv: 0,
      total_bv: 0,
      required_retail_percentage: REQUIRED_RETAIL_PERCENTAGE,
      shortfall_bv: 0,
      reason: 'Error fetching data - assuming compliant',
    };
  }

  // Separate retail vs self-purchases
  let retailBV = 0;
  let selfPurchaseBV = 0;

  for (const order of orders) {
    const bv = order.total_bv || 0;

    // Check if customer is a distributor
    if (order.customer_id) {
      const { data: customer, error: custError } = await supabase
        .from('distributors')
        .select('id')
        .eq('id', order.customer_id)
        .single();

      if (customer && !custError) {
        // Customer is a distributor = self-purchase
        selfPurchaseBV += bv;
      } else {
        // Customer is NOT a distributor = retail sale
        retailBV += bv;
      }
    } else {
      // No customer_id = assume retail customer
      retailBV += bv;
    }
  }

  const totalBV = retailBV + selfPurchaseBV;
  const retailPercentage = totalBV > 0 ? (retailBV / totalBV) : 1.0;
  const compliant = retailPercentage >= REQUIRED_RETAIL_PERCENTAGE;

  // Calculate shortfall
  const requiredRetailBV = totalBV * REQUIRED_RETAIL_PERCENTAGE;
  const shortfall = compliant ? 0 : (requiredRetailBV - retailBV);

  return {
    compliant,
    retail_percentage: Number((retailPercentage * 100).toFixed(2)),
    retail_bv: retailBV,
    self_purchase_bv: selfPurchaseBV,
    total_bv: totalBV,
    required_retail_percentage: REQUIRED_RETAIL_PERCENTAGE * 100,
    shortfall_bv: Number(shortfall.toFixed(2)),
    reason: compliant
      ? `Compliant: ${(retailPercentage * 100).toFixed(1)}% retail (≥70% required)`
      : `Non-compliant: ${(retailPercentage * 100).toFixed(1)}% retail (<70% required). Need ${shortfall.toFixed(0)} more retail BV.`,
  };
}

/**
 * Get all distributors who fail 70% retail requirement
 *
 * @param monthStart - Start of month to check (defaults to current month)
 * @returns Array of non-compliant distributors
 */
export async function getNonCompliantDistributors(
  monthStart?: string
): Promise<DistributorSalesBreakdown[]> {
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

  const startDate = monthStart || getMonthStart();

  // Get all distributors with sales this month
  const { data: distributors, error } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      status
    `)
    .eq('status', 'active');

  if (error || !distributors) {
    console.error('Error fetching distributors:', error);
    return [];
  }

  const nonCompliant: DistributorSalesBreakdown[] = [];

  // Check each distributor
  for (const dist of distributors) {
    const result = await check70PercentRetail(dist.id, startDate);

    // Only include if they have sales AND are non-compliant
    if (result.total_bv > 0 && !result.compliant) {
      nonCompliant.push({
        distributor_id: dist.id,
        distributor_name: `${dist.first_name} ${dist.last_name}`,
        retail_orders: 0, // Could enhance to count orders
        retail_bv: result.retail_bv,
        self_purchase_orders: 0, // Could enhance to count orders
        self_purchase_bv: result.self_purchase_bv,
        total_bv: result.total_bv,
        retail_percentage: result.retail_percentage,
        compliant: false,
      });
    }
  }

  return nonCompliant.sort((a, b) => a.retail_percentage - b.retail_percentage);
}

/**
 * Check if distributor qualifies for overrides based on retail compliance
 *
 * Combines 50 BV minimum with 70% retail requirement.
 *
 * @param distributorId - Distributor to check
 * @returns Qualification status with reason
 */
export async function checkOverrideQualificationWithRetail(
  distributorId: string
): Promise<{
  qualified: boolean;
  reason: string;
  bv_check: { passed: boolean; bv: number };
  retail_check: { passed: boolean; percentage: number };
}> {
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

  // Check BV minimum (50 BV)
  const { data: member, error } = await supabase
    .from('members')
    .select('personal_credits_monthly, override_qualified')
    .eq('distributor_id', distributorId)
    .single();

  if (error || !member) {
    return {
      qualified: false,
      reason: 'Member not found',
      bv_check: { passed: false, bv: 0 },
      retail_check: { passed: false, percentage: 0 },
    };
  }

  const personalBV = member.personal_credits_monthly || 0;
  const bvCheckPassed = personalBV >= 50;

  // Check 70% retail
  const retailCheck = await check70PercentRetail(distributorId);

  const qualified = bvCheckPassed && retailCheck.compliant;

  let reason = '';
  if (!bvCheckPassed) {
    reason = `BV too low: ${personalBV} < 50 required`;
  } else if (!retailCheck.compliant) {
    reason = `Retail compliance: ${retailCheck.retail_percentage.toFixed(1)}% < 70% required`;
  } else {
    reason = 'Qualified: BV ≥50 and retail ≥70%';
  }

  return {
    qualified,
    reason,
    bv_check: { passed: bvCheckPassed, bv: personalBV },
    retail_check: { passed: retailCheck.compliant, percentage: retailCheck.retail_percentage },
  };
}

/**
 * Generate compliance report for admin
 *
 * @returns Summary of retail compliance across all distributors
 */
export async function generateRetailComplianceReport(): Promise<{
  total_distributors: number;
  compliant_distributors: number;
  non_compliant_distributors: number;
  compliance_rate: number;
  non_compliant_list: DistributorSalesBreakdown[];
}> {
  const nonCompliant = await getNonCompliantDistributors();

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

  // Get total active distributors with sales this month
  const { count: totalWithSales } = await supabase
    .from('orders')
    .select('rep_id', { count: 'exact', head: true })
    .not('rep_id', 'is', null)
    .in('status', ['completed', 'processing'])
    .gte('created_at', getMonthStart());

  const total = totalWithSales || 0;
  const nonCompliantCount = nonCompliant.length;
  const compliantCount = total - nonCompliantCount;
  const complianceRate = total > 0 ? (compliantCount / total) * 100 : 100;

  return {
    total_distributors: total,
    compliant_distributors: compliantCount,
    non_compliant_distributors: nonCompliantCount,
    compliance_rate: Number(complianceRate.toFixed(2)),
    non_compliant_list: nonCompliant,
  };
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Get start of current month
 */
function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// =============================================
// EXPORTS
// =============================================

export default {
  check70PercentRetail,
  getNonCompliantDistributors,
  checkOverrideQualificationWithRetail,
  generateRetailComplianceReport,
  REQUIRED_RETAIL_PERCENTAGE,
};
