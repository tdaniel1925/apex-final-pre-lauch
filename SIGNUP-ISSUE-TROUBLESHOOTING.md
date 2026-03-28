# Signup Issue Troubleshooting - harveydk@sbcglobal.net

**Issue:** Rep received "Account creation failed" message during signup
**Email:** harveydk@sbcglobal.net
**Date:** March 20, 2026

---

## Immediate Action Required

### Step 1: Check Database State

Run the queries in `check-signup-issue.sql` in your Supabase SQL Editor to determine:

1. ✅ **If auth user was created** → May be orphaned
2. ✅ **If distributor record was created** → May be incomplete
3. ✅ **If member record was created** → May be missing
4. ✅ **If tax info was saved** → May have failed validation

---

## Common Failure Scenarios

Based on the signup code (`src/app/api/signup/route.ts`), here are the most likely causes:

### Scenario 1: Database RPC Function Failed (Line 257-303)
**Error:** `create_distributor_atomic` PostgreSQL function failed
**Likely Causes:**
- Database function doesn't exist
- Matrix placement algorithm hit an edge case
- Database permissions issue
- Database transaction timeout

**How to Check:**
```sql
-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'create_distributor_atomic';

-- Check recent database logs
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

**Fix:**
- Check Supabase logs for the exact error
- Verify the RPC function is deployed
- Check database connection pool

---

### Scenario 2: Member Record Creation Failed (Line 323-368)
**Error:** Failed to insert into `members` table
**Likely Causes:**
- Missing sponsor_id reference
- Invalid enroller_id (sponsor's member_id not found)
- Database constraint violation
- Duplicate member entry

**How to Check:**
```sql
-- Check if auth user exists but no distributor
SELECT u.id, u.email
FROM auth.users u
WHERE u.email = 'harveydk@sbcglobal.net'
AND NOT EXISTS (
  SELECT 1 FROM distributors d WHERE d.auth_user_id = u.id
);
```

**Fix:**
- If auth user exists without distributor → Orphaned account (rollback should have cleaned up)
- Run manual cleanup (see below)

---

### Scenario 3: Tax Info Validation Failed (Line 371-489)
**Error:** SSN or EIN validation/storage failed
**Likely Causes:**
- Invalid SSN format (not 9 digits)
- Invalid EIN format (not 9 digits)
- Encryption key missing
- Database insert failed

**How to Check:**
```sql
-- Check if distributor was created but tax info is missing
SELECT d.id, d.email, ti.id as tax_info_id
FROM distributors d
LEFT JOIN distributor_tax_info ti ON d.id = ti.distributor_id
WHERE d.email = 'harveydk@sbcglobal.net';
```

**Fix:**
- Verify SSN/EIN was entered correctly (9 digits, no dashes)
- Check encryption configuration

---

### Scenario 4: Sponsor Reference Invalid (Line 146-177)
**Error:** sponsor_slug doesn't exist
**Likely Causes:**
- Rep used an invalid referral link
- Sponsor's account was deleted
- Typo in sponsor_slug

**How to Check:**
```sql
-- Check if sponsor exists (if referral link was used)
-- Replace 'SPONSOR_SLUG' with the actual slug from referral link
SELECT id, slug, first_name, last_name, email
FROM distributors
WHERE slug = 'SPONSOR_SLUG';
```

**Fix:**
- Ask rep for the referral link they used
- Verify sponsor account exists
- Try signup without referral link (will assign to master distributor)

---

### Scenario 5: Replicated Site Creation Failed (Line 499-507)
**Error:** External site creation failed (non-blocking)
**Note:** This shouldn't cause signup to fail (error is caught and logged)

---

## Manual Cleanup & Retry

### If Auth User is Orphaned (exists without distributor):

```sql
-- 1. Find the auth user ID
SELECT id, email, created_at
FROM auth.users
WHERE email = 'harveydk@sbcglobal.net';

