-- =============================================
-- SEED TEST DATA FOR COMMISSION SYSTEM
-- Creates sample reps, subscriptions, and matrix
-- =============================================

-- Clear existing test data (be careful in production!)
-- DELETE FROM commission_line_items;
-- DELETE FROM commission_runs;
-- DELETE FROM bv_snapshots;
-- DELETE FROM rank_snapshots;
-- DELETE FROM cab_records;
-- DELETE FROM subscriptions;
-- DELETE FROM reps;

-- =============================================
-- CREATE TEST REPS (5x7 Matrix Structure)
-- =============================================

-- Root Rep (Top of Matrix)
INSERT INTO reps (
  rep_id,
  full_name,
  email,
  phone,
  date_of_birth,
  enrollment_date,
  status,
  enroller_id,
  placement_parent_id,
  placement_position,
  matrix_path,
  current_rank,
  prior_month_rank,
  consecutive_platinum_days,
  infinity_org_active,
  second_org_root_rep_id,
  gold_accelerator_paid,
  car_allowance_active,
  car_allowance_consecutive_months,
  clawback_carry_forward_balance,
  commission_carry_forward
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sarah Martinez (Root)',
  'sarah@example.com',
  '555-0001',
  '1985-03-15',
  '2025-01-01',
  'ACTIVE',
  NULL,  -- No enroller (root)
  NULL,  -- No parent (root)
  1,
  '1',
  'PLATINUM',
  'GOLD',
  120,  -- 120 consecutive Platinum days
  TRUE,
  NULL,
  TRUE,  -- Already received Gold Accelerator
  TRUE,
  6,  -- 6 months car allowance
  0,
  0
) ON CONFLICT (rep_id) DO NOTHING;

-- Level 1 Reps (Direct under root - 5 positions)
INSERT INTO reps (rep_id, full_name, email, phone, date_of_birth, enrollment_date, status, enroller_id, placement_parent_id, placement_position, matrix_path, current_rank, prior_month_rank, consecutive_platinum_days, infinity_org_active, second_org_root_rep_id, gold_accelerator_paid, car_allowance_active, car_allowance_consecutive_months, clawback_carry_forward_balance, commission_carry_forward)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'Michael Chen (L1-1)', 'michael@example.com', '555-0002', '1988-07-22', '2025-02-01', 'ACTIVE', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1, '1.1', 'GOLD', 'SILVER', 30, FALSE, NULL, FALSE, FALSE, 0, 0, 0),
  ('00000000-0000-0000-0000-000000000003', 'Jennifer Lopez (L1-2)', 'jennifer@example.com', '555-0003', '1990-11-10', '2025-02-05', 'ACTIVE', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 2, '1.2', 'SILVER', 'BRONZE', 0, FALSE, NULL, FALSE, FALSE, 0, 0, 0),
  ('00000000-0000-0000-0000-000000000004', 'David Kim (L1-3)', 'david@example.com', '555-0004', '1987-05-18', '2025-02-10', 'ACTIVE', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 3, '1.3', 'BRONZE', 'ASSOCIATE', 0, FALSE, NULL, FALSE, FALSE, 0, 0, 0),
  ('00000000-0000-0000-0000-000000000005', 'Emily Taylor (L1-4)', 'emily@example.com', '555-0005', '1992-09-25', '2025-02-15', 'ACTIVE', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 4, '1.4', 'ASSOCIATE', 'INACTIVE', 0, FALSE, NULL, FALSE, FALSE, 0, 0, 0),
  ('00000000-0000-0000-0000-000000000006', 'Robert Johnson (L1-5)', 'robert@example.com', '555-0006', '1983-12-30', '2025-02-20', 'ACTIVE', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 5, '1.5', 'GOLD', 'SILVER', 15, FALSE, NULL, FALSE, FALSE, 0, 0, 0)
ON CONFLICT (rep_id) DO NOTHING;

-- Level 2 Reps (Under Michael Chen - position 1.1)
INSERT INTO reps (rep_id, full_name, email, phone, date_of_birth, enrollment_date, status, enroller_id, placement_parent_id, placement_position, matrix_path, current_rank, prior_month_rank, consecutive_platinum_days, infinity_org_active, second_org_root_rep_id, gold_accelerator_paid, car_allowance_active, car_allowance_consecutive_months, clawback_carry_forward_balance, commission_carry_forward)
VALUES
  ('00000000-0000-0000-0000-000000000007', 'Lisa Anderson (L2-1)', 'lisa@example.com', '555-0007', '1991-04-12', '2025-03-01', 'ACTIVE', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 1, '1.1.1', 'SILVER', 'BRONZE', 0, FALSE, NULL, FALSE, FALSE, 0, 0, 0),
  ('00000000-0000-0000-0000-000000000008', 'James Wilson (L2-2)', 'james@example.com', '555-0008', '1989-08-05', '2025-03-05', 'ACTIVE', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 2, '1.1.2', 'BRONZE', 'ASSOCIATE', 0, FALSE, NULL, FALSE, FALSE, 0, 0, 0),
  ('00000000-0000-0000-0000-000000000009', 'Maria Garcia (L2-3)', 'maria@example.com', '555-0009', '1993-01-28', '2025-03-10', 'ACTIVE', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 3, '1.1.3', 'ASSOCIATE', 'INACTIVE', 0, FALSE, NULL, FALSE, FALSE, 0, 0, 0)
