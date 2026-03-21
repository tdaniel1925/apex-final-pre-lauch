# SmartOffice Production Setup Guide

**Issue:** SmartOffice tables do not exist in production database
**Status:** ⚠️ Migration not applied to production
**Solution:** Apply migration manually via Supabase Dashboard

---

## 🔍 Problem Diagnosis

### What We Found
```
❌ smartoffice_sync_config - Table does not exist
❌ smartoffice_agents - Table does not exist
❌ smartoffice_policies - Table does not exist
❌ smartoffice_commissions - Table does not exist
❌ smartoffice_sync_logs - Table does not exist
```

### Why This Happened
The SmartOffice migration `20260321000001_smartoffice_integration.sql` was created and tested locally but was **never pushed to production**.

When you visit `/admin/smartoffice-v2`, the server tries to query these tables, finds they don't exist, and shows "Not Configured".

---

## ✅ Solution: Apply Migration to Production

### Step 1: Open Supabase SQL Editor

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `apex-final-pre-lauch` (brejvdvzwshroxkkhmzy)
3. Navigate to: **SQL Editor** (left sidebar)
4. Click: **New Query**

### Step 2: Copy Migration SQL

The migration file is located at:
```
supabase/migrations/20260321000001_smartoffice_integration.sql
```

**Option A:** Copy from file in VS Code
- Open: `supabase/migrations/20260321000001_smartoffice_integration.sql`
- Select all (Ctrl+A)
- Copy (Ctrl+C)

**Option B:** Copy from command output
```bash
cat "supabase/migrations/20260321000001_smartoffice_integration.sql"
```

### Step 3: Paste and Run

1. Paste the SQL into Supabase SQL Editor
2. Click **Run** button (or press Ctrl+Enter)
3. Wait for execution to complete

### Step 4: Verify Tables Created

After running the migration, verify in Supabase Dashboard:

1. Go to **Table Editor** (left sidebar)
2. Check that these tables now exist:
   - ✅ smartoffice_sync_config
   - ✅ smartoffice_agents
   - ✅ smartoffice_policies
   - ✅ smartoffice_commissions
   - ✅ smartoffice_sync_logs

3. Check `smartoffice_sync_config` table:
   - Should have 1 row with credentials
   - `is_active` should be `true`

### Step 5: Verify in Admin Portal

1. Visit: https://reachtheapex.net/admin/smartoffice-v2
2. Should now show:
   - ✅ Connected badge (green)
   - Stats cards showing zeros
   - **"Run Full Sync"** button enabled
   - Configuration tab showing credentials

### Step 6: Run First Sync

1. Click the large **"Run Full Sync"** button
2. Wait for sync to complete (may take 30-60 seconds)
3. Stats should update with agents and policies from SmartOffice

---

## 📋 Quick Verification Script

After applying migration, run this to verify:

```bash
npx tsx scripts/check-smartoffice-production.ts
```

Expected output:
```
✅ smartoffice_sync_config - 1 record (config with credentials)
✅ smartoffice_agents - 0 records (will populate after sync)
✅ smartoffice_policies - 0 records (will populate after sync)
✅ smartoffice_commissions - 0 records (will populate after sync)
✅ smartoffice_sync_logs - 0 records (will populate after first sync)
```

---

## 🔐 What the Migration Does

### Creates 5 Tables

1. **smartoffice_sync_config**
   - Stores SmartOffice API credentials
   - Pre-populated with working sandbox credentials
   - Singleton pattern (only 1 row allowed)

2. **smartoffice_agents**
   - Stores agents synced from SmartOffice
   - Links to Apex distributors via `apex_agent_id`
   - Full raw API response in `raw_data` JSONB field

3. **smartoffice_policies**
   - Stores insurance policies from SmartOffice
   - Links to agents via `smartoffice_agent_id`
   - Includes policy number, carrier, premium, status

4. **smartoffice_commissions**
   - Stores commission records from SmartOffice
   - Links to policies and agents
   - Tracks amounts, dates, payee info

5. **smartoffice_sync_logs**
   - Tracks sync operations
   - Records success/failure, timing, counts
   - Used for audit trail and troubleshooting

### Pre-populated Data

The migration automatically inserts SmartOffice credentials:
- API URL: `https://api.sandbox.smartofficecrm.com/3markapex/v1/send`
- Sitename: `PREPRODNEW`
- Username: `PREPRODNEW_SDC_UAT_tdaniel`
- API Key: `fa0fc95d45e2405ca006a1bfe5d09b1f`
- API Secret: `n2vcZOBHpfoFYDxm4xHKlTaQOvLpoe77`
- Status: Active

---

## 🚨 Important Notes

### Credentials Security
⚠️ The migration includes API credentials hardcoded for sandbox environment
- These are **sandbox/test credentials**
- Safe for development and testing
- When moving to production SmartOffice, update credentials in Configuration tab

### RLS Policies
✅ All tables have Row Level Security (RLS) enabled
✅ Service role bypasses RLS for admin operations
✅ Regular users cannot access SmartOffice data directly

### Indexes
✅ All foreign keys have indexes for performance
✅ Email and date fields indexed for fast lookups
✅ JSONB fields use GIN indexes for efficient queries

---

## 🔄 Alternative: CLI Method

If you prefer command line:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref brejvdvzwshroxkkhmzy

# Push all pending migrations
supabase db push
```

This will apply ALL migrations, including SmartOffice.

---

## ❓ Troubleshooting

### "Table already exists" error
- Safe to ignore - migration uses `CREATE TABLE IF NOT EXISTS`
- Tables won't be recreated if they already exist

### "Duplicate key violation" on config insert
- Safe to ignore - migration uses `ON CONFLICT DO NOTHING`
- Config row won't be inserted if one already exists

### "Permission denied" error
- Make sure you're logged into Supabase Dashboard
- Make sure you have owner/admin access to the project

### Still showing "Not Configured" after migration
1. Hard refresh page (Ctrl+Shift+R)
2. Check browser console for errors
3. Verify `is_active = true` in config table
4. Check that config row exists: `SELECT * FROM smartoffice_sync_config;`

---

## ✅ Success Checklist

After completing this guide:

- [ ] Migration SQL run in Supabase Dashboard
- [ ] 5 tables created successfully
- [ ] Config row exists with credentials
- [ ] Admin page shows "Connected" badge
- [ ] "Run Full Sync" button is enabled
- [ ] First sync completed successfully
- [ ] Agents and policies showing in stats
- [ ] No errors in browser console

---

## 📊 Expected Timeline

- **Apply Migration:** 5-10 seconds
- **Verify Tables:** 1 minute
- **First Sync:** 30-60 seconds
- **Total Time:** ~2-3 minutes

---

## 🎯 Next Steps After Setup

Once SmartOffice is connected:

1. **Run regular syncs** to keep data fresh (automatic every 6 hours)
2. **Map agents** to Apex distributors in the Agents tab
3. **Review policies** and commission data
4. **Set up agent mapping** for auto-association by email

---

**Need Help?**
- Check migration file: `supabase/migrations/20260321000001_smartoffice_integration.sql`
- Review SMARTOFFICE-READY.md for feature documentation
- Run verification: `npx tsx scripts/check-smartoffice-production.ts`

---

**Last Updated:** March 21, 2026
**Migration File:** 20260321000001_smartoffice_integration.sql
**Lines of SQL:** 303
