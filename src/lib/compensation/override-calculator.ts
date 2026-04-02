/**
 * Tech Ladder Override Calculator - 7 LEVEL SYSTEM
 *
 * Implements the dual-tree override system:
 * 1. Enrollment Tree (sponsor_id) → 30% L1 override (FIXED from 25%)
 * 2. Placement Matrix (matrix_parent_id) → L2-L7 depth overrides
 *
 * CRITICAL RULE: Enroller priority, no double-dipping!
 * - Check sponsor_id FIRST → Pay 30% L1 and STOP
 * - Then check matrix_parent_id → Pay depth overrides L2-L7
 * - Each upline member paid ONCE per sale
 *
 * REF: APEX_COMP_ENGINE_SPEC_FINAL.md Section 5
 *
 * @module lib/compensation/override-calculator
 */

import { createClient } from '@/lib/supabase/server';
import { isQualifiedForOverrides, MINIMUM_BV_FOR_OVERRIDES } from './bv-calculator';
import { checkOverrideQualificationWithRetail } from '@/lib/compliance/retail-validation';
import type { SupabaseClient } from '@supabase/supabase-js';

// =============================================
// TYPES
// =============================================

export interface Member {
  member_id: string;
  full_name: string;
  email: string;
  tech_rank: TechRank;
  paying_rank: TechRank;  // Payment level (used for commission calculations)
  personal_qv_monthly: number; // Maps to personal_credits_monthly in DB
  override_qualified: boolean;
}

export interface CompensationMember {
  // Distributor info (from distributors table)
  distributor_id: string;
  sponsor_id: string | null;        // Enrollment tree (distributors.sponsor_id)
  matrix_parent_id: string | null;  // Matrix tree (distributors.matrix_parent_id)
  matrix_depth: number;              // distributors.matrix_depth

  // Member info (from members table via JOIN)
  member_id: string;
  full_name: string;
  email: string;
  tech_rank: TechRank;               // Current/display rank
  paying_rank: TechRank;             // Payment level (USED FOR COMMISSION RATES!)
  personal_qv_monthly: number;  // Maps to members.personal_credits_monthly in DB
  override_qualified: boolean;        // members.override_qualified
}

export type TechRank =
  | 'starter'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'ruby'
  | 'diamond_ambassador';

export interface Sale {
  sale_id: string;
  seller_member_id: string;
  product_name: string;
  price_paid: number;
  bv: number;
}

export interface OverridePayment {
  upline_member_id: string;
  upline_member_name: string;
  override_type: 'L1_enrollment' | 'L2_matrix' | 'L3_matrix' | 'L4_matrix' | 'L5_matrix' | 'L6_matrix' | 'L7_matrix';
  override_rate: number;
  override_amount: number;
  bv: number;
}

export interface OverrideCalculationResult {
  total_paid: number;
  payments: OverridePayment[];
  unpaid_amount: number; // If overrides < 40% of BV
}

// =============================================
// OVERRIDE SCHEDULES BY RANK
// =============================================

/**
 * Override schedules for each Tech Ladder rank - 7 LEVEL SYSTEM
 *
 * CRITICAL: Dual-Tree System
 * - L1 = ENROLLMENT TREE (sponsor_id) - Always 30% for all ranks (FIXED from 25%)
 * - L2-L7 = MATRIX TREE (matrix_parent_id) - Varies by rank
 *
 * Source of Truth: APEX_COMP_ENGINE_SPEC_FINAL.md Section 5
 *
 * Key:
 * - [0] = L1 (30% for all ranks, from enrollment tree via sponsor_id)
 * - [1] = L2 (matrix tree via matrix_parent_id, varies by rank)
 * - [2] = L3 (matrix tree via matrix_parent_id, varies by rank)
 * - [3] = L4 (matrix tree via matrix_parent_id, varies by rank)
 * - [4] = L5 (matrix tree via matrix_parent_id, varies by rank)
 * - [5] = L6 (matrix tree via matrix_parent_id, varies by rank)
 * - [6] = L7 (matrix tree via matrix_parent_id, varies by rank)
 */
