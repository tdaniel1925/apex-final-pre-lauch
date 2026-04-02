# 🧪 Testing Real-Time Earnings Estimates - Complete Guide

**Status:** Database migration complete ✅

---

## Step 1: Verify Database Setup

**Run this in Supabase SQL Editor:**

```bash
# Open the file:
verify-earnings-setup.sql
```

**Expected Results:**
- ✅ estimated_earnings table EXISTS
- ✅ earnings_ledger status check UPDATED
- Shows table columns
- Shows active members
- Shows active products

---

## Step 2: Make a Test Purchase

### Option A: Through Dashboard UI (Recommended)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Login to dashboard:**
   - Go to: `http://localhost:3050/login`
   - Login with any active distributor account

3. **Go to Store:**
   - Navigate to: `http://localhost:3050/dashboard/store`

4. **Buy a product:**
   - Click "Buy" on any product (PulseMarket, PulseFlow, etc.)
   - **IMPORTANT:** Use Stripe test mode, not live!
   - Complete checkout

### Option B: Using Test Script (If Option A has issues)

```bash
# Run the test script:
npx tsx test-earnings-simple.js
```

---

## Step 3: Verify Estimates Were Created

**Run this SQL immediately after purchase:**

```sql
-- Check if estimates were created
SELECT
  ee.earning_type,
  ee.estimated_amount_cents / 100.0 as amount_dollars,
  ee.current_qualification_status,
  ee.snapshot_member_pv,
  ee.snapshot_retail_pct,
  ee.created_at,
  m.full_name as member_name,
  t.description as transaction_desc
FROM estimated_earnings ee
JOIN members m ON m.member_id = ee.member_id
JOIN transactions t ON t.id = ee.transaction_id
ORDER BY ee.created_at DESC
LIMIT 10;
```

**Expected Results:**

You should see estimates like:
```
earning_type       | amount_dollars | status  | pv  | retail_pct
-------------------+----------------+---------+-----+------------
seller_commission  | 23.40          | pending | 100 | 0.00
override_l1        | 9.75           | pending | 100 | 0.00
override_l2        | 7.80           | pending | 100 | 0.00
```

✅ **PASS if:** You see seller_commission + override estimates
❌ **FAIL if:** No rows returned

---

## Step 4: Test Daily Qualification Update

**Run the cron job manually:**

```bash
# In your terminal:
curl http://localhost:3050/api/cron/update-estimates
```

**Or in browser:**
- Navigate to: `http://localhost:3050/api/cron/update-estimates`

**Expected Response:**
```json
{
  "success": true,
  "summary": {
    "total_checked": 3,
    "total_qualified": 2,
    "total_at_risk": 0,
    "total_disqualified": 1,
    "status_changes": 3
  }
}
```

---

## Step 5: Verify Status Updates

**Run this SQL after the cron job:**

```sql
-- Check updated qualification statuses
SELECT
  ee.earning_type,
  ee.estimated_amount_cents / 100.0 as amount,
  ee.current_qualification_status as status,
  ee.qualification_checks,
  ee.disqualification_reasons,
  ee.last_checked_at,
  m.full_name,
  m.personal_credits_monthly as current_pv,
  (
    SELECT COUNT(*)::int
    FROM transactions t2
    WHERE t2.seller_distributor_id = m.member_id
    AND t2.is_retail = true
    AND t2.created_at >= DATE_TRUNC('month', CURRENT_DATE)
  ) as retail_sales_count
FROM estimated_earnings ee
JOIN members m ON m.member_id = ee.member_id
WHERE ee.run_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
ORDER BY ee.created_at DESC
LIMIT 10;
```

**Expected Results:**

```
earning_type       | amount | status      | reasons
-------------------+--------+-------------+---------------------------
seller_commission  | 23.40  | qualified   | []
override_l1        | 9.75   | disqualified| ["Below 70% retail requirement (current: 0.0% retail)"]
override_l2        | 7.80   | disqualified| ["Below 70% retail requirement (current: 0.0% retail)"]
```

**Understanding the Results:**

✅ **Seller Commission = QUALIFIED** → Always earned (not affected by retail %)
❌ **Overrides = DISQUALIFIED** → Requires 70% retail (0% retail in this test)

This is CORRECT behavior! The 70% retail rule is working.

---

## Step 6: Test the 70% Retail Rule

Let's verify the 70% retail rule works correctly:

### Add Retail Sales to Qualify

