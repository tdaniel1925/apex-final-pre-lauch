# Integration Testing - Quick Start Guide

**Fast track to running the 16 integration test scenarios**

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Test Distributors
```bash
# Create first test distributor
npm run create-test-dist

# Follow prompts - use defaults or custom values
# Repeat 5 times to create: test-rep-001 through test-rep-005
```

### Step 2: Note Login Credentials
The script outputs:
```
Email: test-rep-001@example.com
Password: Test123!@#
Login URL: https://your-staging-url.vercel.app/login
```

**Save these credentials** - you'll need them for testing!

---

## 📋 Test Execution Commands

### Before Each Test
```bash
# Check current compliance status
npm run check-compliance test-rep-001@example.com
```

### After Each Test
```bash
# Verify changes took effect
npm run check-compliance test-rep-001@example.com
```

---

## 🧪 Test Scenarios (Quick Reference)

### Test 1: Anti-Frontloading

**Scenario 1.1: First Self-Purchase**
```bash
1. Login as test-rep-001
2. Go to /dashboard/store
3. Purchase AI Business Center ($150)
4. npm run check-compliance test-rep-001@example.com
   ✅ Should show: "1 purchase(s) ✅ Compliant"
```

**Scenario 1.2: Second Self-Purchase (Should NOT Count)**
```bash
1. Still logged in as test-rep-001
2. Purchase AI Business Center again
3. npm run check-compliance test-rep-001@example.com
   ⚠️ Should show: "2 purchase(s) ⚠️ Multiple purchases"
   ⚠️ Should show: "Only first purchase counted toward BV"
```

### Test 2: 70% Retail Requirement

**Scenario 2.1: 100% Retail (Compliant)**
```bash
1. Create 3 retail customers (NOT distributors)
2. Process orders from those customers to test-rep-002
3. npm run check-compliance test-rep-002@example.com
   ✅ Should show: "Retail %: 100.0%"
   ✅ Should show: "✅ COMPLIANT"
```

**Scenario 2.2: 50% Self-Purchase (Non-Compliant)**
```bash
1. test-rep-003 does 1 self-purchase ($150)
2. test-rep-003 gets 1 retail order ($150)
3. npm run check-compliance test-rep-003@example.com
   ❌ Should show: "Retail %: 50.0%"
   ❌ Should show: "❌ NON-COMPLIANT"
   Should show: "Need $60.00 more retail BV"
```

### Test 3: Commission Clawback

**Scenario 3.1: Full Refund**
```bash
# This requires Stripe webhook - manual steps:
1. Process order on staging
2. Note order ID and commissions created
3. Issue refund in Stripe dashboard
4. Check Vercel logs for webhook processing
5. Verify clawback entries in database:

SQL:
SELECT * FROM earnings_ledger
WHERE source_order_id = '<order_id>'
ORDER BY created_at;

-- Should see original commissions + clawback entries (negative amounts)
```

### Test 4: Rank Advancement

**Scenario 4.1: Starter → Bronze**
```bash
1. test-rep-005 generates 150 personal credits
2. test-rep-005 generates 300 team credits (via downline)
3. Run monthly commission calculation
4. npm run check-compliance test-rep-005@example.com
   ✅ Should show: "Rank: bronze"
5. Check for $250 rank bonus in earnings_ledger
```

---

## 🔍 Verification SQL Queries

### Check Anti-Frontloading
```sql
-- Count orders this month per product
SELECT
  product_id,
  COUNT(*) as purchase_count,
  MIN(created_at) as first_purchase,
  MAX(created_at) as last_purchase
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.rep_id = '<distributor_id>'
  AND o.status IN ('completed', 'processing')
  AND o.created_at >= DATE_TRUNC('month', NOW())
GROUP BY product_id;
```

### Check 70% Retail
```sql
-- Breakdown of retail vs self-purchase
SELECT
  CASE
    WHEN o.customer_id IN (SELECT id FROM distributors)
    THEN 'Self-Purchase'
    ELSE 'Retail'
  END as order_type,
  COUNT(*) as order_count,
  SUM(o.total_bv) as total_bv
FROM orders o
WHERE o.rep_id = '<distributor_id>'
  AND o.status IN ('completed', 'processing')
  AND o.created_at >= DATE_TRUNC('month', NOW())
GROUP BY order_type;
```

### Check Clawback Entries
```sql
-- All earnings for an order (including clawbacks)
SELECT
  member_id,
  type,
  amount_usd,
  status,
  created_at
FROM earnings_ledger
WHERE source_order_id = '<order_id>'
ORDER BY created_at;

-- Net amount (should be ~$0 after clawback)
SELECT SUM(amount_usd) as net_amount
FROM earnings_ledger
WHERE source_order_id = '<order_id>';
```

