/**
 * Daily Qualification Updates for Estimated Earnings
 *
 * Runs every day at 2am to update the qualification status of all
 * pending estimated earnings based on current PV, GV, rank, and retail %.
 *
 * Flow:
 * 1. Get all members with pending estimates for current month
 * 2. For each member, check current qualification metrics
 * 3. Update qualification_status and disqualification_reasons
 * 4. Send notifications if status changed
 *
 * Qualification Checks:
 * - PV Check: Has at least 50 PV this month
 * - Retail Check: Has at least 70% retail volume
 * - Rank Check: Maintains required rank for override levels
 */

import { createServiceClient } from '@/lib/supabase/service';
import type {
  QualificationCheckResult,
  DailyQualificationSummary,
  QualificationStatus,
  QualificationChecks,
} from './types/estimated-earnings';
import { OVERRIDE_QUALIFICATION_MIN_CREDITS, RANKED_OVERRIDE_SCHEDULES } from './config';

const MINIMUM_PV_FOR_OVERRIDE = OVERRIDE_QUALIFICATION_MIN_CREDITS;

/**
 * Minimum retail percentage required to earn overrides (70%)
 * Seller commission is ALWAYS earned, but overrides are disqualified below 70%
 */
const MINIMUM_RETAIL_PCT = 70;

/**
 * At-risk thresholds (show warning if close to failing)
 */
const AT_RISK_PV_THRESHOLD = 55; // Warn if PV drops below 55 (min is 50)
const AT_RISK_RETAIL_THRESHOLD = 72; // Warn if retail drops below 72% (min is 70%)

/**
 * Run daily qualification update for all pending estimates
 *
 * Called by cron job at 2am every day.
 * Updates qualification status based on current metrics.
 */
export async function updateDailyQualifications(): Promise<DailyQualificationSummary> {
  const supabase = createServiceClient();
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const checkedAt = new Date().toISOString();

  console.log(`📊 Starting daily qualification update for ${currentMonth}...`);

  try {
    // Get all estimates for current month that haven't been validated yet
    const { data: estimates, error: estimatesError } = await supabase
      .from('estimated_earnings')
      .select('*')
      .eq('run_month', currentMonth)
      .is('validated_at', null)
      .order('member_id');

    if (estimatesError) {
      throw new Error(`Failed to fetch estimates: ${estimatesError.message}`);
    }

    if (!estimates || estimates.length === 0) {
      console.log('No pending estimates to check');
      return {
        total_checked: 0,
        total_qualified: 0,
        total_at_risk: 0,
        total_disqualified: 0,
        total_pending: 0,
        status_changes: 0,
        checked_at: checkedAt,
      };
    }

    console.log(`Found ${estimates.length} estimates to check`);

    // Group estimates by member to minimize database queries
    const memberIds = [...new Set(estimates.map((e) => e.member_id))];
    console.log(`Checking qualification for ${memberIds.length} members...`);

    const checkResults: QualificationCheckResult[] = [];
    let statusChanges = 0;

    // Check each member's current qualification
    for (const memberId of memberIds) {
      const memberEstimates = estimates.filter((e) => e.member_id === memberId);

      // Get member's current metrics
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('member_id', memberId)
        .single();

      if (memberError || !member) {
        console.error(`Failed to fetch member ${memberId}:`, memberError);
        continue;
      }

      const currentPV = member.personal_credits_monthly || 0;
      const currentGV = member.team_credits_monthly || 0;
      const currentRank = member.paying_rank || 'starter';

      // Calculate current retail percentage
      const currentRetailPct = await calculateCurrentRetailPercentage(memberId, currentMonth, supabase);

      // Check each estimate for this member
      for (const estimate of memberEstimates) {
        const checkResult = checkQualification(
          estimate,
          currentPV,
          currentGV,
          currentRank,
          currentRetailPct
        );

        // Update estimate in database if status changed
        if (checkResult.changed) {
          await supabase
            .from('estimated_earnings')
            .update({
              current_qualification_status: checkResult.new_status,
              qualification_checks: checkResult.checks,
              disqualification_reasons: checkResult.reasons,
              last_checked_at: checkedAt,
            })
            .eq('id', estimate.id);

          statusChanges++;
          console.log(
            `  ${member.full_name}: ${checkResult.previous_status} → ${checkResult.new_status}`
          );
        } else {
          // Just update last_checked_at
          await supabase
            .from('estimated_earnings')
            .update({ last_checked_at: checkedAt })
            .eq('id', estimate.id);
        }

        checkResults.push(checkResult);
      }
    }

    // Count final statuses
    const summary: DailyQualificationSummary = {
      total_checked: checkResults.length,
      total_qualified: checkResults.filter((r) => r.new_status === 'qualified').length,
      total_at_risk: checkResults.filter((r) => r.new_status === 'at_risk').length,
      total_disqualified: checkResults.filter((r) => r.new_status === 'disqualified').length,
      total_pending: checkResults.filter((r) => r.new_status === 'pending').length,
      status_changes: statusChanges,
      checked_at: checkedAt,
    };

    console.log('✅ Daily qualification update complete:');
    console.log(`   Checked: ${summary.total_checked}`);
    console.log(`   Qualified: ${summary.total_qualified}`);
    console.log(`   At Risk: ${summary.total_at_risk}`);
    console.log(`   Disqualified: ${summary.total_disqualified}`);
    console.log(`   Status Changes: ${summary.status_changes}`);

    return summary;
  } catch (error) {
    console.error('❌ Error in daily qualification update:', error);
    throw error;
  }
}

