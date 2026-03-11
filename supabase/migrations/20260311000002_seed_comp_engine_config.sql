-- =============================================
-- MIGRATION: 20260311000002_seed_comp_engine_config.sql
-- Seed compensation engine configuration with V7 values
-- =============================================

-- =============================================
-- SAAS COMPENSATION ENGINE - PRODUCTS
-- =============================================

INSERT INTO public.saas_comp_engine_config (key, value) VALUES
('product.pulseguard', '{"name": "PulseGuard", "member_price": 59, "retail_price": 79, "bv": 59}'::jsonb),
('product.pulseflow', '{"name": "PulseFlow", "member_price": 129, "retail_price": 149, "bv": 129}'::jsonb),
('product.pulsedrive', '{"name": "PulseDrive", "member_price": 219, "retail_price": 299, "bv": 219}'::jsonb),
('product.pulsecommand', '{"name": "PulseCommand", "member_price": 349, "retail_price": 499, "bv": 349}'::jsonb),
('product.smartlock', '{"name": "SmartLock", "member_price": 99, "retail_price": 135, "bv": 99}'::jsonb),
('product.businesscenter', '{"name": "Business Center", "member_price": 39, "retail_price": 39, "bv": 39}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- SAAS COMPENSATION ENGINE - WATERFALL V7
-- =============================================

INSERT INTO public.saas_comp_engine_config (key, value) VALUES
('waterfall.botmakers_pct', '{"value": 0.30, "description": "BotMakers fee percentage (FLOOR)", "formula": "FLOOR(gross × 0.30)"}'::jsonb),
('waterfall.bonus_pool_pct', '{"value": 0.05, "description": "Bonus pool contribution (ROUND)", "formula": "ROUND(adj_gross × 0.05, 2)"}'::jsonb),
('waterfall.apex_pct', '{"value": 0.30, "description": "Apex margin percentage (FLOOR)", "formula": "FLOOR(after_pool × 0.30)"}'::jsonb),
('waterfall.seller_split', '{"value": 0.60, "description": "Seller commission split (ROUND)", "formula": "ROUND(field × 0.60, 2)"}'::jsonb),
('waterfall.override_split', '{"value": 0.40, "description": "Override pool split (ROUND)", "formula": "ROUND(field × 0.40, 2)"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- SAAS COMPENSATION ENGINE - RANK THRESHOLDS
-- =============================================

INSERT INTO public.saas_comp_engine_config (key, value) VALUES
('rank.inactive', '{"rank_name": "Inactive", "personal_bv": 0, "team_bv": 0, "rank_id": -1}'::jsonb),
('rank.associate', '{"rank_name": "Associate", "personal_bv": 50, "team_bv": 0, "rank_id": 0}'::jsonb),
('rank.bronze', '{"rank_name": "Bronze", "personal_bv": 100, "team_bv": 500, "rank_id": 1}'::jsonb),
('rank.silver', '{"rank_name": "Silver", "personal_bv": 150, "team_bv": 2500, "rank_id": 2}'::jsonb),
('rank.gold', '{"rank_name": "Gold", "personal_bv": 200, "team_bv": 10000, "rank_id": 3}'::jsonb),
('rank.platinum', '{"rank_name": "Platinum", "personal_bv": 250, "team_bv": 25000, "rank_id": 4}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- SAAS COMPENSATION ENGINE - OVERRIDE PERCENTAGES
-- =============================================

-- Standard (5 levels)
INSERT INTO public.saas_comp_engine_config (key, value) VALUES
('override.standard.l1', '{"pct": 0.30, "required_rank": "Associate", "rank_id": 0}'::jsonb),
('override.standard.l2', '{"pct": 0.25, "required_rank": "Bronze", "rank_id": 1}'::jsonb),
('override.standard.l3', '{"pct": 0.20, "required_rank": "Silver", "rank_id": 2}'::jsonb),
('override.standard.l4', '{"pct": 0.15, "required_rank": "Gold", "rank_id": 3}'::jsonb),
('override.standard.l5', '{"pct": 0.10, "required_rank": "Platinum", "rank_id": 4}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Powerline (7 levels - requires Platinum + $100K team BV)
INSERT INTO public.saas_comp_engine_config (key, value) VALUES
('override.powerline.l1', '{"pct": 0.268, "required_rank": "Associate", "rank_id": 0}'::jsonb),
('override.powerline.l2', '{"pct": 0.223, "required_rank": "Bronze", "rank_id": 1}'::jsonb),
('override.powerline.l3', '{"pct": 0.179, "required_rank": "Silver", "rank_id": 2}'::jsonb),
('override.powerline.l4', '{"pct": 0.134, "required_rank": "Gold", "rank_id": 3}'::jsonb),
('override.powerline.l5', '{"pct": 0.089, "required_rank": "Platinum", "rank_id": 4}'::jsonb),
('override.powerline.l6', '{"pct": 0.070, "required_rank": "Platinum+Powerline", "rank_id": 4, "requires_team_bv": 100000}'::jsonb),
('override.powerline.l7', '{"pct": 0.050, "required_rank": "Platinum+Powerline", "rank_id": 4, "requires_team_bv": 100000}'::jsonb),
('override.powerline.threshold', '{"team_bv": 100000, "required_rank": "Platinum"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- SAAS COMPENSATION ENGINE - BONUSES
-- =============================================

INSERT INTO public.saas_comp_engine_config (key, value) VALUES
('bonus.cab.amount', '{"value": 50, "description": "Customer Acquisition Bonus amount"}'::jsonb),
('bonus.cab.retention_days', '{"value": 60, "description": "Days before CAB is released"}'::jsonb),
('bonus.cab.monthly_cap', '{"value": 20, "description": "Maximum CABs per month"}'::jsonb),
('bonus.gold_accelerator', '{"value": 3467, "description": "One-time Gold rank achievement bonus"}'::jsonb),
('bonus.infinity.monthly_amount', '{"value": 500, "description": "Monthly infinity bonus"}'::jsonb),
('bonus.infinity.consecutive_platinum_days', '{"value": 90, "description": "Required consecutive Platinum days"}'::jsonb),
('bonus.infinity.second_org_bv_threshold', '{"value": 2500, "description": "Second org BV requirement"}'::jsonb),
('bonus.minimum_payout', '{"value": 25, "description": "Minimum payout threshold"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- SAAS COMPENSATION ENGINE - BUSINESS CENTER
-- =============================================

INSERT INTO public.saas_comp_engine_config (key, value) VALUES
('bizcenter.seller_amount', '{"value": 10, "description": "Seller (buyer) commission"}'::jsonb),
('bizcenter.enroller_amount', '{"value": 8, "description": "Enroller referral commission"}'::jsonb),
('bizcenter.note', '{"text": "BizCenter bypasses waterfall - flat split, no L2-L7 overrides, generates $0 CAB"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- INSURANCE COMPENSATION ENGINE - RANKS
-- =============================================

INSERT INTO public.insurance_comp_engine_config (key, value) VALUES
('rank.associate', '{"rank_name": "Associate", "commission_rate": 0.35, "rolling_90_day_threshold": 0, "rank_id": 0}'::jsonb),
('rank.agent', '{"rank_name": "Agent", "commission_rate": 0.40, "rolling_90_day_threshold": 5000, "rank_id": 1}'::jsonb),
('rank.senior_agent', '{"rank_name": "Senior Agent", "commission_rate": 0.45, "rolling_90_day_threshold": 15000, "rank_id": 2}'::jsonb),
('rank.district_manager', '{"rank_name": "District Manager", "commission_rate": 0.50, "rolling_90_day_threshold": 40000, "rank_id": 3}'::jsonb),
('rank.regional_director', '{"rank_name": "Regional Director", "commission_rate": 0.55, "rolling_90_day_threshold": 100000, "rank_id": 4}'::jsonb),
('rank.mga', '{"rank_name": "MGA (Managing General Agent)", "commission_rate": 0.60, "rolling_90_day_threshold": 250000, "rank_id": 5}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- INSURANCE COMPENSATION ENGINE - PPB TIERS
-- =============================================

INSERT INTO public.insurance_comp_engine_config (key, value) VALUES
('ppb.week1_pct', '{"value": 0.01, "description": "Production Pacing Bonus - Week 1", "weekly_threshold": 2000}'::jsonb),
('ppb.week2_pct', '{"value": 0.02, "description": "Production Pacing Bonus - Week 2", "weekly_threshold": 2000}'::jsonb),
('ppb.week3_pct', '{"value": 0.03, "description": "Production Pacing Bonus - Week 3", "weekly_threshold": 2000}'::jsonb),
('ppb.week4_pct', '{"value": 0.04, "description": "Production Pacing Bonus - Week 4+", "weekly_threshold": 2000}'::jsonb),
('ppb.weekly_threshold', '{"value": 2000, "description": "Minimum weekly production to qualify for PPB"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- INSURANCE COMPENSATION ENGINE - MGA BONUS
-- =============================================

INSERT INTO public.insurance_comp_engine_config (key, value) VALUES
('mga_bonus.tier1', '{"recruits": 9, "bonus_pct": 0.01, "base_shop": 150000, "description": "9 recruits = 1% of quarterly production"}'::jsonb),
('mga_bonus.tier2', '{"recruits": 12, "bonus_pct": 0.02, "base_shop": 150000, "description": "12 recruits = 2% of quarterly production"}'::jsonb),
('mga_bonus.tier3', '{"recruits": 15, "bonus_pct": 0.03, "base_shop": 150000, "description": "15 recruits = 3% of quarterly production"}'::jsonb),
('mga_bonus.tier4', '{"recruits": 18, "bonus_pct": 0.04, "base_shop": 150000, "description": "18 recruits = 4% of quarterly production"}'::jsonb),
('mga_bonus.base_shop', '{"value": 150000, "description": "Minimum shop production to qualify"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- INSURANCE COMPENSATION ENGINE - OVERRIDES
-- =============================================

INSERT INTO public.insurance_comp_engine_config (key, value) VALUES
('override.gen1_pct', '{"value": 0.15, "description": "Generation 1 override - 15% of downline commission"}'::jsonb),
('override.gen2_pct', '{"value": 0.05, "description": "Generation 2 override - 5% of downline commission"}'::jsonb),
('override.gen3_pct', '{"value": 0.03, "description": "Generation 3 override - 3% of downline commission"}'::jsonb),
('override.gen4_pct', '{"value": 0.02, "description": "Generation 4 override - 2% of downline commission"}'::jsonb),
('override.gen5_pct', '{"value": 0.01, "description": "Generation 5 override - 1% of downline commission"}'::jsonb),
('override.gen6_pct', '{"value": 0.005, "description": "Generation 6 override - 0.5% of downline commission"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- INSURANCE COMPENSATION ENGINE - PROMOTION REQUIREMENTS
-- =============================================

INSERT INTO public.insurance_comp_engine_config (key, value) VALUES
('promotion.placement_min', '{"value": 0.60, "description": "Minimum 60% placement rate for promotion"}'::jsonb),
('promotion.persistency_min', '{"value": 0.80, "description": "Minimum 80% persistency rate for promotion"}'::jsonb),
('promotion.recruit_credit_max', '{"value": 0.35, "description": "Maximum 35% production credit from recruits"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- MIGRATION COMPLETE
-- Total records: 55 config entries (31 SaaS + 24 Insurance)
-- =============================================
