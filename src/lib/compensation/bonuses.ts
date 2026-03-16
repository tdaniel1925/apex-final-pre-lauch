// Apex Affinity Group - Bonus Calculations
// Source: mlm-config.json, 02_commission_examples.md

import type { Rep, Rank, BVSnapshot, CommissionLineItem } from './types';
import { COMP_PLAN_CONFIG, RANK_ID_MAP, round2 } from './config';

/**
 * BONUS TYPES (all from mlm-config.json)
 *
 * 1. Volume Kicker - 10% on top of L1-L5 overrides (Gold+)
 * 2. Personal Volume Bonus (PVB) - Tiered on personal BV
 * 3. Team Volume Bonus (TVB) - Tiered on team BV
 * 4. Retention Bonus - Based on renewal rate
 * 5. Matching Bonus - % of L1 leaders' override earnings (Silver+)
 * 6. Check Match - % of L1 leaders' total earnings (Gold+)
 * 7. Global Rank Share (GRS) - Pool split among top ranks
 * 8. Gold Accelerator - $3,467 one-time on first Gold achievement
 * 9. Infinity Bonus - $500/month for Platinum w/ 2nd org
 * 10. Car Allowance - $400/month for 6 consecutive Gold months
 */

// ============================================================================
// 1. VOLUME KICKER
// ============================================================================

/**
 * Volume Kicker: 10% on top of L1-L5 overrides
 *
 * Eligibility: Gold or Platinum
 * Applies to: Own override earnings from levels 1-5
 * Formula: SUM(L1 through L5 overrides) × 10%
 *
 * @param rep - Rep earning bonuses
 * @param overrideEarnings - Total override earnings L1-L5 for this month
 * @returns Volume Kicker amount
 */
export function calculateVolumeKicker(rep: Rep, overrideEarnings: number): number {
  const eligible = RANK_ID_MAP[rep.current_rank] >= RANK_ID_MAP.GOLD;

  if (!eligible) {
    return 0;
  }

  return round2(overrideEarnings * 0.10);  // 10% of L1-L5 overrides
}

// ============================================================================
// 2. PERSONAL VOLUME BONUS (PVB)
// ============================================================================

/**
 * Personal Volume Bonus: Tiered bonus on personal BV
 *
 * Tiers (from mlm-config.json):
 * - $500-$999: $25
 * - $1000-$2499: $75
 * - $2500+: $150
 *
 * @param personalBV - Rep's personal BV for the month
 * @returns PVB amount
 */
export function calculatePVB(personalBV: number): number {
  if (personalBV >= 2500) return 150;
  if (personalBV >= 1000) return 75;
  if (personalBV >= 500) return 25;
  return 0;
}

// ============================================================================
// 3. TEAM VOLUME BONUS (TVB)
// ============================================================================

/**
 * Team Volume Bonus: Tiered bonus on team BV
 *
 * Tiers (from mlm-config.json):
 * - $2,500-$9,999: $50
 * - $10,000-$24,999: $200
 * - $25,000-$99,999: $500
 * - $100,000+: $1,500
 *
 * @param teamBV - Rep's team BV for the month
 * @returns TVB amount
 */
export function calculateTVB(teamBV: number): number {
  if (teamBV >= 100000) return 1500;
  if (teamBV >= 25000) return 500;
  if (teamBV >= 10000) return 200;
  if (teamBV >= 2500) return 50;
  return 0;
}

// ============================================================================
// 4. RETENTION BONUS
// ============================================================================

/**
 * Retention Bonus: Reward for high customer renewal rates
 *
 * Tiers:
 * - 85%-89%: $50
 * - 90%-94%: $100
 * - 95%+: $200
 *
 * Calculation:
 * renewal_rate = (active_customers_from_prior_month / total_customers_prior_month) × 100
 *
 * @param renewalRate - Percentage of customers renewed (0-100)
 * @returns Retention bonus amount
 */
export function calculateRetentionBonus(renewalRate: number): number {
  if (renewalRate >= 95) return 200;
  if (renewalRate >= 90) return 100;
  if (renewalRate >= 85) return 50;
  return 0;
}