ON CONFLICT (rep_id) DO NOTHING;

-- =============================================
-- CREATE SUBSCRIPTIONS (Various Products)
-- =============================================

-- Sarah (Root) - Has multiple products (High earner)
INSERT INTO subscriptions (
  subscription_id,
  rep_id,
  customer_email,
  customer_name,
  product_id,
  price_type,
  actual_price_paid,
  member_price,
  bv_value,
  status,
  enrollment_date,
  cancellation_date,
  suspension_date,
  payment_failed_date,
  recovery_deadline
)
VALUES
  -- Sarah's own PulseCommand (highest tier)
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'sarah@example.com', 'Sarah Martinez', 'PULSECOMMAND', 'MEMBER', 349, 349, 349, 'ACTIVE', '2025-01-01', NULL, NULL, NULL, NULL),
  -- Sarah's BusinessCenter
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'sarah@example.com', 'Sarah Martinez', 'BIZCENTER', 'MEMBER', 39, 39, 39, 'ACTIVE', '2025-01-01', NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Michael Chen (L1-1) - PulseDrive
INSERT INTO subscriptions (subscription_id, rep_id, customer_email, customer_name, product_id, price_type, actual_price_paid, member_price, bv_value, status, enrollment_date, cancellation_date, suspension_date, payment_failed_date, recovery_deadline)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'michael@example.com', 'Michael Chen', 'PULSEDRIVE', 'MEMBER', 219, 219, 219, 'ACTIVE', '2025-02-01', NULL, NULL, NULL, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'michael@example.com', 'Michael Chen', 'BIZCENTER', 'MEMBER', 39, 39, 39, 'ACTIVE', '2025-02-01', NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Jennifer Lopez (L1-2) - PulseFlow
INSERT INTO subscriptions (subscription_id, rep_id, customer_email, customer_name, product_id, price_type, actual_price_paid, member_price, bv_value, status, enrollment_date, cancellation_date, suspension_date, payment_failed_date, recovery_deadline)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'jennifer@example.com', 'Jennifer Lopez', 'PULSEFLOW', 'MEMBER', 129, 129, 129, 'ACTIVE', '2025-02-05', NULL, NULL, NULL, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'jennifer@example.com', 'Jennifer Lopez', 'BIZCENTER', 'MEMBER', 39, 39, 39, 'ACTIVE', '2025-02-05', NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- David Kim (L1-3) - PulseMarket
INSERT INTO subscriptions (subscription_id, rep_id, customer_email, customer_name, product_id, price_type, actual_price_paid, member_price, bv_value, status, enrollment_date, cancellation_date, suspension_date, payment_failed_date, recovery_deadline)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'david@example.com', 'David Kim', 'PULSEMARKET', 'MEMBER', 59, 59, 59, 'ACTIVE', '2025-02-10', NULL, NULL, NULL, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'david@example.com', 'David Kim', 'BIZCENTER', 'MEMBER', 39, 39, 39, 'ACTIVE', '2025-02-10', NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Emily Taylor (L1-4) - SmartLock
INSERT INTO subscriptions (subscription_id, rep_id, customer_email, customer_name, product_id, price_type, actual_price_paid, member_price, bv_value, status, enrollment_date, cancellation_date, suspension_date, payment_failed_date, recovery_deadline)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000005', 'emily@example.com', 'Emily Taylor', 'SMARTLOCK', 'MEMBER', 99, 99, 99, 'ACTIVE', '2025-02-15', NULL, NULL, NULL, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000005', 'emily@example.com', 'Emily Taylor', 'BIZCENTER', 'MEMBER', 39, 39, 39, 'ACTIVE', '2025-02-15', NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Robert Johnson (L1-5) - PulseDrive
INSERT INTO subscriptions (subscription_id, rep_id, customer_email, customer_name, product_id, price_type, actual_price_paid, member_price, bv_value, status, enrollment_date, cancellation_date, suspension_date, payment_failed_date, recovery_deadline)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000006', 'robert@example.com', 'Robert Johnson', 'PULSEDRIVE', 'MEMBER', 219, 219, 219, 'ACTIVE', '2025-02-20', NULL, NULL, NULL, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000006', 'robert@example.com', 'Robert Johnson', 'BIZCENTER', 'MEMBER', 39, 39, 39, 'ACTIVE', '2025-02-20', NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Level 2 Reps
INSERT INTO subscriptions (subscription_id, rep_id, customer_email, customer_name, product_id, price_type, actual_price_paid, member_price, bv_value, status, enrollment_date, cancellation_date, suspension_date, payment_failed_date, recovery_deadline)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000007', 'lisa@example.com', 'Lisa Anderson', 'PULSEFLOW', 'MEMBER', 129, 129, 129, 'ACTIVE', '2025-03-01', NULL, NULL, NULL, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000008', 'james@example.com', 'James Wilson', 'PULSEMARKET', 'MEMBER', 59, 59, 59, 'ACTIVE', '2025-03-05', NULL, NULL, NULL, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000009', 'maria@example.com', 'Maria Garcia', 'PULSEMARKET', 'MEMBER', 59, 59, 59, 'ACTIVE', '2025-03-10', NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- CREATE CAB RECORDS (Some past 60 days)
-- =============================================

