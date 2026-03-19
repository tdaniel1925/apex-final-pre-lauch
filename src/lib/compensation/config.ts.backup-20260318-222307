// Apex Affinity Group - Compensation Plan Configuration
// Source: mlm-config.json and documentation

import type { CompPlanConfig, RankRequirements } from './types';

export const COMP_PLAN_CONFIG: CompPlanConfig = {
  waterfall: {
    botmakers_fee_pct: 0.30,      // 30%
    bonus_pool_pct: 0.05,         // 5%
    apex_margin_pct: 0.30,        // 30%
    seller_commission_pct: 0.60,  // 60% of field remainder
    override_pool_pct: 0.40,      // 40% of field remainder
  },
  override_percentages: {
    standard: {
      L1: 0.30,  // 30%
      L2: 0.25,  // 25%
      L3: 0.20,  // 20%
      L4: 0.15,  // 15%
      L5: 0.10,  // 10%
    },
    powerline: {
      L1: 0.268,  // 26.8%
      L2: 0.223,  // 22.3%
      L3: 0.179,  // 17.9%
      L4: 0.134,  // 13.4%
      L5: 0.089,  // 8.9%
      L6: 0.070,  // 7.0%
      L7: 0.050,  // 5.0%
    },
  },
  rank_thresholds: {
    INACTIVE: { personal_bv: 0, team_bv: 0 },
    ASSOCIATE: { personal_bv: 50, team_bv: 0 },
    BRONZE: { personal_bv: 100, team_bv: 500 },
    SILVER: { personal_bv: 150, team_bv: 2500 },
    GOLD: { personal_bv: 200, team_bv: 10000 },
    PLATINUM: { personal_bv: 250, team_bv: 25000 },
  },
  bonuses: {
    cab: {
      amount: 50,
      retention_days: 60,
      monthly_cap: 20,
    },
    gold_accelerator: 3467,
    infinity_bonus: {
      monthly_amount: 500,
      required_consecutive_platinum_days: 90,
      second_org_bv_threshold: 2500,
    },
  },
  powerline: {
    threshold_bv: 100000,
    required_rank: 'PLATINUM',
  },
  minimum_payout: 25,
};

// Rank access requirements for override levels
export const OVERRIDE_LEVEL_REQUIREMENTS: Record<number, number> = {
  1: 0,  // Associate (rank_id 0)
  2: 1,  // Bronze (rank_id 1)
  3: 2,  // Silver (rank_id 2)
  4: 3,  // Gold (rank_id 3)
  5: 4,  // Platinum (rank_id 4)
  6: 4,  // Platinum + Powerline (rank_id 4, checked separately)
  7: 4,  // Platinum + Powerline (rank_id 4, checked separately)
};

export const RANK_ID_MAP: Record<string, number> = {
  INACTIVE: -1,
  ASSOCIATE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
};

// Product pricing (member prices for BV calculation)
export const PRODUCT_PRICES: Record<string, { member: number; retail: number; bv: number }> = {
  PULSEGUARD: { member: 59, retail: 79, bv: 59 },
  PULSEFLOW: { member: 109, retail: 149, bv: 109 },
  PULSEDRIVE: { member: 219, retail: 299, bv: 219 },
  PULSECOMMAND: { member: 349, retail: 469, bv: 349 },
  SMARTLOCK: { member: 95, retail: 135, bv: 95 },
  BIZCENTER: { member: 39, retail: 39, bv: 39 },
};

// Business Center flat split
export const BIZCENTER_SPLIT = {
  seller: 10,   // Rep buying for themselves
  enroller: 8,  // Enroller referral commission
};

// Rounding helper
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// FLOOR rounding (for BotMakers and Apex margins)
export function floor2(value: number): number {
  return Math.floor(value * 100) / 100;
}

// Rank evaluation order (highest to lowest)
export const RANK_EVALUATION_ORDER: RankRequirements[] = [
  { rank: 'PLATINUM', personalBVMin: 250, teamBVMin: 25000 },
  { rank: 'GOLD', personalBVMin: 200, teamBVMin: 10000 },
  { rank: 'SILVER', personalBVMin: 150, teamBVMin: 2500 },
  { rank: 'BRONZE', personalBVMin: 100, teamBVMin: 500 },
  { rank: 'ASSOCIATE', personalBVMin: 50, teamBVMin: 0 },
  { rank: 'INACTIVE', personalBVMin: 0, teamBVMin: 0 },
];
