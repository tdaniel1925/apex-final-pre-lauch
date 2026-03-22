# SOURCE OF TRUTH ENFORCEMENT SYSTEM

**CRITICAL: READ THIS FIRST AFTER ANY CONVERSATION COMPACTION**

This file contains the MANDATORY rules that MUST be followed for ALL database queries in this codebase.

## 🚨 THE IRON RULES (NON-NEGOTIABLE)

### RULE 1: ENROLLMENT TREE
```typescript
// ✅ ALWAYS DO THIS
const { data } = await supabase
  .from('distributors')
  .select('*')
  .eq('sponsor_id', sponsorId);  // ← ENROLLMENT TREE

// ❌ NEVER DO THIS
const { data } = await supabase
  .from('members')
  .select('*')
  .eq('enroller_id', enrollerId);  // ← WRONG TABLE!
```

**WHY:** `members.enroller_id` is for the insurance system. `distributors.sponsor_id` is the enrollment tree.

---

### RULE 2: MATRIX PLACEMENT
```typescript
// ✅ ALWAYS DO THIS
const { data } = await supabase
  .from('distributors')
  .select('matrix_parent_id, matrix_position, matrix_depth')
  .eq('id', distributorId);

// ❌ NEVER DO THIS
const matrixLevel = getEnrollmentLevel(sponsorId);  // ← WRONG!
// Matrix ≠ Enrollment. These are DIFFERENT trees!
```

**WHY:** Matrix placement is a forced 5×7 binary tree. Enrollment is the sponsor tree. They are SEPARATE.

---

### RULE 3: BV/CREDITS
```typescript
// ✅ ALWAYS DO THIS
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

// ❌ NEVER DO THIS
const { data } = await supabase
  .from('distributors')
  .select('personal_bv_monthly, group_bv_monthly')  // ← CACHED/STALE!
```

**WHY:** BV lives in `members` table. Cached copies in `distributors` may be stale.

---

### RULE 4: USER IDENTITY (NO N+1 QUERIES)
```typescript
// ✅ ALWAYS DO THIS (SINGLE QUERY)
const { data } = await supabase
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (*)
  `)
  .eq('auth_user_id', user.id)
  .single();

// ❌ NEVER DO THIS (N+1 PROBLEM)
const { data: distributor } = await supabase.from('distributors').eq('auth_user_id', user.id).single();
const { data: member } = await supabase.from('members').eq('distributor_id', distributor.id).single();
// Two queries when one would work!
```

---

## 📋 QUICK REFERENCE TABLE

| Need | Correct Query | Wrong Query |
|------|---------------|-------------|
| Get enrollees | `distributors WHERE sponsor_id = X` | `members WHERE enroller_id = X` |
| Get matrix children | `distributors WHERE matrix_parent_id = X` | Derive from enrollment |
| Get BV | JOIN `members.personal_credits_monthly` | Use `distributors.personal_bv_monthly` |
| Count downline | `COUNT(*) FROM distributors WHERE sponsor_id = X` | Use cached `downline_count` |

---

## 🔒 ENFORCEMENT MECHANISMS

### 1. Pre-Commit Hook (Already Installed)
Located at: `.codebakers/pre-commit-hook.ts`

Runs automatically before every commit to check for violations.

### 2. TypeScript Types (Use These)
```typescript
// Import these types from src/lib/types/source-of-truth.ts
import type {
  EnrollmentTreeQuery,
  MatrixPlacementQuery,
  BVQuery
} from '@/lib/types/source-of-truth';

// TypeScript will force you to use the right tables
```

### 3. ESLint Rules (Coming Soon)
Will add custom ESLint rules to catch violations at dev time.

---

## 🛠️ HOW TO FIX VIOLATIONS

### Example: Fixing Enrollment Tree Query

**BEFORE (WRONG):**
```typescript
const { data: team } = await supabase
  .from('members')
  .select('*')
  .eq('enroller_id', memberId);
