# Compensation Plan Rebuild Proposal
**DRAFT - Pending Executive Approval**

---

## Overview

This proposal outlines the plan to rebuild BOTH compensation engines (Tech + Insurance) to reflect the accurate dual-tree structure and resolve all documented conflicts.

**Status:** ⚠️ DRAFT - Contains placeholders `[PENDING EXECUTIVE ANSWER]` that must be filled before implementation

---

## Phase 1: Documentation & Design (3-5 days)

### 1.1 Create Single Source of Truth Document ✅

**Deliverable:** `APEX_COMPENSATION_PLAN_V2.md`

**Contents:**
- ✅ Consolidated spec that merges `APEX_COMP_ENGINE_SPEC_FINAL.md` + `Insurance Comp. Plan - Final.txt`
- ✅ All conflicts resolved with `[PENDING]` markers where executive answers needed
- ✅ Clear separation of Tech Ladder vs Insurance Ladder
- ✅ Dual-tree structure documented (Enrollment vs Placement Matrix)

**Placeholders to Fill:**
```
[PENDING: MGA Tier Names]
[PENDING: Base Shop Override - 15% or 20%?]
[PENDING: 90-Day Production Thresholds]
[PENDING: Downline Producer Definition Enforcement]
[PENDING: Override Access by Rank]
[PENDING: Recruitment Rollup Logic]
```

---

### 1.2 Database Schema Design ✅

**Deliverable:** `supabase/migrations/20260321000001_rebuild_comp_plan_schema.sql`

**Changes:**
1. **Clarify Two Tree Structures:**
   ```sql
   -- ENROLLMENT TREE (unlimited width)
   members.enroller_id → tracks who recruited you
   members.sponsor_id → tracks who you report to for overrides

   -- PLACEMENT MATRIX (5-wide, 7-deep)
   distributors.matrix_parent_id → your position parent
   distributors.matrix_position → 1-5
   distributors.matrix_depth → 0-7
   ```

2. **Add Recruitment Rollup Tracking:**
   ```sql
   -- For Pre-Associate/Associate recruits that roll up
   ALTER TABLE members ADD COLUMN temporary_sponsor_id UUID;
   ALTER TABLE members ADD COLUMN original_recruiter_id UUID;
   ALTER TABLE members ADD COLUMN rollup_released_at TIMESTAMP;

   -- When recruiter hits Agent (70%), set rollup_released_at = NOW()
   -- and transfer sponsor_id back from upline to original_recruiter_id
   ```

3. **Add Downline Producer Tracking:**
   ```sql
   CREATE TABLE downline_producer_qualifications (
     member_id UUID PRIMARY KEY,
     month_1_production DECIMAL(10,2),
     month_2_production DECIMAL(10,2),
     first_qualified_at TIMESTAMP,
     last_qualified_at TIMESTAMP,
     is_currently_qualified BOOLEAN,
     apex_tenure_days INTEGER,

     CONSTRAINT qualifies_as_downline CHECK (
       month_1_production >= 2500
       AND month_2_production >= 2500
       AND apex_tenure_days >= 90
       [PENDING: Executive confirmation if we enforce this]
     )
   );
   ```

4. **Add Insurance Rank Tracking:**
   ```sql
   ALTER TABLE members ADD COLUMN insurance_rank TEXT;
   -- Values: 'new_hire', 'pre_associate', 'associate', 'agent', 'sr_agent', 'mga'

   ALTER TABLE members ADD COLUMN insurance_commission_rate DECIMAL(5,2);
   -- 50%, 55%, 60%, 70%, 80%, 90%

   ALTER TABLE members ADD COLUMN insurance_annual_production DECIMAL(12,2);
   ALTER TABLE members ADD COLUMN insurance_90day_production DECIMAL(12,2);

   ALTER TABLE members ADD COLUMN qualified_downline_count INTEGER DEFAULT 0;
   -- Only counts agents meeting $2,500/mo × 2 months + 90 days
   [PENDING: Executive confirmation]
   ```

