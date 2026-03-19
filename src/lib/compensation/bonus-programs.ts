// =============================================
// DUAL-LADDER COMPENSATION ENGINE - BONUS PROGRAMS
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md
// Phase: 3 (Build New TypeScript Code)
// Agent: 3E
// =============================================

import {
  TechRank,
  LEADERSHIP_POOL_ELIGIBLE_RANK,
  OVERRIDE_QUALIFICATION_MIN_CREDITS,
} from './config';
import { shouldPayRankBonus, getRankBonus } from './rank';

/**
 * Rank Advancement Bonus
 *
 * From spec:
 * "Bonuses paid once per rank per lifetime"
 * "Re-qualification does NOT earn second bonus"
 *
 * Bonus amounts:
 * - Bronze: $250
 * - Silver: $1,000
 * - Gold: $3,000
 * - Platinum: $7,500
 * - Ruby: $12,000
 * - Diamond: $18,000
 * - Crown: $22,000
 * - Elite: $30,000
 * Total: $93,750 (Starter → Elite)
 */
export interface RankBonusResult {
  memberId: string;
  newRank: TechRank;
  bonusAmountCents: number;
  qualified: boolean;
  reason?: string;
}

/**
 * Calculate Rank Advancement Bonus
 *
 * @param memberId - Member ID
 * @param newRank - Rank being promoted to
 * @param highestRankEverAchieved - Highest rank ever achieved (prevents duplicate bonuses)
 * @param overrideQualified - Must be override qualified (50+ credits) to receive bonus
 * @returns Rank bonus calculation result
 */
export function calculateRankBonus(
  memberId: string,
  newRank: TechRank,
  highestRankEverAchieved: TechRank,
  overrideQualified: boolean
): RankBonusResult {
  // Check override qualification (50 credit minimum)
  if (!overrideQualified) {
    return {
      memberId,
      newRank,
      bonusAmountCents: 0,
      qualified: false,
      reason: `Not override qualified (need ${OVERRIDE_QUALIFICATION_MIN_CREDITS}+ personal credits)`,
    };
  }

  // Check if this is a NEW highest rank
  if (!shouldPayRankBonus(newRank, highestRankEverAchieved)) {
    return {
      memberId,
      newRank,
      bonusAmountCents: 0,
      qualified: false,
      reason: `Already achieved ${newRank} or higher (highest: ${highestRankEverAchieved})`,
    };
  }

  // Get bonus amount for this rank
  const bonusAmountCents = getRankBonus(newRank);

  if (bonusAmountCents === 0) {
    return {
      memberId,
      newRank,
      bonusAmountCents: 0,
      qualified: false,
      reason: `No bonus for ${newRank} rank`,
    };
  }

  return {
    memberId,
    newRank,
    bonusAmountCents,
    qualified: true,
  };
}

/**
 * Bonus Pool Share (3.5% Pool)
 *
 * From spec:
 * "Bonus pool is divided EQUALLY among all members who earned rank bonuses in the period"
 */
export interface BonusPoolShare {
  memberId: string;
  memberName: string;
  shareAmountCents: number;
  periodLabel: string; // e.g., "2026-03"
}

/**
 * Calculate Bonus Pool Shares
 *
 * @param totalPoolCents - Total 3.5% bonus pool for the period
 * @param qualifiedMembers - Members who earned rank bonuses this period
 * @param periodLabel - Period identifier (YYYY-MM format)
 * @returns Array of bonus pool shares (equal split)
 */
export function calculateBonusPoolShares(
  totalPoolCents: number,
  qualifiedMembers: Array<{ memberId: string; memberName: string }>,
  periodLabel: string
): BonusPoolShare[] {
  if (qualifiedMembers.length === 0) {
    return []; // No qualified members
  }

  // Equal share for each qualified member
  const sharePerMemberCents = Math.floor(totalPoolCents / qualifiedMembers.length);

  return qualifiedMembers.map((member) => ({
    memberId: member.memberId,
    memberName: member.memberName,
    shareAmountCents: sharePerMemberCents,
    periodLabel,
  }));
}

/**
 * Leadership Pool Share (1.5% Pool - Elite Members Only)
 *
 * From spec:
 * "Leadership pool is divided among Elite members based on production points"
 * "Points = personal_credits + team_credits"
 * "Share % = member's points / total Elite points"
 */
export interface LeadershipPoolShare {
  memberId: string;
  memberName: string;
  personalCredits: number;
  teamCredits: number;
  sharePoints: number; // personal + team
  sharePercentage: number; // % of total Elite production
  payoutCents: number;
  periodLabel: string;
}

/**
 * Calculate Leadership Pool Shares
 *
 * @param totalPoolCents - Total 1.5% leadership pool for the period
 * @param eliteMembers - Elite members with production data
 * @param periodLabel - Period identifier (YYYY-MM format)
 * @returns Array of leadership pool shares (proportional to production)
 */
export function calculateLeadershipPoolShares(
  totalPoolCents: number,
  eliteMembers: Array<{
    memberId: string;
    memberName: string;
    personalCredits: number;
    teamCredits: number;
    overrideQualified: boolean;
  }>,
  periodLabel: string
): LeadershipPoolShare[] {
  // Filter to override-qualified Elite members only
  const qualified = eliteMembers.filter((m) => m.overrideQualified);

  if (qualified.length === 0) {
    return []; // No qualified Elite members
  }

  // Calculate total Elite production points
  const totalPoints = qualified.reduce(
    (sum, m) => sum + m.personalCredits + m.teamCredits,
    0
  );

  if (totalPoints === 0) {
    return []; // No production to share
  }

  // Calculate each member's share
  return qualified.map((member) => {
    const sharePoints = member.personalCredits + member.teamCredits;
    const sharePercentage = (sharePoints / totalPoints) * 100;
    const payoutCents = Math.floor((sharePoints / totalPoints) * totalPoolCents);

    return {
      memberId: member.memberId,
      memberName: member.memberName,
      personalCredits: member.personalCredits,
      teamCredits: member.teamCredits,
      sharePoints,
      sharePercentage,
      payoutCents,
      periodLabel,
    };
  });
}

