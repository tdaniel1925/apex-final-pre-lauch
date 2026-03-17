// =============================================
// DUAL-LADDER COMPENSATION ENGINE - CONFIGURATION
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md
// Phase: 3 (Build New TypeScript Code)
// Agent: 3A
// =============================================

/**
 * Tech Ladder Ranks (9 ranks)
 * Order: Lowest to highest (for rank_value calculations)
 */
export const TECH_RANKS = [
  'starter',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'ruby',
  'diamond',
  'crown',
  'elite',
] as const;

export type TechRank = (typeof TECH_RANKS)[number];

/**
 * Insurance Ladder Ranks (7 ranks)
 * Order: Lowest to highest
 */
export const INSURANCE_RANKS = [
  'inactive',
  'associate',
  'manager',
  'director',
  'senior_director',
  'executive_director',
  'mga',
] as const;

export type InsuranceRank = (typeof INSURANCE_RANKS)[number];

/**
 * Tech Rank Requirements
 *
 * From spec:
 * - personal: Personal credits required per month
 * - group: Group (team) credits required per month
 * - downline: Sponsored member rank requirements (OR conditions for Diamond/Elite)
 * - bonus: One-time rank advancement bonus (cents)
 * - overrideDepth: Number of override levels unlocked (1-5)
 */
export interface TechRankRequirements {
  name: TechRank;
  personal: number; // Personal credits/month
  group: number; // Group credits/month
  downline?: DownlineRequirement | DownlineRequirement[]; // OR conditions
  bonus: number; // One-time rank bonus (cents)
  overrideDepth: number; // 1-5 levels
}

export interface DownlineRequirement {
  [rank: string]: number; // e.g., { bronze: 1 } = need 1 Bronze sponsored member
}

export const TECH_RANK_REQUIREMENTS: TechRankRequirements[] = [
  {
    name: 'starter',
    personal: 0,
    group: 0,
    downline: undefined,
    bonus: 0, // No bonus for starter
    overrideDepth: 1, // L1 only
  },
  {
    name: 'bronze',
    personal: 150,
    group: 300,
    downline: undefined,
    bonus: 25000, // $250
    overrideDepth: 2, // L1-L2
  },
  {
    name: 'silver',
    personal: 500,
    group: 1500,
    downline: undefined,
    bonus: 100000, // $1,000
    overrideDepth: 3, // L1-L3
  },
  {
    name: 'gold',
    personal: 1200,
    group: 5000,
    downline: { bronze: 1 }, // 1 Bronze sponsored
    bonus: 300000, // $3,000
    overrideDepth: 4, // L1-L4
  },
  {
    name: 'platinum',
    personal: 2500,
    group: 15000,
    downline: { silver: 2 }, // 2 Silvers sponsored
    bonus: 750000, // $7,500
    overrideDepth: 5, // L1-L5
  },
  {
    name: 'ruby',
    personal: 4000,
    group: 30000,
    downline: { gold: 2 }, // 2 Golds sponsored
    bonus: 1200000, // $12,000
    overrideDepth: 5, // L1-L5
  },
  {
    name: 'diamond',
    personal: 5000,
    group: 50000,
    downline: [
      { gold: 3 }, // 3 Golds OR
      { platinum: 2 }, // 2 Platinums
    ],
    bonus: 1800000, // $18,000
    overrideDepth: 5, // L1-L5
  },
  {
    name: 'crown',
    personal: 6000,
    group: 75000,
    downline: { platinum: 2, gold: 1 }, // 2 Plat + 1 Gold
    bonus: 2200000, // $22,000
    overrideDepth: 5, // L1-L5
  },
  {
    name: 'elite',
    personal: 8000,
    group: 120000,
    downline: [
      { platinum: 3 }, // 3 Platinums OR
      { diamond: 2 }, // 2 Diamonds
    ],
    bonus: 3000000, // $30,000
    overrideDepth: 5, // L1-L5 + Leadership Pool
  },
];

/**
 * Ranked Override Schedules
 *
 * Each rank has different override percentages for L1-L5.
 * These are percentages of the OVERRIDE POOL, not the retail price.
 *
 * From spec:
 * - L1 is ALWAYS 30% for all ranks (Enroller Override Rule)
 * - Higher ranks unlock deeper levels with higher percentages
 */
export const RANKED_OVERRIDE_SCHEDULES: Record<
  TechRank,
  [number, number, number, number, number]
