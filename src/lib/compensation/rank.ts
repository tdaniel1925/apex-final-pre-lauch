// Apex Affinity Group - Rank Evaluation
// Source: 03_rep_policies.md, BUSINESS-RULES.md

import type { Rank } from './types';
import { COMP_PLAN_CONFIG, RANK_EVALUATION_ORDER, RANK_ID_MAP } from './config';

/**
 * Evaluate rep's rank based on personal BV and team BV
 *
 * CRITICAL RULES:
 * - Evaluation runs on LAST CALENDAR DAY of each month
 * - Result stored in rank_snapshots table (immutable)
 * - Snapshot governs override access for FOLLOWING month
 * - Downrank is automatic (no grace period)
 * - personal_bv = rep's own customer subscriptions only
 * - team_bv = downline only (excludes rep's own)
 * - Requires BOTH thresholds to qualify for rank
 *
 * Evaluation order (highest to lowest - first match wins):
 *   IF personal_bv < 50 → INACTIVE
 *   ELIF personal_bv >= 250 AND team_bv >= 25000 → PLATINUM
 *   ELIF personal_bv >= 200 AND team_bv >= 10000 → GOLD
 *   ELIF personal_bv >= 150 AND team_bv >= 2500  → SILVER
 *   ELIF personal_bv >= 100 AND team_bv >= 500   → BRONZE
 *   ELSE → ASSOCIATE
 *
 * @param personalBV - Rep's own customer subscriptions BV
 * @param teamBV - Downline BV (excludes rep's own)
 * @returns Evaluated rank
 */
export function evaluateRank(personalBV: number, teamBV: number): Rank {
  // CRITICAL: If personal BV < $50, always INACTIVE
  if (personalBV < COMP_PLAN_CONFIG.rank_thresholds.ASSOCIATE.personal_bv) {
    return 'INACTIVE';
  }

  // Evaluate from highest rank to lowest (first match wins)
  for (const requirement of RANK_EVALUATION_ORDER) {
    if (
      personalBV >= requirement.personalBVMin &&
      teamBV >= requirement.teamBVMin
    ) {
      return requirement.rank;
    }
  }

  // Fallback (should never reach here if RANK_EVALUATION_ORDER is correct)
  return 'ASSOCIATE';
}

/**
 * Check if rep qualifies for a specific override level
 *
 * CRITICAL: Uses PRIOR MONTH rank, not current month
 *
 * Level requirements:
 *   L1: Associate or higher (rank_id >= 0)
 *   L2: Bronze or higher (rank_id >= 1)
 *   L3: Silver or higher (rank_id >= 2)
 *   L4: Gold or higher (rank_id >= 3)
 *   L5: Platinum (rank_id >= 4)
 *   L6: Platinum + Powerline (rank_id == 4 AND team_bv >= $100K)
 *   L7: Platinum + Powerline (rank_id == 4 AND team_bv >= $100K)
 *
 * @param priorMonthRank - Rank from PRIOR month snapshot
 * @param level - Override level (1-7)
 * @param teamBV - Current team BV (for Powerline check)
 * @returns True if qualified for this level
 */
export function qualifiesForOverrideLevel(
  priorMonthRank: Rank | null,
  level: number,
  teamBV: number = 0
): boolean {
  // No prior month rank = new rep in Month 1 = treated as INACTIVE
  if (!priorMonthRank) {
    return false;
  }

  // INACTIVE never qualifies for any level
  if (priorMonthRank === 'INACTIVE') {
    return false;
  }

  const rankId = RANK_ID_MAP[priorMonthRank];

  // Levels 1-5: Standard rank requirements
  if (level <= 5) {
    const requiredRankId = level - 1;  // L1=0 (Associate), L2=1 (Bronze), etc.
    return rankId >= requiredRankId;
  }

  // Levels 6-7: Powerline (Platinum + $100K team BV)
  if (level === 6 || level === 7) {
    const isPlatinum = priorMonthRank === 'PLATINUM';
    const meetsThreshold = teamBV >= COMP_PLAN_CONFIG.powerline.threshold_bv;
    return isPlatinum && meetsThreshold;
  }

  return false;
}

/**
 * Check if Powerline is active for a rep
 *
 * Powerline requirements:
 * - Rank: Platinum
 * - Team BV: >= $100,000
 *
 * When active:
 * - Unlocks L6 and L7 override levels
 * - Changes override percentage split (standard → powerline)
 *
 * @param rank - Current rank (or prior month rank for override calculations)
 * @param teamBV - Team BV
 * @returns True if Powerline is active
 */
export function isPowerlineActive(rank: Rank, teamBV: number): boolean {
  return (
    rank === COMP_PLAN_CONFIG.powerline.required_rank &&
    teamBV >= COMP_PLAN_CONFIG.powerline.threshold_bv
  );
}

/**
 * Get rank progression (next rank and gap)
 *
 * Useful for rep dashboard "Rank Progress" screen
 *
 * @param currentRank - Current rank
 * @param personalBV - Personal BV
 * @param teamBV - Team BV
 * @returns Next rank and what's needed to achieve it
 */
export function getRankProgression(
  currentRank: Rank,
  personalBV: number,
  teamBV: number
) {
  const currentRankId = RANK_ID_MAP[currentRank];

  // Find next rank in hierarchy
  const nextRankRequirement = RANK_EVALUATION_ORDER.find(
    (req) => RANK_ID_MAP[req.rank] > currentRankId
  );

  if (!nextRankRequirement) {
    return {
      nextRank: null,
      requirements: null,
      gaps: null,
    };
  }

  const personalBVGap = Math.max(0, nextRankRequirement.personalBVMin - personalBV);
  const teamBVGap = Math.max(0, nextRankRequirement.teamBVMin - teamBV);

  return {
    nextRank: nextRankRequirement.rank,
    requirements: {
      personalBV: nextRankRequirement.personalBVMin,
      teamBV: nextRankRequirement.teamBVMin,
    },
    gaps: {
      personalBV: personalBVGap,
      teamBV: teamBVGap,
    },
    qualifies: personalBVGap === 0 && teamBVGap === 0,
  };
}

/**
 * Validate rank evaluation against test cases
 *
 * @param personalBV - Personal BV
 * @param teamBV - Team BV
 * @param expectedRank - Expected rank
 * @returns True if evaluation matches expected
 */
export function validateRankEvaluation(
  personalBV: number,
  teamBV: number,
  expectedRank: Rank
): boolean {
  const actualRank = evaluateRank(personalBV, teamBV);
  return actualRank === expectedRank;
}
