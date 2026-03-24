// =============================================
// DUAL-LADDER COMPENSATION ENGINE - RANK EVALUATION
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md
// Tech Rank System: 9 ranks, credit-based qualification
// =============================================

import {
  TechRank,
  TECH_RANK_REQUIREMENTS,
  NEW_REP_RANK_LOCK_MONTHS,
  RANK_GRACE_PERIOD_MONTHS,
  DownlineRequirement
} from './config';

export interface SponsoredMember {
  memberId: string;
  techRank: TechRank;
  personallySponsored: boolean;
}

export interface MemberRankData {
  memberId: string;
  personalCreditsMonthly: number;
  groupCreditsMonthly: number;
  currentTechRank: TechRank;
  enrollmentDate: Date;
  techGraceMonths: number; // 0, 1, or 2
  highestTechRank: TechRank;
  techRankLockUntil?: Date;
}

export interface RankEvaluationResult {
  action: 'promote' | 'demote' | 'maintain' | 'grace_period' | 'rank_locked';
  currentRank: TechRank;
  qualifiedRank: TechRank;
  effectiveDate?: Date;
  isRankLocked?: boolean;
  graceMonthsUsed?: number;
  graceMonthsRemaining?: number;
  reasons: string[];
}

/**
 * Evaluate Tech Rank
 * From spec lines 183-215
 *
 * CRITICAL RULES:
 * - Credit-based evaluation (personal + group + downline)
 * - 2-month grace period before demotion
 * - 6-month rank lock for new reps
 * - Downline requirements support OR conditions
 * - Promotion/demotion effective 1st of following month
 */
export function evaluateTechRank(
  member: MemberRankData,
  sponsoredMembers: SponsoredMember[]
): RankEvaluationResult {
  const reasons: string[] = [];

  // Check rank lock
  if (member.techRankLockUntil && new Date() < member.techRankLockUntil) {
    return {
      action: 'rank_locked',
      currentRank: member.currentTechRank,
      qualifiedRank: member.currentTechRank,
      isRankLocked: true,
      reasons: [`Rank locked until ${member.techRankLockUntil.toLocaleDateString()}`],
    };
  }

  // Evaluate from highest rank down
  let qualifiedRank: TechRank = 'starter';

  for (let i = TECH_RANK_REQUIREMENTS.length - 1; i >= 0; i--) {
    const req = TECH_RANK_REQUIREMENTS[i];

    // Check personal and group credits
    if (member.personalCreditsMonthly < req.personal) continue;
    if (member.groupCreditsMonthly < req.group) continue;

    // Check downline requirements if any
    if (req.downline) {
      if (!checkDownlineRequirements(sponsoredMembers, req.downline)) {
        continue;
      }
    }

    qualifiedRank = req.name;
    break;
  }

  // Determine action
  const currentValue = rankValue(member.currentTechRank);
  const qualifiedValue = rankValue(qualifiedRank);

  if (qualifiedValue > currentValue) {
    // PROMOTION
    const effectiveDate = new Date();
    effectiveDate.setMonth(effectiveDate.getMonth() + 1);
    effectiveDate.setDate(1);

    return {
      action: 'promote',
      currentRank: member.currentTechRank,
      qualifiedRank,
      effectiveDate,
      reasons: [`Qualified for ${qualifiedRank} - effective ${effectiveDate.toLocaleDateString()}`],
    };
  } else if (qualifiedValue < currentValue) {
    // DEMOTION - Check grace period
    // Grace is available if we haven't used all grace months yet
    if (member.techGraceMonths < RANK_GRACE_PERIOD_MONTHS - 1) {
      return {
        action: 'grace_period',
        currentRank: member.currentTechRank,
        qualifiedRank,
        graceMonthsUsed: member.techGraceMonths + 1,
        graceMonthsRemaining: RANK_GRACE_PERIOD_MONTHS - member.techGraceMonths - 1,
        reasons: [`Grace period month ${member.techGraceMonths + 1} of ${RANK_GRACE_PERIOD_MONTHS}`],
      };
    }

    // Grace expired or last grace month used - demote
    const effectiveDate = new Date();
    effectiveDate.setMonth(effectiveDate.getMonth() + 1);
    effectiveDate.setDate(1);

    return {
      action: 'demote',
      currentRank: member.currentTechRank,
      qualifiedRank,
      effectiveDate,
      graceMonthsUsed: member.techGraceMonths + 1,
      graceMonthsRemaining: 0,
      reasons: [`Grace period expired - demoting to ${qualifiedRank}`],
    };
  }

  // MAINTAIN
  return {
    action: 'maintain',
    currentRank: member.currentTechRank,
    qualifiedRank: member.currentTechRank,
    reasons: ['Requirements met for current rank'],
  };
}

