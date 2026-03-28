# SECURITY FIXES - TESTING GUIDE
**Date:** 2026-03-27
**Branch:** `feature/security-fixes-mvp`
**Status:** Ready for Testing

---

## 🎯 TESTING OVERVIEW

This guide provides step-by-step instructions for testing all 5 security fixes in the MVP security fixes release.

**Prerequisites:**
- Development database with test data
- Admin account credentials
- API testing tool (Postman, curl, or browser DevTools)
- Access to Supabase dashboard (for database verification)

---

## 🧪 FIX #1: CROSS-ORGANIZATION DATA ACCESS PREVENTION

### What This Fix Does:
Prevents users from accessing data from other organizations by manipulating distributor IDs in requests.

### Test Setup:
1. Create 2 test organizations with distributors:
   ```sql
   -- Organization A (root: org_a_root_id)
   INSERT INTO distributors (id, first_name, last_name, email, sponsor_id, matrix_parent_id)
   VALUES
     ('org_a_root_id', 'Alice', 'Root', 'alice@orga.com', NULL, NULL),
     ('org_a_user_id', 'Bob', 'UserA', 'bob@orga.com', 'org_a_root_id', 'org_a_root_id');

   -- Organization B (root: org_b_root_id)
   INSERT INTO distributors (id, first_name, last_name, email, sponsor_id, matrix_parent_id)
   VALUES
     ('org_b_root_id', 'Charlie', 'Root', 'charlie@orgb.com', NULL, NULL),
     ('org_b_user_id', 'Diana', 'UserB', 'diana@orgb.com', 'org_b_root_id', 'org_b_root_id');
   ```

2. Log in as Bob (Org A user)

### Test Cases:

#### Test 1.1: Access Own Organization Data (Should Work) ✅
```bash
# Get Bob's team (should work - same org)
curl -X GET 'http://localhost:3000/api/dashboard/team?distributorId=org_a_user_id' \
  -H 'Cookie: your-session-cookie'
```

**Expected Result:**
- Status: 200 OK
- Returns Bob's team data

#### Test 1.2: Access Other Organization Data (Should Fail) ❌
```bash
# Try to get Diana's team from Org B (should fail - different org)
curl -X GET 'http://localhost:3000/api/dashboard/team?distributorId=org_b_user_id' \
  -H 'Cookie: your-session-cookie'
```

**Expected Result:**
- Status: 403 Forbidden
- Error message: "Access denied: You don't have permission to access this organization's data"

#### Test 1.3: Matrix Position Cross-Org Access (Should Fail) ❌
```bash
# Try to access Org B's matrix position
curl -X GET 'http://localhost:3000/api/dashboard/matrix-position?distributorId=org_b_user_id' \
  -H 'Cookie: your-session-cookie'
```

**Expected Result:**
- Status: 403 Forbidden
- Access denied message

#### Test 1.4: Downline Cross-Org Access (Should Fail) ❌
```bash
# Try to access Org B's downline
curl -X GET 'http://localhost:3000/api/dashboard/downline?distributorId=org_b_user_id' \
  -H 'Cookie: your-session-cookie'
```

**Expected Result:**
- Status: 403 Forbidden
- Access denied message

### Verification:
- ✅ Same org access works
- ✅ Cross-org access blocked on all 3 endpoints
- ✅ Clear error messages returned

---

## 🔒 FIX #2: COMPENSATION RUN RACE CONDITION PREVENTION

### What This Fix Does:
Prevents multiple admins from running compensation calculations simultaneously, which could cause duplicate payouts.

### Test Setup:
1. Log in as admin user
2. Have 2 browser tabs or API clients ready
3. Define a test period (e.g., "2026-03-01" to "2026-03-31")

### Test Cases:

#### Test 2.1: Single Compensation Run (Should Work) ✅
```bash
# Start compensation run
curl -X POST 'http://localhost:3000/api/admin/compensation/run' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: admin-session-cookie' \
  -d '{
    "periodStart": "2026-03-01",
    "periodEnd": "2026-03-31",
    "dryRun": true
  }'
```

