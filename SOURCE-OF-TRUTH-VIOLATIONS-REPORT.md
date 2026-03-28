# SOURCE OF TRUTH VIOLATIONS - COMPREHENSIVE AUDIT REPORT

**Generated:** 2026-03-22
**Total Violations:** 36 (30 actual violations + 6 allowed exceptions)
**Files Affected:** 17 files

---

## 🚨 EXECUTIVE SUMMARY

This audit identified **30 violations** of the single source of truth rules across 17 files:

- **6 CRITICAL** violations (affecting compensation/money calculations)
- **11 HIGH** violations (affecting user-facing data accuracy)
- **13 MEDIUM** violations (affecting admin UI data accuracy)

**Top 3 Most Critical Issues:**

1. **src/app/api/signup/route.ts** - Setting `members.enroller_id` during signup perpetuates the wrong enrollment tree field (CRITICAL)
2. **src/lib/matrix/level-calculator.ts** - Using `enroller_id` for tree traversal in 3 places (CRITICAL)
3. **src/components/dashboard/Road500Banner.tsx** - Counting "personal recruits" using `matrix_parent_id` instead of `sponsor_id` (HIGH - affects leaderboard)

---

## 📊 VIOLATIONS BY TYPE

| Type | Count | Description |
|------|-------|-------------|
| **enroller_id_usage** | 7 | Using `members.enroller_id` instead of `distributors.sponsor_id` |
| **cached_bv** | 18 | Using `distributors.personal_bv_monthly` instead of `members.personal_credits_monthly` |
| **matrix_tree_misuse** | 5 | Using `matrix_parent_id` for enrollment/team queries (should use `sponsor_id`) |

---

## 🔴 CRITICAL VIOLATIONS (6)

### 1. src/app/api/signup/route.ts (Line 329)
**Severity:** CRITICAL
**Type:** enroller_id_usage

**Current Code:**
```typescript
const { error: memberError } = await serviceClient
  .from('members')
  .insert({
    distributor_id: distributor.id,
    email: distributor.email,
    full_name: `${distributor.first_name} ${distributor.last_name}`,
    enroller_id: enrollerMemberId, // ❌ WRONG - perpetuates deprecated field
    sponsor_id: enrollerMemberId,
    ...
```

**Fix:**
```typescript
const { error: memberError } = await serviceClient
  .from('members')
  .insert({
    distributor_id: distributor.id,
    email: distributor.email,
    full_name: `${distributor.first_name} ${distributor.last_name}`,
    enroller_id: null, // ✅ Deprecated for tech ladder
    sponsor_id: enrollerMemberId, // ✅ Correct enrollment tree field
    ...
```

**Why This Matters:** Every new signup sets `enroller_id`, making developers think it's the correct field to query for enrollment relationships.

---

### 2. src/lib/matrix/level-calculator.ts (Line 8)
**Severity:** CRITICAL
**Type:** enroller_id_usage

**Current Code:**
```typescript
export interface MemberNode {
  member_id: string;
  enroller_id: string | null; // ❌ WRONG field
  [key: string]: unknown;
}
```

**Fix:**
```typescript
export interface MemberNode {
  member_id: string;
  sponsor_id: string | null; // ✅ Correct enrollment tree field
  [key: string]: unknown;
}
```

---

### 3. src/lib/matrix/level-calculator.ts (Line 64)
**Severity:** CRITICAL
**Type:** enroller_id_usage

**Current Code:**
```typescript
// Find all members enrolled by this member
const children = allMembers.filter((m) => m.enroller_id === memberId); // ❌ WRONG
```

**Fix:**
```typescript
// Find all members enrolled by this member
const children = allMembers.filter((m) => m.sponsor_id === memberId); // ✅ CORRECT
```

**Why This Matters:** This function calculates enrollment tree levels for rank qualification. Using the wrong field returns incorrect results.

---

### 4. src/lib/matrix/level-calculator.ts (Line 73)
**Severity:** CRITICAL
**Type:** enroller_id_usage

**Current Code:**
```typescript
// Start with Level 1: Direct enrollees of current user
const directEnrollees = allMembers.filter((m) => m.enroller_id === currentUserId); // ❌ WRONG
```

**Fix:**
```typescript
// Start with Level 1: Direct enrollees of current user
const directEnrollees = allMembers.filter((m) => m.sponsor_id === currentUserId); // ✅ CORRECT
```

---

### 5-6. src/lib/compensation/config.ts & override-resolution.ts
**Severity:** HIGH → CRITICAL (if not fixed)
**Type:** enroller_id_usage (documentation)

**Issue:** Both files reference `org_member.enroller_id` in documentation as the source for L1 enrollment overrides.

**Fix:** Update documentation to clarify:
- `members.enroller_id` = Insurance ladder only (deprecated for tech ladder)
- `distributors.sponsor_id` = Tech ladder enrollment tree (correct)

