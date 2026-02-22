# Commission Engine Testing Framework

Complete isolated testing environment for the Apex MLM Commission Engine.

## 🎯 Overview

This testing framework allows you to:
- ✅ Test all 16 commission types in complete isolation
- ✅ Run scenarios without affecting production data
- ✅ Verify business logic, edge cases, and payout ratios
- ✅ Reset and re-run tests as many times as needed
- ✅ Safe to run in production database (uses email prefixes for isolation)

## 🔒 Safety Features

**All test data is isolated by email prefix:**
- Test distributors: `test_dist_001@example.com`, `test_dist_002@example.com`, etc.
- Test customers: `test_cust_001@example.com`, etc.
- Test month: `9999-99` (clearly not a real month)

**This means:**
- No impact on production data
- Easy identification of test records
- Complete cleanup with one command
- Can run in production database safely

## 📁 File Structure

```
tests/commission-engine/
├── README.md                          # This file
├── 00-setup-test-environment.sql      # Setup functions and isolation
├── 01-seed-test-distributors.sql     # Create 150+ test distributors
├── 02-seed-test-orders.sql           # Create customers, orders, BV
├── 03-run-commission-tests.sql       # Run all 16 commission types
├── 04-verify-results.sql             # Detailed verification
└── 99-cleanup-test-data.sql          # Remove all test data
```

## 🚀 Quick Start

### 1. Setup Test Environment

Run this first to create the isolation functions:

```bash
psql -f tests/commission-engine/00-setup-test-environment.sql
```

Or in Supabase SQL Editor, copy/paste the contents.

**What it does:**
- Creates `cleanup_test_data()` function
- Creates `verify_test_isolation()` function
- Sets up safety mechanisms

### 2. Seed Test Distributors

```bash
psql -f tests/commission-engine/01-seed-test-distributors.sql
```

**What it creates:**
- 150+ test distributors
- 7-level deep matrix structure
- All rank levels from Affiliate to Royal Diamond
- Realistic network topology

**Expected output:**
```
✅ Test distributors created!
total_distributors: 152
level_1: 1 (Royal Diamond)
level_2: 2 (Crown Diamonds)
level_3: 10 (Diamonds)
level_4: 30 (Platinum)
level_5: 30 (Gold)
level_6: 30 (Silver)
level_7: 49 (Bronze + Affiliates)
```

### 3. Seed Test Orders & BV

```bash
psql -f tests/commission-engine/02-seed-test-orders.sql
```

**What it creates:**
- 30 retail customers with orders
- 40 distributor self-purchases
- 20 active subscriptions
- BV snapshots for test month `9999-99`
- Calculated Group BV for all distributors

**Expected output:**
```
✅ Test orders and customers created!
Retail Customers: 30
Customer Orders: 30
Distributor Orders: 40
Active Subscriptions: 20
BV Snapshots: 152
```

### 4. Run Commission Calculations

```bash
psql -f tests/commission-engine/03-run-commission-tests.sql
```

**What it does:**
- Cleans up any old test commission records
- Runs `run_monthly_commissions('9999-99')`
- Calculates all 16 commission types
- Shows summary by commission type
- Shows top 20 earners
- Calculates payout ratio

**Expected output:**
```
🚀 Starting commission calculation for test month 9999-99...
✅ Commission calculation complete!

Commission Type         | Records | Total USD
-----------------------|---------|----------
Matrix Commissions     |     125 | $12,450.00
Matching Bonuses       |      85 |  $8,320.00
Retail Commissions     |      72 |  $6,180.00
Override Bonuses       |      54 |  $4,210.00
...

Payout Ratio: 48.5% ✅ Under 55% (Safe)
```

### 5. Verify Results

```bash
psql -f tests/commission-engine/04-verify-results.sql
```

**What it checks:**
- ✅ No negative commissions
- ✅ No duplicate records
- ✅ All commission types generated
- ✅ Retail rate at 35%
- ✅ Matrix rates match ranks
- ✅ Gen matching cap at $25k
- ✅ Payout ratio under 55%
- ✅ No inactive distributors paid
- ✅ Edge cases handled correctly