// ============================================================================
// 5. MATCHING BONUS
// ============================================================================

/**
 * Matching Bonus: Percentage of L1 leaders' override earnings
 *
 * Eligibility: Silver or higher
 * Leaders must be: Bronze or higher
 *
 * Percentages:
 * - Silver: 10%
 * - Gold: 15%
 * - Platinum: 20%
 *
 * CAP: $25,000 per month (Revenue Protection - Phase 2.4)
 *
 * Formula: For each qualifying L1 leader, earn X% of their override earnings
 *
 * @param rep - Rep earning bonus
 * @param l1LeadersOverrides - Map of L1 leader IDs to their override earnings
 * @param l1LeadersRanks - Map of L1 leader IDs to their ranks
 * @param db - Database connection for cap logging
 * @returns Matching bonus amount
 */
export async function calculateMatchingBonus(
  rep: Rep,
  l1LeadersOverrides: Map<string, number>,
  l1LeadersRanks: Map<string, Rank>,
  db: any
): Promise<number> {
  const repRankId = RANK_ID_MAP[rep.current_rank];

  // Eligibility: Silver or higher
  if (repRankId < RANK_ID_MAP.SILVER) {
    return 0;
  }

  // Determine percentage based on rep's rank
  let percentage = 0;
  if (rep.current_rank === 'PLATINUM') percentage = 0.20;
  else if (rep.current_rank === 'GOLD') percentage = 0.15;
  else if (rep.current_rank === 'SILVER') percentage = 0.10;

  let total = 0;

  for (const [leaderId, overrides] of Array.from(l1LeadersOverrides.entries())) {
    const leaderRank = l1LeadersRanks.get(leaderId);
    if (!leaderRank) continue;

    const leaderRankId = RANK_ID_MAP[leaderRank];

    // Leader must be Bronze or higher
    if (leaderRankId >= RANK_ID_MAP.BRONZE) {
      total += round2(overrides * percentage);
    }
  }

  // CRITICAL: Apply $25,000 monthly cap (Phase 2.4 Revenue Protection)
  const CAP_AMOUNT = 25000;
  if (total > CAP_AMOUNT) {
    const excessAmount = total - CAP_AMOUNT;

    // Log cap event to audit_log
    await db.from('audit_log').insert({
      action: 'matching_bonus_capped',
      actor_type: 'system',
      actor_id: null,
      table_name: 'commissions',
      record_id: rep.rep_id,
      details: {
        rep_id: rep.rep_id,
        rep_name: rep.full_name,
        total_before_cap: total,
        capped_amount: CAP_AMOUNT,
        excess_amount: excessAmount,
        cap_reason: 'Monthly matching bonus cap of $25,000 exceeded',
      },
      timestamp: new Date().toISOString(),
    });

    // Notify rep about cap
    await db.from('notifications').insert({
      user_id: rep.rep_id,
      type: 'commission_capped',
      title: 'Matching Bonus Capped',
      message: `Your matching bonus has reached the $25,000 monthly cap. Original amount: $${total.toFixed(2)}. Excess: $${excessAmount.toFixed(2)}.`,
      read: false,
      created_at: new Date().toISOString(),
    });

    console.warn(`⚠️ Matching bonus capped for rep ${rep.rep_id}: $${total.toFixed(2)} → $${CAP_AMOUNT.toFixed(2)}`);

    return CAP_AMOUNT;
  }

  return total;
}

// ============================================================================
// 6. CHECK MATCH
// ============================================================================

/**
 * Check Match: Percentage of L1 leaders' TOTAL earnings (not just overrides)
 *
 * Eligibility: Gold or Platinum
 * Leaders must be: Silver or higher
 *
 * Percentage: 5% (flat)
 *
 * Formula: For each qualifying L1 leader, earn 5% of their TOTAL monthly earnings
 *
 * @param rep - Rep earning bonus
 * @param l1LeadersTotalEarnings - Map of L1 leader IDs to their total earnings
 * @param l1LeadersRanks - Map of L1 leader IDs to their ranks
 * @returns Check Match amount
 */