-- Sarah's subscriptions enrolled 60+ days ago - CABs ready to release
INSERT INTO cab_records (
  cab_id,
  rep_id,
  subscription_id,
  enrollment_date,
  release_eligible_date,
  state,
  amount,
  trigger_reason,
  released_in_run_id,
  clawback_applied_run_id
)
SELECT
  gen_random_uuid(),
  s.rep_id,
  s.subscription_id,
  s.enrollment_date,
  s.enrollment_date + INTERVAL '60 days',
  CASE
    WHEN s.enrollment_date + INTERVAL '60 days' <= CURRENT_DATE THEN 'PENDING'::cab_state
    ELSE 'PENDING'::cab_state
  END,
  50,
  'Customer retention at 60 days',
  NULL,
  NULL
FROM subscriptions s
WHERE s.rep_id = '00000000-0000-0000-0000-000000000001'
  AND s.product_id != 'BIZCENTER'  -- BizCenter doesn't generate CABs
ON CONFLICT DO NOTHING;

-- Create CABs for all other subscriptions
INSERT INTO cab_records (cab_id, rep_id, subscription_id, enrollment_date, release_eligible_date, state, amount, trigger_reason, released_in_run_id, clawback_applied_run_id)
SELECT
  gen_random_uuid(),
  s.rep_id,
  s.subscription_id,
  s.enrollment_date,
  s.enrollment_date + INTERVAL '60 days',
  'PENDING'::cab_state,
  50,
  'Customer retention at 60 days',
  NULL,
  NULL
FROM subscriptions s
WHERE s.rep_id != '00000000-0000-0000-0000-000000000001'
  AND s.product_id != 'BIZCENTER'
ON CONFLICT DO NOTHING;

-- =============================================
-- CREATE BV SNAPSHOTS (March 2026)
-- =============================================

INSERT INTO bv_snapshots (snapshot_id, rep_id, month, year, personal_bv, team_bv, snapshot_date)
VALUES
  -- Sarah (Root) - Huge team BV (qualifies for Powerline)
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 3, 2026, 388, 150000, CURRENT_DATE),

  -- L1 Reps
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 3, 2026, 258, 12000, CURRENT_DATE),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 3, 2026, 168, 3500, CURRENT_DATE),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 3, 2026, 98, 800, CURRENT_DATE),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000005', 3, 2026, 138, 1200, CURRENT_DATE),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000006', 3, 2026, 258, 11000, CURRENT_DATE),

  -- L2 Reps
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000007', 3, 2026, 129, 500, CURRENT_DATE),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000008', 3, 2026, 59, 100, CURRENT_DATE),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000009', 3, 2026, 59, 80, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- =============================================
-- CREATE RANK SNAPSHOTS (March 2026)
-- =============================================

INSERT INTO rank_snapshots (rank_snapshot_id, rep_id, month, year, rank, personal_bv_at_snapshot, team_bv_at_snapshot, snapshot_date)
SELECT
  gen_random_uuid(),
  r.rep_id,
  3,
  2026,
  r.current_rank,
  bv.personal_bv,
  bv.team_bv,
  CURRENT_DATE
FROM reps r
INNER JOIN bv_snapshots bv ON r.rep_id = bv.rep_id
WHERE bv.month = 3 AND bv.year = 2026
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED COMPLETE
-- Ready to run commission calculations!
-- =============================================

SELECT
  'Test data seeded successfully!' as status,
  (SELECT COUNT(*) FROM reps) as total_reps,
  (SELECT COUNT(*) FROM subscriptions) as total_subscriptions,
  (SELECT COUNT(*) FROM cab_records) as total_cabs,
  (SELECT COUNT(*) FROM bv_snapshots) as bv_snapshots,
  (SELECT SUM(bv_value) FROM subscriptions WHERE status = 'ACTIVE') as total_bv;