**Expected Result:**
- Status: 200 OK
- Returns run summary with runId

#### Test 2.2: Duplicate Run (Should Fail) ❌
**IMMEDIATELY after Test 2.1 completes, try again:**
```bash
# Try to run for same period again
curl -X POST 'http://localhost:3000/api/admin/compensation/run' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: admin-session-cookie' \
  -d '{
    "periodStart": "2026-03-01",
    "periodEnd": "2026-03-31",
    "dryRun": true
  }'
```

**Expected Result:**
- Status: 409 Conflict
- Error: "A compensation run is already in progress for this period"

#### Test 2.3: Concurrent Runs (Should Block) ⚡
**Run this test with 2 terminals simultaneously:**

Terminal 1:
```bash
curl -X POST 'http://localhost:3000/api/admin/compensation/run' \
  -H 'Content-Type: application/json' \
  -d '{"periodStart": "2026-04-01", "periodEnd": "2026-04-30", "dryRun": true}'
```

Terminal 2 (start within 1 second):
```bash
curl -X POST 'http://localhost:3000/api/admin/compensation/run' \
  -H 'Content-Type: application/json' \
  -d '{"periodStart": "2026-04-01", "periodEnd": "2026-04-30", "dryRun": true}'
```

**Expected Result:**
- One request: 200 OK (gets the lock)
- Other request: 409 Conflict (lock denied)

#### Test 2.4: Check Database Lock Record
```sql
-- Verify compensation_run_status table
SELECT run_id, period_start, period_end, status, initiated_at, completed_at
FROM compensation_run_status
ORDER BY initiated_at DESC
LIMIT 5;
```

**Expected Result:**
- Each run has a record
- Status transitions: pending → in_progress → completed
- No duplicate active runs for same period

### Verification:
- ✅ Single run works correctly
- ✅ Duplicate run prevented (409 error)
- ✅ Concurrent requests handled (one succeeds, one fails)
- ✅ Database records created properly

---

## ⚛️ FIX #3: ATOMIC DISTRIBUTOR PLACEMENT

### What This Fix Does:
Creates distributor and member records in a single atomic transaction - prevents orphaned records if placement fails.

### Test Setup:
1. Log in as admin
2. Have a sponsor distributor ready
3. Have a matrix parent with available positions

### Test Cases:

#### Test 3.1: Successful Distributor Creation (Should Work) ✅
```bash
# Create new distributor with valid placement
curl -X POST 'http://localhost:3000/api/admin/distributors' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: admin-session-cookie' \
  -d '{
    "email": "newuser@test.com",
    "first_name": "Test",
    "last_name": "User",
    "phone": "555-0100",
    "sponsor_id": "existing_sponsor_id",
    "matrix_parent_id": "existing_parent_id",
    "matrix_position": 1,
    "matrix_depth": 1
  }'
```

**Expected Result:**
- Status: 200 OK
- Returns new distributor with ID
- Both distributor AND member records created

**Verification:**
```sql
-- Check distributor created
SELECT * FROM distributors WHERE email = 'newuser@test.com';

-- Check member created (should exist!)
SELECT * FROM members WHERE distributor_id = (
  SELECT id FROM distributors WHERE email = 'newuser@test.com'
);

-- Verify placement
SELECT matrix_parent_id, matrix_position, matrix_depth
FROM distributors WHERE email = 'newuser@test.com';
```

