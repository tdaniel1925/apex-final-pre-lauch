# 🔍 Commission System Audit - Option B (Monthly Batch)

**Date:** 2026-04-01
**Decision:** Use Monthly Commission Run with Real-Time Volume Updates

---

## ✅ WHAT YOU ALREADY HAVE (Implemented & Working)

### 1. Override Qualification Checks ✅

**File:** `src/lib/compliance/retail-validation.ts`

**Function:** `checkOverrideQualificationWithRetail()`

**Checks:**
- ✅ **50 PV Minimum** - Member must have 50+ personal volume
- ✅ **70% Retail Compliance** - At least 70% of BV from retail customers (not distributors)
- ✅ **Combined Check** - Both requirements must pass

**Code:**
```typescript
export async function checkOverrideQualificationWithRetail(
  distributorId: string
): Promise<{
  qualified: boolean;
  reason: string;
  bv_check: { passed: boolean; bv: number };
  retail_check: { passed: boolean; percentage: number };
}>
```

**Example Results:**
```typescript
// QUALIFIED
{
  qualified: true,
  reason: 'Qualified: BV ≥50 and retail ≥70%',
  bv_check: { passed: true, bv: 150 },
  retail_check: { passed: true, percentage: 75.5 }
}

// NOT QUALIFIED - Low BV
{
  qualified: false,
  reason: 'BV too low: 45 < 50 required',
  bv_check: { passed: false, bv: 45 },
  retail_check: { passed: true, percentage: 80 }
}

// NOT QUALIFIED - Low Retail %
{
  qualified: false,
  reason: 'Retail compliance: 65.0% < 70% required',
  bv_check: { passed: true, bv: 100 },
  retail_check: { passed: false, percentage: 65 }
}
```

---

### 2. Rank Evaluation System ✅

**File:** `src/lib/compensation/rank.ts`

**Function:** `evaluateTechRank()`

**Checks:**
- ✅ **Personal Volume (PV)** - Must meet rank threshold
- ✅ **Group Volume (GV)** - Must meet rank threshold
- ✅ **Downline Requirements** - Must have ranked personally-sponsored members
- ✅ **Grace Period** - 1 month below requirements before demotion
- ✅ **Rank Lock** - 3 month protection for new reps
- ✅ **Promotions Next Month** - Takes effect on 1st of next month

**Rank Requirements:**

| Rank | Personal PV | Group GV | Downline Requirement |
|------|-------------|----------|----------------------|
| Starter | $0 | $0 | None |
| Bronze | $150 | $300 | None |
| Silver | $500 | $1,500 | None |
| Gold | $1,200 | $5,000 | 1 Bronze (sponsored) |
| Platinum | $2,500 | $15,000 | 2 Silvers (sponsored) |
| Ruby | $4,000 | $30,000 | 2 Golds (sponsored) |
| Diamond | $5,000 | $50,000 | 3 Golds OR 2 Plat |
| Crown | $6,000 | $75,000 | 2 Plat + 1 Gold |
| Elite | $8,000 | $120,000 | 3 Plat OR 2 Diamond |

---

### 3. Override Calculator (L1-L7) ✅

**File:** `src/lib/compensation/override-calculator.ts`

**Function:** `calculateOverridesForSale()`

**Features:**
- ✅ **Dual-Tree System**
  - L1 Override: Uses enrollment tree (`sponsor_id`) - 30% always
  - L2-L7 Overrides: Use matrix tree (`matrix_parent_id`) - Varies by rank
- ✅ **Rank-Based Rates** - Uses `paying_rank` (not `tech_rank`)
- ✅ **Qualification Check** - Calls `checkOverrideQualificationWithRetail()`
- ✅ **Compression** - Skips unqualified upline, moves to next
- ✅ **No Double-Dipping** - Each upline paid once per sale

**Override Schedules:**

