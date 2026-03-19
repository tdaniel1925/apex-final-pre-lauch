# 📋 CURRENT COMPENSATION SYSTEM INVENTORY

**Generated**: 2026-03-16
**Purpose**: Complete snapshot of compensation system before dual-ladder migration
**Branch**: `main` (pre-migration state)

---

## 🗂️ EXECUTIVE SUMMARY

**Total TypeScript Files**: 8 files, ~2,268 lines
**Total Migration Files**: 5 SQL migrations
**Total API Endpoints**: 3 routes
**Architecture**: Single-ladder SaaS compensation plan
**Status**: ⚠️ TO BE REPLACED with dual-ladder system

---

## 📁 TYPESCRIPT FILES (src/lib/compensation/)

### 1. **bonuses.ts** (588 lines)
**Purpose**: Bonus program calculations
**Key Functions**:
- `calculateVolumeKicker()` - 10% on L1-L5 overrides
- `calculatePersonalVolumeBonus()` - PVB: $25/$75/$150
- `calculateTeamVolumeBonus()` - TVB: $50/$200/$500/$1500
- `calculateRetentionBonus()` - 85%/90%/95% retention rewards
- `calculateMatchingBonus()` - 10%/15%/20% of L1 leaders
- `calculateCheckMatch()` - 5% of L1 leaders' checks
- `calculateGlobalRankShare()` - GRS pool distribution
- `calculateGoldAccelerator()` - $3,467 bonus (matches spec)
- `calculateInfinityBonus()` - $500/month (matches spec)
- `calculateCarAllowance()` - $400/month (spec has different amounts)

**Status**: ❌ WRONG - These bonuses are from OLD comp plan, not spec
**Action**: Will be REPLACED in Phase 3 (Agent 3E)

---

### 2. **cab-state-machine.ts** (210 lines)
**Purpose**: Customer Acquisition Bonus (CAB) lifecycle management
**Key Functions**:
- `createCAB()` - Creates PENDING CAB on subscription
- `processCABs()` - Transitions PENDING → EARNED after 60 days
- `processCABClawbacks()` - Transitions EARNED → CLAWBACK on cancellation

**State Machine**:
```
PENDING (0-60 days) → EARNED (after 60 days) → CLAWBACK (if cancelled)
```

**Status**: ✅ CORRECT - Logic works perfectly
**Action**: Will be PRESERVED (minor updates for new schema)

---

### 3. **commission-run.ts** (487 lines)
**Purpose**: Main commission run orchestrator
**Key Functions**:
- `executeCommissionRun()` - 12-step commission processing
- `processSubscription()` - Per-subscription waterfall
- `distributeOverrides()` - Override distribution
- `aggregateEarnings()` - Roll up earnings by rep
- `generatePayouts()` - Final payout generation

**12-Step Process**:
1. Create commission run record
2. Pull BV snapshots (current month)
3. Pull rank snapshots (prior month)
4. Process active subscriptions
5. Calculate CABs
6. Process CAB clawbacks
7. Calculate bonus programs
8. Aggregate earnings by rep
9. Calculate taxes/deductions
10. Generate payout records
11. Update rep balances
12. Mark run as complete

**Status**: ⚠️ PARTIALLY CORRECT
- ✅ Waterfall calculation works
- ✅ Business Center exception works
- ✅ CAB processing works
- ❌ Missing: 50 credit minimum check for overrides
- ❌ Missing: Ranked override percentages
- ❌ Wrong: Bonus programs (wrong bonuses)

**Action**: Will be UPDATED in Phase 3 (Agent 3A-3E) and Phase 4 (Agent 4A)

---

### 4. **compression.ts** (270 lines)
**Purpose**: Override resolution with compression (skip inactive reps)
**Key Functions**:
- `resolveAllOverrides()` - Main override distribution logic
- `compressUpline()` - Skip inactive/unqualified reps
- `qualifiesForOverrideLevel()` - Check if rep qualifies for level

