// =============================================
// DUAL-LADDER COMPENSATION ENGINE - OVERRIDE RESOLUTION
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md
// Phase: 3 (Build New TypeScript Code)
// Agent: 3D
// =============================================

import {
  TechRank,
  getOverridePercentage,
  OVERRIDE_QUALIFICATION_MIN_CREDITS,
  ENROLLER_OVERRIDE_RATE,
  ProductType,
  BUSINESS_CENTER_CONFIG,
} from './config';
import { calculateWaterfall } from './waterfall';

/**
 * Member for Override Calculation
 */
export interface OverrideMember {
  memberId: string;
  techRank: TechRank;
  personalCreditsMonthly: number;
  overrideQualified: boolean; // Cached: personal_credits >= 50
}

/**
 * Sale Information
 */
export interface SaleInfo {
  orderId: string;
  sellerMemberId: string;
  priceCents: number;
  productType: ProductType;
}

/**
 * Override Calculation Result
 */
export interface OverrideResult {
  memberId: string;
  memberTechRank: TechRank;
  amountCents: number;
  level: number; // 1-5
  percentage: number; // 0.00-0.30
  rule: 'enroller' | 'positional' | 'business_center';
  qualified: boolean;
  reason?: string; // If not qualified
}

/**
 * Calculate Override Commission for a Member
 *
 * From spec:
 * CRITICAL RULE:
 * IF org_member.enroller_id == rep.member_id:
 *   → ALWAYS use L1 rate (30% of override pool)
 *   → Regardless of matrix position
 *   → Regardless of rep's rank
 * ELSE:
 *   → Use matrix level rate based on rep's current tech rank
 *   → If level not unlocked for rank → $0
 *
 * Override Qualification:
 * - Must have 50+ personal QV/month to earn overrides
 * - If below 50: seller commission still paid, overrides = $0
 *
 * @param member - Member receiving override
 * @param sale - Sale information
 * @param isEnroller - True if this member is the seller's enroller
 * @param matrixLevel - Position in matrix (1-5), only used if not enroller
 * @returns Override calculation result
 */
export function calculateOverride(
  member: OverrideMember,
  sale: SaleInfo,
  isEnroller: boolean,
  matrixLevel?: number
): OverrideResult {
  // Check override qualification (50 credit minimum)
  if (!member.overrideQualified || member.personalCreditsMonthly < OVERRIDE_QUALIFICATION_MIN_CREDITS) {
    return {
      memberId: member.memberId,
      memberTechRank: member.techRank,
      amountCents: 0,
      level: isEnroller ? 1 : (matrixLevel ?? 0),
      percentage: 0,
      rule: isEnroller ? 'enroller' : 'positional',
      qualified: false,
      reason: `Below ${OVERRIDE_QUALIFICATION_MIN_CREDITS} credit minimum (has ${member.personalCreditsMonthly} credits)`,
    };
  }

  // Business Center Exception
  if (sale.productType === 'business_center') {
    // BC uses standard override pool distribution (no special sponsor bonus)
    // Override pool is distributed via per-level overrides instead
    if (isEnroller) {
      return {
        memberId: member.memberId,
        memberTechRank: member.techRank,
        amountCents: 0, // Business Center uses per-level overrides, not sponsor bonus
        level: 1,
        percentage: 0,
        rule: 'business_center',
        qualified: true,
      };
    }

    // BC has no override pool for non-enrollers
    return {
      memberId: member.memberId,
      memberTechRank: member.techRank,
      amountCents: 0,
      level: matrixLevel ?? 0,
      percentage: 0,
      rule: 'business_center',
      qualified: true,
      reason: 'Business Center has no override pool beyond sponsor bonus',
    };
  }

  // Calculate override pool from waterfall
  const waterfall = calculateWaterfall(sale.priceCents, sale.productType);
  const overridePoolCents = waterfall.overridePoolCents;

  // ENROLLER RULE - Always L1 (30%)
  if (isEnroller) {
    const amountCents = Math.round(overridePoolCents * ENROLLER_OVERRIDE_RATE);

    return {
      memberId: member.memberId,
      memberTechRank: member.techRank,
      amountCents,
      level: 1,
      percentage: ENROLLER_OVERRIDE_RATE,
      rule: 'enroller',
      qualified: true,
    };
  }

  // POSITIONAL (Matrix) RULE - Check rank-based override schedule
  if (!matrixLevel || matrixLevel < 1 || matrixLevel > 5) {
    return {
      memberId: member.memberId,
      memberTechRank: member.techRank,
      amountCents: 0,
      level: matrixLevel ?? 0,
      percentage: 0,
      rule: 'positional',
      qualified: true,
      reason: `Matrix level ${matrixLevel} is out of range (1-5)`,
    };
  }

  // Get override percentage for this rank and level
  const percentage = getOverridePercentage(member.techRank, matrixLevel);

  if (percentage === 0) {
    return {
      memberId: member.memberId,
      memberTechRank: member.techRank,
      amountCents: 0,
      level: matrixLevel,
      percentage: 0,
      rule: 'positional',
      qualified: true,
      reason: `Rank ${member.techRank} does not unlock L${matrixLevel} (requires higher rank)`,
    };
  }

  // Calculate override amount
  const amountCents = Math.round(overridePoolCents * percentage);

  return {
    memberId: member.memberId,
    memberTechRank: member.techRank,
    amountCents,
    level: matrixLevel,
    percentage,
    rule: 'positional',
    qualified: true,
  };
}

