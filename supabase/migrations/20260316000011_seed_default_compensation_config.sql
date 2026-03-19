-- =============================================
-- MIGRATION: Seed Default Compensation Configuration
-- Date: 2026-03-16
-- Phase: 3 (Agent 1 - Database Architect)
-- =============================================
--
-- PURPOSE: Populate initial compensation plan from hardcoded values
-- Source: APEX_COMP_ENGINE_SPEC_FINAL.md + src/lib/compensation/config.ts
--
-- CREATES:
-- - Version 1 compensation plan (active)
-- - 9 tech rank configs (Starter → Elite)
-- - 2 waterfall configs (Standard + Business Center)
-- - 6 bonus program configs
--
-- =============================================

-- =============================================
-- STEP 1: Create Version 1 Compensation Plan
-- =============================================

-- Insert Version 1 and store the ID
DO $$
DECLARE
  v_plan_id UUID;
BEGIN
  INSERT INTO public.compensation_plan_configs (
    id,
    name,
    version,
    description,
    effective_date,
    is_active,
    created_at
  ) VALUES (
    gen_random_uuid(),
    '2026 Standard Plan',
    1,
    'Initial compensation plan from APEX_COMP_ENGINE_SPEC_FINAL.md - Dual ladder with 9 tech ranks, ranked overrides, and 3.5%/1.5% pools',
    '2026-01-01',
    TRUE,
    NOW()
  ) RETURNING id INTO v_plan_id;

  -- Store in temp table for use in subsequent inserts
  CREATE TEMP TABLE IF NOT EXISTS temp_plan_id (id UUID);
  INSERT INTO temp_plan_id VALUES (v_plan_id);
END $$;

-- =============================================
-- STEP 2: Tech Rank Configurations
-- =============================================
-- From spec Section 4: TECH LADDER — 9 RANKS

INSERT INTO public.tech_rank_configs (
  plan_config_id,
  rank_name,
  rank_order,
  personal_credits_required,
  group_credits_required,
  downline_requirements,
  rank_bonus_cents,
  override_schedule,
  grace_period_months,
  rank_lock_months
)
SELECT
  (SELECT id FROM temp_plan_id),
  rank_data.rank_name,
  rank_data.rank_order,
  rank_data.personal_credits_required,
  rank_data.group_credits_required,
  rank_data.downline_requirements::JSONB,
  rank_data.rank_bonus_cents,
  rank_data.override_schedule,
  2, -- 2-month grace period
  6  -- 6-month rank lock
FROM (
  VALUES
    -- Rank 1: Starter
    (
      'starter',
      1,
      0,      -- personal_credits_required
      0,      -- group_credits_required
      NULL,   -- downline_requirements
      0,      -- rank_bonus_cents (no bonus for starter)
      ARRAY[0.30, 0.00, 0.00, 0.00, 0.00]::NUMERIC(5,2)[] -- L1 only
    ),
    -- Rank 2: Bronze
    (
      'bronze',
      2,
      150,    -- personal_credits_required
      300,    -- group_credits_required
      NULL,   -- downline_requirements
      25000,  -- rank_bonus_cents ($250)
      ARRAY[0.30, 0.05, 0.00, 0.00, 0.00]::NUMERIC(5,2)[] -- L1-L2
    ),
    -- Rank 3: Silver
    (
      'silver',
      3,
      500,    -- personal_credits_required
      1500,   -- group_credits_required
      NULL,   -- downline_requirements
      100000, -- rank_bonus_cents ($1,000)
      ARRAY[0.30, 0.10, 0.05, 0.00, 0.00]::NUMERIC(5,2)[] -- L1-L3
    ),
    -- Rank 4: Gold
    (
      'gold',
      4,
      1200,   -- personal_credits_required
      5000,   -- group_credits_required
      '{"bronze": 1}', -- downline_requirements: 1 Bronze sponsored
      300000, -- rank_bonus_cents ($3,000)
      ARRAY[0.30, 0.15, 0.10, 0.05, 0.00]::NUMERIC(5,2)[] -- L1-L4
    ),
    -- Rank 5: Platinum
    (
      'platinum',
      5,
      2500,   -- personal_credits_required
      15000,  -- group_credits_required
      '{"silver": 2}', -- downline_requirements: 2 Silvers sponsored
      750000, -- rank_bonus_cents ($7,500)
      ARRAY[0.30, 0.18, 0.12, 0.08, 0.03]::NUMERIC(5,2)[] -- L1-L5
    ),
    -- Rank 6: Ruby
    (
      'ruby',
      6,
      4000,   -- personal_credits_required
      30000,  -- group_credits_required
      '{"gold": 2}', -- downline_requirements: 2 Golds sponsored
      1200000, -- rank_bonus_cents ($12,000)
      ARRAY[0.30, 0.20, 0.15, 0.10, 0.05]::NUMERIC(5,2)[] -- L1-L5
    ),
    -- Rank 7: Diamond
    (
      'diamond',
      7,
      5000,   -- personal_credits_required
      50000,  -- group_credits_required
      '[{"gold": 3}, {"platinum": 2}]', -- OR condition: 3 Golds OR 2 Platinums
      1800000, -- rank_bonus_cents ($18,000)
      ARRAY[0.30, 0.22, 0.18, 0.12, 0.08]::NUMERIC(5,2)[] -- L1-L5
    ),
    -- Rank 8: Crown
    (
      'crown',
      8,
      6000,   -- personal_credits_required
      75000,  -- group_credits_required
      '{"platinum": 2, "gold": 1}', -- 2 Plat + 1 Gold sponsored
      2200000, -- rank_bonus_cents ($22,000)
      ARRAY[0.30, 0.25, 0.20, 0.15, 0.10]::NUMERIC(5,2)[] -- L1-L5
    ),
    -- Rank 9: Elite
    (
      'elite',
      9,
      8000,   -- personal_credits_required
      120000, -- group_credits_required
      '[{"platinum": 3}, {"diamond": 2}]', -- OR: 3 Platinums OR 2 Diamonds
      3000000, -- rank_bonus_cents ($30,000)
      ARRAY[0.30, 0.25, 0.20, 0.15, 0.10]::NUMERIC(5,2)[] -- L1-L5 + Leadership Pool
    )
) AS rank_data(
  rank_name,
  rank_order,
  personal_credits_required,
  group_credits_required,
  downline_requirements,
  rank_bonus_cents,
  override_schedule
);

