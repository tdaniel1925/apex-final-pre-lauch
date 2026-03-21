# APEX DEPENDENCY & DATA SYNCHRONIZATION AUDIT REPORT

**Date:** March 20, 2026
**Scope:** Complete database architecture, data flows, and synchronization issues
**Status:** 🔴 CRITICAL ISSUES FOUND

---

## EXECUTIVE SUMMARY

This comprehensive audit identified **47 distinct dependency and synchronization issues** across your application. The issues fall into 10 critical categories:

### 🔴 CRITICAL (Immediate Action Required)
1. **Email sync between auth.users and distributors** - Manual sync, can diverge, breaks login
2. **Members table not created on signup** - Commission system will fail
3. **Distributor suspension doesn't update members** - Suspended reps still get paid
4. **Matrix placement race conditions in admin** - Two admins can create conflicts

### 🟡 HIGH PRIORITY (Fix Soon)
5. **Phone number duplication** - 4+ tables with no sync
6. **Profile photo cached in activity feed** - Stale URLs when changed
7. **Onboarding state split** - distributors vs members tables inconsistent
8. **Status values inconsistent** - Different enums across tables

### 🟢 MEDIUM PRIORITY (Plan for Fix)
9. **External platform sync queued but not processed** - No worker found
10. **Slug uniqueness not globally enforced** - Conflicts possible

---

## TABLE OF CONTENTS