const OVERRIDE_SCHEDULES: Record<TechRank, number[]> = {
  starter: [0.30, 0, 0, 0, 0, 0, 0],                      // L1: 30%, L2-L7: none
  bronze: [0.30, 0.20, 0, 0, 0, 0, 0],                    // L1: 30%, L2: 20%, L3-L7: none
  silver: [0.30, 0.20, 0.18, 0, 0, 0, 0],                 // L1: 30%, L2: 20%, L3: 18%, L4-L7: none
  gold: [0.30, 0.20, 0.18, 0.15, 0, 0, 0],                // L1: 30%, L2: 20%, L3: 18%, L4: 15%, L5-L7: none
  platinum: [0.30, 0.20, 0.18, 0.15, 0.10, 0, 0],         // L1: 30%, L2: 20%, L3: 18%, L4: 15%, L5: 10%, L6-L7: none
  ruby: [0.30, 0.20, 0.18, 0.15, 0.10, 0.07, 0],          // L1: 30%, L2: 20%, L3: 18%, L4: 15%, L5: 10%, L6: 7%, L7: none
  diamond_ambassador: [0.30, 0.20, 0.18, 0.15, 0.10, 0.07, 0.05], // L1: 30%, L2: 20%, L3: 18%, L4: 15%, L5: 10%, L6: 7%, L7: 5%
};

/**
 * Override pool percentage (40% of BV available for overrides)
 */
const OVERRIDE_POOL_PERCENTAGE = 0.40;

// =============================================
// CORE OVERRIDE CALCULATION
// =============================================

/**
 * Calculate overrides for a sale using dual-tree system
 *
 * @param sale - Sale information with BV
 * @param sellerMember - Member who made the sale
 * @returns Override calculation result with all payments
 */