-- =============================================
-- STEP 3: Waterfall Configurations
-- =============================================
-- From spec Section 1: REVENUE WATERFALL

-- Standard Products Waterfall
INSERT INTO public.waterfall_configs (
  plan_config_id,
  product_type,
  botmakers_pct,
  apex_pct,
  bonus_pool_pct,
  leadership_pool_pct,
  seller_commission_pct,
  override_pool_pct,
  bc_price_cents,
  bc_botmakers_cents,
  bc_apex_cents,
  bc_seller_cents,
  bc_sponsor_cents,
  bc_costs_cents,
  bc_credits
) VALUES (
  (SELECT id FROM temp_plan_id),
  'standard',
  0.30, -- 30% to BotMakers
  0.30, -- 30% to Apex (of adjusted gross)
  0.035, -- 3.5% to Bonus Pool (of remainder)
  0.015, -- 1.5% to Leadership Pool (of remainder)
  0.60, -- 60% to Seller (of commission pool)
  0.40, -- 40% to Override Pool (of commission pool)
  NULL, NULL, NULL, NULL, NULL, NULL, NULL -- BC fields not used for standard
);

-- Business Center Fixed Split
INSERT INTO public.waterfall_configs (
  plan_config_id,
  product_type,
  botmakers_pct,
  apex_pct,
  bonus_pool_pct,
  leadership_pool_pct,
  seller_commission_pct,
  override_pool_pct,
  bc_price_cents,
  bc_botmakers_cents,
  bc_apex_cents,
  bc_seller_cents,
  bc_sponsor_cents,
  bc_costs_cents,
  bc_credits
) VALUES (
  (SELECT id FROM temp_plan_id),
  'business_center',
  0.00, 0.00, 0.00, 0.00, 0.00, 0.00, -- Percentages not used for BC
  3900,  -- $39 price
  1100,  -- $11 to BotMakers
  800,   -- $8 to Apex
  1000,  -- $10 to Seller
  800,   -- $8 to Sponsor
  200,   -- $2 costs
  39     -- 39 credits (fixed)
);

-- =============================================
-- STEP 4: Bonus Program Configurations
-- =============================================
-- From spec Appendix A: BONUS POOL IMPLEMENTATION