**Expected output:**
```
═══════════════════════════════════════
1. DATA INTEGRITY CHECKS
═══════════════════════════════════════
Negative Commission Check: ✅ PASS
Duplicate Retail Commissions: ✅ PASS
Duplicate Matrix Commissions: ✅ PASS

═══════════════════════════════════════
2. COMMISSION TYPE VERIFICATION
═══════════════════════════════════════
Retail Commissions: ✅ Generated (72 records, $6,180.00)
Matrix Commissions: ✅ Generated (125 records, $12,450.00)
...

═══════════════════════════════════════
4. PAYOUT RATIO HEALTH CHECK
═══════════════════════════════════════
Total Revenue: $156,240.00
Total Commissions: $75,820.00
Payout Ratio: 48.53%
Health Status: ✅ ACCEPTABLE: 45-50%
```

### 6. Cleanup (Reset Sandbox)

```bash
psql -f tests/commission-engine/99-cleanup-test-data.sql
```

**What it does:**
- Removes ALL test data (distributors, customers, orders, commissions)
- Verifies cleanup was complete
- Leaves production data untouched

**Expected output:**
```
Cleanup complete: 152 distributors, 30 customers, 70 orders, 487 commission records deleted

✅ Cleanup verification
Test Distributors Remaining: 0 (✅ Clean)
Test Customers Remaining: 0 (✅ Clean)
Test Orders Remaining: 0 (✅ Clean)
Test Commissions Remaining: 0 (✅ Clean)
```

## 🔄 Complete Test Cycle

Run all tests in sequence:

```bash
# 1. Setup (only needed once)
psql -f tests/commission-engine/00-setup-test-environment.sql

# 2. Full test cycle
psql -f tests/commission-engine/01-seed-test-distributors.sql
psql -f tests/commission-engine/02-seed-test-orders.sql
psql -f tests/commission-engine/03-run-commission-tests.sql
psql -f tests/commission-engine/04-verify-results.sql

# 3. Cleanup when done
psql -f tests/commission-engine/99-cleanup-test-data.sql
```

## 🧪 Test Scenarios Covered

### Commission Types Tested

1. **Retail Commissions** - 35% of retail sales
2. **Matrix Commissions** - 7 levels deep, rank-based rates
3. **Matching Bonuses** - Gen 1-3, Silver+ only, $25k cap
4. **Override Bonuses** - Differential on lower ranks, break rule
5. **Infinity Bonus** - L8+ for Diamond+, circuit breaker at 5%
6. **Customer Milestone** - New customer acquisition bonuses
7. **Customer Retention** - Autoship/subscription bonuses
8. **Fast Start Bonuses** - First 30 days, 10% upline share
9. **Rank Advancement** - One-time bonuses with speed multipliers
10. **Car Bonuses** - 4-tier program
11. **Vacation Bonuses** - One-time per rank
12. **Infinity Pool** - 3% company BV distribution

### Edge Cases Tested

- ✅ Matrix compression (skip inactive distributors)
- ✅ Break rule (override stops at equal/higher rank)
- ✅ Gen matching cap ($25k per distributor)
- ✅ Circuit breaker (infinity bonus at 5% company BV)
- ✅ Speed multipliers (2×, 1.5×, 1× for rank advancement)
- ✅ Installment payments (Diamond+ rank bonuses)
- ✅ Inactive distributor handling
- ✅ Zero BV scenarios
- ✅ Duplicate prevention

## 📊 Expected Payout Ratios

| Status | Payout Ratio | Health |
|--------|--------------|--------|
| ✅ Excellent | Under 45% | Very safe margin |
| ✅ Good | 45-50% | Safe margin |
| ✅ Acceptable | 50-55% | Target zone |
| ⚠️ Warning | 55-60% | Review required |
| ❌ Danger | Over 60% | Unsustainable |

The commission plan is designed to stay **under 55%** even with full matrix depth and all bonuses active.