/**
 * Check qualification for a single estimate
 */
function checkQualification(
  estimate: any,
  currentPV: number,
  currentGV: number,
  currentRank: string,
  currentRetailPct: number
): QualificationCheckResult {
  const previousStatus = estimate.current_qualification_status as QualificationStatus;
  const checks: QualificationChecks = {
    pv_check: true,
    retail_check: true,
    rank_check: true,
  };
  const reasons: string[] = [];

  // For seller commission, only PV check matters (retail % doesn't affect seller commission)
  if (estimate.earning_type === 'seller_commission') {
    checks.pv_check = currentPV >= MINIMUM_PV_FOR_OVERRIDE;

    if (!checks.pv_check) {
      reasons.push(`Below ${MINIMUM_PV_FOR_OVERRIDE} PV minimum (current: ${currentPV} PV)`);
    }

    const newStatus = determineStatus(checks, currentPV, currentRetailPct, true);

    return {
      member_id: estimate.member_id,
      estimate_id: estimate.id,
      previous_status: previousStatus,
      new_status: newStatus,
      checks,
      reasons,
      changed: newStatus !== previousStatus,
    };
  }

  // For overrides, check PV, retail %, and rank
  checks.pv_check = currentPV >= MINIMUM_PV_FOR_OVERRIDE;
  checks.retail_check = currentRetailPct >= MINIMUM_RETAIL_PCT;

  // Rank check: does current rank still qualify for this override level?
  const overrideSchedule =
    RANKED_OVERRIDE_SCHEDULES[currentRank as keyof typeof RANKED_OVERRIDE_SCHEDULES];

  if (overrideSchedule && estimate.override_level) {
    // Array is 0-indexed, so level 1 = index 0
    const overridePct = overrideSchedule[estimate.override_level - 1] || 0;
    checks.rank_check = overridePct > 0;

    if (!checks.rank_check) {
      reasons.push(
        `Rank ${currentRank} does not qualify for L${estimate.override_level} override`
      );
    }
  } else {
    checks.rank_check = false;
    reasons.push('Invalid rank or override level');
  }

  // Add specific reasons for failures
  if (!checks.pv_check) {
    reasons.push(`Below ${MINIMUM_PV_FOR_OVERRIDE} PV minimum (current: ${currentPV} PV)`);
  }

  if (!checks.retail_check) {
    reasons.push(
      `Below 70% retail requirement (current: ${currentRetailPct.toFixed(1)}% retail)`
    );
  }

  const newStatus = determineStatus(checks, currentPV, currentRetailPct, false);

  return {
    member_id: estimate.member_id,
    estimate_id: estimate.id,
    previous_status: previousStatus,
    new_status: newStatus,
    checks,
    reasons,
    changed: newStatus !== previousStatus,
  };
}

