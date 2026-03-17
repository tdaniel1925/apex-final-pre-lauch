// Apex Affinity Group - Waterfall Calculation
// Source: 02_commission_examples.md

import type { WaterfallResult, BizCenterSplit } from './types';
import { COMP_PLAN_CONFIG, BIZCENTER_SPLIT, round2, floor2 } from './config';

/**
 * Calculate commission waterfall for a subscription
 *
 * CRITICAL ROUNDING RULES:
 * - FLOOR for BotMakers fee and Apex margin (their take is floored, extra stays in field)
 * - ROUND for all field amounts (seller, override pool, bonuses)
 *
 * Formula (from 02_commission_examples.md):
 * 1. botmakers_fee = FLOOR(gross × 0.30)
 * 2. adj_gross = gross - botmakers_fee
 * 3. bonus_pool = ROUND(adj_gross × 0.05, 2)
 * 4. after_pool = adj_gross - bonus_pool
 * 5. apex_margin = FLOOR(after_pool × 0.30)
 * 6. field_remainder = after_pool - apex_margin
 * 7. seller_commission = ROUND(field_remainder × 0.60, 2)
 * 8. override_pool = ROUND(field_remainder × 0.40, 2)
 *
 * @param grossPrice - Actual price paid by customer
 * @param powerlineActive - Whether Powerline is active (changes override split)
 * @returns Complete waterfall breakdown
 */
export function calculateWaterfall(
  grossPrice: number,
  powerlineActive: boolean = false
): WaterfallResult {
  const { waterfall, override_percentages } = COMP_PLAN_CONFIG;

  // Step 1: BotMakers fee (FLOOR)
  const botmakersFee = floor2(grossPrice * waterfall.botmakers_fee_pct);

  // Step 2: Adjusted gross
  const adjGross = grossPrice - botmakersFee;

  // Step 3: Bonus pool contribution (ROUND)
  const bonusPoolContribution = round2(adjGross * waterfall.bonus_pool_pct);

  // Step 4: After pool deduction
  const afterPool = adjGross - bonusPoolContribution;

  // Step 5: Apex margin (FLOOR)
  const apexMargin = floor2(afterPool * waterfall.apex_margin_pct);

  // Step 6: Field remainder (what's left for the field)
  const fieldRemainder = afterPool - apexMargin;

  // Step 7: Seller commission (ROUND)
  const sellerCommission = round2(fieldRemainder * waterfall.seller_commission_pct);

  // Step 8: Override pool (ROUND)
  const overridePool = round2(fieldRemainder * waterfall.override_pool_pct);

  // Step 9: Split override pool across levels (Powerline or Standard)
  const percentages = powerlineActive ? override_percentages.powerline : override_percentages.standard;

  const overrideLevels = {
    L1: round2(overridePool * percentages.L1),
    L2: round2(overridePool * percentages.L2),
    L3: round2(overridePool * percentages.L3),
    L4: round2(overridePool * percentages.L4),
    L5: round2(overridePool * percentages.L5),
    ...(powerlineActive && {
      L6: round2(overridePool * (percentages as any).L6),
      L7: round2(overridePool * (percentages as any).L7),
    }),
  };

  return {
    grossPrice,
    botmakersFee,
    bonusPoolContribution,
    apexMargin,
    fieldRemainder,
    sellerCommission,
    overridePool,
    overrideLevels,
  };
}

/**
 * Calculate Business Center flat split (no waterfall)
 *
 * BizCenter bypasses the waterfall entirely and uses a fixed split:
 * - Seller (buyer): $10
 * - Enroller: $8
 * - NO L2-L7 overrides
 * - Generates $0 CAB
 *
 * @returns Fixed split amounts
 */
export function calculateBizCenterSplit(): BizCenterSplit {
  return {
    sellerAmount: BIZCENTER_SPLIT.seller,
    enrollerAmount: BIZCENTER_SPLIT.enroller,
  };
}

/**
 * Validate waterfall calculation against expected values
 * Used for stress test validation
 *
 * @param result - Waterfall result to validate
 * @param expected - Expected values
 * @param tolerance - Acceptable variance (default $0.01)
 * @returns Validation errors (empty array if valid)
 */
export function validateWaterfall(
  result: WaterfallResult,
  expected: Partial<WaterfallResult>,
  tolerance: number = 0.01
): string[] {
  const errors: string[] = [];

  if (expected.sellerCommission !== undefined) {
    const diff = Math.abs(result.sellerCommission - expected.sellerCommission);
    if (diff > tolerance) {
      errors.push(`Seller commission ${result.sellerCommission} differs from expected ${expected.sellerCommission} by $${diff.toFixed(2)}`);
    }
  }

  if (expected.overridePool !== undefined) {
    const diff = Math.abs(result.overridePool - expected.overridePool);
    if (diff > tolerance) {
      errors.push(`Override pool ${result.overridePool} differs from expected ${expected.overridePool} by $${diff.toFixed(2)}`);
    }
  }

  if (expected.botmakersFee !== undefined) {
    const diff = Math.abs(result.botmakersFee - expected.botmakersFee);
    if (diff > tolerance) {
      errors.push(`BotMakers fee ${result.botmakersFee} differs from expected ${expected.botmakersFee} by $${diff.toFixed(2)}`);
    }
  }

  if (expected.apexMargin !== undefined) {
    const diff = Math.abs(result.apexMargin - expected.apexMargin);
    if (diff > tolerance) {
      errors.push(`Apex margin ${result.apexMargin} differs from expected ${expected.apexMargin} by $${diff.toFixed(2)}`);
    }
  }

  return errors;
}

/**
 * Calculate effective margin percentages
 * Used for stress test validation (Apex margin sustainability check)
 *
 * @param result - Waterfall result
 * @returns Margin percentages
 */
export function calculateMargins(result: WaterfallResult) {
  const totalRevenue = result.grossPrice;

  return {
    botmakers_pct: (result.botmakersFee / totalRevenue) * 100,
    apex_pct: (result.apexMargin / totalRevenue) * 100,
    field_pct: (result.fieldRemainder / totalRevenue) * 100,
    bonus_pool_pct: (result.bonusPoolContribution / totalRevenue) * 100,
  };
}
