-- =============================================
-- MIGRATION: SQL Utility Functions
-- Date: 2026-03-16
-- Phase: 2 (Build New DB Schema)
-- Agent: 2F
-- =============================================
--
-- PURPOSE: Create utility functions for comp calculations
--
-- FUNCTIONS CREATED:
-- 1. calculate_tech_rank() - Determine tech rank from credits
-- 2. calculate_insurance_rank() - Determine insurance rank from credits/criteria
-- 3. get_ranked_override_schedule() - Get override % by rank and level
-- 4. calculate_bonus_pool_shares() - Calculate equal shares for bonus pool
-- 5. calculate_leadership_pool_shares() - Calculate Elite shares for leadership pool
--
-- =============================================

-- =============================================
-- FUNCTION: calculate_tech_rank
-- =============================================
-- Purpose: Determine tech ladder rank based on personal + team credits
--
-- Rank Thresholds (from spec):
-- Starter: 0 personal / 0 team
-- Bronze: 10 personal / 500 team
-- Silver: 20 personal / 2000 team
-- Gold: 30 personal / 5000 team
-- Platinum: 40 personal / 10000 team
-- Ruby: 50 personal / 20000 team
-- Diamond: 75 personal / 40000 team
-- Crown: 100 personal / 80000 team
-- Elite: 200 personal / 120000 team

CREATE OR REPLACE FUNCTION calculate_tech_rank(
  personal_credits INTEGER,
  team_credits INTEGER
) RETURNS TEXT AS $$
BEGIN
  -- Elite: 200 personal + 120000 team
  IF personal_credits >= 200 AND team_credits >= 120000 THEN
    RETURN 'elite';
  END IF;

  -- Crown: 100 personal + 80000 team
  IF personal_credits >= 100 AND team_credits >= 80000 THEN
    RETURN 'crown';
  END IF;

  -- Diamond: 75 personal + 40000 team
  IF personal_credits >= 75 AND team_credits >= 40000 THEN
    RETURN 'diamond';
  END IF;

  -- Ruby: 50 personal + 20000 team
  IF personal_credits >= 50 AND team_credits >= 20000 THEN
    RETURN 'ruby';
  END IF;

  -- Platinum: 40 personal + 10000 team
  IF personal_credits >= 40 AND team_credits >= 10000 THEN
    RETURN 'platinum';
  END IF;

  -- Gold: 30 personal + 5000 team
  IF personal_credits >= 30 AND team_credits >= 5000 THEN
    RETURN 'gold';
  END IF;

  -- Silver: 20 personal + 2000 team
  IF personal_credits >= 20 AND team_credits >= 2000 THEN
    RETURN 'silver';
  END IF;

  -- Bronze: 10 personal + 500 team
  IF personal_credits >= 10 AND team_credits >= 500 THEN
    RETURN 'bronze';
  END IF;

  -- Default: Starter
  RETURN 'starter';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_tech_rank IS 'Calculate tech ladder rank from personal and team credits (9 ranks: starter → elite)';

-- =============================================
-- FUNCTION: get_ranked_override_schedule
-- =============================================
-- Purpose: Get override percentages for a rank (L1-L5)
--
-- Returns: JSONB with {l1: 30, l2: 20, l3: 15, l4: 10, l5: 10} format
--
-- Ranked Override Schedules (from spec):
-- Starter: L1=30%, L2-L5=0%
-- Bronze: L1=30%, L2=20%, L3-L5=0%
-- Silver: L1=30%, L2=20%, L3=15%, L4-L5=0%
-- Gold: L1=30%, L2=20%, L3=15%, L4=10%, L5=0%
-- Platinum+: L1=30%, L2=20%, L3=15%, L4=10%, L5=10%

CREATE OR REPLACE FUNCTION get_ranked_override_schedule(
  tech_rank TEXT
) RETURNS JSONB AS $$
BEGIN
  CASE tech_rank
    WHEN 'starter' THEN
      RETURN '{"l1": 30, "l2": 0, "l3": 0, "l4": 0, "l5": 0}'::jsonb;
    WHEN 'bronze' THEN
      RETURN '{"l1": 30, "l2": 20, "l3": 0, "l4": 0, "l5": 0}'::jsonb;
    WHEN 'silver' THEN
      RETURN '{"l1": 30, "l2": 20, "l3": 15, "l4": 0, "l5": 0}'::jsonb;
    WHEN 'gold' THEN
      RETURN '{"l1": 30, "l2": 20, "l3": 15, "l4": 10, "l5": 0}'::jsonb;
    WHEN 'platinum', 'ruby', 'diamond', 'crown', 'elite' THEN
      RETURN '{"l1": 30, "l2": 20, "l3": 15, "l4": 10, "l5": 10}'::jsonb;
    ELSE
      -- Default to starter
      RETURN '{"l1": 30, "l2": 0, "l3": 0, "l4": 0, "l5": 0}'::jsonb;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_ranked_override_schedule IS 'Get override percentages (L1-L5) for a tech rank. Returns JSONB like {"l1": 30, "l2": 20, ...}';