/**
 * Determine qualification status based on checks and thresholds
 */
function determineStatus(
  checks: QualificationChecks,
  currentPV: number,
  currentRetailPct: number,
  isSellerCommission: boolean
): QualificationStatus {
  // All checks must pass to be qualified
  const allPassing = checks.pv_check && checks.retail_check && checks.rank_check;

  if (allPassing) {
    // Check if close to failing (at risk)
    const pvAtRisk = currentPV < AT_RISK_PV_THRESHOLD;
    const retailAtRisk = !isSellerCommission && currentRetailPct < AT_RISK_RETAIL_THRESHOLD;

    if (pvAtRisk || retailAtRisk) {
      return 'at_risk';
    }

    return 'qualified';
  }

  // If any check fails, disqualified
  return 'disqualified';
}

/**
 * Calculate current retail percentage for a member
 *
 * Same logic as in estimate-earnings.ts
 */
async function calculateCurrentRetailPercentage(
  memberId: string,
  month: string,
  supabase: any
): Promise<number> {
  try {
    const startDate = `${month}-01`;
    const endDate = new Date(month + '-01');
    endDate.setMonth(endDate.getMonth() + 1);
    const endDateStr = endDate.toISOString().slice(0, 10);

    // Get member's distributor_id
    const { data: member } = await supabase
      .from('members')
      .select('distributor_id')
      .eq('member_id', memberId)
      .single();

    if (!member) return 0;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('product_slug, metadata')
      .eq('distributor_id', member.distributor_id)
      .gte('created_at', startDate)
      .lt('created_at', endDateStr);

    if (error || !transactions || transactions.length === 0) {
      return 0;
    }

    // Calculate BV for each transaction
    let totalBV = 0;
    let retailBV = 0;

    // Import config constants
    const { WATERFALL_CONFIG } = await import('./config');

    for (const tx of transactions) {
      let bv = 0;

      // Calculate BV from product
      if (tx.product_slug) {
        const { data: product } = await supabase
          .from('products')
          .select('wholesale_price_cents')
          .eq('slug', tx.product_slug)
          .single();

        if (product) {
          const retailPrice = product.wholesale_price_cents;
          const botmakersFee = Math.round(retailPrice * WATERFALL_CONFIG.BOTMAKERS_FEE_PCT);
          const afterBotmakers = retailPrice - botmakersFee;
          const apexTake = Math.round(afterBotmakers * WATERFALL_CONFIG.APEX_TAKE_PCT);
          const afterApex = afterBotmakers - apexTake;
          const leadershipPool = Math.round(afterApex * WATERFALL_CONFIG.LEADERSHIP_POOL_PCT);
          const afterLeadership = afterApex - leadershipPool;
          const bonusPool = Math.round(afterLeadership * WATERFALL_CONFIG.BONUS_POOL_PCT);
          bv = afterLeadership - bonusPool;
        }
      }

      totalBV += bv;

      // Check if retail transaction (stored in metadata)
      const isRetail = tx.metadata?.is_retail === true;
      if (isRetail) {
        retailBV += bv;
      }
    }

    if (totalBV === 0) return 0;

    return Math.round((retailBV / totalBV) * 100 * 100) / 100; // Round to 2 decimals
  } catch (error) {
    console.error('Error calculating retail percentage:', error);
    return 0;
  }
}