5. **Add Override Access Restrictions:**
   ```sql
   CREATE TABLE override_access_by_rank (
     rank TEXT PRIMARY KEY,
     max_generation INTEGER,

     -- [PENDING: Executive confirmation]
     -- Agent (70%): 3 generations
     -- Sr. Agent (80%): 5 generations
     -- MGA (90%): 6 generations
   );

   INSERT INTO override_access_by_rank VALUES
     ('agent', 3),        -- [PENDING]
     ('sr_agent', 5),     -- [PENDING]
     ('mga', 6);
   ```

---

### 1.3 Compensation Engine Architecture ✅

**Deliverable:** Architecture diagram + pseudocode

**Two Separate Engines:**

```
┌─────────────────────────────────────────────────────────────┐
│  TECH LADDER COMPENSATION ENGINE                            │
│  - 5-wide forced matrix (matrix_parent_id, matrix_position) │
│  - 7 levels deep (only L1-L5 pay overrides)                 │
│  - Ranks: Starter → Bronze → Silver → Gold → Platinum       │
│  - Override pool calculation (40% of commission pool)       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  INSURANCE LADDER COMPENSATION ENGINE                       │
│  - Unlimited width generational (enroller_id, sponsor_id)   │
│  - 6 generations of overrides (Gen 1-6)                     │
│  - Ranks: New Hire → Pre-Assoc → Assoc → Agent → Sr → MGA  │
│  - Direct carrier commission rates (50% → 90%)              │
│  - Override percentages: 15%, 5%, 3%, 2%, 1%, 0.5%         │
│  - Recruitment rollup for ranks < Agent                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CROSS-CREDIT SYSTEM (One-Way: Tech → Insurance)           │
│  - Licensed agents CAN use tech product credits             │
│  - Non-licensed members CANNOT benefit from insurance       │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Insurance Ladder Implementation (7-10 days)

### 2.1 Rank Calculation Engine ✅

**File:** `src/lib/compensation/insurance/rank-calculator.ts`

**Pseudocode:**
```typescript
function calculateInsuranceRank(member: Member): InsuranceRank {
  const production90Day = getProductionLast90Days(member.member_id);
  const productionAnnual = getProductionLast12Months(member.member_id);
  const qualifiedDownline = getQualifiedDownlineCount(member.member_id);
  const newProducers = getNewProducersLast90Days(member.member_id);

  // [PENDING: Which production threshold to use? 90-day or annual?]
  const threshold = production90Day; // or productionAnnual?

  // Rank advancement logic
  if (threshold >= [PENDING: $150K or $600K/4?] && qualifiedDownline >= 10 && newProducers >= 3) {
    return 'mga'; // 90%
  }
  if (threshold >= [PENDING: $75K or $300K/4?] && qualifiedDownline >= 5 && newProducers >= 1) {
    return 'sr_agent'; // 80%
  }
  if (threshold >= [PENDING: $30K or $120K/4?]) {
    return 'agent'; // 70%
  }
  if (threshold >= [PENDING: $20K or $80K/4?]) {
    return 'associate'; // 60%
  }
  if (threshold >= [PENDING: $10K or $40K/4?]) {
    return 'pre_associate'; // 55%
  }

  return 'new_hire'; // 50%
}
```

---

### 2.2 Qualified Downline Counter ✅

**File:** `src/lib/compensation/insurance/downline-qualifier.ts`

**Logic:**
```typescript
function isQualifiedDownlineProducer(member: Member): boolean {
  const tenureDays = daysSince(member.created_at);
  if (tenureDays < 90) return false; // Must be 90+ days

  const last2Months = getProductionLast2Months(member.member_id);
  // last2Months = [{ month: 'Feb', amount: 2800 }, { month: 'Mar', amount: 3200 }]

  // [PENDING: Executive confirmation - do we enforce $2,500/mo rule?]
  const meetsMinimum = last2Months.every(m => m.amount >= 2500);

  return meetsMinimum;
}

