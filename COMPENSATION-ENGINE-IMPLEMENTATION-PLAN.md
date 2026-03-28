# Compensation Engine Implementation Plan
## Fixing 114 Test Failures - Dual-Ladder System

**Date:** March 19, 2026
**Status:** Ready to implement
**Estimated Time:** 2-3 days
**Priority:** High (but Autopilot launch unaffected)

---

## Executive Summary

The database was migrated to the dual-ladder system (9 Tech ranks, credit-based) on March 16, 2026, but the TypeScript calculation engine in `src/lib/compensation/` was not updated. This document provides step-by-step instructions to implement the missing functions.

**Tests Status:**
- 42/156 passing (27%)
- 114/156 failing (73%)
- All failures due to outdated calculation logic

---

## Implementation Order

### Phase 1: Update Configuration (config.ts)
**File:** `src/lib/compensation/config.ts`
**Tests affected:** config-loader.test.ts (47 tests)
**Time:** 2 hours

#### Changes Required:

1. **Add TechRank type** (9 ranks)
```typescript
export type TechRank =
  | 'starter'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'ruby'
  | 'diamond'
  | 'crown'
  | 'elite';
```

2. **Add ProductType** (standard vs business_center)
```typescript
export type ProductType = 'standard' | 'business_center';
```

3. **Tech Rank Requirements** (from spec lines 165-176)
```typescript
export interface TechRankRequirements {
  name: TechRank;
  personal: number;      // Personal credits/month
  group: number;         // Group credits/month
  downline?: DownlineRequirement | DownlineRequirement[];
  bonus: number;         // Rank bonus in cents
  overrideDepth: number; // 1-5
}

export const TECH_RANK_REQUIREMENTS: TechRankRequirements[] = [
  { name: 'starter', personal: 0, group: 0, bonus: 0, overrideDepth: 1 },
  { name: 'bronze', personal: 150, group: 300, bonus: 25000, overrideDepth: 2 },
  { name: 'silver', personal: 500, group: 1500, bonus: 100000, overrideDepth: 3 },
  { name: 'gold', personal: 1200, group: 5000, downline: { bronze: 1 }, bonus: 300000, overrideDepth: 4 },
  { name: 'platinum', personal: 2500, group: 15000, downline: { silver: 2 }, bonus: 750000, overrideDepth: 5 },
  { name: 'ruby', personal: 4000, group: 30000, downline: { gold: 2 }, bonus: 1200000, overrideDepth: 5 },
  { name: 'diamond', personal: 5000, group: 50000, downline: [{ gold: 3 }, { platinum: 2 }], bonus: 1800000, overrideDepth: 5 },
  { name: 'crown', personal: 6000, group: 75000, downline: { platinum: 2, gold: 1 }, bonus: 2200000, overrideDepth: 5 },
  { name: 'elite', personal: 8000, group: 120000, downline: [{ platinum: 3 }, { diamond: 2 }], bonus: 3000000, overrideDepth: 5 },
];
```

4. **Ranked Override Schedules** (from spec lines 259-270)
```typescript
export const RANKED_OVERRIDE_SCHEDULES: Record<TechRank, [number, number, number, number, number]> = {
  starter:   [0.30, 0.00, 0.00, 0.00, 0.00],
  bronze:    [0.30, 0.05, 0.00, 0.00, 0.00],
  silver:    [0.30, 0.10, 0.05, 0.00, 0.00],
  gold:      [0.30, 0.15, 0.10, 0.05, 0.00],
  platinum:  [0.30, 0.18, 0.12, 0.08, 0.03],
  ruby:      [0.30, 0.20, 0.15, 0.10, 0.05],
  diamond:   [0.30, 0.22, 0.18, 0.12, 0.08],
  crown:     [0.30, 0.25, 0.20, 0.15, 0.10],
  elite:     [0.30, 0.25, 0.20, 0.15, 0.10],
};
```