## 🛠️ Troubleshooting

### "No test distributors found"
**Solution:** Run `01-seed-test-distributors.sql` first.

### "No BV snapshots for test month"
**Solution:** Run `02-seed-test-orders.sql` - it creates BV snapshots.

### "Commission calculation returns 0 records"
**Possible causes:**
1. No BV in the system (check `bv_snapshots` table)
2. All distributors are inactive
3. Missing products in the database

**Debug:**
```sql
-- Check BV exists
SELECT COUNT(*) FROM bv_snapshots WHERE month_year = '9999-99';

-- Check distributor status
SELECT status, COUNT(*) FROM distributors WHERE email LIKE 'test_%' GROUP BY status;

-- Check if calculate_group_bv ran
SELECT distributor_id, group_bv FROM bv_snapshots WHERE month_year = '9999-99' AND group_bv > 0 LIMIT 5;
```

### "Payout ratio shows 0%"
**Cause:** No orders in the system.
**Solution:** Run `02-seed-test-orders.sql`.

### "Function does not exist: cleanup_test_data()"
**Cause:** Environment setup not run.
**Solution:** Run `00-setup-test-environment.sql`.

## 🔍 Manual Verification Queries

### Check test data exists
```sql
SELECT * FROM verify_test_isolation();
```

### View test distributor matrix structure
```sql
SELECT
  id,
  email,
  first_name || ' ' || last_name as name,
  matrix_depth,
  matrix_position,
  sponsor_id,
  status
FROM distributors
WHERE email LIKE 'test_%'
ORDER BY matrix_depth, matrix_position;
```

### Check BV distribution
```sql
SELECT
  d.email,
  bv.personal_bv,
  bv.group_bv,
  d.matrix_depth
FROM distributors d
JOIN bv_snapshots bv ON bv.distributor_id = d.id
WHERE d.email LIKE 'test_%'
  AND bv.month_year = '9999-99'
ORDER BY bv.group_bv DESC
LIMIT 10;
```

### View commission breakdown for specific distributor
```sql
WITH dist AS (
  SELECT id FROM distributors WHERE email = 'test_dist_001@example.com'
)
SELECT
  'Retail' as type,
  commission_cents::NUMERIC / 100 as usd
FROM commissions_retail
WHERE distributor_id = (SELECT id FROM dist) AND month_year = '9999-99'
UNION ALL
SELECT
  'Matrix' as type,
  total_commission_cents::NUMERIC / 100 as usd
FROM commissions_matrix
WHERE distributor_id = (SELECT id FROM dist) AND month_year = '9999-99'
UNION ALL
SELECT
  'Matching' as type,
  total_commission_cents::NUMERIC / 100 as usd
FROM commissions_matching
WHERE distributor_id = (SELECT id FROM dist) AND month_year = '9999-99';
```

## 📝 Notes

- **Test month is always `9999-99`** - Makes it easy to identify test data in queries
- **Test emails use `test_` prefix** - Safe filtering for cleanup
- **Can run multiple times** - Just run cleanup script between runs
- **Safe for production** - All test data is isolated and clearly marked
- **No mocking needed** - Uses real database functions and tables

## 🚨 Safety Reminders

1. **Never run cleanup on production without checking the prefix:**
   ```sql
   -- SAFE: Only deletes test_ emails
   DELETE FROM distributors WHERE email LIKE 'test_%';

   -- DANGEROUS: Would delete everything
   DELETE FROM distributors;
   ```

2. **Always verify test isolation before running:**
   ```sql
   SELECT * FROM verify_test_isolation();
   ```

3. **Test month `9999-99` will never conflict with real months** - Production months are like `2026-02`

## 📚 Additional Resources

- See `PRD/BUILD-STATUS.md` for overall project status
- See `SESSION-COMPLETE.md` for commission engine implementation details
- See `supabase/migrations/` for database schema
- See `/admin/payouts` UI for manual testing via admin interface

---

**Ready to test? Start with step 1 above! 🚀**