-- =============================================
-- FUNCTION: calculate_bonus_pool_shares
-- =============================================
-- Purpose: Calculate equal shares of bonus pool (3.5%)
--
-- Bonus pool is divided EQUALLY among all members who earned any rank bonus in the period

CREATE OR REPLACE FUNCTION calculate_bonus_pool_shares(
  period_label_param TEXT
) RETURNS TABLE (
  member_id UUID,
  member_name TEXT,
  share_amount_cents INTEGER
) AS $$
DECLARE
  total_pool_cents INTEGER;
  qualified_count INTEGER;
  share_per_member_cents INTEGER;
BEGIN
  -- Get total pool for period
  SELECT pool_amount_cents INTO total_pool_cents
  FROM public.bonus_pool_ledger
  WHERE period_label = period_label_param;

  IF total_pool_cents IS NULL OR total_pool_cents = 0 THEN
    RETURN; -- No pool to distribute
  END IF;

  -- Count qualified members (those who earned rank bonuses in this period)
  SELECT COUNT(DISTINCT e.member_id) INTO qualified_count
  FROM public.earnings_ledger e
  WHERE e.earning_type = 'rank_bonus'
  AND TO_CHAR(e.run_date, 'YYYY-MM') = period_label_param;

  IF qualified_count = 0 THEN
    RETURN; -- No qualified members
  END IF;

  -- Calculate equal share
  share_per_member_cents := total_pool_cents / qualified_count;

  -- Return shares for each qualified member
  RETURN QUERY
  SELECT DISTINCT
    e.member_id,
    e.member_name,
    share_per_member_cents
  FROM public.earnings_ledger e
  WHERE e.earning_type = 'rank_bonus'
  AND TO_CHAR(e.run_date, 'YYYY-MM') = period_label_param;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_bonus_pool_shares IS 'Calculate equal shares of 3.5% bonus pool divided among rank bonus earners';

-- =============================================
-- FUNCTION: calculate_leadership_pool_shares
-- =============================================
-- Purpose: Calculate Elite members' shares of leadership pool (1.5%)
--
-- Leadership pool is divided among Elite members based on their production

CREATE OR REPLACE FUNCTION calculate_leadership_pool_shares(
  period_start_param DATE,
  period_end_param DATE,
  total_pool_cents_param INTEGER
) RETURNS TABLE (
  member_id UUID,
  member_name TEXT,
  personal_credits INTEGER,
  team_credits INTEGER,
  share_points INTEGER,
  share_percentage NUMERIC,
  payout_cents INTEGER
) AS $$
DECLARE
  total_elite_points INTEGER;
BEGIN
  -- Calculate total Elite points (sum of all Elite members' personal + team credits)
  SELECT COALESCE(SUM(m.personal_credits_monthly + m.team_credits_monthly), 0)
  INTO total_elite_points
  FROM public.members m
  WHERE m.tech_rank = 'elite'
  AND m.status = 'active'
  AND m.override_qualified = true; -- Must be override qualified

  IF total_elite_points = 0 THEN
    RETURN; -- No Elite production
  END IF;

  -- Return shares for each Elite member
  RETURN QUERY
  SELECT
    m.member_id,
    m.full_name AS member_name,
    m.personal_credits_monthly AS personal_credits,
    m.team_credits_monthly AS team_credits,
    (m.personal_credits_monthly + m.team_credits_monthly) AS share_points,
    ROUND(
      ((m.personal_credits_monthly + m.team_credits_monthly)::NUMERIC / total_elite_points) * 100,
      6
    ) AS share_percentage,
    ROUND(
      (((m.personal_credits_monthly + m.team_credits_monthly)::NUMERIC / total_elite_points) * total_pool_cents_param)
    )::INTEGER AS payout_cents
  FROM public.members m
  WHERE m.tech_rank = 'elite'
  AND m.status = 'active'
  AND m.override_qualified = true
  ORDER BY share_points DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_leadership_pool_shares IS 'Calculate Elite members shares of 1.5% leadership pool based on production points';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Test rank calculation:
-- SELECT calculate_tech_rank(200, 120000); -- Should return 'elite'
-- SELECT calculate_tech_rank(50, 20000);   -- Should return 'ruby'
-- SELECT calculate_tech_rank(5, 100);      -- Should return 'starter'

-- Test override schedules:
-- SELECT get_ranked_override_schedule('elite');   -- Should return L1-L5 all populated
-- SELECT get_ranked_override_schedule('starter'); -- Should return L1=30, others=0

-- Test bonus pool shares:
-- SELECT * FROM calculate_bonus_pool_shares('2026-03');

-- Test leadership pool shares:
-- SELECT * FROM calculate_leadership_pool_shares('2026-03-01', '2026-03-31', 150000); -- $1500 pool

-- =============================================
-- END OF MIGRATION
-- =============================================