**Enroller Rule (PERFECT ✅)**:
```typescript
// Personal enroller ALWAYS gets L1 (30% of override pool)
if (enroller && enroller.rep_id !== seller.rep_id) {
  const priorRank = await getPriorMonthRank(enroller.rep_id);

  if (enroller.status === 'ACTIVE' && qualifiesForOverrideLevel(priorRank, 1)) {
    recipients.push({
      rep: enroller,
      level: 1,
      amount: overrideLevels.L1,  // 30%
      compressed: false,
    });

    // Remove L1 from matrix processing
    delete overrideLevels.L1;
  }
}
```

**Compression Logic (CORRECT ✅)**:
- Skips INACTIVE reps
- Skips reps who don't qualify for that level
- Passes override to next qualified rep upline
- Prevents "override leakage"

**Status**: ✅ MOSTLY CORRECT
- ✅ Enroller rule: PERFECT
- ✅ Compression: Works correctly
- ❌ Missing: 50 credit minimum check
- ❌ Wrong: Uses flat override % instead of ranked schedules

**Action**: Will be UPDATED in Phase 3 (Agent 3D) to add 50 credit check

---

### 5. **config.ts** (115 lines)
**Purpose**: Compensation plan configuration
**Key Constants**:

```typescript
export const COMP_PLAN_CONFIG = {
  waterfall: {
    botmakers_fee_pct: 0.30,      // ✅ CORRECT
    bonus_pool_pct: 0.05,         // ❌ WRONG - should be 0.035
    apex_margin_pct: 0.30,        // ✅ CORRECT
    seller_commission_pct: 0.60,  // ✅ CORRECT
    override_pool_pct: 0.40,      // ✅ CORRECT
  },
  override_percentages: {
    standard: {
      L1: 0.30,  // ✅ CORRECT for all ranks
      L2: 0.25,  // ❌ WRONG - should vary by rank
      L3: 0.20,  // ❌ WRONG - should vary by rank
      L4: 0.15,  // ❌ WRONG - should vary by rank
      L5: 0.10,  // ❌ WRONG - should vary by rank
    },
  },
  rank_thresholds: {
    INACTIVE: { personal_bv: 0, team_bv: 0 },
    ASSOCIATE: { personal_bv: 50, team_bv: 0 },
    BRONZE: { personal_bv: 100, team_bv: 500 },
    SILVER: { personal_bv: 150, team_bv: 2500 },
    GOLD: { personal_bv: 200, team_bv: 10000 },
    PLATINUM: { personal_bv: 250, team_bv: 25000 },
    // ❌ MISSING: Ruby, Diamond, Crown, Elite
  },
  business_center_split: {
    seller: 10.00,
    enroller: 8.00,
  },
};
```

**Status**: ❌ MAJOR GAPS
- ❌ Wrong: bonus_pool_pct (5% instead of 3.5%)
- ❌ Missing: leadership_pool_pct (should be 1.5%)
- ❌ Wrong: Flat override percentages
- ❌ Missing: Ranked override schedules for 9 ranks
- ❌ Missing: 3 ranks (Ruby, Diamond, Crown, Elite)
- ❌ Missing: 50 credit minimum constant

**Action**: Will be COMPLETELY REWRITTEN in Phase 3 (Agent 3A)

---

### 6. **rank.ts** (188 lines)
**Purpose**: Rank evaluation logic
**Key Functions**:
- `evaluateRank()` - Determines rep's rank based on BV
- `checkDownlineRankRequirements()` - Validates rank qualifications
- `applyGracePeriods()` - 2-month grace before demotion

**Current Rank Structure** (6 ranks):
```
INACTIVE (0/0)
  ↓
ASSOCIATE (50/0)
  ↓
BRONZE (100/500)
  ↓
SILVER (150/2500)
  ↓
GOLD (200/10000)
  ↓
PLATINUM (250/25000)
```

**Spec Requires** (9 ranks):
```
Starter (0/0)
  ↓
Bronze (150/300)
  ↓
Silver (500/1500)
  ↓
Gold (1200/5000)
  ↓
Platinum (2500/15000)
  ↓
Ruby (4000/30000) ← MISSING
  ↓
Diamond (5000/50000) ← MISSING
  ↓
Crown (6000/75000) ← MISSING
  ↓
Elite (8000/120000) ← MISSING
```

