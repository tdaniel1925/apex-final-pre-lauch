# 🧪 Testing Status & Investigation Report

**Date:** 2026-04-01
**Status:** Partial - Schema Issue Found

---

## ✅ What's Working

### 1. **Database Migration** ✅
- `estimated_earnings` table created successfully
- All indexes and constraints in place
- Table structure verified

### 2. **Code Implementation** ✅
- Real-time estimate creation service complete
- Daily qualification update service complete
- Cron endpoint ready
- Webhook integration complete
- Navigation updates complete (Products + Events links)

---

## ⚠️ Issue Found During Testing

### Schema Mismatch: `transactions` Table

**Error:**
```
Could not find the 'bv_amount' column of 'transactions' in the schema cache
```

**What This Means:**
The `transactions` table doesn't have a `bv_amount` column in the database, but our code is trying to use it.

**Possible Causes:**
1. BV tracking might use a different column name
2. BV might be stored in a related table
3. Migration might be needed to add this column

---

## 🔍 Investigation Needed

### 1. **Apex-Vision Credits Mystery** 🔍

**Issue:** Rep has 499 org credits with no sales/PV/BV

**Investigation Query Created:** `investigate-apex-vision.sql`

**Run this in Supabase SQL Editor to find:**
1. Apex-vision distributor details
2. Member record with current PV/GV
3. All transactions for this member
4. All orders
5. Any manual credit adjustments in admin activity log

**Possible Explanations:**
- Manual credit adjustment by admin
- System initialization credits
- Test data
- Import from another system
- Bug in credit calculation

**Next Steps:**
1. Run `investigate-apex-vision.sql` in Supabase
2. Review results to see source of 499 credits
3. Determine if it's intentional or a bug

---

### 2. **Transactions Table Schema** 🔍

**Need to verify:**
- What columns exist in `transactions` table?
- How is BV currently stored?
- Do we need to add `bv_amount` column?

**Query to Check Schema:**
```sql
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;
```

**If `bv_amount` doesn't exist, we have 2 options:**

**Option A: Add the column**
```sql
ALTER TABLE transactions
ADD COLUMN bv_amount INTEGER;
```

**Option B: Calculate BV on the fly**
- Look up product
- Calculate BV from price
- Store in estimate creation

---

## 📋 Next Steps

### Immediate Actions:

1. **Run investigation query:**
   ```bash
   # In Supabase SQL Editor:
   investigate-apex-vision.sql
   ```

2. **Check transactions table schema:**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'transactions'
   ORDER BY ordinal_position;
   ```

3. **Based on results:**
   - If `bv_amount` missing → Add column or modify code
   - If apex-vision credits are test data → Document or remove
   - If credits are a bug → Fix the source

---

## 🚀 When Schema Issue is Fixed

Once the transactions table has the correct structure:

```bash
# Run the complete test:
npx tsx test-earnings-complete.js
```

**Expected Results:**
- ✅ Creates estimated earnings
- ✅ Seller commission calculated
- ✅ Overrides created based on rank
- ✅ Daily qualification updates work
- ✅ 70% retail rule enforced
- ✅ All tests pass

Then deploy:
```bash
git add .
git commit -m "feat: real-time earnings estimates + fixes"
git push
```

---

## 📊 Alternative: Manual Test via UI

If test script has issues, you can test manually:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Login and make a purchase:**
   - Go to: `http://localhost:3050/login`
   - Navigate to Store
   - Buy any product

3. **Check database:**
   ```sql
   SELECT * FROM estimated_earnings
   ORDER BY created_at DESC LIMIT 5;
   ```

4. **Trigger cron:**
   ```bash
   curl http://localhost:3050/api/cron/update-estimates
   ```

5. **Verify status updated:**
   ```sql
   SELECT earning_type, current_qualification_status
   FROM estimated_earnings
   ORDER BY created_at DESC LIMIT 5;
   ```

---

## 📝 Files Created for Investigation

1. **`investigate-apex-vision.sql`** - Queries to find source of 499 credits
2. **`test-earnings-complete.js`** - Complete E2E test (needs schema fix)
3. **`TEST-EARNINGS-FLOW.md`** - Manual testing guide
4. **`verify-earnings-setup.sql`** - Database verification

---

## ✅ Summary

**Working:**
- ✅ Database migration complete
- ✅ Real-time estimates code complete
- ✅ Daily qualification code complete
- ✅ Navigation updates complete

**Needs Attention:**
- ⚠️ Transactions table schema (bv_amount column)
- 🔍 Apex-vision 499 credits mystery

**Next Action:**
Run `investigate-apex-vision.sql` to understand the credits issue, then check transactions schema.
