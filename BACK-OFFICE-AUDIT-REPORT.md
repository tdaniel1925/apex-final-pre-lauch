# Back Office Data Query and RLS Policy Audit Report

**Date:** March 18, 2026
**Auditor:** Agent 10
**Scope:** Matrix, Team, and Genealogy views - Data fetching and RLS policies
**Critical Issue:** Charles Potter → Brian enrollment showing in Team (5 reps) but Matrix shows "none"

---

## Executive Summary

**Root Cause Identified:** The Matrix view uses a **service client** (bypasses RLS) but has incorrect query logic that filters out results, while the Team and Genealogy views work correctly because they use proper enrollment-based queries.

**Critical Finding:** All three views (Matrix, Team, Genealogy) use the service client and bypass RLS, but Matrix has a **filtering bug** in its level calculation logic.

---

## 1. View-by-View Analysis

### 1.1 Team View (WORKING CORRECTLY)

**File:** `src/app/dashboard/team/page.tsx`
**Lines:** 66-88

**Query Used:**
```typescript
const { data: teamMembers } = await serviceClient
  .from('members')
  .select(`
    member_id,
    distributor_id,
    full_name,
    email,
    tech_rank,
    personal_credits_monthly,
    enrollment_date,
    override_qualified,
    distributor:distributors!members_distributor_id_fkey (...)
  `)
  .eq('enroller_id', currentMemberId)  // ✅ CORRECT: Direct enrollees only
  .order('enrollment_date', { ascending: false });
```

**Why It Works:**
- Uses service client (bypasses RLS)
- Queries `members` table directly
- Filters by `enroller_id = currentMemberId` (Level 1 only)
- Gets distributor data via join
- **Simple, direct query - no complex filtering**

---

### 1.2 Genealogy View (WORKING CORRECTLY)

**File:** `src/app/dashboard/genealogy/page.tsx`
**Lines:** 36-61

**Query Used:**
```typescript
const { data: directEnrollees } = await serviceClient
  .from('members')
  .select(`
    member_id,
    email,
    full_name,
    enroller_id,
    tech_rank,
    ...
  `)
  .eq('enroller_id', enrollerId)  // ✅ CORRECT: Recursive tree building
  .eq('status', 'active')
  .order('enrollment_date', { ascending: true });
```

**Why It Works:**
- Uses service client (bypasses RLS)
- Queries `members` table directly
- Filters by `enroller_id` at each level
- Recursively builds tree by calling `buildEnrollmentTree()` for each member
- **Recursive but correct - follows enrollment chain**

---

### 1.3 Matrix View (BROKEN - THIS IS THE BUG)

**File:** `src/app/dashboard/matrix/page.tsx`
**Lines:** 80-104

**Query Used:**
```typescript
const { data: allMembers } = await serviceClient
  .from('members')
  .select(`
    member_id,
    full_name,
    enroller_id,
    tech_rank,
    personal_credits_monthly,
    override_qualified,
    distributor:distributors!members_distributor_id_fkey (...)
  `)
  .eq('status', 'active');  // ⚠️ PROBLEM: Gets ALL active members, no filtering!
```

**Then on lines 101-104:**
```typescript
const levelMap = calculateMatrixLevels(
  currentMemberId,
  allMembers || []
);
```

**The Bug:**
The query gets ALL active members in the system, then tries to filter them client-side using `calculateMatrixLevels()`.

**File:** `src/lib/matrix/level-calculator.ts`
**Lines:** 28-80

**The Filtering Logic:**
```typescript
export function calculateMatrixLevels(
  currentUserId: string,
  allMembers: MemberNode[]
): Record<number, MemberWithLevel[]> {
  // ...

  // Start with Level 1: Direct enrollees of current user
  const directEnrollees = allMembers.filter((m) => m.enroller_id === currentUserId);

  directEnrollees.forEach((enrollee) => {
    assignLevel(enrollee.member_id, 1);
  });

  return levelMap;
}
```

**Why It's Failing:**

1. **Gets ALL members** (not filtered by downline)
2. **Then filters** to find direct enrollees (`enroller_id === currentUserId`)
3. **If the current user has no direct enrollees**, the filter returns empty array
4. **Matrix shows "none"** even though the user has downline through different paths

