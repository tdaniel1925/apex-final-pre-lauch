/**
 * OVERRIDE QUALIFICATION CHECK
 *
 * Checks if a distributor qualifies to earn overrides and bonuses.
 *
 * CRITICAL RULE FROM SPEC:
 * - Must generate 50+ personal QV/month to earn overrides and bonuses
 * - Seller commission is ALWAYS paid (even if unqualified for overrides)
 * - If below 50 QV: overrides = $0, bonuses = $0
 *
 * @module lib/commission-engine/qualification-check
 */

import { createClient } from '@/lib/supabase/server';
import { OVERRIDE_QUALIFICATION_MIN_CREDITS } from '@/lib/compensation/config';

// =============================================
// TYPES
// =============================================

export interface QualificationResult {
  qualified: boolean;
  personal_qv: number;
  minimum_qv: number;
  reason: string;
}

// =============================================
// QUALIFICATION CHECK FUNCTIONS
// =============================================

/**
 * Check if a distributor qualifies for overrides this month
 *
 * @param distributorId - Distributor ID to check
 * @param month - Month to check in YYYY-MM format (optional, defaults to current month)
 * @returns Qualification result
 */
export async function checkMonthlyQualification(
  distributorId: string,
  month?: string
): Promise<QualificationResult> {
  const supabase = await createClient();

  // Get member record
  const { data: member, error } = await supabase
    .from('members')
    .select('personal_qv_monthly, full_name')
    .eq('distributor_id', distributorId)
    .single();

  if (error || !member) {
    return {
      qualified: false,
      personal_qv: 0,
      minimum_qv: OVERRIDE_QUALIFICATION_MIN_CREDITS,
      reason: `No member record found for distributor ${distributorId}`,
    };
  }

  const personalQV = member.personal_qv_monthly || 0;

  if (personalQV < OVERRIDE_QUALIFICATION_MIN_CREDITS) {
    return {
      qualified: false,
      personal_qv: personalQV,
      minimum_qv: OVERRIDE_QUALIFICATION_MIN_CREDITS,
      reason: `Personal QV (${personalQV}) is below minimum (${OVERRIDE_QUALIFICATION_MIN_CREDITS})`,
    };
  }

  return {
    qualified: true,
    personal_qv: personalQV,
    minimum_qv: OVERRIDE_QUALIFICATION_MIN_CREDITS,
    reason: `Qualified with ${personalQV} QV (minimum: ${OVERRIDE_QUALIFICATION_MIN_CREDITS})`,
  };
}

/**
 * Batch check qualification for multiple distributors
 *
 * @param distributorIds - Array of distributor IDs
 * @param month - Month to check in YYYY-MM format (optional)
 * @returns Map of distributor ID to qualification result
 */
export async function batchCheckQualification(
  distributorIds: string[],
  month?: string
): Promise<Map<string, QualificationResult>> {
  const results = new Map<string, QualificationResult>();

  // Use Promise.all for parallel checks
  const qualificationChecks = distributorIds.map(async (distributorId) => {
    const result = await checkMonthlyQualification(distributorId, month);
    return { distributorId, result };
  });

  const allResults = await Promise.all(qualificationChecks);

  allResults.forEach(({ distributorId, result }) => {
    results.set(distributorId, result);
  });

  return results;
}

/**
 * Get all qualified distributors for a specific month
 *
 * @param month - Month to check in YYYY-MM format (optional, defaults to current month)
 * @returns Array of qualified distributor IDs
 */
export async function getQualifiedDistributors(month?: string): Promise<string[]> {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from('members')
    .select('distributor_id, personal_qv_monthly')
    .gte('personal_qv_monthly', OVERRIDE_QUALIFICATION_MIN_CREDITS);

  if (error || !members) {
    console.error('Failed to fetch qualified distributors:', error);
    return [];
  }

  return members.map(m => m.distributor_id).filter(Boolean) as string[];
}

/**
 * Get qualification statistics for reporting
 *
 * @param month - Month to check in YYYY-MM format (optional)
 * @returns Qualification statistics
 */
export async function getQualificationStats(month?: string): Promise<{
  total_distributors: number;
  qualified_count: number;
  unqualified_count: number;
  qualification_rate: number;
  average_personal_qv: number;
}> {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from('members')
    .select('distributor_id, personal_qv_monthly');

  if (error || !members) {
    return {
      total_distributors: 0,
      qualified_count: 0,
      unqualified_count: 0,
      qualification_rate: 0,
      average_personal_qv: 0,
    };
  }

  const totalDistributors = members.length;
  const qualifiedCount = members.filter(m =>
    (m.personal_qv_monthly || 0) >= OVERRIDE_QUALIFICATION_MIN_CREDITS
  ).length;
  const unqualifiedCount = totalDistributors - qualifiedCount;
  const qualificationRate = totalDistributors > 0
    ? (qualifiedCount / totalDistributors) * 100
    : 0;
  const averagePersonalQV = totalDistributors > 0
    ? members.reduce((sum, m) => sum + (m.personal_qv_monthly || 0), 0) / totalDistributors
    : 0;

  return {
    total_distributors: totalDistributors,
    qualified_count: qualifiedCount,
    unqualified_count: unqualifiedCount,
    qualification_rate: Number(qualificationRate.toFixed(2)),
    average_personal_qv: Number(averagePersonalQV.toFixed(2)),
  };
}

// =============================================
// GRACE PERIOD CHECKS
// =============================================

/**
 * Check if distributor is in grace period for rank demotion
 *
 * From spec:
 * - 30-day grace period before payment level drops
 * - tech_rank can drop after grace period (display rank)
 * - paying_rank drops to highest qualified level (determines commission rates)
 *
 * @param distributorId - Distributor ID
 * @returns Grace period status
 */
export async function checkGracePeriod(distributorId: string): Promise<{
  in_grace_period: boolean;
  grace_days_remaining: number;
  will_demote_to?: string;
}> {
  const supabase = await createClient();

  const { data: member, error } = await supabase
    .from('members')
    .select('tech_rank, paying_rank, tech_grace_days, personal_qv_monthly, team_qv_monthly')
    .eq('distributor_id', distributorId)
    .single();

  if (error || !member) {
    return {
      in_grace_period: false,
      grace_days_remaining: 0,
    };
  }

  const graceDaysRemaining = member.tech_grace_days || 0;
  const inGracePeriod = graceDaysRemaining > 0;

  // TODO: Calculate what rank they'll demote to based on current QV
  // For now, we'll just return the grace period status

  return {
    in_grace_period: inGracePeriod,
    grace_days_remaining: graceDaysRemaining,
  };
}

// =============================================
// EXPORTS
// =============================================

export {
  OVERRIDE_QUALIFICATION_MIN_CREDITS as MINIMUM_QV_FOR_OVERRIDES,
};
