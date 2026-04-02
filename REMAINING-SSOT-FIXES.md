# REMAINING SINGLE SOURCE OF TRUTH FIXES

**Generated:** April 2, 2026
**Status:** TODO LIST FOR COMPLETION
**Priority:** Complete before next commission run

---

## ✅ COMPLETED TODAY

1. **Fixed Active/Inactive Status Display**
   - Added `status` field to team page query
   - Now correctly shows "Active" for all active distributors
   - File: `src/app/dashboard/team/page.tsx` (line 107)

2. **Cleared All Test Data**
   - Reset all volume/credits fields to 0 for all 51 members
   - Verified no test credits remaining in system
   - Script: `clear-test-data.js`

3. **Fixed L1 Override Rate**
   - Changed from 25% to 30% in override-calculator.ts
   - Updated all ranks to use 30% L1 rate
   - File: `src/lib/compensation/override-calculator.ts` (lines 109-115, 179, 184)

4. **Created Comprehensive Audit Report**
   - Document: `SINGLE-SOURCE-OF-TRUTH-AUDIT-REPORT.md`
   - 80+ dashboard pages audited
   - 25+ API routes mapped
   - 16 compensation modules reviewed

5. **Created Override System Clarification**
   - Document: `OVERRIDE-SYSTEM-CLARIFICATION.md`
   - Explains 3 different systems
   - Recommends override-resolution.ts as active system

---

## 🔴 CRITICAL - FIX BEFORE NEXT COMMISSION RUN

### Fix #1: Hardcoded Product Prices in Calculator

**File:** `src/app/api/dashboard/compensation/calculate/route.ts`
**Lines:** 14-21
**Issue:** Product prices hardcoded, doesn't reflect database changes

**Current Code:**
```typescript
const products = [
  { name: 'PulseGuard', memberPriceCents: 5900, retailPriceCents: 7900, memberBV: 18, retailBV: 24 },
  { name: 'PulseFlow', memberPriceCents: 12900, retailPriceCents: 14900, memberBV: 65, retailBV: 75 },
  // ... more hardcoded products
];
```

**Fix:**
```typescript
// Replace hardcoded array with dynamic database query
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Load products from database
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('name, wholesale_price_cents, retail_price_cents, member_credits, retail_credits, slug')
    .eq('is_active', true);

  if (productsError || !products) {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }

  // Transform to match expected format
  const productsList = products.map(p => ({
    name: p.name,
    memberPriceCents: p.wholesale_price_cents,
    retailPriceCents: p.retail_price_cents,
    memberBV: p.member_credits,
    retailBV: p.retail_credits,
    type: p.slug === 'custom-business-center' ? 'business_center' as const : 'standard' as const
  }));

  // Continue with rest of logic...
}
```

**Time Estimate:** 30 minutes
**Priority:** HIGH (calculator shows wrong prices if database changed)

---

### Fix #2: Audit SQL Stored Procedures

**Files:**
- `supabase/migrations/20260221000005_commission_calculation_functions.sql`
- `supabase/migrations/20260221000007_fix_run_monthly_commissions.sql`

**What to Verify:**
1. Does `run_monthly_commissions()` call TypeScript override calculators?
2. OR does it calculate overrides entirely in SQL?
3. If SQL: Does it use `sponsor_id` for L1 (correct) or `matrix_parent_id` (wrong)?
4. If SQL: Does it use 30% L1 rate (correct) or something else?
5. How does it handle the enroller priority rule?

**How to Audit:**
```sql
-- Connect to Supabase database
-- Run:
SELECT pg_get_functiondef('run_monthly_commissions'::regproc);

-- Search for these patterns:
-- 1. sponsor_id (should be present for L1 overrides)
-- 2. matrix_parent_id (should NOT be used for L1 overrides)
-- 3. 0.30 or 30% (L1 override rate)
-- 4. Override calculation logic
```

**Current Status:** SQL procedures calculate **matrix commissions** (separate from overrides). Need to verify if override calculations are done in TypeScript or SQL.

**Action Required:**
1. Connect to production database
2. Review `run_monthly_commissions()` source code
3. Identify where override calculations happen
4. Verify correct tree fields and rates
5. Document findings in `SQL-PROCEDURES-AUDIT.md`