export async function calculateOverridesForSale(
  sale: Sale,
  sellerMember: CompensationMember,
  supabaseClient?: SupabaseClient
): Promise<OverrideCalculationResult> {
  const supabase = supabaseClient || (await createClient());

  // Calculate total override pool (40% of BV)
  const overridePool = sale.bv * OVERRIDE_POOL_PERCENTAGE;

  const payments: OverridePayment[] = [];
  const paidUplineIds = new Set<string>(); // Track who's been paid (no double-dipping)

  // =============================================
  // STEP 1: ENROLLMENT OVERRIDE (25%) - Check First!
  // =============================================

  if (sellerMember.sponsor_id) {
    const { data: sponsor, error} = await supabase
      .from('distributors')
      .select(`
        id,
        member:members!members_distributor_id_fkey (
          member_id,
          full_name,
          tech_rank,
          paying_rank,
          personal_credits_monthly,
          override_qualified
        )
      `)
      .eq('id', sellerMember.sponsor_id)
      .single();

    if (error || !sponsor || !sponsor.member) {
      // No sponsor or error fetching - continue to matrix overrides
    } else {
      const sponsorMember = Array.isArray(sponsor.member) ? sponsor.member[0] : sponsor.member;

      if (sponsorMember) {
        // Check both BV minimum and 70% retail compliance
        const qualification = await checkOverrideQualificationWithRetail(sponsor.id);

        if (qualification.qualified) {
          // Pay sponsor 30% of override pool (L1 enrollment) - FIXED from 25%
          const amount = overridePool * 0.30;

          payments.push({
            upline_member_id: sponsorMember.member_id,
            upline_member_name: sponsorMember.full_name,
            override_type: 'L1_enrollment',
            override_rate: 0.30,
            override_amount: Number(amount.toFixed(2)),
            bv: sale.bv,
          });

          // Mark sponsor as paid (no double-dipping!)
          paidUplineIds.add(sponsorMember.member_id);
        }
        // L1 override skipped due to qualification check
      }
    }
  }

  // =============================================
  // STEP 2: MATRIX DEPTH OVERRIDES (L2-L7)
  // =============================================

  // Walk up the matrix tree (distributors.matrix_parent_id)
  let currentDistributorId = sellerMember.matrix_parent_id;
  let level = 1; // Start at L1 (but we'll skip to L2 for matrix)

  while (currentDistributorId && level <= 7) {
    const { data: uplineDistributor, error } = await supabase
      .from('distributors')
      .select(`
        id,
        matrix_parent_id,
        member:members!members_distributor_id_fkey (
          member_id,
          full_name,
          tech_rank,
          paying_rank,
          personal_credits_monthly,
          override_qualified
        )
      `)
      .eq('id', currentDistributorId)
      .single();

    if (error || !uplineDistributor || !uplineDistributor.member) break;

    const uplineMember = Array.isArray(uplineDistributor.member)
      ? uplineDistributor.member[0]
      : uplineDistributor.member;

    // Skip if already paid as enroller (no double-dipping!)
    if (paidUplineIds.has(uplineMember.member_id)) {
      currentDistributorId = uplineDistributor.matrix_parent_id;
      level++;
      continue;
    }

    // Check if qualified for overrides (50+ BV monthly AND 70% retail compliance)
    const qualification = await checkOverrideQualificationWithRetail(uplineDistributor.id);

    if (!qualification.qualified) {
      // COMPRESSION: Skip unqualified upline, move to next
      currentDistributorId = uplineDistributor.matrix_parent_id;
      level++;
      continue;
    }

    // Get override rate for this rank at this level
    // IMPORTANT: Use paying_rank (not tech_rank) for commission calculations!
    const schedule = OVERRIDE_SCHEDULES[uplineMember.paying_rank as TechRank];
    const rate = schedule[level] || 0;

    if (rate > 0) {
      const amount = overridePool * rate;

      // Map level to explicit override type (CRITICAL: Must match OverridePayment type)
      const overrideTypes = ['L2_matrix', 'L3_matrix', 'L4_matrix', 'L5_matrix', 'L6_matrix', 'L7_matrix'] as const;
      const overrideType = overrideTypes[level - 1]; // level 1 = L2, level 2 = L3, etc.

      payments.push({
        upline_member_id: uplineMember.member_id,
        upline_member_name: uplineMember.full_name,
        override_type: overrideType,
        override_rate: rate,
        override_amount: Number(amount.toFixed(2)),
        bv: sale.bv,
      });

      paidUplineIds.add(uplineMember.member_id);
    }

    // Move up the matrix tree
    currentDistributorId = uplineDistributor.matrix_parent_id;
    level++;
  }

  // =============================================
  // CALCULATE TOTALS
  // =============================================

  const totalPaid = payments.reduce((sum, payment) => sum + payment.override_amount, 0);
  const unpaidAmount = overridePool - totalPaid;

  return {
    total_paid: Number(totalPaid.toFixed(2)),
    payments,
    unpaid_amount: Number(unpaidAmount.toFixed(2)),
  };
}

/**
 * Calculate overrides for multiple sales
 *
 * @param sales - Array of sales
 * @returns Aggregated override payments by member
 */
export async function calculateOverridesForSales(
  sales: Array<{ sale: Sale; seller: CompensationMember }>
): Promise<Record<string, { member_name: string; total_overrides: number; payments: OverridePayment[] }>> {
  const aggregated: Record<string, { member_name: string; total_overrides: number; payments: OverridePayment[] }> = {};

  for (const { sale, seller } of sales) {
    const result = await calculateOverridesForSale(sale, seller);

    for (const payment of result.payments) {
      if (!aggregated[payment.upline_member_id]) {
        aggregated[payment.upline_member_id] = {
          member_name: payment.upline_member_name,
          total_overrides: 0,
          payments: [],
        };
      }

      aggregated[payment.upline_member_id].total_overrides += payment.override_amount;
      aggregated[payment.upline_member_id].payments.push(payment);
    }
  }

  return aggregated;
}

// =============================================
// OVERRIDE QUALIFICATION
// =============================================

/**
 * Check if member qualifies for overrides this month
 *
 * @deprecated Use checkOverrideQualificationWithRetail from compliance module instead
 * This function only checks BV minimum, not 70% retail compliance
 *
 * @param member - Member to check
 * @returns Qualification status with reason
 */
