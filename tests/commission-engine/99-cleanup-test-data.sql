-- =============================================
-- CLEANUP TEST DATA
-- Completely removes all test data from sandbox
-- =============================================
-- Safe to run in production - only removes test_ prefixed data
-- Use this to reset the testing environment
-- =============================================

-- =============================================
-- SAFETY CHECK
-- =============================================

DO $$
DECLARE
  v_test_count INTEGER;
  v_prod_count INTEGER;
BEGIN
  -- Count test vs production data
  SELECT COUNT(*) INTO v_test_count FROM distributors WHERE email LIKE 'test_%';
  SELECT COUNT(*) INTO v_prod_count FROM distributors WHERE email NOT LIKE 'test_%';

  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE 'CLEANUP SAFETY CHECK';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE 'Test distributors: %', v_test_count;
  RAISE NOTICE 'Production distributors: %', v_prod_count;
  RAISE NOTICE '════════════════════════════════════════════════';

  IF v_test_count = 0 THEN
    RAISE NOTICE 'ℹ️  No test data found. Nothing to clean up.';
  ELSE
    RAISE NOTICE '🧹 Cleaning up % test distributors and all related data...', v_test_count;
  END IF;
END $$;

-- =============================================
-- CALL CLEANUP FUNCTION
-- =============================================

SELECT cleanup_test_data() as cleanup_result;

-- =============================================
-- VERIFY CLEANUP
-- =============================================

SELECT
  '✅ Cleanup verification' as status;

-- Should all be 0
SELECT
  'Test Distributors Remaining' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ Clean' ELSE '❌ Still exists' END as result
FROM distributors
WHERE email LIKE 'test_%'
UNION ALL
SELECT
  'Test Customers Remaining' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ Clean' ELSE '❌ Still exists' END as result
FROM customers
WHERE email LIKE 'test_%'
UNION ALL
SELECT
  'Test Orders Remaining' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ Clean' ELSE '❌ Still exists' END as result
FROM orders
WHERE distributor_id IN (SELECT id FROM distributors WHERE email LIKE 'test_%')
   OR customer_id IN (SELECT id FROM customers WHERE email LIKE 'test_%')
UNION ALL
SELECT
  'Test Commissions Remaining' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ Clean' ELSE '❌ Still exists' END as result
FROM commissions_retail
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Test BV Snapshots Remaining' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ Clean' ELSE '❌ Still exists' END as result
FROM bv_snapshots
WHERE month_year = '9999-99';

-- =============================================
-- SUMMARY
-- =============================================

SELECT
  '✅ Test data cleanup complete!' as status,
  'Sandbox is now clean and ready for new test run.' as next_step,
  'Run 01-seed-test-distributors.sql to start fresh.' as action;
