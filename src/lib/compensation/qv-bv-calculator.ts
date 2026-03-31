/**
 * QV/BV Calculator
 *
 * Calculates Qualifying Volume (QV) and Business Volume (BV) from purchase price.
 *
 * KEY CONCEPTS:
 * - QV (Qualifying Volume) = Purchase price (what customer pays)
 * - BV (Business Volume) = Remainder after waterfall (commission pool)
 * - GQV (Group Qualifying Volume) = Sum of team's QV
 * - GBV (Group Business Volume) = Sum of team's BV
 *
 * @module compensation/qv-bv-calculator
 */

export interface QVBVResult {
  qv: number; // Qualifying Volume (purchase price as integer)
  bv: number; // Business Volume (after waterfall, as decimal)
}

export interface WaterfallBreakdown {
  price: number;
  qv: number;
  bm_fee: number;
  adjusted_gross: number;
  apex_take: number;
  remainder: number;
  bonus_pool: number;
  leadership_pool: number;
  commission_pool: number;
  bv: number;
  seller_commission: number; // 60% of BV
  override_pool: number; // 40% of commission_pool
}

/**
 * Calculate QV and BV from price
 *
 * @param priceCents - Price in cents
 * @param productSlug - Product slug (businesscenter gets special handling)
 * @returns QV and BV values
 */
export function calculateQVAndBV(
  priceCents: number,
  productSlug?: string
): QVBVResult {
  const price = priceCents / 100;

  // Business Center gets fixed QV/BV
  if (productSlug === 'businesscenter') {
    return {
      qv: 39,
      bv: 10.0,
    };
  }

  // QV = purchase price (as integer)
  const qv = Math.floor(price);

  // BV = remainder after waterfall
  const bmFee = price * 0.3;
  const adjustedGross = price - bmFee;
  const apexTake = adjustedGross * 0.3;
  const remainder = adjustedGross - apexTake;
  const bonusPool = remainder * 0.035;
  const leadershipPool = remainder * 0.015;
  const bv = remainder - bonusPool - leadershipPool;

  return {
    qv,
    bv: Math.round(bv * 100) / 100, // Round to 2 decimals
  };
}

/**
 * Calculate full waterfall breakdown with QV/BV
 *
 * @param priceCents - Price in cents
 * @param productSlug - Product slug
 * @returns Complete waterfall breakdown
 */
export function calculateWaterfall(
  priceCents: number,
  productSlug?: string
): WaterfallBreakdown {
  const price = priceCents / 100;

  // Business Center uses fixed split (not waterfall)
  if (productSlug === 'businesscenter') {
    return {
      price: 39,
      qv: 39,
      bm_fee: 11,
      adjusted_gross: 28,
      apex_take: 8,
      remainder: 20,
      bonus_pool: 0,
      leadership_pool: 0,
      commission_pool: 20,
      bv: 10,
      seller_commission: 10,
      override_pool: 8,
    };
  }

  // Standard waterfall
  const bmFee = price * 0.3;
  const adjustedGross = price - bmFee;
  const apexTake = adjustedGross * 0.3;
  const remainder = adjustedGross - apexTake;
  const bonusPool = remainder * 0.035;
  const leadershipPool = remainder * 0.015;
  const commissionPool = remainder - bonusPool - leadershipPool;
  const bv = commissionPool;
  const sellerCommission = commissionPool * 0.6;
  const overridePool = commissionPool * 0.4;

  return {
    price: Math.round(price * 100) / 100,
    qv: Math.floor(price),
    bm_fee: Math.round(bmFee * 100) / 100,
    adjusted_gross: Math.round(adjustedGross * 100) / 100,
    apex_take: Math.round(apexTake * 100) / 100,
    remainder: Math.round(remainder * 100) / 100,
    bonus_pool: Math.round(bonusPool * 100) / 100,
    leadership_pool: Math.round(leadershipPool * 100) / 100,
    commission_pool: Math.round(commissionPool * 100) / 100,
    bv: Math.round(bv * 100) / 100,
    seller_commission: Math.round(sellerCommission * 100) / 100,
    override_pool: Math.round(overridePool * 100) / 100,
  };
}

/**
 * Get QV/BV from database product record
 *
 * @param product - Product from database
 * @param priceType - 'member' or 'retail'
 * @returns QV and BV
 */
export function getProductQVBV(
  product: {
    qv_member: number | null;
    qv_retail: number | null;
    bv_member: number | null;
    bv_retail: number | null;
    wholesale_price_cents?: number;
    retail_price_cents?: number;
    slug?: string;
  },
  priceType: 'member' | 'retail'
): QVBVResult {
  // If product has pre-calculated QV/BV, use it
  if (priceType === 'member' && product.qv_member && product.bv_member) {
    return {
      qv: product.qv_member,
      bv: product.bv_member,
    };
  }

  if (priceType === 'retail' && product.qv_retail && product.bv_retail) {
    return {
      qv: product.qv_retail,
      bv: product.bv_retail,
    };
  }

  // Fallback: Calculate from price
  const priceCents =
    priceType === 'member'
      ? product.wholesale_price_cents!
      : product.retail_price_cents!;

  return calculateQVAndBV(priceCents, product.slug);
}

/**
 * Check if member qualifies for overrides (50 QV minimum)
 *
 * @param personalQV - Member's personal QV for the month
 * @returns True if qualified (50+ QV)
 */
export function checkOverrideQualified(personalQV: number): boolean {
  return personalQV >= 50;
}
