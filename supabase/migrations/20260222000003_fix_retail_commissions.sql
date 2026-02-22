-- =============================================
-- FIX: Retail Commission Calculation
-- Two bugs:
--   1. Function joins orders → distributors (wrong for retail)
--   2. run_monthly_commissions doesn't call it at all
-- =============================================
-- Migration: 20260222000003
-- Created: 2026-02-22
-- Fixes: Retail commissions showing 0 despite retail orders
-- =============================================

-- =============================================
-- 1. FIX calculate_retail_commissions FUNCTION
-- Change from week_ending to month_year for consistency
-- Fix JOIN to go through customers table
-- =============================================

CREATE OR REPLACE FUNCTION calculate_retail_commissions(
  p_month_year TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_commission_cents INTEGER;
  v_count INTEGER := 0;
  v_month_start DATE;
  v_month_end DATE;
  v_week_ending DATE;
BEGIN
  -- Parse month_year to get date range (e.g., '2026-02' → Feb 1-28)
  v_month_start := (p_month_year || '-01')::DATE;
  v_month_end := (v_month_start + INTERVAL '1 month')::DATE;

  -- Calculate week_ending as last day of month (for compatibility)
  v_week_ending := (v_month_end - INTERVAL '1 day')::DATE;

  -- Get all paid retail orders from customers in the month
  FOR v_order IN
    SELECT
      o.id as order_id,
      o.total_cents,
      o.created_at,
      c.referred_by_distributor_id as distributor_id
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    WHERE o.customer_id IS NOT NULL
      AND o.payment_status = 'paid'
      AND o.is_personal_purchase = FALSE
      AND o.created_at >= v_month_start
      AND o.created_at < v_month_end
  LOOP
    -- Only process if customer was referred by a distributor
    IF v_order.distributor_id IS NOT NULL THEN
      -- Calculate commission for each item in the order
      FOR v_item IN
        SELECT * FROM order_items WHERE order_id = v_order.order_id
      LOOP
        -- Commission = retail price - wholesale price
        -- Wholesale is 70% of retail (30% markup)
        v_commission_cents := v_item.total_price_cents -
          (v_item.unit_price_cents * 0.70)::INTEGER * v_item.quantity;

        INSERT INTO commissions_retail (
          distributor_id,
          order_id,
          order_item_id,
          retail_price_cents,
          wholesale_price_cents,
          commission_amount_cents,
          week_ending,
          month_year
        ) VALUES (
          v_order.distributor_id,
          v_order.order_id,
          v_item.id,
          v_item.total_price_cents,
          (v_item.unit_price_cents * 0.70)::INTEGER * v_item.quantity,
          v_commission_cents,
          v_week_ending,
          p_month_year
        );

        v_count := v_count + 1;
      END LOOP;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_retail_commissions(TEXT) IS
'Calculates retail commissions for orders placed by customers.
Joins orders → customers → referred_by_distributor_id to find the distributor who referred the customer.
Commission = retail price - wholesale price (30% markup).
Changed from week_ending to month_year for consistency with other commission functions.';

-- =============================================
-- 2. UPDATE run_monthly_commissions TO CALL RETAIL
-- Add v_retail_count and call the function
-- =============================================

CREATE OR REPLACE FUNCTION run_monthly_commissions(p_month_year TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_bv_count INTEGER;
  v_rank_changes INTEGER;
  v_retail_count INTEGER;  -- ADDED
  v_matrix_count INTEGER;
  v_matching_count INTEGER;
  v_override_count INTEGER;
  v_infinity_count INTEGER;
  v_milestone_count INTEGER;
  v_retention_count INTEGER;
  v_fast_start_count INTEGER;
  v_rank_bonus_count INTEGER;
  v_car_count INTEGER;
  v_vacation_count INTEGER;
  v_pool_count INTEGER;
  v_start_time TIMESTAMP;
  v_end_time TIMESTAMP;
BEGIN
  v_start_time := NOW();

  -- Step 1: Snapshot BV (FIXED: explicitly list columns instead of SELECT *)
  INSERT INTO bv_snapshots (distributor_id, month_year, personal_bv, group_bv, is_active)
  SELECT distributor_id, p_month_year, personal_bv, group_bv, is_active
  FROM snapshot_monthly_bv(p_month_year);

  GET DIAGNOSTICS v_bv_count = ROW_COUNT;

  -- Step 2: Calculate Group BV (recursive)
  UPDATE bv_snapshots
  SET group_bv = calculate_group_bv(distributor_id, p_month_year)
  WHERE month_year = p_month_year;

  -- Step 3: Evaluate Ranks (also generates rank advancement bonuses)
  v_rank_changes := evaluate_ranks(p_month_year);

  -- Step 4: Calculate Retail Commissions (ADDED - was missing!)
  v_retail_count := calculate_retail_commissions(p_month_year);

  -- Step 5: Calculate Matrix Commissions (L1-7)
  v_matrix_count := calculate_matrix_commissions(p_month_year);

  -- Step 6: Calculate Matching Bonuses (Gen 1-3)
  v_matching_count := calculate_matching_bonuses(p_month_year);

  -- Step 7: Calculate Override Bonuses
  v_override_count := calculate_override_bonuses(p_month_year);

  -- Step 8: Calculate Infinity Bonus (L8+)
  v_infinity_count := calculate_infinity_bonus(p_month_year);

  -- Step 9: Calculate Customer Milestone Bonuses
  v_milestone_count := calculate_customer_milestones(p_month_year);

  -- Step 10: Calculate Customer Retention Bonuses
  v_retention_count := calculate_customer_retention(p_month_year);

  -- Step 11: Calculate Fast Start Bonuses
  v_fast_start_count := calculate_fast_start_bonuses(p_month_year);

  -- Step 12: Get rank advancement count (calculated in evaluate_ranks)
  SELECT COUNT(*) INTO v_rank_bonus_count
  FROM commissions_rank_advancement
  WHERE month_year = p_month_year;

  -- Step 13: Calculate Car Bonuses
  v_car_count := calculate_car_bonuses(p_month_year);

  -- Step 14: Calculate Vacation Bonuses
  v_vacation_count := calculate_vacation_bonuses(p_month_year);

  -- Step 15: Calculate Infinity Pool
  v_pool_count := calculate_infinity_pool(p_month_year);

  v_end_time := NOW();

  -- Return comprehensive result
  v_result := jsonb_build_object(
    'success', true,
    'month_year', p_month_year,
    'execution_time_ms', EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000,
    'results', jsonb_build_object(
      'bv_snapshots', v_bv_count,
      'rank_changes', v_rank_changes,
      'retail_commissions', v_retail_count,
      'matrix_commissions', v_matrix_count,
      'matching_bonuses', v_matching_count,
      'override_bonuses', v_override_count,
      'infinity_bonuses', v_infinity_count,
      'customer_milestones', v_milestone_count,
      'customer_retention', v_retention_count,
      'fast_start_bonuses', v_fast_start_count,
      'rank_advancement_bonuses', v_rank_bonus_count,
      'car_bonuses', v_car_count,
      'vacation_bonuses', v_vacation_count,
      'infinity_pool', v_pool_count
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION run_monthly_commissions(TEXT) IS
'Main monthly commission calculation orchestrator.
Runs all commission calculations in the correct order.
FIXED: Now includes retail commissions (was missing before).';
