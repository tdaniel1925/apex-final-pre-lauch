-- =============================================
-- MIGRATION: Add BV (Business Volume) Tracking Fields
-- Date: 2026-03-22
-- Phase: Tech Ladder Matrix - Phase 1 (Database Layer)
-- =============================================
--
-- PURPOSE: Add BV tracking fields for Tech Ladder 5×7 matrix system
--
-- CHANGES:
-- 1. Add BV fields to members table (personal_bv_monthly, group_bv_monthly)
-- 2. Add BV field to subscriptions table (bv_value)
-- 3. Add BV field to orders table (bv_value)
-- 4. Update indexes for BV queries
--
-- REF: BV-CALCULATION-REFERENCE.md
-- =============================================

-- =============================================
-- 1. ADD BV FIELDS TO MEMBERS TABLE
-- =============================================

-- Personal BV: Sum of all product BV from this member's direct sales (monthly)
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS personal_bv_monthly INTEGER NOT NULL DEFAULT 0;

-- Group BV: Sum of all BV from this member's entire organization (monthly)
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS group_bv_monthly INTEGER NOT NULL DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.members.personal_bv_monthly IS 'Business Volume from this member''s direct sales (monthly, resets each month)';
COMMENT ON COLUMN public.members.group_bv_monthly IS 'Business Volume from entire organization under this member (monthly)';

-- Add indexes for BV queries (used in rank calculations)
CREATE INDEX IF NOT EXISTS idx_members_personal_bv
  ON public.members(personal_bv_monthly)
  WHERE personal_bv_monthly >= 50; -- 50 BV minimum for override qualification

CREATE INDEX IF NOT EXISTS idx_members_group_bv
  ON public.members(group_bv_monthly);

-- =============================================
-- 2. ADD BV FIELD TO SUBSCRIPTIONS TABLE (if exists)
-- =============================================

-- Check if subscriptions table exists, then add bv_value
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    -- Add BV value column to subscriptions
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'subscriptions' AND column_name = 'bv_value'
    ) THEN
      ALTER TABLE public.subscriptions ADD COLUMN bv_value NUMERIC(10,2);
      COMMENT ON COLUMN public.subscriptions.bv_value IS 'Business Volume points for this subscription (calculated from price paid)';
    END IF;
  END IF;
END $$;

-- =============================================
-- 3. ADD BV FIELD TO ORDERS TABLE (if exists)
-- =============================================

-- Check if orders table exists, then add bv_value
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    -- Add BV value column to orders
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'bv_value'
    ) THEN
      ALTER TABLE public.orders ADD COLUMN bv_value NUMERIC(10,2);
      COMMENT ON COLUMN public.orders.bv_value IS 'Business Volume points for this order (calculated from price paid)';
    END IF;
  END IF;
END $$;

-- =============================================
-- 4. UPDATE OVERRIDE QUALIFICATION LOGIC
-- =============================================

-- Override qualification now based on 50+ BV/month instead of credits
-- Update the override_qualified field to be calculated from personal_bv_monthly
COMMENT ON COLUMN public.members.override_qualified IS 'TRUE if personal_bv_monthly >= 50 (recalculated monthly)';

-- =============================================
-- 5. CREATE BV CALCULATION FUNCTION
-- =============================================

