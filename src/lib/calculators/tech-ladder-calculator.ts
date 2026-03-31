// =============================================
// TECH LADDER CALCULATOR - PROJECTION LOGIC
// =============================================
// Calculates earnings potential for tech ladder ranks
// Based on: APEX_COMP_ENGINE_SPEC_7_LEVEL.md
// =============================================

import {
  TECH_RANK_REQUIREMENTS,
  RANKED_OVERRIDE_SCHEDULES,
  WATERFALL_CONFIG,
  OVERRIDE_QUALIFICATION_MIN_CREDITS,
  type TechRank,
  type TechRankRequirements,
} from '@/lib/compensation/config';

/**
 * Calculator input for tech ladder
 */
export interface TechCalculatorInput {
  personalQV: number; // Monthly personal QV
  teamQV: number; // Monthly team QV
  personalEnrollees: number; // Number of personally enrolled distributors
  currentRank?: TechRank; // Optional: current rank selection
}

/**
 * Rank qualification status
 */
export interface RankQualification {
  rank: TechRank;
  qualified: boolean;
  requirements: {
    personalQV: { required: number; current: number; met: boolean };
    teamQV: { required: number; current: number; met: boolean };
    downline: { required: string; current: number; met: boolean } | null;
  };
  progress: number; // 0-100%
}

/**
 * Monthly income breakdown
 */
export interface MonthlyIncomeProjection {
  personalCommission: number; // 60% of personal BV
  overrideIncome: number; // Estimated override income
  bonusPoolShare: number; // Estimated bonus pool share
  leadershipPoolShare: number; // Estimated leadership pool share (Diamond only)
  totalMonthly: number;
}

/**
 * Next rank requirements
 */
export interface NextRankRequirements {
  nextRank: TechRank | null;
  missingPersonalQV: number;
  missingTeamQV: number;
  missingDownline: string | null;
  progressPercentage: number;
}

/**
 * Complete calculator output
 */
export interface TechCalculatorOutput {
  currentRankQualification: RankQualification;
  allRankQualifications: RankQualification[];
  monthlyIncomeProjection: MonthlyIncomeProjection;
  nextRankRequirements: NextRankRequirements | null;
  rankBonus: number; // One-time bonus if rank is achieved
  overrideDepth: number; // L1-L7 depth unlocked
}

/**
 * Calculate what rank the user qualifies for
 */
export function calculateQualifiedRank(input: TechCalculatorInput): TechRank {
  const { personalQV, teamQV, personalEnrollees } = input;

  // Check from highest to lowest rank
  for (let i = TECH_RANK_REQUIREMENTS.length - 1; i >= 0; i--) {
    const rankReq = TECH_RANK_REQUIREMENTS[i];

    // Check personal and team QV
    if (personalQV < rankReq.personal || teamQV < rankReq.group) {
      continue;
    }

    // Check downline requirements
    if (rankReq.downline) {
      const downlineRequirements = Array.isArray(rankReq.downline)
        ? rankReq.downline
        : [rankReq.downline];

      let downlineMet = false;

      for (const requirement of downlineRequirements) {
        // For this calculator, we simplify: we count personal enrollees
        // In reality, we'd need to check specific rank requirements
        // For now, assume if they have enough enrollees, they might qualify
        const requiredCount = Object.values(requirement)[0];
        if (personalEnrollees >= requiredCount) {
          downlineMet = true;
          break;
        }
      }

      if (!downlineMet) {
        continue;
      }
    }

    // Qualifies for this rank
    return rankReq.name;
  }

  return 'starter';
}

/**
 * Calculate qualification status for all ranks
 */
export function calculateAllRankQualifications(
  input: TechCalculatorInput
): RankQualification[] {
  const { personalQV, teamQV, personalEnrollees } = input;

  return TECH_RANK_REQUIREMENTS.map((rankReq) => {
    const personalMet = personalQV >= rankReq.personal;
    const teamMet = teamQV >= rankReq.group;

    let downlineStatus: { required: string; current: number; met: boolean } | null = null;

    if (rankReq.downline) {
      const downlineRequirements = Array.isArray(rankReq.downline)
        ? rankReq.downline
        : [rankReq.downline];

      const requirementStrings = downlineRequirements.map((req) => {
        const [rank, count] = Object.entries(req)[0];
        return `${count} ${rank}`;
      });

      const requiredString = requirementStrings.join(' OR ');
      const minRequired = Math.min(
        ...downlineRequirements.map((req) => Object.values(req)[0] as number)
      );

      downlineStatus = {
        required: requiredString,
        current: personalEnrollees,
        met: personalEnrollees >= minRequired,
      };
    }

    const qualified =
      personalMet && teamMet && (downlineStatus ? downlineStatus.met : true);

    // Calculate progress percentage
    const personalProgress = rankReq.personal > 0 ? (personalQV / rankReq.personal) * 100 : 100;
    const teamProgress = rankReq.group > 0 ? (teamQV / rankReq.group) * 100 : 100;
    const downlineProgress = downlineStatus
      ? (personalEnrollees / (downlineStatus.met ? 1 : parseInt(downlineStatus.required))) * 100
      : 100;

    const progress = Math.min(
      100,
      Math.min(personalProgress, teamProgress, downlineProgress)
    );

    return {
      rank: rankReq.name,
      qualified,
      requirements: {
        personalQV: {
          required: rankReq.personal,
          current: personalQV,
          met: personalMet,
        },
        teamQV: {
          required: rankReq.group,
          current: teamQV,
          met: teamMet,
        },
        downline: downlineStatus,
      },
      progress,
    };
  });
}

