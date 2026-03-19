// =============================================
// DUAL-LADDER COMPENSATION ENGINE - CONFIGURATION
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md
// Updated: March 19, 2026
// =============================================

// ============================================================================
// TECH LADDER - 9 RANKS
// ============================================================================

export type TechRank =
  | 'starter'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'ruby'
  | 'diamond'
  | 'crown'
  | 'elite';

export const TECH_RANKS: readonly TechRank[] = [
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

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export type ProductType = 'standard' | 'business_center';

// ============================================================================
// DOWNLINE REQUIREMENTS
// ============================================================================

export interface DownlineRequirement {
  [rank: string]: number; // e.g., { bronze: 1, silver: 2 }
}

// ============================================================================
// TECH RANK REQUIREMENTS
// ============================================================================
// From spec lines 165-176

export interface TechRankRequirements {
  name: TechRank;
  personal: number; // Personal credits/month
  group: number; // Group credits/month
  downline?: DownlineRequirement | DownlineRequirement[]; // Supports OR conditions
  bonus: number; // Rank bonus in cents
  overrideDepth: number; // 1-5
}

export const TECH_RANK_REQUIREMENTS: TechRankRequirements[] = [
  {
    name: 'starter',
    personal: 0,
    group: 0,
    bonus: 0,
    overrideDepth: 1,
  },
  {
    name: 'bronze',
    personal: 150,
    group: 300,
    bonus: 25000, // $250
    overrideDepth: 2,
  },
  {
    name: 'silver',
    personal: 500,
    group: 1500,
    bonus: 100000, // $1,000
    overrideDepth: 3,
  },
  {
    name: 'gold',
    personal: 1200,
    group: 5000,
    downline: { bronze: 1 }, // 1 Bronze (sponsored)
    bonus: 300000, // $3,000
    overrideDepth: 4,
  },
  {
    name: 'platinum',
    personal: 2500,
    group: 15000,
    downline: { silver: 2 }, // 2 Silvers (sponsored)
    bonus: 750000, // $7,500
    overrideDepth: 5,
  },
  {
    name: 'ruby',
    personal: 4000,
    group: 30000,
    downline: { gold: 2 }, // 2 Golds (sponsored)
    bonus: 1200000, // $12,000
    overrideDepth: 5,
  },
  {
    name: 'diamond',
    personal: 5000,
    group: 50000,
    downline: [{ gold: 3 }, { platinum: 2 }], // 3 Golds OR 2 Platinums
    bonus: 1800000, // $18,000
    overrideDepth: 5,
  },
  {
    name: 'crown',
    personal: 6000,
    group: 75000,
    downline: { platinum: 2, gold: 1 }, // 2 Plat + 1 Gold
    bonus: 2200000, // $22,000
    overrideDepth: 5,
  },
  {
    name: 'elite',
    personal: 8000,
    group: 120000,
    downline: [{ platinum: 3 }, { diamond: 2 }], // 3 Plat OR 2 Diamonds
    bonus: 3000000, // $30,000
    overrideDepth: 5,
  },
];

// ============================================================================
// RANKED OVERRIDE SCHEDULES
// ============================================================================
// From spec lines 259-270
// % of Override Pool (not % of price)

export const RANKED_OVERRIDE_SCHEDULES: Record<
  TechRank,
  [number, number, number, number, number]
> = {
  starter: [0.30, 0.0, 0.0, 0.0, 0.0],
  bronze: [0.30, 0.05, 0.0, 0.0, 0.0],
  silver: [0.30, 0.10, 0.05, 0.0, 0.0],
  gold: [0.30, 0.15, 0.10, 0.05, 0.0],
  platinum: [0.30, 0.18, 0.12, 0.08, 0.03],
  ruby: [0.30, 0.20, 0.15, 0.10, 0.05],
  diamond: [0.30, 0.22, 0.18, 0.12, 0.08],
  crown: [0.30, 0.25, 0.20, 0.15, 0.10],
  elite: [0.30, 0.25, 0.20, 0.15, 0.10],
};

// ============================================================================
// WATERFALL CONFIGURATION
// ============================================================================
// From spec lines 9-23

export const WATERFALL_CONFIG = {
  BOTMAKERS_FEE_PCT: 0.30, // 30% of price
  APEX_TAKE_PCT: 0.30, // 30% of adjusted gross
  BONUS_POOL_PCT: 0.035, // 3.5% of remainder
  LEADERSHIP_POOL_PCT: 0.015, // 1.5% of remainder
  SELLER_COMMISSION_PCT: 0.60, // 60% of commission pool
  OVERRIDE_POOL_PCT: 0.40, // 40% of commission pool
};

// ============================================================================
// BUSINESS CENTER CONFIGURATION
// ============================================================================
// From spec lines 27-39

export const BUSINESS_CENTER_CONFIG = {
  PRICE_CENTS: 3900, // $39.00
  BOTMAKERS_FEE_CENTS: 1100, // $11.00
  APEX_TAKE_CENTS: 800, // $8.00
  SELLER_COMMISSION_CENTS: 1000, // $10.00
  SPONSOR_BONUS_CENTS: 800, // $8.00
  COSTS_CENTS: 200, // $2.00
  OVERRIDE_POOL_CENTS: 0, // No override pool
  BONUS_POOL_CENTS: 0, // No bonus pool
  LEADERSHIP_POOL_CENTS: 0, // No leadership pool
  CREDITS: 39, // Fixed credits
};

// ============================================================================
// COMPENSATION CONSTANTS
// ============================================================================

export const OVERRIDE_QUALIFICATION_MIN_CREDITS = 50;
export const RANK_GRACE_PERIOD_MONTHS = 2;
export const NEW_REP_RANK_LOCK_MONTHS = 6;
export const LEADERSHIP_POOL_ELIGIBLE_RANK: TechRank = 'elite';
export const BONUS_POOL_DISTRIBUTION_METHOD = 'equal_share' as const;
export const ENROLLER_OVERRIDE_RATE = 0.30;
export const INSURANCE_TO_TECH_CROSSCREDIT_PCT = 0.0; // Removed per spec line 388

// ============================================================================
// COMMISSION RUN CONFIGURATION
// ============================================================================

export const COMMISSION_RUN_CONFIG = {
  PROMOTION_EFFECTIVE_DELAY_MONTHS: 1,
  RANK_BONUS_ONE_TIME_ONLY: true,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get override percentage for a specific rank and level
 * @param rank Tech rank
 * @param level Override level (1-5)
 * @returns Percentage (0.0-0.30) or 0 if level not unlocked
 */
export function getOverridePercentage(rank: TechRank, level: number): number {
  if (level < 1 || level > 5) return 0;
  return RANKED_OVERRIDE_SCHEDULES[rank][level - 1];
}

/**
 * Get rank value for comparisons
 * @param rank Tech rank
 * @returns Numeric value (0 = starter, 8 = elite)
 */
export function getRankValue(rank: TechRank): number {
  return TECH_RANKS.indexOf(rank);
}

// ============================================================================
// LEGACY TYPES (for backwards compatibility)
// ============================================================================
// Keep old types for existing code that hasn't been updated yet

export type Rank = 'INACTIVE' | 'ASSOCIATE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export const RANK_ID_MAP: Record<string, number> = {
  INACTIVE: -1,
  ASSOCIATE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
};

// ============================================================================
// PRODUCT PRICING (for reference)
// ============================================================================

export const PRODUCT_PRICES: Record<
  string,
  { member: number; retail: number; bv: number }
> = {
  PULSEGUARD: { member: 59, retail: 79, bv: 59 },
  PULSEFLOW: { member: 109, retail: 149, bv: 109 },
  PULSEDRIVE: { member: 219, retail: 299, bv: 219 },
  PULSECOMMAND: { member: 349, retail: 469, bv: 349 },
  SMARTLOCK: { member: 95, retail: 135, bv: 95 },
  BIZCENTER: { member: 39, retail: 39, bv: 39 },
};

// ============================================================================
// ROUNDING HELPERS
// ============================================================================

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function floor2(value: number): number {
  return Math.floor(value * 100) / 100;
}
