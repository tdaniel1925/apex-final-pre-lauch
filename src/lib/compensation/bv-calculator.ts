/**
 * Business Volume (BV) Calculator
 *
 * Calculates BV points for Tech Ladder products based on actual price paid.
 *
 * REF: BV-CALCULATION-REFERENCE.md
 *
 * @module lib/compensation/bv-calculator
 */

// =============================================
// TYPES
// =============================================

export interface Product {
  id: string;
  name: string;
  type: 'tech' | 'business_center' | 'insurance';
  member_price: number;
  retail_price: number;
}

export interface BVCalculationResult {
  bv: number;
  price_paid: number;
  product_name: string;
  calculation_method: 'fixed' | 'standard';
  breakdown: {
    botmakers_fee: number;
    adjusted_gross: number;
    apex_take: number;
    remainder: number;
    bonus_pool: number;
    leadership_pool: number;
    commission_pool: number;
  };
}

// =============================================
// CONSTANTS
// =============================================

/**
 * BV calculation multiplier for standard tech products
 *
 * Formula breakdown:
 * - BotMakers takes 30%: price × 0.70
 * - Apex takes 30% of remainder: (price × 0.70) × 0.70 = price × 0.49
 * - Deduct Bonus Pool (3.5%) + Leadership Pool (1.5%): (price × 0.49) × 0.95
 * - Final: price × 0.4606
 */
const BV_MULTIPLIER = 0.4606;

/**
 * Business Center fixed BV value (exception to standard formula)
 */
const BUSINESS_CENTER_BV = 39;

/**
 * Minimum BV required for override qualification
 */
export const MINIMUM_BV_FOR_OVERRIDES = 50;

// =============================================
// BV CALCULATION FUNCTIONS
// =============================================

/**
 * Calculate BV for any tech product
 *
 * @param product - Product object or product name
 * @param pricePaid - Actual price customer paid (member or retail)
 * @returns BV points (whole number)
 *
 * @example
 * ```typescript
 * // Standard product
 * const bv = calculateBV({ name: 'PulseGuard' }, 59);
 * // Returns: 27
 *
 * // Business Center (fixed)
 * const bv = calculateBV({ name: 'Business Center' }, 39);
 * // Returns: 39
 * ```
 */
export function calculateBV(
  product: Product | { name: string },
  pricePaid: number
): number {
  // Business Center exception: Always return 39 BV
  if (isBusinessCenter(product.name)) {
    return BUSINESS_CENTER_BV;
  }

  // Standard tech products: BV = price × 0.4606
  return Math.round(pricePaid * BV_MULTIPLIER);
}

/**
 * Calculate BV with detailed breakdown (for debugging/admin views)
 *
 * @param product - Product object or product name
 * @param pricePaid - Actual price customer paid
 * @returns Detailed BV calculation result with breakdown
 */
export function calculateBVDetailed(
  product: Product | { name: string },
  pricePaid: number
): BVCalculationResult {
  const productName = product.name;

  // Business Center exception
  if (isBusinessCenter(productName)) {
    return {
      bv: BUSINESS_CENTER_BV,
      price_paid: pricePaid,
      product_name: productName,
      calculation_method: 'fixed',
      breakdown: {
        botmakers_fee: 0,
        adjusted_gross: pricePaid,
        apex_take: 0,
        remainder: pricePaid,
        bonus_pool: 0,
        leadership_pool: 0,
        commission_pool: pricePaid,
      },
    };
  }

  // Standard calculation with full breakdown
  const botmakers_fee = pricePaid * 0.30;
  const adjusted_gross = pricePaid - botmakers_fee;
  const apex_take = adjusted_gross * 0.30;
  const remainder = adjusted_gross - apex_take;
  const bonus_pool = remainder * 0.035; // 3.5%
  const leadership_pool = remainder * 0.015; // 1.5%
  const commission_pool = remainder - bonus_pool - leadership_pool;
  const bv = Math.round(commission_pool);

  return {
    bv,
    price_paid: pricePaid,
    product_name: productName,
    calculation_method: 'standard',
    breakdown: {
      botmakers_fee: Number(botmakers_fee.toFixed(2)),
      adjusted_gross: Number(adjusted_gross.toFixed(2)),
      apex_take: Number(apex_take.toFixed(2)),
      remainder: Number(remainder.toFixed(2)),
      bonus_pool: Number(bonus_pool.toFixed(2)),
      leadership_pool: Number(leadership_pool.toFixed(2)),
      commission_pool: Number(commission_pool.toFixed(2)),
    },
  };
}

/**
 * Calculate BV for a subscription/order
 *
 * @param productName - Name of the product
 * @param pricePaid - Actual price customer paid
 * @returns BV points
 */
export function calculateBVForOrder(
  productName: string,
  pricePaid: number
): number {
  return calculateBV({ name: productName }, pricePaid);
}

/**
 * Check if member qualifies for overrides based on personal BV
 *
 * @param personalBV - Member's personal BV for the month
 * @returns true if qualified (50+ BV)
 */
export function isQualifiedForOverrides(personalBV: number): boolean {
  return personalBV >= MINIMUM_BV_FOR_OVERRIDES;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Check if product is Business Center
 */
function isBusinessCenter(productName: string): boolean {
  const normalized = productName.toLowerCase().trim();
  return (
    normalized === 'business center' ||
    normalized.includes('business') && normalized.includes('center')
  );
}

/**
 * Calculate total personal BV from an array of orders
 *
 * @param orders - Array of orders with product_name and price_paid
 * @returns Total BV
 */
export function calculateTotalBV(
  orders: Array<{ product_name: string; price_paid: number }>
): number {
  return orders.reduce((total, order) => {
    return total + calculateBVForOrder(order.product_name, order.price_paid);
  }, 0);
}

// =============================================
// BV REFERENCE TABLE (for quick lookup)
// =============================================

/**
 * Pre-calculated BV values for common product prices
 *
 * Use this for quick reference without calculation
 */
export const BV_REFERENCE_TABLE = {
  // PulseGuard
  pulseGuard: {
    member: { price: 59, bv: 27 },
    retail: { price: 99, bv: 46 },
  },
  // PulseFlow
  pulseFlow: {
    member: { price: 129, bv: 59 },
    retail: { price: 199, bv: 92 },
  },
  // PulseDrive
  pulseDrive: {
    member: { price: 199, bv: 92 },
    retail: { price: 299, bv: 138 },
  },
  // PulseCommand
  pulseCommand: {
    member: { price: 299, bv: 138 },
    retail: { price: 499, bv: 230 },
  },
  // SmartLook
  smartLook: {
    member: { price: 499, bv: 230 },
    retail: { price: 799, bv: 368 },
  },
  // Business Center (fixed)
  businessCenter: {
    subscription: { price: 39, bv: 39 },
  },
} as const;

// =============================================
// EXPORTS
// =============================================

export default {
  calculateBV,
  calculateBVDetailed,
  calculateBVForOrder,
  calculateTotalBV,
  isQualifiedForOverrides,
  BV_REFERENCE_TABLE,
  MINIMUM_BV_FOR_OVERRIDES,
};
