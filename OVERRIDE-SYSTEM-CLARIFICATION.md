# OVERRIDE SYSTEM CLARIFICATION

**Generated:** April 2, 2026
**Status:** PRODUCTION REFERENCE
**Critical:** Read before any compensation changes

---

## EXECUTIVE SUMMARY

Your codebase has **TWO override calculation systems** with different purposes:

1. **override-calculator.ts** - 7-Level Matrix/Enrollment Hybrid (LEGACY - May not be active)
2. **override-resolution.ts** - 5-Level Enrollment/Matrix System (CURRENT - Per APEX_COMP_ENGINE_SPEC_FINAL.md)
3. **SQL Stored Procedures** - Separate Matrix Commission System (NOT overrides)

**CRITICAL FIX APPLIED:** Changed L1 override rate from 25% to 30% in override-calculator.ts to match spec.

---

## SYSTEM 1: override-calculator.ts (7-LEVEL SYSTEM)

**File:** `src/lib/compensation/override-calculator.ts`
**Status:** LEGACY (may not be actively used)
**Structure:** 7 levels (L1-L7)
**L1 Rate:** ~~25%~~ → **30% (FIXED TODAY)**

### How It Works:
```typescript
// Dual-tree approach:
// 1. Check sponsor_id (enrollment tree) → Pay 30% L1
// 2. Walk matrix_parent_id (matrix tree) → Pay L2-L7 by rank
```

### Override Schedule:
```
Starter:  L1: 30%, L2-L7: none
Bronze:   L1: 30%, L2: 20%, L3-L7: none
Silver:   L1: 30%, L2: 20%, L3: 18%, L4-L7: none
Gold:     L1: 30%, L2: 20%, L3: 18%, L4: 15%, L5-L7: none
Platinum: L1: 30%, L2: 20%, L3: 18%, L4: 15%, L5: 10%, L6-L7: none
Ruby:     L1: 30%, L2: 20%, L3: 18%, L4: 15%, L5: 10%, L6: 7%, L7: none
Diamond:  L1: 30%, L2: 20%, L3: 18%, L4: 15%, L5: 10%, L6: 7%, L7: 5%
```

### Key Functions:
- `calculateOverridesForSale()` - Main calculation
- `calculateOverridesForSales()` - Batch calculation
- `checkOverrideQualification()` - 50 BV minimum check

### Usage:
```typescript
import { calculateOverridesForSale } from '@/lib/compensation/override-calculator';

const result = await calculateOverridesForSale(sale, sellerMember);
// Returns: { total_paid, payments[], unpaid_amount }
```

---

## SYSTEM 2: override-resolution.ts (5-LEVEL SYSTEM)

**File:** `src/lib/compensation/override-resolution.ts`
**Status:** CURRENT (per APEX_COMP_ENGINE_SPEC_FINAL.md)
**Structure:** 5 levels (L1-L5)
**L1 Rate:** **30%** ✅ CORRECT

### How It Works:
```typescript
// Enroller Rule Priority:
// IF member is seller's enroller (sponsor_id):
//   → ALWAYS 30% of override pool
//   → Regardless of matrix position
// ELSE (positional/matrix):
//   → Use rank-based override schedule (L2-L5)
```

### Override Schedule (from config.ts):
```
Starter:  L1: 30% (if enroller), L2-L5: none
Bronze:   L1: 30%, L2: 20%, L3-L5: none
Silver:   L1: 30%, L2: 20%, L3: 15%, L4-L5: none
Gold:     L1: 30%, L2: 20%, L3: 15%, L4: 10%, L5: none
Platinum: L1: 30%, L2: 20%, L3: 15%, L4: 10%, L5: 10%
Ruby:     Same as Platinum
Diamond:  Same as Platinum
Crown:    Same as Platinum
Elite:    Same as Platinum
```

### Key Functions:
- `calculateOverride()` - Single member override
- `calculateAllOverrides()` - All upline overrides
- `validateOverrides()` - Ensure total ≤ override pool
- `isOverrideQualified()` - 50 credit minimum check

### Usage:
```typescript
import { calculateAllOverrides } from '@/lib/compensation/override-resolution';

const results = calculateAllOverrides(sale, uplineMembers, enrollerId);
// Returns: OverrideResult[] with status, amounts, levels
```

---

## SYSTEM 3: SQL Stored Procedures (DIFFERENT PURPOSE)

**Files:**
- `supabase/migrations/20260221000005_commission_calculation_functions.sql`
- `supabase/migrations/20260221000007_fix_run_monthly_commissions.sql`

**Status:** ACTIVE (monthly commission run)
**Purpose:** Matrix commissions (NOT overrides)
**Structure:** 7-level matrix positions

### What It Does:
```sql
-- Calculates MATRIX COMMISSIONS based on depth
-- This is NOT the same as override commissions
-- Matrix commissions = earnings from matrix positions (separate from overrides)

get_matrix_rate(rank, level):
  Associate: L1: 5%, L2: 3%, L3: 2%
  Bronze:    L1: 6%, L2: 4%, L3: 3%, L4: 2%
  Silver:    L1: 7%, L2: 5%, L3: 3%, L4: 2%, L5: 1%
  ...
```