#### Test 3.2: Duplicate Email (Should Fail Atomically) ❌
```bash
# Try to create with existing email
curl -X POST 'http://localhost:3000/api/admin/distributors' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "newuser@test.com",
    "first_name": "Another",
    "last_name": "User",
    "sponsor_id": "existing_sponsor_id",
    "matrix_parent_id": "existing_parent_id",
    "matrix_position": 2,
    "matrix_depth": 1
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Error message about duplicate email
- NO orphaned distributor or member records

**Verification:**
```sql
-- Should only be 1 record (from Test 3.1)
SELECT COUNT(*) FROM distributors WHERE email = 'newuser@test.com';
-- Expected: 1 (not 2!)
```

#### Test 3.3: Invalid Matrix Position (Should Fail Atomically) ❌
```bash
# Try to place in occupied position
curl -X POST 'http://localhost:3000/api/admin/distributors' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "another@test.com",
    "first_name": "Test",
    "last_name": "User2",
    "sponsor_id": "existing_sponsor_id",
    "matrix_parent_id": "existing_parent_id",
    "matrix_position": 1,
    "matrix_depth": 1
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Error: Matrix position already occupied
- NO orphaned records created

**Verification:**
```sql
-- Should NOT exist
SELECT * FROM distributors WHERE email = 'another@test.com';
-- Expected: 0 rows
```

### Verification:
- ✅ Successful creation creates BOTH distributor and member
- ✅ Failed creation creates NEITHER (atomic rollback)
- ✅ No orphaned records in database
- ✅ Clear error messages for failures

---

## 📧 FIX #4: EMAIL DUPLICATE PREVENTION

### What This Fix Does:
Prevents multiple distributors from having the same email address via database UNIQUE constraint.

### Test Setup:
1. Log in as admin
2. Have an existing distributor

### Test Cases:

#### Test 4.1: Create Distributor with Unique Email (Should Work) ✅
```bash
curl -X POST 'http://localhost:3000/api/admin/distributors' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "unique@test.com",
    "first_name": "Unique",
    "last_name": "User",
    "sponsor_id": "existing_sponsor_id",
    "matrix_parent_id": "existing_parent_id",
    "matrix_position": 3,
    "matrix_depth": 1
  }'
```

**Expected Result:**
- Status: 200 OK
- Distributor created successfully

#### Test 4.2: Create Distributor with Duplicate Email (Should Fail) ❌
```bash
curl -X POST 'http://localhost:3000/api/admin/distributors' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "unique@test.com",
    "first_name": "Duplicate",
    "last_name": "Attempt",
    "sponsor_id": "existing_sponsor_id",
    "matrix_parent_id": "existing_parent_id",
    "matrix_position": 4,
    "matrix_depth": 1
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Error: Email already exists (from atomic function validation)

#### Test 4.3: Change Email to Duplicate (Should Fail) ❌
```bash
# Try to change distributor's email to one that's already in use
curl -X POST 'http://localhost:3000/api/admin/distributors/some_distributor_id/change-email' \
  -H 'Content-Type: application/json' \
  -d '{
    "newEmail": "unique@test.com"
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "This email address is already in use by another distributor"
- Includes details showing which distributor owns it

#### Test 4.4: Change Email to Unique Value (Should Work) ✅
```bash
curl -X POST 'http://localhost:3000/api/admin/distributors/some_distributor_id/change-email' \
  -H 'Content-Type: application/json' \
  -d '{
    "newEmail": "newemail@test.com"
  }'
```

**Expected Result:**
- Status: 200 OK
- Email updated in both distributors AND members tables
- Notification email sent

#### Test 4.5: Database Constraint Verification
```sql
-- Try to insert duplicate email directly in database (should fail)
INSERT INTO distributors (id, email, first_name, last_name, sponsor_id)
VALUES (gen_random_uuid(), 'unique@test.com', 'Direct', 'Insert', 'some_sponsor_id');
```

**Expected Result:**
- PostgreSQL error: duplicate key value violates unique constraint "distributors_email_key"
- Insert rejected at database level

### Verification:
- ✅ Unique emails accepted
- ✅ Duplicate emails rejected at application layer
- ✅ Duplicate emails rejected at database layer (UNIQUE constraint)
- ✅ Change-email endpoint validates duplicates
- ✅ Clear error messages showing which distributor owns email

