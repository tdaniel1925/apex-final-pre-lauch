-- =============================================
-- VERIFICATION SCRIPT
-- Migration: 20260331000004 - Business Center System
-- =============================================
-- Run this script after applying the migration to verify everything is correct

-- =============================================
-- 1. VERIFY TABLES EXIST
-- =============================================

SELECT
  'Tables Exist' AS test_name,
  COUNT(*) AS actual_count,
  7 AS expected_count,
  CASE
    WHEN COUNT(*) = 7 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  );

-- =============================================
-- 2. VERIFY INDEXES EXIST
-- =============================================

SELECT
  'Indexes Exist' AS test_name,
  COUNT(*) AS actual_count,
  37 AS expected_count,
  CASE
    WHEN COUNT(*) >= 37 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
  AND indexname LIKE 'idx_%';

-- =============================================
-- 3. VERIFY RLS ENABLED
-- =============================================

SELECT
  'RLS Enabled' AS test_name,
  COUNT(*) AS actual_count,
  7 AS expected_count,
  CASE
    WHEN COUNT(*) = 7 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
  AND rowsecurity = true;

-- =============================================
-- 4. VERIFY RLS POLICIES
-- =============================================

SELECT
  'RLS Policies Exist' AS test_name,
  COUNT(*) AS actual_count,
  16 AS expected_count,
  CASE
    WHEN COUNT(*) >= 16 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  );

-- =============================================
-- 5. VERIFY TRIGGERS
-- =============================================

SELECT
  'Updated_at Triggers' AS test_name,
  COUNT(*) AS actual_count,
  4 AS expected_count,
  CASE
    WHEN COUNT(*) >= 4 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban'
  )
  AND trigger_name LIKE 'update_%_updated_at';

-- =============================================
-- 6. VERIFY FOREIGN KEYS
-- =============================================

SELECT
  'Foreign Keys Exist' AS test_name,
  COUNT(*) AS actual_count,
  10 AS expected_count,
  CASE
    WHEN COUNT(*) >= 10 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
  AND table_name IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
  AND constraint_type = 'FOREIGN KEY';

-- =============================================
-- 7. VERIFY CHECK CONSTRAINTS
-- =============================================

SELECT
  'Check Constraints Exist' AS test_name,
  COUNT(*) AS actual_count,
  10 AS expected_count,
  CASE
    WHEN COUNT(*) >= 10 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
  AND table_name IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
  AND constraint_type = 'CHECK';

-- =============================================
-- 8. VERIFY UNIQUE CONSTRAINTS
-- =============================================

SELECT
  'Unique Constraints' AS test_name,
  COUNT(*) AS actual_count,
  1 AS expected_count,
  CASE
    WHEN COUNT(*) >= 1 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
  AND table_name = 'commission_runs'
  AND constraint_type = 'UNIQUE';

-- =============================================
-- 9. DETAILED TABLE STRUCTURE
-- =============================================

-- Transactions table
SELECT
  'transactions' AS table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'transactions'
ORDER BY ordinal_position;

-- Commission Ledger table
SELECT
  'commission_ledger' AS table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'commission_ledger'
ORDER BY ordinal_position;

-- Client Onboarding table
SELECT
  'client_onboarding' AS table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_onboarding'
ORDER BY ordinal_position;

-- Fulfillment Kanban table
SELECT
  'fulfillment_kanban' AS table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'fulfillment_kanban'
ORDER BY ordinal_position;

-- AI Recommendations table
SELECT
  'ai_genealogy_recommendations' AS table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ai_genealogy_recommendations'
ORDER BY ordinal_position;

-- Usage Tracking table
SELECT
  'usage_tracking' AS table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'usage_tracking'
ORDER BY ordinal_position;

-- Commission Runs table
SELECT
  'commission_runs' AS table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'commission_runs'
ORDER BY ordinal_position;

-- =============================================
-- 10. VERIFY INDEX DETAILS
-- =============================================

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
ORDER BY tablename, indexname;

-- =============================================
-- 11. VERIFY RLS POLICY DETAILS
-- =============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
ORDER BY tablename, policyname;

-- =============================================
-- 12. VERIFY COMMENTS
-- =============================================

SELECT
  c.table_name,
  CASE
    WHEN obj_description((quote_ident(c.table_schema) || '.' || quote_ident(c.table_name))::regclass) IS NOT NULL
    THEN '✅ Has comment'
    ELSE '❌ No comment'
  END AS has_table_comment
FROM information_schema.tables c
WHERE c.table_schema = 'public'
  AND c.table_name IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
ORDER BY c.table_name;

-- =============================================
-- SUMMARY
-- =============================================

SELECT
  '=====================' AS separator,
  'VERIFICATION COMPLETE' AS status,
  '=====================' AS separator2;

SELECT
  'Run all tests above and verify that all show ✅ PASS' AS instruction;

-- =============================================
-- END OF VERIFICATION SCRIPT
-- =============================================
