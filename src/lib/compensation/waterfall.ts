// =============================================
// DUAL-LADDER COMPENSATION ENGINE - WATERFALL
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md
// Phase: 3 (Build New TypeScript Code)
// Agent: 3B
// =============================================

import {
  WATERFALL_CONFIG,
  BUSINESS_CENTER_CONFIG,
  ProductType,
} from './config';

/**
 * Waterfall Calculation Result
 *
 * All amounts in cents for precision
 */
export interface WaterfallResult {
  // Input
  priceCents: number;
  productType: ProductType;

  // Step 1: BotMakers Fee (30% of price)
  botmakersFeeCents: number;

  // Step 2: Adjusted Gross (price - BotMakers)
  adjustedGrossCents: number;

  // Step 3: Apex Take (30% of adjusted gross)
  apexTakeCents: number;

  // Step 4: Remainder (adjusted gross - Apex)
  remainderCents: number;

  // Step 5: Bonus Pool (3.5% of remainder)
  bonusPoolCents: number;

  // Step 6: Leadership Pool (1.5% of remainder)
  leadershipPoolCents: number;

  // Step 7: Commission Pool (remainder - bonus - leadership)
  commissionPoolCents: number;

  // Step 8: Seller Commission (60% of commission pool)
  sellerCommissionCents: number;

  // Step 9: Override Pool (40% of commission pool)
  overridePoolCents: number;

  // Effective percentage (seller commission / price)
  effectivePercentage: number;
}

/**
 * Calculate revenue waterfall for a sale
 *
 * From spec:
 * STEP 1: Customer pays PRICE (retail or member)
 * STEP 2: BotMakers takes 30% of price = ADJUSTED GROSS
 * STEP 3: Apex takes 30% of Adjusted Gross = REMAINDER
 * STEP 4: 3.5% of Remainder → BONUS POOL
 * STEP 5: 1.5% of Remainder → LEADERSHIP POOL
 *         = COMMISSION POOL (Remainder - 3.5% - 1.5%)
 * STEP 6: Seller gets 60% of Commission Pool (~27.9% effective)
 * STEP 7: Override Pool gets 40% of Commission Pool
 *         → Distributed across 5 levels
 *
 * @param priceCents - Sale price in cents (retail or member)
 * @param productType - 'standard' or 'business_center'
 * @returns Detailed waterfall breakdown
 */