---

## 💰 FIX #5: OVERRIDE CALCULATION WITH RANK DEPTH ENFORCEMENT

### What This Fix Does:
Implements actual override calculation in compensation run (was placeholder code). Automatically enforces rank depth limits via existing logic.

### Test Setup:
1. Create test orders in database
2. Create test distributors with different ranks
3. Set up matrix tree relationships

### Detailed Test Data Setup:

```sql
-- Create test organization
INSERT INTO distributors (id, first_name, last_name, email, sponsor_id, matrix_parent_id, matrix_depth)
VALUES
  -- Root (Platinum - unlocks all L1-L5)
  ('root_id', 'Platinum', 'Root', 'platinum@test.com', NULL, NULL, 0),
  -- L1 (Silver - unlocks L1-L3 only)
  ('silver_id', 'Silver', 'User', 'silver@test.com', 'root_id', 'root_id', 1),
  -- L2 (Bronze - unlocks L1-L2 only)
  ('bronze_id', 'Bronze', 'User', 'bronze@test.com', 'silver_id', 'silver_id', 2),
  -- L3 (Starter - unlocks L1 only)
  ('starter_id', 'Starter', 'User', 'starter@test.com', 'bronze_id', 'bronze_id', 3),
  -- L4 Seller
  ('seller_id', 'Seller', 'User', 'seller@test.com', 'starter_id', 'starter_id', 4);

-- Create members with ranks
INSERT INTO members (member_id, distributor_id, tech_rank, personal_credits_monthly, status)
VALUES
  (gen_random_uuid(), 'root_id', 'platinum', 500, 'active'),
  (gen_random_uuid(), 'silver_id', 'silver', 500, 'active'),
  (gen_random_uuid(), 'bronze_id', 'bronze', 500, 'active'),
  (gen_random_uuid(), 'starter_id', 'starter', 500, 'active'),
  (gen_random_uuid(), 'seller_id', 'starter', 100, 'active');

-- Create test product
INSERT INTO products (id, name, price_cents, member_price_cents, bv, product_type, status)
VALUES
  ('prod_1', 'Test Product', 10000, 8000, 80, 'standard', 'active');

-- Create test order
INSERT INTO orders (id, member_id, status, total_cents, created_at)
VALUES
  ('order_1', (SELECT member_id FROM members WHERE distributor_id = 'seller_id'), 'completed', 10000, '2026-03-15');

-- Create order item
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price_cents)
VALUES
  (gen_random_uuid(), 'order_1', 'prod_1', 1, 10000);
```

### Test Cases:

#### Test 5.1: Run Compensation for Test Period ✅
```bash
curl -X POST 'http://localhost:3000/api/admin/compensation/run' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: admin-session-cookie' \
  -d '{
    "periodStart": "2026-03-01",
    "periodEnd": "2026-03-31",
    "dryRun": true
  }'
```

**Expected Result:**
- Status: 200 OK
- Returns summary with commission totals
- Shows earnings calculated

#### Test 5.2: Verify Rank Depth Enforcement in Database
```sql
-- Check earnings_ledger for override commissions
SELECT
  e.member_id,
  d.first_name,
  d.last_name,
  m.tech_rank,
  e.earning_type,
  e.metadata->>'level' as level,
  e.metadata->>'percentage' as percentage,
  e.final_amount_cents / 100.0 as amount_dollars
FROM earnings_ledger e
JOIN members m ON e.member_id = m.member_id
JOIN distributors d ON m.distributor_id = d.id
WHERE e.earning_type = 'override_commission'
  AND e.run_id = 'your_run_id_from_test_5_1'
ORDER BY (e.metadata->>'level')::int;
```

**Expected Result:**

