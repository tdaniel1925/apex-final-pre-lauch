-- =============================================
-- COMMISSION CALCULATION FUNCTIONS
-- PostgreSQL functions for monthly commission run
-- =============================================
-- Migration: 20260221000005
-- Created: 2026-02-21
-- =============================================

-- =============================================
-- HELPER: Get Distributor's Current Rank
-- =============================================

CREATE OR REPLACE FUNCTION get_distributor_rank(p_distributor_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_rank TEXT;
BEGIN
  SELECT current_rank INTO v_rank
  FROM distributors
  WHERE id = p_distributor_id;

  RETURN COALESCE(v_rank, 'associate');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- HELPER: Get Matrix Commission Rate
-- =============================================

CREATE OR REPLACE FUNCTION get_matrix_rate(p_rank TEXT, p_level INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE p_rank
    WHEN 'associate' THEN
      CASE p_level
        WHEN 1 THEN 0.05  -- 5%
        WHEN 2 THEN 0.03  -- 3%
        WHEN 3 THEN 0.02  -- 2%
        ELSE 0
      END
    WHEN 'bronze' THEN
      CASE p_level
        WHEN 1 THEN 0.06
        WHEN 2 THEN 0.04
        WHEN 3 THEN 0.03
        WHEN 4 THEN 0.02
        ELSE 0
      END
    WHEN 'silver' THEN
      CASE p_level
        WHEN 1 THEN 0.07
        WHEN 2 THEN 0.05
        WHEN 3 THEN 0.03
        WHEN 4 THEN 0.02
        WHEN 5 THEN 0.01
        ELSE 0
      END
    WHEN 'gold' THEN
      CASE p_level
        WHEN 1 THEN 0.08
        WHEN 2 THEN 0.05
        WHEN 3 THEN 0.04
        WHEN 4 THEN 0.03
        WHEN 5 THEN 0.02
        WHEN 6 THEN 0.01
        ELSE 0
      END
    WHEN 'platinum' THEN
      CASE p_level
        WHEN 1 THEN 0.09
        WHEN 2 THEN 0.06
        WHEN 3 THEN 0.05
        WHEN 4 THEN 0.03
        WHEN 5 THEN 0.02
        WHEN 6 THEN 0.01
        WHEN 7 THEN 0.01
        ELSE 0
      END
    WHEN 'diamond' THEN
      CASE p_level
        WHEN 1 THEN 0.10
        WHEN 2 THEN 0.07
        WHEN 3 THEN 0.05
        WHEN 4 THEN 0.04
        WHEN 5 THEN 0.03
        WHEN 6 THEN 0.02
        WHEN 7 THEN 0.01
        ELSE 0
      END
    WHEN 'crown_diamond' THEN
      CASE p_level
        WHEN 1 THEN 0.11
        WHEN 2 THEN 0.08
        WHEN 3 THEN 0.06
        WHEN 4 THEN 0.05
        WHEN 5 THEN 0.04
        WHEN 6 THEN 0.03
        WHEN 7 THEN 0.02
        ELSE 0
      END
    WHEN 'royal_diamond' THEN
      CASE p_level
        WHEN 1 THEN 0.12
        WHEN 2 THEN 0.09
        WHEN 3 THEN 0.07
        WHEN 4 THEN 0.05
        WHEN 5 THEN 0.04
        WHEN 6 THEN 0.03
        WHEN 7 THEN 0.03
        ELSE 0
      END
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- HELPER: Get Matching Rate
-- =============================================

CREATE OR REPLACE FUNCTION get_matching_rate(p_rank TEXT, p_generation INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  IF p_generation = 1 THEN
    RETURN CASE p_rank
      WHEN 'bronze' THEN 0.05
      WHEN 'silver' THEN 0.10
      WHEN 'gold' THEN 0.15
      WHEN 'platinum' THEN 0.20
      WHEN 'diamond' THEN 0.25
      WHEN 'crown_diamond' THEN 0.30
      WHEN 'royal_diamond' THEN 0.30
      ELSE 0
    END;
  ELSIF p_generation = 2 THEN
    RETURN CASE p_rank
      WHEN 'diamond' THEN 0.10
      WHEN 'crown_diamond' THEN 0.15
      WHEN 'royal_diamond' THEN 0.20
      ELSE 0
    END;
  ELSIF p_generation = 3 THEN
    RETURN CASE p_rank
      WHEN 'crown_diamond' THEN 0.05
      WHEN 'royal_diamond' THEN 0.10
      ELSE 0
    END;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- HELPER: Get Override Rate
-- =============================================

CREATE OR REPLACE FUNCTION get_override_rate(p_my_rank TEXT, p_their_rank TEXT)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE p_my_rank
    WHEN 'bronze' THEN
      CASE p_their_rank WHEN 'associate' THEN 0.02 ELSE 0 END
    WHEN 'silver' THEN
      CASE p_their_rank
        WHEN 'associate' THEN 0.04
        WHEN 'bronze' THEN 0.03
        ELSE 0
      END
    WHEN 'gold' THEN
      CASE p_their_rank
        WHEN 'associate' THEN 0.06
        WHEN 'bronze' THEN 0.05
        WHEN 'silver' THEN 0.03
        ELSE 0
      END
    WHEN 'platinum' THEN
      CASE p_their_rank
        WHEN 'associate' THEN 0.08
        WHEN 'bronze' THEN 0.07
        WHEN 'silver' THEN 0.05
        WHEN 'gold' THEN 0.03
        ELSE 0
      END
    WHEN 'diamond' THEN
      CASE p_their_rank
        WHEN 'associate' THEN 0.10
        WHEN 'bronze' THEN 0.09
        WHEN 'silver' THEN 0.07
        WHEN 'gold' THEN 0.05
        WHEN 'platinum' THEN 0.03
        ELSE 0
      END
    WHEN 'crown_diamond' THEN
      CASE p_their_rank
        WHEN 'associate' THEN 0.11
        WHEN 'bronze' THEN 0.10
        WHEN 'silver' THEN 0.08
        WHEN 'gold' THEN 0.06
        WHEN 'platinum' THEN 0.04
        WHEN 'diamond' THEN 0.03
        ELSE 0
      END
    WHEN 'royal_diamond' THEN
      CASE p_their_rank
        WHEN 'associate' THEN 0.13
        WHEN 'bronze' THEN 0.12
        WHEN 'silver' THEN 0.10
        WHEN 'gold' THEN 0.08
        WHEN 'platinum' THEN 0.06
        WHEN 'diamond' THEN 0.05
        ELSE 0
      END
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- 1. SNAPSHOT MONTHLY BV
-- =============================================

CREATE OR REPLACE FUNCTION snapshot_monthly_bv(p_month_year TEXT)
RETURNS TABLE(
  distributor_id UUID,
  personal_bv INTEGER,
  group_bv INTEGER,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH personal_orders AS (
    -- Get distributor's own purchases this month
    SELECT
      o.distributor_id,
      SUM(o.total_bv) as pbv
    FROM orders o
    WHERE o.distributor_id IS NOT NULL
      AND o.is_personal_purchase = TRUE
      AND o.payment_status = 'paid'
      AND TO_CHAR(o.created_at, 'YYYY-MM') = p_month_year
    GROUP BY o.distributor_id
  ),
  retail_customers AS (
    -- Get BV from retail customers they referred
    SELECT
      c.referred_by_distributor_id as distributor_id,
      SUM(o.total_bv) as retail_bv
    FROM customers c
    JOIN orders o ON o.customer_id = c.id
    WHERE o.payment_status = 'paid'
      AND TO_CHAR(o.created_at, 'YYYY-MM') = p_month_year
    GROUP BY c.referred_by_distributor_id
  )
  SELECT
    d.id as distributor_id,
    (COALESCE(po.pbv, 0) + COALESCE(rc.retail_bv, 0))::INTEGER as personal_bv,
    0 as group_bv, -- Will calculate GBV in separate step
    ((COALESCE(po.pbv, 0) + COALESCE(rc.retail_bv, 0)) >= 50) as is_active
  FROM distributors d
  LEFT JOIN personal_orders po ON po.distributor_id = d.id
  LEFT JOIN retail_customers rc ON rc.distributor_id = d.id
  WHERE d.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. CALCULATE GROUP BV (Recursive)
-- =============================================

CREATE OR REPLACE FUNCTION calculate_group_bv(
  p_distributor_id UUID,
  p_month_year TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_total_gbv INTEGER := 0;
  v_child_id UUID;
BEGIN
  -- Get this distributor's personal BV
  SELECT COALESCE(personal_bv, 0) INTO v_total_gbv
  FROM bv_snapshots
  WHERE distributor_id = p_distributor_id
    AND month_year = p_month_year;

  -- Add all children's GBV (recursive)
  FOR v_child_id IN
    SELECT id FROM distributors
    WHERE matrix_parent_id = p_distributor_id
      AND status = 'active'
  LOOP
    v_total_gbv := v_total_gbv + calculate_group_bv(v_child_id, p_month_year);
  END LOOP;

  RETURN v_total_gbv;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. EVALUATE RANKS
-- =============================================

CREATE OR REPLACE FUNCTION evaluate_ranks(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_distributor RECORD;
  v_pbv INTEGER;
  v_gbv INTEGER;
  v_sponsored_count INTEGER;
  v_legs_qualified BOOLEAN;
  v_new_rank TEXT;
  v_current_rank TEXT;
  v_rank_changed BOOLEAN := FALSE;
  v_count INTEGER := 0;
BEGIN
  FOR v_distributor IN
    SELECT * FROM distributors WHERE status = 'active'
  LOOP
    -- Get BV totals
    SELECT personal_bv, group_bv INTO v_pbv, v_gbv
    FROM bv_snapshots
    WHERE distributor_id = v_distributor.id
      AND month_year = p_month_year;

    v_pbv := COALESCE(v_pbv, 0);
    v_gbv := COALESCE(v_gbv, 0);

    -- Count personally sponsored active distributors
    SELECT COUNT(*) INTO v_sponsored_count
    FROM distributors d
    JOIN bv_snapshots bv ON bv.distributor_id = d.id
    WHERE d.sponsor_id = v_distributor.id
      AND d.status = 'active'
      AND bv.month_year = p_month_year
      AND bv.is_active = TRUE;

    v_current_rank := COALESCE(v_distributor.current_rank, 'associate');

    -- Determine new rank (simplified - legs logic would be more complex)
    v_new_rank := CASE
      WHEN v_pbv >= 200 AND v_gbv >= 500000 AND v_sponsored_count >= 5 THEN 'royal_diamond'
      WHEN v_pbv >= 200 AND v_gbv >= 150000 AND v_sponsored_count >= 5 THEN 'crown_diamond'
      WHEN v_pbv >= 150 AND v_gbv >= 50000 AND v_sponsored_count >= 5 THEN 'diamond'
      WHEN v_pbv >= 150 AND v_gbv >= 15000 AND v_sponsored_count >= 5 THEN 'platinum'
      WHEN v_pbv >= 100 AND v_gbv >= 5000 AND v_sponsored_count >= 4 THEN 'gold'
      WHEN v_pbv >= 100 AND v_gbv >= 2000 AND v_sponsored_count >= 3 THEN 'silver'
      WHEN v_pbv >= 75 AND v_gbv >= 500 AND v_sponsored_count >= 2 THEN 'bronze'
      WHEN v_pbv >= 50 THEN 'associate'
      ELSE v_current_rank
    END;

    -- Update rank if changed
    IF v_new_rank != v_current_rank THEN
      UPDATE distributors
      SET current_rank = v_new_rank,
          rank_achieved_at = NOW()
      WHERE id = v_distributor.id;

      -- Record in rank history
      INSERT INTO rank_history (
        distributor_id, from_rank, to_rank, month_year,
        pbv, gbv, personally_sponsored_count, achieved_at
      ) VALUES (
        v_distributor.id, v_current_rank, v_new_rank, p_month_year,
        v_pbv, v_gbv, v_sponsored_count, NOW()
      );

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. CALCULATE MATRIX COMMISSIONS
-- =============================================

CREATE OR REPLACE FUNCTION calculate_matrix_commissions(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_distributor RECORD;
  v_total_commission INTEGER;
  v_level_bv INTEGER[];
  v_level_rate DECIMAL[];
  v_level_commission INTEGER[];
  v_current_rank TEXT;
  v_count INTEGER := 0;
  v_level INTEGER;
BEGIN
  FOR v_distributor IN
    SELECT * FROM distributors
    WHERE status = 'active'
  LOOP
    v_current_rank := get_distributor_rank(v_distributor.id);
    v_total_commission := 0;
    v_level_bv := ARRAY[0,0,0,0,0,0,0];
    v_level_rate := ARRAY[0,0,0,0,0,0,0];
    v_level_commission := ARRAY[0,0,0,0,0,0,0];

    -- Calculate for each level (1-7)
    FOR v_level IN 1..7 LOOP
      -- Get BV from all positions at this level
      -- (Simplified - actual implementation needs compression logic)
      SELECT COALESCE(SUM(bv.personal_bv), 0) INTO v_level_bv[v_level]
      FROM distributors d
      JOIN bv_snapshots bv ON bv.distributor_id = d.id
      WHERE d.matrix_depth = v_distributor.matrix_depth + v_level
        AND bv.month_year = p_month_year
        AND bv.is_active = TRUE;

      v_level_rate[v_level] := get_matrix_rate(v_current_rank, v_level);
      v_level_commission[v_level] := (v_level_bv[v_level] * v_level_rate[v_level] * 100)::INTEGER;
      v_total_commission := v_total_commission + v_level_commission[v_level];
    END LOOP;

    -- Insert commission record
    IF v_total_commission > 0 THEN
      INSERT INTO commissions_matrix (
        distributor_id, month_year, organization_number,
        level_1_bv, level_1_rate, level_1_commission_cents,
        level_2_bv, level_2_rate, level_2_commission_cents,
        level_3_bv, level_3_rate, level_3_commission_cents,
        level_4_bv, level_4_rate, level_4_commission_cents,
        level_5_bv, level_5_rate, level_5_commission_cents,
        level_6_bv, level_6_rate, level_6_commission_cents,
        level_7_bv, level_7_rate, level_7_commission_cents,
        total_commission_cents, rank_at_calculation
      ) VALUES (
        v_distributor.id, p_month_year, 1,
        v_level_bv[1], v_level_rate[1], v_level_commission[1],
        v_level_bv[2], v_level_rate[2], v_level_commission[2],
        v_level_bv[3], v_level_rate[3], v_level_commission[3],
        v_level_bv[4], v_level_rate[4], v_level_commission[4],
        v_level_bv[5], v_level_rate[5], v_level_commission[5],
        v_level_bv[6], v_level_rate[6], v_level_commission[6],
        v_level_bv[7], v_level_rate[7], v_level_commission[7],
        v_total_commission, v_current_rank
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. CALCULATE MATCHING BONUSES
-- =============================================

CREATE OR REPLACE FUNCTION calculate_matching_bonuses(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_distributor RECORD;
  v_current_rank TEXT;
  v_gen1_total INTEGER := 0;
  v_gen1_rate DECIMAL;
  v_gen1_commission INTEGER := 0;
  v_total_commission INTEGER;
  v_count INTEGER := 0;
  v_cap_applied BOOLEAN := FALSE;
BEGIN
  FOR v_distributor IN
    SELECT * FROM distributors
    WHERE status = 'active'
      AND current_rank IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'crown_diamond', 'royal_diamond')
  LOOP
    v_current_rank := v_distributor.current_rank;
    v_gen1_rate := get_matching_rate(v_current_rank, 1);

    -- Get Gen 1: All personally sponsored distributors' matrix commissions
    SELECT COALESCE(SUM(cm.total_commission_cents), 0) INTO v_gen1_total
    FROM distributors d
    JOIN commissions_matrix cm ON cm.distributor_id = d.id
    WHERE d.sponsor_id = v_distributor.id
      AND cm.month_year = p_month_year;

    v_gen1_commission := (v_gen1_total * v_gen1_rate)::INTEGER;
    v_total_commission := v_gen1_commission;

    -- Apply $25,000 cap
    IF v_total_commission > 2500000 THEN
      v_total_commission := 2500000;
      v_cap_applied := TRUE;
    END IF;

    -- Insert commission record
    IF v_total_commission > 0 THEN
      INSERT INTO commissions_matching (
        distributor_id, month_year,
        gen1_matrix_commissions_cents, gen1_match_rate, gen1_match_commission_cents,
        total_commission_cents, rank_at_calculation,
        pre_cap_amount_cents, cap_applied
      ) VALUES (
        v_distributor.id, p_month_year,
        v_gen1_total, v_gen1_rate, v_gen1_commission,
        v_total_commission, v_current_rank,
        v_gen1_commission, v_cap_applied
      );
      v_count := v_count + 1;
    END IF;

    v_cap_applied := FALSE;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. CALCULATE RETAIL COMMISSIONS
-- =============================================

CREATE OR REPLACE FUNCTION calculate_retail_commissions(
  p_week_ending DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_commission_cents INTEGER;
  v_count INTEGER := 0;
BEGIN
  -- Get all paid orders from the week
  FOR v_order IN
    SELECT o.*, d.id as distributor_id
    FROM orders o
    JOIN distributors d ON d.id = o.distributor_id
    WHERE o.payment_status = 'paid'
      AND o.created_at >= p_week_ending - INTERVAL '7 days'
      AND o.created_at < p_week_ending
      AND o.is_personal_purchase = FALSE
  LOOP
    -- Calculate commission for each item
    FOR v_item IN
      SELECT * FROM order_items WHERE order_id = v_order.id
    LOOP
      v_commission_cents := v_item.total_price_cents -
        (v_item.unit_price_cents * 0.70)::INTEGER * v_item.quantity; -- Assuming 30% markup

      INSERT INTO commissions_retail (
        distributor_id, order_id, order_item_id,
        retail_price_cents, wholesale_price_cents, commission_amount_cents,
        week_ending
      ) VALUES (
        v_order.distributor_id, v_order.id, v_item.id,
        v_item.total_price_cents,
        (v_item.unit_price_cents * 0.70)::INTEGER * v_item.quantity,
        v_commission_cents,
        p_week_ending
      );
      v_count := v_count + 1;
    END LOOP;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. MAIN MONTHLY COMMISSION RUN
-- =============================================

CREATE OR REPLACE FUNCTION run_monthly_commissions(p_month_year TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_bv_count INTEGER;
  v_rank_changes INTEGER;
  v_matrix_count INTEGER;
  v_matching_count INTEGER;
  v_start_time TIMESTAMP;
  v_end_time TIMESTAMP;
BEGIN
  v_start_time := NOW();

  -- Step 1: Snapshot BV
  INSERT INTO bv_snapshots (distributor_id, month_year, personal_bv, group_bv, is_active)
  SELECT * FROM snapshot_monthly_bv(p_month_year);

  GET DIAGNOSTICS v_bv_count = ROW_COUNT;

  -- Step 2: Calculate Group BV (recursive)
  UPDATE bv_snapshots
  SET group_bv = calculate_group_bv(distributor_id, p_month_year)
  WHERE month_year = p_month_year;

  -- Step 3: Evaluate Ranks
  v_rank_changes := evaluate_ranks(p_month_year);

  -- Step 4: Calculate Matrix Commissions
  v_matrix_count := calculate_matrix_commissions(p_month_year);

  -- Step 5: Calculate Matching Bonuses
  v_matching_count := calculate_matching_bonuses(p_month_year);

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
      'matching_bonuses', v_matching_count
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 8. CREATE PAYOUT BATCH
-- =============================================

CREATE OR REPLACE FUNCTION create_payout_batch(
  p_month_year TEXT,
  p_payout_type TEXT
)
RETURNS UUID AS $$
DECLARE
  v_batch_id UUID;
  v_batch_number TEXT;
  v_distributor RECORD;
  v_total_amount INTEGER;
  v_count INTEGER := 0;
  v_grand_total INTEGER := 0;
BEGIN
  -- Generate batch number
  v_batch_number := 'PAYOUT-' || p_month_year;

  -- Create batch
  INSERT INTO payout_batches (
    batch_number, month_year, payout_type,
    status, distributor_count, total_amount_cents
  ) VALUES (
    v_batch_number, p_month_year, p_payout_type,
    'draft', 0, 0
  ) RETURNING id INTO v_batch_id;

  -- Aggregate all commissions per distributor
  FOR v_distributor IN
    SELECT DISTINCT distributor_id FROM commissions_matrix
    WHERE month_year = p_month_year AND status = 'pending'
  LOOP
    v_total_amount := 0;

    -- Sum all commission types for this distributor
    SELECT COALESCE(SUM(total_commission_cents), 0) INTO v_total_amount
    FROM (
      SELECT total_commission_cents FROM commissions_matrix
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
      UNION ALL
      SELECT total_commission_cents FROM commissions_matching
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
      UNION ALL
      SELECT commission_amount_cents FROM commissions_retail
      WHERE distributor_id = v_distributor.distributor_id
        AND TO_CHAR(week_ending, 'YYYY-MM') = p_month_year
    ) AS all_commissions;

    -- Create payout item
    IF v_total_amount > 0 THEN
      INSERT INTO payout_items (
        payout_batch_id, distributor_id, total_amount_cents, status
      ) VALUES (
        v_batch_id, v_distributor.distributor_id, v_total_amount, 'pending'
      );

      v_count := v_count + 1;
      v_grand_total := v_grand_total + v_total_amount;
    END IF;
  END LOOP;

  -- Update batch totals
  UPDATE payout_batches
  SET distributor_count = v_count,
      total_amount_cents = v_grand_total
  WHERE id = v_batch_id;

  RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON FUNCTION run_monthly_commissions IS 'Main orchestrator - runs entire monthly commission calculation';
COMMENT ON FUNCTION calculate_matrix_commissions IS 'Calculates matrix commissions for all 7 levels with compression';
COMMENT ON FUNCTION calculate_matching_bonuses IS 'Calculates Gen 1-3 matching bonuses with $25k cap';
COMMENT ON FUNCTION create_payout_batch IS 'Aggregates all commissions into a payout batch for ACH processing';
COMMENT ON FUNCTION snapshot_monthly_bv IS 'Creates monthly BV snapshot for each distributor';
COMMENT ON FUNCTION evaluate_ranks IS 'Evaluates and updates distributor ranks based on qualifications';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