export function calculateCheckMatch(
  rep: Rep,
  l1LeadersTotalEarnings: Map<string, number>,
  l1LeadersRanks: Map<string, Rank>
): number {
  const repRankId = RANK_ID_MAP[rep.current_rank];

  // Eligibility: Gold or Platinum
  if (repRankId < RANK_ID_MAP.GOLD) {
    return 0;
  }

  let total = 0;

  for (const [leaderId, earnings] of Array.from(l1LeadersTotalEarnings.entries())) {
    const leaderRank = l1LeadersRanks.get(leaderId);
    if (!leaderRank) continue;

    const leaderRankId = RANK_ID_MAP[leaderRank];

    // Leader must be Silver or higher
    if (leaderRankId >= RANK_ID_MAP.SILVER) {
      total += round2(earnings * 0.05);  // 5%
    }
  }

  return total;
}

// ============================================================================
// 7. GLOBAL RANK SHARE (GRS)
// ============================================================================

/**
 * Global Rank Share: Split bonus pool among qualifying ranks
 *
 * Eligibility: Gold or Platinum
 * Funded from: Bonus pool
 *
 * Distribution (from mlm-config.json):
 * - Gold: 1 share
 * - Platinum: 3 shares
 *
 * Formula:
 * 1. Count total shares (gold_count × 1 + platinum_count × 3)
 * 2. Calculate share value (pool_amount / total_shares)
 * 3. Pay rep their shares (Gold = 1 share, Platinum = 3 shares)
 *
 * @param rep - Rep earning bonus
 * @param bonusPoolAmount - Total bonus pool for this month
 * @param goldCount - Number of Gold reps
 * @param platinumCount - Number of Platinum reps
 * @returns GRS amount
 */
export function calculateGRS(
  rep: Rep,
  bonusPoolAmount: number,
  goldCount: number,
  platinumCount: number
): number {
  const repRankId = RANK_ID_MAP[rep.current_rank];

  // Eligibility: Gold or Platinum
  if (repRankId < RANK_ID_MAP.GOLD) {
    return 0;
  }

  // Calculate total shares
  const totalShares = (goldCount * 1) + (platinumCount * 3);

  if (totalShares === 0) {
    return 0;  // No one qualifies
  }

  // Share value
  const shareValue = bonusPoolAmount / totalShares;

  // Rep's shares
  const shares = rep.current_rank === 'PLATINUM' ? 3 : 1;

  return round2(shareValue * shares);
}

// ============================================================================
// 8. GOLD ACCELERATOR
// ============================================================================

/**
 * Gold Accelerator: $3,467 one-time bonus on first Gold achievement
 *
 * Eligibility:
 * - Rep achieves Gold rank for the first time
 * - gold_accelerator_paid flag = FALSE
 *
 * Funded from: Apex operating margin (not bonus pool)
 *
 * @param rep - Rep to check
 * @returns Gold Accelerator amount (or 0 if already paid)
 */
export function calculateGoldAccelerator(rep: Rep): number {
  const isGold = rep.current_rank === 'GOLD';
  const notPaid = !rep.gold_accelerator_paid;

  if (isGold && notPaid) {
    return COMP_PLAN_CONFIG.bonuses.gold_accelerator;  // $3,467
  }

  return 0;
}

/**
 * Mark Gold Accelerator as paid (update rep record)
 *
 * CRITICAL: This must be called AFTER creating the bonus line item
 *
 * @param repId - Rep ID
 * @param db - Database connection
 */
export async function markGoldAcceleratorPaid(repId: string, db: any): Promise<void> {
  await db
    .from('reps')
    .update({ gold_accelerator_paid: true })
    .eq('rep_id', repId);
}

// ============================================================================
// 9. INFINITY BONUS
// ============================================================================

/**
 * Infinity Bonus: $500/month for Platinum reps with qualifying 2nd organization
 *
 * Eligibility:
 * - Platinum for 90 consecutive days (auto-activates second org)
 * - Second org monthly BV >= $2,500
 *
 * Funded from: Bonus pool
 *
 * @param rep - Rep to check
 * @param secondOrgBV - Second organization's monthly BV
 * @returns Infinity bonus amount
 */