| Name | Rank | Level | Percentage | Amount |
|------|------|-------|------------|--------|
| Starter | starter | L1 | 0.30 | $X.XX (30% of override pool) |
| Bronze | bronze | L2 | 0.05 | $X.XX (5% - L2 unlocked) |
| Bronze | bronze | L3 | **0.00** | **$0.00** (L3 NOT unlocked!) |
| Silver | silver | L3 | 0.05 | $X.XX (L3 unlocked) |
| Silver | silver | L4 | **0.00** | **$0.00** (L4 NOT unlocked!) |
| Platinum | platinum | L4 | 0.08 | $X.XX (L4 unlocked) |
| Platinum | platinum | L5 | 0.03 | $X.XX (L5 unlocked) |

**Key Verifications:**
- ✅ Bronze gets L1-L2 only (L3+ = $0)
- ✅ Silver gets L1-L3 only (L4-L5 = $0)
- ✅ Platinum gets all L1-L5
- ✅ Percentages match RANKED_OVERRIDE_SCHEDULES

#### Test 5.3: Verify L1 Uses Enrollment Tree (sponsor_id)
```sql
-- L1 override should go to direct sponsor (via sponsor_id)
SELECT
  e.member_id,
  d.first_name,
  m.tech_rank,
  e.metadata->>'level' as level,
  e.metadata->>'rule' as rule,
  e.final_amount_cents / 100.0 as amount
FROM earnings_ledger e
JOIN members m ON e.member_id = m.member_id
JOIN distributors d ON m.distributor_id = d.id
WHERE e.earning_type = 'override_commission'
  AND e.metadata->>'level' = '1'
  AND e.metadata->>'seller_member_id' = (
    SELECT member_id FROM members WHERE distributor_id = 'seller_id'
  );
```

**Expected Result:**
- L1 override goes to Starter (direct sponsor via `sponsor_id`)
- Rule: 'enroller'
- Percentage: 0.30 (30%)

#### Test 5.4: Verify L2-L5 Use Matrix Tree (matrix_parent_id)
```sql
-- L2+ overrides should walk up matrix tree
SELECT
  e.member_id,
  d.first_name,
  m.tech_rank,
  e.metadata->>'level' as level,
  e.metadata->>'rule' as rule,
  e.final_amount_cents / 100.0 as amount
FROM earnings_ledger e
JOIN members m ON e.member_id = m.member_id
JOIN distributors d ON m.distributor_id = d.id
WHERE e.earning_type = 'override_commission'
  AND (e.metadata->>'level')::int > 1
ORDER BY (e.metadata->>'level')::int;
```

**Expected Result:**
- L2 → Bronze (via matrix_parent_id chain)
- L3 → Silver (via matrix_parent_id chain)
- L4 → Platinum (via matrix_parent_id chain)
- L5 → Platinum (if exists in chain)
- Rule: 'positional' (not 'enroller')

#### Test 5.5: Verify 50 BV Minimum Qualification
```sql
-- Update one upline member to have < 50 credits
UPDATE members
SET personal_credits_monthly = 30
WHERE distributor_id = 'bronze_id';

-- Run compensation again (new period)
-- Then check earnings
```

**Expected Result:**
- Bronze member gets $0 override at L2
- Reason in metadata: "Below 50 credit minimum (has 30 credits)"
- Other qualified members still get overrides