> = {
  starter: [0.30, 0.0, 0.0, 0.0, 0.0], // L1 only
  bronze: [0.30, 0.05, 0.0, 0.0, 0.0], // L1-L2
  silver: [0.30, 0.10, 0.05, 0.0, 0.0], // L1-L3
  gold: [0.30, 0.15, 0.10, 0.05, 0.0], // L1-L4
  platinum: [0.30, 0.18, 0.12, 0.08, 0.03], // L1-L5
  ruby: [0.30, 0.20, 0.15, 0.10, 0.05], // L1-L5 (higher %s)
  diamond: [0.30, 0.22, 0.18, 0.12, 0.08], // L1-L5 (higher %s)
  crown: [0.30, 0.25, 0.20, 0.15, 0.10], // L1-L5 (highest non-Elite)
  elite: [0.30, 0.25, 0.20, 0.15, 0.10], // L1-L5 (same as Crown)
};

/**
 * Get override percentage for a specific rank and level
 * @param rank - Tech rank
 * @param level - Override level (1-5)
 * @returns Percentage (0.0-0.30) or 0 if level not unlocked
 */
export function getOverridePercentage(rank: TechRank, level: number): number {
  if (level < 1 || level > 5) return 0;
  return RANKED_OVERRIDE_SCHEDULES[rank][level - 1];
}

/**
 * Get rank value (for comparisons)
 * @param rank - Tech rank
 * @returns Numeric value (0-8)
 */
export function getRankValue(rank: TechRank): number {
  return TECH_RANKS.indexOf(rank);
}

/**
 * Override Qualification - 50 Credit Minimum
 *
 * From spec:
 * "Must generate 50+ personal credits/month to earn overrides and bonuses"
 * If below 50 credits: seller commission still paid, but overrides = $0, bonuses = $0
 */
export const OVERRIDE_QUALIFICATION_MIN_CREDITS = 50;

/**
 * Grace Periods and Rank Locks
 */
export const RANK_GRACE_PERIOD_MONTHS = 2; // 2 months below requirements before demotion
export const NEW_REP_RANK_LOCK_MONTHS = 6; // 6-month lock on rank for new reps

/**
 * Waterfall Percentages
 *
 * From spec:
 * 1. BotMakers takes 30% of retail price
 * 2. Apex takes 30% of adjusted gross (after BotMakers) = 21% of retail
 * 3. Bonus Pool: 5% of remainder (after BotMakers + Apex)
 * 4. Leadership Pool: 1.5% of remainder (after BotMakers + Apex)
 * 5. Seller gets 60% of field compensation
 * 6. Override pool gets 40% of field compensation
 *
 * Calculation:
 * - 100% retail
 * - BotMakers: 30% → leaves 70%
 * - Apex: 30% of 70% = 21% → leaves 49%
 * - Bonus Pool: 5% of 49% = 2.45% → leaves 46.55%
 * - Leadership Pool: 1.5% of 49% = 0.735% → leaves 45.815%
 * - Direct Commission: 60% of 45.815% = 27.489%
 * - Override Pool: 40% of 45.815% = 18.326%
 */
export const WATERFALL_CONFIG = {
  BOTMAKERS_FEE_PCT: 0.30, // 30% of retail price
  APEX_TAKE_PCT: 0.30, // 30% of adjusted gross (after BotMakers)
  BONUS_POOL_PCT: 0.05, // 5% of remainder (after BotMakers + Apex)
  LEADERSHIP_POOL_PCT: 0.015, // 1.5% of remainder (after BotMakers + Apex)
  SELLER_COMMISSION_PCT: 0.60, // 60% of field compensation
  OVERRIDE_POOL_PCT: 0.40, // 40% of field compensation
} as const;

/**
 * Business Center Exception
 *
 * From spec:
 * Business Center $39/mo does NOT flow through standard waterfall.
 * Fixed dollar amounts:
 * - BotMakers: $11
 * - Apex: $8
 * - Rep (seller): $10
 * - Sponsor: $8
 * - Costs: $2
 * - Override Pool: NONE
 * - Bonus Pool: NONE
 * - Leadership Pool: NONE
 * - Credits: 39 (fixed)
 */
export const BUSINESS_CENTER_CONFIG = {
  PRICE_CENTS: 3900, // $39
  BOTMAKERS_FEE_CENTS: 1100, // $11
  APEX_TAKE_CENTS: 800, // $8
  SELLER_COMMISSION_CENTS: 1000, // $10
  SPONSOR_BONUS_CENTS: 800, // $8
  COSTS_CENTS: 200, // $2
  OVERRIDE_POOL_CENTS: 0, // No override pool
  BONUS_POOL_CENTS: 0, // No bonus pool
  LEADERSHIP_POOL_CENTS: 0, // No leadership pool
  CREDITS: 39, // Fixed production credits
} as const;