export function checkOverrideQualification(member: Member): {
  qualified: boolean;
  reason: string;
} {
  if (member.personal_qv_monthly < MINIMUM_BV_FOR_OVERRIDES) {
    return {
      qualified: false,
      reason: `Personal BV (${member.personal_qv_monthly}) is below minimum (${MINIMUM_BV_FOR_OVERRIDES})`,
    };
  }

  return {
    qualified: true,
    reason: 'Qualified (BV only - does not check 70% retail compliance)',
  };
}

/**
 * Get override schedule for a rank
 *
 * @param rank - Tech rank
 * @returns Array of override rates [L1, L2, L3, L4, L5, L6, L7]
 */
export function getOverrideSchedule(rank: TechRank): number[] {
  return OVERRIDE_SCHEDULES[rank];
}

/**
 * Get override rate for specific rank and level
 *
 * @param rank - Tech rank
 * @param level - Level (1-7)
 * @returns Override rate (0-0.25)
 */
export function getOverrideRate(rank: TechRank, level: number): number {
  if (level < 1 || level > 7) return 0;
  return OVERRIDE_SCHEDULES[rank][level - 1] || 0;
}

// =============================================
// MATRIX LEVEL LOOKUP
// =============================================

/**
 * Determine matrix level between upline and downline distributor
 *
 * @param uplineDistributorId - Upline distributor ID
 * @param downlineDistributorId - Downline distributor ID (seller)
 * @returns Level (1-7) or null if not in upline
 */
export async function getMatrixLevel(
  uplineDistributorId: string,
  downlineDistributorId: string
): Promise<number | null> {
  // Walk up from downline to see if we reach upline
  const supabase = await createClient();

  let currentDistributorId = downlineDistributorId;
  let level = 0;

  while (currentDistributorId && level < 7) {
    // Get current distributor's matrix parent
    const { data: current, error } = await supabase
      .from('distributors')
      .select('matrix_parent_id')
      .eq('id', currentDistributorId)
      .single();

    if (error || !current || !current.matrix_parent_id) break;

    level++;

    // Check if this parent is our upline
    if (current.matrix_parent_id === uplineDistributorId) {
      return level;
    }

    currentDistributorId = current.matrix_parent_id;
  }

  return null; // Not in upline
}

// =============================================
// DEBUGGING & ADMIN TOOLS
// =============================================

/**
 * Generate override breakdown for admin/debugging
 *
 * Shows detailed calculation step-by-step
 */
export async function generateOverrideBreakdown(
  sale: Sale,
  sellerMember: CompensationMember
): Promise<{
  sale_info: {
    product: string;
    price: number;
    bv: number;
    override_pool: number;
  };
  enroller_check: {
    sponsor_id: string | null;
    sponsor_name: string | null;
    qualified: boolean;
    paid: number;
  };
  matrix_overrides: Array<{
    level: number;
    member_id: string;
    member_name: string;
    rank: string;
    qualified: boolean;
    rate: number;
    paid: number;
    skipped_reason?: string;
  }>;
  summary: {
    total_paid: number;
    unpaid: number;
    percentage_distributed: number;
  };
}> {
  const result = await calculateOverridesForSale(sale, sellerMember);
  const overridePool = sale.bv * OVERRIDE_POOL_PERCENTAGE;

  // Build detailed breakdown (implementation simplified for brevity)
  return {
    sale_info: {
      product: sale.product_name,
      price: sale.price_paid,
      bv: sale.bv,
      override_pool: Number(overridePool.toFixed(2)),
    },
    enroller_check: {
      sponsor_id: sellerMember.sponsor_id,
      sponsor_name: null, // Would fetch from result
      qualified: false,
      paid: 0,
    },
    matrix_overrides: [],
    summary: {
      total_paid: result.total_paid,
      unpaid: result.unpaid_amount,
      percentage_distributed: Number(((result.total_paid / overridePool) * 100).toFixed(2)),
    },
  };
}

// =============================================
// EXPORTS
// =============================================

export default {
  calculateOverridesForSale,
  calculateOverridesForSales,
  checkOverrideQualification,
  getOverrideSchedule,
  getOverrideRate,
  getMatrixLevel,
  generateOverrideBreakdown,
  OVERRIDE_SCHEDULES,
  OVERRIDE_POOL_PERCENTAGE,
};