/**
 * Fast Start Bonus (Placeholder)
 *
 * Note: Spec mentions Fast Start but doesn't provide detailed criteria.
 * This is a placeholder for future implementation.
 */
export interface FastStartBonus {
  memberId: string;
  bonusAmountCents: number;
  qualifier: string; // e.g., "3 sales in first 30 days"
}

/**
 * Generation Bonus (Placeholder)
 *
 * Note: Spec mentions Generation bonus but doesn't provide detailed criteria.
 * This is a placeholder for future implementation.
 */
export interface GenerationBonus {
  memberId: string;
  generation: number; // 1st, 2nd, 3rd generation
  bonusAmountCents: number;
}

/**
 * Builder Bonus (Placeholder)
 *
 * Note: Spec mentions Builder bonus but doesn't provide detailed criteria.
 * This is a placeholder for future implementation.
 */
export interface BuilderBonus {
  memberId: string;
  bonusAmountCents: number;
  qualifier: string; // e.g., "Built team of 100 active members"
}

/**
 * Elite Bonus (Placeholder)
 *
 * Note: Elite members already receive Leadership Pool shares (1.5%).
 * This placeholder is for any additional Elite-specific bonuses.
 */
export interface EliteBonus {
  memberId: string;
  bonusAmountCents: number;
  qualifier: string;
}

/**
 * Format bonus pool share for display
 *
 * @param share - Bonus pool share
 * @returns Formatted string
 */
export function formatBonusPoolShare(share: BonusPoolShare): string {
  const amount = `$${(share.shareAmountCents / 100).toFixed(2)}`;
  return `${share.memberName} - ${amount} (${share.periodLabel})`;
}

/**
 * Format leadership pool share for display
 *
 * @param share - Leadership pool share
 * @returns Formatted string
 */
export function formatLeadershipPoolShare(share: LeadershipPoolShare): string {
  const amount = `$${(share.payoutCents / 100).toFixed(2)}`;
  const pct = share.sharePercentage.toFixed(2);
  return `${share.memberName} - ${amount} (${pct}% of Elite production, ${share.sharePoints} points)`;
}

/**
 * Get total rank bonuses for all promotions
 *
 * @param bonuses - Array of rank bonus results
 * @returns Total bonus amount in cents
 */
export function getTotalRankBonuses(bonuses: RankBonusResult[]): number {
  return bonuses
    .filter((b) => b.qualified)
    .reduce((total, b) => total + b.bonusAmountCents, 0);
}

/**
 * Get total bonus pool payouts
 *
 * @param shares - Array of bonus pool shares
 * @returns Total payout amount in cents
 */
export function getTotalBonusPoolPayouts(shares: BonusPoolShare[]): number {
  return shares.reduce((total, s) => total + s.shareAmountCents, 0);
}

/**
 * Get total leadership pool payouts
 *
 * @param shares - Array of leadership pool shares
 * @returns Total payout amount in cents
 */
export function getTotalLeadershipPoolPayouts(shares: LeadershipPoolShare[]): number {
  return shares.reduce((total, s) => total + s.payoutCents, 0);
}

/**
 * Validate bonus pool distribution
 *
 * Ensures total shares don't exceed pool amount
 *
 * @param totalPoolCents - Total pool available
 * @param shares - Calculated shares
 * @returns Validation result
 */
export interface BonusValidation {
  valid: boolean;
  errors: string[];
  totalPoolCents: number;
  totalPaidCents: number;
  remainderCents: number;
}

export function validateBonusPoolDistribution(
  totalPoolCents: number,
  shares: BonusPoolShare[]
): BonusValidation {
  const errors: string[] = [];
  const totalPaidCents = getTotalBonusPoolPayouts(shares);
  const remainderCents = totalPoolCents - totalPaidCents;

  if (totalPaidCents > totalPoolCents) {
    errors.push(
      `Total payouts ($${(totalPaidCents / 100).toFixed(2)}) exceed pool ($${(totalPoolCents / 100).toFixed(2)})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    totalPoolCents,
    totalPaidCents,
    remainderCents,
  };
}

/**
 * Validate leadership pool distribution
 *
 * Ensures total shares don't exceed pool amount
 *
 * @param totalPoolCents - Total pool available
 * @param shares - Calculated shares
 * @returns Validation result
 */
export function validateLeadershipPoolDistribution(
  totalPoolCents: number,
  shares: LeadershipPoolShare[]
): BonusValidation {
  const errors: string[] = [];
  const totalPaidCents = getTotalLeadershipPoolPayouts(shares);
  const remainderCents = totalPoolCents - totalPaidCents;

  if (totalPaidCents > totalPoolCents) {
    errors.push(
      `Total payouts ($${(totalPaidCents / 100).toFixed(2)}) exceed pool ($${(totalPoolCents / 100).toFixed(2)})`
    );
  }

  // Check if all members are Elite
  const nonEliteCount = shares.filter((s) => s.personalCredits + s.teamCredits === 0).length;
  if (nonEliteCount > 0) {
    errors.push(`${nonEliteCount} non-Elite members in leadership pool`);
  }

  return {
    valid: errors.length === 0,
    errors,
    totalPoolCents,
    totalPaidCents,
    remainderCents,
  };
}