### Check Rank Advancement
```sql
-- Check current rank and credits
SELECT
  d.first_name,
  d.last_name,
  m.tech_rank,
  m.highest_tech_rank,
  m.personal_credits_monthly,
  m.team_credits_monthly
FROM distributors d
JOIN members m ON m.distributor_id = d.id
WHERE d.email = '<email>';

-- Check rank bonuses paid
SELECT *
FROM earnings_ledger
WHERE member_id = '<member_id>'
  AND type = 'rank_bonus'
ORDER BY created_at DESC;
```

---

## 📊 Test Results Template

Copy this for each test:

```
### Test X.X: [Scenario Name]
- Date: YYYY-MM-DD
- Tester: [Your Name]
- Environment: Staging

**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
- [Expected behavior]

**Actual Result:**
- [What actually happened]

**Status:** ☐ Pass ☐ Fail

**Notes:**
[Any observations, issues, or screenshots]

**SQL Verification:**
```sql
[Paste SQL query result]
```
```

---

## 🎯 Testing Checklist

Use this to track progress:

```
## Anti-Frontloading Tests
- [ ] 1.1: First self-purchase counts
- [ ] 1.2: Second self-purchase doesn't count
- [ ] 1.3: Different product counts
- [ ] 1.4: Monthly reset (next month)

## 70% Retail Tests
- [ ] 2.1: 100% retail (compliant)
- [ ] 2.2: 50% retail (non-compliant)
- [ ] 2.3: Exactly 70% retail (edge case)
- [ ] 2.4: Admin compliance dashboard

## Commission Clawback Tests
- [ ] 3.1: Full refund clawback
- [ ] 3.2: Partial refund clawback
- [ ] 3.3: Refund after 60 days
- [ ] 3.4: Webhook signature verification

## Rank Advancement Tests
- [ ] 4.1: Starter → Bronze
- [ ] 4.2: Bronze → Silver
- [ ] 4.3: Rank never goes down
- [ ] 4.4: Dashboard rank progress
```

---

## 🆘 Troubleshooting

### Can't create test distributor
```bash
# Check environment variables
cat .env.test | grep SUPABASE

# Verify database connection
npm run verify:stage-1
```

### Compliance check fails
```bash
# Make sure distributor exists
psql <connection-string> -c "SELECT * FROM distributors WHERE email = '<email>';"

# Check if member record exists
psql <connection-string> -c "SELECT * FROM members WHERE distributor_id = '<dist_id>';"
```

### Orders not showing up
```bash
# Check order status
psql <connection-string> -c "SELECT * FROM orders WHERE rep_id = '<dist_id>' ORDER BY created_at DESC LIMIT 5;"

# Check date range (must be current month)
SELECT created_at >= DATE_TRUNC('month', NOW()) as is_current_month
FROM orders
WHERE id = '<order_id>';
```

---

## 📸 Evidence Collection

For each test, collect:

1. **Before Screenshot** - Initial state from `npm run check-compliance`
2. **Action Screenshot** - The action being tested (purchase, refund, etc.)
3. **After Screenshot** - Final state from `npm run check-compliance`
4. **SQL Results** - Copy/paste verification query results
5. **Logs** - Relevant Vercel logs if applicable

---

## ⏱️ Time Estimates

| Test Category | Estimated Time |
|---------------|----------------|
| Anti-Frontloading (4 tests) | 30 minutes |
| 70% Retail (4 tests) | 45 minutes |
| Commission Clawback (4 tests) | 30 minutes |
| Rank Advancement (4 tests) | 30 minutes |
| **Total** | **~2 hours** |

---

## 🎉 When Complete

1. Fill out results in `INTEGRATION-TEST-PLAN.md`
2. Create summary report of any failures
3. File issues in GitHub for any bugs found
4. Share results with team

---

**Quick Commands Reference:**
```bash
# Setup
npm run create-test-dist              # Create test distributor
npm run check-compliance <email>      # Check compliance status

# Testing
npm run test:e2e                      # Run E2E tests
npm test                              # Run unit tests

# Database
npm run db:push                       # Push schema
npm run seed:master                   # Seed data
```

**Need More Help?**
- Full details: `INTEGRATION-TEST-PLAN.md`
- Testing guide: `TESTING.md`
- Session summary: `SESSION-SUMMARY-2026-03-28-FINAL.md`