-- Fast Start Bonus (3 tiers: 30/60/90 days)
INSERT INTO public.bonus_program_configs (
  plan_config_id,
  program_name,
  enabled,
  config_json
) VALUES (
  (SELECT id FROM temp_plan_id),
  'fast_start',
  TRUE,
  '{
    "tiers": [
      {
        "name": "fast_start_30",
        "days": 30,
        "personal_accounts": 3,
        "min_rank": null,
        "bonus_cents": 25000
      },
      {
        "name": "fast_start_60",
        "days": 60,
        "personal_accounts": 8,
        "min_rank": null,
        "bonus_cents": 50000
      },
      {
        "name": "fast_start_90",
        "days": 90,
        "personal_accounts": 15,
        "min_rank": "bronze",
        "bonus_cents": 100000
      }
    ],
    "stackable": true,
    "max_total_cents": 175000,
    "payment_day": 15
  }'::JSONB
);

-- Trip Incentive (Gold in 90 Days)
INSERT INTO public.bonus_program_configs (
  plan_config_id,
  program_name,
  enabled,
  config_json
) VALUES (
  (SELECT id FROM temp_plan_id),
  'trip_incentive',
  TRUE,
  '{
    "target_rank": "gold",
    "time_limit_days": 90,
    "cost_per_qualifier_cents": 400000,
    "spouse_included": true,
    "cash_equivalent": false,
    "must_maintain_rank": true,
    "destinations": ["Cancun", "Costa Rica", "Bahamas"]
  }'::JSONB
);

-- Car/Lifestyle Allowance
INSERT INTO public.bonus_program_configs (
  plan_config_id,
  program_name,
  enabled,
  config_json
) VALUES (
  (SELECT id FROM temp_plan_id),
  'car_allowance',
  TRUE,
  '{
    "allowances": {
      "platinum": 50000,
      "ruby": 75000,
      "diamond": 100000,
      "crown": 100000,
      "elite": 100000
    },
    "payment_frequency": "monthly",
    "grace_period": false,
    "note": "Must maintain qualifying rank each month. Drops immediately with demotion."
  }'::JSONB
);

-- Quarterly Production Contests
INSERT INTO public.bonus_program_configs (
  plan_config_id,
  program_name,
  enabled,
  config_json
) VALUES (
  (SELECT id FROM temp_plan_id),
  'quarterly_contest',
  TRUE,
  '{
    "frequency": "quarterly",
    "metric": "personal_tech_revenue",
    "tiebreaker": "personal_credits",
    "prizes": {
      "1": 500000,
      "2": 300000,
      "3": 200000,
      "4": 50000,
      "5": 50000,
      "6": 50000,
      "7": 50000,
      "8": 50000,
      "9": 50000,
      "10": 50000
    },
    "total_per_quarter_cents": 1350000,
    "payment_date": "fifteenth_of_month_after_quarter"
  }'::JSONB
);

-- Leadership Retreat (Diamond+ Annual)
INSERT INTO public.bonus_program_configs (
  plan_config_id,
  program_name,
  enabled,
  config_json
) VALUES (
  (SELECT id FROM temp_plan_id),
  'leadership_retreat',
  FALSE, -- Not yet activated per spec
  '{
    "frequency": "annual",
    "min_rank": "diamond",
    "covers": ["airfare", "hotel", "meals", "programming"],
    "spouse_included": true,
    "duration_days": 3,
    "budget_per_qualifier_cents": 300000
  }'::JSONB
);

-- Enhanced Rank Bonuses (50% multiplier if achieved within 12 months)
INSERT INTO public.bonus_program_configs (
  plan_config_id,
  program_name,
  enabled,
  config_json
) VALUES (
  (SELECT id FROM temp_plan_id),
  'enhanced_rank',
  TRUE,
  '{
    "multiplier": 0.50,
    "window_months": 12,
    "applies_to": "first_time_only",
    "note": "50% extra on top of standard rank bonus if achieved within 12 months of enrollment"
  }'::JSONB
);

-- =============================================
-- STEP 5: Verification
-- =============================================

-- Verify plan created
DO $$
DECLARE
  v_plan_count INTEGER;
  v_rank_count INTEGER;
  v_waterfall_count INTEGER;
  v_bonus_count INTEGER;
