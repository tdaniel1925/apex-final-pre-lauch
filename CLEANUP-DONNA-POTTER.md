# Cleanup Orphaned Account - Donna Potter

**Email:** donnambpotter@gmail.com
**Date:** March 16, 2026
**Issue:** Orphaned auth user from failed signup

---

## Option 1: Use Admin Cleanup API (Recommended)

```bash
# This API endpoint will find and delete orphaned auth users
curl -X POST https://reachtheapex.net/api/admin/cleanup-orphaned-users
```

## Option 2: Manual Supabase Dashboard Cleanup

1. Go to Supabase Dashboard → Authentication → Users
2. Search for: donnambpotter@gmail.com
3. Click on the user
4. Click "Delete User"
5. Confirm deletion

## Option 3: SQL Query (Fastest)

Run this in Supabase SQL Editor:

```sql
-- Find the auth user
SELECT id, email FROM auth.users WHERE email = 'donnambpotter@gmail.com';

-- Check if distributor exists
SELECT id, email FROM public.distributors WHERE email = 'donnambpotter@gmail.com';

-- If no distributor exists, delete the auth user
-- (Replace USER_ID with the actual ID from first query)
DELETE FROM auth.users WHERE id = 'USER_ID';
```

---

## After Cleanup

Tell Donna Potter she can try signing up again with the same information:
- Email: donnambpotter@gmail.com
- Username: topascension
- Password: Password1@
- SSN: 510-80-3843

The new rollback logic will prevent this from happening again.

---

## What Was Fixed

The signup process now has comprehensive rollback:

1. **Track all created resources** (authUserId, distributorId)
2. **Rollback on any error** (delete auth user, delete distributor, delete tax info)
3. **Detailed logging** for all rollback operations
4. **Prevent double-rollback** by nulling IDs after successful rollback

This ensures ZERO orphaned accounts going forward.