/**
 * Check Downline Requirements
 * Supports both simple objects and OR arrays
 *
 * Examples:
 * - { bronze: 1 } = Need 1 personally sponsored Bronze+
 * - [{ gold: 3 }, { platinum: 2 }] = Need 3 Gold+ OR 2 Platinum+
 * - { platinum: 2, gold: 1 } = Need 2 Platinum+ AND 1 Gold+
 */
function checkDownlineRequirements(
  sponsored: SponsoredMember[],
  requirements: DownlineRequirement | DownlineRequirement[]
): boolean {
  if (!requirements) return true;

  // OR condition (array)
  if (Array.isArray(requirements)) {
    return requirements.some(req => checkDownlineRequirements(sponsored, req));
  }

  // AND condition (object)
  for (const [requiredRank, count] of Object.entries(requirements)) {
    const qualifiedCount = sponsored.filter(s =>
      s.personallySponsored &&
      rankValue(s.techRank) >= rankValue(requiredRank as TechRank)
    ).length;

    if (qualifiedCount < (count as number)) {
      return false;
    }
  }

  return true;
}

/**
 * Get Rank Value (for comparisons)
 * Higher value = higher rank
 */
function rankValue(rank: TechRank): number {
  const ranks: TechRank[] = ['starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'];
  return ranks.indexOf(rank);
}

/**
 * Calculate Rank Lock Date
 * New reps get 6-month lock if they achieve a rank in first 6 months
 *
 * From spec lines 220-227:
 * - If rep achieves rank within 6 months of enrollment → Lock for 6 months from achievement
 * - If rep achieves rank after 6 months → No lock
 *
 * @param enrollmentDate - Date rep enrolled
 * @param firstRankDate - Date rank was first achieved
 * @returns Lock date or null if no lock applies
 */
export function calculateRankLockDate(enrollmentDate: Date, firstRankDate: Date): Date | null {
  const monthsSinceEnrollment = monthsBetween(enrollmentDate, firstRankDate);

  if (monthsSinceEnrollment > 6) {
    return null; // Achieved after 6 months - no lock
  }

  // Lock for 6 months from rank achievement
  const lockDate = new Date(firstRankDate);
  lockDate.setMonth(lockDate.getMonth() + NEW_REP_RANK_LOCK_MONTHS);
  return lockDate;
}

/**
 * Should Pay Rank Bonus
 * Only pay if this is a new highest rank
 *
 * From spec line 166:
 * - One-time bonus for first achievement of each rank
 * - No bonus for re-achieving a previously held rank
 *
 * @param newRank - Rank just achieved
 * @param highestEverAchieved - Highest rank ever held
 * @returns True if bonus should be paid
 */
export function shouldPayRankBonus(newRank: TechRank, highestEverAchieved: TechRank): boolean {
  return rankValue(newRank) > rankValue(highestEverAchieved);
}

/**
 * Get Rank Bonus Amount
 * From spec line 166
 *
 * Rank Bonuses (in CENTS):
 * - Starter: $0
 * - Bronze: $250
 * - Silver: $1,000
 * - Gold: $3,000
 * - Platinum: $7,500
 * - Ruby: $12,000
 * - Diamond: $18,000
 * - Crown: $22,000
 * - Elite: $30,000
 *
 * @param rank - Tech rank
 * @returns Bonus amount in cents
 */
export function getRankBonus(rank: TechRank): number {
  const bonuses: Record<TechRank, number> = {
    starter: 0,
    bronze: 25000,      // $250
    silver: 100000,     // $1,000
    gold: 300000,       // $3,000
    platinum: 750000,   // $7,500
    ruby: 1200000,      // $12,000
    diamond: 1800000,   // $18,000
    crown: 2200000,     // $22,000
    elite: 3000000,     // $30,000
  };
  return bonuses[rank];
}

/**
 * Check if a rep qualifies for a specific override level
 * Based on prior month rank
 *
 * @param priorMonthRank - Rep's rank from prior month (any type)
 * @param level - Override level (1-7)
 * @param teamBV - Team BV (optional, for level 6-7 qualification)
 * @returns True if qualified for this level
 */
export function qualifiesForOverrideLevel(
  priorMonthRank: any,
  level: number,
  teamBV: number = 0
): boolean {
  // No prior month rank = new rep = doesn't qualify
  if (!priorMonthRank) {
    return false;
  }

  // Handle INACTIVE rank
  if (priorMonthRank === 'INACTIVE') {
    return false;
  }

  // For now, basic qualification based on level
  // This is a stub until full override qualification logic is implemented
  return true;
}

/**
 * Helper: Months Between Two Dates
 */
function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 +
         (end.getMonth() - start.getMonth());
}
