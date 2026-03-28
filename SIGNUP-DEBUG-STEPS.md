# Signup Debugging Steps for harveydk@sbcglobal.net

**Issue:** Getting "Account creation failed" but no error logs in Vercel

---

## Why No Logs Appear

The signup API has multiple `console.error()` calls, but Vercel might not be capturing them because:

1. **Function timeout** - If the function times out, logs might not flush
2. **Log level filtering** - Vercel might be filtering out console.error
3. **Database RPC errors** - PostgreSQL function errors don't always surface to Node
4. **Network error** - Request might not be reaching the API at all

---

## Immediate Diagnostic Steps

### Step 1: Check if Request Reaches API

In Vercel logs, filter for:
- **Path:** `/api/signup`
- **Method:** POST
- **Status:** ANY

If you see NO requests at all:
- ✅ Request isn't reaching the server (client-side issue)
- Check browser console for CORS or network errors

If you see requests with status 500/400/409:
- ✅ Request is reaching server
- The response body should contain the error message

---

### Step 2: Check Supabase Logs

Go to **Supabase Dashboard** > **Logs** > **Postgres Logs**

Look for:
```
ERROR: function create_distributor_atomic does not exist
```
or
```
ERROR: permission denied for function create_distributor_atomic
```

This would indicate the database function is missing or has permissions issues.

---

### Step 3: Manual Database Check

Run these queries in **Supabase SQL Editor**:

```sql
-- 1. Check if the RPC function exists
SELECT
  proname as function_name,
  prokind as kind,
  proowner::regrole as owner
FROM pg_proc
WHERE proname = 'create_distributor_atomic';

-- 2. Check if auth user was created
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'harveydk@sbcglobal.net';

-- 3. Check if distributor was created
SELECT id, email, first_name, last_name, created_at, auth_user_id
FROM distributors
WHERE email = 'harveydk@sbcglobal.net';

-- 4. Check if there's an orphaned auth user
SELECT u.id, u.email, u.created_at
FROM auth.users u
WHERE u.email = 'harveydk@sbcglobal.net'
AND NOT EXISTS (
  SELECT 1 FROM distributors d WHERE d.auth_user_id = u.id
);
```

---

## Possible Scenarios & Solutions

### Scenario A: Function Doesn't Exist
**Symptoms:**
- No logs in Vercel
- "Account creation failed" error
- Supabase logs show function not found

**Diagnosis Query:**
```sql
SELECT proname FROM pg_proc WHERE proname = 'create_distributor_atomic';
```

**Fix:**
The `create_distributor_atomic` PostgreSQL function needs to be created. Check if you have a migration file for it.

**Location to check:**
```
supabase/migrations/XXXXXXXX_create_distributor_atomic.sql
```

If missing, you'll need to create/deploy the function.

---

### Scenario B: Orphaned Auth User
**Symptoms:**
- Auth user exists in `auth.users`
- NO distributor in `distributors` table
- "Account creation failed" on retry

**Diagnosis Query:**
```sql
-- Check for orphaned auth user
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN distributors d ON d.auth_user_id = u.id
WHERE u.email = 'harveydk@sbcglobal.net'
AND d.id IS NULL;
```

**Fix:**
Delete the orphaned auth user from Supabase Dashboard:
1. Go to **Authentication** > **Users**
2. Find harveydk@sbcglobal.net
3. Click **Delete User**
4. Have rep retry signup

---

### Scenario C: Network/CORS Error
**Symptoms:**
- No requests showing in Vercel logs at all
- Error in browser console
- "Account creation failed" appears immediately

**Check:**
Open browser DevTools (F12) > Network tab during signup
Look for:
- Red requests to `/api/signup`
- CORS errors
- Failed to fetch errors

**Fix:**
If CORS issue, check `next.config.js` headers
If network error, check production URL is correct

---

### Scenario D: Missing Environment Variables
**Symptoms:**
- Error happens during database/auth operations
- Might see "undefined" in error messages

**Check:**
Verify in Vercel Dashboard > Settings > Environment Variables:
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_KEY` (for SSN/EIN)

---

## Quick Fix: Have Rep Retry NOW

Since the code has auto-cleanup (lines 194-224 in route.ts), just have the rep:

1. **Wait 2 minutes**
2. **Try signing up again** with same info
3. If orphaned auth user exists, code will auto-delete it
4. Should work on second attempt

---

## If Retry Doesn't Work

### Enable Debug Logging

Add this to the top of `src/app/api/signup/route.ts`:

```typescript
// At the very top of the POST function
console.log('[SIGNUP DEBUG] Starting signup for:', body.email);
console.log('[SIGNUP DEBUG] Sponsor slug:', body.sponsor_slug);
console.log('[SIGNUP DEBUG] Registration type:', body.registration_type);
```

And before each major step:
```typescript
console.log('[SIGNUP DEBUG] Step 1: Validating...');
console.log('[SIGNUP DEBUG] Step 2: Checking email...');
console.log('[SIGNUP DEBUG] Step 3: Checking slug...');
console.log('[SIGNUP DEBUG] Step 4: Looking up sponsor...');
console.log('[SIGNUP DEBUG] Step 5: Creating auth user...');
console.log('[SIGNUP DEBUG] Step 6: Creating distributor...');
```

Then have rep retry and check Vercel logs for where it stops.

---

## Contact Rep Script

> Hi! We're investigating the signup issue. While we work on this, could you please:
>
> 1. Try signing up again **right now** with the same information
> 2. If you get the same error, take a screenshot of the error message
> 3. Also open your browser's developer tools (press F12), go to the "Console" tab, and take a screenshot of any red error messages
> 4. Send both screenshots to us
>
> This will help us identify the exact issue. Thank you for your patience!

---

## Next Steps

1. ✅ Check Vercel logs for POST /api/signup requests
2. ✅ Check Supabase logs for database errors
3. ✅ Run the diagnostic SQL queries
4. ✅ Have rep retry signup
5. ✅ If still fails, ask for browser console screenshots

**Based on what you find, let me know and I'll provide the specific fix!**