function getQualifiedDownlineCount(uplineMemberId: UUID): number {
  const allDownline = getAllDownlineMembers(uplineMemberId);

  return allDownline.filter(m => isQualifiedDownlineProducer(m)).length;
}
```

---

### 2.3 Recruitment Rollup Engine ✅

**File:** `src/lib/compensation/insurance/recruitment-rollup.ts`

**Logic:**
```typescript
async function handleNewRecruitment(
  recruiter: Member,
  newRecruit: Member
): Promise<void> {
  // Set enrollment tree (always the recruiter)
  newRecruit.enroller_id = recruiter.member_id;

  // Determine sponsor (who gets overrides)
  if (recruiter.insurance_rank in ['new_hire', 'pre_associate', 'associate']) {
    // [PENDING: Executive confirmation]
    // Recruit "rolls up" to recruiter's upline for training
    newRecruit.sponsor_id = recruiter.sponsor_id; // Phil or Ahn
    newRecruit.temporary_sponsor_id = recruiter.sponsor_id;
    newRecruit.original_recruiter_id = recruiter.member_id;

    // Recruiter gets 35% production credit
    await grantProductionCredit(recruiter.member_id, newRecruit.member_id, 0.35);

  } else {
    // Agent (70%) or higher - recruit comes directly to them
    newRecruit.sponsor_id = recruiter.member_id;
    newRecruit.temporary_sponsor_id = null;
    newRecruit.original_recruiter_id = recruiter.member_id;
  }

  await saveRecruitment(newRecruit);
}

// When recruiter advances to Agent (70%)
async function handleRankAdvancement(member: Member, newRank: string): Promise<void> {
  if (newRank === 'agent' || newRank === 'sr_agent' || newRank === 'mga') {
    // [PENDING: Executive confirmation - do recruits come back?]
    // Find all recruits that rolled up to upline
    const rolledUpRecruits = await query(`
      SELECT * FROM members
      WHERE original_recruiter_id = $1
        AND temporary_sponsor_id IS NOT NULL
        AND rollup_released_at IS NULL
    `, [member.member_id]);

    // Transfer them back to the recruiter
    for (const recruit of rolledUpRecruits) {
      recruit.sponsor_id = member.member_id; // Now they report to original recruiter
      recruit.rollup_released_at = NOW();
      await update(recruit);
    }
  }
}
```

---

### 2.4 Override Payment Engine ✅

**File:** `src/lib/compensation/insurance/override-calculator.ts`

**Logic:**
```typescript
function calculateInsuranceOverrides(member: Member, sale: Sale): Override[] {
  const overrides: Override[] = [];

  // Traverse up sponsor_id chain (not enroller_id!)
  let currentUpline = getUpline(sale.agent_member_id);
  let generation = 1;

  while (currentUpline && generation <= 6) {
    // [PENDING: Executive confirmation - restrict by rank?]
    const maxGenForRank = getMaxOverrideGeneration(currentUpline.insurance_rank);
    // Agent: 3, Sr. Agent: 5, MGA: 6

    if (generation > maxGenForRank) {
      // Skip this upline, go to next
      currentUpline = getUpline(currentUpline.member_id);
      generation++;
      continue;
    }

    const overridePercent = getOverridePercent(generation);
    // Gen 1: 15%, Gen 2: 5%, Gen 3: 3%, Gen 4: 2%, Gen 5: 1%, Gen 6: 0.5%

    const overrideAmount = sale.commissionable_premium * (overridePercent / 100);

    overrides.push({
      upline_member_id: currentUpline.member_id,
      generation: generation,
      percent: overridePercent,
      amount: overrideAmount,
      sale_id: sale.id
    });

    currentUpline = getUpline(currentUpline.member_id);
    generation++;
  }

  return overrides;
}
```

---

### 2.5 MGA Base Shop Override ✅

**File:** `src/lib/compensation/insurance/mga-base-shop.ts`

**Logic:**
```typescript
function calculateMGABaseShopOverride(mga: Member, quarterProduction: number): number {
  if (mga.insurance_rank !== 'mga') return 0;

  // [PENDING: Executive answer - 15% or 20%?]
  const baseShopOverrideRate = [PENDING: 0.15 or 0.20];

  return quarterProduction * baseShopOverrideRate;
}

