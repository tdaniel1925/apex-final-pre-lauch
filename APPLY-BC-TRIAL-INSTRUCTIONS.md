# Apply Business Center Trial Migration

## Step 1: Run Migration in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New query"
5. Copy and paste the contents of `supabase/migrations/20260403000001_auto_grant_business_center_trial.sql`
6. Click "Run" (or press Cmd/Ctrl + Enter)

## Step 2: Verify Migration Worked

Run this query in SQL Editor:

```sql
-- Check if trigger was created
SELECT * FROM pg_trigger WHERE tgname = 'auto_grant_bc_trial';

-- Check how many distributors got trial access
SELECT
  COUNT(*) as trial_count
FROM service_access sa
JOIN products p ON p.id = sa.product_id
WHERE p.slug = 'businesscenter'
AND sa.is_trial = true;

-- View sample trial records
SELECT
  d.first_name,
  d.last_name,
  d.email,
  sa.status,
  sa.granted_at,
  sa.trial_ends_at,
  EXTRACT(DAY FROM (sa.trial_ends_at - NOW())) as days_remaining
FROM service_access sa
JOIN products p ON p.id = sa.product_id
JOIN distributors d ON d.id = sa.distributor_id
WHERE p.slug = 'businesscenter'
AND sa.is_trial = true
ORDER BY sa.granted_at DESC
LIMIT 10;
```

## Step 3: Test New Signup

1. Create a new distributor account (use test email)
2. Check if they got `service_access` record automatically:

```sql
SELECT
  d.email,
  sa.status,
  sa.is_trial,
  sa.granted_at,
  sa.trial_ends_at
FROM distributors d
LEFT JOIN service_access sa ON sa.distributor_id = d.id
WHERE d.email = 'YOUR_TEST_EMAIL@example.com';
```

Expected result: Should have `is_trial = true` and `trial_ends_at = granted_at + 14 days`

## Step 4: Test Trial Expiration Blocking

To test that blocking works when trial expires, manually expire a test user's trial:

```sql
-- Find a test distributor
SELECT id, first_name, last_name, email
FROM distributors
WHERE email LIKE '%test%'
LIMIT 1;

-- Expire their trial (set trial_ends_at to yesterday)
UPDATE service_access sa
SET trial_ends_at = NOW() - INTERVAL '1 day',
    expires_at = NOW() - INTERVAL '1 day'
FROM products p
WHERE sa.product_id = p.id
AND p.slug = 'businesscenter'
AND sa.distributor_id = 'PASTE_DISTRIBUTOR_ID_HERE';
```

Then log in as that user and try to access:
- `/dashboard/crm` - Should see blocking modal
- `/dashboard/ai-calls` - Should see blocking modal
- `/dashboard` - Should work fine (not blocked)

## Expected Behavior After Migration

### For New Users:
1. Sign up → Automatically get 14-day trial
2. Days 1-11: Full access, no banner
3. Days 12-14: Full access, soft reminder banner
4. Day 15+: Access BLOCKED with upgrade modal

### For Existing Users:
1. Retroactively granted 14-day trial (from their signup date)
2. If signed up >14 days ago → Trial already expired → Blocked immediately
3. If signed up <14 days ago → Trial still active → Full access

### Paid Users:
1. Purchased Business Center → `is_trial = false`
2. Never see blocking or banners
3. Unlimited access forever (until they cancel)

## Rollback (If Needed)

If something goes wrong, you can remove the trigger:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS auto_grant_bc_trial ON distributors;

-- Remove function
DROP FUNCTION IF EXISTS grant_business_center_trial();

-- Optionally: Remove all trial access records
DELETE FROM service_access sa
USING products p
WHERE sa.product_id = p.id
AND p.slug = 'businesscenter'
AND sa.is_trial = true;
```

## Notes

- Migration is safe to run multiple times (uses `ON CONFLICT DO NOTHING`)
- Existing paid subscriptions are NOT affected
- Trial access can be manually revoked by setting `status = 'expired'`
- Trial can be manually extended by updating `trial_ends_at`