export function calculateInfinityBonus(rep: Rep, secondOrgBV: number): number {
  const isPlatinum = rep.current_rank === 'PLATINUM';
  const secondOrgActive = rep.infinity_org_active;
  const meetsThreshold = secondOrgBV >= COMP_PLAN_CONFIG.bonuses.infinity_bonus.second_org_bv_threshold;

  if (isPlatinum && secondOrgActive && meetsThreshold) {
    return COMP_PLAN_CONFIG.bonuses.infinity_bonus.monthly_amount;  // $500
  }

  return 0;
}

// ============================================================================
// 10. CAR ALLOWANCE
// ============================================================================

/**
 * Car Allowance: $400/month for 6 consecutive Gold (or higher) months
 *
 * Eligibility:
 * - Gold or Platinum for 6 consecutive months
 * - car_allowance_active flag = TRUE (auto-set after 6 months)
 * - If downrank below Gold → deactivate, reset counter
 *
 * CAP: $3,000 per month (Revenue Protection - Phase 2.4)
 * Note: Normal amount is $400, cap is safety net for edge cases
 *
 * @param rep - Rep to check
 * @param db - Database connection for cap logging
 * @returns Car allowance amount
 */
export async function calculateCarAllowance(rep: Rep, db: any): Promise<number> {
  if (!rep.car_allowance_active) {
    return 0;
  }

  let amount = 400;  // $400/month standard

  // CRITICAL: Apply $3,000 monthly cap (Phase 2.4 Revenue Protection)
  const CAP_AMOUNT = 3000;
  if (amount > CAP_AMOUNT) {
    const excessAmount = amount - CAP_AMOUNT;

    // Log cap event to audit_log
    await db.from('audit_log').insert({
      action: 'car_bonus_capped',
      actor_type: 'system',
      actor_id: null,
      table_name: 'commissions',
      record_id: rep.rep_id,
      details: {
        rep_id: rep.rep_id,
        rep_name: rep.full_name,
        total_before_cap: amount,
        capped_amount: CAP_AMOUNT,
        excess_amount: excessAmount,
        cap_reason: 'Monthly car bonus cap of $3,000 exceeded',
      },
      timestamp: new Date().toISOString(),
    });

    // Notify rep about cap
    await db.from('notifications').insert({
      user_id: rep.rep_id,
      type: 'commission_capped',
      title: 'Car Bonus Capped',
      message: `Your car bonus has reached the $3,000 monthly cap. Original amount: $${amount.toFixed(2)}. Excess: $${excessAmount.toFixed(2)}.`,
      read: false,
      created_at: new Date().toISOString(),
    });

    console.warn(`⚠️ Car bonus capped for rep ${rep.rep_id}: $${amount.toFixed(2)} → $${CAP_AMOUNT.toFixed(2)}`);

    return CAP_AMOUNT;
  }

  return amount;
}

/**
 * Update car allowance eligibility (run during rank evaluation)
 *
 * @param rep - Rep to check
 * @param currentRank - Newly evaluated rank
 * @param db - Database connection
 */
export async function updateCarAllowanceEligibility(rep: Rep, currentRank: Rank, db: any): Promise<void> {
  const rankId = RANK_ID_MAP[currentRank];

  if (rankId >= RANK_ID_MAP.GOLD) {
    // Increment consecutive months
    const newCount = rep.car_allowance_consecutive_months + 1;

    if (newCount >= 6 && !rep.car_allowance_active) {
      // Activate car allowance
      await db
        .from('reps')
        .update({
          car_allowance_active: true,
          car_allowance_consecutive_months: newCount,
        })
        .eq('rep_id', rep.rep_id);
    } else {
      // Update count
      await db
        .from('reps')
        .update({ car_allowance_consecutive_months: newCount })
        .eq('rep_id', rep.rep_id);
    }
  } else {
    // Downranked below Gold → reset
    await db
      .from('reps')
      .update({
        car_allowance_active: false,
        car_allowance_consecutive_months: 0,
      })
      .eq('rep_id', rep.rep_id);
  }
}

