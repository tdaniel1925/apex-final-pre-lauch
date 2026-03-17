-- Simple seed without complex features
-- Temporarily disable triggers, insert data, re-enable

-- Disable triggers temporarily
ALTER TABLE compensation_plan_configs DISABLE TRIGGER audit_plan_configs;
ALTER TABLE tech_rank_configs DISABLE TRIGGER audit_rank_configs;
ALTER TABLE waterfall_configs DISABLE TRIGGER audit_waterfall_configs;
ALTER TABLE bonus_program_configs DISABLE TRIGGER audit_bonus_configs;

-- Insert Version 1 plan
INSERT INTO compensation_plan_configs (name, version, description, effective_date, is_active)
VALUES ('2026 Standard Plan', 1, 'Initial plan from spec', '2026-01-01', TRUE);

-- Get the plan ID for use below
DO $$
DECLARE v_plan_id UUID;
BEGIN
  SELECT id INTO v_plan_id FROM compensation_plan_configs WHERE version = 1;

  -- Insert 9 tech ranks
  INSERT INTO tech_rank_configs (plan_config_id, rank_name, rank_order, personal_credits_required, group_credits_required, downline_requirements, rank_bonus_cents, override_schedule, grace_period_months, rank_lock_months) VALUES
    (v_plan_id, 'starter', 1, 0, 0, NULL, 0, ARRAY[0.30,0.00,0.00,0.00,0.00]::NUMERIC(5,2)[], 2, 6),
    (v_plan_id, 'bronze', 2, 150, 300, NULL, 25000, ARRAY[0.30,0.05,0.00,0.00,0.00]::NUMERIC(5,2)[], 2, 6),
    (v_plan_id, 'silver', 3, 500, 1500, NULL, 100000, ARRAY[0.30,0.10,0.05,0.00,0.00]::NUMERIC(5,2)[], 2, 6),
    (v_plan_id, 'gold', 4, 1200, 5000, '{"bronze":1}'::JSONB, 300000, ARRAY[0.30,0.15,0.10,0.05,0.00]::NUMERIC(5,2)[], 2, 6),
    (v_plan_id, 'platinum', 5, 2500, 15000, '{"silver":2}'::JSONB, 750000, ARRAY[0.30,0.18,0.12,0.08,0.03]::NUMERIC(5,2)[], 2, 6),
    (v_plan_id, 'ruby', 6, 4000, 30000, '{"gold":2}'::JSONB, 1200000, ARRAY[0.30,0.20,0.15,0.10,0.05]::NUMERIC(5,2)[], 2, 6),
    (v_plan_id, 'diamond', 7, 5000, 50000, '{"or":[{"gold":3},{"platinum":2}]}'::JSONB, 1800000, ARRAY[0.30,0.22,0.18,0.12,0.08]::NUMERIC(5,2)[], 2, 6),
    (v_plan_id, 'crown', 8, 6000, 75000, '{"and":[{"platinum":2},{"gold":1}]}'::JSONB, 2200000, ARRAY[0.30,0.25,0.20,0.15,0.10]::NUMERIC(5,2)[], 2, 6),
    (v_plan_id, 'elite', 9, 8000, 120000, '{"or":[{"platinum":3},{"diamond":2}]}'::JSONB, 3000000, ARRAY[0.30,0.25,0.20,0.15,0.10]::NUMERIC(5,2)[], 2, 6);

  -- Insert 2 waterfall configs (percentages as decimals: 0.30 = 30%)
  INSERT INTO waterfall_configs (plan_config_id, product_type, botmakers_pct, apex_pct, bonus_pool_pct, leadership_pool_pct, seller_commission_pct, override_pool_pct) VALUES
    (v_plan_id, 'standard', 0.30, 0.30, 0.035, 0.015, 0.60, 0.40),
    (v_plan_id, 'business_center', 0.2821, 0.2051, 0.00, 0.00, 0.2564, 0.2564);

  -- Insert 6 bonus programs
  INSERT INTO bonus_program_configs (plan_config_id, program_name, enabled, config_json) VALUES
    (v_plan_id, 'fast_start', TRUE, '{"description":"3-tier Fast Start","tiers":[{"days":30,"enrollments":1,"bonus_cents":25000},{"days":30,"enrollments":3,"bonus_cents":50000},{"days":30,"enrollments":5,"bonus_cents":100000}]}'::JSONB),
    (v_plan_id, 'trip_incentive', TRUE, '{"description":"Gold in 90 days","target_rank":"gold","days":90,"reward":"Trip"}'::JSONB),
    (v_plan_id, 'car_allowance', TRUE, '{"description":"Monthly car allowance","allowances":{"platinum":50000,"ruby":75000,"diamond":100000,"crown":100000,"elite":100000}}'::JSONB),
    (v_plan_id, 'quarterly_contest', TRUE, '{"description":"Top 10 recruiters","prizes":[{"rank":1,"bonus_cents":500000},{"rank":2,"bonus_cents":300000},{"rank":3,"bonus_cents":200000},{"ranks":[4,5,6,7,8,9,10],"bonus_cents":50000}]}'::JSONB),
    (v_plan_id, 'leadership_retreat', FALSE, '{"description":"Annual retreat for Diamond+","min_rank":"diamond"}'::JSONB),
    (v_plan_id, 'enhanced_rank', TRUE, '{"description":"50% boost if within 12 months","multiplier":1.5,"window_months":12}'::JSONB);

END $$;

-- Re-enable triggers
ALTER TABLE compensation_plan_configs ENABLE TRIGGER audit_plan_configs;
ALTER TABLE tech_rank_configs ENABLE TRIGGER audit_rank_configs;
ALTER TABLE waterfall_configs ENABLE TRIGGER audit_waterfall_configs;
ALTER TABLE bonus_program_configs ENABLE TRIGGER audit_bonus_configs;
