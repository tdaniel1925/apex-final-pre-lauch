-- FINAL PRODUCT SETUP - Run this to complete Stripe integration
-- This updates all prices and Stripe price IDs to correct values

-- ═══════════════════════════════════════════════════════
-- STEP 1: Update Product Prices
-- ═══════════════════════════════════════════════════════

-- Business Center: $39/month
UPDATE products
SET wholesale_price_cents = 3900
WHERE name = 'BusinessCenter';

-- PulseCommand: $499 retail, $399 member
UPDATE products
SET wholesale_price_cents = 39900,
    retail_price_cents = 49900
WHERE name = 'PulseCommand';

-- PulseDrive: $399 retail, $349 member
UPDATE products
SET wholesale_price_cents = 34900,
    retail_price_cents = 39900
WHERE name = 'PulseDrive';

-- ═══════════════════════════════════════════════════════
-- STEP 2: Update Stripe Price IDs (NEW RECURRING PRICES)
-- ═══════════════════════════════════════════════════════

-- PulseDrive: $349/month recurring
UPDATE products
SET stripe_price_id = 'price_1THWPL0UcCrfpyRUxs4VSi1X'
WHERE name = 'PulseDrive';

-- PulseCommand: $399/month recurring
UPDATE products
SET stripe_price_id = 'price_1THWPM0UcCrfpyRUEklBuWMA'
WHERE name = 'PulseCommand';

-- ═══════════════════════════════════════════════════════
-- STEP 3: Verify Final Configuration
-- ═══════════════════════════════════════════════════════

SELECT
  name as product_name,
  (retail_price_cents / 100.0) as retail_price_usd,
  (wholesale_price_cents / 100.0) as member_price_usd,
  bv,
  stripe_price_id,
  is_active,
  CASE
    WHEN stripe_price_id IS NOT NULL THEN '✅ READY'
    ELSE '❌ MISSING'
  END as status
FROM products
WHERE is_active = true
ORDER BY wholesale_price_cents;

-- ═══════════════════════════════════════════════════════
-- Expected Results:
-- ═══════════════════════════════════════════════════════
-- BusinessCenter  | $39   | price_1THPHs0UcCrfpyRUCYO3ZnLh | ✅ READY
-- PulseMarket     | $59   | price_1TGsvC0UcCrfpyRU082s0NcQ | ✅ READY
-- PulseFlow       | $129  | price_1TGsvD0UcCrfpyRU3DBAVUeZ | ✅ READY
-- PulseDrive      | $349  | price_1THWPL0UcCrfpyRUxs4VSi1X | ✅ READY (NEW)
-- PulseCommand    | $399  | price_1THWPM0UcCrfpyRUEklBuWMA | ✅ READY (NEW)
-- ═══════════════════════════════════════════════════════