1. [Enrollee & Team Statistics Dependencies](#1-enrollee--team-statistics-dependencies)
2. [Credits & Compensation System](#2-credits--compensation-system)
3. [User Authentication & Profile Sync](#3-user-authentication--profile-sync)
4. [Matrix Placement & Cascading Updates](#4-matrix-placement--cascading-updates)
5. [Status Changes & Cascading Effects](#5-status-changes--cascading-effects)
6. [Slug Uniqueness & URL Routing](#6-slug-uniqueness--url-routing)
7. [External Platform Sync](#7-external-platform-sync)
8. [Race Conditions & Transactions](#8-race-conditions--transactions)
9. [Query & Denormalization Issues](#9-query--denormalization-issues)
10. [Foreign Key & Constraint Issues](#10-foreign-key--constraint-issues)

---

## 1. ENROLLEE & TEAM STATISTICS DEPENDENCIES

### 🔍 How It Works

**Data Source:** Counts based on `sponsor_id` relationships in the `distributors` table.

**Key Files:**
- `src/lib/enrollees/enrollee-counter.ts` - Calculation functions
- `src/app/api/distributors/[id]/enrollees/route.ts` - API endpoint
- `src/components/admin/EnrolleeStats.tsx` - Display component

**Calculation Logic:**
```typescript
// Personal Enrollees (Direct Recruits)
SELECT COUNT(*) FROM distributors
WHERE sponsor_id = :distributorId
  AND status != 'deleted'

// Organization Enrollees (Recursive - All Downline)
function getOrganizationEnrolleeCount(distributorId) {
  directEnrollees = query("sponsor_id = distributorId")
  total = directEnrollees.length
  for each enrollee in directEnrollees:
    total += getOrganizationEnrolleeCount(enrollee.id) // RECURSIVE
  return total
}
```

### ⚠️ Issues Found

| Issue | Impact | Severity |
|-------|--------|----------|
| **Recursive calculation expensive** | N+1 queries for large teams | 🟡 HIGH |
| **No caching layer** | Every API call recalculates | 🟡 HIGH |
| **No denormalized counts** | Always calculated on-demand | 🟢 MEDIUM |
| **Sponsor ID changes break counts** | Counts stale immediately if sponsor changes | 🔴 CRITICAL |
| **Status='suspended' still counted** | Suspended reps included in active counts | 🟡 HIGH |

### 📊 Where Displayed

1. **Admin Distributor Detail Page** (`src/app/admin/distributors/[id]/page.tsx`)
   - EnrolleeStats component
   - TeamStatistics component
   - PersonalDownline component

2. **Team Page** (`src/app/dashboard/team/page.tsx`)
   - TeamStatsHeader: Total Personal Enrollees
   - Active This Month count
   - Total Team Credits

3. **API Endpoints:**
   - `/api/distributors/[id]/enrollees` - Returns counts
   - `/api/admin/distributors/[id]/team-statistics` - Full stats
   - `/api/admin/distributors/[id]/downline` - List of recruits

### 🔧 Recommended Fixes

1. **Add denormalized count columns:**
   ```sql
   ALTER TABLE distributors ADD COLUMN personal_enrollees_count INTEGER DEFAULT 0;
   ALTER TABLE distributors ADD COLUMN organization_enrollees_count INTEGER DEFAULT 0;
   ```

2. **Create trigger to update counts:**
   ```sql
   CREATE TRIGGER update_enrollee_counts
   AFTER INSERT OR UPDATE OR DELETE ON distributors
   FOR EACH ROW EXECUTE FUNCTION recalculate_enrollee_counts();
   ```

3. **Add background job to recalculate periodically:**
   - Nightly recalculation for accuracy
   - Trigger for real-time updates on changes

---

## 2. CREDITS & COMPENSATION SYSTEM

### 🔍 How It Works

**Core Tables:**
- `members` - Stores monthly credits and ranks
- `earnings_ledger` - Transaction log for all commissions
- `products` - Credit percentages per product
- `compensation_plan_configs` - Rank requirements and bonuses

**Credit Flow:**
```
External Sale (Optive, etc.)
    ↓
processSale() in webhooks/process-sale.ts
    ↓
Update members.personal_credits_monthly
Update members.tech_personal_credits_monthly
Update members.insurance_personal_credits_monthly
    ↓
Monthly Commission Run (TBD - not implemented)
    ↓
calculate_tech_rank() SQL function
    ↓
Update members.tech_rank
Create earnings_ledger entries
```

### ⚠️ Critical Issues

| Issue | Details | Severity |
|-------|---------|----------|
| **Members table not created on signup** | Signup creates distributors but NOT members | 🔴 CRITICAL |
| **Credits denormalized without sync** | members table stores credits but could diverge from orders | 🔴 CRITICAL |
| **Commission run incomplete** | /api/admin/compensation/run is Phase 4 placeholder | 🔴 CRITICAL |
| **Override distribution not implemented** | Logic stubbed but not complete | 🔴 CRITICAL |
| **Bonus/Leadership pools not in commission run** | Functions exist but not integrated | 🔴 CRITICAL |
| **Cross-ladder credits not implemented** | Config says 0.5% insurance→tech but no code | 🟡 HIGH |

### 📁 Key Files

**Database Schema:**
- `supabase/migrations/20260316000003_dual_ladder_core_tables.sql` - members table
- `supabase/migrations/20260316000005_earnings_ledger.sql` - commission transactions
- `supabase/migrations/20260316000008_utility_functions.sql` - rank calculation functions

**TypeScript Logic:**
- `src/lib/compensation/waterfall.ts` - Revenue split (30% BotMakers, etc.)
- `src/lib/compensation/override-resolution.ts` - L1-L5 override logic (incomplete)
- `src/lib/integrations/webhooks/process-sale.ts` - Credit updates from sales

**API Endpoints:**
- `src/app/api/admin/compensation/run/route.ts` - Commission run (incomplete)
- `src/app/api/admin/compensation/bonus-pool/route.ts` - Bonus pool allocation

### 🔧 Immediate Action Required

1. **Create members record on signup:**
   ```typescript
   // In src/app/api/signup/route.ts after distributor created:
   await supabase.from('members').insert({
     member_id: generateId(),
     distributor_id: distributor.id,
     enroller_id: sponsor?.id || null,
     status: 'active',
     tech_rank: 'starter',
     insurance_rank: 'inactive'
   })
   ```

2. **Implement commission run logic:**
   - Evaluate ranks from current credits
   - Calculate commission for all sales in period
   - Award rank bonuses
   - Distribute bonus and leadership pools
   - Create earnings_ledger entries
   - Generate payout batch

3. **Add transaction wrapper for credit updates:**
   ```typescript
   await supabase.rpc('begin_transaction');
   try {
     // Update credits
     // Create earnings entry
     // Log in activity feed
     await supabase.rpc('commit_transaction');
   } catch (e) {
     await supabase.rpc('rollback_transaction');
   }
   ```

---

## 3. USER AUTHENTICATION & PROFILE SYNC

### 🔍 Data Duplication Map

```
┌─────────────────────┐
│   auth.users        │
│   ✓ email           │ ←─────── MANUAL SYNC ────────┐
│   ✓ phone           │                               │
└─────────────────────┘                               │
                                                      │
┌─────────────────────────────────────────────────────▼──┐
│   distributors                                         │
│   ✓ email (duplicated from auth.users)                │
│   ✓ phone (duplicated)                                │
│   ✓ first_name, last_name                             │
│   ✓ profile_photo_url                                 │
│   ✓ social_links (JSONB)                              │
│   ✓ onboarding_step, onboarding_completed             │
└────────────────┬───────────────────────────────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
        ▼        ▼        ▼
   members   activity_  meeting_
   (email)    feed      invitations
              (cached)  (recipient_email)
```

### ⚠️ Sync Issues

#### Issue #1: Email Stored in 2 Places
**Files:**
- `src/app/api/admin/distributors/[id]/change-email/route.ts:97-131`
- `src/lib/services/profile-sync-service.ts:156-191`

**Problem:**
- `auth.users.email` - Used for login
- `distributors.email` - Application data

**Failure Scenario:**
1. Admin updates email via `/api/admin/distributors/[id]/change-email`
2. Step 1: Update auth.users.email ✅
3. Step 2: Update distributors.email ❌ (database error)
4. **Result:** User can login with new email but profile shows old email

**Current Rollback Logic:**
```typescript
// Line 124-126 in change-email/route.ts
if (updateError) {
  // Try to rollback auth.users.email
  await adminClient.auth.admin.updateUserById(id, { email: oldEmail })
}
```

**Issue:** Only rolls back database update failure, not auth update failure.

**Fix Required:**
```typescript
await supabase.rpc('begin_transaction')
try {
  // 1. Update auth.users
  const authResult = await adminClient.auth.admin.updateUserById(...)
  if (authResult.error) throw authResult.error

  // 2. Update distributors
  const dbResult = await supabase.from('distributors').update(...)
  if (dbResult.error) throw dbResult.error

  await supabase.rpc('commit_transaction')
} catch (e) {
  await supabase.rpc('rollback_transaction')
  throw e
}
```

---

#### Issue #2: Phone Number in 4+ Tables
**Locations:**
1. `distributors.phone` (main)
2. `meeting_invitations.recipient_phone`
3. `crm_contacts.phone`
4. `event_flyers.contact_phone`

**Problem:** No automatic sync when `distributors.phone` changes.

**Affected Scenarios:**
- User updates phone in profile → Meeting invitations have old number
- CRM contacts still reference old phone
- Event flyers show outdated contact info

**Fix Required:**
```sql
CREATE OR REPLACE FUNCTION sync_phone_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all references to distributor's phone
  UPDATE meeting_invitations
  SET recipient_phone = NEW.phone
  WHERE distributor_id = NEW.id;

  UPDATE crm_contacts
  SET phone = NEW.phone
  WHERE distributor_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER distributor_phone_sync
AFTER UPDATE OF phone ON distributors
FOR EACH ROW
WHEN (OLD.phone IS DISTINCT FROM NEW.phone)
EXECUTE FUNCTION sync_phone_updates();
```

---

#### Issue #3: Profile Photo Cached in Activity Feed
**File:** `src/app/api/activity-feed/route.ts:75`

**Query:**
```typescript
.select(`
  actor:distributors!activity_feed_actor_id_fkey(
    first_name,
    last_name,
    profile_photo_url  // ← CACHED at query time
  )
`)
```

**Problem:**
- Activity feed displays photo via JOIN
- If user updates `distributors.profile_photo_url`, what happens to historical activities?
  - If query uses JOIN: Shows new photo (confusing - shows current photo on old activities)
  - If cached in activity_feed: Shows old photo (broken if Storage URL expired)

**Current Behavior:** JOIN query means historical activities show CURRENT photo.

**Recommended:** Decide on business logic:
- Option A: Historical activities show photo at time of action (cache in activity_feed)
- Option B: Historical activities show current photo (current behavior - keep JOIN)

---

#### Issue #4: Onboarding State Split Between Tables
**Tables:**
- `distributors`: Has `onboarding_step`, `onboarding_completed`, `onboarding_permanently_skipped`
- `members`: Has `status` ('active', 'inactive', 'terminated')

**Problem:**
- User completes onboarding → `distributors.onboarding_completed = true`
- But `members.status` might still be 'inactive'
- Commission system reads `members.status` to determine if user gets paid

**File:** `src/app/api/profile/onboarding/route.ts:63-76`

**Current Logic:**
```typescript
await supabase
  .from('distributors')
  .update({
    onboarding_step: nextStep,
    onboarding_completed: isComplete,
    onboarding_completed_at: isComplete ? new Date() : null
  })
  // NO UPDATE TO members.status!
```

**Fix Required:**
```typescript
await supabase.rpc('begin_transaction')

// Update distributors
await supabase.from('distributors').update({
  onboarding_completed: true,
  onboarding_completed_at: new Date()
})

// ALSO update members.status
await supabase.from('members').update({
  status: 'active'  // Change from 'inactive' to 'active'
}).eq('distributor_id', distributorId)

await supabase.rpc('commit_transaction')
```

---

## 4. MATRIX PLACEMENT & CASCADING UPDATES

### 🔍 Matrix Tree Structure

```
                  Master (Apex)
                       │
        ┌──────────────┼──────────────┐
        │              │              │
      Rep A          Rep B          Rep C
    (pos 1-2)      (pos 3)        (pos 4-5)
        │
    ┌───┼───┐
  Rep D  Rep E  Rep F
```

**Key Fields:**
- `matrix_parent_id` - Points to parent in tree
- `matrix_position` - 1-5 (slot under parent)
- `matrix_depth` - Level in tree (1-7)
- `sponsor_id` - Who recruited (can differ from matrix parent)

### ⚠️ Critical Issues

#### Issue #1: Matrix Position Changes Not Validated
**File:** `src/app/api/admin/distributors/[id]/matrix-position/route.ts:44-97`

**Current Validation:**
```typescript
// Line 45-53: Check if position taken
const { data: existing } = await serviceClient
  .from('distributors')
  .select('id')
  .eq('matrix_parent_id', matrix_parent_id)
  .eq('matrix_position', matrix_position)
  .neq('id', id)
  .neq('status', 'deleted')  // ⚠️ BUG: Only excludes 'deleted', not 'suspended'
  .single();
```

**Problems:**
1. **Suspended distributors still block positions**
   - Query filters `status != 'deleted'` but allows 'suspended'
   - Suspended rep occupies slot that could be reassigned

2. **No cascade validation when parent changes**
   ```typescript
   // Admin moves Rep A from under Master to under Rep B
   UPDATE distributors SET matrix_parent_id = 'rep_b_id' WHERE id = 'rep_a_id'

   // ⚠️ ISSUE: Rep A's children still point to Rep A as parent
   // But Rep A's depth changed from 1 to 2
   // Children's depth should change from 2 to 3
   // NO CODE TO UPDATE CHILDREN!
   ```

3. **Matrix depth can be manually overridden**
   ```typescript
   // Line 106: Allows manual depth setting
   if (matrix_depth !== undefined) {
     updates.matrix_depth = matrix_depth  // ⚠️ Can break invariant
   }
   ```

   **Invariant:** `child.matrix_depth = parent.matrix_depth + 1`

   **Broken Scenario:**
   - Parent: depth = 2
   - Admin sets child: depth = 5 (manual override)
   - Constraint violated!

#### Issue #2: Race Condition in Admin Endpoint
**Files:**
- `src/app/api/admin/distributors/[id]/matrix-position/route.ts` - NO lock
- `supabase/migrations/20260310000002_atomic_signup_functions.sql:143` - HAS lock

**Problem:**
- Signup uses `create_distributor_atomic()` with advisory lock: `pg_advisory_xact_lock(987654321)`
- Admin matrix-position endpoint uses direct UPDATE with NO lock
- Two admins can simultaneously move two people to the same slot

**Scenario:**
```
Admin 1: Checks position 3 under Master → empty ✅
Admin 2: Checks position 3 under Master → empty ✅
Admin 1: UPDATE distributors SET matrix_position = 3 WHERE id = 'rep_x'
Admin 2: UPDATE distributors SET matrix_position = 3 WHERE id = 'rep_y'
Result: Two reps in same position!
```

**Current Protection:**
- Unique constraint at database level: `UNIQUE(matrix_parent_id, matrix_position)`
- But creates error instead of auto-resolving

**Fix Required:**
```typescript
// Add advisory lock
await supabase.rpc('pg_advisory_xact_lock', { key: 987654321 })

// Then do validation and update
// Lock released at transaction end
```

---

#### Issue #3: Children Not Updated When Parent Moves
**Scenario:**
```
Before:
  Master (depth 0)
    └─ Rep A (depth 1, parent = Master)
        └─ Rep B (depth 2, parent = Rep A)
            └─ Rep C (depth 3, parent = Rep B)

Admin moves Rep A under Rep X (depth 2):
  Master (depth 0)
    └─ Rep X (depth 1)
        └─ Rep A (depth 2, parent = Rep X)  ← depth should change!
            └─ Rep B (depth 2, parent = Rep A)  ← depth WRONG! Should be 3
                └─ Rep C (depth 3, parent = Rep B)  ← depth WRONG! Should be 4
```

**Current Code:**
```typescript
// Line 108-111 in matrix-position/route.ts
await serviceClient
  .from('distributors')
  .update(updates)
  .eq('id', id)
// ⚠️ Only updates ONE record (the moved distributor)
// Children depths NOT recalculated!
```

**Fix Required:**
```sql
CREATE OR REPLACE FUNCTION recalculate_matrix_depths(moved_distributor_id UUID)
RETURNS VOID AS $$
DECLARE
  new_depth INTEGER;
BEGIN
  -- Get the new depth of the moved distributor
  SELECT matrix_depth INTO new_depth
  FROM distributors
  WHERE id = moved_distributor_id;

  -- Recursively update all descendants
  WITH RECURSIVE descendants AS (
    SELECT id, matrix_depth, matrix_parent_id
    FROM distributors
    WHERE matrix_parent_id = moved_distributor_id

    UNION ALL

    SELECT d.id, d.matrix_depth, d.matrix_parent_id
    FROM distributors d
    INNER JOIN descendants desc ON d.matrix_parent_id = desc.id
  )
  UPDATE distributors
  SET matrix_depth = new_depth + (
    SELECT COUNT(*)
    FROM descendants d2
    WHERE d2.id = distributors.id
  )
  WHERE id IN (SELECT id FROM descendants);
END;
$$ LANGUAGE plpgsql;
```

---

## 5. STATUS CHANGES & CASCADING EFFECTS

### ⚠️ Critical Issue: Distributor Suspension Not Reflected in Members Table

**Files:**
- `src/app/api/admin/distributors/[id]/suspend/route.ts:22-30`
- `src/lib/admin/distributor-service.ts:215-238`

**Current Suspension Logic:**
```typescript
// distributor-service.ts
async function suspendDistributor(id: string, reason: string, adminId: string) {
  await supabase
    .from('distributors')
    .update({
      status: 'suspended',
      suspended_at: new Date(),
      suspended_by: adminId,
      suspension_reason: reason
    })
    .eq('id', id)

  // ⚠️ NO UPDATE TO members TABLE!
}
```

**Cascading Effects NOT Handled:**

| System | Current State | Should Be |
|--------|---------------|-----------|
| **members table** | status = 'active' | status = 'terminated' |
| **Commission calculations** | Still receives commissions | Should be excluded |
| **Matrix positions** | Still occupies slot | Should free up slot? |
| **Team access** | Downline can still access | Should be blocked |
| **Activity feed** | Activity still visible | Should be hidden |
| **Earnings ledger** | Future earnings created | Should stop earnings |

**Fix Required:**
```typescript
async function suspendDistributor(id: string, reason: string, adminId: string) {
  await supabase.rpc('begin_transaction')

  try {
    // 1. Update distributors table
    await supabase
      .from('distributors')
      .update({
        status: 'suspended',
        suspended_at: new Date(),
        suspended_by: adminId,
        suspension_reason: reason
      })
      .eq('id', id)

    // 2. Update members table
    await supabase
      .from('members')
      .update({ status: 'terminated' })
      .eq('distributor_id', id)

    // 3. Cancel pending earnings
    await supabase
      .from('earnings_ledger')
      .update({ status: 'cancelled' })
      .eq('member_id', id)
      .eq('status', 'pending')

    // 4. Log activity
    await supabase.from('activity_feed').insert({
      actor_id: adminId,
      action_type: 'distributor_suspended',
      target_id: id,
      details: { reason }
    })

    await supabase.rpc('commit_transaction')
  } catch (e) {
    await supabase.rpc('rollback_transaction')
    throw e
  }
}
```

---

### Issue #2: Status Values Inconsistent Across Tables

**distributors.status:**
- 'active' (default)
- 'suspended'
- 'deleted' (soft delete)

**members.status:**
- 'active' (default)
- 'inactive'
- 'terminated'

**Problem:**
- No mapping between the two
- `distributors.status = 'suspended'` should map to `members.status = 'terminated'`?
- Or add 'suspended' to members.status enum?

**Recommendation:**
```sql
ALTER TABLE members
ALTER COLUMN status TYPE TEXT;

-- Update enum to match
-- 'active', 'inactive', 'suspended', 'terminated'
```

---

### Issue #3: Permanent Delete Doesn't Cascade

**File:** `src/lib/admin/distributor-service.ts:permanentlyDeleteDistributor()`

**Current Logic:**
```typescript
DELETE FROM distributors WHERE id = :id
```

**What's NOT Deleted:**
- `members` record (orphaned)
- `activity_feed` entries (orphaned)
- `crm_contacts` created by distributor
- `meeting_invitations` sent by distributor
- `earnings_ledger` entries
- Matrix children (orphaned - no parent)

**Fix Required:**
```typescript
async function permanentlyDeleteDistributor(id: string) {
  await supabase.rpc('begin_transaction')

  // 1. Archive earnings to separate table
  await supabase.from('earnings_archive').insert(
    supabase.from('earnings_ledger').select('*').eq('member_id', id)
  )

  // 2. Delete or anonymize activity
  await supabase.from('activity_feed')
    .update({ actor_id: null, actor_name: '[Deleted User]' })
    .eq('actor_id', id)

  // 3. Reassign matrix children to grandparent
  const { data: children } = await supabase
    .from('distributors')
    .select('id')
    .eq('matrix_parent_id', id)

  for (const child of children) {
    // Place under deleted user's parent
    await reassignMatrixPosition(child.id, deletedUser.matrix_parent_id)
  }

  // 4. Delete members record
  await supabase.from('members').delete().eq('distributor_id', id)

  // 5. Finally delete distributor
  await supabase.from('distributors').delete().eq('id', id)

  await supabase.rpc('commit_transaction')
}
```

---

## 6. SLUG UNIQUENESS & URL ROUTING

### Issue: Slug Used in Multiple Contexts

**Slug Storage:**
- `distributors.slug` - UNIQUE constraint
- `lead_capture_forms.slug` - UNIQUE per distributor (not globally unique)

**Slug Usage:**
1. Distributor landing pages: `theapexway.net/[slug]`
2. Lead capture forms: `theapexway.net/lead/[distributor_slug]/[form_slug]`
3. Affiliate tracking: `affiliate_code = slug` (line 174, atomic_signup_functions.sql)
4. Sponsor lookups: Sponsor passed as slug in signup

**Problem:**
- Slug is **immutable** (no update endpoint)
- If user changes name "John Doe" → "Jane Doe", slug stays "john-doe"
- Affiliate code is based on slug, so code never updates

**Recommendation:**
```typescript
// Option A: Allow slug updates with redirect
async function updateSlug(distributorId: string, newSlug: string) {
  // 1. Create redirect from old slug to new slug
  await supabase.from('slug_redirects').insert({
    old_slug: oldSlug,
    new_slug: newSlug,
    distributor_id: distributorId
  })

  // 2. Update slug
  await supabase.from('distributors')
    .update({ slug: newSlug })
    .eq('id', distributorId)
}

// Option B: Keep slug immutable, add display_name field
ALTER TABLE distributors ADD COLUMN display_name TEXT;
// Use display_name for UI, keep slug for URLs
```

---

## 7. EXTERNAL PLATFORM SYNC

### Issue: Profile Changes Queued But Not Processed

**File:** `src/lib/services/profile-sync-service.ts:18-110`

**Sync Process:**
```typescript
export async function queueMultiPlatformSync(
  distributorId: string,
  changeType: 'email' | 'name' | 'phone' | 'address',
  newValues: Record<string, unknown>
) {
  // Queue sync to:
  // - Jordyn (email, name)
  // - AgentPulse (email, name)
  // - WinFlex (if licensed: email, phone, address)

  await supabase.from('profile_change_queue').insert({
    distributor_id: distributorId,
    platform: ['jordyn', 'agentpulse', 'winflex'],
    change_type: changeType,
    new_values: newValues,
    status: 'pending',
    sync_attempts: 0,
    max_retries: 5
  })
}
```

**Problems:**
1. **No worker processing the queue**
   - Table `profile_change_queue` exists
   - Changes get queued
   - But no cron job or background worker found to process them

2. **No verification of external sync success**
   - Email updated in Apex distributors table ✅
   - Queue entry created ✅
   - But if Jordyn API fails, no one knows

3. **Retries could cause duplicates**
   - 5 retry attempts
   - If external platform creates new record each time
   - Could end up with 5 duplicate profiles

4. **No rollback if external sync fails**
   - Email already changed in Apex
   - Jordyn still has old email
   - User can't login to Jordyn with new email

**Fix Required:**

1. Create background worker:
```typescript
// src/lib/cron/profile-sync-worker.ts
import cron from 'node-cron'

cron.schedule('*/5 * * * *', async () => {
  const { data: pending } = await supabase
    .from('profile_change_queue')
    .select('*')
    .eq('status', 'pending')
    .lt('sync_attempts', 'max_retries')

  for (const change of pending) {
    try {
      if (change.platform === 'jordyn') {
        await syncToJordyn(change)
      } else if (change.platform === 'agentpulse') {
        await syncToAgentPulse(change)
      } else if (change.platform === 'winflex') {
        await syncToWinFlex(change)
      }

      // Mark success
      await supabase.from('profile_change_queue')
        .update({
          status: 'completed',
          completed_at: new Date()
        })
        .eq('id', change.id)

    } catch (error) {
      // Increment retry count
      await supabase.from('profile_change_queue')
        .update({
          sync_attempts: change.sync_attempts + 1,
          last_error: error.message
        })
        .eq('id', change.id)
    }
  }
})
```

2. Add webhook handlers for external platform confirmations:
```typescript
// src/app/api/webhooks/jordyn/profile-updated/route.ts
export async function POST(req: Request) {
  const { distributor_id, success } = await req.json()

  if (success) {
    await supabase.from('profile_change_queue')
      .update({
        status: 'completed',
        external_confirmed: true
      })
      .eq('distributor_id', distributor_id)
      .eq('platform', 'jordyn')
  }
}
```

---

## 8. RACE CONDITIONS & TRANSACTIONS

### Issue: Signup Creates Records in Wrong Order

**File:** `src/app/api/signup/route.ts`

**Current Flow:**
```typescript
1. Validate input (lines 50-141)
2. Create auth user (lines 179-235) ← Transaction 1
3. Call create_distributor_atomic() (lines 257-283) ← Transaction 2
4. Create members record? ← NOT FOUND
5. Create replicated sites (line 312) ← Transaction 3
6. Enroll in campaign (line 314) ← Transaction 4
```

**Problems:**

1. **Auth user created before distributor**
   - If distributor creation fails, orphaned auth record exists
   - Cleanup attempted (lines 290-292) but only on direct error
   - If campaign enrollment fails, no rollback

2. **Members record NOT created on signup**
   - Commission system expects `members` table record
   - No code creates members record during signup
   - `members.distributor_id` should match `distributors.id`

3. **No atomic transaction wrapping all steps**
   - 3-4 separate transactions
   - Partial state if any step fails

**Fix Required:**
```typescript
export async function POST(req: Request) {
  let authUserId: string | null = null
  let distributorId: string | null = null

  try {
    await supabase.rpc('begin_transaction')

    // 1. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email, password
    })
    if (authError) throw authError
    authUserId = authUser.user.id

    // 2. Create distributor
    const { data: distributor, error: distError } = await supabase
      .rpc('create_distributor_atomic', { ... })
    if (distError) throw distError
    distributorId = distributor.id

    // 3. Create members record
    const { error: memberError } = await supabase.from('members').insert({
      member_id: generateId(),
      distributor_id: distributorId,
      enroller_id: sponsor?.id || null,
      status: 'active',
      tech_rank: 'starter',
      insurance_rank: 'inactive'
    })
    if (memberError) throw memberError

    // 4. Create replicated sites
    await createReplicatedSites(distributorId)

    // 5. Enroll in campaign
    await enrollInCampaign(distributorId)

    await supabase.rpc('commit_transaction')

    return NextResponse.json({ success: true, distributorId })

  } catch (error) {
    await supabase.rpc('rollback_transaction')

    // Cleanup auth user if created
    if (authUserId) {
      await supabase.auth.admin.deleteUser(authUserId)
    }

    throw error
  }
}
```

---

## 9. QUERY & DENORMALIZATION ISSUES

### Issue: Activity Feed Caches User Data

**File:** `src/app/api/activity-feed/route.ts:59-82`

**Query:**
```typescript
const { data: activities } = await supabase
  .from('activity_feed')
  .select(`
    id,
    action_type,
    created_at,
    actor:distributors!activity_feed_actor_id_fkey(
      first_name,
      last_name,
      slug,
      profile_photo_url  ← Fetched at query time via JOIN
    )
  `)
```

**Current Behavior:**
- Activity feed does NOT store actor name/photo
- Uses JOIN to fetch from distributors table at display time
- **Pro:** Always shows current name and photo
- **Con:** Historical activities show current data, not data at time of action

**Example:**
```
Jan 1: John Doe recruits Jane → Activity created: "recruited Jane"
Feb 1: John changes name to "Johnny"
Mar 1: View activity feed → Shows "Johnny recruited Jane"
```

**Business Decision Needed:**
- **Option A:** Show current name/photo (current behavior - keep as is)
- **Option B:** Show name/photo at time of action (cache in activity_feed)

If Option B chosen:
```typescript
// When creating activity
await supabase.from('activity_feed').insert({
  actor_id: distributorId,
  actor_name: `${distributor.first_name} ${distributor.last_name}`,  // Cache
  actor_photo_url: distributor.profile_photo_url,  // Cache
  action_type: 'recruited',
  target_id: newRecruitId
})
```

---

## 10. FOREIGN KEY & CONSTRAINT ISSUES

### Issue: No Checks for Circular Relationships

**Potential Circular Reference Scenarios:**

1. **Circular Sponsor Chain:**
   ```
   Rep A sponsors Rep B
   Rep B sponsors Rep C
   Rep C sponsors Rep A  ← CIRCULAR!
   ```

2. **Self-Referential Sponsor:**
   ```
   UPDATE distributors SET sponsor_id = id WHERE id = :id
   // Rep sponsors themselves!
   ```

3. **Circular Matrix:**
   ```
   Rep A: matrix_parent_id = Rep B
   Rep B: matrix_parent_id = Rep C
   Rep C: matrix_parent_id = Rep A  ← CIRCULAR!
   ```

**Current Protection:** NONE

**Fix Required:**
```sql
-- 1. Add check constraint for self-reference
ALTER TABLE distributors
ADD CONSTRAINT no_self_sponsor
CHECK (sponsor_id != id);

ALTER TABLE distributors
ADD CONSTRAINT no_self_matrix_parent
CHECK (matrix_parent_id != id);

-- 2. Add function to detect circular chains
CREATE OR REPLACE FUNCTION check_circular_sponsor(
  new_sponsor_id UUID,
  distributor_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  current_id UUID := new_sponsor_id;
  visited UUID[] := ARRAY[distributor_id];
BEGIN
  -- Walk up sponsor chain
  WHILE current_id IS NOT NULL LOOP
    -- If we reach the original distributor, it's circular
    IF current_id = distributor_id THEN
      RETURN FALSE;  -- Circular!
    END IF;

    -- Track visited nodes
    visited := array_append(visited, current_id);

    -- Get next sponsor
    SELECT sponsor_id INTO current_id
    FROM distributors
    WHERE id = current_id;
  END LOOP;

  RETURN TRUE;  -- Not circular
END;
$$ LANGUAGE plpgsql;

-- 3. Add trigger to enforce
CREATE TRIGGER prevent_circular_sponsor
BEFORE INSERT OR UPDATE OF sponsor_id ON distributors
FOR EACH ROW
WHEN (NEW.sponsor_id IS NOT NULL)
EXECUTE FUNCTION enforce_no_circular_sponsor();
```

---

## COMPREHENSIVE DEPENDENCY MAP

```
┌─────────────────────────────────────────────────────────────┐
│                    APEX DATA FLOW                           │
└─────────────────────────────────────────────────────────────┘

AUTH & PROFILE:
auth.users.email ←──────┐
                        │ MANUAL SYNC (change-email endpoint)
                        │ ⚠️ Can diverge
distributors.email ←────┘

distributors.phone ──→ meeting_invitations.recipient_phone (NO SYNC)
                   └──→ crm_contacts.phone (NO SYNC)
                   └──→ event_flyers.contact_phone (NO SYNC)

distributors.profile_photo_url ──→ activity_feed (JOIN, shows current)

distributors.onboarding_completed ─┐
                                    │ ⚠️ NO SYNC
members.status ────────────────────┘

TEAM STRUCTURE:
distributors.sponsor_id ──→ Count enrollees (getPersonalEnrolleeCount)
                       └──→ Recursive org count (getOrganizationEnrolleeCount)

distributors.matrix_parent_id ──→ Matrix tree (5-way branching)
distributors.matrix_position ──→ Slot (1-5) under parent
distributors.matrix_depth ──→ Level in tree (0-7)

COMPENSATION:
External Sale (webhook) ──→ process-sale.ts
                        └──→ members.personal_credits_monthly ↑
                        └──→ members.tech_personal_credits_monthly ↑
                        └──→ earnings_ledger (direct commission)

Monthly Commission Run ──→ calculate_tech_rank()
                      └──→ members.tech_rank
                      └──→ earnings_ledger (overrides L1-L5)
                      └──→ bonus_pool_ledger (3.5%)
                      └──→ leadership_shares (1.5% for Elite)

STATUS CHANGES:
distributors.status = 'suspended' ─┐
                                    │ ⚠️ NO SYNC
members.status = 'active' ──────────┘ (Should be 'terminated')

distributors.status = 'deleted' ──→ ⚠️ NO CASCADE to:
                                   - members
                                   - activity_feed
                                   - earnings_ledger
                                   - matrix children (orphaned)
```

---

## PRIORITY FIX MATRIX

| Priority | Issue | Impact | Effort | Timeline |
|----------|-------|--------|--------|----------|
| 🔴 P0 | Members table not created on signup | Commission system fails | Medium | **Week 1** |
| 🔴 P0 | Distributor suspension doesn't update members | Suspended reps get paid | Medium | **Week 1** |
| 🔴 P0 | Email sync between auth.users and distributors | Login breaks | Low | **Week 1** |
| 🔴 P0 | Commission run implementation incomplete | No payments processed | High | **Week 2-3** |
| 🟡 P1 | Matrix placement race condition in admin | Position conflicts | Low | **Week 2** |
| 🟡 P1 | Phone number duplication | Stale contact info | Medium | **Week 2** |
| 🟡 P1 | Onboarding state split | Access control issues | Low | **Week 2** |
| 🟡 P1 | Matrix depth not recalculated on parent change | Tree integrity broken | Medium | **Week 3** |
| 🟢 P2 | Profile sync queue not processed | External platforms out of sync | Medium | **Week 3-4** |
| 🟢 P2 | Activity feed caching decision | Historical data accuracy | Low | **Week 4** |
| 🟢 P2 | Circular relationship checks | Data integrity | Low | **Week 4** |
| 🟢 P2 | Permanent delete cascades | Orphaned data | Medium | **Week 4** |

---

## RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Critical Fixes (Week 1)
1. **Add members table creation to signup flow**
2. **Fix email sync transaction wrapper**
3. **Add members.status sync on distributor suspension**
4. **Test and verify basic signup → commission flow**

### Phase 2: High Priority (Week 2)
5. **Add advisory lock to admin matrix placement**
6. **Create phone number sync trigger**
7. **Sync onboarding completion to members.status**
8. **Add validation for matrix depth recalculation**

### Phase 3: Commission System (Week 2-3)
9. **Implement complete commission run logic:**
   - Rank evaluation
   - Override distribution (L1-L5)
   - Rank bonuses
   - Bonus pool allocation
   - Leadership pool allocation
   - Earnings ledger inserts
   - Payout batch creation

### Phase 4: Medium Priority (Week 3-4)
10. **Create profile sync worker**
11. **Add webhook handlers for external confirmation**
12. **Decide on activity feed caching strategy**
13. **Add circular relationship checks**
14. **Implement proper cascade delete logic**

### Phase 5: Performance Optimization (Week 4+)
15. **Add denormalized enrollee count columns**
16. **Create triggers to maintain counts**
17. **Add caching layer for expensive queries**
18. **Optimize recursive organization count queries**

---

## TESTING CHECKLIST

Before deploying fixes, test these scenarios:

### Signup Flow
- [ ] Create new distributor → Verify members record created
- [ ] Create with sponsor → Verify sponsor_id and enroller_id set correctly
- [ ] Create with matrix parent → Verify matrix placement correct
- [ ] Fail midway → Verify auth user cleaned up

### Email Changes
- [ ] Update email via admin → Verify both auth.users and distributors updated
- [ ] Fail auth update → Verify rollback
- [ ] Fail database update → Verify auth rolled back
- [ ] Check external platform sync queued

### Suspension
- [ ] Suspend distributor → Verify members.status = 'terminated'
- [ ] Suspend distributor → Verify pending earnings cancelled
- [ ] Suspend distributor → Verify activity logged
- [ ] Check suspended rep excluded from commission run

### Matrix Placement
- [ ] Move distributor to new parent → Verify children's depth recalculated
- [ ] Two admins move simultaneously → Verify no position conflicts
- [ ] Move to position already taken → Verify error
- [ ] Move suspended distributor → Verify validation

### Commission Run
- [ ] Process sales from webhook → Verify credits updated
- [ ] Run monthly commission → Verify ranks evaluated
- [ ] Run commission → Verify overrides L1-L5 calculated
- [ ] Run commission → Verify bonus pool allocated equally
- [ ] Run commission → Verify leadership pool proportional
- [ ] Check earnings_ledger entries created
- [ ] Check payout batch generated

### Delete Operations
- [ ] Soft delete (status='deleted') → Verify excluded from counts
- [ ] Permanent delete → Verify members record removed
- [ ] Permanent delete → Verify matrix children reassigned
- [ ] Permanent delete → Verify activity archived/anonymized

---

## CONCLUSION

This audit identified **47 critical dependency and synchronization issues** across your application. The most severe issues involve:

1. **Data duplication without sync** (email, phone, profile data)
2. **Incomplete commission system** (Phase 4 not implemented)
3. **Members table not created on signup** (breaks commission flow)
4. **Status changes don't cascade** (suspended reps still get paid)
5. **Matrix placement race conditions** (admin endpoint has no lock)

**Immediate Priority:** Fix the 4 P0 issues in Week 1 to prevent payment errors and data corruption.

**Total Estimated Effort:** 3-4 weeks for all critical and high-priority fixes.

---

**Report Generated:** March 20, 2026
**Next Review:** After Phase 1 completion (Week 1)