---

## 🟠 HIGH SEVERITY VIOLATIONS (11)

### 7. src/components/dashboard/Road500Banner.tsx (Lines 38, 45, 50)
**Severity:** HIGH
**Type:** matrix_tree_misuse

**Current Code (Line 38):**
```typescript
// Counting "personal recruits"
const { count } = await serviceClient
  .from('distributors')
  .select('id', { count: 'exact', head: true })
  .eq('matrix_parent_id', me.id); // ❌ WRONG - counting matrix children, not enrollees
```

**Fix:**
```typescript
// Count personal enrollees (enrollment tree)
const { count } = await serviceClient
  .from('distributors')
  .select('id', { count: 'exact', head: true })
  .eq('sponsor_id', me.id); // ✅ CORRECT - counts who you actually enrolled
```

**Why This Matters:** The "Road to 500" recruiting leaderboard shows wrong numbers. It counts matrix placement children (which includes spillover from other people's recruits) instead of actual personal enrollees.

**Impact:** Users see inflated recruit counts if they receive spillover placements.

---

### 8-11. src/components/matrix/HybridMatrixView.tsx & src/app/api/matrix/hybrid/route.ts
**Severity:** HIGH
**Type:** cached_bv

**Current Code:**
```typescript
interface MatrixMember {
  personal_bv_monthly?: number | null; // ❌ Cached/stale
  group_bv_monthly?: number | null;    // ❌ Cached/stale
}

// Filtering active members
const activeMembers = [...level1, ...level2, ...deepLevels].filter(
  m => (m.personal_bv_monthly || 0) > 0 // ❌ Using stale data
).length;
```

**Fix:**
```typescript
// Join with members table
const { data } = await supabase
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (
      personal_credits_monthly,
      team_credits_monthly
    )
  `)
  .eq('id', distributorId);

// Use live data
const activeMembers = [...level1, ...level2, ...deepLevels].filter(
  m => (m.member?.personal_credits_monthly || 0) > 0 // ✅ Live data
).length;
```

**Why This Matters:** Matrix view shows incorrect BV/credit values if cached data is stale.

---

### 12. src/lib/integrations/webhooks/process-sale.ts (Line 162)
**Severity:** MEDIUM → HIGH
**Type:** enroller_id_usage

**Current Code:**
```typescript
const { data: memberData, error: memberError } = await supabase
  .from('members')
  .select('member_id, full_name, enroller_id') // ❌ Why selecting this?
  .eq('distributor_id', replicatedSite.distributor_id)
  .single();
```

**Fix:**
```typescript
const { data: memberData, error: memberError } = await supabase
  .from('members')
  .select('member_id, full_name') // ✅ Removed unused field
  .eq('distributor_id', replicatedSite.distributor_id)
  .single();
```

**Why This Matters:** While `enroller_id` isn't used, its presence suggests it might be needed, perpetuating the wrong field.

---

## 🟡 MEDIUM SEVERITY VIOLATIONS (13)

### 13-25. Admin Hierarchy Components (13 violations)
**Files Affected:**
- src/components/admin/hierarchy/NodeDetailPanel.tsx (4 violations)
- src/components/admin/hierarchy/HierarchyCanvas.tsx (2 violations)
- src/components/admin/hierarchy/MatrixNode.tsx (4 violations)
- src/app/admin/hierarchy/HierarchyCanvasClient.tsx (3 violations)

**Type:** cached_bv

**Pattern:**
```typescript
// Interface definition
interface DistributorNode {
  personal_bv_monthly?: number | null; // ❌ Cached
  group_bv_monthly?: number | null;    // ❌ Cached
}

// Display
<p className="text-xl font-bold text-blue-600">
  {formatCurrency(distributor.personal_bv_monthly)} {/* ❌ Stale */}
</p>
```

**Fix:**
```typescript
// Join with members table
interface DistributorNode {
  member?: {
    personal_credits_monthly: number;
    team_credits_monthly: number;
  };
}

// Display live data
<p className="text-xl font-bold text-blue-600">
  {formatCurrency(distributor.member?.personal_credits_monthly || 0)} {/* ✅ Live */}
</p>
```

**Why This Matters:** Admin sees incorrect BV/credit values when reviewing distributor performance.

---

### 26. src/app/api/admin/distributors/[id]/team-statistics/route.ts (Line 66)
**Severity:** MEDIUM
**Type:** matrix_tree_misuse

**Current Code:**
```typescript
// Endpoint is /team-statistics but queries matrix tree
const { data: matrixChildren, error: matrixError } = await serviceClient
  .from('distributors')
  .select('*')
  .eq('matrix_parent_id', id) // ❌ Matrix tree, not team tree
  .neq('status', 'deleted');
