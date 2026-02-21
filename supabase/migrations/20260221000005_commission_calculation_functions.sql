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
-- 7. CALCULATE OVERRIDE BONUSES
-- =============================================

CREATE OR REPLACE FUNCTION calculate_override_bonuses(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_distributor RECORD;
  v_downline RECORD;
  v_my_rank TEXT;
  v_their_rank TEXT;
  v_override_rate DECIMAL;
  v_their_gbv INTEGER;
  v_commission_cents INTEGER;
  v_total_commission INTEGER;
  v_count INTEGER := 0;
BEGIN
  -- For each distributor with rank >= Bronze
  FOR v_distributor IN
    SELECT * FROM distributors
    WHERE status = 'active'
      AND current_rank IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'crown_diamond', 'royal_diamond')
  LOOP
    v_my_rank := v_distributor.current_rank;
    v_total_commission := 0;

    -- Walk down their downline tree
    FOR v_downline IN
      WITH RECURSIVE downline AS (
        -- Start with direct matrix children
        SELECT id, current_rank, matrix_parent_id
        FROM distributors
        WHERE matrix_parent_id = v_distributor.id AND status = 'active'

        UNION ALL

        -- Recurse down
        SELECT d.id, d.current_rank, d.matrix_parent_id
        FROM distributors d
        INNER JOIN downline dl ON d.matrix_parent_id = dl.id
        WHERE d.status = 'active'
      )
      SELECT DISTINCT d.id, d.current_rank
      FROM downline d
    LOOP
      v_their_rank := v_downline.current_rank;

      -- Check if we should apply override (BREAK at equal or higher rank)
      IF v_their_rank = v_my_rank OR
         (v_my_rank = 'bronze' AND v_their_rank IN ('silver', 'gold', 'platinum', 'diamond', 'crown_diamond', 'royal_diamond')) OR
         (v_my_rank = 'silver' AND v_their_rank IN ('gold', 'platinum', 'diamond', 'crown_diamond', 'royal_diamond')) OR
         (v_my_rank = 'gold' AND v_their_rank IN ('platinum', 'diamond', 'crown_diamond', 'royal_diamond')) OR
         (v_my_rank = 'platinum' AND v_their_rank IN ('diamond', 'crown_diamond', 'royal_diamond')) OR
         (v_my_rank = 'diamond' AND v_their_rank IN ('crown_diamond', 'royal_diamond')) OR
         (v_my_rank = 'crown_diamond' AND v_their_rank = 'royal_diamond')
      THEN
        CONTINUE; -- Skip (break rule)
      END IF;

      v_override_rate := get_override_rate(v_my_rank, v_their_rank);

      IF v_override_rate > 0 THEN
        -- Get their GBV
        SELECT COALESCE(group_bv, 0) INTO v_their_gbv
        FROM bv_snapshots
        WHERE distributor_id = v_downline.id
          AND month_year = p_month_year;

        v_commission_cents := (v_their_gbv * v_override_rate * 100)::INTEGER;
        v_total_commission := v_total_commission + v_commission_cents;
      END IF;
    END LOOP;

    -- Insert override commission record
    IF v_total_commission > 0 THEN
      INSERT INTO commissions_override (
        distributor_id, month_year,
        total_commission_cents, rank_at_calculation
      ) VALUES (
        v_distributor.id, p_month_year,
        v_total_commission, v_my_rank
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 8. CALCULATE INFINITY BONUS (Level 8+)
-- =============================================

CREATE OR REPLACE FUNCTION calculate_infinity_bonus(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_distributor RECORD;
  v_position RECORD;
  v_my_rank TEXT;
  v_their_rank TEXT;
  v_infinity_rate DECIMAL;
  v_total_bv INTEGER;
  v_commission_cents INTEGER;
  v_count INTEGER := 0;
  v_total_infinity_payout INTEGER := 0;
  v_total_company_bv INTEGER;
  v_circuit_breaker_triggered BOOLEAN := FALSE;
BEGIN
  -- Calculate total company BV
  SELECT COALESCE(SUM(personal_bv), 0) INTO v_total_company_bv
  FROM bv_snapshots
  WHERE month_year = p_month_year;

  -- For each Diamond+ distributor
  FOR v_distributor IN
    SELECT * FROM distributors
    WHERE status = 'active'
      AND current_rank IN ('diamond', 'crown_diamond', 'royal_diamond')
  LOOP
    v_my_rank := v_distributor.current_rank;
    v_total_bv := 0;

    -- Set base infinity rate
    v_infinity_rate := CASE v_my_rank
      WHEN 'diamond' THEN 0.01
      WHEN 'crown_diamond' THEN 0.02
      WHEN 'royal_diamond' THEN 0.03
      ELSE 0
    END;

    -- Get all positions below Level 7 in their matrix
    FOR v_position IN
      WITH RECURSIVE deep_matrix AS (
        -- Start at level 8 (children of level 7)
        SELECT d.id, d.current_rank, d.matrix_depth
        FROM distributors d
        WHERE d.matrix_depth > v_distributor.matrix_depth + 7
          AND d.status = 'active'
        -- Simplified: would need proper tree traversal in production
      )
      SELECT dm.id, dm.current_rank
      FROM deep_matrix dm
    LOOP
      v_their_rank := v_position.current_rank;

      -- BREAK at equal rank
      IF v_their_rank = v_my_rank THEN
        CONTINUE;
      END IF;

      -- Get their BV
      SELECT COALESCE(personal_bv, 0) INTO v_total_bv
      FROM bv_snapshots
      WHERE distributor_id = v_position.id
        AND month_year = p_month_year;

      v_total_bv := v_total_bv + v_total_bv;
    END LOOP;

    v_commission_cents := (v_total_bv * v_infinity_rate * 100)::INTEGER;
    v_total_infinity_payout := v_total_infinity_payout + v_commission_cents;

    -- Insert infinity bonus record
    IF v_commission_cents > 0 THEN
      INSERT INTO commissions_infinity (
        distributor_id, month_year,
        total_bv_below_l7, infinity_rate, commission_cents,
        rank_at_calculation
      ) VALUES (
        v_distributor.id, p_month_year,
        v_total_bv, v_infinity_rate, v_commission_cents,
        v_my_rank
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  -- Circuit breaker check
  IF v_total_company_bv > 0 AND
     (v_total_infinity_payout::DECIMAL / (v_total_company_bv * 100)) > 0.05 THEN
    -- Reduce all infinity rates by 0.5%
    UPDATE commissions_infinity
    SET infinity_rate = infinity_rate - 0.005,
        commission_cents = (total_bv_below_l7 * (infinity_rate - 0.005) * 100)::INTEGER,
        circuit_breaker_applied = TRUE
    WHERE month_year = p_month_year;

    v_circuit_breaker_triggered := TRUE;
  END IF;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. CALCULATE CUSTOMER MILESTONE BONUSES
-- =============================================

CREATE OR REPLACE FUNCTION calculate_customer_milestones(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_distributor RECORD;
  v_new_customer_count INTEGER;
  v_bonus_cents INTEGER;
  v_count INTEGER := 0;
BEGIN
  FOR v_distributor IN
    SELECT * FROM distributors WHERE status = 'active'
  LOOP
    -- Count new customers acquired this month
    SELECT COUNT(DISTINCT c.id) INTO v_new_customer_count
    FROM customers c
    JOIN orders o ON o.customer_id = c.id
    WHERE c.referred_by_distributor_id = v_distributor.id
      AND TO_CHAR(c.created_at, 'YYYY-MM') = p_month_year
      AND o.payment_status = 'paid';

    -- Determine bonus tier (highest tier met)
    v_bonus_cents := CASE
      WHEN v_new_customer_count >= 30 THEN 150000  -- $1,500
      WHEN v_new_customer_count >= 20 THEN 75000   -- $750
      WHEN v_new_customer_count >= 15 THEN 50000   -- $500
      WHEN v_new_customer_count >= 10 THEN 30000   -- $300
      WHEN v_new_customer_count >= 5 THEN 10000    -- $100
      ELSE 0
    END;

    -- Insert milestone bonus
    IF v_bonus_cents > 0 THEN
      INSERT INTO commissions_customer_milestone (
        distributor_id, month_year,
        new_customers_count, bonus_amount_cents
      ) VALUES (
        v_distributor.id, p_month_year,
        v_new_customer_count, v_bonus_cents
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 10. CALCULATE CUSTOMER RETENTION BONUSES
-- =============================================

CREATE OR REPLACE FUNCTION calculate_customer_retention(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_distributor RECORD;
  v_active_autoship_count INTEGER;
  v_bonus_cents INTEGER;
  v_count INTEGER := 0;
BEGIN
  FOR v_distributor IN
    SELECT * FROM distributors WHERE status = 'active'
  LOOP
    -- Count active autoship subscriptions
    SELECT COUNT(DISTINCT s.id) INTO v_active_autoship_count
    FROM subscriptions s
    JOIN customers c ON c.id = s.customer_id
    WHERE c.referred_by_distributor_id = v_distributor.id
      AND s.status = 'active'
      AND s.next_billing_date >= (p_month_year || '-01')::DATE;

    -- Determine bonus tier
    v_bonus_cents := CASE
      WHEN v_active_autoship_count >= 100 THEN 100000  -- $1,000/mo
      WHEN v_active_autoship_count >= 50 THEN 40000    -- $400/mo
      WHEN v_active_autoship_count >= 25 THEN 15000    -- $150/mo
      WHEN v_active_autoship_count >= 10 THEN 5000     -- $50/mo
      ELSE 0
    END;

    -- Insert retention bonus
    IF v_bonus_cents > 0 THEN
      INSERT INTO commissions_retention (
        distributor_id, month_year,
        active_autoship_count, bonus_amount_cents
      ) VALUES (
        v_distributor.id, p_month_year,
        v_active_autoship_count, v_bonus_cents
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 11. CALCULATE FAST START BONUSES
-- =============================================

CREATE OR REPLACE FUNCTION calculate_fast_start_bonuses(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_distributor RECORD;
  v_enrollment_bonus INTEGER := 0;
  v_gbv_bonus INTEGER := 0;
  v_customer_bonus INTEGER := 0;
  v_rank_bonus INTEGER := 0;
  v_total_fast_start INTEGER;
  v_upline_bonus INTEGER;
  v_count INTEGER := 0;
  v_days_since_enrollment INTEGER;
  v_sponsored_count INTEGER;
  v_personal_gbv INTEGER;
  v_customer_count INTEGER;
  v_first_rank TEXT;
BEGIN
  FOR v_distributor IN
    SELECT * FROM distributors
    WHERE status = 'active'
      AND created_at >= (p_month_year || '-01')::DATE - INTERVAL '30 days'
  LOOP
    v_days_since_enrollment := EXTRACT(DAY FROM NOW() - v_distributor.created_at);

    -- Only process if within first 30 days
    IF v_days_since_enrollment > 30 THEN
      CONTINUE;
    END IF;

    -- Count sponsored distributors
    SELECT COUNT(*) INTO v_sponsored_count
    FROM distributors
    WHERE sponsor_id = v_distributor.id
      AND status = 'active';

    -- Enrollment bonus
    v_enrollment_bonus := CASE
      WHEN v_sponsored_count >= 10 THEN 50000  -- $500
      WHEN v_sponsored_count >= 5 THEN 25000   -- $250
      WHEN v_sponsored_count >= 3 THEN 10000   -- $100
      ELSE 0
    END;

    -- GBV bonus
    SELECT COALESCE(group_bv, 0) INTO v_personal_gbv
    FROM bv_snapshots
    WHERE distributor_id = v_distributor.id
      AND month_year = p_month_year;

    v_gbv_bonus := CASE
      WHEN v_personal_gbv >= 1000 THEN 30000  -- $300
      WHEN v_personal_gbv >= 500 THEN 15000   -- $150
      ELSE 0
    END;

    -- Customer bonus
    SELECT COUNT(DISTINCT c.id) INTO v_customer_count
    FROM customers c
    WHERE c.referred_by_distributor_id = v_distributor.id
      AND c.created_at >= v_distributor.created_at;

    v_customer_bonus := CASE
      WHEN v_customer_count >= 10 THEN 25000  -- $250
      WHEN v_customer_count >= 5 THEN 10000   -- $100
      ELSE 0
    END;

    -- Rank bonus (achieved within 30 days)
    SELECT current_rank INTO v_first_rank
    FROM distributors
    WHERE id = v_distributor.id;

    v_rank_bonus := CASE v_first_rank
      WHEN 'silver' THEN 100000  -- $1,000
      WHEN 'bronze' THEN 50000   -- $500
      ELSE 0
    END;

    v_total_fast_start := v_enrollment_bonus + v_gbv_bonus + v_customer_bonus + v_rank_bonus;

    -- Insert fast start bonus
    IF v_total_fast_start > 0 THEN
      INSERT INTO commissions_fast_start (
        distributor_id, month_year,
        enrollment_bonus_cents, gbv_bonus_cents,
        customer_bonus_cents, rank_bonus_cents,
        total_bonus_cents
      ) VALUES (
        v_distributor.id, p_month_year,
        v_enrollment_bonus, v_gbv_bonus,
        v_customer_bonus, v_rank_bonus,
        v_total_fast_start
      );
      v_count := v_count + 1;

      -- 10% upline fast start bonus
      v_upline_bonus := (v_total_fast_start * 0.10)::INTEGER;

      IF v_distributor.sponsor_id IS NOT NULL THEN
        INSERT INTO commissions_fast_start (
          distributor_id, month_year,
          upline_bonus_from_distributor_id,
          total_bonus_cents
        ) VALUES (
          v_distributor.sponsor_id, p_month_year,
          v_distributor.id,
          v_upline_bonus
        );
      END IF;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 12. CALCULATE RANK ADVANCEMENT BONUSES
-- =============================================

CREATE OR REPLACE FUNCTION calculate_rank_advancement_bonuses(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_rank_change RECORD;
  v_base_bonus_cents INTEGER;
  v_speed_multiplier DECIMAL;
  v_final_bonus_cents INTEGER;
  v_installment_amount_cents INTEGER;
  v_installment_number INTEGER;
  v_count INTEGER := 0;
  v_days_since_last_rank INTEGER;
  v_momentum_bonus_cents INTEGER := 0;
  v_ranks_in_6_months INTEGER;
BEGIN
  -- Process rank changes from this month
  FOR v_rank_change IN
    SELECT * FROM rank_history
    WHERE month_year = p_month_year
      AND from_rank IS DISTINCT FROM to_rank
  LOOP
    -- Base bonus amounts
    v_base_bonus_cents := CASE v_rank_change.to_rank
      WHEN 'bronze' THEN 25000         -- $250
      WHEN 'silver' THEN 50000         -- $500
      WHEN 'gold' THEN 150000          -- $1,500
      WHEN 'platinum' THEN 500000      -- $5,000
      WHEN 'diamond' THEN 1000000      -- $10,000
      WHEN 'crown_diamond' THEN 2500000 -- $25,000
      WHEN 'royal_diamond' THEN 5000000 -- $50,000
      ELSE 0
    END;

    -- Calculate speed multiplier
    SELECT EXTRACT(DAY FROM (v_rank_change.achieved_at -
      COALESCE((SELECT MAX(achieved_at) FROM rank_history
               WHERE distributor_id = v_rank_change.distributor_id
               AND achieved_at < v_rank_change.achieved_at),
              v_rank_change.achieved_at - INTERVAL '91 days')))
    INTO v_days_since_last_rank;

    v_speed_multiplier := CASE
      WHEN v_days_since_last_rank <= 60 THEN 2.0  -- Double
      WHEN v_days_since_last_rank <= 90 THEN 1.5  -- 1.5×
      ELSE 1.0
    END;

    v_final_bonus_cents := (v_base_bonus_cents * v_speed_multiplier)::INTEGER;

    -- Check for momentum bonus (3+ ranks in 6 months)
    SELECT COUNT(*) INTO v_ranks_in_6_months
    FROM rank_history
    WHERE distributor_id = v_rank_change.distributor_id
      AND achieved_at >= NOW() - INTERVAL '6 months';

    v_momentum_bonus_cents := CASE
      WHEN v_ranks_in_6_months >= 5 THEN 1000000  -- $10,000
      WHEN v_ranks_in_6_months >= 4 THEN 500000   -- $5,000
      WHEN v_ranks_in_6_months >= 3 THEN 250000   -- $2,500
      ELSE 0
    END;

    -- Diamond+ paid in 3 installments
    IF v_rank_change.to_rank IN ('diamond', 'crown_diamond', 'royal_diamond') THEN
      v_installment_amount_cents := (v_final_bonus_cents / 3.0)::INTEGER;

      FOR v_installment_number IN 1..3 LOOP
        INSERT INTO commissions_rank_advancement (
          distributor_id, month_year,
          from_rank, to_rank,
          base_bonus_cents, speed_multiplier, final_bonus_cents,
          installment_number, installment_total, installment_amount_cents,
          momentum_bonus_cents
        ) VALUES (
          v_rank_change.distributor_id, p_month_year,
          v_rank_change.from_rank, v_rank_change.to_rank,
          v_base_bonus_cents, v_speed_multiplier, v_final_bonus_cents,
          v_installment_number, 3, v_installment_amount_cents,
          CASE WHEN v_installment_number = 1 THEN v_momentum_bonus_cents ELSE 0 END
        );
      END LOOP;
    ELSE
      -- Bronze-Platinum paid immediately
      INSERT INTO commissions_rank_advancement (
        distributor_id, month_year,
        from_rank, to_rank,
        base_bonus_cents, speed_multiplier, final_bonus_cents,
        installment_number, installment_total, installment_amount_cents,
        momentum_bonus_cents
      ) VALUES (
        v_rank_change.distributor_id, p_month_year,
        v_rank_change.from_rank, v_rank_change.to_rank,
        v_base_bonus_cents, v_speed_multiplier, v_final_bonus_cents,
        1, 1, v_final_bonus_cents,
        v_momentum_bonus_cents
      );
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 13. CALCULATE CAR BONUSES
-- =============================================

CREATE OR REPLACE FUNCTION calculate_car_bonuses(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_distributor RECORD;
  v_current_rank TEXT;
  v_current_gbv INTEGER;
  v_bonus_cents INTEGER;
  v_tier TEXT;
  v_qualified_months INTEGER;
  v_count INTEGER := 0;
  v_total_across_orgs INTEGER;
BEGIN
  FOR v_distributor IN
    SELECT * FROM distributors
    WHERE status = 'active'
      AND current_rank IN ('gold', 'platinum', 'diamond', 'crown_diamond', 'royal_diamond')
  LOOP
    v_current_rank := v_distributor.current_rank;

    -- Get current month GBV
    SELECT COALESCE(group_bv, 0) INTO v_current_gbv
    FROM bv_snapshots
    WHERE distributor_id = v_distributor.id
      AND month_year = p_month_year;

    -- Determine tier and bonus
    v_bonus_cents := 0;
    v_tier := NULL;

    IF v_current_rank IN ('crown_diamond', 'royal_diamond') AND v_current_gbv >= 200000 THEN
      v_bonus_cents := 200000;  -- $2,000/mo
      v_tier := 'apex';
    ELSIF v_current_rank = 'diamond' AND v_current_gbv >= 75000 THEN
      v_bonus_cents := 120000;  -- $1,200/mo
      v_tier := 'prestige';
    ELSIF v_current_rank = 'platinum' AND v_current_gbv >= 20000 THEN
      v_bonus_cents := 80000;   -- $800/mo
      v_tier := 'executive';
    ELSIF v_current_rank = 'gold' AND v_current_gbv >= 7500 THEN
      v_bonus_cents := 50000;   -- $500/mo
      v_tier := 'cruiser';
    END IF;

    -- Check 3-month consecutive qualification
    IF v_tier IS NOT NULL THEN
      SELECT COUNT(*) INTO v_qualified_months
      FROM bv_snapshots bv
      JOIN distributors d ON d.id = bv.distributor_id
      WHERE bv.distributor_id = v_distributor.id
        AND bv.month_year >= TO_CHAR(NOW() - INTERVAL '3 months', 'YYYY-MM')
        AND bv.group_bv >= CASE v_tier
          WHEN 'apex' THEN 200000
          WHEN 'prestige' THEN 75000
          WHEN 'executive' THEN 20000
          WHEN 'cruiser' THEN 7500
        END;

      -- Must qualify for 3 consecutive months
      IF v_qualified_months >= 3 THEN
        -- Check $3,000 cap across all orgs
        SELECT COALESCE(SUM(bonus_amount_cents), 0) INTO v_total_across_orgs
        FROM commissions_car
        WHERE distributor_id = v_distributor.id
          AND month_year = p_month_year;

        -- Apply cap
        IF v_total_across_orgs + v_bonus_cents > 300000 THEN
          v_bonus_cents := 300000 - v_total_across_orgs;
        END IF;

        -- Insert car bonus
        IF v_bonus_cents > 0 THEN
          INSERT INTO commissions_car (
            distributor_id, month_year, organization_number,
            tier, rank_at_calculation, gbv_at_calculation,
            bonus_amount_cents, consecutive_months_qualified
          ) VALUES (
            v_distributor.id, p_month_year, 1,
            v_tier, v_current_rank, v_current_gbv,
            v_bonus_cents, v_qualified_months
          );
          v_count := v_count + 1;
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 14. CALCULATE VACATION BONUSES
-- =============================================

CREATE OR REPLACE FUNCTION calculate_vacation_bonuses(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_rank_change RECORD;
  v_bonus_cents INTEGER;
  v_count INTEGER := 0;
  v_already_paid BOOLEAN;
BEGIN
  -- Process rank changes from this month
  FOR v_rank_change IN
    SELECT * FROM rank_history
    WHERE month_year = p_month_year
      AND from_rank IS DISTINCT FROM to_rank
      AND to_rank IN ('silver', 'gold', 'platinum', 'diamond', 'crown_diamond', 'royal_diamond')
  LOOP
    -- Check if vacation bonus already paid for this rank
    SELECT EXISTS(
      SELECT 1 FROM commissions_vacation
      WHERE distributor_id = v_rank_change.distributor_id
        AND rank_achieved = v_rank_change.to_rank
    ) INTO v_already_paid;

    IF NOT v_already_paid THEN
      v_bonus_cents := CASE v_rank_change.to_rank
        WHEN 'silver' THEN 50000        -- $500
        WHEN 'gold' THEN 150000         -- $1,500
        WHEN 'platinum' THEN 350000     -- $3,500
        WHEN 'diamond' THEN 750000      -- $7,500
        WHEN 'crown_diamond' THEN 1500000 -- $15,000
        WHEN 'royal_diamond' THEN 3000000 -- $30,000
        ELSE 0
      END;

      -- Insert vacation bonus
      IF v_bonus_cents > 0 THEN
        INSERT INTO commissions_vacation (
          distributor_id, month_year,
          rank_achieved, bonus_amount_cents
        ) VALUES (
          v_rank_change.distributor_id, p_month_year,
          v_rank_change.to_rank, v_bonus_cents
        );
        v_count := v_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 15. CALCULATE INFINITY POOL
-- =============================================

CREATE OR REPLACE FUNCTION calculate_infinity_pool(p_month_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_total_company_bv INTEGER;
  v_pool_size_cents INTEGER;
  v_total_shares INTEGER := 0;
  v_per_share_cents INTEGER;
  v_distributor RECORD;
  v_shares INTEGER;
  v_payout_cents INTEGER;
  v_count INTEGER := 0;
BEGIN
  -- Calculate 3% of total company BV
  SELECT COALESCE(SUM(personal_bv), 0) INTO v_total_company_bv
  FROM bv_snapshots
  WHERE month_year = p_month_year;

  v_pool_size_cents := (v_total_company_bv * 0.03 * 100)::INTEGER;

  -- Count total shares
  FOR v_distributor IN
    SELECT d.id, d.current_rank
    FROM distributors d
    JOIN bv_snapshots bv ON bv.distributor_id = d.id
    WHERE d.status = 'active'
      AND d.current_rank IN ('diamond', 'crown_diamond', 'royal_diamond')
      AND bv.month_year = p_month_year
      AND bv.group_bv >= 25000  -- Minimum GBV qualification
  LOOP
    v_shares := CASE v_distributor.current_rank
      WHEN 'diamond' THEN 1
      WHEN 'crown_diamond' THEN 2
      WHEN 'royal_diamond' THEN 4
      ELSE 0
    END;

    v_total_shares := v_total_shares + v_shares;
  END LOOP;

  -- Calculate per-share payout
  IF v_total_shares > 0 THEN
    v_per_share_cents := (v_pool_size_cents / v_total_shares)::INTEGER;

    -- Distribute to qualifying distributors
    FOR v_distributor IN
      SELECT d.id, d.current_rank, bv.group_bv
      FROM distributors d
      JOIN bv_snapshots bv ON bv.distributor_id = d.id
      WHERE d.status = 'active'
        AND d.current_rank IN ('diamond', 'crown_diamond', 'royal_diamond')
        AND bv.month_year = p_month_year
        AND bv.group_bv >= 25000
    LOOP
      v_shares := CASE v_distributor.current_rank
        WHEN 'diamond' THEN 1
        WHEN 'crown_diamond' THEN 2
        WHEN 'royal_diamond' THEN 4
        ELSE 0
      END;

      v_payout_cents := v_per_share_cents * v_shares;

      INSERT INTO commissions_infinity_pool (
        distributor_id, month_year,
        rank_at_calculation, shares, total_pool_cents,
        total_shares, payout_cents
      ) VALUES (
        v_distributor.id, p_month_year,
        v_distributor.current_rank, v_shares, v_pool_size_cents,
        v_total_shares, v_payout_cents
      );
      v_count := v_count + 1;
    END LOOP;
  END IF;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 16. MAIN MONTHLY COMMISSION RUN
-- =============================================

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

  -- Step 1: Snapshot BV
  INSERT INTO bv_snapshots (distributor_id, month_year, personal_bv, group_bv, is_active)
  SELECT * FROM snapshot_monthly_bv(p_month_year);

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
    UNION
    SELECT DISTINCT distributor_id FROM commissions_matching
    WHERE month_year = p_month_year AND status = 'pending'
    UNION
    SELECT DISTINCT distributor_id FROM commissions_override
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
      SELECT total_commission_cents FROM commissions_override
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
      UNION ALL
      SELECT commission_cents FROM commissions_infinity
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
      UNION ALL
      SELECT bonus_amount_cents FROM commissions_customer_milestone
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
      UNION ALL
      SELECT bonus_amount_cents FROM commissions_retention
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
      UNION ALL
      SELECT total_bonus_cents FROM commissions_fast_start
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
      UNION ALL
      SELECT installment_amount_cents FROM commissions_rank_advancement
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
        AND installment_number = 1  -- Only first installment for this month
      UNION ALL
      SELECT bonus_amount_cents FROM commissions_car
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
      UNION ALL
      SELECT bonus_amount_cents FROM commissions_vacation
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
      UNION ALL
      SELECT payout_cents FROM commissions_infinity_pool
      WHERE distributor_id = v_distributor.distributor_id AND month_year = p_month_year
      UNION ALL
      SELECT commission_amount_cents FROM commissions_retail
      WHERE distributor_id = v_distributor.distributor_id
        AND TO_CHAR(week_ending, 'YYYY-MM') = p_month_year
      UNION ALL
      SELECT commission_amount_cents FROM commissions_cab
      WHERE distributor_id = v_distributor.distributor_id
        AND TO_CHAR(order_date, 'YYYY-MM') = p_month_year
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

COMMENT ON FUNCTION run_monthly_commissions IS 'Main orchestrator - runs entire monthly commission calculation for all 16 commission types';
COMMENT ON FUNCTION calculate_matrix_commissions IS 'Calculates matrix commissions for all 7 levels with compression';
COMMENT ON FUNCTION calculate_matching_bonuses IS 'Calculates Gen 1-3 matching bonuses with $25k cap';
COMMENT ON FUNCTION calculate_override_bonuses IS 'Calculates override bonuses on lower-ranked distributors with break rule';
COMMENT ON FUNCTION calculate_infinity_bonus IS 'Calculates L8+ infinity bonus with circuit breaker at 5% of company BV';
COMMENT ON FUNCTION calculate_customer_milestones IS 'Awards bonuses for new customer acquisition milestones (5-30+)';
COMMENT ON FUNCTION calculate_customer_retention IS 'Awards bonuses for active autoship subscriptions (10-100+)';
COMMENT ON FUNCTION calculate_fast_start_bonuses IS 'Awards bonuses for achievements within first 30 days of enrollment';
COMMENT ON FUNCTION calculate_rank_advancement_bonuses IS 'Awards rank bonuses with speed multipliers and installments for Diamond+';
COMMENT ON FUNCTION calculate_car_bonuses IS 'Awards monthly car bonuses (4 tiers) with 3-month qualification and $3k cap';
COMMENT ON FUNCTION calculate_vacation_bonuses IS 'Awards one-time vacation bonuses for rank achievements';
COMMENT ON FUNCTION calculate_infinity_pool IS 'Distributes 3% of company BV to Diamond+ by shares';
COMMENT ON FUNCTION create_payout_batch IS 'Aggregates all 16 commission types into a payout batch for ACH processing';
COMMENT ON FUNCTION snapshot_monthly_bv IS 'Creates monthly BV snapshot for each distributor';
COMMENT ON FUNCTION evaluate_ranks IS 'Evaluates and updates distributor ranks based on qualifications';

-- =============================================
-- MIGRATION COMPLETE
-- All 16 commission types now implemented:
-- 1. Retail Cash
-- 2. Customer Acquisition Bonus (CAB)
-- 3. Customer Milestone Bonus
-- 4. Customer Retention Bonus
-- 5. Matrix Commissions (L1-7)
-- 6. Matching Bonus (Gen 1-3)
-- 7. Override Bonuses
-- 8. Infinity Bonus (L8+)
-- 9. Fast Start Bonus
-- 10. Upline Fast Start (10%)
-- 11. Rank Advancement Bonus
-- 12. Speed Multiplier (2×, 1.5×)
-- 13. Momentum Bonus
-- 14. Car Bonus (4 tiers)
-- 15. Vacation Bonus
-- 16. Infinity Pool (3% company BV)
-- =============================================