| Rank | L1 | L2 | L3 | L4 | L5 | L6 | L7 |
|------|----|----|----|----|----|----|-----|
| Starter | 25% | 0% | 0% | 0% | 0% | 0% | 0% |
| Bronze | 25% | 20% | 0% | 0% | 0% | 0% | 0% |
| Silver | 25% | 20% | 18% | 0% | 0% | 0% | 0% |
| Gold | 25% | 20% | 18% | 15% | 0% | 0% | 0% |
| Platinum | 25% | 20% | 18% | 15% | 10% | 0% | 0% |
| Ruby | 25% | 20% | 18% | 15% | 10% | 7% | 0% |
| Diamond | 25% | 20% | 18% | 15% | 10% | 7% | 5% |

**Code Example:**
```typescript
const result = await calculateOverridesForSale(sale, sellerMember);

// Returns:
{
  total_paid: 92.50,
  payments: [
    {
      upline_member_id: "abc123",
      upline_member_name: "Mike Johnson",
      override_type: "L1_enrollment",
      override_rate: 0.25,
      override_amount: 27.87,
      bv: 499
    },
    {
      upline_member_id: "def456",
      upline_member_name: "Sarah Smith",
      override_type: "L2_matrix",
      override_rate: 0.20,
      override_amount: 18.58,
      bv: 499
    }
    // ... L3-L7 as applicable
  ],
  unpaid_amount: 0
}
```

---

### 4. Monthly Commission Run Engine ✅

**File:** `src/lib/commission-engine/monthly-run.ts`

**Function:** `executeMonthlyCommissionRun()`

**Process:**
1. ✅ **Fetch All Sales** - Get all transactions for the month
2. ✅ **Calculate Waterfall** - For each sale (BotMakers, Apex, pools, etc.)
3. ✅ **Calculate Overrides** - Calls `calculateOverridesForSale()` for each
4. ✅ **Create Commission Entries** - Writes to `earnings_ledger` table
5. ✅ **Handle Breakage** - Unpaid override pool goes to Apex
6. ✅ **Rank Bonuses** - One-time payments for new rank achievements
7. ✅ **Audit Trail** - Complete logging of all calculations

**Usage:**
```typescript
const result = await executeMonthlyCommissionRun({
  month: '2026-04',
  dryRun: false
});

// Returns:
{
  run_id: 'RUN-2026-04',
  month: '2026-04',
  transactions_processed: 156,
  total_sales_amount: 78500.00,
  total_bv_amount: 78500,
  total_seller_commissions: 21903.00,
  total_override_commissions: 14602.00,
  total_rank_bonuses: 2500.00,
  total_bonus_pool: 2747.50,
  total_leadership_pool: 1177.50,
  breakage_amount: 3420.00,
  distributors_paid: 42,
  status: 'completed'
}
```

---

## ❌ WHAT NEEDS TO BE FIXED

### 1. Real-Time GV Propagation ❌ MISSING

**Current State:**
- Webhook updates seller's PV only
- Upline GV stays at 0 until monthly run

**What's Needed:**
- When sale happens, propagate volume up the sponsorship tree
- Update `members.team_credits_monthly` for all upline
- Update in real-time so dashboards show live data

**Example:**
```
Sale: Sarah sells $499 PulseCommand

UPDATE needed:
1. Sarah's PV: +$499 ✅ (already done)
2. Mike's GV (Sarah's sponsor): +$499 ❌ (missing)
3. Jennifer's GV (Mike's sponsor): +$499 ❌ (missing)
4. Tom's GV (Jennifer's sponsor): +$499 ❌ (missing)
... up to root of tree
```

**File to Create:**
`src/lib/compensation/gv-propagation.ts`

**Function Needed:**
```typescript
export async function propagateGroupVolume(
  sellerId: string,
  bvAmount: number
): Promise<void> {
  // 1. Get seller's sponsor_id
  // 2. Walk up sponsor_id tree to root
  // 3. Update team_credits_monthly for each upline
  // 4. Stop at root (sponsor_id = null)
}
```

