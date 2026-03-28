# SECURITY FIX #5: RANK DEPTH ENFORCEMENT
**Date:** 2026-03-27
**Branch:** `feature/security-fixes-mvp`
**Priority:** 🟡 HIGH
**Estimated Time:** 4 hours

---

## 📋 PROBLEM STATEMENT

### The Vulnerability

**Current State:**
- Rank depth enforcement logic EXISTS in `calculateOverride()` function
- Function correctly uses `RANKED_OVERRIDE_SCHEDULES` with 0.0 for unauthorized levels
- **BUT:** Compensation run endpoint (`/api/admin/compensation/run`) has PLACEHOLDER CODE
- Override calculation is just a comment - never actually executed
- No actual override processing happens during monthly runs

**Current Code** (`src/app/api/admin/compensation/run/route.ts:159-172`):
```typescript
// Step 3: Calculate commissions for all sales in period
// Note: In production, this would query orders table and calculate:
// - Waterfall for each sale
// - Seller commission (60% of commission pool)
// - Override commissions (L1-L5 based on rank and enroller rule)
// - Accumulate bonus pool (3.5%) and leadership pool (1.5%)

const commissionsSummary = {
  totalSales: 0,
  totalSellerCommissions: 0,
  totalOverrides: 0,
  totalBonusPool: 0,
  totalLeadershipPool: 0,
};
```

**What's Wrong:**
1. ✅ Depth enforcement logic EXISTS in `calculateOverride()` (correctly implemented)
2. ❌ Compensation run endpoint imports `calculateOverride` but NEVER calls it
3. ❌ Override calculation is placeholder/stub code
4. ❌ No sales are processed, no overrides are calculated
5. ❌ Entire Step 3 is just a comment and empty summary object

**Impact:**
- 🔴 No overrides are being paid (financial loss to distributors)
- 🔴 No commissions are being calculated
- 🔴 System appears to "run" but does nothing
- 🔴 Compensation run is incomplete/non-functional
- 🟡 Rank depth enforcement CAN'T fail because nothing is being calculated

---

## 🏗️ SOLUTION DESIGN

### Approach: Implement Actual Override Calculation in Compensation Run

**Fix Strategy:**
1. Query orders table for sales in the period
2. For each sale, call `calculateWaterfall()` to get commission pool
3. Calculate seller commission (60% of pool)
4. Walk upline matrix tree (L1-L5) calling `calculateOverride()` for each level
5. `calculateOverride()` will enforce rank depth automatically (already has logic)
6. Record all earnings in `earnings_ledger` table
7. Accumulate bonus pool and leadership pool

**Why This Works:**
- ✅ `calculateOverride()` already has depth enforcement
- ✅ No new logic needed - just CALL the existing functions
- ✅ RANKED_OVERRIDE_SCHEDULES has 0.0 for unauthorized levels
- ✅ Function returns $0 with reason if depth not unlocked
- ✅ Just need to integrate into compensation run flow

---

## 📝 IMPLEMENTATION PLAN

### Step 1: Implement Sales Processing

**File:** `src/app/api/admin/compensation/run/route.ts`

**Replace placeholder code (lines 159-172) with:**

```typescript
// Step 3: Calculate commissions for all sales in period
const { data: orders, error: ordersError } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      *,
      product:products (*)
    )
  `)
  .gte('created_at', periodStart)
  .lt('created_at', periodEnd)
  .eq('status', 'completed');

if (ordersError) {
  throw new Error(`Failed to fetch orders: ${ordersError.message}`);
}

let totalSalesCents = 0;
let totalSellerCommissionsCents = 0;
let totalOverridesCents = 0;
let totalBonusPoolCents = 0;
let totalLeadershipPoolCents = 0;

const earningsToInsert = [];