-- Function to calculate BV from product price
CREATE OR REPLACE FUNCTION calculate_bv_for_product(
  p_product_name TEXT,
  p_price_paid NUMERIC
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_bv INTEGER;
BEGIN
  -- Business Center exception: Always return 39 BV
  IF p_product_name = 'Business Center' OR p_product_name ILIKE '%business%center%' THEN
    RETURN 39;
  END IF;

  -- Standard tech products: BV = price × 0.4606
  -- Formula breakdown:
  --   BotMakers takes 30%: remaining = price × 0.70
  --   Apex takes 30% of remaining: remaining = (price × 0.70) × 0.70 = price × 0.49
  --   Deduct Bonus Pool (3.5%) + Leadership Pool (1.5%): commission_pool = remaining × 0.95
  --   Final: BV = price × 0.70 × 0.70 × 0.95 = price × 0.4606
  v_bv := ROUND(p_price_paid * 0.4606);

  RETURN v_bv;
END;
$$;

COMMENT ON FUNCTION calculate_bv_for_product IS 'Calculates Business Volume (BV) points from product price. Business Center = 39 BV (fixed). Standard products = price × 0.4606.';

-- =============================================
-- 6. CREATE MONTHLY BV RESET FUNCTION
-- =============================================

-- Function to reset monthly BV counters (run on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_bv_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset all monthly BV counters to 0
  UPDATE public.members
  SET
    personal_bv_monthly = 0,
    group_bv_monthly = 0,
    override_qualified = FALSE,
    updated_at = NOW();

  -- Log the reset
  RAISE NOTICE 'Monthly BV counters reset for all members';
END;
$$;

COMMENT ON FUNCTION reset_monthly_bv_counters IS 'Resets personal_bv_monthly and group_bv_monthly to 0 for all members. Run on 1st of each month.';

-- =============================================
-- 7. CREATE BV ROLLUP FUNCTION
-- =============================================

-- Function to calculate group BV for a member (includes downline)
CREATE OR REPLACE FUNCTION calculate_group_bv_for_member(p_member_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_total_bv INTEGER;
BEGIN
  -- Calculate total BV from entire organization
  -- This includes:
  --   1. Member's own personal BV
  --   2. All downline members' personal BV (via enroller_id tree)

  WITH RECURSIVE downline AS (
    -- Start with the member
    SELECT member_id, personal_bv_monthly
    FROM public.members
    WHERE member_id = p_member_id

    UNION ALL

    -- Recursively get all downline members
    SELECT m.member_id, m.personal_bv_monthly
    FROM public.members m
    INNER JOIN downline d ON m.enroller_id = d.member_id
    WHERE m.status = 'active'
  )
  SELECT COALESCE(SUM(personal_bv_monthly), 0) INTO v_total_bv
  FROM downline;

  RETURN v_total_bv;
END;
$$;

COMMENT ON FUNCTION calculate_group_bv_for_member IS 'Calculates total group BV for a member (personal + all downline via enroller tree)';

-- =============================================
-- 8. CREATE BV UPDATE TRIGGER
-- =============================================

-- Trigger to update override_qualified when personal_bv_monthly changes
CREATE OR REPLACE FUNCTION update_override_qualification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update override_qualified based on 50 BV minimum
  IF NEW.personal_bv_monthly >= 50 THEN
    NEW.override_qualified := TRUE;
  ELSE
    NEW.override_qualified := FALSE;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trg_update_override_qualification ON public.members;

CREATE TRIGGER trg_update_override_qualification
  BEFORE UPDATE OF personal_bv_monthly ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION update_override_qualification();

COMMENT ON TRIGGER trg_update_override_qualification ON public.members IS 'Automatically updates override_qualified when personal_bv_monthly changes';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ BV tracking fields migration complete';
  RAISE NOTICE '   - Added personal_bv_monthly and group_bv_monthly to members';
  RAISE NOTICE '   - Added bv_value to subscriptions and orders (if tables exist)';
  RAISE NOTICE '   - Created calculate_bv_for_product() function';
  RAISE NOTICE '   - Created BV rollup and reset functions';
  RAISE NOTICE '   - Created override qualification trigger';
  RAISE NOTICE '';
  RAISE NOTICE '📚 Next Steps:';
  RAISE NOTICE '   1. Create BV calculation utility (Phase 1)';
  RAISE NOTICE '   2. Implement spillover placement algorithm (Phase 2)';
  RAISE NOTICE '   3. Create override calculation engine (Phase 2)';
END $$;