**Time Estimate:** 4-8 hours
**Priority:** CRITICAL (affects all commission payouts)

---

### Fix #3: Determine Active Override System

**Files:**
- `src/lib/compensation/override-calculator.ts` (7-level, now fixed to 30%)
- `src/lib/compensation/override-resolution.ts` (5-level, already 30%)

**What to Do:**
1. Search codebase for imports of either file
2. Check monthly commission run logic
3. Run test calculations with both systems
4. Compare results to verify which is active
5. If override-calculator.ts is active, check if past payouts were correct

**How to Search:**
```bash
# In VS Code or command line:
grep -r "override-calculator" src/
grep -r "override-resolution" src/
grep -r "calculateOverridesForSale" src/
grep -r "calculateAllOverrides" src/
```

**Decision Matrix:**
- If override-calculator.ts is imported → Use that (now fixed to 30%)
- If override-resolution.ts is imported → Use that (already 30%)
- If neither → Override calculations in SQL (need to audit SQL)
- If both → PROBLEM - need to consolidate

**Time Estimate:** 2-4 hours
**Priority:** CRITICAL (need to know which system is paying members)

---

## 🟡 HIGH PRIORITY - FIX THIS WEEK

### Fix #4: Standardize BV/Credits Terminology

**Issue:** Codebase uses both terms inconsistently:
- `personal_bv_monthly` vs `personal_credits_monthly`
- `team_bv_monthly` vs `team_credits_monthly`
- User-facing pages say "credits"
- Admin pages say "BV"

**Recommended Standard:**
- **User-facing:** "Credits" (easier to understand)
- **Internal/Admin:** "BV" (technically accurate)
- **Database:** Keep both fields for backward compatibility, but clarify which is authoritative

**Files to Update:**

1. **Database Documentation**
   - Create `DATABASE-FIELD-GLOSSARY.md`
   - Define each field:
     - `members.personal_credits_monthly` - Live data, updated monthly
     - `members.team_credits_monthly` - Live data, updated monthly
     - `distributors.personal_bv_monthly` - CACHED (may be stale)
     - `distributors.group_bv_monthly` - CACHED (may be stale)

2. **Code Comments**
   - Add comments to all queries using BV/credits fields
   ```typescript
   // Live data from members table (authoritative)
   member:members!members_distributor_id_fkey (
     personal_credits_monthly,  // Live monthly production
     team_credits_monthly       // Live team production
   )
   ```

3. **UI Labels**
   - Dashboard pages: "Credits This Month"
   - Admin pages: "BV (Business Volume)"
   - Both reference same underlying data

**Time Estimate:** 4 hours
**Priority:** HIGH (prevents confusion)

---

### Fix #5: Fix Finance Dashboard Estimates

**File:** `src/app/admin/finance/dashboard/page.tsx`
**Issue:** Shows "Preliminary Commission" = `personal_bv_monthly × 0.6` (60% hardcoded)

**Current Code (approximate):**
```typescript
const preliminaryCommission = personal_bv_monthly * 0.60; // Estimated
```

**Problem:** This is a ROUGH estimate, not actual commission calculation.

**Fix Option 1: Label as Estimate**
```typescript
<div>
  <p className="text-xs text-slate-600">Estimated Commission (Preliminary)</p>
  <p className="text-lg font-semibold">${(personal_bv_monthly * 0.60 / 100).toFixed(2)}</p>
  <p className="text-xs text-slate-500">Based on 60% direct commission estimate</p>
  <p className="text-xs text-slate-500">Actual earnings calculated at month-end</p>
</div>
```

**Fix Option 2: Use Actual Calculation**
```typescript
import { calculateWaterfall } from '@/lib/compensation/waterfall';

// Calculate actual seller commission for this member
const waterfall = calculateWaterfall(personal_bv_monthly * 100, 'standard');
const actualCommission = waterfall.sellerCommissionCents;
```

**Recommendation:** Use Option 1 (label as estimate) for now, implement Option 2 in next sprint.

**Time Estimate:** 2 hours
**Priority:** HIGH (misleading if not labeled)

---

### Fix #6: Create Centralized Query Pattern Library

**File to Create:** `src/lib/data/queries.ts`

**Purpose:** Single place for all common database queries, ensuring consistency.