### Verification:
- ✅ Compensation run processes actual orders
- ✅ Rank depth enforced automatically (Bronze can't get L3+)
- ✅ L1 uses enrollment tree (sponsor_id)
- ✅ L2-L5 use matrix tree (matrix_parent_id)
- ✅ 50 BV minimum enforced
- ✅ Earnings inserted into earnings_ledger
- ✅ Waterfall calculated correctly
- ✅ Summary totals accurate

---

## 🎯 QUICK SMOKE TEST (All Fixes in 5 Minutes)

If you're short on time, run these quick tests:

### 1. Cross-Org Access (Fix #1)
```bash
# Try to access different org's data (should fail)
curl 'http://localhost:3000/api/dashboard/team?distributorId=different_org_dist_id' \
  -H 'Cookie: your-session'
# Expected: 403 Forbidden
```

### 2. Duplicate Comp Run (Fix #2)
```bash
# Run twice for same period (second should fail)
curl -X POST 'http://localhost:3000/api/admin/compensation/run' \
  -d '{"periodStart":"2026-03-01","periodEnd":"2026-03-31","dryRun":true}'
# Run again immediately
# Expected second run: 409 Conflict
```

### 3. Duplicate Email (Fix #4)
```sql
-- Try to insert duplicate email (should fail)
INSERT INTO distributors (id, email, first_name, last_name)
VALUES (gen_random_uuid(), 'existing@email.com', 'Test', 'User');
-- Expected: UNIQUE constraint violation
```

### 4. Atomic Placement (Fix #3)
```bash
# Create distributor with invalid position (should fail cleanly)
curl -X POST 'http://localhost:3000/api/admin/distributors' \
  -d '{"email":"test@test.com","matrix_position":999,...}'
# Check database - should have NO orphaned records
```

### 5. Override Calculation (Fix #5)
```bash
# Run compensation and check earnings_ledger
curl -X POST 'http://localhost:3000/api/admin/compensation/run' \
  -d '{"periodStart":"2026-03-01","periodEnd":"2026-03-31","dryRun":true}'
# Check database for earnings records
SELECT COUNT(*) FROM earnings_ledger WHERE earning_type = 'override_commission';
# Expected: > 0 (if orders exist)
```

---

## 📊 TESTING CHECKLIST

Before merging to production, verify:

- [ ] **Fix #1**: Cross-org access blocked on all 3 endpoints
- [ ] **Fix #2**: Duplicate compensation runs prevented (409 error)
- [ ] **Fix #2**: concurrent runs handled correctly
- [ ] **Fix #3**: Successful creation creates both distributor + member
- [ ] **Fix #3**: Failed creation creates neither (atomic rollback)
- [ ] **Fix #4**: Duplicate emails rejected at database level
- [ ] **Fix #4**: Change-email validates duplicates
- [ ] **Fix #5**: Compensation run calculates actual overrides
- [ ] **Fix #5**: Rank depth enforced (Bronze can't get L3+)
- [ ] **Fix #5**: L1 uses sponsor_id, L2-L5 use matrix_parent_id
- [ ] **Fix #5**: 50 BV minimum enforced
- [ ] All error messages are clear and helpful
- [ ] No orphaned database records
- [ ] No TypeScript compilation errors (except pre-existing zowee issues)
- [ ] Pre-commit hooks pass

---

## 🚀 NEXT STEPS AFTER TESTING

1. **If all tests pass:**
   - Merge `feature/security-fixes-mvp` to `main/master`
   - Deploy to staging environment
   - Run tests again in staging
   - Deploy to production

2. **If tests fail:**
   - Document the failure in GitHub issue
   - Fix the issue on the feature branch
   - Re-test
   - Repeat until all tests pass

3. **Post-deployment monitoring:**
   - Monitor error logs for 403 errors (cross-org access attempts)
   - Monitor compensation_run_status table for conflicts
   - Check earnings_ledger for override calculations
   - Verify no orphaned distributor/member records

---

## 🔍 TROUBLESHOOTING

### Common Issues:

**"Cannot read property 'distributor' of null"**
- Cause: Member record doesn't exist for distributor
- Fix: Ensure Fix #3 created both records atomically

**"Lock acquisition failed"**
- Cause: Previous compensation run didn't release lock
- Fix: Check compensation_run_status for stuck runs, manually release if needed:
  ```sql
  SELECT pg_advisory_unlock_all();
  ```

**"Earnings_ledger insert failed"**
- Cause: Invalid foreign key reference
- Fix: Verify member_id exists in members table

**"Override amounts are $0"**
- Cause: Member below 50 BV minimum, or rank doesn't unlock level
- Fix: Check member's personal_credits_monthly and tech_rank

---

**End of Testing Guide**
