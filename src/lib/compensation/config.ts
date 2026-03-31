// =============================================
// DUAL-LADDER COMPENSATION ENGINE - CONFIGURATION
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md
// Phase: 3 (Build New TypeScript Code)
// Agent: 3A
// =============================================

/**
 * Tech Ladder Ranks (7 ranks)
 * Order: Lowest to highest (for rank_value calculations)
 */
export const TECH_RANKS = [
  'starter',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'ruby',
  'diamond_ambassador',
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
 * - personal: personal QV required per month
 * - group: Group (team) credits required per month
 * - downline: Sponsored member rank requirements (OR conditions for Diamond Ambassador)
 * - bonus: One-time rank advancement bonus (cents)
 * - overrideDepth: Number of override levels unlocked (1-7)
 */
export interface TechRankRequirements {
  name: TechRank;
  personal: number; // personal QV/month
  group: number; // group QV (GQV)/month
  downline?: DownlineRequirement | DownlineRequirement[]; // OR conditions
  bonus: number; // One-time rank bonus (cents)
  overrideDepth: number; // 1-7 levels
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
    overrideDepth: 6, // L1-L6
  },
  {
    name: 'diamond_ambassador',
    personal: 5000,
    group: 50000,
    downline: [
      { gold: 3 }, // 3 Golds OR
      { platinum: 2 }, // 2 Platinums
    ],
    bonus: 1800000, // $18,000
    overrideDepth: 7, // L1-L7
  },
];

/**
 * Ranked Override Schedules - 7 LEVELS
 *
 * Each rank has different override percentages for L1-L7.
 * These are percentages of the OVERRIDE POOL, not the retail price.
 *
 * From spec (comp-plan-7-levels.md):
 * - L1 is ALWAYS 25% (uses enrollment tree - sponsor_id)
 * - L2-L7 use matrix tree (matrix_parent_id)
 * - Higher ranks unlock deeper levels
 * - Breakage (unpaid %) goes 100% to Apex
 */
export const RANKED_OVERRIDE_SCHEDULES: Record<
  TechRank,
  [number, number, number, number, number, number, number]
