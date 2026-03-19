-- =============================================
-- Verification Script for Compensation Config System
-- Run this AFTER migrations 000010 and 000011
-- =============================================

\echo '=========================================='
\echo 'VERIFICATION: Compensation Config System'
\echo '=========================================='

-- Check 1: Active Plan Exists
\echo '\n✓ CHECK 1: Active Plan'
SELECT
  'ACTIVE PLAN' as check_type,
  name,
  version,
  effective_date,
  is_active
FROM public.compensation_plan_configs
WHERE is_active = TRUE;

-- Check 2: All 9 Ranks Present
\echo '\n✓ CHECK 2: Tech Ranks (should be 9)'
SELECT
  'RANK COUNT' as check_type,
  COUNT(*) as total_ranks,
  COUNT(DISTINCT rank_order) as unique_orders,
  COUNT(DISTINCT rank_name) as unique_names
FROM public.tech_rank_configs
WHERE plan_config_id = (SELECT id FROM public.compensation_plan_configs WHERE version = 1);

-- Check 3: Rank Details
\echo '\n✓ CHECK 3: Rank Configuration Details'
SELECT
  rank_order,
  rank_name,
  personal_credits_required,
  group_credits_required,
  rank_bonus_cents / 100.0 as bonus_usd,
  override_schedule
FROM public.tech_rank_configs
WHERE plan_config_id = (SELECT id FROM public.compensation_plan_configs WHERE version = 1)
ORDER BY rank_order;

-- Check 4: Waterfall Configs (should be 2)
\echo '\n✓ CHECK 4: Waterfall Configurations'
SELECT
  product_type,
  botmakers_pct,
  apex_pct,
  bonus_pool_pct,
  leadership_pool_pct,
  seller_commission_pct,
  override_pool_pct,
  bc_price_cents / 100.0 as bc_price_usd
FROM public.waterfall_configs
WHERE plan_config_id = (SELECT id FROM public.compensation_plan_configs WHERE version = 1);

-- Check 5: Bonus Programs (should be 6)
\echo '\n✓ CHECK 5: Bonus Programs'
SELECT
  program_name,
  enabled,
  CASE
    WHEN jsonb_typeof(config_json->'tiers') = 'array' THEN jsonb_array_length(config_json->'tiers') || ' tiers'
    WHEN config_json ? 'allowances' THEN jsonb_object_keys(config_json->'allowances') || ' allowances'
    ELSE 'configured'
  END as config_summary
FROM public.bonus_program_configs
WHERE plan_config_id = (SELECT id FROM public.compensation_plan_configs WHERE version = 1);

-- Check 6: Helper Functions Work
\echo '\n✓ CHECK 6: Helper Functions'
SELECT
  'get_active_compensation_plan()' as function_name,
  get_active_compensation_plan() as result;

-- Check 7: Test Rank Lookup
\echo '\n✓ CHECK 7: Rank Config Lookup (Gold)'
SELECT * FROM get_rank_config('gold');

-- Check 8: Test Waterfall Lookup
\echo '\n✓ CHECK 8: Waterfall Config Lookup (Standard)'
SELECT * FROM get_waterfall_config('standard');

-- Check 9: Test Waterfall Lookup (Business Center)
\echo '\n✓ CHECK 9: Waterfall Config Lookup (Business Center)'
SELECT * FROM get_waterfall_config('business_center');

-- Check 10: Audit Log Populated
\echo '\n✓ CHECK 10: Audit Log'
SELECT
  COUNT(*) as total_entries,
  COUNT(DISTINCT action) as unique_actions,
  MIN(timestamp) as first_entry,
  MAX(timestamp) as last_entry
FROM public.compensation_config_audit_log;

-- Check 11: RLS Policies
\echo '\n✓ CHECK 11: RLS Policies (should be 11+)'
SELECT
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'compensation_plan_configs',
    'tech_rank_configs',
    'waterfall_configs',
    'bonus_program_configs',
    'compensation_config_audit_log'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Check 12: Indexes
\echo '\n✓ CHECK 12: Indexes (should be 15+)'
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'compensation_plan_configs',
    'tech_rank_configs',
    'waterfall_configs',
    'bonus_program_configs',
    'compensation_config_audit_log'
  )
ORDER BY tablename, indexname;

-- Check 13: Triggers
\echo '\n✓ CHECK 13: Triggers (should be 10+)'
SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgrelid::regclass::text IN (
  'public.compensation_plan_configs',
  'public.tech_rank_configs',
  'public.waterfall_configs',
  'public.bonus_program_configs'
)
ORDER BY table_name, trigger_name;

\echo '\n=========================================='
\echo 'VERIFICATION COMPLETE'
\echo '=========================================='