// Example: $600K annual = $150K/quarter
// If 20%: $150K × 0.20 = $30,000/quarter = $120K/year
// If 15%: $150K × 0.15 = $22,500/quarter = $90K/year
```

---

## Phase 3: Tech Ladder Implementation (7-10 days)

### 3.1 Matrix Placement Engine ✅

**File:** `src/lib/compensation/tech/matrix-placer.ts`

**Logic:**
```typescript
function placeInMatrix(
  newDistributor: Distributor,
  enroller: Distributor
): MatrixPosition {
  // Find first available position in enroller's matrix
  const available = findFirstAvailablePosition(enroller.id);

  if (available) {
    // Place directly under enroller
    return {
      matrix_parent_id: enroller.id,
      matrix_position: available.position, // 1-5
      matrix_depth: available.depth
    };
  } else {
    // Enroller's Level 1 is full - spillover
    const spilloverPosition = findSpilloverPosition(enroller.id);

    return {
      matrix_parent_id: spilloverPosition.parent_id,
      matrix_position: spilloverPosition.position,
      matrix_depth: spilloverPosition.depth
    };
  }
}

function findFirstAvailablePosition(parentId: UUID): Position | null {
  // Check positions 1-5 at Level 1 (direct children)
  for (let pos = 1; pos <= 5; pos++) {
    const exists = checkPositionTaken(parentId, pos, 1);
    if (!exists) {
      return { parent_id: parentId, position: pos, depth: 1 };
    }
  }

  // Level 1 full - recurse to Level 2
  const level1Children = getChildren(parentId);
  for (const child of level1Children) {
    const available = findFirstAvailablePosition(child.id);
    if (available) return available;
  }

  return null; // Matrix full (shouldn't happen - 19,531 positions!)
}
```

---

### 3.2 Matrix Override Calculator ✅

**File:** `src/lib/compensation/tech/matrix-override-calculator.ts`

**Logic:**
```typescript
function calculateTechMatrixOverrides(
  member: Member,
  sale: TechProductSale
): Override[] {
  const overrides: Override[] = [];

  // Get member's rank
  const rank = member.tech_rank; // 'starter', 'bronze', 'silver', 'gold', 'platinum'
  const maxLevel = getTechMaxLevel(rank);
  // Starter: 1, Bronze: 2, Silver: 3, Gold: 4, Platinum: 5

  // Calculate override pool from sale
  const overridePool = calculateOverridePool(sale.price);
  // Price → BotMakers 30% → Apex 30% → Pools → Override Pool (40% of commission pool)

  // Traverse UP the matrix tree (matrix_parent_id)
  let currentUpline = getMatrixParent(sale.distributor_id);
  let level = 1;

  while (currentUpline && level <= 5) { // Max 5 levels pay
    if (level > maxLevel) {
      // This member's rank doesn't allow this level
      currentUpline = getMatrixParent(currentUpline.distributor_id);
      level++;
      continue;
    }

    const levelPercent = getTechLevelPercent(level);
    // L1: 30%, L2: 25%, L3: 20%, L4: 15%, L5: 10%

    const overrideAmount = overridePool * (levelPercent / 100);

    overrides.push({
      upline_distributor_id: currentUpline.distributor_id,
      level: level,
      percent: levelPercent,
      amount: overrideAmount,
      sale_id: sale.id
    });

    currentUpline = getMatrixParent(currentUpline.distributor_id);
    level++;
  }

  return overrides;
}
```

---

### 3.3 Enroller Override (30% on ALL Directs) ✅

**File:** `src/lib/compensation/tech/enroller-override.ts`

**Logic:**
```typescript
function calculateEnrollerOverride(sale: TechProductSale): Override | null {
  // Get who enrolled this person (enroller_id)
  const seller = getDistributor(sale.distributor_id);
  const enroller = getDistributor(seller.enroller_id);

  if (!enroller) return null; // Top of tree

  // Calculate override pool
  const overridePool = calculateOverridePool(sale.price);

  // Enroller gets 30% of override pool (Level 1 rate)
  const enrollerAmount = overridePool * 0.30;

  return {
    upline_distributor_id: enroller.id,
    type: 'enroller_override',
    percent: 30,
    amount: enrollerAmount,
    sale_id: sale.id
  };
}

// This is SEPARATE from matrix overrides
// You can earn BOTH:
// 1. Enroller override (30%) on all your personal recruits
// 2. Matrix overrides (based on matrix_parent_id placement)
```

---

## Phase 4: UI Rebuild (5-7 days)

### 4.1 Matrix Page Rebuild ✅

**File:** `src/app/dashboard/matrix/page.tsx`

**Changes:**
```typescript
// BEFORE: Shows enrollment tree (enroller_id)
const { data: allMembers } = await serviceClient
  .from('members')
  .select(`...`)
  .eq('enroller_id', currentMemberId); // ❌ WRONG

