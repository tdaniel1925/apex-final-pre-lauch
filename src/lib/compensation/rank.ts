// =============================================
// DUAL-LADDER COMPENSATION ENGINE - RANK EVALUATION
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md
// Phase: 3 (Build New TypeScript Code)
// Agent: 3C
// =============================================

import {
  TECH_RANKS,
  TECH_RANK_REQUIREMENTS,
  INSURANCE_RANKS,
  TechRank,
  InsuranceRank,
  getRankValue,
  PAY_LEVEL_GRACE_PERIOD_DAYS,
  TechRankRequirements,
  DownlineRequirement,
} from './config';

// Define locally instead of importing (not exported from config)
const PAY_LEVEL_GRACE_PERIOD_MONTHS = 1;
const NEW_REP_RANK_LOCK_MONTHS = 3;

/**
 * Member Data for Rank Evaluation
 */
export interface MemberRankData {
  memberId: string;
  personalCreditsMonthly: number;
  groupCreditsMonthly: number;
  currentTechRank: TechRank;
  currentInsuranceRank?: InsuranceRank;
  enrollmentDate: Date;
  techGraceMonths: number; // Months below requirements
  techRankLockUntil?: Date; // 6-month lock for new reps
  highestTechRank: TechRank;
}

/**
 * Sponsored Member (for downline verification)
 */
export interface SponsoredMember {
  memberId: string;
  techRank: TechRank;
  personallySponsored: boolean; // Must be true for downline requirements
}

/**
 * Rank Evaluation Result
 */
export interface RankEvaluationResult {
  currentRank: TechRank;
  qualifiedRank: TechRank; // Rank they qualify for based on credits/downline
  action: 'maintain' | 'promote' | 'demote' | 'grace_period' | 'rank_locked';
  effectiveDate?: Date; // When promotion takes effect (next month)
  graceMonthsUsed: number;
  graceMonthsRemaining: number;
  isRankLocked: boolean;
  reasons: string[];
}

/**
 * Evaluate Tech Ladder Rank
 *
 * From spec:
 * - Check personal + group QV (GQV) against thresholds
 * - Verify downline rank requirements (personally sponsored)
 * - Apply grace period (2 months) for demotions
 * - Apply rank lock (6 months) for new reps
 * - Promotions take effect next month
 *
 * @param member - Member data
 * @param sponsoredMembers - List of personally sponsored members
 * @returns Rank evaluation result
 */
export function evaluateTechRank(
  member: MemberRankData,
  sponsoredMembers: SponsoredMember[]
): RankEvaluationResult {
  const reasons: string[] = [];
  const currentRankValue = getRankValue(member.currentTechRank);

  // Check if rank is locked (6-month lock for new reps)
  const isRankLocked = Boolean(member.techRankLockUntil && new Date() < member.techRankLockUntil);

  // Find highest rank member qualifies for
  let qualifiedRank: TechRank = 'starter';

  for (let i = TECH_RANK_REQUIREMENTS.length - 1; i >= 0; i--) {
    const req = TECH_RANK_REQUIREMENTS[i];

    // Check credit requirements
    if (
      member.personalCreditsMonthly >= req.personal &&
      member.groupCreditsMonthly >= req.group
    ) {
      // Check downline requirements
      if (checkDownlineRequirements(req.downline, sponsoredMembers)) {
        qualifiedRank = req.name;
        reasons.push(
          `Qualifies for ${req.name}: ${member.personalCreditsMonthly}/${req.personal} personal, ${member.groupCreditsMonthly}/${req.group} group`
        );
        break;
      } else {
        reasons.push(
          `Credits met for ${req.name}, but downline requirements not met`
        );
      }
    }
  }

  const qualifiedRankValue = getRankValue(qualifiedRank);

  // PROMOTION
  if (qualifiedRankValue > currentRankValue) {
    const effectiveDate = getFirstDayOfNextMonth();
    reasons.push(`Promotion to ${qualifiedRank} effective ${effectiveDate.toISOString().split('T')[0]}`);

    return {
      currentRank: member.currentTechRank,
      qualifiedRank,
      action: 'promote',
      effectiveDate,
      graceMonthsUsed: 0,
      graceMonthsRemaining: PAY_LEVEL_GRACE_PERIOD_MONTHS,
      isRankLocked: false,
      reasons,
    };
  }

  // DEMOTION
  if (qualifiedRankValue < currentRankValue) {
    // Check rank lock
    if (isRankLocked) {
      reasons.push(
        `Rank locked until ${member.techRankLockUntil?.toISOString().split('T')[0]} (new rep protection)`
      );
      return {
        currentRank: member.currentTechRank,
        qualifiedRank: member.currentTechRank,
        action: 'rank_locked',
        graceMonthsUsed: 0,
        graceMonthsRemaining: PAY_LEVEL_GRACE_PERIOD_MONTHS,
        isRankLocked: true,
        reasons,
      };
    }

    // Apply grace period
    const graceMonthsUsed = member.techGraceMonths + 1;
    const graceMonthsRemaining = Math.max(0, PAY_LEVEL_GRACE_PERIOD_MONTHS - graceMonthsUsed);

    if (graceMonthsUsed < PAY_LEVEL_GRACE_PERIOD_MONTHS) {
      reasons.push(
        `Grace period: ${graceMonthsUsed}/${PAY_LEVEL_GRACE_PERIOD_MONTHS} months used. No demotion yet.`
      );
      return {
        currentRank: member.currentTechRank,
        qualifiedRank,
        action: 'grace_period',
        graceMonthsUsed,
        graceMonthsRemaining,
        isRankLocked: false,
        reasons,
      };
    }

    // Grace expired, demote
    const effectiveDate = getFirstDayOfNextMonth();
    reasons.push(
      `Grace period expired. Demotion to ${qualifiedRank} effective ${effectiveDate.toISOString().split('T')[0]}`
    );

    return {
      currentRank: member.currentTechRank,
      qualifiedRank,
      action: 'demote',
      effectiveDate,
      graceMonthsUsed,
      graceMonthsRemaining: 0,
      isRankLocked: false,
      reasons,
    };
  }

  // MAINTAIN
  reasons.push(`Maintaining ${member.currentTechRank} rank`);
  return {
    currentRank: member.currentTechRank,
    qualifiedRank: member.currentTechRank,
    action: 'maintain',
    graceMonthsUsed: 0,
    graceMonthsRemaining: PAY_LEVEL_GRACE_PERIOD_MONTHS,
    isRankLocked,
    reasons,
  };
}