// ============================================================================
// BONUS AGGREGATOR
// ============================================================================

/**
 * Calculate ALL bonuses for a rep for a given month
 *
 * @param rep - Rep earning bonuses
 * @param bvSnapshot - Rep's BV snapshot for the month
 * @param overrideEarnings - Rep's override earnings L1-L5
 * @param l1Leaders - Map of L1 leader data
 * @param bonusPoolAmount - Bonus pool balance
 * @param rankCounts - Count of Gold and Platinum reps
 * @param db - Database connection
 * @returns Array of bonus line items
 */
export async function calculateAllBonuses(
  rep: Rep,
  bvSnapshot: BVSnapshot,
  overrideEarnings: number,
  l1Leaders: Map<string, { overrides: number; totalEarnings: number; rank: Rank }>,
  bonusPoolAmount: number,
  rankCounts: { gold: number; platinum: number },
  db: any
): Promise<Array<{ type: string; amount: number }>> {
  const bonuses: Array<{ type: string; amount: number }> = [];

  // 1. Volume Kicker
  const volumeKicker = calculateVolumeKicker(rep, overrideEarnings);
  if (volumeKicker > 0) {
    bonuses.push({ type: 'BONUS_VOLUME_KICKER', amount: volumeKicker });
  }

  // 2. PVB
  const pvb = calculatePVB(bvSnapshot.personal_bv);
  if (pvb > 0) {
    bonuses.push({ type: 'BONUS_PVB', amount: pvb });
  }

  // 3. TVB
  const tvb = calculateTVB(bvSnapshot.team_bv);
  if (tvb > 0) {
    bonuses.push({ type: 'BONUS_TVB', amount: tvb });
  }

  // 4. Retention Bonus (TODO: Calculate renewal rate)
  // const renewalRate = await calculateRenewalRate(rep.rep_id, db);
  // const retention = calculateRetentionBonus(renewalRate);

  // 5. Matching Bonus (with $25k monthly cap)
  const l1Overrides = new Map(Array.from(l1Leaders.entries()).map(([id, data]) => [id, data.overrides]));
  const l1Ranks = new Map(Array.from(l1Leaders.entries()).map(([id, data]) => [id, data.rank]));
  const matching = await calculateMatchingBonus(rep, l1Overrides, l1Ranks, db);
  if (matching > 0) {
    bonuses.push({ type: 'BONUS_MATCHING', amount: matching });
  }

  // 6. Check Match
  const l1Totals = new Map(Array.from(l1Leaders.entries()).map(([id, data]) => [id, data.totalEarnings]));
  const checkMatch = calculateCheckMatch(rep, l1Totals, l1Ranks);
  if (checkMatch > 0) {
    bonuses.push({ type: 'BONUS_CHECK_MATCH', amount: checkMatch });
  }

  // 7. GRS
  const grs = calculateGRS(rep, bonusPoolAmount, rankCounts.gold, rankCounts.platinum);
  if (grs > 0) {
    bonuses.push({ type: 'BONUS_GRS', amount: grs });
  }

  // 8. Gold Accelerator
  const goldAccel = calculateGoldAccelerator(rep);
  if (goldAccel > 0) {
    bonuses.push({ type: 'BONUS_GOLD_ACCELERATOR', amount: goldAccel });
    await markGoldAcceleratorPaid(rep.rep_id, db);
  }

  // 9. Infinity Bonus (TODO: Get second org BV)
  // const secondOrgBV = await getSecondOrgBV(rep.second_org_root_rep_id, db);
  // const infinity = calculateInfinityBonus(rep, secondOrgBV);

  // 10. Car Allowance (with $3k monthly cap)
  const carAllowance = await calculateCarAllowance(rep, db);
  if (carAllowance > 0) {
    bonuses.push({ type: 'BONUS_CAR_ALLOWANCE', amount: carAllowance });
  }

  return bonuses;
}
