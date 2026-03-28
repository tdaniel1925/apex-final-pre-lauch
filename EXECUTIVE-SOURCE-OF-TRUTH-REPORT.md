# Executive Source of Truth Audit Report

**Date:** March 22, 2026
**Auditor:** AI Code Analysis
**Scope:** Entire codebase (src/**)

---

## Executive Summary

I conducted a comprehensive deep dive audit of your entire codebase to identify **source of truth violations** - places where data comes from multiple conflicting sources instead of a single authoritative location.

**Total Issues Found: 62**

### Severity Distribution:
- 🔴 **CRITICAL:** 1 issue (must fix immediately)
- 🟠 **HIGH:** 9 issues (significant impact, fix soon)
- 🟡 **MEDIUM:** 52 issues (performance/maintenance concerns)
- 🔵 **LOW:** 0 issues

---

## Top 5 Critical/High Priority Issues

### 1. 🔴 CRITICAL: Enrollment Tree Using Wrong Source
**File:** `src/app/dashboard/team/page.tsx:119`

**Problem:** Page is querying `members.enroller_id` for enrollment tree data
**Correct Source:** `distributors.sponsor_id`
**Impact:** Enrollment counts will be wrong, team page shows incorrect data

**This is the same issue we just fixed in 3 other files!**

---

### 2. 🟠 HIGH: Compensation System Using Wrong Tree (7 instances)
**Files:** `src/lib/compensation/override-resolution.ts`, `override-calculator.ts`

**Problem:** Compensation calculations are mixing enrollment tree with matrix placement
**Current:** Deriving matrix levels from `enroller_id`
**Correct:** Use `distributors.matrix_parent_id + matrix_position`

**Impact:** **Commission calculations will be WRONG** - people may get paid incorrectly

**Example Code:**
```typescript
// WRONG - mixing enrollment with matrix
level: isEnroller ? 1 : (matrixLevel ?? 0),

// This traverses the matrix/enroller tree (WRONG - these are separate!)
const matrixLevel = i + 1; // L1, L2, L3, L4, L5
```

---

### 3. 🟠 HIGH: Cached BV Fields (2 instances)
**File:** `src/app/api/admin/matrix/tree/route.ts:25-26`

**Problem:** Using `distributors.personal_bv_monthly` and `group_bv_monthly` (cached fields)
**Correct:** Join to `members.personal_credits_monthly`

**Impact:** Stale BV data if members table updates but distributors doesn't sync

---

## Issue Categories Breakdown

### 1. **Enrollment Tree Violations** (1 CRITICAL)
The enrollment tree (sponsor relationships) should ALWAYS come from `distributors.sponsor_id`.

**Files Still Using Wrong Source:**
- `src/app/dashboard/team/page.tsx` - Using `members.enroller_id` ❌

---

### 2. **Matrix Placement Violations** (7 HIGH)
Matrix placement is **SEPARATE** from enrollment tree. Never derive one from the other.

**Correct:** `distributors.matrix_parent_id + matrix_position`
**Wrong:** Calculating from `enroller_id` or enrollment levels

**Affected Files:**
- `src/lib/compensation/override-resolution.ts` (6 instances)
- `src/lib/compensation/override-calculator.ts` (1 instance)

**Why This Matters:**
- Enrollment tree = who signed up under whom (sponsor relationship)
- Matrix placement = forced 5×7 binary structure for commissions
- **These are DIFFERENT structures!** Using one to calculate the other = wrong commissions

---

### 3. **Cached/Stale Data** (4 MEDIUM)
Using cached count fields that may not be synchronized.

**Examples:**
- `downline_count` field (no trigger to update)
- `l1_count` returned from API (computed on-demand, good!)
- `personal_bv_monthly` in distributors (should join to members)

**Current State:** The `l1_count` we fixed earlier is **computed on-demand** (good!), but the type definitions suggest there may be cached versions elsewhere.

---

### 4. **N+1 Query Problems** (48 MEDIUM)
Many files query the same table 4-15 times instead of using JOINs.

**Worst Offenders:**
- `src/lib/admin/matrix-manager.ts` - 15 queries to `distributors`
- `src/lib/admin/distributor-service.ts` - 11 queries to `distributors`
- `src/lib/smartoffice/sync-service.ts` - 10 queries to `smartoffice_agents`
- `src/app/api/signup/route.ts` - 10 queries to `distributors`
- `src/lib/compensation/_OLD_BACKUP/cab-state-machine.ts` - 9 queries to `cab_records`

**Impact:** Poor performance, slower page loads, higher database costs

**Note:** Many of these are in `_OLD_BACKUP` folders and may not be in use.

---

## Source of Truth Rules (Single Reference)

| Data Type | ✅ Correct Source | ❌ Wrong Sources |
|-----------|------------------|------------------|
| **Enrollment Tree** | `distributors.sponsor_id` | `members.enroller_id`, cached stats |
| **Matrix Placement** | `distributors.matrix_parent_id + matrix_position` | Derived from enrollment, cached |
| **Matrix vs Enrollment** | **SEPARATE SYSTEMS** | Never calculate one from the other |
| **User Identity** | `distributors.auth_user_id` → `auth.users.id` | Multiple separate lookups |
| **Rep Numbers** | `distributors.rep_number` | `members.rep_number` (may be duplicate) |
| **BV/Credits** | `members.personal_credits_monthly` (with JOIN) | Cached in `distributors` table |
| **Downline Counts** | `COUNT(distributors.sponsor_id)` (computed) | Cached count fields without triggers |

---

## Why This Matters

### **Enrollment Tree (Sponsor Relationships):**
```
Apex Vision (Rep 0)
├─ Charles Potter
│  ├─ Donna Potter
│  ├─ Brian Rawlston
│  ├─ Trent Daniel
│  ├─ Dessiah Daniel
│  ├─ Sella Daniel
│  └─ Jennifer Fuchs
```
**Source:** `distributors.sponsor_id` ← **THIS IS THE TRUTH**

### **Matrix Placement (5×7 Forced Binary):**
```
Apex Vision (Depth 0)
├─ Position 1: ???
├─ Position 2: ???
├─ Position 3: Donna Potter
├─ Position 4: ???
└─ Position 5: ???
    └─ ... (children continue to depth 7)
```
**Source:** `distributors.matrix_parent_id + matrix_position` ← **THIS IS THE TRUTH**

**CRITICAL:** These are **DIFFERENT TREES**. Mixing them = wrong commissions!

---

## Immediate Action Items

### **Priority 1 - FIX NOW:**

1. **Fix remaining enrollment tree violation**
   - File: `src/app/dashboard/team/page.tsx`
   - Change: Query `distributors.sponsor_id` instead of `members.enroller_id`

2. **Fix compensation calculations**
   - Files: `src/lib/compensation/override-*.ts`
   - Change: Use `distributors.matrix_parent_id` for matrix levels, **NOT enrollment tree**
   - Impact: Commissions will be calculated correctly

### **Priority 2 - Fix This Week:**

3. **Remove cached BV fields from matrix tree API**
   - File: `src/app/api/admin/matrix/tree/route.ts`
   - Change: JOIN to `members` table instead of using cached `personal_bv_monthly`

### **Priority 3 - Optimize Performance:**

4. **Refactor N+1 queries** (48 files)
   - Focus on: `matrix-manager.ts`, `distributor-service.ts`, `signup/route.ts`
   - Change: Use proper JOINs instead of multiple queries

---

## Database Schema Clarity

Based on this audit, here's the **definitive schema relationship**:

```typescript
// SINGLE SOURCES OF TRUTH

distributors {
  id: string;                    // ← PRIMARY KEY
  auth_user_id: string;          // ← Links to auth.users.id
  sponsor_id: string;            // ← ENROLLMENT TREE (who signed them up)
  matrix_parent_id: string;      // ← MATRIX PLACEMENT (forced binary)
  matrix_position: number;       // ← 1-5 position under parent
  matrix_depth: number;          // ← 0-7 levels deep
  rep_number: string;            // ← Official rep number
  // DO NOT cache BV here - join to members!
}

members {
  member_id: string;             // ← PRIMARY KEY
  distributor_id: string;        // ← Links to distributors.id
  enroller_id: string;           // ← INSURANCE SYSTEM ONLY (not enrollment tree!)
  personal_credits_monthly: number;  // ← TRUTH for BV
  team_credits_monthly: number;      // ← TRUTH for team BV
  tech_rank: string;             // ← TRUTH for rank
  override_qualified: boolean;   // ← TRUTH for qualification
}
```

**Key Points:**
- `distributors.sponsor_id` = enrollment tree ✅
- `members.enroller_id` = insurance enrollment (different!) ⚠️
- **Never mix these two!**

---

## Recommendations

### **Immediate (This Week):**
1. Fix the 1 CRITICAL enrollment tree issue
2. Fix the 7 HIGH compensation calculation issues
3. Review and test commission calculations thoroughly

### **Short Term (This Month):**
4. Remove cached BV fields or add database triggers to sync them
5. Refactor top 5 worst N+1 query files

### **Long Term:**
6. Create database views for common JOINs
7. Add database constraints to prevent wrong foreign keys
8. Document the two-tree system (enrollment vs matrix) for all developers

---

## Files Generated

1. **SOURCE-OF-TRUTH-AUDIT-SUMMARY.md** - Full detailed breakdown (967 lines)
2. **SOURCE-OF-TRUTH-AUDIT-REPORT.json** - Machine-readable report
3. **EXECUTIVE-SOURCE-OF-TRUTH-REPORT.md** - This summary

---

## Conclusion

The good news: We've already fixed 3 of the 4 enrollment tree violations. The remaining issues are:

1. **1 critical** - Team page using wrong source (easy fix)
2. **7 high** - Compensation mixing enrollment with matrix (requires careful refactoring)
3. **52 medium** - Performance optimizations (can be done gradually)

**The enrollment tree issue we just fixed (Charles Potter showing 0 enrollees) was exactly this type of violation. You now have a complete map of all similar issues across the entire codebase.**