// AFTER: Shows BOTH trees in separate sections
const enrollmentTree = await getEnrollmentTree(currentMemberId);
const placementMatrix = await getPlacementMatrix(currentDistributorId);

return (
  <div>
    <Section title="Personal Team (Direct Recruits)">
      {/* Shows enrollment tree - unlimited width */}
      <EnrollmentTreeView data={enrollmentTree} />
    </Section>

    <Section title="Matrix Organization (5-Wide Placement)">
      {/* Shows 5-wide matrix - exactly 5 positions per level */}
      <MatrixGridView data={placementMatrix} maxWidth={5} />
    </Section>
  </div>
);
```

---

### 4.2 Dashboard Widgets ✅

**New Widgets:**

1. **Insurance Rank Progress**
   - Current rank
   - Next rank requirements
   - Progress bars:
     - 90-day production: $XX,XXX / $XX,XXX
     - Qualified downline: X / X agents
     - New producers: X / X this quarter

2. **Tech Rank Progress**
   - Current rank
   - Matrix depth access (Starter = L1, Bronze = L1-L2, etc.)
   - Matrix fill percentage: XX% (filled positions / total available)

3. **Dual Commission Display**
   - Insurance commissions (direct carrier payments)
   - Tech overrides (matrix + enroller)
   - Monthly total

4. **Recruitment Rollup Tracker** (for Pre-Associate/Associate)
   - "You have X recruits currently under [Upline Name]"
   - "Reach Agent rank to start earning overrides on them"
   - "35% of their production counts toward your promotion"

---

## Phase 5: Testing & QA (5-7 days)

### 5.1 Unit Tests ✅

**Coverage:**
- ✅ Rank calculation (all edge cases)
- ✅ Downline qualification ($2,499 vs $2,500, 89 days vs 90 days)
- ✅ Recruitment rollup (Pre-Associate recruits, then advances to Agent)
- ✅ Override calculation (6 generations, rank restrictions)
- ✅ Matrix placement (spillover scenarios)
- ✅ Waterfall calculation (price → override pool)

---

### 5.2 Integration Tests ✅

**Scenarios:**
1. **New Member Signup** → Check enrollment + matrix placement
2. **Rank Advancement** → Check rollup release + override access change
3. **Sale Processing** → Check all overrides calculated correctly
4. **Quarterly Rank Review** → Check production reset doesn't affect rank retention

---

### 5.3 Data Migration Testing ✅

**Test on Staging:**
1. Migrate existing 64 distributors into new schema
2. Verify all 42 placed distributors have correct matrix_parent_id
3. Place the 22 unplaced distributors
4. Recalculate all ranks using new logic
5. Compare old vs new - document any changes

---

## Phase 6: Migration & Launch (3-5 days)

### 6.1 Data Migration Script ✅

**File:** `scripts/migrate-to-dual-tree-comp-plan.ts`

**Steps:**
1. Backup production database
2. Run schema migration
3. Populate `temporary_sponsor_id` for existing recruits under Pre-Associate/Associate recruiters
4. Recalculate `qualified_downline_count` for all members
5. Recalculate insurance ranks using new thresholds
6. Place unplaced distributors into matrix
7. Verify all calculations match expected values

---

### 6.2 Rollback Plan ✅

**If something goes wrong:**
1. Database snapshot restore (5 minutes)
2. Revert to previous codebase version
3. Document what failed
4. Fix and retry

---

## Timeline Summary

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| **Phase 1: Documentation** | 3-5 days | ⚠️ PENDING executive answers |
| **Phase 2: Insurance Ladder** | 7-10 days | Requires Phase 1 complete |
| **Phase 3: Tech Ladder** | 7-10 days | Can run parallel with Phase 2 |
| **Phase 4: UI Rebuild** | 5-7 days | Requires Phase 2 & 3 complete |
| **Phase 5: Testing** | 5-7 days | Requires Phase 4 complete |
| **Phase 6: Migration** | 3-5 days | Requires Phase 5 complete |
| **TOTAL** | **30-44 days** | ~6-9 weeks |

**Critical Path:** Executive answers → Phase 1 → Phase 2/3 → Phase 4 → Phase 5 → Phase 6

---

## Risk Mitigation

### Risk #1: Executive Answers Delayed
**Mitigation:** Implement with `[PENDING]` placeholders, make values configurable via environment variables, can update later without code changes

### Risk #2: Data Migration Errors
**Mitigation:** Test on staging first, create rollback plan, backup before migration

### Risk #3: Existing Agents Affected
**Mitigation:** Grandfather existing agents under old rules, new rules only apply to new signups

### Risk #4: Regulatory Compliance
**Mitigation:** Get legal sign-off on finalized plan before launch, ensure state insurance compliance

---

## Cost Analysis

**Development Cost:**
- 30-44 days of development time
- Assumes single full-time developer

**Operational Cost:**
- Database storage: Minimal increase (new columns/tables)
- Compute: Minimal increase (override calculations run nightly)

**Business Risk Cost:**
- Current overpayment risk: Unknown (need audit)
- Agent confusion cost: Medium (inconsistent documentation)
- Regulatory risk: High (misaligned comp plan could trigger investigation)

---

## Success Criteria

✅ **Single source of truth** compensation plan document
✅ **All conflicts resolved** with executive sign-off
✅ **Dual-tree system** correctly implemented (enrollment + matrix)
✅ **Recruitment rollup** working for Pre-Associate/Associate
✅ **Qualified downline counter** accurate
✅ **Override payments** calculated correctly
✅ **Matrix display** shows 5-wide placement (not unlimited enrollment tree)
✅ **All existing data** migrated successfully
✅ **100% test coverage** on all comp calculations
✅ **Legal compliance** verified

---

## Approval Required

**I need your sign-off on:**

1. ✅ This overall plan structure
2. ✅ Timeline (6-9 weeks acceptable?)
3. ✅ Proceeding with `[PENDING]` placeholders until executive answers received
4. ✅ Grandfather clause for existing agents vs new rules for new signups
5. ✅ Budget approval (development time)

**Once approved, I will:**
1. Start Phase 1 immediately (documentation with placeholders)
2. Schedule daily standups to report progress
3. Escalate blockers immediately
4. Deliver working prototype for Phase 2 within 10 days

---

## Next Steps

**Immediate (Today):**
- [ ] You approve this plan
- [ ] I start Phase 1 documentation

**Week 1:**
- [ ] Send executive questions memo
- [ ] Create `APEX_COMPENSATION_PLAN_V2.md` with placeholders
- [ ] Design database schema
- [ ] Get legal review of recruitment rollup approach

**Week 2:**
- [ ] Receive executive answers
- [ ] Fill in placeholders
- [ ] Begin Phase 2 (Insurance Ladder implementation)

**Week 3-4:**
- [ ] Complete Phase 2 & 3 (both comp engines)
- [ ] Demo working prototype

**Week 5-6:**
- [ ] UI rebuild
- [ ] Testing

**Week 7-8:**
- [ ] Staging migration
- [ ] Final QA
- [ ] Production launch

---

**Ready to proceed? Let me know if you want me to adjust anything in this plan.**

---

## Appendix: Quick Reference

### Enrollment Tree vs Placement Matrix

```
ENROLLMENT TREE (enroller_id):
- Purpose: Track who recruited whom
- Width: UNLIMITED
- Commission: 30% on ALL personal directs (Level 1 enroller override)
- Insurance side uses this for generational overrides

PLACEMENT MATRIX (matrix_parent_id):
- Purpose: 5-wide forced matrix with spillover
- Width: 5 positions per level (P1-P5)
- Depth: 7 levels (19,531 positions)
- Commission: Override percentages by level (L1: 30%, L2: 25%, etc.)
- Tech side uses this exclusively
```

### Recruitment Rollup Summary

```
Pre-Associate recruits John:
├─ enroller_id: Pre-Associate ✓ (credit for recruitment)
├─ sponsor_id: Phil/Ahn ✓ (overrides go to upline)
└─ temporary_sponsor_id: Phil/Ahn ✓ (marked for rollback later)

Pre-Associate advances to Agent:
└─ John's sponsor_id changes: Phil/Ahn → Pre-Associate (now Agent)
   └─ Future overrides go to original recruiter
```
