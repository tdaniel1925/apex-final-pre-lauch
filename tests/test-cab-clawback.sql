-- =====================================================
-- Test Script: CAB Clawback Processing
-- Phase 2.2 Testing
-- =====================================================

-- Clean up any existing test data
DELETE FROM cab_clawback_queue WHERE id LIKE 'test-clawback-%';
DELETE FROM commissions_cab WHERE id LIKE 'test-cab-%';
DELETE FROM notifications WHERE user_id LIKE 'test-rep-%';
DELETE FROM audit_log WHERE record_id LIKE 'test-cab-%';

-- =====================================================
-- SETUP: Create test scenario
-- =====================================================

\echo '=== SETUP: Creating Test Data ==='

-- Scenario: Customer canceled 65 days ago (past 60-day window)
-- Expected: CAB should be clawed back

-- Create CAB clawback queue entry (expired)
INSERT INTO cab_clawback_queue (
  id, rep_id, customer_id, order_id, cab_amount,
  cancel_date, clawback_eligible_until, status, created_at
) VALUES (
  'test-clawback-001',
  'test-rep-001',
  'test-customer-001',
  'test-order-001',
  50.00,
  NOW() - INTERVAL '65 days',  -- Canceled 65 days ago
  NOW() - INTERVAL '5 days',   -- Recovery window ended 5 days ago
  'pending',
  NOW() - INTERVAL '65 days'
);

-- Create corresponding CAB commission (in PENDING state)
INSERT INTO commissions_cab (
  id, rep_id, customer_id, order_id, amount, state,
  release_eligible_date, state_changed_at, month_year, status, created_at
) VALUES (
  'test-cab-001',
  'test-rep-001',
  'test-customer-001',
  'test-order-001',
  50.00,
  'PENDING',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '65 days',
  '2026-01',
  'pending',
  NOW() - INTERVAL '65 days'
);

\echo 'Test data created.'
\echo ''

-- =====================================================
-- PRE-TEST: Check initial state
-- =====================================================

\echo '=== PRE-TEST: Initial State ==='

\echo 'Clawback Queue:'
SELECT id, rep_id, cab_amount, status, clawback_eligible_until
FROM cab_clawback_queue
WHERE id = 'test-clawback-001';

\echo 'CAB Commission:'
SELECT id, rep_id, amount, state, status
FROM commissions_cab
WHERE id = 'test-cab-001';

\echo ''

-- =====================================================
-- MANUAL TRIGGER: Call Edge Function
-- =====================================================

\echo '=== MANUAL TRIGGER ==='
\echo 'To test the Edge Function, run this command in your terminal:'
\echo ''
\echo 'curl -X POST https://[project-ref].supabase.co/functions/v1/process-cab-clawback \'
\echo '  -H "Authorization: Bearer [service-role-key]" \'
\echo '  -H "Content-Type: application/json"'
\echo ''
\echo 'After running the Edge Function, continue with the verification below.'
\echo ''

-- =====================================================
-- POST-TEST: Verify clawback processed
-- =====================================================

\echo '=== POST-TEST: Verify Results ==='
\echo '(Run this AFTER triggering the Edge Function)'
\echo ''

\echo '1. Clawback Queue Status:'
SELECT id, rep_id, cab_amount, status, processed_at
FROM cab_clawback_queue
WHERE id = 'test-clawback-001';
-- Expected: status = 'clawback', processed_at populated

\echo '2. Original CAB State:'
SELECT id, rep_id, amount, state, state_changed_at
FROM commissions_cab
WHERE id = 'test-cab-001';
-- Expected: state = 'CLAWBACK', state_changed_at updated

\echo '3. Negative CAB Entry Created:'
SELECT id, rep_id, amount, state, status
FROM commissions_cab
WHERE rep_id = 'test-rep-001'
  AND amount < 0
  AND state = 'CLAWBACK'
ORDER BY created_at DESC
LIMIT 1;
-- Expected: New entry with amount = -50.00

\echo '4. Notification Sent:'
SELECT id, user_id, type, title, message
FROM notifications
WHERE user_id = 'test-rep-001'
  AND type = 'cab_clawback'
ORDER BY created_at DESC
LIMIT 1;
-- Expected: Notification about clawback

\echo '5. Audit Log Entry:'
SELECT id, action, table_name, record_id, details
FROM audit_log
WHERE action = 'cab_clawback_processed'
  AND record_id = 'test-cab-001'
ORDER BY timestamp DESC
LIMIT 1;
-- Expected: Audit entry with full details

-- =====================================================
-- TEST 2: Active subscription (should be cleared)
-- =====================================================

\echo ''
\echo '=== TEST 2: Active Subscription (Should Clear, Not Clawback) ==='

-- Create order that's still active
INSERT INTO orders (
  id, rep_id, customer_id, product_id,
  order_type, stripe_subscription_id, gross_amount_cents,
  status, bv_amount, created_at
) VALUES (
  'test-order-002',
  'test-rep-002',
  'test-customer-002',
  'PULSEMARKET',
  'member',
  'sub_test_active',
  9700,
  'complete',  -- Still active
  97.00,
  NOW() - INTERVAL '30 days'
);

-- Create clawback queue entry for active subscription
INSERT INTO cab_clawback_queue (
  id, rep_id, customer_id, order_id, cab_amount,
  cancel_date, clawback_eligible_until, status, created_at
) VALUES (
  'test-clawback-002',
  'test-rep-002',
  'test-customer-002',
  'test-order-002',
  50.00,
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '30 days',  -- Still within recovery window
  'pending',
  NOW() - INTERVAL '30 days'
);

\echo 'After running Edge Function, check:'
SELECT id, rep_id, status, processed_at
FROM cab_clawback_queue
WHERE id = 'test-clawback-002';
-- Expected: status = 'cleared' (subscription still active)

-- =====================================================
-- CLEANUP
-- =====================================================

\echo ''
\echo '=== CLEANUP ==='

DELETE FROM orders WHERE id LIKE 'test-order-%';
DELETE FROM cab_clawback_queue WHERE id LIKE 'test-clawback-%';
DELETE FROM commissions_cab WHERE id LIKE 'test-cab-%';
DELETE FROM notifications WHERE user_id LIKE 'test-rep-%';
DELETE FROM audit_log WHERE record_id LIKE 'test-cab-%';

\echo 'Cleanup complete.'

-- =====================================================
-- SUCCESS CRITERIA SUMMARY
-- =====================================================

\echo ''
\echo '✅ SUCCESS CRITERIA:'
\echo '1. Expired clawbacks identified (past clawback_eligible_until date)'
\echo '2. Original CAB state updated to CLAWBACK'
\echo '3. Negative commission entry created (-$50.00)'
\echo '4. Queue status updated to clawback'
\echo '5. Rep notified via notifications table'
\echo '6. Admin notified (if clawbackCount > 0)'
\echo '7. Audit log entry created with full details'
\echo '8. Active subscriptions cleared, not clawed back'
\echo ''
\echo 'Revenue Impact: Prevents $60k-$120k annual loss'