/**
 * Leadership Pool (1.5%) - Elite Members Only
 *
 * From spec:
 * - Leadership pool is divided among Elite members only
 * - Based on production points (personal + team credits)
 * - Proportional share: member's points / total Elite points
 */
export const LEADERSHIP_POOL_ELIGIBLE_RANK: TechRank = 'elite';

/**
 * Bonus Pool (3.5%) - Rank Bonus Earners
 *
 * From spec:
 * - Bonus pool is divided EQUALLY among all members who earned rank bonuses in the period
 * - Equal share: total pool / number of qualified members
 */
export const BONUS_POOL_DISTRIBUTION_METHOD = 'equal_share' as const;

/**
 * Product Types
 */
export type ProductType = 'standard' | 'business_center';

/**
 * Enroller Override Rule
 *
 * From spec:
 * "CRITICAL RULE: IF org_member.enroller_id == rep.member_id:
 *   → ALWAYS use L1 rate (30% of override pool)
 *   → Regardless of matrix position
 *   → Regardless of rep's rank"
 *
 * enroller_id is IMMUTABLE. Set at enrollment. Never changes.
 */
export const ENROLLER_OVERRIDE_RATE = 0.30; // Always L1 (30%)

/**
 * Insurance Cross-Credit
 *
 * From spec:
 * - 0.5% of insurance ladder credits cross-credited to tech ladder
 * - Bill's % from tech ladder credited to insurance ladder (configurable per member)
 */
export const INSURANCE_TO_TECH_CROSSCREDIT_PCT = 0.005; // 0.5%

/**
 * Commission Run Settings
 */
export const COMMISSION_RUN_CONFIG = {
  // Promotions take effect next month
  PROMOTION_EFFECTIVE_DELAY_MONTHS: 1,
  // Rank bonuses paid once per rank per lifetime
  RANK_BONUS_ONE_TIME_ONLY: true,
} as const;

// =============================================
// ASYNC WRAPPER FUNCTIONS (Future Database-Driven)
// =============================================
// These functions provide a migration path to database-driven config
// Currently return hardcoded values, but can be swapped to DB queries
// Use these in new code for forward compatibility
// =============================================

/**
 * Get tech ranks (async for future DB loading)
 * @returns Array of tech ranks
 */
export async function getTechRanksAsync(): Promise<readonly TechRank[]> {
  // FUTURE: Load from database via config-loader
  return TECH_RANKS;
}

/**
 * Get tech rank requirements (async for future DB loading)
 * @returns Array of rank requirements
 */
export async function getTechRankRequirementsAsync(): Promise<TechRankRequirements[]> {
  // FUTURE: Load from database via config-loader
  return TECH_RANK_REQUIREMENTS;
}

/**
 * Get override schedule for a specific rank (async for future DB loading)
 * @param rank - Tech rank
 * @returns Override percentages for L1-L5
 */
export async function getOverrideScheduleAsync(
  rank: TechRank
): Promise<[number, number, number, number, number]> {
  // FUTURE: Load from database via config-loader
  return RANKED_OVERRIDE_SCHEDULES[rank];
}

/**
 * Get waterfall configuration (async for future DB loading)
 * @param productType - Product type ('standard' or 'business_center')
 * @returns Waterfall percentages or Business Center fixed amounts
 */
export async function getWaterfallConfigAsync(productType: ProductType = 'standard') {
  // FUTURE: Load from database via config-loader
  if (productType === 'business_center') {
    return BUSINESS_CENTER_CONFIG;
  }
  return WATERFALL_CONFIG;
}

/**
 * Type Guards
 */
export function isTechRank(value: string): value is TechRank {
  return TECH_RANKS.includes(value as TechRank);
}

export function isInsuranceRank(value: string): value is InsuranceRank {
  return INSURANCE_RANKS.includes(value as InsuranceRank);
}

/**
 * Rank Display Names
 */
export const TECH_RANK_DISPLAY_NAMES: Record<TechRank, string> = {
  starter: 'Starter',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  ruby: 'Ruby',
  diamond: 'Diamond',
  crown: 'Crown',
  elite: 'Elite',
};

export const INSURANCE_RANK_DISPLAY_NAMES: Record<InsuranceRank, string> = {
  inactive: 'Inactive',
  associate: 'Associate',
  manager: 'Manager',
  director: 'Director',
  senior_director: 'Senior Director',
  executive_director: 'Executive Director',
  mga: 'MGA',
};