---

### 2. Webhook Integration ❌ INCOMPLETE

**Current State:**
- Webhook creates L1 override for retail sales only
- Webhook does NOT call override calculator
- Back office sales get NO commission entries created

**What's Needed:**
- Remove manual override calculation from webhook
- Keep it simple: Just update PV and GV
- Let monthly commission run handle ALL commission calculations

**File to Modify:**
`src/app/api/webhooks/stripe/route.ts`

**Changes Needed:**

**REMOVE:**
```typescript
// Lines 510-557 - Manual L1 override calculation
const sellerCommission = Math.round(totalBV * 0.60);
const overridePool = Math.round(totalBV * 0.40);
const l1Override = Math.round(overridePool * 0.30);
// ... earnings_ledger inserts
```

**ADD:**
```typescript
// After updating seller's PV (line 249)
await propagateGroupVolume(metadata.distributor_id, credited_bv);
```

**Result:**
- Webhook only updates PV/GV in real-time
- Monthly commission run creates ALL earnings_ledger entries
- Clean separation of concerns

---

### 3. Dashboard Data Sources ⚠️ NEEDS VERIFICATION

**Current State:**
- Dashboards likely query `members.personal_credits_monthly` and `members.team_credits_monthly`
- These fields are updated in real-time ✅
- Commission earnings come from `earnings_ledger` table
- Need to verify all dashboard queries are correct

**Files to Check:**
- `src/app/dashboard/page.tsx` - Main dashboard
- `src/app/dashboard/team/page.tsx` - Team page
- `src/components/dashboard/CompensationStatsWidget.tsx` - Stats widget

**Verification Needed:**
1. Do dashboards use `team_credits_monthly` for GV?
2. Do dashboards use `earnings_ledger` for commission totals?
3. Are there any cached fields that need updating?

---

## 🎯 IMPLEMENTATION PLAN - OPTION B

### Phase 1: Real-Time Volume Updates (Webhook)

**Goal:** Update PV and GV immediately when sale happens

**Tasks:**
1. ✅ Create `src/lib/compensation/gv-propagation.ts`
   - `propagateGroupVolume()` function
   - Walk up sponsor_id tree
   - Update team_credits_monthly for all upline

2. ✅ Modify `src/app/api/webhooks/stripe/route.ts`
   - Remove manual commission calculations (lines 510-557)
   - Add call to `propagateGroupVolume()` after PV update
   - Keep it simple: PV/GV only, no commissions

3. ✅ Test webhook with real sale
   - Verify seller PV updated
   - Verify upline GV updated
   - Verify dashboard shows new volumes

---

### Phase 2: Monthly Commission Run (End of Month)

**Goal:** Calculate and create all commission entries monthly

**Tasks:**
1. ✅ Verify `executeMonthlyCommissionRun()` works correctly
   - Test with sample transactions
   - Verify override calculation
   - Verify qualification checks (50 PV + 70% retail)
   - Verify rank requirements

2. ✅ Create admin page to trigger commission run
   - Already exists: `src/app/admin/commission-run/page.tsx`
   - Verify it works

3. ✅ Test end-to-end flow:
   - Make sales throughout month (webhook updates PV/GV)
   - Run monthly commission engine
   - Verify earnings_ledger entries created
   - Verify all qualification checks applied
   - Verify rank-based override rates used

---

### Phase 3: Dashboard Verification

**Goal:** Ensure dashboards show correct data

**Tasks:**
1. ✅ Verify volume displays
   - Personal Volume (PV) from `members.personal_credits_monthly`
   - Group Volume (GV) from `members.team_credits_monthly`
   - Both update in real-time

2. ✅ Verify commission displays
   - Commission earnings from `earnings_ledger`
   - Grouped by earning_type
   - Filtered by pay period

3. ✅ Verify rank displays
   - Current rank from `members.tech_rank`
   - Qualified rank calculated from PV/GV
   - Next rank requirements shown

---