**Status**: ❌ INCOMPLETE
- ✅ Correct: Personal BV < 50 → INACTIVE check
- ✅ Correct: Highest-to-lowest evaluation order
- ❌ Missing: 3 ranks (Ruby, Diamond, Crown, Elite)
- ❌ Wrong: Rank thresholds don't match spec
- ❌ Missing: Downline rank requirements
- ❌ Missing: 2-month grace period implementation
- ❌ Missing: 6-month rank lock for new reps

**Action**: Will be REWRITTEN in Phase 3 (Agent 3C) with 9-rank system

---

### 7. **waterfall.ts** (167 lines)
**Purpose**: Revenue waterfall calculation
**Key Functions**:
- `calculateWaterfall()` - Main waterfall calculation
- `calculateBizCenterSplit()` - Business Center exception

**Waterfall Formula** (CORRECT ✅):
```typescript
export function calculateWaterfall(
  grossPrice: number,
  powerlineActive: boolean = false
): WaterfallResult {
  // Step 1: BotMakers fee (FLOOR)
  const botmakersFee = floor2(grossPrice * 0.30);

  // Step 2: Adjusted gross
  const adjGross = grossPrice - botmakersFee;

  // Step 3: Bonus pool contribution (ROUND)
  const bonusPoolContribution = round2(adjGross * 0.05); // ❌ Should be 0.035

  // Step 4: After pool deduction
  const afterPool = adjGross - bonusPoolContribution;

  // Step 5: Apex margin (FLOOR)
  const apexMargin = floor2(afterPool * 0.30);

  // Step 6: Field remainder
  const fieldRemainder = afterPool - apexMargin;

  // Step 7: Seller commission (ROUND)
  const sellerCommission = round2(fieldRemainder * 0.60);

  // Step 8: Override pool (ROUND)
  const overridePool = round2(fieldRemainder * 0.40);

  return {
    botmakersFee,
    bonusPoolContribution,
    apexMargin,
    sellerCommission,
    overridePool,
    totalDistributed: botmakersFee + bonusPoolContribution + apexMargin + sellerCommission + overridePool,
  };
}
```

**Business Center Exception** (PERFECT ✅):
```typescript
export function calculateBizCenterSplit(): BizCenterSplit {
  return {
    sellerAmount: 10.00,   // $10 to seller
    enrollerAmount: 8.00,  // $8 to enroller
    // Remaining goes to company
  };
}
```

**Status**: ⚠️ MOSTLY CORRECT
- ✅ Math: Perfect implementation
- ✅ Rounding: Correct (FLOOR for fees, ROUND for commissions)
- ✅ Business Center: Perfect exception handling
- ❌ Wrong: bonus_pool_pct = 5% instead of 3.5%
- ❌ Missing: Separate leadership pool (1.5%)

**Action**: Will be UPDATED in Phase 3 (Agent 3B) to fix percentages

---

### 8. **types.ts** (213 lines)
**Purpose**: TypeScript type definitions
**Key Types**:
- `Rank` - 6 rank enum
- `CommissionRun` - Commission run record
- `WaterfallResult` - Waterfall calculation result
- `OverrideRecipient` - Override distribution
- `BonusProgram` - Bonus program types
- `CABState` - CAB lifecycle states

**Status**: ⚠️ NEEDS UPDATES
- ✅ Correct: Core structure is good
- ❌ Missing: 3 ranks (Ruby, Diamond, Crown, Elite)
- ❌ Missing: Insurance ladder types
- ❌ Missing: Leadership pool types
- ❌ Missing: Product credit types

**Action**: Will be UPDATED in Phase 3 (Agent 3A) to add new types

---

## 🗄️ DATABASE MIGRATIONS (supabase/migrations/)