/**
 * Check Downline Rank Requirements
 *
 * From spec:
 * - Downline rank requirements must be personally sponsored members
 * - Some ranks have OR conditions (e.g., Diamond: 3 Golds OR 2 Platinums)
 * - "At least X members at rank Y or higher"
 *
 * @param requirements - Downline requirements (can be array for OR conditions)
 * @param sponsored - List of personally sponsored members
 * @returns True if requirements met
 */
function checkDownlineRequirements(
  requirements: DownlineRequirement | DownlineRequirement[] | undefined,
  sponsored: SponsoredMember[]
): boolean {
  if (!requirements) return true; // No downline requirement

  // OR condition (Diamond, Elite)
  if (Array.isArray(requirements)) {
    return requirements.some((req) => checkSingleDownlineRequirement(req, sponsored));
  }

  // Single requirement
  return checkSingleDownlineRequirement(requirements, sponsored);
}

/**
 * Check a single downline requirement
 *
 * @param requirement - Single downline requirement (e.g., { gold: 2 })
 * @param sponsored - List of personally sponsored members
 * @returns True if requirement met
 */
function checkSingleDownlineRequirement(
  requirement: DownlineRequirement,
  sponsored: SponsoredMember[]
): boolean {
  for (const [requiredRank, requiredCount] of Object.entries(requirement)) {
    const requiredRankValue = getRankValue(requiredRank as TechRank);

    // Count sponsored members at or above required rank
    const qualifiedCount = sponsored.filter(
      (s) => s.personallySponsored && getRankValue(s.techRank) >= requiredRankValue
    ).length;

    if (qualifiedCount < requiredCount) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate Rank Lock End Date for New Reps
 *
 * From spec:
 * "6-month rank lock: New reps who achieve a rank in first 6 months are locked (no demotion) for 6 months"
 *
 * @param enrollmentDate - Member enrollment date
 * @param firstRankDate - Date they achieved their first rank above Starter
 * @returns Date when rank lock expires (6 months after first rank, or null if not applicable)
 */
export function calculateRankLockDate(
  enrollmentDate: Date,
  firstRankDate: Date
): Date | null {
  // Check if first rank was achieved within 6 months of enrollment
  const sixMonthsAfterEnrollment = addMonths(enrollmentDate, 6);

  if (firstRankDate > sixMonthsAfterEnrollment) {
    return null; // Rank lock only applies if achieved within first 6 months
  }

  // Lock expires 6 months after achieving the rank
  return addMonths(firstRankDate, NEW_REP_RANK_LOCK_MONTHS);
}

/**
 * Get first day of next month (for promotion effective dates)
 *
 * From spec:
 * "Promotions take effect next month"
 *
 * @returns First day of next month
 */
function getFirstDayOfNextMonth(): Date {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return nextMonth;
}

/**
 * Add months to a date
 *
 * @param date - Starting date
 * @param months - Number of months to add
 * @returns New date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Check if member qualifies for rank bonus
 *
 * From spec:
 * "Bonuses paid once per rank per lifetime"
 * "Re-qualification does NOT earn second bonus"
 *
 * @param newRank - Rank member is being promoted to
 * @param highestRank - Highest rank ever achieved
 * @returns True if rank bonus should be paid
 */
export function shouldPayRankBonus(newRank: TechRank, highestRank: TechRank): boolean {
  return getRankValue(newRank) > getRankValue(highestRank);
}

/**
 * Get rank bonus amount for a rank
 *
 * @param rank - Tech rank
 * @returns Bonus amount in cents
 */
export function getRankBonus(rank: TechRank): number {
  const req = TECH_RANK_REQUIREMENTS.find((r) => r.name === rank);
  return req?.bonus ?? 0;
}

/**
 * Simple Insurance Rank Evaluation
 *
 * Note: Full insurance ladder logic would include:
 * - Insurance production metrics
 * - Placement ratio
 * - Persistency ratio
 * - MGA shop requirements
 *
 * This is a placeholder for basic structure.
 * Full implementation would be in a separate insurance-rank.ts module.
 */
export function evaluateInsuranceRank(
  insuranceProductionCents: number,
  placementRatio: number,
  persistencyRatio: number
): InsuranceRank {
  // Simplified logic - actual implementation would use spec thresholds
  if (insuranceProductionCents >= 500000 && placementRatio >= 0.8 && persistencyRatio >= 0.9) {
    return 'mga';
  }

  if (insuranceProductionCents >= 250000 && placementRatio >= 0.75) {
    return 'executive_director';
  }

  if (insuranceProductionCents >= 100000 && placementRatio >= 0.7) {
    return 'senior_director';
  }

  if (insuranceProductionCents >= 50000) {
    return 'director';
  }

  if (insuranceProductionCents >= 25000) {
    return 'manager';
  }

  if (insuranceProductionCents >= 10000) {
    return 'associate';
  }

  return 'inactive';
}

// =============================================
// ASYNC VERSIONS (Future Database-Driven Config)
// =============================================
// These versions use the config-loader for future database-driven config
// Use these in new code that can handle async/await
// =============================================

/**
 * Evaluate Tech Ladder Rank (async version)
 *
 * This version loads rank requirements from config-loader (currently hardcoded, future DB)
 *
 * @param member - Member data
 * @param sponsoredMembers - List of personally sponsored members
 * @returns Rank evaluation result
 */
export async function evaluateTechRankAsync(
  member: MemberRankData,
  sponsoredMembers: SponsoredMember[]
): Promise<RankEvaluationResult> {
  // For now, delegate to sync version
  // FUTURE: Load requirements from config-loader
  return evaluateTechRank(member, sponsoredMembers);

  // FUTURE IMPLEMENTATION:
  // import { getTechRankRequirements } from './config-loader';
  //
  // const reasons: string[] = [];
  // const currentRankValue = getRankValue(member.currentTechRank);
  //
  // const isRankLocked = Boolean(member.techRankLockUntil && new Date() < member.techRankLockUntil);
  //
  // // Load requirements from database
  // const requirements = await getTechRankRequirements();
  //
  // let qualifiedRank: TechRank = 'starter';
  //
  // for (let i = requirements.length - 1; i >= 0; i--) {
  //   const req = requirements[i];
  //
  //   if (
  //     member.personalCreditsMonthly >= req.personal &&
  //     member.groupCreditsMonthly >= req.group
  //   ) {
  //     if (checkDownlineRequirements(req.downline, sponsoredMembers)) {
  //       qualifiedRank = req.name;
  //       reasons.push(
  //         `Qualifies for ${req.name}: ${member.personalCreditsMonthly}/${req.personal} personal, ${member.groupCreditsMonthly}/${req.group} group`
  //       );
  //       break;
  //     } else {
  //       reasons.push(
  //         `Credits met for ${req.name}, but downline requirements not met`
  //       );
  //     }
  //   }
  // }
  //
  // const qualifiedRankValue = getRankValue(qualifiedRank);
  //
  // // ... rest of evaluation logic (same as sync version)
}
