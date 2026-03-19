-- =============================================
-- MIGRATION: Seed Default Compensation Configuration (v2 - Fixed)
-- Date: 2026-03-16
-- =============================================

-- Create Version 1 compensation plan and seed all configs in one transaction
DO $$
DECLARE
  v_plan_id UUID;
BEGIN
  -- STEP 1: Create Version 1 Compensation Plan
  INSERT INTO public.compensation_plan_configs (
    name,
    version,
    description,
    effective_date,
    is_active
  ) VALUES (
    '2026 Standard Plan',
    1,
    'Initial compensation plan from spec - Dual ladder with 9 tech ranks, ranked overrides, and 3.5%/1.5% pools',
    '2026-01-01',
    TRUE
  ) RETURNING id INTO v_plan_id;

  RAISE NOTICE 'Created compensation plan v1: %', v_plan_id;

  -- STEP 2: Tech Rank Configurations (9 ranks)
  INSERT INTO public.tech_rank_configs (
    plan_config_id, rank_name, rank_order,
    personal_credits_required, group_credits_required,
    downline_requirements, rank_bonus_cents,
    override_schedule, grace_period_months, rank_lock_months
  ) VALUES
    -- Starter
    (v_plan_id, 'starter', 1, 0, 0, NULL, 0,
     ARRAY[0.30, 0.00, 0.00, 0.00, 0.00]::NUMERIC(5,2)[], 2, 6),

    -- Bronze
    (v_plan_id, 'bronze', 2, 150, 300, NULL, 25000,
     ARRAY[0.30, 0.05, 0.00, 0.00, 0.00]::NUMERIC(5,2)[], 2, 6),

    -- Silver
    (v_plan_id, 'silver', 3, 500, 1500, NULL, 100000,
     ARRAY[0.30, 0.10, 0.05, 0.00, 0.00]::NUMERIC(5,2)[], 2, 6),

    -- Gold
    (v_plan_id, 'gold', 4, 1200, 5000,
     '{"bronze": 1}'::JSONB, 300000,
     ARRAY[0.30, 0.15, 0.10, 0.05, 0.00]::NUMERIC(5,2)[], 2, 6),

    -- Platinum
    (v_plan_id, 'platinum', 5, 2500, 15000,
     '{"silver": 2}'::JSONB, 750000,
     ARRAY[0.30, 0.18, 0.12, 0.08, 0.03]::NUMERIC(5,2)[], 2, 6),

    -- Ruby
    (v_plan_id, 'ruby', 6, 4000, 30000,
     '{"gold": 2}'::JSONB, 1200000,
     ARRAY[0.30, 0.20, 0.15, 0.10, 0.05]::NUMERIC(5,2)[], 2, 6),

    -- Diamond
    (v_plan_id, 'diamond', 7, 5000, 50000,
     '{"or": [{"gold": 3}, {"platinum": 2}]}'::JSONB, 1800000,
     ARRAY[0.30, 0.22, 0.18, 0.12, 0.08]::NUMERIC(5,2)[], 2, 6),

    -- Crown
    (v_plan_id, 'crown', 8, 6000, 75000,
     '{"and": [{"platinum": 2}, {"gold": 1}]}'::JSONB, 2200000,
     ARRAY[0.30, 0.25, 0.20, 0.15, 0.10]::NUMERIC(5,2)[], 2, 6),

    -- Elite
    (v_plan_id, 'elite', 9, 8000, 120000,
     '{"or": [{"platinum": 3}, {"diamond": 2}]}'::JSONB, 3000000,
     ARRAY[0.30, 0.25, 0.20, 0.15, 0.10]::NUMERIC(5,2)[], 2, 6);

  RAISE NOTICE 'Created 9 tech rank configs';

  -- STEP 3: Waterfall Configurations (2 types)

  -- Standard Products Waterfall
  INSERT INTO public.waterfall_configs (
    plan_config_id, product_type,
    botmakers_pct, apex_pct, bonus_pool_pct, leadership_pool_pct,
    seller_commission_pct, override_pool_pct
  ) VALUES (
    v_plan_id, 'standard',
    30.00, 30.00, 3.50, 1.50,
    60.00, 40.00
  );

  -- Business Center Fixed Split
  INSERT INTO public.waterfall_configs (
    plan_config_id, product_type,
    botmakers_pct, apex_pct, bonus_pool_pct, leadership_pool_pct,
    seller_commission_pct, override_pool_pct
  ) VALUES (
    v_plan_id, 'business_center',
    28.21, 20.51, 0.00, 0.00,  -- $11/$8 out of $39 = percentages
    25.64, 25.64  -- $10 seller, $10 override pool (approx)
  );

  RAISE NOTICE 'Created 2 waterfall configs';

  -- STEP 4: Bonus Program Configurations

  -- Fast Start Bonus (3 tiers)
  INSERT INTO public.bonus_program_configs (
    plan_config_id, program_name, enabled, config_json
  ) VALUES (
    v_plan_id, 'fast_start', TRUE,
    '{
      "description": "3-tier Fast Start bonuses",
      "tiers": [
        {"days": 30, "enrollments": 1, "bonus_cents": 25000},
        {"days": 30, "enrollments": 3, "bonus_cents": 50000},
        {"days": 30, "enrollments": 5, "bonus_cents": 100000}
      ]
    }'::JSONB
  );

  -- Trip Incentive (Gold in 90 days)
  INSERT INTO public.bonus_program_configs (
    plan_config_id, program_name, enabled, config_json
  ) VALUES (
    v_plan_id, 'trip_incentive', TRUE,
    '{
      "description": "Achieve Gold rank within 90 days",
      "target_rank": "gold",
      "days": 90,
      "reward": "All-expenses-paid trip"
    }'::JSONB
  );

  -- Car Allowance (Platinum+)
  INSERT INTO public.bonus_program_configs (
    plan_config_id, program_name, enabled, config_json
  ) VALUES (
    v_plan_id, 'car_allowance', TRUE,
    '{
      "description": "Monthly car allowance by rank",
      "allowances": {
        "platinum": 50000,
        "ruby": 75000,
        "diamond": 100000,
        "crown": 100000,
        "elite": 100000
      }
    }'::JSONB
  );

  -- Quarterly Contest (Top 10)
  INSERT INTO public.bonus_program_configs (
    plan_config_id, program_name, enabled, config_json
  ) VALUES (
    v_plan_id, 'quarterly_contest', TRUE,
    '{
      "description": "Top 10 recruiters each quarter",
      "prizes": [
        {"rank": 1, "bonus_cents": 500000},
        {"rank": 2, "bonus_cents": 300000},
        {"rank": 3, "bonus_cents": 200000},
        {"ranks": [4, 5, 6, 7, 8, 9, 10], "bonus_cents": 50000}
      ]
    }'::JSONB
  );

  -- Leadership Retreat (Diamond+, DISABLED per spec)
  INSERT INTO public.bonus_program_configs (
    plan_config_id, program_name, enabled, config_json
  ) VALUES (
    v_plan_id, 'leadership_retreat', FALSE,
    '{
      "description": "Annual leadership retreat for Diamond+ ranks",
      "min_rank": "diamond",
      "frequency": "annual"
    }'::JSONB
  );

  -- Enhanced Rank Bonuses (50% boost if within 12 months)
  INSERT INTO public.bonus_program_configs (
    plan_config_id, program_name, enabled, config_json
  ) VALUES (
    v_plan_id, 'enhanced_rank_bonus', TRUE,
    '{
      "description": "50% bonus multiplier if rank achieved within 12 months",
      "multiplier": 1.5,
      "window_months": 12
    }'::JSONB
  );

  RAISE NOTICE 'Created 6 bonus program configs';

  RAISE NOTICE '✅ Seed complete: Version 1 compensation plan ready';

END $$;

-- =============================================
-- Verification Queries
-- =============================================

-- Show the active plan
SELECT id, name, version, effective_date, is_active
FROM compensation_plan_configs
WHERE is_active = TRUE;

-- Show tech ranks
SELECT rank_order, rank_name, personal_credits_required, group_credits_required,
       rank_bonus_cents/100.0 as bonus_usd
FROM tech_rank_configs
WHERE plan_config_id = (SELECT id FROM compensation_plan_configs WHERE is_active = TRUE)
ORDER BY rank_order;

-- Show waterfalls
SELECT product_type, botmakers_pct, apex_pct, bonus_pool_pct, leadership_pool_pct
FROM waterfall_configs
WHERE plan_config_id = (SELECT id FROM compensation_plan_configs WHERE is_active = TRUE);

-- Show bonus programs
SELECT program_name, enabled
FROM bonus_program_configs
WHERE plan_config_id = (SELECT id FROM compensation_plan_configs WHERE is_active = TRUE)
ORDER BY program_name;

-- =============================================
-- END OF MIGRATION
-- =============================================
