-- ===================================================================
-- UPDATE PRODUCTS WITH LIVE STRIPE PRICE IDs
-- Run this in Supabase SQL Editor
-- ===================================================================

-- Update products table with LIVE Stripe Price IDs
UPDATE products
SET stripe_price_id = 'price_1THYxE0s7Jg0EdCpt0uEyLKL'
WHERE slug = 'business-center';

UPDATE products
SET stripe_price_id = 'price_1THYxm0s7Jg0EdCp1QGKrKdg'
WHERE slug = 'pulsemarket';

UPDATE products
SET stripe_price_id = 'price_1THYxw0s7Jg0EdCpYyU9kMB3'
WHERE slug = 'pulseflow';

UPDATE products
SET stripe_price_id = 'price_1THYy70s7Jg0EdCpmdkqnWHR'
WHERE slug = 'pulsedrive';

UPDATE products
SET stripe_price_id = 'price_1THYyI0s7Jg0EdCpYdrL6M0O'
WHERE slug = 'pulsecommand';

-- Verify all products have live price IDs
SELECT
  name,
  slug,
  (wholesale_price_cents / 100.0) as member_price,
  stripe_price_id,
  CASE
    WHEN stripe_price_id LIKE 'price_1TH%' THEN '✅ LIVE'
    WHEN stripe_price_id LIKE 'price_test_%' THEN '⚠️ TEST'
    ELSE '❌ MISSING'
  END as status
FROM products
WHERE is_active = true
ORDER BY wholesale_price_cents;

-- Expected output:
-- business-center  | $39   | price_1THYxE0s7Jg0EdCpt0uEyLKL | ✅ LIVE
-- pulsemarket      | $59   | price_1THYxm0s7Jg0EdCp1QGKrKdg | ✅ LIVE
-- pulseflow        | $129  | price_1THYxw0s7Jg0EdCpYyU9kMB3 | ✅ LIVE
-- pulsedrive       | $349  | price_1THYy70s7Jg0EdCpmdkqnWHR | ✅ LIVE
-- pulsecommand     | $399  | price_1THYyI0s7Jg0EdCpYdrL6M0O | ✅ LIVE