-- 2. Delete the orphaned auth user (use Supabase dashboard or service client)
-- NOTE: You need admin/service credentials for this
-- Go to: Supabase Dashboard > Authentication > Users > Find user > Delete
```

**Or use the API cleanup:**

The signup code has built-in cleanup (lines 194-224):
- If auth user exists but no distributor, it automatically detects and cleans up
- Rep just needs to **try signing up again** and it should auto-cleanup

---

### If Partial Data Exists:

```sql
-- Clean up incomplete signup
-- CAUTION: Only run if you've verified the data is incomplete

-- 1. Get distributor ID
SELECT id FROM distributors WHERE email = 'harveydk@sbcglobal.net';

-- 2. Delete in reverse order (to respect foreign keys)
DELETE FROM distributor_tax_info WHERE distributor_id = 'DISTRIBUTOR_ID_HERE';
DELETE FROM members WHERE distributor_id = 'DISTRIBUTOR_ID_HERE';
DELETE FROM distributors WHERE id = 'DISTRIBUTOR_ID_HERE';

-- 3. Then delete auth user from Supabase dashboard
```

---

## Recommended Resolution Steps

### Option 1: Auto-Retry (Easiest)
1. Have the rep try signing up again with the same email
2. The code will detect orphaned auth user and auto-cleanup
3. Should work on second attempt

### Option 2: Manual Investigation (If auto-retry fails)
1. Run the SQL queries in `check-signup-issue.sql`
2. Identify which step failed
3. Check Supabase logs for exact error message
4. Apply appropriate fix from scenarios above
5. Clean up orphaned data if needed
6. Have rep retry signup

### Option 3: Admin-Assisted Signup
1. If signup keeps failing, manually create account:
2. Use Supabase dashboard to create auth user
3. Manually insert distributor record
4. Manually insert member record
5. Send password reset email to rep

---

## Check Production Logs

To find the exact error, check your production logs:

1. **Vercel Logs** (if deployed on Vercel):
   - Go to Vercel Dashboard
   - Select your project
   - Go to "Logs" tab
   - Filter by time when signup occurred
   - Look for errors with `harveydk@sbcglobal.net`

2. **Supabase Logs**:
   - Go to Supabase Dashboard
   - Navigate to "Logs" section
   - Check "Postgres Logs" for database errors
   - Check "API Logs" for RPC function errors
   - Filter by timestamp

3. **Application Logs**:
   - Look for console.error messages
   - Search for `[ROLLBACK]` entries
   - Check for specific error patterns

---

## Prevention

To prevent this in the future:

1. **Add Better Error Logging:**
   - Log the specific failure point
   - Include error details in response (in development)
   - Send error notifications to admins

2. **Add Signup Health Check:**
   - Test signup flow regularly
   - Monitor success/failure rates
   - Alert on high failure rates

3. **Improve Error Messages:**
   - Show more specific errors to users (without exposing internals)
   - Provide contact support link
   - Log error ID that user can reference

---

## What to Tell the Rep

**Message Template:**

> Hi! We see you had an issue creating your account. This is a rare technical glitch that we're investigating.
>
> **Please try one of these:**
>
> 1. **Wait 5 minutes** and try signing up again with the same information
> 2. **Try a different username** (if you're not sure, we can provide one)
> 3. **Contact support** and we'll create your account manually
>
> We apologize for the inconvenience and appreciate your patience!

---

## Files to Check

1. `src/app/api/signup/route.ts` - Main signup logic (line 257-303 for distributor creation)
2. Database function: `create_distributor_atomic` (check if it exists)
3. Supabase RLS policies on `distributors`, `members`, `distributor_tax_info` tables

---

## Next Steps

1. ✅ Run `check-signup-issue.sql` in Supabase
2. ✅ Check Supabase/Vercel logs for exact error
3. ✅ Identify which scenario applies
4. ✅ Apply appropriate fix
5. ✅ Have rep retry signup
6. ✅ Monitor successful completion

---

**Need Help?**

If the issue persists after trying the above steps, you may need to:
- Check the `create_distributor_atomic` PostgreSQL function code
- Verify all database tables and constraints are properly set up
- Check environment variables (encryption keys, etc.)
- Review database RLS policies

Let me know what you find in the database queries and I can provide more specific guidance!