for (const order of orders || []) {
  // Get buyer's member record
  const { data: buyer } = await supabase
    .from('members')
    .select('*, distributor:distributors!members_distributor_id_fkey(*)')
    .eq('member_id', order.member_id)
    .single();

  if (!buyer) continue;

  // Calculate waterfall for each order item
  for (const item of order.order_items) {
    const waterfall = calculateWaterfall({
      productPrice: item.unit_price_cents,
      productBV: item.product.bv,
      quantity: item.quantity,
    });

    totalSalesCents += waterfall.totalRevenue;
    totalBonusPoolCents += waterfall.bonusPoolShare;
    totalLeadershipPoolCents += waterfall.leadershipPoolShare;

    // Seller commission (60% of commission pool)
    const sellerCommissionCents = Math.round(waterfall.commissionPool * 0.60);
    totalSellerCommissionsCents += sellerCommissionCents;

    earningsToInsert.push({
      member_id: buyer.member_id,
      run_id: runId,
      run_date: runDate,
      pay_period_start: periodStart,
      pay_period_end: periodEnd,
      earning_type: 'seller_commission',
      base_amount_cents: sellerCommissionCents,
      final_amount_cents: sellerCommissionCents,
      metadata: {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
      },
    });

    // Calculate overrides (L1-L5)
    const overridePoolCents = Math.round(waterfall.commissionPool * 0.40);

    // L1: Enroller override (30% of pool)
    if (buyer.distributor.sponsor_id) {
      const { data: sponsor } = await supabase
        .from('members')
        .select('*, distributor:distributors!members_distributor_id_fkey(*)')
        .eq('distributor_id', buyer.distributor.sponsor_id)
        .single();

      if (sponsor) {
        const l1Override = calculateOverride(
          {
            memberId: sponsor.member_id,
            techRank: sponsor.tech_rank,
            personalCreditsMonthly: sponsor.personal_credits_monthly,
          },
          {
            sellerMemberId: buyer.member_id,
            saleAmountCents: item.unit_price_cents * item.quantity,
            overridePoolCents,
          },
          true, // isEnroller = true
          1 // level = 1
        );

        if (l1Override.amountCents > 0) {
          totalOverridesCents += l1Override.amountCents;
          earningsToInsert.push({
            member_id: sponsor.member_id,
            run_id: runId,
            run_date: runDate,
            pay_period_start: periodStart,
            pay_period_end: periodEnd,
            earning_type: 'override_commission',
            base_amount_cents: l1Override.amountCents,
            final_amount_cents: l1Override.amountCents,
            metadata: {
              level: 1,
              rule: l1Override.rule,
              seller_member_id: buyer.member_id,
              percentage: l1Override.percentage,
              rank: l1Override.memberTechRank,
            },
          });
        }
      }
    }

    // L2-L5: Matrix overrides
    let currentMatrixParentId = buyer.distributor.matrix_parent_id;
    let level = 2;

    while (currentMatrixParentId && level <= 5) {
      const { data: matrixParent } = await supabase
        .from('members')
        .select('*, distributor:distributors!members_distributor_id_fkey(*)')
        .eq('distributor_id', currentMatrixParentId)
        .single();

      if (!matrixParent) break;

      const override = calculateOverride(
        {
          memberId: matrixParent.member_id,
          techRank: matrixParent.tech_rank,
          personalCreditsMonthly: matrixParent.personal_credits_monthly,
        },
        {
          sellerMemberId: buyer.member_id,
          saleAmountCents: item.unit_price_cents * item.quantity,
          overridePoolCents,
        },
        false, // isEnroller = false
        level
      );

      // calculateOverride() enforces rank depth here!
      // If rank doesn't unlock this level, percentage = 0, amountCents = 0
      if (override.amountCents > 0) {
        totalOverridesCents += override.amountCents;
        earningsToInsert.push({
          member_id: matrixParent.member_id,
          run_id: runId,
          run_date: runDate,
          pay_period_start: periodStart,
          pay_period_end: periodEnd,
          earning_type: 'override_commission',
          base_amount_cents: override.amountCents,
          final_amount_cents: override.amountCents,
          metadata: {
            level,
            rule: override.rule,
            seller_member_id: buyer.member_id,
            percentage: override.percentage,
            rank: override.memberTechRank,
          },
        });
      }

      currentMatrixParentId = matrixParent.distributor.matrix_parent_id;
      level++;
    }
  }
}

// Insert all earnings (if not dry run)
if (!dryRun && earningsToInsert.length > 0) {
  const { error: insertError } = await supabase
    .from('earnings_ledger')
    .insert(earningsToInsert);

  if (insertError) {
    throw new Error(`Failed to insert earnings: ${insertError.message}`);
  }
}

