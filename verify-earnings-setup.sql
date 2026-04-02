-- ===================================================================
-- Verify Real-Time Earnings Estimates Setup
-- Run this in Supabase SQL Editor to verify everything is ready
-- ===================================================================

-- 1. Check estimated_earnings table exists
SELECT
  'estimated_earnings table' as check_name,
  CASE WHEN EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'estimated_earnings'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 2. Check table structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'estimated_earnings'
ORDER BY ordinal_position;

-- 3. Check earnings_ledger was updated
SELECT
  'earnings_ledger status check' as check_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.check_constraints
    WHERE constraint_name LIKE '%earnings_ledger_status%'
    AND check_clause LIKE '%approved%'
  ) THEN '✅ UPDATED' ELSE '❌ NOT UPDATED' END as status;

-- 4. Check for existing members (we need at least one to test)
SELECT
  'Active members' as check_name,
  COUNT(*)::text || ' members' as status
FROM members
LIMIT 1;

-- 5. Check for active products
SELECT
  'Active products' as check_name,
  COUNT(*)::text || ' products' as status
FROM products
WHERE is_active = true
LIMIT 1;

-- 6. Show sample member data for testing
SELECT
  m.member_id,
  m.full_name,
  m.paying_rank,
  m.personal_credits_monthly as pv,
  m.team_credits_monthly as gv,
  d.email
FROM members m
JOIN distributors d ON d.id = m.distributor_id
WHERE d.status = 'active'
LIMIT 5;

-- ===================================================================
-- Expected Results:
-- 1. estimated_earnings table: ✅ EXISTS
-- 2. Table columns shown (id, transaction_id, member_id, etc.)
-- 3. earnings_ledger status check: ✅ UPDATED
-- 4. At least 1 active member
-- 5. At least 1 active product
-- 6. Sample member data displayed
-- ===================================================================