BEGIN
  -- Check plan exists and is active
  SELECT COUNT(*) INTO v_plan_count
  FROM public.compensation_plan_configs
  WHERE version = 1 AND is_active = TRUE;

  IF v_plan_count != 1 THEN
    RAISE EXCEPTION 'Plan config verification failed: expected 1 active plan, found %', v_plan_count;
  END IF;

  -- Check 9 ranks created
  SELECT COUNT(*) INTO v_rank_count
  FROM public.tech_rank_configs
  WHERE plan_config_id = (SELECT id FROM temp_plan_id);

  IF v_rank_count != 9 THEN
    RAISE EXCEPTION 'Rank config verification failed: expected 9 ranks, found %', v_rank_count;
  END IF;

  -- Check 2 waterfall configs (standard + BC)
  SELECT COUNT(*) INTO v_waterfall_count
  FROM public.waterfall_configs
  WHERE plan_config_id = (SELECT id FROM temp_plan_id);

  IF v_waterfall_count != 2 THEN
    RAISE EXCEPTION 'Waterfall config verification failed: expected 2 configs, found %', v_waterfall_count;
  END IF;

  -- Check 6 bonus programs
  SELECT COUNT(*) INTO v_bonus_count
  FROM public.bonus_program_configs
  WHERE plan_config_id = (SELECT id FROM temp_plan_id);

  IF v_bonus_count != 6 THEN
    RAISE EXCEPTION 'Bonus program verification failed: expected 6 programs, found %', v_bonus_count;
  END IF;

  RAISE NOTICE '✓ Seed data verification passed:';
  RAISE NOTICE '  - 1 active plan (Version 1)';
  RAISE NOTICE '  - 9 tech ranks (Starter → Elite)';
  RAISE NOTICE '  - 2 waterfall configs (Standard + Business Center)';
  RAISE NOTICE '  - 6 bonus programs (5 enabled, 1 disabled)';
END $$;

-- =============================================
-- Display seed summary
-- =============================================

-- Show created plan
SELECT
  'PLAN CONFIG' AS type,
  name,
  version,
  effective_date,
  is_active,
  description
FROM public.compensation_plan_configs
WHERE version = 1;

-- Show rank configs
SELECT
  'RANK ' || rank_order AS type,
  rank_name,
  personal_credits_required,
  group_credits_required,
  rank_bonus_cents / 100.0 AS bonus_usd,
  override_schedule
FROM public.tech_rank_configs
WHERE plan_config_id = (SELECT id FROM temp_plan_id)
ORDER BY rank_order;

-- Show waterfall configs
SELECT
  'WATERFALL - ' || UPPER(product_type) AS type,
  CASE
    WHEN product_type = 'standard' THEN
      'BM: ' || (botmakers_pct * 100)::TEXT || '%, Apex: ' || (apex_pct * 100)::TEXT || '%, Bonus: ' || (bonus_pool_pct * 100)::TEXT || '%, Leadership: ' || (leadership_pool_pct * 100)::TEXT || '%'
    ELSE
      'Fixed: $' || (bc_price_cents / 100.0)::TEXT || ' = BM $' || (bc_botmakers_cents / 100.0)::TEXT || ' + Apex $' || (bc_apex_cents / 100.0)::TEXT || ' + Seller $' || (bc_seller_cents / 100.0)::TEXT || ' + Sponsor $' || (bc_sponsor_cents / 100.0)::TEXT
  END AS details
FROM public.waterfall_configs
WHERE plan_config_id = (SELECT id FROM temp_plan_id);

-- Show bonus programs
SELECT
  'BONUS PROGRAM' AS type,
  program_name,
  enabled,
  CASE
    WHEN program_name = 'fast_start' THEN '3 tiers: $250/$500/$1,000'
    WHEN program_name = 'trip_incentive' THEN 'Gold in 90 days → trip'
    WHEN program_name = 'car_allowance' THEN 'Plat: $500, Ruby: $750, Diamond+: $1,000/mo'
    WHEN program_name = 'quarterly_contest' THEN 'Top 10 reps: $5K/$3K/$2K + 7×$500'
    WHEN program_name = 'leadership_retreat' THEN 'Diamond+ annual retreat (NOT YET ACTIVE)'
    WHEN program_name = 'enhanced_rank' THEN '50% bonus if rank within 12 months'
    ELSE 'See config_json for details'
  END AS summary
FROM public.bonus_program_configs
WHERE plan_config_id = (SELECT id FROM temp_plan_id)
ORDER BY
  CASE program_name
    WHEN 'fast_start' THEN 1
    WHEN 'trip_incentive' THEN 2
    WHEN 'car_allowance' THEN 3
    WHEN 'quarterly_contest' THEN 4
    WHEN 'leadership_retreat' THEN 5
    WHEN 'enhanced_rank' THEN 6
    ELSE 99
  END;

-- Cleanup temp table
DROP TABLE IF EXISTS temp_plan_id;

-- =============================================
-- END OF MIGRATION
-- =============================================