export function calculateWaterfall(
  priceCents: number,
  productType: ProductType = 'standard'
): WaterfallResult {
  // Business Center Exception - Fixed Dollar Split
  if (productType === 'business_center') {
    return {
      priceCents: BUSINESS_CENTER_CONFIG.PRICE_CENTS,
      productType: 'business_center',
      botmakersFeeCents: BUSINESS_CENTER_CONFIG.BOTMAKERS_FEE_CENTS,
      adjustedGrossCents: 0, // Not applicable for BC
      apexTakeCents: BUSINESS_CENTER_CONFIG.APEX_TAKE_CENTS,
      remainderCents: 0, // Not applicable for BC
      bonusPoolCents: BUSINESS_CENTER_CONFIG.BONUS_POOL_CENTS, // $0
      leadershipPoolCents: BUSINESS_CENTER_CONFIG.LEADERSHIP_POOL_CENTS, // $0
      commissionPoolCents: 0, // Not applicable for BC
      sellerCommissionCents: BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS, // $10
      overridePoolCents: BUSINESS_CENTER_CONFIG.OVERRIDE_POOL_CENTS, // $0 (sponsor gets $8 flat)
      effectivePercentage: 25.64, // $10 / $39 = 25.64%
    };
  }

  // Standard Waterfall Calculation
  const botmakersFeeCents = Math.round(priceCents * WATERFALL_CONFIG.BOTMAKERS_FEE_PCT);
  const adjustedGrossCents = priceCents - botmakersFeeCents;

  const apexTakeCents = Math.round(adjustedGrossCents * WATERFALL_CONFIG.APEX_TAKE_PCT);
  const remainderCents = adjustedGrossCents - apexTakeCents;

  // Separate pools (3.5% + 1.5%)
  const bonusPoolCents = Math.round(remainderCents * WATERFALL_CONFIG.BONUS_POOL_PCT);
  const leadershipPoolCents = Math.round(
    remainderCents * WATERFALL_CONFIG.LEADERSHIP_POOL_PCT
  );

  // Commission Pool = Remainder - Both Pools
  const commissionPoolCents = remainderCents - bonusPoolCents - leadershipPoolCents;

  // Seller (60%) and Override Pool (40%) split
  const sellerCommissionCents = Math.round(
    commissionPoolCents * WATERFALL_CONFIG.SELLER_COMMISSION_PCT
  );
  const overridePoolCents = commissionPoolCents - sellerCommissionCents; // Remaining 40%

  // Calculate effective percentage for transparency
  const effectivePercentage = (sellerCommissionCents / priceCents) * 100;

  return {
    priceCents,
    productType,
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
 * Business Center Sponsor Bonus
 *
 * From spec:
 * Business Center pays $8 flat to direct sponsor (enroller)
 * NO override pool for BC
 *
 * @returns Sponsor bonus in cents ($8)
 */
export function getBusinessCenterSponsorBonus(): number {
  return BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS;
}

/**
 * Format waterfall result for display/logging
 *
 * @param result - Waterfall calculation result
 * @returns Formatted string breakdown
 */
export function formatWaterfallResult(result: WaterfallResult): string {
  const format = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (result.productType === 'business_center') {
    return `
Business Center Waterfall (Fixed Split):
  Price:              ${format(result.priceCents)}
  BotMakers Fee:      ${format(result.botmakersFeeCents)}
  Apex Take:          ${format(result.apexTakeCents)}
  Seller Commission:  ${format(result.sellerCommissionCents)}
  Sponsor Bonus:      ${format(BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS)}
  Costs:              ${format(BUSINESS_CENTER_CONFIG.COSTS_CENTS)}
  Override Pool:      ${format(result.overridePoolCents)} (none)
  Bonus Pool:         ${format(result.bonusPoolCents)} (none)
  Leadership Pool:    ${format(result.leadershipPoolCents)} (none)
`.trim();
  }

  return `
Standard Waterfall:
  Price:              ${format(result.priceCents)}
  BotMakers Fee:      ${format(result.botmakersFeeCents)} (30% of price)
  Adjusted Gross:     ${format(result.adjustedGrossCents)}
  Apex Take:          ${format(result.apexTakeCents)} (30% of adj. gross)
  Remainder:          ${format(result.remainderCents)}
  Bonus Pool:         ${format(result.bonusPoolCents)} (3.5% of remainder)
  Leadership Pool:    ${format(result.leadershipPoolCents)} (1.5% of remainder)
  Commission Pool:    ${format(result.commissionPoolCents)}
  Seller Commission:  ${format(result.sellerCommissionCents)} (60% of comm. pool)
  Override Pool:      ${format(result.overridePoolCents)} (40% of comm. pool)
  Effective %:        ${result.effectivePercentage.toFixed(2)}%
`.trim();
}

/**
 * Validate waterfall calculation accuracy
 *
 * Ensures all amounts add up correctly and no rounding errors exceed tolerance
 *
 * @param result - Waterfall calculation result
 * @returns Validation result with any errors
 */
export interface WaterfallValidation {
  valid: boolean;
  errors: string[];
}

export function validateWaterfall(result: WaterfallResult): WaterfallValidation {
  const errors: string[] = [];

  if (result.productType === 'business_center') {
    // Validate Business Center fixed split adds up
    const total =
      result.botmakersFeeCents +
      result.apexTakeCents +
      result.sellerCommissionCents +
      BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS +
      BUSINESS_CENTER_CONFIG.COSTS_CENTS;

    if (total !== result.priceCents) {
      errors.push(
        `Business Center split doesn't add up: ${total} !== ${result.priceCents}`
      );
    }

    return { valid: errors.length === 0, errors };
  }

  // Validate standard waterfall
  // Check: price = botmakers + adjusted_gross
  if (result.priceCents !== result.botmakersFeeCents + result.adjustedGrossCents) {
    errors.push('Price breakdown mismatch: BotMakers + AdjustedGross');
  }

  // Check: adjusted_gross = apex + remainder
  if (result.adjustedGrossCents !== result.apexTakeCents + result.remainderCents) {
    errors.push('Adjusted gross breakdown mismatch: Apex + Remainder');
  }

  // Check: remainder = bonus + leadership + commission_pool
  const poolsTotal =
    result.bonusPoolCents + result.leadershipPoolCents + result.commissionPoolCents;
  if (Math.abs(result.remainderCents - poolsTotal) > 2) {
    // Allow 2 cent rounding tolerance
    errors.push(`Remainder breakdown mismatch: ${result.remainderCents} !== ${poolsTotal}`);
  }

  // Check: commission_pool = seller + override_pool
  if (
    Math.abs(
      result.commissionPoolCents - (result.sellerCommissionCents + result.overridePoolCents)
    ) > 1
  ) {
    errors.push('Commission pool split mismatch: Seller + Override');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate total pools for a batch of sales
 *
 * Used for period-end pool distribution
 *
 * @param sales - Array of waterfall results
 * @returns Aggregated pool amounts
 */
export interface PoolAggregation {
  totalBonusPoolCents: number;
  totalLeadershipPoolCents: number;
  totalSalesCents: number;
  saleCount: number;
}

export function aggregatePools(results: WaterfallResult[]): PoolAggregation {
  return results.reduce(
    (agg, result) => ({
      totalBonusPoolCents: agg.totalBonusPoolCents + result.bonusPoolCents,
      totalLeadershipPoolCents: agg.totalLeadershipPoolCents + result.leadershipPoolCents,
      totalSalesCents: agg.totalSalesCents + result.priceCents,
      saleCount: agg.saleCount + 1,
    }),
    {
      totalBonusPoolCents: 0,
      totalLeadershipPoolCents: 0,
      totalSalesCents: 0,
      saleCount: 0,
    }
  );
}

// =============================================
// ASYNC VERSIONS (Future Database-Driven Config)
// =============================================
// These versions use the config-loader for future database-driven config
// Use these in new code that can handle async/await
// =============================================

/**
 * Calculate revenue waterfall for a sale (async version)
 *
 * This version loads config from config-loader (currently hardcoded, future DB)
 *
 * @param priceCents - Sale price in cents (retail or member)
 * @param productType - 'standard' or 'business_center'
 * @returns Detailed waterfall breakdown
 */
export async function calculateWaterfallAsync(
  priceCents: number,
  productType: ProductType = 'standard'
): Promise<WaterfallResult> {
  // For now, delegate to sync version
  // FUTURE: Load config from config-loader and use dynamic percentages
  return calculateWaterfall(priceCents, productType);

  // FUTURE IMPLEMENTATION:
  // import { getWaterfallConfig, getBusinessCenterConfig } from './config-loader';
  //
  // if (productType === 'business_center') {
  //   const bcConfig = await getBusinessCenterConfig();
  //   return {
  //     priceCents: bcConfig.priceCents,
  //     productType: 'business_center',
  //     botmakersFeeCents: bcConfig.botmakersFeeCents,
  //     adjustedGrossCents: 0,
  //     apexTakeCents: bcConfig.apexTakeCents,
  //     remainderCents: 0,
  //     bonusPoolCents: bcConfig.bonusPoolCents,
  //     leadershipPoolCents: bcConfig.leadershipPoolCents,
  //     commissionPoolCents: 0,
  //     sellerCommissionCents: bcConfig.sellerCommissionCents,
  //     overridePoolCents: bcConfig.overridePoolCents,
  //     effectivePercentage: 25.64,
  //   };
  // }
  //
  // const config = await getWaterfallConfig('standard');
  // const botmakersFeeCents = Math.round(priceCents * config.botmakersPct);
  // const adjustedGrossCents = priceCents - botmakersFeeCents;
  // const apexTakeCents = Math.round(adjustedGrossCents * config.apexTakePct);
  // const remainderCents = adjustedGrossCents - apexTakeCents;
  // const bonusPoolCents = Math.round(remainderCents * config.bonusPoolPct);
  // const leadershipPoolCents = Math.round(remainderCents * config.leadershipPoolPct);
  // const commissionPoolCents = remainderCents - bonusPoolCents - leadershipPoolCents;
  // const sellerCommissionCents = Math.round(commissionPoolCents * config.sellerCommissionPct);
  // const overridePoolCents = commissionPoolCents - sellerCommissionCents;
  // const effectivePercentage = (sellerCommissionCents / priceCents) * 100;
  //
  // return {
  //   priceCents,
  //   productType,
  //   botmakersFeeCents,
  //   adjustedGrossCents,
  //   apexTakeCents,
  //   remainderCents,
  //   bonusPoolCents,
  //   leadershipPoolCents,
  //   commissionPoolCents,
  //   sellerCommissionCents,
  //   overridePoolCents,
  //   effectivePercentage,
  // };
}