**IMPORTANT:** These are **matrix commissions**, not **enrollment overrides**. They serve a different purpose:
- **Matrix commissions:** Based on your position in the forced 5×7 matrix
- **Enrollment overrides:** Based on who you enrolled (sponsor_id) and rank

---

## WHICH SYSTEM SHOULD BE USED?

### Recommendation: Use `override-resolution.ts` (System 2)

**Reasons:**
1. ✅ Aligns with APEX_COMP_ENGINE_SPEC_FINAL.md Section 5
2. ✅ Uses correct 30% L1 enroller rate
3. ✅ Implements enroller priority rule correctly
4. ✅ 5-level system matches spec
5. ✅ Cleaner separation of concerns

### Migration Path:

**If using override-calculator.ts currently:**
1. Test both systems side-by-side on sample sales
2. Verify override-resolution.ts produces correct amounts
3. Update monthly commission run to use override-resolution.ts
4. Deprecate override-calculator.ts
5. Archive or delete override-calculator.ts after migration

**If NOT using either currently:**
- Commission system may be running entirely in SQL (System 3)
- Need to verify with `run_monthly_commissions()` actual behavior
- May need to implement TypeScript wrapper for SQL procedures

---

## CRITICAL FIXES APPLIED TODAY

### Fix #1: L1 Override Rate (override-calculator.ts)
```diff
- L1 rate: 0.25 (25%)  ❌ WRONG
+ L1 rate: 0.30 (30%)  ✅ CORRECT
```

**Impact:** Members were potentially underpaid 5% on L1 overrides.

**Files Changed:**
- Line 109: `starter: [0.30, ...]` (was 0.25)
- Line 110-115: All ranks updated to 0.30
- Line 179: `const amount = overridePool * 0.30` (was 0.25)
- Line 184: `override_rate: 0.30` (was 0.25)

**Action Required:**
- If this system is active, recalculate past overrides (January-March 2026)
- Determine back-pay owed to sponsors

---

## TESTING CHECKLIST

Before next commission run:

### Test Case 1: Enroller Override
```typescript
// Given: John enrolls Mary (john = mary.sponsor_id)
// When: Mary makes a $100 sale (BV = $46.06)
// Expected: John gets 30% of override pool (40% of BV)
//   Override pool = $46.06 × 0.40 = $18.42
//   John gets: $18.42 × 0.30 = $5.53 ✅
```

### Test Case 2: Matrix Override
```typescript
// Given: Sarah is L2 above Mary in matrix (not enroller)
// When: Mary makes a $100 sale (BV = $46.06)
// Expected: Sarah gets override based on her rank
//   If Sarah is Bronze: L2 rate = 20%
//   Override pool = $18.42
//   Sarah gets: $18.42 × 0.20 = $3.68 ✅
```

### Test Case 3: Enroller Priority
```typescript
// Given: John enrolls Mary AND is also L2 in matrix above Mary
// When: Mary makes a $100 sale
// Expected: John gets L1 enroller (30%), NOT L2 matrix (20%)
//   John gets: $5.53 (no double-dipping) ✅
```

---

## SQL PROCEDURE AUDIT NEEDED

**Status:** NOT COMPLETED

**Files to Audit:**
- `supabase/migrations/20260221000005_commission_calculation_functions.sql`

**What to Check:**
1. Does `run_monthly_commissions()` use override-calculator.ts or override-resolution.ts?
2. OR does it calculate overrides entirely in SQL?
3. If SQL: Does it use sponsor_id for L1 (correct) or matrix_parent_id (wrong)?
4. If SQL: Does it use 30% L1 rate (correct) or 25% (wrong)?
5. How does it handle the enroller priority rule?

**How to Audit:**
```sql
-- Check what run_monthly_commissions actually does
SELECT pg_get_functiondef('run_monthly_commissions'::regproc);

-- Look for override calculation logic
-- Search for: sponsor_id, override, 0.30, 0.25
```

---

## RECOMMENDATION FOR NEXT STEPS

### Immediate (Today):
1. ✅ Fix L1 rate to 30% (DONE)
2. ✅ Document which systems exist (DONE - this doc)
3. 🔲 Determine which system is actually active in production
4. 🔲 Run test calculations with both systems

### This Week:
1. 🔲 Audit SQL stored procedures for override logic
2. 🔲 Verify monthly commission run uses correct system
3. 🔲 Test override calculations on sample data
4. 🔲 If override-calculator.ts is active, calculate back-pay owed

### Next Sprint:
1. 🔲 Consolidate to single override system (override-resolution.ts)
2. 🔲 Deprecate override-calculator.ts
3. 🔲 Add integration tests for override calculations
4. 🔲 Document override system in APEX_COMP_ENGINE_SPEC_FINAL.md

---

## CONTACT & REFERENCES

**Documents:**
- Spec: `APEX_COMP_ENGINE_SPEC_FINAL.md` Section 5
- Config: `src/lib/compensation/config.ts`
- Trees: `SINGLE-SOURCE-OF-TRUTH.md`

**Key Personnel:**
- Review with: Trent Daniel (tdaniel@botmakers.ai)
- Approval required: Before changing active system

**Last Updated:** April 2, 2026
**Next Review:** Before next commission run (May 1, 2026)