### 1. **20260221000004_commission_engine_core.sql**
**Purpose**: Core commission tables
**Tables Created**:
- `rank_history` - Monthly rank snapshots
- `commissions_waterfall` - Waterfall breakdown per subscription
- `commissions_overrides` - Override distributions
- `commissions_cabs` - Customer Acquisition Bonuses
- `commissions_bonuses` - Bonus program payouts
- `commissions_runs` - Commission run metadata
- `commissions_payouts` - Final payout records

**Status**: ❌ TO BE REMOVED
**Action**: Will be DROPPED in Phase 1 (Agent 1B)

---

### 2. **20260221000005_commission_calculation_functions.sql**
**Purpose**: SQL utility functions
**Functions Created**:
- `get_upline_chain()` - Retrieve upline chain for a rep
- `calculate_team_bv()` - Calculate team volume
- `get_prior_month_rank()` - Get rank from previous month

**Status**: ⚠️ WILL BE REPLACED
**Action**: New functions in Phase 2 (Agent 2F)

---

### 3. **20260221000007_fix_run_monthly_commissions.sql**
**Purpose**: Fix for monthly commission run procedure
**Status**: ❌ TO BE REMOVED (outdated fix)

---

### 4. **20260221000009_add_month_year_to_all_commissions.sql**
**Purpose**: Add month/year columns to commission tables
**Status**: ❌ TO BE REMOVED (tables will be dropped)

---

### 5. **20260222000003_fix_retail_commissions.sql**
**Purpose**: Fix for retail vs member pricing
**Status**: ❌ TO BE REMOVED (tables will be dropped)

---

## 🌐 API ENDPOINTS (src/app/api/admin/compensation/)

### 1. **run/route.ts**
**Endpoints**:
- `GET /api/admin/compensation/run` - Retrieve commission run details
- `POST /api/admin/compensation/run` - Execute commission run for month/year

**Request Body** (POST):
```typescript
{
  month: number,  // 1-12
  year: number    // YYYY
}
```

**Response**:
```typescript
{
  success: boolean,
  run_id: string,
  total_payouts: number,
  total_amount: number,
  processing_time_ms: number
}
```

**Status**: ⚠️ NEEDS UPDATES
**Action**: Will be UPDATED in Phase 4 (Agent 4A)

---

### 2. **cab-processing/route.ts**
**Endpoints**:
- `POST /api/admin/compensation/cab-processing` - Process CAB state transitions

**Request Body**:
```typescript
{
  action: 'process_pending' | 'process_clawbacks',
  as_of_date?: string  // Optional: Process as of specific date
}
```

**Status**: ⚠️ NEEDS UPDATES
**Action**: Will be UPDATED for new schema

---

### 3. **stress-test/route.ts**
**Endpoints**:
- `POST /api/admin/compensation/stress-test` - Stress test commission engine

**Purpose**: Testing/debugging endpoint
**Status**: ✅ CAN BE PRESERVED (useful for testing)

---

## 📊 DATABASE TABLES (Current Schema)

### Core Tables (TO BE DROPPED):
1. **rank_history**
   - Columns: `rep_id`, `month`, `year`, `rank`, `personal_bv`, `team_bv`
   - Purpose: Monthly rank snapshots
   - Status: ❌ TO BE DROPPED (replaced by new schema)

2. **commissions_waterfall**
   - Columns: `subscription_id`, `gross_price`, `botmakers_fee`, `bonus_pool`, `apex_margin`, `seller_commission`, `override_pool`
   - Purpose: Waterfall breakdown per subscription
   - Status: ❌ TO BE DROPPED

3. **commissions_overrides**
   - Columns: `subscription_id`, `recipient_rep_id`, `level`, `amount`, `compressed`
   - Purpose: Override distributions
   - Status: ❌ TO BE DROPPED

4. **commissions_cabs**
   - Columns: `subscription_id`, `rep_id`, `amount`, `state`, `earned_date`, `clawback_date`
   - Purpose: CAB lifecycle tracking
   - Status: ❌ TO BE DROPPED

5. **commissions_bonuses**
   - Columns: `rep_id`, `bonus_type`, `amount`, `details`
   - Purpose: Bonus program payouts
   - Status: ❌ TO BE DROPPED