```

**AFTER (CORRECT):**
```typescript
const { data: team } = await supabase
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (
      member_id,
      tech_rank,
      personal_credits_monthly,
      team_credits_monthly,
      override_qualified
    )
  `)
  .eq('sponsor_id', distributorId)
  .eq('status', 'active');

// Transform to match expected shape if needed
const teamWithMemberData = team?.map(d => ({
  ...d,
  ...d.member,
}));
```

---

## 🎯 THE TWO-TREE SYSTEM (CRITICAL TO UNDERSTAND)

```
ENROLLMENT TREE (sponsor_id):
Apex Vision
├─ Charles Potter
│  ├─ Donna Potter
│  ├─ Brian Rawlston
│  └─ Trent Daniel
└─ Jennifer Fuchs

MATRIX TREE (matrix_parent_id + position):
Apex Vision (Depth 0)
├─ Position 1: Trent Daniel (Depth 1)
├─ Position 2: Jennifer Fuchs (Depth 1)
├─ Position 3: Donna Potter (Depth 1)
│  ├─ Position 1: Brian Rawlston (Depth 2)
│  └─ Position 2: ...
└─ Position 4: Charles Potter (Depth 1)
```

**THESE ARE DIFFERENT STRUCTURES!**

- Enrollment = unlimited width, follows who signed up whom
- Matrix = forced 5 wide, 7 deep, binary spillover structure

**NEVER mix them!**

---

## 🚀 AUTO-FIX SCRIPT

Run this to automatically fix all violations:

```bash
npx tsx scripts/fix-all-source-of-truth-violations.ts
```

---

## 📖 AFTER CONVERSATION COMPACTION

If you see this file after compaction, run:

```bash
npx tsx scripts/audit-enrollment-dependencies.ts
```

If it finds ANY violations, stop and fix them before continuing.

---

## ⚠️ COMPENSATION SYSTEM SPECIAL RULES

The compensation system has TWO types of overrides:

1. **L1 Enrollment Override** - Based on `sponsor_id` (who you personally signed up)
2. **L2-L5 Matrix Override** - Based on `matrix_parent_id` (forced placement)

**NEVER calculate matrix levels from enrollment levels!**

```typescript
// ✅ CORRECT
interface Override {
  type: 'L1_enroller' | 'L2_matrix' | 'L3_matrix' | 'L4_matrix' | 'L5_matrix';
  source_relationship: 'sponsor_id' | 'matrix_parent_id';
  // L1 uses sponsor_id, L2+ uses matrix_parent_id
}

// ❌ WRONG
const matrixLevel = enrollmentLevel + 1;  // NEVER DO THIS!
```

---

## 🎓 EDUCATION: WHY THESE RULES EXIST

### Problem: Charles Potter Shows 0 Enrollees
**Root Cause:** UI queried `members.enroller_id` instead of `distributors.sponsor_id`
**Result:** Wrong count displayed
**Fix:** Changed query to use correct source

### Problem: Commission Calculations Wrong
**Root Cause:** Mixing enrollment tree levels with matrix tree levels
**Result:** People paid incorrectly
**Fix:** Separate L1 (enrollment) from L2-L5 (matrix)

---

## 🔍 AUDIT CHECKLIST (Run This Weekly)

- [ ] Run `npx tsx scripts/audit-enrollment-dependencies.ts`
- [ ] Check for `members.enroller_id` in new code
- [ ] Verify no cached BV fields being used
- [ ] Review compensation calculations
- [ ] Check for N+1 queries (same table queried 4+ times)

---

## 📞 CONTACT

If you're unsure about a query, check this file first. If still unclear:

1. Read `EXECUTIVE-SOURCE-OF-TRUTH-REPORT.md`
2. Run the audit script
3. Ask in #engineering channel

---

**LAST UPDATED:** March 22, 2026
**NEXT REVIEW:** Weekly
