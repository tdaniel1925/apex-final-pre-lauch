-- =====================================================
-- QV/BV/GQV SYSTEM MIGRATION
-- Replaces "credits" with volume metrics
-- =====================================================
-- Date: 2026-03-31
-- Purpose: Migrate from credit-based to QV/BV/GQV system
--
-- QV (Qualifying Volume) = Purchase price
-- BV (Business Volume) = Remainder after waterfall
-- GQV (Group Qualifying Volume) = Sum of team QV
-- GBV (Group Business Volume) = Sum of team BV
-- =====================================================

-- ===== STEP 1: Add new volume columns to members table =====

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS personal_qv_monthly INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS personal_bv_monthly DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS group_qv_monthly INT DEFAULT 0,      -- This is GQV
  ADD COLUMN IF NOT EXISTS group_bv_monthly DECIMAL(10,2) DEFAULT 0; -- This is GBV

COMMENT ON COLUMN members.personal_qv_monthly IS 'Qualifying Volume - purchase price from personal sales';
COMMENT ON COLUMN members.personal_bv_monthly IS 'Business Volume - commission pool from personal sales (after waterfall)';
COMMENT ON COLUMN members.group_qv_monthly IS 'Group Qualifying Volume (GQV) - sum of team QV';
COMMENT ON COLUMN members.group_bv_monthly IS 'Group Business Volume (GBV) - sum of team BV';

-- ===== STEP 2: Add new volume columns to products table =====

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS qv_member INT,
  ADD COLUMN IF NOT EXISTS qv_retail INT,
  ADD COLUMN IF NOT EXISTS bv_member DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS bv_retail DECIMAL(10,2);

COMMENT ON COLUMN products.qv_member IS 'Qualifying Volume for member price (= member price)';
COMMENT ON COLUMN products.qv_retail IS 'Qualifying Volume for retail price (= retail price)';
COMMENT ON COLUMN products.bv_member IS 'Business Volume for member price (after waterfall)';
COMMENT ON COLUMN products.bv_retail IS 'Business Volume for retail price (after waterfall)';

-- ===== STEP 3: Add new volume columns to orders table =====

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS total_qv INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_bv_calculated DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN orders.total_qv IS 'Total Qualifying Volume for this order';
COMMENT ON COLUMN orders.total_bv_calculated IS 'Total Business Volume for this order (calculated from waterfall)';

-- ===== STEP 4: Backfill QV values (QV = price) =====

UPDATE products
SET
  qv_member = wholesale_price_cents / 100,
  qv_retail = retail_price_cents / 100
WHERE qv_member IS NULL OR qv_retail IS NULL;

-- ===== STEP 5: Backfill BV values (BV = remainder after waterfall) =====

-- Formula: BV = price * 0.70 (after BM) * 0.70 (after Apex) * 0.95 (after pools)
-- Business Center gets fixed BV of $10

UPDATE products
SET
  bv_member = CASE
    WHEN slug = 'businesscenter' THEN 10.00
    ELSE ROUND((wholesale_price_cents * 0.70 * 0.70 * 0.95) / 100, 2)
  END,
  bv_retail = CASE
    WHEN slug = 'businesscenter' THEN 10.00
    ELSE ROUND((retail_price_cents * 0.70 * 0.70 * 0.95) / 100, 2)
  END
WHERE bv_member IS NULL OR bv_retail IS NULL;

-- ===== STEP 6: Create function to calculate QV and BV from price =====

CREATE OR REPLACE FUNCTION calculate_qv_bv(
  p_price_cents INT,
  p_product_slug TEXT DEFAULT NULL
)
RETURNS TABLE (qv INT, bv DECIMAL(10,2)) AS $$
BEGIN
  -- Business Center gets fixed values
  IF p_product_slug = 'businesscenter' THEN
    RETURN QUERY SELECT 39 AS qv, 10.00 AS bv;
    RETURN;
  END IF;

  -- All other products follow waterfall
  DECLARE
    v_price DECIMAL(10,2);
    v_qv INT;
    v_bm_fee DECIMAL(10,2);
    v_adjusted_gross DECIMAL(10,2);
    v_apex_take DECIMAL(10,2);
    v_remainder DECIMAL(10,2);
    v_bonus_pool DECIMAL(10,2);
    v_leadership_pool DECIMAL(10,2);
    v_bv DECIMAL(10,2);
  BEGIN
    v_price := p_price_cents / 100.0;
    v_qv := FLOOR(v_price);  -- QV = purchase price (as integer)

    -- Waterfall calculation
    v_bm_fee := v_price * 0.30;
    v_adjusted_gross := v_price - v_bm_fee;
    v_apex_take := v_adjusted_gross * 0.30;
    v_remainder := v_adjusted_gross - v_apex_take;
    v_bonus_pool := v_remainder * 0.035;
    v_leadership_pool := v_remainder * 0.015;
    v_bv := v_remainder - v_bonus_pool - v_leadership_pool;

    RETURN QUERY SELECT v_qv, ROUND(v_bv, 2);
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_qv_bv IS 'Calculate QV and BV from price in cents. QV = price, BV = remainder after waterfall';

-- ===== STEP 7: Create indexes for performance =====

CREATE INDEX IF NOT EXISTS idx_members_personal_qv ON members(personal_qv_monthly);
CREATE INDEX IF NOT EXISTS idx_members_group_qv ON members(group_qv_monthly);
CREATE INDEX IF NOT EXISTS idx_members_personal_bv ON members(personal_bv_monthly);
CREATE INDEX IF NOT EXISTS idx_members_qv_bv ON members(personal_qv_monthly, group_qv_monthly);

-- ===== STEP 8: Update override_qualified logic to use QV =====

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS set_override_qualified ON members;

-- Create new trigger function using QV
CREATE OR REPLACE FUNCTION update_override_qualified()
RETURNS TRIGGER AS $$
BEGIN
  -- Must have 50+ QV to earn overrides and bonuses
  NEW.override_qualified := (NEW.personal_qv_monthly >= 50);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_override_qualified
  BEFORE INSERT OR UPDATE OF personal_qv_monthly
  ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_override_qualified();

COMMENT ON TRIGGER set_override_qualified ON members IS 'Auto-set override_qualified based on 50 QV minimum';

-- ===== STEP 9: Migration verification =====

DO $$
DECLARE
  v_products_with_qv INT;
  v_products_with_bv INT;
BEGIN
  SELECT COUNT(*) INTO v_products_with_qv FROM products WHERE qv_member IS NOT NULL AND qv_retail IS NOT NULL;
  SELECT COUNT(*) INTO v_products_with_bv FROM products WHERE bv_member IS NOT NULL AND bv_retail IS NOT NULL;

  RAISE NOTICE '✅ QV/BV/GQV Migration Complete';
  RAISE NOTICE '   Products with QV: %', v_products_with_qv;
  RAISE NOTICE '   Products with BV: %', v_products_with_bv;
  RAISE NOTICE '   New member columns: personal_qv_monthly, personal_bv_monthly, group_qv_monthly, group_bv_monthly';
  RAISE NOTICE '   Override qualification now uses 50 QV minimum';
END $$;

-- ===== NOTES =====
-- Old columns (personal_credits_monthly, group_credits_monthly) are NOT dropped
-- to allow for gradual migration and rollback if needed.
-- These can be dropped in a future migration once QV/BV system is fully stable.
