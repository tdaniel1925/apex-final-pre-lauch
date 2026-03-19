-- =============================================
-- MIGRATION: Products with Credit System
-- Date: 2026-03-16
-- Phase: 2 (Build New DB Schema)
-- Agent: 2B
-- =============================================
--
-- PURPOSE: Add credit percentage system to products table
--
-- CHANGES:
-- 1. Add credit_pct column (30%, 50%, 100%, 40%, or 0%)
-- 2. Add credits column (calculated: price × credit_pct)
-- 3. Seed/update products with spec values
--
-- PRODUCTS & CREDITS (from spec):
-- - PulseGuard: 30% → Member $59 = 18 credits, Retail $79 = 24 credits
-- - PulseFlow: 50% → Member $129 = 65 credits, Retail $149 = 75 credits
-- - PulseDrive: 100% → Member $219 = 219 credits, Retail $299 = 299 credits
-- - PulseCommand: 100% → Member $349 = 349 credits, Retail $499 = 499 credits
-- - SmartLook: 40% → $99 = 40 credits (same for member/retail)
-- - Business Center: 0% → $39 = 39 credits (fixed)
--
-- =============================================

-- =============================================
-- ADD CREDIT COLUMNS TO PRODUCTS TABLE
-- =============================================

-- Add credit percentage column (stores 0.30, 0.50, 1.00, 0.40, or 0.00)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS credit_pct NUMERIC(3, 2) DEFAULT 0.00
CHECK (credit_pct >= 0.00 AND credit_pct <= 1.00);

-- Add calculated credits column (member price × credit_pct)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS member_credits INTEGER DEFAULT 0;

-- Add calculated credits for retail
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS retail_credits INTEGER DEFAULT 0;

-- Add comments
COMMENT ON COLUMN public.products.credit_pct IS 'Credit multiplier: 0.30 (30%), 0.50 (50%), 1.00 (100%), 0.40 (40%), or 0.00 (Business Center)';
COMMENT ON COLUMN public.products.member_credits IS 'Production credits for wholesale price (wholesale_price_cents × credit_pct ÷ 100)';
COMMENT ON COLUMN public.products.retail_credits IS 'Production credits for retail price (retail_price_cents × credit_pct ÷ 100)';

-- =============================================
-- UPDATE EXISTING PRODUCTS WITH CREDIT VALUES
-- =============================================

-- PulseMarket → PulseGuard (rename + 30% credit)
-- Wholesale $59 → 18 credits, Retail $79 → 24 credits
UPDATE public.products
SET
  name = 'PulseGuard',
  slug = 'pulseguard',
  credit_pct = 0.30,
  member_credits = 18,
  retail_credits = 24
WHERE slug = 'pulsemarket';

-- PulseFlow: 50% credit
-- Wholesale $129 → 65 credits, Retail $149 → 75 credits
UPDATE public.products
SET
  credit_pct = 0.50,
  member_credits = 65,
  retail_credits = 75
WHERE slug = 'pulseflow';

-- PulseDrive: 100% credit
-- Wholesale $219 → 219 credits, Retail $299 → 299 credits
UPDATE public.products
SET
  credit_pct = 1.00,
  member_credits = 219,
  retail_credits = 299
WHERE slug = 'pulsedrive';

-- PulseCommand: 100% credit
-- Wholesale $349 → 349 credits, Retail $499 → 499 credits
UPDATE public.products
SET
  credit_pct = 1.00,
  member_credits = 349,
  retail_credits = 499
WHERE slug = 'pulsecommand';

-- SmartLock → SmartLook (rename + 40% credit)
-- Wholesale $99 → 40 credits, Retail $99 → 40 credits
UPDATE public.products
SET
  name = 'SmartLook',
  slug = 'smartlook',
  credit_pct = 0.40,
  member_credits = 40,
  retail_credits = 40
WHERE slug = 'smartlock';

-- Custom Business Center: 0% credit (fixed 39 credits)
-- Fixed $39 → 39 credits
UPDATE public.products
SET
  credit_pct = 0.00,
  member_credits = 39,
  retail_credits = 39
WHERE slug = 'custom-business-center';

-- =============================================
-- CREATE INDEX ON CREDIT_PCT
-- =============================================

CREATE INDEX IF NOT EXISTS idx_products_credit_pct ON public.products(credit_pct);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- View all products with credits:
-- SELECT name, member_price_cents/100.0 as member_price, credit_pct, member_credits, retail_credits
-- FROM public.products
-- ORDER BY name;

-- Expected output:
-- Business Center | $39.00  | 0.00 | 39  | 39
-- PulseCommand    | $349.00 | 1.00 | 349 | 499
-- PulseDrive      | $219.00 | 1.00 | 219 | 299
-- PulseFlow       | $129.00 | 0.50 | 65  | 75
-- PulseGuard      | $59.00  | 0.30 | 18  | 24
-- SmartLook       | $99.00  | 0.40 | 40  | 40

-- =============================================
-- NOTES
-- =============================================

-- Credit calculation formula:
-- member_credits = ROUND((wholesale_price_cents * credit_pct) / 100)
-- retail_credits = ROUND((retail_price_cents * credit_pct) / 100)

-- Business Center is special:
-- - Always 39 credits (regardless of price)
-- - No credit percentage calculation
-- - Fixed $11/$8/$10/$8/$2 split

-- =============================================
-- END OF MIGRATION
-- =============================================
