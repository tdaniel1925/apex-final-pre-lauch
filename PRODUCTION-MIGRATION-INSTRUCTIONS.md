# Production Database Migration Instructions

**Date:** March 16, 2026
**Issue:** Signup failing with "Could not find the table 'public.distributor_tax_info'"

---

## Problem

The production database is missing the new tables created in the dual ladder migration. The signup is failing because the code tries to insert SSN data into `distributor_tax_info` table which doesn't exist.

**Error from production logs:**
```
Tax info creation error: {
  code: 'PGRST205',
  message: "Could not find the table 'public.distributor_tax_info' in the schema cache"
}
```

---

## Solution

Run the pending database migrations in production Supabase.

### Method 1: Using Supabase CLI (Recommended)

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link to production project
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. Push migrations to production
npx supabase db push

# This will apply all migrations in supabase/migrations/ that haven't been run yet
```

### Method 2: Using Supabase Dashboard (Manual)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Run each migration file in order:

#### Step 1: Create Tax Info Table
**File:** `supabase/migrations/20260316200000_create_tax_info_table.sql`

Copy the entire contents of this file and run it in the SQL Editor.

This creates:
- `distributor_tax_info` table (for encrypted SSN storage)
- `ssn_access_log` table (for audit logging)
- RLS policies for security
- Indexes for performance

#### Step 2: Verify Table Exists

Run this query to verify:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'distributor_tax_info';
```

Should return 1 row.

---

## After Migration

### 1. Test Signup
- Go to https://reachtheapex.net/signup
- Fill out the signup form with valid data
- Submit
- Should succeed this time!

### 2. Verify in Database
Check that the tables exist and have proper structure:

```sql
-- Check distributor_tax_info table
SELECT * FROM public.distributor_tax_info LIMIT 1;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'distributor_tax_info';
```

### 3. Monitor Logs
Watch Vercel logs for any new errors:
https://vercel.com/your-team/your-project/logs

---

## Environment Variables

Also verify this environment variable is set in Vercel:

```
SSN_ENCRYPTION_KEY=ApexAffinity2026SecureSSNKey!!
```

**Location:** Vercel Dashboard → Project → Settings → Environment Variables

**Important:** This key encrypts SSN data using AES-256-GCM. Without it, signup will also fail.

---

## Rollback (If Needed)

If something goes wrong, you can rollback the migration:

```sql
-- Drop tax info table
DROP TABLE IF EXISTS public.distributor_tax_info CASCADE;
DROP TABLE IF EXISTS public.ssn_access_log CASCADE;
```

**Note:** This will delete any SSN data that was stored. Only use in emergency.

---

## Files Modified in This Migration

1. `supabase/migrations/20260316200000_create_tax_info_table.sql` - Creates tax info tables
2. `src/app/api/signup/route.ts` - Uses new tax info table (line 289-296)
3. `src/lib/utils/ssn.ts` - AES-256-GCM encryption for SSN

---

## Verification Checklist

- [ ] Migration applied successfully (no SQL errors)
- [ ] `distributor_tax_info` table exists
- [ ] `ssn_access_log` table exists
- [ ] RLS is enabled on both tables
- [ ] Environment variable `SSN_ENCRYPTION_KEY` is set in Vercel
- [ ] Test signup succeeds
- [ ] SSN is encrypted in database
- [ ] Production logs show no errors

---

## Support

If you encounter any issues:

1. **Check Supabase Dashboard Logs**: Database → Logs → Postgres Logs
2. **Check Vercel Logs**: Deployment → Logs → Runtime Logs
3. **Verify RLS Policies**: Ensure service role key bypasses RLS for signup

---

**Status:** Pending migration
**Priority:** Critical - Blocking all signups
**Estimated Time:** 5 minutes