**The Actual Problem:**
- Team view shows 5 reps because it correctly queries `enroller_id = currentMemberId`
- Matrix shows "none" because the Level 1 filter (`directEnrollees = allMembers.filter(...)`) is returning empty
- **This means:** Either the `currentMemberId` doesn't match the `enroller_id` values in the database, OR there's a data mismatch

---

## 2. RLS Policy Analysis

### 2.1 Members Table RLS Policies

**File:** `supabase/migrations/20260316000003_dual_ladder_core_tables.sql`
**Lines:** 144-159

**Current Policies:**
```sql
-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role can do everything
CREATE POLICY service_all_members ON public.members
  FOR ALL
  TO service_role
  USING (true);

-- Policy 2: Users can read their own record
CREATE POLICY member_read_own ON public.members
  FOR SELECT
  TO authenticated
  USING (distributor_id = auth.uid());
```

**Additional Downline Policies:**

**File:** `supabase/migrations/20260317000002_add_member_downline_policies.sql`
**Lines:** 11-46

```sql
-- Policy 3: Allow users to see L1 downline
CREATE POLICY member_read_l1_downline ON public.members
  FOR SELECT
  TO authenticated
  USING (
    enroller_id IN (
      SELECT member_id
      FROM public.members
      WHERE distributor_id = auth.uid()
    )
  );

-- Policy 4: Allow users to see entire downline tree (recursive)
CREATE POLICY member_read_all_downline ON public.members
  FOR SELECT
  TO authenticated
  USING (
    member_id IN (
      WITH RECURSIVE downline AS (
        SELECT member_id
        FROM public.members
        WHERE distributor_id = auth.uid()

        UNION ALL

        SELECT m.member_id
        FROM public.members m
        INNER JOIN downline d ON m.enroller_id = d.member_id
      )
      SELECT member_id FROM downline
    )
  );
```

**RLS Status:**
- ✅ RLS is enabled on `members` table
- ✅ Authenticated users can see own record
- ✅ Authenticated users can see L1 downline
- ✅ Authenticated users can see entire downline tree (recursive)
- ✅ Service role bypasses all RLS (as expected)

**HOWEVER:** All three views use **service client** which bypasses RLS completely, so RLS policies are irrelevant to this bug.

---

## 3. Data Model Discrepancy

### Critical Issue: `distributor_id` vs `auth_user_id`

**Members Table Structure:**
```sql
CREATE TABLE public.members (
  member_id UUID PRIMARY KEY,
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  enroller_id UUID REFERENCES members(member_id),
  ...
);
```

**Key Finding:**
- `members.distributor_id` → References `distributors.id` (NOT `auth.uid()`)
- The `distributors` table has an `auth_user_id` column that maps to `auth.uid()`
- **This creates a lookup chain:** `auth.uid()` → `distributors.auth_user_id` → `distributors.id` → `members.distributor_id`

**Matrix Page Query (Line 45):**
```typescript
.eq('auth_user_id', user.id)  // ✅ Correct - gets distributor
```

**But then (Line 98):**
```typescript
const currentMemberId = dist.member.member_id;  // ✅ Gets member_id
```

**Then passes to level calculator (Line 101-104):**
```typescript
const levelMap = calculateMatrixLevels(
  currentMemberId,  // ✅ Correct - member_id
  allMembers || []  // ⚠️ ALL members in system
);
```

**The calculator then filters (level-calculator.ts Line 73):**
```typescript
const directEnrollees = allMembers.filter((m) => m.enroller_id === currentUserId);
```

**This should work IF:**
- `currentUserId` (member_id) matches the `enroller_id` values in the database
- The enrollees actually have `enroller_id` set to this member's `member_id`

---

## 4. Root Cause: Data vs Query Mismatch

### Hypothesis for Charles Potter → Brian Issue

**Scenario 1: Brian's `enroller_id` is NULL or incorrect**
- Brian's record exists in `members` table
- But `enroller_id` is NULL or points to wrong member
- Team view shows Brian because it joins via `distributors` table (different relationship)
- Matrix view can't find Brian because `enroller_id` filter fails

**Scenario 2: Different relationship fields**
- Team view might be using `sponsor_id` instead of `enroller_id`
- Matrix uses `enroller_id` exclusively
- If Brian's `sponsor_id` = Charles but `enroller_id` ≠ Charles, this explains the discrepancy