6. **commissions_runs**
   - Columns: `run_id`, `month`, `year`, `status`, `started_at`, `completed_at`
   - Purpose: Commission run metadata
   - Status: ❌ TO BE DROPPED

7. **commissions_payouts**
   - Columns: `rep_id`, `run_id`, `gross_earnings`, `deductions`, `net_payout`
   - Purpose: Final payout records
   - Status: ❌ TO BE DROPPED

---

## 🔧 CONFIGURATION TABLES

### 1. **comp_engine_config**
- Purpose: Store waterfall percentages, override schedules
- Status: ⚠️ WILL BE CLEARED in Phase 1 (Agent 1D)

### 2. **comp_engine_rank_config**
- Purpose: Store rank thresholds
- Status: ⚠️ WILL BE CLEARED in Phase 1 (Agent 1D)

---

## 📈 WHAT WORKS CORRECTLY

### ✅ Perfect Implementations (TO BE PRESERVED):

1. **Waterfall Calculation**
   - Math is perfect
   - Rounding is correct (FLOOR for fees, ROUND for commissions)
   - Business Center exception works perfectly

2. **Enroller Override Rule**
   - Personal enroller ALWAYS gets L1 (30%)
   - Correctly removes L1 from matrix processing
   - **This is IMMUTABLE and must be preserved**

3. **Compression Logic**
   - Correctly skips inactive reps
   - Correctly skips unqualified reps
   - No "override leakage"

4. **CAB State Machine**
   - PENDING → EARNED transitions work
   - EARNED → CLAWBACK transitions work
   - 60-day waiting period correctly enforced

5. **Business Center Exception**
   - $10 to seller, $8 to enroller
   - Bypasses waterfall entirely
   - **This is IMMUTABLE and must be preserved**

---

## ❌ CRITICAL GAPS (TO BE FIXED)

### 1. **50 Credit Minimum for Overrides**
- **Current**: Everyone earns overrides regardless of credit volume
- **Spec**: Must have 50+ personal credits/month to qualify
- **Impact**: HIGH - Could overpay unqualified reps
- **Fix**: Phase 3 (Agent 3D) - Add check in override resolution

### 2. **Ranked Override Percentages**
- **Current**: Flat 30/25/20/15/10% for all ranks
- **Spec**: 9 different schedules based on rank
- **Impact**: HIGH - Wrong payout amounts for 8 of 9 ranks
- **Fix**: Phase 3 (Agent 3A) - Add ranked schedules to config

### 3. **9-Rank Tech Ladder**
- **Current**: Only 6 ranks (Inactive → Platinum)
- **Spec**: 9 ranks (Starter → Elite)
- **Impact**: HIGH - Missing 3 ranks (Ruby, Diamond, Crown, Elite)
- **Fix**: Phase 3 (Agent 3C) - Add missing ranks

### 4. **Product Credit Percentages**
- **Current**: Products use 1:1 BV (bv_value = member_price)
- **Spec**: Products have credit multipliers (30%, 50%, 100%)
- **Impact**: HIGH - Wrong credit calculations
- **Fix**: Phase 2 (Agent 2B) - Add credit_pct column to products

### 5. **Bonus Pool Programs**
- **Current**: 10 bonuses from OLD comp plan
- **Spec**: 7 bonuses (Trip, Fast Start, Contests, Car, Retreat, Enhanced Rank, Reserve)
- **Impact**: HIGH - Wrong bonuses being paid
- **Fix**: Phase 3 (Agent 3E) - Replace bonuses.ts entirely

### 6. **Insurance Ladder**
- **Current**: Doesn't exist
- **Spec**: Complete insurance ladder with 6 ranks + MGA tiers
- **Impact**: HIGH - Missing entire ladder
- **Fix**: Phase 2 (Agent 2E) + Phase 3 (Agent 3A)