## 🔐 QUALIFICATION RULES SUMMARY

**For Override Eligibility:**

1. **50 PV Minimum** ✅
   - Member must have 50+ personal volume monthly
   - Checked in `checkOverrideQualificationWithRetail()`

2. **70% Retail Compliance** ✅
   - At least 70% of BV from retail customers
   - Checked in `check70PercentRetail()`

3. **Rank Requirements** ✅
   - Override depth based on current paying_rank
   - Starter = L1 only (25%)
   - Crown = L1-L7 (25%, 20%, 18%, 15%, 10%, 7%, 5%)

4. **Compression** ✅
   - If upline doesn't qualify, skip to next qualified upline
   - No "dead money" - all overrides distributed or breakage

5. **Grace Period** ✅
   - 1 month below rank requirements before demotion
   - Rank lock for 3 months for new reps

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    SALE HAPPENS (Stripe)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              WEBHOOK (Real-Time Updates)                     │
│  1. Create order/subscription records                       │
│  2. Update seller PV: personal_credits_monthly += BV        │
│  3. Propagate GV up tree: team_credits_monthly += BV        │
│  4. Send email receipt                                      │
│  5. Log transaction                                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  DASHBOARDS (Real-Time)                      │
│  - Show updated PV/GV immediately                           │
│  - Volume numbers reflect latest sales                      │
│  - Rank qualification status updates                        │
└─────────────────────────────────────────────────────────────┘

                     [Month passes...]

                          ▼
┌─────────────────────────────────────────────────────────────┐
│           MONTHLY COMMISSION RUN (End of Month)              │
│  1. Fetch all transactions for month                        │
│  2. For each transaction:                                   │
│     a. Calculate waterfall (BotMakers, Apex, pools)        │
│     b. Calculate seller commission (60% of pool)           │
│     c. Calculate overrides (L1-L7):                        │
│        - Check 50 PV minimum ✅                             │
│        - Check 70% retail compliance ✅                     │
│        - Check rank for override depth ✅                   │
│        - Apply compression if needed ✅                     │
│     d. Create earnings_ledger entries                      │
│  3. Calculate rank bonuses                                  │
│  4. Process bonus pool programs                            │
│  5. Mark run as completed                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                DASHBOARDS (Post Commission Run)              │
│  - Show commission earnings from earnings_ledger            │
│  - Show pending payouts                                     │
│  - Show rank bonuses earned                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ VERIFICATION CHECKLIST

Before going live, verify:

### Webhook (Real-Time Updates)
- [ ] Sale updates seller PV immediately
- [ ] Sale updates all upline GV immediately
- [ ] Dashboard shows new volumes within seconds
- [ ] No commission entries created by webhook

### Monthly Commission Run
- [ ] Fetches all transactions correctly
- [ ] Calculates waterfall correctly
- [ ] Checks 50 PV minimum for each upline
- [ ] Checks 70% retail compliance for each upline
- [ ] Uses correct rank-based override rates
- [ ] Applies compression for unqualified upline
- [ ] Creates earnings_ledger entries correctly
- [ ] Handles breakage (unpaid overrides)
- [ ] Processes rank bonuses
- [ ] Can run dry-run without database writes

### Dashboards
- [ ] Show real-time PV/GV updates
- [ ] Show commission earnings from ledger
- [ ] Show correct rank qualification status
- [ ] Show next rank requirements
- [ ] Handle zero-state (no sales yet)

---

## 🚀 READY TO IMPLEMENT?

**You have ALL the pieces:**
- ✅ Override calculator with qualification checks
- ✅ Rank evaluation system
- ✅ Monthly commission run engine
- ✅ Retail compliance validation

**What's missing:**
- ❌ GV propagation function (simple to add)
- ❌ Webhook cleanup (remove manual override code)
- ⚠️ Dashboard verification (likely already correct)

**Estimated work:** 2-4 hours to implement and test.

Do you want me to proceed with the implementation?