/**
 * Calculate overrides for all upline members
 *
 * IMPORTANT: The uplineMembers array should be built by the CALLER:
 * - If member is sponsor: isEnroller = true → L1 rate (30%)
 * - If member is in matrix tree: isEnroller = false → Matrix rate by rank/level
 *
 * This function does NOT traverse trees - it receives pre-built upline array.
 * The CALLER is responsible for walking the correct tree (enrollment vs matrix).
 *
 * @param sale - Sale information
 * @param uplineMembers - Upline members ordered from L1 to L5 (built by caller)
 * @param enrollerId - Seller's sponsor member ID
 * @returns Array of override results
 */
export function calculateAllOverrides(
  sale: SaleInfo,
  uplineMembers: OverrideMember[],
  enrollerId: string
): OverrideResult[] {
  const results: OverrideResult[] = [];

  for (let i = 0; i < uplineMembers.length && i < 5; i++) {
    const member = uplineMembers[i];
    const matrixLevel = i + 1; // L1, L2, L3, L4, L5
    const isEnroller = member.memberId === enrollerId;

    const result = calculateOverride(member, sale, isEnroller, matrixLevel);
    results.push(result);
  }

  return results;
}

/**
 * Get total override payout for a sale
 *
 * @param results - Override calculation results
 * @returns Total override amount in cents
 */
export function getTotalOverrides(results: OverrideResult[]): number {
  return results.reduce((total, r) => total + r.amountCents, 0);
}

/**
 * Format override result for display/logging
 *
 * @param result - Override calculation result
 * @returns Formatted string
 */
export function formatOverrideResult(result: OverrideResult): string {
  const amount = `$${(result.amountCents / 100).toFixed(2)}`;
  const pct = (result.percentage * 100).toFixed(1);

  if (!result.qualified) {
    return `L${result.level} - ${result.memberTechRank} - $0.00 (NOT QUALIFIED: ${result.reason})`;
  }

  if (result.amountCents === 0 && result.reason) {
    return `L${result.level} - ${result.memberTechRank} - $0.00 (${result.reason})`;
  }

  const ruleLabel = result.rule === 'enroller' ? 'ENROLLER' : result.rule === 'business_center' ? 'BC SPONSOR' : `L${result.level}`;

  return `${ruleLabel} - ${result.memberTechRank} - ${amount} (${pct}% ${result.rule})`;
}

/**
 * Validate override calculations
 *
 * Ensures override total doesn't exceed override pool
 *
 * @param sale - Sale information
 * @param results - Override calculation results
 * @returns Validation result with any errors
 */
export interface OverrideValidation {
  valid: boolean;
  errors: string[];
  overridePoolCents: number;
  totalPaidCents: number;
  remainderCents: number;
}

export function validateOverrides(
  sale: SaleInfo,
  results: OverrideResult[]
): OverrideValidation {
  const errors: string[] = [];

  // Business Center - no validation needed (fixed amount)
  if (sale.productType === 'business_center') {
    const totalPaid = getTotalOverrides(results);
    return {
      valid: true,
      errors: [],
      overridePoolCents: 0,
      totalPaidCents: totalPaid,
      remainderCents: 0,
    };
  }

  // Calculate expected override pool
  const waterfall = calculateWaterfall(sale.priceCents, sale.productType);
  const overridePoolCents = waterfall.overridePoolCents;
  const totalPaidCents = getTotalOverrides(results);
  const remainderCents = overridePoolCents - totalPaidCents;

  // Check if total paid exceeds pool (should never happen)
  if (totalPaidCents > overridePoolCents) {
    errors.push(
      `Total overrides ($${(totalPaidCents / 100).toFixed(2)}) exceed override pool ($${(overridePoolCents / 100).toFixed(2)})`
    );
  }

  // Check if enroller override is present
  const hasEnrollerOverride = results.some((r) => r.rule === 'enroller' && r.amountCents > 0);
  if (!hasEnrollerOverride) {
    // Not necessarily an error (enroller might not be qualified)
    // But worth noting
  }

  return {
    valid: errors.length === 0,
    errors,
    overridePoolCents,
    totalPaidCents,
    remainderCents,
  };
}

/**
 * Check if member is override qualified
 *
 * From spec:
 * "Must generate 50+ personal QV/month to earn overrides and bonuses"
 *
 * @param personalCreditsMonthly - Personal production credits for the month
 * @returns True if qualified for overrides
 */
export function isOverrideQualified(personalCreditsMonthly: number): boolean {
  return personalCreditsMonthly >= OVERRIDE_QUALIFICATION_MIN_CREDITS;
}