**Implementation:**
```typescript
// src/lib/data/queries.ts

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Get distributor with live member data
 * ALWAYS use this for current stats - uses members table for authoritative data
 */
export async function getDistributorWithMember(distributorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('distributors')
    .select(`
      *,
      member:members!members_distributor_id_fkey (
        member_id,
        personal_credits_monthly,
        team_credits_monthly,
        tech_rank,
        override_qualified,
        enrollment_date
      )
    `)
    .eq('id', distributorId)
    .single();

  return { data, error };
}

/**
 * Get team members (L1 direct enrollees)
 * Uses sponsor_id (enrollment tree) - CORRECT
 */
export async function getTeamMembers(sponsorId: string) {
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      email,
      slug,
      rep_number,
      status,
      created_at,
      member:members!members_distributor_id_fkey (
        member_id,
        tech_rank,
        personal_credits_monthly,
        enrollment_date,
        override_qualified
      )
    `)
    .eq('sponsor_id', sponsorId)  // Enrollment tree - CORRECT
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get monthly earnings for member
 * Uses earnings_ledger (authoritative)
 */
export async function getMonthlyEarnings(memberId: string, monthYear: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('earnings_ledger')
    .select('*')
    .eq('member_id', memberId)
    .eq('month_year', monthYear)
    .in('status', ['approved', 'paid'])
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get paid orders for member (sales)
 * Only counts payment_status='paid'
 */
export async function getMemberSales(distributorId: string, startDate?: Date) {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total_cents,
      total_bv,
      payment_status,
      created_at,
      customer:customers (
        email,
        first_name,
        last_name
      ),
      items:order_items (
        product_name,
        quantity,
        total_price_cents,
        bv_amount
      )
    `)
    .eq('distributor_id', distributorId)
    .eq('payment_status', 'paid')  // ONLY count paid orders
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  const { data, error } = await query;
  return { data, error };
}
```

**Benefits:**
- All pages use same queries
- Single place to fix issues
- Guaranteed consistency
- Easier testing

**Files to Update After Creating Library:**
1. `src/app/dashboard/page.tsx` - Use `getDistributorWithMember()`
2. `src/app/dashboard/team/page.tsx` - Use `getTeamMembers()`
3. `src/app/dashboard/sales/page.tsx` - Use `getMemberSales()`
4. `src/app/dashboard/commissions/page.tsx` - Use `getMonthlyEarnings()`
5. All other dashboard pages

**Time Estimate:** 1 day (8 hours)
**Priority:** HIGH (prevents future inconsistencies)

---

## 📋 MEDIUM PRIORITY - NEXT SPRINT

### Fix #7: Consolidate Commission Tables

**Current State:** 5 separate commission tables:
- `commissions_retail`
- `commissions_matrix`
- `commissions_matching`
- `commissions_rank_advancement`
- `commissions_infinity_pool`

**Goal:** Consolidate into unified `earnings_ledger`

**Migration Steps:**
1. Create migration to copy data from 5 tables to `earnings_ledger`
2. Add `earning_type` field to distinguish types
3. Update dashboard to query `earnings_ledger` only
4. Test thoroughly with historical data
5. Deprecate old tables (don't delete yet)

**Time Estimate:** 2 days
**Priority:** MEDIUM (improves consistency, not urgent)

---

### Fix #8: Add Data Validation Layer

**Goal:** Prevent data inconsistencies through automated checks

**Implementation:**
1. **Pre-commit Hook** (expand existing)
   - Check for `enroller_id` usage (should be `sponsor_id`)
   - Check for cached BV field usage (should be JOIN with members)
   - Check for mixed tree usage

2. **Monthly Audit Script**
   ```typescript
   // scripts/audit-data-consistency.ts

   async function auditDataConsistency(monthYear: string) {
     // Check: SUM(personal_credits) + SUM(team_credits) = Total BV
     // Check: All override payments sum to ≤ 40% of BV
     // Check: No circular references in enrollment tree
     // Check: All earnings_ledger records have valid member_id
     // Check: All paid orders generated credits
   }
   ```

3. **Real-time Checks**
   - Trigger after commission run
   - Alert if totals don't match
   - Log discrepancies for review

**Time Estimate:** 1 day
**Priority:** MEDIUM (nice-to-have, not urgent)

---

### Fix #9: Add Caching Visibility

**Goal:** If fields are cached, show users when last updated

**Implementation:**
```typescript
// Add to dashboard displays
{memberData.lastCalculatedAt && (
  <p className="text-xs text-slate-500">
    Last updated: {formatDistanceToNow(new Date(memberData.lastCalculatedAt))} ago
  </p>
)}
```

**Database Changes:**
```sql
-- Add timestamp to members table
ALTER TABLE members ADD COLUMN credits_last_calculated_at TIMESTAMPTZ;

-- Update after each commission run
UPDATE members SET credits_last_calculated_at = NOW();
```

**Time Estimate:** 2 hours
**Priority:** MEDIUM (transparency for users)

---

## 📝 DOCUMENTATION TASKS

### Doc #1: Update APEX_COMP_ENGINE_SPEC_FINAL.md

**What to Add:**
- Section on which override system is active
- Clarify 30% L1 rate (not 25%)
- Document enroller priority rule
- Add examples of override calculations

**Time Estimate:** 2 hours
**Priority:** HIGH (spec should match implementation)

---

### Doc #2: Create SQL-PROCEDURES-AUDIT.md

**After auditing SQL procedures, document:**
- What `run_monthly_commissions()` actually does
- Which tree fields it uses
- What override rates it uses
- Any discrepancies with TypeScript code

**Time Estimate:** 1 hour (after audit complete)
**Priority:** HIGH (critical documentation)

---

### Doc #3: Create COMMISSION-RUN-PLAYBOOK.md

**Contents:**
- Pre-run checklist
- How to trigger commission run
- What to verify after run
- Troubleshooting common issues
- Rollback procedure

**Time Estimate:** 2 hours
**Priority:** HIGH (operational safety)

---

## ⏱️ TIME ESTIMATES SUMMARY

| Task | Priority | Time Estimate | When |
|------|----------|---------------|------|
| Fix hardcoded product prices | HIGH | 30 min | This week |
| Audit SQL procedures | CRITICAL | 4-8 hours | This week |
| Determine active override system | CRITICAL | 2-4 hours | This week |
| Standardize BV/Credits terminology | HIGH | 4 hours | This week |
| Fix finance dashboard estimates | HIGH | 2 hours | This week |
| Create query pattern library | HIGH | 1 day | This week |
| Consolidate commission tables | MEDIUM | 2 days | Next sprint |
| Add data validation layer | MEDIUM | 1 day | Next sprint |
| Add caching visibility | MEDIUM | 2 hours | Next sprint |

**TOTAL THIS WEEK:** 16-22 hours
**TOTAL NEXT SPRINT:** 3 days

---

## 🎯 RECOMMENDED EXECUTION ORDER

### Day 1 (4 hours):
1. ✅ Fix hardcoded product prices (30 min)
2. ✅ Determine active override system (2-4 hours)
3. ✅ Document findings

### Day 2 (8 hours):
1. ✅ Audit SQL stored procedures (4-8 hours)
2. ✅ Create SQL-PROCEDURES-AUDIT.md
3. ✅ Verify override rates in SQL

### Day 3 (6 hours):
1. ✅ Standardize BV/Credits terminology (4 hours)
2. ✅ Fix finance dashboard estimates (2 hours)

### Day 4 (8 hours):
1. ✅ Create query pattern library (8 hours)
2. ✅ Update 5-10 pages to use library

### Day 5 (2 hours):
1. ✅ Update APEX_COMP_ENGINE_SPEC_FINAL.md
2. ✅ Create COMMISSION-RUN-PLAYBOOK.md
3. ✅ Review all changes
4. ✅ Test on staging environment

---

## 🚨 BEFORE NEXT COMMISSION RUN

**MANDATORY CHECKLIST:**

- [ ] L1 override rate = 30% in all systems
- [ ] SQL procedures audited and verified
- [ ] Active override system identified
- [ ] Test calculations match spec
- [ ] All test data cleared
- [ ] Product prices reflect database
- [ ] Finance estimates labeled correctly
- [ ] Query patterns use correct trees
- [ ] Documentation updated

**DO NOT run commission calculations until all critical items complete!**

---

**Document Status:** ACTIVE TODO LIST
**Last Updated:** April 2, 2026
**Owner:** Development Team
**Review With:** Trent Daniel (tdaniel@botmakers.ai)