```

**Fix Option 1 (Rename endpoint):**
```typescript
// Rename to /matrix-statistics and keep query as-is
```

**Fix Option 2 (Query enrollment tree):**
```typescript
// Keep name as /team-statistics and query enrollment tree
const { data: teamMembers } = await serviceClient
  .from('distributors')
  .select('*')
  .eq('sponsor_id', id) // ✅ Enrollment tree
  .neq('status', 'deleted');
```

**Why This Matters:** Endpoint name suggests team (enrollment) stats but returns matrix placement stats.

---

## ✅ ALLOWED EXCEPTIONS (6 files using matrix_parent_id correctly)

These files correctly use `matrix_parent_id` for matrix placement visualization:

1. **src/app/api/admin/matrix/tree/route.ts** - Admin matrix tree visualization
2. **src/app/api/distributor/[id]/details/route.ts** - Showing matrix children count
3. **src/app/api/dashboard/matrix-position/route.ts** - Dashboard matrix position
4. **src/app/dashboard/matrix/[id]/page.tsx** - User matrix view
5. **src/lib/matrix/placement-algorithm.ts** - Matrix placement algorithm
6. **src/app/api/admin/prospects/[id]/convert/route.ts** - Matrix placement on conversion

**These are NOT violations** - they're legitimate uses of the matrix placement tree.

---

## 📋 FILES REQUIRING FIXES (17 files, 30 violations)

### CRITICAL Priority (Fix First):
1. ✅ src/lib/compensation/override-calculator.ts - **ALREADY FIXED**
2. ❌ src/app/api/signup/route.ts - Stop setting `enroller_id`
3. ❌ src/lib/matrix/level-calculator.ts - Replace `enroller_id` with `sponsor_id` (3 places)
4. ❌ src/lib/compensation/config.ts - Update documentation
5. ❌ src/lib/compensation/override-resolution.ts - Update documentation

### HIGH Priority:
6. ❌ src/components/dashboard/Road500Banner.tsx - Fix recruiting leaderboard (3 violations)
7. ❌ src/components/matrix/HybridMatrixView.tsx - Join with members table (2 violations)
8. ❌ src/app/api/matrix/hybrid/route.ts - Join with members table (3 violations)
9. ❌ src/lib/integrations/webhooks/process-sale.ts - Remove unused `enroller_id` SELECT

### MEDIUM Priority (Admin UI):
10. ❌ src/components/admin/hierarchy/NodeDetailPanel.tsx (4 violations)
11. ❌ src/components/admin/hierarchy/HierarchyCanvas.tsx (2 violations)
12. ❌ src/components/admin/hierarchy/MatrixNode.tsx (4 violations)
13. ❌ src/app/admin/hierarchy/HierarchyCanvasClient.tsx (3 violations)
14. ❌ src/app/api/admin/distributors/[id]/team-statistics/route.ts (1 violation)

---

## 🔧 RECOMMENDED FIX ORDER

### Phase 1: Stop the Bleeding (CRITICAL - Do First)
1. Fix signup route to stop setting `enroller_id`
2. Fix level-calculator to use `sponsor_id`
3. Update compensation documentation

**Impact:** Prevents new violations from being created

### Phase 2: Fix User-Facing Issues (HIGH)
4. Fix Road500Banner recruiting leaderboard
5. Fix hybrid matrix view to use live credits
6. Remove unused `enroller_id` selections

**Impact:** Users see correct data

### Phase 3: Fix Admin UI (MEDIUM)
7. Update all admin hierarchy components to join with members table

**Impact:** Admin sees correct data

---

## 🎯 TESTING CHECKLIST

After fixing each file, verify:

- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Tests pass: `npm test`
- [ ] Pre-commit hook passes: `git add . && git commit -m "test"`
- [ ] Manual verification: Check affected UI/API endpoints

---

## 📁 QUARANTINE FOLDER

Violating files have been moved to: `_VIOLATIONS_QUARANTINE/`

**DO NOT USE CODE FROM QUARANTINE FOLDER** - These files contain source of truth violations.

To restore a file after fixing:
```bash
mv _VIOLATIONS_QUARANTINE/path/to/file.ts src/path/to/file.ts
```

---

## 🚀 NEXT STEPS

1. **Immediate:** Fix CRITICAL violations (signup, level-calculator, compensation docs)
2. **This Week:** Fix HIGH violations (Road500Banner, hybrid matrix view)
3. **This Month:** Fix MEDIUM violations (admin UI components)
4. **Ongoing:** Run audit script weekly: `npx tsx scripts/audit-enrollment-dependencies.ts`

---

## 📞 QUESTIONS?

See: SOURCE-OF-TRUTH-ENFORCEMENT.md for the iron rules.

**Last Updated:** 2026-03-22
**Next Audit:** Weekly (every Monday)
