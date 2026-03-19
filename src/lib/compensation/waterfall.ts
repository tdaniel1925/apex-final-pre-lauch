// =============================================
// DUAL-LADDER COMPENSATION ENGINE - WATERFALL
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md lines 9-77
// Updated: March 19, 2026
// =============================================

import { ProductType, WATERFALL_CONFIG, BUSINESS_CENTER_CONFIG } from './config';

/**
 * Waterfall Result (in CENTS - integer math)
 *
 * CRITICAL: All amounts in CENTS, not dollars
 * This prevents floating point rounding errors
 */
export interface WaterfallResult {
  priceCents: number;
  productType: ProductType;

  // Waterfall steps (all in cents)
  botmakersFeeCents: number;
  adjustedGrossCents: number;
  apexTakeCents: number;
  remainderCents: number;
  bonusPoolCents: number; // 3.5% of remainder
  leadershipPoolCents: number; // 1.5% of remainder
  commissionPoolCents: number;
  sellerCommissionCents: number;
  overridePoolCents: number;

  effectivePercentage: number; // Seller commission / price
}

/**
 * Calculate Waterfall for Standard or Business Center Products
 *
 * From spec lines 11-23:
 *
 * STEP 1: Customer pays PRICE
 * STEP 2: BotMakers takes 30% = ADJUSTED GROSS
 * STEP 3: Apex takes 30% of Adjusted Gross = REMAINDER
 * STEP 4: 3.5% of Remainder → BONUS POOL
 * STEP 5: 1.5% of Remainder → LEADERSHIP POOL
 *         = COMMISSION POOL (Remainder - 3.5% - 1.5%)
 * STEP 6: Seller gets 60% of Commission Pool (~27.9% effective)
 * STEP 7: Override Pool gets 40% of Commission Pool
 *
 * @param priceCents - Price in cents (e.g., 7900 = $79.00)
 * @param productType - 'standard' or 'business_center'
 * @returns Complete waterfall breakdown in cents
 */
export function calculateWaterfall(
  priceCents: number,
  productType: ProductType = 'standard'
): WaterfallResult {
  // Business Center uses fixed split (spec lines 27-39)
  if (productType === 'business_center') {
    return {
      priceCents: BUSINESS_CENTER_CONFIG.PRICE_CENTS,
      productType: 'business_center',
      botmakersFeeCents: BUSINESS_CENTER_CONFIG.BOTMAKERS_FEE_CENTS,
      adjustedGrossCents: 0,
      apexTakeCents: BUSINESS_CENTER_CONFIG.APEX_TAKE_CENTS,
      remainderCents: 0,
      bonusPoolCents: 0,
      leadershipPoolCents: 0,
      commissionPoolCents: 0,
      sellerCommissionCents: BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS,
      overridePoolCents: 0,
      effectivePercentage: (BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS / BUSINESS_CENTER_CONFIG.PRICE_CENTS) * 100,
    };
  }

  // Standard waterfall
  // Step 1: BotMakers fee (30%)
  const botmakersFeeCents = Math.round(priceCents * WATERFALL_CONFIG.BOTMAKERS_FEE_PCT);

  // Step 2: Adjusted gross
  const adjustedGrossCents = priceCents - botmakersFeeCents;

  // Step 3: Apex take (30% of adjusted gross)
  const apexTakeCents = Math.round(adjustedGrossCents * WATERFALL_CONFIG.APEX_TAKE_PCT);

  // Step 4: Remainder
  const remainderCents = adjustedGrossCents - apexTakeCents;

  // Step 5: Bonus pool (3.5% of remainder)
  const bonusPoolCents = Math.round(remainderCents * WATERFALL_CONFIG.BONUS_POOL_PCT);

  // Step 6: Leadership pool (1.5% of remainder)
  const leadershipPoolCents = Math.round(remainderCents * WATERFALL_CONFIG.LEADERSHIP_POOL_PCT);

  // Step 7: Commission pool (what's left)
  const commissionPoolCents = remainderCents - bonusPoolCents - leadershipPoolCents;

  // Step 8: Seller commission (60% of commission pool)
  const sellerCommissionCents = Math.round(commissionPoolCents * WATERFALL_CONFIG.SELLER_COMMISSION_PCT);

  // Step 9: Override pool (40% of commission pool)
  const overridePoolCents = Math.round(commissionPoolCents * WATERFALL_CONFIG.OVERRIDE_POOL_PCT);

  // Effective percentage
  const effectivePercentage = (sellerCommissionCents / priceCents) * 100;

  return {
    priceCents,
    productType: 'standard',
    botmakersFeeCents,
    adjustedGrossCents,
    apexTakeCents,
    remainderCents,
    bonusPoolCents,
    leadershipPoolCents,
    commissionPoolCents,
    sellerCommissionCents,
    overridePoolCents,
    effectivePercentage,
  };
}

/**
 * Get Business Center Sponsor Bonus
 * Returns $8 flat bonus for BC sponsor (in cents)
 */
