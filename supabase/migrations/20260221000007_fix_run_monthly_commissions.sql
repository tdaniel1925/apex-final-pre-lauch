-- =============================================
-- FIX: run_monthly_commissions INSERT Error
-- Fixes INSERT/VALUES mismatch in BV snapshot creation
-- =============================================
-- Migration: 20260221000007
-- Created: 2026-02-21
-- Fixes: INSERT has more target columns than expressions
-- =============================================

-- Drop and recreate run_monthly_commissions with fix
DROP FUNCTION IF EXISTS run_monthly_commissions(TEXT);

CREATE OR REPLACE FUNCTION run_monthly_commissions(p_month_year TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_bv_count INTEGER;
  v_rank_changes INTEGER;
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

  -- Step 4: Calculate Matrix Commissions (L1-7)
  v_matrix_count := calculate_matrix_commissions(p_month_year);

  -- Step 5: Calculate Matching Bonuses (Gen 1-3)
  v_matching_count := calculate_matching_bonuses(p_month_year);

  -- Step 6: Calculate Override Bonuses
  v_override_count := calculate_override_bonuses(p_month_year);

  -- Step 7: Calculate Infinity Bonus (L8+)
  v_infinity_count := calculate_infinity_bonus(p_month_year);

  -- Step 8: Calculate Customer Milestone Bonuses
  v_milestone_count := calculate_customer_milestones(p_month_year);

  -- Step 9: Calculate Customer Retention Bonuses
  v_retention_count := calculate_customer_retention(p_month_year);

  -- Step 10: Calculate Fast Start Bonuses
  v_fast_start_count := calculate_fast_start_bonuses(p_month_year);

  -- Step 11: Calculate Rank Advancement Bonuses
  v_rank_bonus_count := calculate_rank_advancement_bonuses(p_month_year);

  -- Step 12: Calculate Car Bonuses
  v_car_count := calculate_car_bonuses(p_month_year);

  -- Step 13: Calculate Vacation Bonuses
  v_vacation_count := calculate_vacation_bonuses(p_month_year);

  -- Step 14: Calculate Infinity Pool
  v_pool_count := calculate_infinity_pool(p_month_year);

  -- Lock BV snapshots
  UPDATE bv_snapshots
  SET is_locked = TRUE, locked_at = NOW()
  WHERE month_year = p_month_year;

  v_end_time := NOW();

  -- Build result JSON
  v_result := jsonb_build_object(
    'success', TRUE,
    'month_year', p_month_year,
    'started_at', v_start_time,
    'completed_at', v_end_time,
    'duration_seconds', EXTRACT(EPOCH FROM (v_end_time - v_start_time)),
    'stats', jsonb_build_object(
      'bv_snapshots_created', v_bv_count,
      'rank_changes', v_rank_changes,
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

COMMENT ON FUNCTION run_monthly_commissions IS
'Fixed version - corrects INSERT statement to explicitly list columns instead of SELECT *';
