-- =====================================================
-- Test Script: BV Recalculation Triggers
-- Phase 2.5 Testing
-- =====================================================

-- Clean up any existing test data
DELETE FROM orders WHERE id LIKE 'test-order-%';
DELETE FROM org_bv_cache WHERE rep_id LIKE 'test-rep-%';
DELETE FROM distributors WHERE id LIKE 'test-%';

-- =====================================================
-- SETUP: Create test reps
-- =====================================================

-- Create sponsor (parent in chain)
INSERT INTO distributors (
  id, full_name, email, current_rank, sponsor_id,
  status, enrollment_date, created_at, updated_at
) VALUES (
  'test-sponsor-001',
  'Test Sponsor',
  'test-sponsor@test.com',
  'GOLD',
  NULL,
  'active',
  NOW(),
  NOW(),
  NOW()
);

-- Create rep (child in chain)
INSERT INTO distributors (
  id, full_name, email, current_rank, sponsor_id,
  status, enrollment_date, created_at, updated_at
) VALUES (
  'test-rep-001',
  'Test Rep',
  'test-rep@test.com',
  'BRONZE',
  'test-sponsor-001',
  'active',
  NOW(),
  NOW(),
  NOW()
);

-- Initialize BV cache for both
INSERT INTO org_bv_cache (rep_id, personal_bv, team_bv, org_bv, last_calculated_at)
VALUES
  ('test-sponsor-001', 0, 0, 0, NOW()),
  ('test-rep-001', 0, 0, 0, NOW());

-- =====================================================
-- TEST 1: Order INSERT triggers BV calculation
-- =====================================================

\echo '=== TEST 1: Insert Order (Complete Status) ==='

-- Check BV BEFORE
\echo 'BV Before Order:'
SELECT rep_id, personal_bv, team_bv, org_bv FROM org_bv_cache
WHERE rep_id IN ('test-rep-001', 'test-sponsor-001')
ORDER BY rep_id;

-- Create complete order
INSERT INTO orders (
  id, rep_id, customer_id, product_id,
  order_type, gross_amount_cents, status,
  bv_amount, bv_credited, created_at, updated_at
) VALUES (
  'test-order-001',
  'test-rep-001',
  'test-customer-001',
  'PULSEMARKET',
  'member',
  9700,
  'complete',
  97.00,
  false,
  NOW(),
  NOW()
);

-- Wait for trigger
\echo 'Waiting for trigger...'
SELECT pg_sleep(1);

-- Check BV AFTER
\echo 'BV After Order:'
SELECT rep_id, personal_bv, team_bv, org_bv FROM org_bv_cache
WHERE rep_id IN ('test-rep-001', 'test-sponsor-001')
ORDER BY rep_id;

-- Expected Results:
-- test-rep-001: personal_bv should increase by 97
-- test-sponsor-001: team_bv should include the 97 from downline

-- =====================================================
-- TEST 2: Order UPDATE (refund) triggers BV deduction
-- =====================================================

\echo '=== TEST 2: Update Order to Refunded ==='

-- Check BV BEFORE refund
\echo 'BV Before Refund:'
SELECT rep_id, personal_bv, team_bv, org_bv FROM org_bv_cache
WHERE rep_id IN ('test-rep-001', 'test-sponsor-001')
ORDER BY rep_id;

-- Update order to refunded
UPDATE orders
SET status = 'refunded', updated_at = NOW()
WHERE id = 'test-order-001';

-- Wait for trigger
\echo 'Waiting for trigger...'
SELECT pg_sleep(1);

-- Check BV AFTER refund
\echo 'BV After Refund:'
SELECT rep_id, personal_bv, team_bv, org_bv FROM org_bv_cache
WHERE rep_id IN ('test-rep-001', 'test-sponsor-001')
ORDER BY rep_id;

-- Expected Results:
-- BV should be back to 0 (or close to 0, accounting for any real orders)

-- =====================================================
-- TEST 3: Order DELETE triggers BV deduction
-- =====================================================

\echo '=== TEST 3: Delete Order ==='

-- Re-insert order for delete test
INSERT INTO orders (
  id, rep_id, customer_id, product_id,
  order_type, gross_amount_cents, status,
  bv_amount, bv_credited, created_at, updated_at
) VALUES (
  'test-order-002',
  'test-rep-001',
  'test-customer-002',
  'PULSEFLOW',
  'member',
  14700,
  'complete',
  147.00,
  false,
  NOW(),
  NOW()
);

\echo 'Waiting for trigger...'
SELECT pg_sleep(1);

\echo 'BV Before Delete:'
SELECT rep_id, personal_bv, team_bv, org_bv FROM org_bv_cache
WHERE rep_id IN ('test-rep-001', 'test-sponsor-001')
ORDER BY rep_id;

-- Delete order
DELETE FROM orders WHERE id = 'test-order-002';

\echo 'Waiting for trigger...'
SELECT pg_sleep(1);

\echo 'BV After Delete:'
SELECT rep_id, personal_bv, team_bv, org_bv FROM org_bv_cache
WHERE rep_id IN ('test-rep-001', 'test-sponsor-001')
ORDER BY rep_id;

-- =====================================================
-- TEST 4: Verify trigger doesn't fire for pending orders
-- =====================================================

\echo '=== TEST 4: Pending Order (Should NOT Trigger) ==='

\echo 'BV Before Pending Order:'
SELECT rep_id, personal_bv, team_bv, org_bv FROM org_bv_cache
WHERE rep_id IN ('test-rep-001', 'test-sponsor-001')
ORDER BY rep_id;

-- Create pending order (should NOT trigger)
INSERT INTO orders (
  id, rep_id, customer_id, product_id,
  order_type, gross_amount_cents, status,
  bv_amount, bv_credited, created_at, updated_at
) VALUES (
  'test-order-003',
  'test-rep-001',
  'test-customer-003',
  'PULSEDRIVE',
  'member',
  19700,
  'pending',  -- NOT complete
  197.00,
  false,
  NOW(),
  NOW()
);

\echo 'Waiting...'
SELECT pg_sleep(1);

\echo 'BV After Pending Order:'
SELECT rep_id, personal_bv, team_bv, org_bv FROM org_bv_cache
WHERE rep_id IN ('test-rep-001', 'test-sponsor-001')
ORDER BY rep_id;

-- Expected: BV should NOT change (trigger only fires for complete orders)

-- =====================================================
-- CLEANUP
-- =====================================================

\echo '=== CLEANUP ==='

-- Remove test data
DELETE FROM orders WHERE id LIKE 'test-order-%';
DELETE FROM org_bv_cache WHERE rep_id LIKE 'test-%';
DELETE FROM distributors WHERE id LIKE 'test-%';

\echo 'Test complete. Review results above.'

-- =====================================================
-- SUCCESS CRITERIA SUMMARY
-- =====================================================

\echo ''
\echo '✅ SUCCESS CRITERIA:'
\echo '1. INSERT complete order → BV increases'
\echo '2. UPDATE to refunded → BV decreases'
\echo '3. DELETE order → BV decreases'
\echo '4. INSERT pending order → NO BV change'
\echo '5. Sponsor chain updated correctly'
\echo '6. Triggers execute in <100ms'
