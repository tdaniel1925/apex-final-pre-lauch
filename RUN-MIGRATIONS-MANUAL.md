# 📋 Manual Migration Guide

## How to Run Migrations in Supabase

Since the `exec_sql` RPC function is not available, you need to run these migrations manually in the Supabase SQL Editor.

### Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Run Each Migration in Order**

Copy and paste the **entire contents** of each file below into the SQL Editor and click "Run".

---

## Migration Order (IMPORTANT: Run in this exact order!)

### ✅ Migration 1: Autopilot Schema
**File:** `supabase/migrations/20260318000004_apex_lead_autopilot_schema.sql`

Open this file, copy ALL contents, paste into SQL Editor, and click Run.

**What it does:**
- Creates autopilot_subscriptions table
- Creates meeting_invitations table
- Creates event_flyers table
- Creates CRM tables (contacts, pipeline, tasks)
- Creates SMS tables (campaigns, messages)
- Creates team broadcast and training tables
- Creates usage limits table
- Sets up RLS policies
- Creates trigger functions

---

### ✅ Migration 2: Autopilot Additions
**File:** `supabase/migrations/20260318000005_apex_lead_autopilot_additions.sql`

Open this file, copy ALL contents, paste into SQL Editor, and click Run.

**What it does:**
- Adds additional indexes
- Adds missing RLS policies
- Creates helper functions
- Adds constraints

---

### ✅ Migration 3: Fix Autopilot Trigger
**File:** `supabase/migrations/20260318000006_fix_autopilot_trigger.sql`

Open this file, copy ALL contents, paste into SQL Editor, and click Run.

**What it does:**
- Fixes the trigger that creates usage limits
- Ensures proper initialization

---

### ✅ Migration 4: Complete Anonymous Block
**File:** `supabase/migrations/20260319000002_complete_anonymous_block.sql`

Open this file, copy ALL contents, paste into SQL Editor, and click Run.

**What it does:**
- Blocks anonymous access to all autopilot tables
- Blocks anonymous access to members table
- Blocks anonymous access to distributors table
- Ensures only authenticated users can access data

---

### ✅ Migration 5: Remove Public Distributor Access
**File:** `supabase/migrations/20260319000003_remove_public_distributor_access.sql`

Open this file, copy ALL contents, paste into SQL Editor, and click Run.

**What it does:**
- Removes permissive public policies from distributors table
- Ensures anonymous users cannot read distributor data

---

## Verification

After running all 5 migrations, verify they worked:

### 1. Check Tables Exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%autopilot%'
  OR table_name IN ('meeting_invitations', 'event_flyers', 'sms_campaigns', 'sms_messages');
```

Expected: Should show all autopilot-related tables

### 2. Check RLS Policies
```sql
SELECT tablename, policyname, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname LIKE '%block_anon%';
```

Expected: Should show 8 blocking policies

### 3. Verify Security
Run from your terminal:
```bash
node scripts/verify-complete-rls.js
```

Expected output: All 8 tables showing "✅ YES" in Blocked column

---

## Troubleshooting

### Error: "relation already exists"
- This is OK - it means the table was already created
- Continue with next migration

### Error: "policy already exists"
- This is OK - the policy was already created
- Continue with next migration

### Error: "permission denied"
- Make sure you're running in Supabase SQL Editor
- Make sure you're logged in as the project owner

---

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

This will automatically run all pending migrations in the `supabase/migrations/` folder.

---

**After all migrations are complete, verify with:**
```bash
node scripts/verify-complete-rls.js
npm test -- tests/unit/autopilot-schema.test.ts --run
```

Both should show all tests/checks passing.