export function getBusinessCenterSponsorBonus(): number {
  return BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS;
}

/**
 * Validate Waterfall Calculation
 * Ensures all amounts add up correctly
 */
export interface WaterfallValidation {
  valid: boolean;
  errors: string[];
}

export function validateWaterfall(result: WaterfallResult): WaterfallValidation {
  const errors: string[] = [];

  if (result.productType === 'business_center') {
    // BC: Fixed amounts should add up to $39.00
    const total =
      result.botmakersFeeCents +
      result.apexTakeCents +
      result.sellerCommissionCents +
      BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS +
      BUSINESS_CENTER_CONFIG.COSTS_CENTS;
    if (total !== BUSINESS_CENTER_CONFIG.PRICE_CENTS) {
      errors.push(`BC split doesn't add up: ${total} !== ${BUSINESS_CENTER_CONFIG.PRICE_CENTS}`);
    }
    return { valid: errors.length === 0, errors };
  }

  // Standard product validation
  // Check: price - botmakers = adjusted gross
  if (result.priceCents - result.botmakersFeeCents !== result.adjustedGrossCents) {
    errors.push('Adjusted gross calculation error');
  }

  // Check: adjusted gross - apex take = remainder
  if (result.adjustedGrossCents - result.apexTakeCents !== result.remainderCents) {
    errors.push('Remainder calculation error');
  }

  // Check: commission pool + bonus pool + leadership pool = remainder
  const poolSum = result.commissionPoolCents + result.bonusPoolCents + result.leadershipPoolCents;
  if (Math.abs(poolSum - result.remainderCents) > 1) {
    // Allow 1 cent rounding
    errors.push(`Pool sum doesn't match remainder: ${poolSum} !== ${result.remainderCents}`);
  }

  // Check: seller + override = commission pool
  const commissionSum = result.sellerCommissionCents + result.overridePoolCents;
  if (Math.abs(commissionSum - result.commissionPoolCents) > 1) {
    // Allow 1 cent rounding
    errors.push(`Commission split doesn't add up: ${commissionSum} !== ${result.commissionPoolCents}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Aggregate Pools from Multiple Sales
 * Used for monthly pool calculations
 */
export interface PoolAggregation {
  saleCount: number;
  totalSalesCents: number;
  totalBonusPoolCents: number;
  totalLeadershipPoolCents: number;
}

export function aggregatePools(results: WaterfallResult[]): PoolAggregation {
  return results.reduce(
    (agg, result) => ({
      saleCount: agg.saleCount + 1,
      totalSalesCents: agg.totalSalesCents + result.priceCents,
      totalBonusPoolCents: agg.totalBonusPoolCents + result.bonusPoolCents,
      totalLeadershipPoolCents: agg.totalLeadershipPoolCents + result.leadershipPoolCents,
    }),
    {
      saleCount: 0,
      totalSalesCents: 0,
      totalBonusPoolCents: 0,
      totalLeadershipPoolCents: 0,
    }
  );
}

/**
 * Format Waterfall Result for Display/Logging
 */
export function formatWaterfallResult(result: WaterfallResult): string {
  const toDollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (result.productType === 'business_center') {
    return `Business Center Waterfall:
  Price:              ${toDollars(result.priceCents)}
  BotMakers Fee:      ${toDollars(result.botmakersFeeCents)}
  Apex Take:          ${toDollars(result.apexTakeCents)}
  Seller Commission:  ${toDollars(result.sellerCommissionCents)}
  Sponsor Bonus:      ${toDollars(BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS)}
  Costs:              ${toDollars(BUSINESS_CENTER_CONFIG.COSTS_CENTS)}`;
  }

  return `Standard Waterfall:
  Price:              ${toDollars(result.priceCents)}
  BotMakers Fee:      ${toDollars(result.botmakersFeeCents)}
  Adjusted Gross:     ${toDollars(result.adjustedGrossCents)}
  Apex Take:          ${toDollars(result.apexTakeCents)}
  Remainder:          ${toDollars(result.remainderCents)}
  Bonus Pool (3.5%):  ${toDollars(result.bonusPoolCents)}
  Leadership (1.5%):  ${toDollars(result.leadershipPoolCents)}
  Commission Pool:    ${toDollars(result.commissionPoolCents)}
  Seller Commission:  ${toDollars(result.sellerCommissionCents)}
  Override Pool:      ${toDollars(result.overridePoolCents)}
  Effective %:        ${result.effectivePercentage.toFixed(2)}%`;
}

// ============================================================================
// LEGACY EXPORTS (for backwards compatibility)
// ============================================================================

export interface BizCenterSplit {
  sellerAmount: number; // $10 (in cents: 1000)
  enrollerAmount: number; // $8 (in cents: 800)
}

export function calculateBizCenterSplit(): BizCenterSplit {
  return {
    sellerAmount: BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS,
    enrollerAmount: BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS,
  };
}