/**
 * Calculate monthly income projection
 *
 * IMPORTANT: This is a PROJECTION tool, not actual commission calculation
 * Real commissions are calculated by the commission engine
 */
export function calculateMonthlyIncome(
  input: TechCalculatorInput,
  qualifiedRank: TechRank
): MonthlyIncomeProjection {
  const { personalQV, teamQV } = input;

  // Check override qualification (50 QV minimum)
  const overrideQualified = personalQV >= OVERRIDE_QUALIFICATION_MIN_CREDITS;

  // Calculate personal commission from personal QV
  // Average BV conversion: QV × 0.467 (from spec - $69.39 BV per $149 retail = 46.6%)
  const avgBVConversion = 0.467;
  const personalBV = personalQV * avgBVConversion;
  const personalCommission = personalBV * WATERFALL_CONFIG.SELLER_COMMISSION_PCT;

  // Estimate override income
  // This is simplified - actual calculation requires tree structure
  // We estimate based on team QV and override depth
  let overrideIncome = 0;
  if (overrideQualified && teamQV > personalQV) {
    const teamQVMinusPersonal = teamQV - personalQV;
    const teamBV = teamQVMinusPersonal * avgBVConversion;
    const overridePool = teamBV * WATERFALL_CONFIG.OVERRIDE_POOL_PCT;

    // Get total override rate for this rank
    const overrideSchedule = RANKED_OVERRIDE_SCHEDULES[qualifiedRank];
    const totalOverrideRate = overrideSchedule.reduce((sum, rate) => sum + rate, 0);

    // Estimate: assume they capture 30% of available overrides in their tree
    // (This is a conservative estimate for projection purposes)
    overrideIncome = overridePool * totalOverrideRate * 0.3;
  }

  // Bonus pool share (3.5% of company revenue)
  // Simplified estimate: assume $10 per qualified rank member per month
  const bonusPoolShare = overrideQualified ? 10 : 0;

  // Leadership pool share (Diamond Ambassador only)
  let leadershipPoolShare = 0;
  if (qualifiedRank === 'diamond_ambassador' && overrideQualified) {
    // Simplified estimate: proportional to production
    // Assume $50-$200 per month based on production level
    const productionPoints = personalQV + teamQV;
    leadershipPoolShare = Math.min(200, Math.max(50, productionPoints / 1000));
  }

  const totalMonthly =
    personalCommission + overrideIncome + bonusPoolShare + leadershipPoolShare;

  return {
    personalCommission,
    overrideIncome,
    bonusPoolShare,
    leadershipPoolShare,
    totalMonthly,
  };
}

/**
 * Calculate next rank requirements
 */
export function calculateNextRankRequirements(
  input: TechCalculatorInput,
  currentQualifiedRank: TechRank
): NextRankRequirements | null {
  const currentRankIndex = TECH_RANK_REQUIREMENTS.findIndex(
    (r) => r.name === currentQualifiedRank
  );

  // If already at highest rank, no next rank
  if (currentRankIndex === TECH_RANK_REQUIREMENTS.length - 1) {
    return null;
  }

  const nextRankReq = TECH_RANK_REQUIREMENTS[currentRankIndex + 1];

  const missingPersonalQV = Math.max(0, nextRankReq.personal - input.personalQV);
  const missingTeamQV = Math.max(0, nextRankReq.group - input.teamQV);

  let missingDownline: string | null = null;
  if (nextRankReq.downline) {
    const downlineRequirements = Array.isArray(nextRankReq.downline)
      ? nextRankReq.downline
      : [nextRankReq.downline];

    const requirementStrings = downlineRequirements.map((req) => {
      const [rank, count] = Object.entries(req)[0];
      return `${count} ${rank}`;
    });

    missingDownline = requirementStrings.join(' OR ');
  }

  // Calculate progress toward next rank
  const personalProgress = nextRankReq.personal > 0
    ? (input.personalQV / nextRankReq.personal) * 100
    : 100;
  const teamProgress = nextRankReq.group > 0
    ? (input.teamQV / nextRankReq.group) * 100
    : 100;

  const progressPercentage = Math.min(100, Math.min(personalProgress, teamProgress));

  return {
    nextRank: nextRankReq.name,
    missingPersonalQV,
    missingTeamQV,
    missingDownline,
    progressPercentage,
  };
}

/**
 * Main calculator function - returns complete output
 */
export function calculateTechLadder(input: TechCalculatorInput): TechCalculatorOutput {
  // Determine qualified rank
  const qualifiedRank = calculateQualifiedRank(input);

  // Get all rank qualifications
  const allRankQualifications = calculateAllRankQualifications(input);

  // Get current rank qualification
  const currentRankQualification = allRankQualifications.find(
    (rq) => rq.rank === qualifiedRank
  )!;

  // Calculate monthly income projection
  const monthlyIncomeProjection = calculateMonthlyIncome(input, qualifiedRank);

  // Calculate next rank requirements
  const nextRankRequirements = calculateNextRankRequirements(input, qualifiedRank);

  // Get rank bonus
  const rankReq = TECH_RANK_REQUIREMENTS.find((r) => r.name === qualifiedRank)!;
  const rankBonus = rankReq.bonus / 100; // Convert from cents to dollars

  // Get override depth
  const overrideDepth = rankReq.overrideDepth;

  return {
    currentRankQualification,
    allRankQualifications,
    monthlyIncomeProjection,
    nextRankRequirements,
    rankBonus,
    overrideDepth,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