> = {
  starter: [0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // L1 only - 75% breakage
  bronze: [0.25, 0.20, 0.0, 0.0, 0.0, 0.0, 0.0], // L1-L2 - 55% breakage
  silver: [0.25, 0.20, 0.18, 0.0, 0.0, 0.0, 0.0], // L1-L3 - 37% breakage
  gold: [0.25, 0.20, 0.18, 0.15, 0.0, 0.0, 0.0], // L1-L4 - 22% breakage
  platinum: [0.25, 0.20, 0.18, 0.15, 0.10, 0.0, 0.0], // L1-L5 - 12% breakage
  ruby: [0.25, 0.20, 0.18, 0.15, 0.10, 0.07, 0.0], // L1-L6 - 5% breakage
  diamond_ambassador: [0.25, 0.20, 0.18, 0.15, 0.10, 0.07, 0.05], // L1-L7 - 0% breakage (100% paid)
};

/**
 * Get override percentage for a specific rank and level
 * @param rank - Tech rank
 * @param level - Override level (1-7)
 * @returns Percentage (0.0-0.25) or 0 if level not unlocked
 */
export function getOverridePercentage(rank: TechRank, level: number): number {
  if (level < 1 || level > 7) return 0;
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
 * "Must generate 50+ personal QV/month to earn overrides and bonuses"
 * If below 50 QV: seller commission still paid, but overrides = $0, bonuses = $0
 */
export const OVERRIDE_QUALIFICATION_MIN_CREDITS = 50;

/**
 * Grace Period for Rank Demotion
 *
 * IMPORTANT DISTINCTION:
 * - tech_rank: Can drop after grace period (for display purposes)
 * - paying_rank: Drops to highest qualified level after grace period (determines commission rates)
 * - highest_tech_rank: NEVER drops (lifetime achievement)
 */
export const PAY_LEVEL_GRACE_PERIOD_DAYS = 30; // 30 days below requirements before PAYMENT LEVEL drops

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
/**
 * WATERFALL CONFIGURATION - SINGLE SOURCE OF TRUTH
 *
 * BV (Business Volume) Calculation:
 * 1. BotMakers: 30% of retail price
 * 2. Apex: 30% of remaining (after BotMakers)
 * 3. Leadership Pool: 1.5% of remaining (after Apex)
 * 4. Bonus Pool: 3.5% of remaining (after Leadership)
 * 5. BV = Everything remaining
 *
 * Example $149 product:
 * - BotMakers: $44.70 (30% of $149)
 * - Remaining: $104.30
 * - Apex: $31.29 (30% of $104.30)
 * - Remaining: $73.01
 * - Leadership: $1.10 (1.5% of $73.01)
 * - Remaining: $71.91
 * - Bonus: $2.52 (3.5% of $71.91)
 * - BV: $69.39
 *
 * ALL commissions calculated from BV ($69.39), NOT retail price ($149)
 */
export const WATERFALL_CONFIG = {
  BOTMAKERS_FEE_PCT: 0.30, // 30% of retail price
  APEX_TAKE_PCT: 0.30, // 30% of remaining (after BotMakers)
  LEADERSHIP_POOL_PCT: 0.015, // 1.5% of remaining (after Apex)
  BONUS_POOL_PCT: 0.035, // 3.5% of remaining (after Leadership)
  SELLER_COMMISSION_PCT: 0.60, // 60% of BV
  OVERRIDE_POOL_PCT: 0.40, // 40% of BV
} as const;

/**
 * Business Center Exception - NEW 7-LEVEL SYSTEM
 *
 * From spec (comp-plan-7-levels.md):
 * Business Center $39/mo does NOT flow through standard waterfall.
 * Fixed dollar amounts:
 * - BotMakers: $11 (30% flat)
 * - Apex: $6 (flat)
 * - COGS: $3.90 (paid to BotMakers separately, from bonus pool)
 * - Rep (seller): $5 (flat)
 * - Override Pool: $13.10 ($1.75 flat per level × 7 levels)
 * - Bonus Pool: NONE
 * - Leadership Pool: NONE
 * - Credits: 39 (fixed)
 */
export const BUSINESS_CENTER_CONFIG = {
  PRICE_CENTS: 3900, // $39
  BOTMAKERS_FEE_CENTS: 1100, // $11 (30% flat)
  APEX_TAKE_CENTS: 600, // $6 (flat)
  COGS_CENTS: 390, // $3.90 (paid to BotMakers separately)
  SELLER_COMMISSION_CENTS: 500, // $5 (flat)
  OVERRIDE_POOL_CENTS: 1310, // $13.10 total override pool
  OVERRIDE_PER_LEVEL_CENTS: 175, // $1.75 per level (flat)
  BONUS_POOL_CENTS: 0, // No bonus pool
  LEADERSHIP_POOL_CENTS: 0, // No leadership pool
  CREDITS: 39, // Fixed production credits
} as const;

/**
 * Leadership Pool (1.5%) - Diamond Ambassador Members Only
 *
 * From spec (comp-plan-7-levels.md):
 * - Leadership pool is divided among Diamond Ambassador members only
 * - Based on production points (personal + group QV)
 * - Proportional share: member's points / total Diamond Ambassador points
 */
export const LEADERSHIP_POOL_ELIGIBLE_RANK: TechRank = 'diamond_ambassador';

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
 *   → ALWAYS use L1 rate (25% of override pool)
 *   → Regardless of matrix position
 *   → Regardless of rep's rank"
 *
 * enroller_id is IMMUTABLE. Set at enrollment. Never changes.
 */
export const ENROLLER_OVERRIDE_RATE = 0.25; // Always L1 (25%)

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
 * @returns Override percentages for L1-L7
 */
export async function getOverrideScheduleAsync(
  rank: TechRank
): Promise<[number, number, number, number, number, number, number]> {
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
  diamond_ambassador: 'Diamond Ambassador',
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