5. **Waterfall Configuration** (from spec lines 9-23)
```typescript
export const WATERFALL_CONFIG = {
  BOTMAKERS_FEE_PCT: 0.30,       // 30%
  APEX_TAKE_PCT: 0.30,           // 30% of adjusted gross
  BONUS_POOL_PCT: 0.035,         // 3.5% of remainder
  LEADERSHIP_POOL_PCT: 0.015,    // 1.5% of remainder
  SELLER_COMMISSION_PCT: 0.60,   // 60% of commission pool
  OVERRIDE_POOL_PCT: 0.40,       // 40% of commission pool
};
```

6. **Business Center Config** (from spec lines 27-39)
```typescript
export const BUSINESS_CENTER_CONFIG = {
  PRICE_CENTS: 3900,              // $39.00
  BOTMAKERS_FEE_CENTS: 1100,      // $11.00
  APEX_TAKE_CENTS: 800,           // $8.00
  SELLER_COMMISSION_CENTS: 1000,  // $10.00
  SPONSOR_BONUS_CENTS: 800,       // $8.00
  COSTS_CENTS: 200,               // $2.00
  OVERRIDE_POOL_CENTS: 0,         // No override pool
  BONUS_POOL_CENTS: 0,            // No bonus pool
  LEADERSHIP_POOL_CENTS: 0,       // No leadership pool
  CREDITS: 39,                    // Fixed credits
};
```

7. **Constants**
```typescript
export const TECH_RANKS: readonly TechRank[] = [
  'starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'
] as const;

export const OVERRIDE_QUALIFICATION_MIN_CREDITS = 50;
export const RANK_GRACE_PERIOD_MONTHS = 2;
export const NEW_REP_RANK_LOCK_MONTHS = 6;
export const LEADERSHIP_POOL_ELIGIBLE_RANK: TechRank = 'elite';
export const BONUS_POOL_DISTRIBUTION_METHOD = 'equal_share' as const;
export const ENROLLER_OVERRIDE_RATE = 0.30;
export const INSURANCE_TO_TECH_CROSSCREDIT_PCT = 0.005; // 0.5% (removed per spec)

export const COMMISSION_RUN_CONFIG = {
  PROMOTION_EFFECTIVE_DELAY_MONTHS: 1,
  RANK_BONUS_ONE_TIME_ONLY: true,
};
```

8. **Helper: Get Override Percentage**
```typescript
export function getOverridePercentage(rank: TechRank, level: number): number {
  if (level < 1 || level > 5) return 0;
  return RANKED_OVERRIDE_SCHEDULES[rank][level - 1];
}
```

---

### Phase 2: Rewrite Waterfall Module (waterfall.ts)
**File:** `src/lib/compensation/waterfall.ts`
**Tests affected:** waterfall.test.ts (20 tests)
**Time:** 3 hours

#### Implementation from Spec (lines 45-77):