const commissionsSummary = {
  totalSales: totalSalesCents / 100,
  totalSellerCommissions: totalSellerCommissionsCents / 100,
  totalOverrides: totalOverridesCents / 100,
  totalBonusPool: totalBonusPoolCents / 100,
  totalLeadershipPool: totalLeadershipPoolCents / 100,
  earningsCount: earningsToInsert.length,
};
```

---

### Step 2: Update Completion Summary

**Update lines 180-183:**

```typescript
total_amount_cents: totalSalesCents, // Actual total
commissions_calculated: earningsToInsert.length, // Actual count
```

---

## ✅ HOW DEPTH ENFORCEMENT WORKS

**Existing Logic in `calculateOverride()`:**

1. Function receives `level` parameter (1-5)
2. Calls `getOverridePercentage(member.techRank, level)`
3. This looks up `RANKED_OVERRIDE_SCHEDULES[rank][level - 1]`
4. If rank doesn't unlock level → percentage = 0.0
5. Function checks `if (percentage === 0)` → returns $0 with reason
6. Examples:
   - Starter at L2: `RANKED_OVERRIDE_SCHEDULES['starter'][1]` = 0.0 → $0
   - Bronze at L3: `RANKED_OVERRIDE_SCHEDULES['bronze'][2]` = 0.0 → $0
   - Silver at L4: `RANKED_OVERRIDE_SCHEDULES['silver'][3]` = 0.0 → $0

**No Additional Validation Needed:**
- ✅ Depth enforcement already exists
- ✅ Just need to CALL the function
- ✅ Function handles everything correctly
- ✅ Returns $0 automatically for unauthorized levels

---

## 🧪 TESTING CHECKLIST

### Unit Tests

- [ ] Test calculateOverride() with unauthorized levels
  - [ ] Starter at L2 → $0 (depth = 1, max L1)
  - [ ] Bronze at L3 → $0 (depth = 2, max L2)
  - [ ] Silver at L4 → $0 (depth = 3, max L3)
  - [ ] Gold at L5 → $0 (depth = 4, max L4)
- [ ] Test calculateOverride() with authorized levels
  - [ ] Platinum at L5 → > $0 (depth = 5, all levels)
  - [ ] Silver at L3 → > $0 (depth = 3, at max level)

### Integration Tests

- [ ] Create test order with seller
- [ ] Run compensation with dry_run=true
- [ ] Verify overrides calculated
- [ ] Verify rank depth enforced
- [ ] Check earnings_ledger records

### Manual Tests

- [ ] Run compensation for test period
- [ ] Verify no Silver members get L4-L5 overrides
- [ ] Verify no Bronze members get L3+ overrides
- [ ] Verify Platinum members DO get L5 overrides
- [ ] Check earnings metadata for rank/level info

---

## 📊 PERFORMANCE IMPACT

**Current Performance:**
- Placeholder code: 0ms (does nothing)

**After Implementation:**
- Per order: ~50ms (waterfall + upline traversal)
- Per sale item: ~20ms (override calculations)
- 100 orders: ~5 seconds
- 1000 orders: ~50 seconds

**Optimization Notes:**
- Could batch database queries (fetch all members upfront)
- Could cache member data during run
- Current implementation prioritizes correctness over speed
- Acceptable for MVP (monthly run, not real-time)

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: Implement Override Calculation
1. Replace placeholder code with actual implementation
2. Ensure all database queries use correct joins
3. Add error handling for missing members/orders

### Phase 2: Test with Sample Data
1. Create test orders in development
2. Run compensation with dry_run=true
3. Verify earnings calculations
4. Verify rank depth enforcement

### Phase 3: Commit and Document
1. Commit: `fix: implement override calculation with rank depth enforcement`
2. Update progress document (5/5 complete)
3. Note that depth enforcement was already in calculateOverride()

---

## 🎯 SUCCESS CRITERIA

- [ ] Compensation run processes actual orders (not placeholder)
- [ ] calculateOverride() called for each upline level
- [ ] Rank depth automatically enforced via RANKED_OVERRIDE_SCHEDULES
- [ ] Earnings inserted into earnings_ledger table
- [ ] Silver members cannot receive L4-L5 overrides (percentage = 0)
- [ ] Bronze members cannot receive L3+ overrides (percentage = 0)
- [ ] Platinum+ members CAN receive all L1-L5 overrides
- [ ] TypeScript compiles
- [ ] Tests pass
- [ ] Dry run mode works

---

## 🔗 RELATED FILES

**Modified:**
- `src/app/api/admin/compensation/run/route.ts` - Replace placeholder with actual logic

**Used (No Changes Needed):**
- `src/lib/compensation/calculateOverride.ts` - Already has depth enforcement ✅
- `src/lib/compensation/config.ts` - Already has RANKED_OVERRIDE_SCHEDULES ✅
- `src/lib/compensation/waterfall.ts` - Already works ✅

**Tables Used:**
- `orders` - Sales data
- `order_items` - Line items
- `members` - Member credits and ranks
- `distributors` - Upline relationships (sponsor_id, matrix_parent_id)
- `earnings_ledger` - Earnings records
- `products` - Product BV data

---

## 📝 IMPORTANT NOTES

**Key Insight:**
The audit was correct that depth enforcement is "not enforced" - but the reason is NOT that the logic is missing. The logic EXISTS and is CORRECT. The problem is that the compensation run endpoint has **placeholder code** and never actually RUNS the calculation.

**Fix is Simple:**
Just call the existing functions! The depth enforcement will work automatically because `calculateOverride()` already checks `RANKED_OVERRIDE_SCHEDULES` and returns $0 for unauthorized levels.

**No New Validation Needed:**
We don't need to add depth checks. We just need to integrate the existing functions into the compensation run flow.

---

**End of Plan Document**