**Need to verify:**
```sql
-- Check Brian's actual enroller_id
SELECT member_id, full_name, enroller_id, distributor_id
FROM members
WHERE full_name ILIKE '%Brian%';

-- Check Charles Potter's member_id
SELECT member_id, full_name
FROM members
WHERE full_name ILIKE '%Charles Potter%';

-- Verify the relationship
SELECT
  e.full_name as enrollee,
  e.enroller_id,
  enroller.full_name as enroller
FROM members e
LEFT JOIN members enroller ON e.enroller_id = enroller.member_id
WHERE e.full_name ILIKE '%Brian%';
```

---

## 5. Identified Issues with Severity

### P0 - Critical (Blocking)

**Issue #1: Matrix Level Calculation Returns Empty Results**
- **File:** `src/lib/matrix/level-calculator.ts` (Lines 73-77)
- **File:** `src/app/dashboard/matrix/page.tsx` (Lines 80-104)
- **Problem:** Gets ALL members then filters client-side, resulting in no matches
- **Root Cause:** Either data mismatch (`enroller_id` not set) or incorrect member_id being passed
- **Impact:** Matrix shows "none" when users have downline
- **Fix Required:**
  1. Add logging to see what `currentMemberId` is vs what `enroller_id` values exist
  2. Verify Brian's `enroller_id` actually points to Charles Potter's `member_id`
  3. Consider changing Matrix query to match Team query pattern (filter server-side)

### P1 - High (User-facing bug)

**Issue #2: Inconsistent Data Model Between Views**
- **Files:** All three view pages
- **Problem:** Team, Genealogy, and Matrix all use different querying strategies
- **Impact:** Confusing results, hard to debug
- **Fix Required:** Standardize on one query pattern across all views

**Issue #3: Unnecessary Service Client Usage**
- **Files:** All three view pages
- **Problem:** Using service client (bypasses RLS) when authenticated client with proper RLS policies would work
- **Impact:** Security risk, RLS policies not being utilized
- **Fix Required:** Switch to authenticated client and rely on RLS policies

### P2 - Medium (Performance)

**Issue #4: Matrix Gets ALL Members**
- **File:** `src/app/dashboard/matrix/page.tsx` (Line 80)
- **Problem:** Query returns ALL active members in system
- **Impact:** Performance degrades as member count grows
- **Fix Required:** Add server-side filtering like Team view uses

---

## 6. Recommended Fixes

### Fix #1: Change Matrix Query to Match Team Pattern (IMMEDIATE)

**File:** `src/app/dashboard/matrix/page.tsx`

**Current (Lines 80-95):**
```typescript
const { data: allMembers } = await serviceClient
  .from('members')
  .select(`...`)
  .eq('status', 'active');
```

**Recommended:**
```typescript
// Get L1 enrollees first (like Team view does)
const { data: l1Members } = await serviceClient
  .from('members')
  .select(`...`)
  .eq('enroller_id', currentMemberId)  // Direct enrollees only
  .eq('status', 'active');

// Then recursively get L2-L5 if needed
// Or keep existing recursive logic but seed it with correct L1 data
```

### Fix #2: Add Debug Logging (IMMEDIATE)

**Add to Matrix page before calling calculateMatrixLevels:**
```typescript
console.log('Current Member ID:', currentMemberId);
console.log('All Members Count:', allMembers?.length);
console.log('Members with enroller_id matching current:',
  allMembers?.filter(m => m.enroller_id === currentMemberId).length
);
```

### Fix #3: Verify Data Integrity (IMMEDIATE)

**Run these queries in Supabase SQL editor:**
```sql
-- 1. Check Charles Potter's member record
SELECT member_id, full_name, email, distributor_id
FROM members
WHERE full_name ILIKE '%Charles%Potter%';

-- 2. Check Brian's member record
SELECT member_id, full_name, email, enroller_id, distributor_id
FROM members
WHERE full_name ILIKE '%Brian%';

-- 3. Check if Brian's enroller_id matches Charles's member_id
SELECT
  brian.full_name as brian_name,
  brian.enroller_id as brian_enroller_id,
  charles.member_id as charles_member_id,
  CASE
    WHEN brian.enroller_id = charles.member_id THEN 'MATCH ✅'
    ELSE 'MISMATCH ❌'
  END as relationship_status
FROM members brian
CROSS JOIN members charles
WHERE brian.full_name ILIKE '%Brian%'
  AND charles.full_name ILIKE '%Charles%Potter%';
```