```typescript
// =============================================
// DUAL-LADDER COMPENSATION ENGINE - WATERFALL
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md lines 9-77
// =============================================

import { ProductType, WATERFALL_CONFIG, BUSINESS_CENTER_CONFIG } from './config';

/**
 * Waterfall Result (in CENTS)
 */
export interface WaterfallResult {
  priceCents: number;
  productType: ProductType;

  // Waterfall steps
  botmakersFeeCents: number;
  adjustedGrossCents: number;
  apexTakeCents: number;
  remainderCents: number;
  bonusPoolCents: number;
  leadershipPoolCents: number;
  commissionPoolCents: number;
  sellerCommissionCents: number;
  overridePoolCents: number;

  effectivePercentage: number; // Seller commission / price
}

/**
 * Calculate Waterfall for Standard Products
 *
 * CRITICAL: All amounts in CENTS (integer math)
 * From spec lines 11-23:
 *
 * STEP 1: Customer pays PRICE
 * STEP 2: BotMakers takes 30% = ADJUSTED GROSS
 * STEP 3: Apex takes 30% of Adjusted Gross = REMAINDER
 * STEP 4: 3.5% of Remainder → BONUS POOL
 * STEP 5: 1.5% of Remainder → LEADERSHIP POOL
 *         = COMMISSION POOL (Remainder - 3.5% - 1.5%)
 * STEP 6: Seller gets 60% of Commission Pool (~27.9% effective)
 * STEP 7: Override Pool gets 40% of Commission Pool
 */
export function calculateWaterfall(
  priceCents: number,
  productType: ProductType = 'standard'
): WaterfallResult {
  // Business Center uses fixed split
  if (productType === 'business_center') {
    return {
      priceCents: BUSINESS_CENTER_CONFIG.PRICE_CENTS,
      productType: 'business_center',
      botmakersFeeCents: BUSINESS_CENTER_CONFIG.BOTMAKERS_FEE_CENTS,
      adjustedGrossCents: 0,
      apexTakeCents: BUSINESS_CENTER_CONFIG.APEX_TAKE_CENTS,
      remainderCents: 0,
      bonusPoolCents: 0,
      leadershipPoolCents: 0,
      commissionPoolCents: 0,
      sellerCommissionCents: BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS,
      overridePoolCents: 0,
      effectivePercentage: 25.64, // $10 / $39
    };
  }

  // Standard waterfall
  // Step 1: BotMakers fee (30%)
  const botmakersFeeCents = Math.round(priceCents * WATERFALL_CONFIG.BOTMAKERS_FEE_PCT);

  // Step 2: Adjusted gross
  const adjustedGrossCents = priceCents - botmakersFeeCents;

  // Step 3: Apex take (30% of adjusted gross)
  const apexTakeCents = Math.round(adjustedGrossCents * WATERFALL_CONFIG.APEX_TAKE_PCT);

  // Step 4: Remainder
  const remainderCents = adjustedGrossCents - apexTakeCents;

  // Step 5: Bonus pool (3.5% of remainder)
  const bonusPoolCents = Math.round(remainderCents * WATERFALL_CONFIG.BONUS_POOL_PCT);

  // Step 6: Leadership pool (1.5% of remainder)
  const leadershipPoolCents = Math.round(remainderCents * WATERFALL_CONFIG.LEADERSHIP_POOL_PCT);

  // Step 7: Commission pool (what's left)
  const commissionPoolCents = remainderCents - bonusPoolCents - leadershipPoolCents;

  // Step 8: Seller commission (60% of commission pool)
  const sellerCommissionCents = Math.round(commissionPoolCents * WATERFALL_CONFIG.SELLER_COMMISSION_PCT);

  // Step 9: Override pool (40% of commission pool)
  const overridePoolCents = Math.round(commissionPoolCents * WATERFALL_CONFIG.OVERRIDE_POOL_PCT);

  // Effective percentage
  const effectivePercentage = (sellerCommissionCents / priceCents) * 100;

  return {
    priceCents,
    productType: 'standard',
    botmakersFeeCents,
    adjustedGrossCents,
    apexTakeCents,
    remainderCents,
    bonusPoolCents,
    leadershipPoolCents,
    commissionPoolCents,
    sellerCommissionCents,
    overridePoolCents,
    effectivePercentage,
  };
}

/**
 * Get Business Center Sponsor Bonus
 * Returns $8 flat bonus for BC sponsor
 */
export function getBusinessCenterSponsorBonus(): number {
  return BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS;
}

/**
 * Validate Waterfall Calculation
 * Ensures all amounts add up correctly
 */
export interface WaterfallValidation {
  valid: boolean;
  errors: string[];
}

export function validateWaterfall(result: WaterfallResult): WaterfallValidation {
  const errors: string[] = [];

  if (result.productType === 'business_center') {
    // BC: Fixed amounts should add up to $39
    const total = result.botmakersFeeCents + result.apexTakeCents +
                  result.sellerCommissionCents + BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS +
                  BUSINESS_CENTER_CONFIG.COSTS_CENTS;
    if (total !== BUSINESS_CENTER_CONFIG.PRICE_CENTS) {
      errors.push(`BC split doesn't add up: ${total} !== ${BUSINESS_CENTER_CONFIG.PRICE_CENTS}`);
    }
    return { valid: errors.length === 0, errors };
  }

  // Standard product validation
  // Check: price - botmakers = adjusted gross
  if (result.priceCents - result.botmakersFeeCents !== result.adjustedGrossCents) {
    errors.push('Adjusted gross calculation error');
  }

  // Check: adjusted gross - apex take = remainder
  if (result.adjustedGrossCents - result.apexTakeCents !== result.remainderCents) {
    errors.push('Remainder calculation error');
  }

  // Check: commission pool + bonus pool + leadership pool = remainder
  const poolSum = result.commissionPoolCents + result.bonusPoolCents + result.leadershipPoolCents;
  if (Math.abs(poolSum - result.remainderCents) > 1) { // Allow 1 cent rounding
    errors.push(`Pool sum doesn't match remainder: ${poolSum} !== ${result.remainderCents}`);
  }

  // Check: seller + override = commission pool
  const commissionSum = result.sellerCommissionCents + result.overridePoolCents;
  if (Math.abs(commissionSum - result.commissionPoolCents) > 1) { // Allow 1 cent rounding
    errors.push(`Commission split doesn't add up: ${commissionSum} !== ${result.commissionPoolCents}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Aggregate Pools from Multiple Sales
 * Used for monthly pool calculations
 */
export interface PoolAggregation {
  saleCount: number;
  totalSalesCents: number;
  totalBonusPoolCents: number;
  totalLeadershipPoolCents: number;
}

export function aggregatePools(results: WaterfallResult[]): PoolAggregation {
  return results.reduce((agg, result) => ({
    saleCount: agg.saleCount + 1,
    totalSalesCents: agg.totalSalesCents + result.priceCents,
    totalBonusPoolCents: agg.totalBonusPoolCents + result.bonusPoolCents,
    totalLeadershipPoolCents: agg.totalLeadershipPoolCents + result.leadershipPoolCents,
  }), {
    saleCount: 0,
    totalSalesCents: 0,
    totalBonusPoolCents: 0,
    totalLeadershipPoolCents: 0,
  });
}

/**
 * Format Waterfall Result for Display/Logging
 */
export function formatWaterfallResult(result: WaterfallResult): string {
  const toDollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (result.productType === 'business_center') {
    return `Business Center Waterfall:
  Price:              ${toDollars(result.priceCents)}
  BotMakers Fee:      ${toDollars(result.botmakersFeeCents)}
  Apex Take:          ${toDollars(result.apexTakeCents)}
  Seller Commission:  ${toDollars(result.sellerCommissionCents)}
  Sponsor Bonus:      ${toDollars(BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS)}
  Costs:              ${toDollars(BUSINESS_CENTER_CONFIG.COSTS_CENTS)}`;
  }

  return `Standard Waterfall:
  Price:              ${toDollars(result.priceCents)}
  BotMakers Fee:      ${toDollars(result.botmakersFeeCents)}
  Adjusted Gross:     ${toDollars(result.adjustedGrossCents)}
  Apex Take:          ${toDollars(result.apexTakeCents)}
  Remainder:          ${toDollars(result.remainderCents)}
  Bonus Pool (3.5%):  ${toDollars(result.bonusPoolCents)}
  Leadership (1.5%):  ${toDollars(result.leadershipPoolCents)}
  Commission Pool:    ${toDollars(result.commissionPoolCents)}
  Seller Commission:  ${toDollars(result.sellerCommissionCents)}
  Override Pool:      ${toDollars(result.overridePoolCents)}
  Effective %:        ${result.effectivePercentage.toFixed(2)}%`;
}
```

---

### Phase 3: Rewrite Rank Module (rank.ts)
**File:** `src/lib/compensation/rank.ts`
**Tests affected:** rank.test.ts (23 tests)
**Time:** 4 hours

#### Key Functions Needed:

```typescript
// =============================================
// DUAL-LADDER COMPENSATION ENGINE - RANK EVALUATION
// =============================================

import { TechRank, TECH_RANK_REQUIREMENTS, NEW_REP_RANK_LOCK_MONTHS, RANK_GRACE_PERIOD_MONTHS } from './config';

export interface SponsoredMember {
  memberId: string;
  techRank: TechRank;
  personallySponsored: boolean;
}

export interface MemberRankData {
  memberId: string;
  personalCreditsMonthly: number;
  groupCreditsMonthly: number;
  currentTechRank: TechRank;
  enrollmentDate: Date;
  techGraceMonths: number; // 0, 1, or 2
  highestTechRank: TechRank;
  techRankLockUntil?: Date;
}

export interface RankEvaluationResult {
  action: 'promote' | 'demote' | 'maintain' | 'grace_period' | 'rank_locked';
  currentRank: TechRank;
  qualifiedRank: TechRank;
  effectiveDate?: Date;
  isRankLocked?: boolean;
  graceMonthsUsed?: number;
  graceMonthsRemaining?: number;
  reasons: string[];
}

/**
 * Evaluate Tech Rank
 * From spec lines 183-215
 */
export function evaluateTechRank(
  member: MemberRankData,
  sponsoredMembers: SponsoredMember[]
): RankEvaluationResult {
  const reasons: string[] = [];

  // Check rank lock
  if (member.techRankLockUntil && new Date() < member.techRankLockUntil) {
    return {
      action: 'rank_locked',
      currentRank: member.currentTechRank,
      qualifiedRank: member.currentTechRank,
      isRankLocked: true,
      reasons: [`Rank locked until ${member.techRankLockUntil.toLocaleDateString()}`],
    };
  }

  // Evaluate from highest rank down
  let qualifiedRank: TechRank = 'starter';

  for (let i = TECH_RANK_REQUIREMENTS.length - 1; i >= 0; i--) {
    const req = TECH_RANK_REQUIREMENTS[i];

    // Check personal and group credits
    if (member.personalCreditsMonthly < req.personal) continue;
    if (member.groupCreditsMonthly < req.group) continue;

    // Check downline requirements if any
    if (req.downline) {
      if (!checkDownlineRequirements(sponsoredMembers, req.downline)) {
        continue;
      }
    }

    qualifiedRank = req.name;
    break;
  }

  // Determine action
  const currentValue = rankValue(member.currentTechRank);
  const qualifiedValue = rankValue(qualifiedRank);

  if (qualifiedValue > currentValue) {
    // PROMOTION
    const effectiveDate = new Date();
    effectiveDate.setMonth(effectiveDate.getMonth() + 1);
    effectiveDate.setDate(1);

    return {
      action: 'promote',
      currentRank: member.currentTechRank,
      qualifiedRank,
      effectiveDate,
      reasons: [`Qualified for ${qualifiedRank} - effective ${effectiveDate.toLocaleDateString()}`],
    };
  } else if (qualifiedValue < currentValue) {
    // DEMOTION - Check grace period
    if (member.techGraceMonths < RANK_GRACE_PERIOD_MONTHS) {
      return {
        action: 'grace_period',
        currentRank: member.currentTechRank,
        qualifiedRank,
        graceMonthsUsed: member.techGraceMonths + 1,
        graceMonthsRemaining: RANK_GRACE_PERIOD_MONTHS - member.techGraceMonths - 1,
        reasons: [`Grace period month ${member.techGraceMonths + 1} of ${RANK_GRACE_PERIOD_MONTHS}`],
      };
    }

    // Grace expired - demote
    const effectiveDate = new Date();
    effectiveDate.setMonth(effectiveDate.getMonth() + 1);
    effectiveDate.setDate(1);

    return {
      action: 'demote',
      currentRank: member.currentTechRank,
      qualifiedRank,
      effectiveDate,
      graceMonthsUsed: member.techGraceMonths + 1,
      graceMonthsRemaining: 0,
      reasons: [`Grace period expired - demoting to ${qualifiedRank}`],
    };
  }

  // MAINTAIN
  return {
    action: 'maintain',
    currentRank: member.currentTechRank,
    qualifiedRank: member.currentTechRank,
    reasons: ['Requirements met for current rank'],
  };
}

/**
 * Check Downline Requirements
 * Supports both simple objects and OR arrays
 */
function checkDownlineRequirements(
  sponsored: SponsoredMember[],
  requirements: any
): boolean {
  if (!requirements) return true;

  // OR condition (array)
  if (Array.isArray(requirements)) {
    return requirements.some(req => checkDownlineRequirements(sponsored, req));
  }

  // AND condition (object)
  for (const [requiredRank, count] of Object.entries(requirements)) {
    const qualifiedCount = sponsored.filter(s =>
      s.personallySponsored &&
      rankValue(s.techRank) >= rankValue(requiredRank as TechRank)
    ).length;

    if (qualifiedCount < (count as number)) {
      return false;
    }
  }

  return true;
}

/**
 * Get Rank Value (for comparisons)
 */
function rankValue(rank: TechRank): number {
  const ranks: TechRank[] = ['starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'];
  return ranks.indexOf(rank);
}

/**
 * Calculate Rank Lock Date
 * New reps get 6-month lock if they achieve a rank in first 6 months
 */
export function calculateRankLockDate(enrollmentDate: Date, firstRankDate: Date): Date | null {
  const monthsSinceEnrollment = monthsBetween(enrollmentDate, firstRankDate);

  if (monthsSinceEnrollment > 6) {
    return null; // Achieved after 6 months - no lock
  }

  // Lock for 6 months from rank achievement
  const lockDate = new Date(firstRankDate);
  lockDate.setMonth(lockDate.getMonth() + NEW_REP_RANK_LOCK_MONTHS);
  return lockDate;
}

/**
 * Should Pay Rank Bonus
 * Only pay if this is a new highest rank
 */
export function shouldPayRankBonus(newRank: TechRank, highestEverAchieved: TechRank): boolean {
  return rankValue(newRank) > rankValue(highestEverAchieved);
}

/**
 * Get Rank Bonus Amount
 * From spec line 166
 */
export function getRankBonus(rank: TechRank): number {
  const bonuses: Record<TechRank, number> = {
    starter: 0,
    bronze: 25000,      // $250
    silver: 100000,     // $1,000
    gold: 300000,       // $3,000
    platinum: 750000,   // $7,500
    ruby: 1200000,      // $12,000
    diamond: 1800000,   // $18,000
    crown: 2200000,     // $22,000
    elite: 3000000,     // $30,000
  };
  return bonuses[rank];
}

/**
 * Helper: Months Between Two Dates
 */
function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 +
         (end.getMonth() - start.getMonth());
}
```

---

### Phase 4: Update Override Resolution (override-resolution.ts)
**File:** `src/lib/compensation/override-resolution.ts`
**Tests affected:** override-resolution.test.ts (16 tests)
**Time:** 2 hours

**Key Changes:**
1. Import from updated `config.ts` (9 ranks, correct schedules)
2. Update `getOverridePercentage()` calls to use async version from config-loader
3. Ensure override pool calculation uses `overridePoolCents` (not `overridePool`)

**Most of this file should work as-is** once config.ts is updated, but verify:
- Line 158: `getOverridePercentage(member.techRank, matrixLevel)` returns correct percentages
- Line 125: `waterfall.overridePoolCents` exists (need to update waterfall import)

---

### Phase 5: Update Bonus Programs (bonus-programs.ts)
**File:** `src/lib/compensation/bonus-programs.ts`
**Tests affected:** bonus-programs.test.ts (8 tests)
**Time:** 1 hour

**Key Changes:**
1. Import `getRankBonus()` and `shouldPayRankBonus()` from `rank.ts`
2. Update references to use 9 ranks instead of 6

**Lines to update:**
- Line 79: Import missing functions
- Line 14-16: Add type imports for TechRank

---

### Phase 6: Update Config Loader (config-loader.ts)
**File:** `src/lib/compensation/config-loader.ts`
**Tests affected:** config-loader.test.ts (47 tests)
**Time:** 1 hour

**Key Changes:**
1. Update all imports to reference new config structure
2. Update return types to use new interfaces
3. Update hardcoded fallbacks to use new config

**Specific updates:**
- Line 174: Return `TECH_RANKS` (9 ranks)
- Line 228: Return `TECH_RANK_REQUIREMENTS` (9 ranks with downline)
- Line 289: Return `RANKED_OVERRIDE_SCHEDULES` (9 ranks)
- Line 360: Update bonus/leadership pool percentages (3.5% and 1.5%)

---

## Testing Strategy

### Step 1: Test After Each Phase
```bash
# After Phase 1 (config.ts)
npm test -- tests/unit/lib/compensation/config-loader.test.ts

# After Phase 2 (waterfall.ts)
npm test -- tests/unit/lib/compensation/waterfall.test.ts

# After Phase 3 (rank.ts)
npm test -- tests/unit/lib/compensation/rank.test.ts

# After Phase 4 (override-resolution.ts)
npm test -- tests/unit/lib/compensation/override-resolution.test.ts

# After Phase 5 (bonus-programs.ts)
npm test -- tests/unit/lib/compensation/bonus-programs.test.ts
```

### Step 2: Full Compensation Test Suite
```bash
npm test -- tests/unit/lib/compensation/
```

### Step 3: Verify No Regressions
```bash
# Run full test suite
npm test
```

---

## Success Criteria

- ✅ All 156 compensation tests passing (100%)
- ✅ No breaking changes to existing API endpoints
- ✅ Database schema remains unchanged (already correct)
- ✅ UI continues to work (already uses correct structure)

---

## Rollback Plan

If issues occur:
1. Git branch: `feature/fix-compensation-engine`
2. Each phase is a separate commit
3. Can rollback to any phase
4. Old code is in `src/lib/compensation/_OLD_BACKUP/` (if needed)

---

## Additional Notes

### Files NOT Changing:
- Database migrations (already correct)
- UI components (already correct)
- API routes (minimal changes needed)
- Autopilot system (completely separate)

### Files Changing:
- `src/lib/compensation/config.ts` (major rewrite)
- `src/lib/compensation/waterfall.ts` (complete rewrite)
- `src/lib/compensation/rank.ts` (complete rewrite)
- `src/lib/compensation/config-loader.ts` (update imports/returns)
- `src/lib/compensation/override-resolution.ts` (minor updates)
- `src/lib/compensation/bonus-programs.ts` (minor updates)

---

## Next Steps

1. **Create feature branch:** `git checkout -b feature/fix-compensation-engine`
2. **Implement Phase 1:** Update config.ts
3. **Test Phase 1:** Verify config-loader tests pass
4. **Implement Phase 2:** Rewrite waterfall.ts
5. **Continue through Phase 6**
6. **Final testing:** All 156 tests passing
7. **Code review**
8. **Merge to main**

---

**Estimated Total Time:** 2-3 days
**Complexity:** Medium-High
**Risk:** Low (Autopilot unaffected, database already correct)
**Priority:** High (tests failing, but not blocking launch)

---

**Ready to implement?** Start with Phase 1 (config.ts) and test incrementally.