### 7. **Cross-Credit System**
- **Current**: Not implemented
- **Spec**: Tech→Insurance (Bill's %) and Insurance→Tech (0.5%)
- **Impact**: MEDIUM - Missing cross-ladder crediting
- **Fix**: Phase 3 (Agent 3B) - Add to waterfall logic

### 8. **Leadership Pool (1.5% Separate)**
- **Current**: Combined into bonus pool (5% total)
- **Spec**: Separate 1.5% pool with 1,000 shares
- **Impact**: HIGH - Wrong pool structure
- **Fix**: Phase 2 (Agent 2D) + Phase 3 (Agent 3A)

### 9. **Bonus Pool Percentage**
- **Current**: 5%
- **Spec**: 3.5%
- **Impact**: MEDIUM - Wrong deduction amount
- **Fix**: Phase 3 (Agent 3A) - Update config

---

## 📦 DEPENDENCIES

### NPM Packages (Compensation-Related):
```json
{
  "@supabase/supabase-js": "^2.46.2",
  "drizzle-orm": "^0.38.3",
  "zod": "^3.24.1"
}
```

### External Services:
- Supabase (PostgreSQL database)
- Stripe (subscription management)

---

## 🔄 MIGRATION IMPACT

### Files to be REMOVED (Phase 1):
- ❌ 5 SQL migrations
- ❌ 7 database tables
- ❌ Config table data

### Files to be MOVED to backup (Phase 1):
- 📦 8 TypeScript files → `_OLD_BACKUP/`

### Files to be CREATED (Phase 2-3):
- ✨ 6 new SQL migrations
- ✨ 9 new database tables
- ✨ 5 new TypeScript files (rewritten from scratch)
- ✨ 3 new SQL utility functions

### Files to be UPDATED (Phase 4):
- 🔄 3 API route files

---

## ⏱️ ESTIMATED MIGRATION TIME

**Total Duration**: 4 hours (with parallelization)
- Phase 0: 30 minutes (CURRENT - Discovery & Backup)
- Phase 1: 1 hour (Remove Old System)
- Phase 2: 1.5 hours (Build New DB Schema)
- Phase 3: 2 hours (Build New TS Code)
- Phase 4: 1 hour (Update APIs)
- Phase 5: 1 hour (Testing & Validation)

**Sequential Time**: 7.5 hours (without parallelization)

---

## 🎯 SUCCESS CRITERIA FOR MIGRATION

### Phase 1 Complete:
- [ ] Old TypeScript files in `_OLD_BACKUP/`
- [ ] Old database tables dropped
- [ ] Old API endpoints return 501 Not Implemented

### Phase 2 Complete:
- [ ] All 6 new migrations applied
- [ ] `members` table exists with dual-ladder columns
- [ ] Products have `credit_pct` column seeded
- [ ] All 3 utility functions exist

### Phase 3 Complete:
- [ ] All 5 new TypeScript files compile
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors

### Phase 4 Complete:
- [ ] All API endpoints return 200
- [ ] Commission run API uses new schema
- [ ] Bonus pool API functional
- [ ] Leadership pool API functional

### Phase 5 Complete:
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Database validation queries return expected results
- [ ] Build succeeds with no warnings

---

## 🚨 ROLLBACK PLAN

### Emergency Rollback:
```bash
# 1. Reset to snapshot
git reset --hard comp-plan-v1-snapshot

# 2. Restore database
psql < schema_backup_20260316.sql
psql < data_backup_20260316.sql

# 3. Rebuild
npm install
npm run build

# 4. Verify
npm test
```

### Phase-Specific Rollbacks:
See `MIGRATION-DEBUG-GUIDE.md` for detailed rollback procedures for each phase.

---

## 📝 NOTES

- **This is the ONLY comprehensive inventory**
- All file paths are relative to project root
- All line counts are approximate
- All migration files are timestamped with creation date
- All TypeScript files use strict mode
- All database tables use UUID primary keys
- All API endpoints require admin authentication

---

**Inventory Generated By**: Agent 0A (Discovery Agent)
**Next Step**: Agent 0B (Database Backup) + Agent 0C (Git Snapshot)
**Migration Branch**: `feature/dual-ladder-migration`
**Status**: ✅ PHASE 0 - INVENTORY COMPLETE

---

**End of Inventory Document**