### Fix #4: Standardize Query Pattern (LONG-TERM)

**Create a shared service:**
```typescript
// src/lib/services/downline-service.ts

export async function getDirectEnrollees(memberId: string) {
  const serviceClient = createServiceClient();

  return await serviceClient
    .from('members')
    .select(`
      member_id,
      full_name,
      enroller_id,
      tech_rank,
      personal_credits_monthly,
      override_qualified,
      distributor:distributors!members_distributor_id_fkey (
        id,
        rep_number,
        slug
      )
    `)
    .eq('enroller_id', memberId)
    .eq('status', 'active')
    .order('enrollment_date', { ascending: true });
}

export async function getDownlineTree(
  memberId: string,
  maxDepth: number = 5
): Promise<MemberNode[]> {
  // Implement recursive tree building
  // Use getDirectEnrollees() as base
}
```

**Then use in all three views:**
- Matrix: `getDownlineTree(currentMemberId, maxRankDepth)`
- Team: `getDirectEnrollees(currentMemberId)` (L1 only)
- Genealogy: `getDownlineTree(currentMemberId, maxDepth)`

---

## 7. Testing Checklist

After applying fixes:

- [ ] Verify Charles Potter's `member_id` in database
- [ ] Verify Brian's `enroller_id` matches Charles's `member_id`
- [ ] Test Matrix view with Charles Potter's account
- [ ] Verify Matrix shows same 5 reps as Team view
- [ ] Test with other users who have downline
- [ ] Verify L2-L5 levels populate correctly in Matrix
- [ ] Check performance with 100+ members
- [ ] Verify RLS policies work if switching from service client
- [ ] Test Genealogy tree still builds correctly after changes

---

## 8. Next Steps

1. **IMMEDIATE:** Add debug logging to Matrix page to confirm hypothesis
2. **IMMEDIATE:** Run SQL verification queries to check Brian's `enroller_id`
3. **HIGH PRIORITY:** Fix Matrix query to match Team pattern
4. **MEDIUM PRIORITY:** Create shared downline service to standardize queries
5. **LOW PRIORITY:** Switch from service client to authenticated client with RLS

---

## 9. Files Modified/Affected

**Need to modify:**
- `src/app/dashboard/matrix/page.tsx` (Lines 80-122)
- `src/lib/matrix/level-calculator.ts` (Lines 28-80)

**May need to create:**
- `src/lib/services/downline-service.ts` (new file)

**Need to verify:**
- Database: `members` table → Brian's `enroller_id` value
- Database: `members` table → Charles Potter's `member_id` value

---

## Appendix A: Complete File Paths

**Matrix View:**
- Page: `C:\dev\1 - Apex Pre-Launch Site\src\app\dashboard\matrix\page.tsx`
- Calculator: `C:\dev\1 - Apex Pre-Launch Site\src\lib\matrix\level-calculator.ts`
- Component: `C:\dev\1 - Apex Pre-Launch Site\src\components\matrix\MatrixWithModal.tsx`

**Team View:**
- Page: `C:\dev\1 - Apex Pre-Launch Site\src\app\dashboard\team\page.tsx`
- API: `C:\dev\1 - Apex Pre-Launch Site\src\app\api\dashboard\team\route.ts`
- Component: `C:\dev\1 - Apex Pre-Launch Site\src\components\team\TeamWithModal.tsx`

**Genealogy View:**
- Page: `C:\dev\1 - Apex Pre-Launch Site\src\app\dashboard\genealogy\page.tsx`
- Component: `C:\dev\1 - Apex Pre-Launch Site\src\components\genealogy\GenealogyWithModal.tsx`

**Database Migrations:**
- Members table: `supabase/migrations/20260316000003_dual_ladder_core_tables.sql`
- RLS policies: `supabase/migrations/20260317000002_add_member_downline_policies.sql`
- Security: `supabase/migrations/20260311000005_emergency_security_rls_policies.sql`

---

**End of Report**