```sql
-- Add 3 retail transactions to get above 70% retail
-- (Assuming you have 1 personal purchase, adding 3 retail = 75% retail)

INSERT INTO transactions (
  distributor_id,
  seller_distributor_id,
  transaction_type,
  amount_cents,
  bv_amount,
  product_slug,
  description,
  is_retail
)
SELECT
  m.distributor_id,
  m.member_id,
  'product_sale',
  5900, -- $59
  3835, -- Approximate BV
  'pulsemarket',
  'Test retail sale ' || generate_series,
  true -- RETAIL sale
FROM members m
CROSS JOIN generate_series(1, 3)
WHERE m.member_id = (
  SELECT member_id FROM estimated_earnings
  ORDER BY created_at DESC LIMIT 1
)
LIMIT 3;
```

### Run Cron Again

```bash
curl http://localhost:3050/api/cron/update-estimates
```

### Check Status Again

```sql
-- Should now show qualified!
SELECT
  earning_type,
  estimated_amount_cents / 100.0 as amount,
  current_qualification_status,
  disqualification_reasons
FROM estimated_earnings
WHERE run_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
```
earning_type       | amount | status    | reasons
-------------------+--------+-----------+---------
seller_commission  | 23.40  | qualified | []
override_l1        | 9.75   | qualified | []  ← NOW QUALIFIED!
override_l2        | 7.80   | qualified | []  ← NOW QUALIFIED!
```

✅ **PASS:** Overrides changed to "qualified" after adding retail sales!

---

## Step 7: Test Low PV Disqualification

```sql
-- Lower member PV below 50 minimum
UPDATE members
SET personal_credits_monthly = 40  -- Below 50 minimum
WHERE member_id = (
  SELECT member_id FROM estimated_earnings
  ORDER BY created_at DESC LIMIT 1
);
```

### Run Cron Again

```bash
curl http://localhost:3050/api/cron/update-estimates
```

### Check Status

```sql
SELECT
  earning_type,
  estimated_amount_cents / 100.0 as amount,
  current_qualification_status,
  disqualification_reasons
FROM estimated_earnings
WHERE run_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
```
earning_type       | amount | status       | reasons
-------------------+--------+--------------+-------------------------
seller_commission  | 23.40  | disqualified | ["Below 50 PV minimum (current: 40 PV)"]
override_l1        | 9.75   | disqualified | ["Below 50 PV minimum (current: 40 PV)"]
override_l2        | 7.80   | disqualified | ["Below 50 PV minimum (current: 40 PV)"]
```

✅ **PASS:** All estimates disqualified when PV drops below 50!

---

## Step 8: Cleanup Test Data

```sql
-- Restore member PV
UPDATE members
SET personal_credits_monthly = 100
WHERE member_id = (
  SELECT member_id FROM estimated_earnings
  ORDER BY created_at DESC LIMIT 1
);

-- Optional: Delete test estimates
DELETE FROM estimated_earnings
WHERE created_at > CURRENT_DATE;

-- Optional: Delete test transactions
DELETE FROM transactions
WHERE created_at > CURRENT_DATE
AND description LIKE 'Test%';
```

---

## ✅ Success Criteria

**All tests should PASS:**

1. ✅ Estimates created immediately after purchase
2. ✅ Seller commission + overrides calculated correctly
3. ✅ Daily cron job runs successfully
4. ✅ Qualification status updates correctly
5. ✅ **70% retail rule enforced:**
   - Seller commission: Always qualified ✅
   - Overrides: Only qualified if retail % ≥ 70% ✅
6. ✅ **50 PV rule enforced:**
   - All earnings disqualified if PV < 50 ✅
7. ✅ Disqualification reasons are clear and helpful

---

## 🚀 Ready for Production

If all tests pass:

```bash
# Commit and deploy
git add .
git commit -m "feat: real-time earnings estimates system complete and tested"
git push
```

Vercel will automatically:
- Deploy the code
- Register the 2am daily cron job
- Start processing real-time estimates

---

## 📊 Monitoring in Production

### Check Cron Job Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Logs** tab
3. Filter for: `/api/cron/update-estimates`
4. Should see runs every day at 2:00 AM UTC

### Check Estimates

```sql
-- Daily monitoring query
SELECT
  TO_CHAR(estimated_at::date, 'YYYY-MM-DD') as date,
  COUNT(*) as total_estimates,
  SUM(CASE WHEN current_qualification_status = 'qualified' THEN 1 ELSE 0 END) as qualified,
  SUM(CASE WHEN current_qualification_status = 'at_risk' THEN 1 ELSE 0 END) as at_risk,
  SUM(CASE WHEN current_qualification_status = 'disqualified' THEN 1 ELSE 0 END) as disqualified,
  SUM(estimated_amount_cents) / 100.0 as total_amount_dollars
FROM estimated_earnings
WHERE estimated_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY TO_CHAR(estimated_at::date, 'YYYY-MM-DD')
ORDER BY date DESC;
```

---

**Happy Testing! 🎉**
