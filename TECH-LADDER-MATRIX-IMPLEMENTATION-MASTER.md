# Tech Ladder 5×7 Forced Matrix - Complete Implementation Master Plan

**Date**: March 22, 2026
**Status**: FINAL - All Decisions Made, Ready for Implementation
**Context**: Complete specification for rebuilding Tech Ladder with proper 5×7 forced matrix

---

## 📋 EXECUTIVE SUMMARY

This document consolidates all decisions and specifications for implementing the Tech Ladder 5×7 forced matrix compensation system.

**What Changed**: Moving from enrollment-tree-only display to proper dual-tree system with 5-wide forced matrix placement and depth-based overrides.

**Why**: To properly implement the forced matrix structure with spillover, enabling ranked depth overrides (L2-L5) based on matrix placement while maintaining 30% enrollment overrides for personal recruits.

---

## 🎯 ALL DECISIONS MADE (5 TOPICS)

### ✅ Topic 1: Spillover Algorithm
**Decision**: Left-to-Right, Top-to-Bottom (Breadth-First)
**Document**: `MATRIX-SPILLOVER-ALGORITHM.md`

### ✅ Topic 2: Override Calculation
**Decision**: Dual Override System with Enroller Priority (No Double-Dipping)
**Document**: `TWO-TREES-OVERRIDE-SYSTEM.md`

### ✅ Topic 3: UI Design
**Decision**: Single Matrix View with Enrollment Indicators (⭐ badges)
**Document**: `MATRIX-UI-DESIGN-SPEC.md`

### ✅ Topic 4: Unplaced Distributors
**Decision**: Automatic Placement Using Spillover Algorithm (Backfill by Enrollment Date)
**Document**: `UNPLACED-DISTRIBUTORS-MIGRATION.md`

### ✅ Topic 5: BV System
**Decision**: BV = Commission Pool (After Deductions), Calculated from Actual Price Paid
**Document**: `BV-CALCULATION-REFERENCE.md`

---

## 📚 REFERENCE DOCUMENTS CREATED

All specifications are now documented in 6 comprehensive reference files:

1. **`TECH-LADDER-SPEC-REFERENCE.md`** - Original spec extraction from APEX_COMP_ENGINE_SPEC_FINAL.md
2. **`BV-CALCULATION-REFERENCE.md`** - Complete BV formulas, all products, examples
3. **`MATRIX-SPILLOVER-ALGORITHM.md`** - Spillover placement logic with code
4. **`TWO-TREES-OVERRIDE-SYSTEM.md`** - Enrollment vs matrix trees, override rules
5. **`MATRIX-UI-DESIGN-SPEC.md`** - Complete UI mockups and component structure
6. **`UNPLACED-DISTRIBUTORS-MIGRATION.md`** - Migration script for 22 unplaced members

---

## 🏗️ IMPLEMENTATION ROADMAP

### PHASE 1: Database Layer (2-3 days)

**Goal**: Ensure database schema is correct and add BV tracking

**Tasks**:
1. ✅ Verify existing fields: `matrix_parent_id`, `matrix_position`, `matrix_depth` (already exist)
2. ✅ Add BV tracking fields:
   ```sql
   ALTER TABLE subscriptions ADD COLUMN bv_value DECIMAL(10,2);
   ALTER TABLE members ADD COLUMN personal_bv_monthly INT DEFAULT 0;
   ALTER TABLE members ADD COLUMN group_bv_monthly INT DEFAULT 0;
   ```
3. ✅ Create BV calculation function (see `BV-CALCULATION-REFERENCE.md`)
4. ✅ Add commission ledger tracking (enroller vs matrix override types)

**Files to Create**:
- `supabase/migrations/YYYYMMDD_add_bv_tracking.sql`

---

### PHASE 2: Business Logic Layer (5-7 days)

**Goal**: Implement spillover placement, override calculation, and BV calculation

#### 2A: BV Calculation (1-2 days)

**Tasks**:
1. Create `src/lib/compensation/bv-calculator.ts`
2. Implement waterfall → BV conversion
3. Add product-specific BV rules (Business Center exception)
4. Calculate BV on subscription creation
5. Monthly BV rollup (personal + group)

**Key Function**:
```typescript
export function calculateBV(product: Product, pricePaid: number): number {
  if (product.id === 'business_center') {
    return 39; // Fixed BV
  }
  // Standard: BV = price × 0.4606
  return Math.round(pricePaid * 0.4606);
}
```

#### 2B: Spillover Placement (2-3 days)

**Tasks**:
1. Create `src/lib/matrix/placement-algorithm.ts`
2. Implement breadth-first search for next available position
3. Update member enrollment flow to auto-place in matrix
4. Add matrix placement tracking

**Key Function**:
```typescript
export async function findNextAvailablePosition(
  sponsorId: string
): Promise<MatrixPlacement | null> {
  // See MATRIX-SPILLOVER-ALGORITHM.md for full implementation
}
```

#### 2C: Override Calculation (2-3 days)

**Tasks**:
1. Create `src/lib/compensation/override-calculator.ts`
2. Implement enroller-first logic (check `enroller_id` before `matrix_parent_id`)
3. Add ranked override schedules
4. Implement compression (skip unqualified upline)
5. Add 50 BV minimum qualification check

**Key Function**:
```typescript
export function calculateOverride(
  uplineRep: Member,
  orgMember: Member,
  sale: Sale
): number {
  // See TWO-TREES-OVERRIDE-SYSTEM.md for full implementation
}
```

---

### PHASE 3: Migration Script (1 day)

**Goal**: Place 22 unplaced distributors using spillover algorithm

**Tasks**:
1. Create `scripts/migrate-unplaced-distributors.ts`
2. Test on staging environment
3. Backup production database
4. Run migration on production
5. Verify all placements

**See**: `UNPLACED-DISTRIBUTORS-MIGRATION.md` for complete script

---

### PHASE 4: UI Layer (3-5 days)

**Goal**: Rebuild matrix page to show 5-wide forced matrix with enrollment indicators

#### 4A: Matrix Visualization Components (2-3 days)

**Tasks**:
1. Create `src/components/matrix/MatrixPage.tsx`
2. Create `src/components/matrix/MatrixVisualization.tsx`
3. Create `src/components/matrix/MemberCard.tsx` (with ⭐ badge for enrollments)
4. Create `src/components/matrix/EmptySlotCard.tsx`
5. Create `src/components/matrix/MatrixLevel.tsx`
6. Add responsive design (mobile swipe navigation)

**See**: `MATRIX-UI-DESIGN-SPEC.md` for complete mockups

#### 4B: Update Matrix Page (1 day)

**Tasks**:
1. Replace `src/app/dashboard/matrix/page.tsx`
2. Query using `matrix_parent_id` instead of `enroller_id`
3. Show 5-wide structure (always 5 positions per level)
4. Display empty slots as placeholders
5. Add enrollment badges (⭐) for personal recruits

#### 4C: Member Detail Modal (1 day)

**Tasks**:
1. Create `src/components/matrix/MemberDetailModal.tsx`
2. Show enrollment info (enroller_id)
3. Show matrix info (matrix_parent_id, position, depth)
4. Show commission breakdown
5. Display BV stats (personal, group)

---

### PHASE 5: Commission Engine (3-5 days)

**Goal**: Implement complete commission calculation with dual override system

**Tasks**:
1. Create `src/lib/compensation/commission-engine.ts`
2. Monthly commission run process:
   - Calculate all BV totals (personal + group)
   - Evaluate ranks (check BV requirements)
   - Distribute seller commissions (60% of BV)
   - Distribute overrides (40% of BV) with enroller-first logic
   - Apply compression for unqualified upline
   - Pay rank bonuses
3. Add commission ledger logging
4. Create commission statements for reps

---

### PHASE 6: Rank Advancement (2-3 days)

**Goal**: Automate rank evaluation using BV instead of credits

**Tasks**:
1. Update `src/lib/compensation/rank-evaluator.ts`
2. Use `personal_bv_monthly` and `group_bv_monthly` instead of credits
3. Check downline rank requirements (personally sponsored only)
4. Apply grace period (2 months)
5. Apply rank lock (6 months for new reps)
6. Schedule rank bonuses (one-time per rank)
7. Promotions take effect next month

---

### PHASE 7: Testing (3-5 days)

**Goal**: Comprehensive testing of all matrix and commission logic

#### 7A: Unit Tests

**Test Files**:
- `src/lib/compensation/bv-calculator.test.ts`
- `src/lib/matrix/placement-algorithm.test.ts`
- `src/lib/compensation/override-calculator.test.ts`
- `src/lib/compensation/rank-evaluator.test.ts`

**Test Cases**:
- BV calculation for all products (member vs retail pricing)
- Spillover placement (5-wide enforcement, level depth limits)
- Override calculation (enroller priority, no double-dipping)
- Compression (skip unqualified upline)
- Rank qualification (BV requirements, downline requirements)

#### 7B: Integration Tests

**Test Scenarios**:
1. New member enrollment → Auto-placement in matrix
2. Sale occurs → BV calculated → Overrides distributed correctly
3. Sponsor recruits 6 people → First 5 in Level 1, 6th spills to Level 2
4. Member qualifies for rank → Promotion scheduled for next month
5. Member drops below rank requirements → Grace period applied

#### 7C: E2E Tests

**User Flows**:
- Rep views matrix page → Sees 5-wide structure with enrollment badges
- Rep recruits new member → New member auto-places in matrix
- Rep makes sale → Commission breakdown shows correct overrides
- Rep qualifies for rank → Rank bonus paid

---

### PHASE 8: Deployment (1-2 days)

**Goal**: Deploy to production with zero downtime

**Tasks**:
1. Run migration script on production (place 22 unplaced distributors)
2. Deploy updated code (database layer, business logic, UI)
3. Monitor commission runs
4. Verify matrix displays correctly
5. Check override calculations
6. Confirm BV totals match expected values

---

## ⏱️ TOTAL TIMELINE ESTIMATE

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1 | 2-3 days | Database schema updates |
| Phase 2 | 5-7 days | Business logic (BV, spillover, overrides) |
| Phase 3 | 1 day | Migration script for unplaced distributors |
| Phase 4 | 3-5 days | UI components and matrix page |
| Phase 5 | 3-5 days | Commission engine |
| Phase 6 | 2-3 days | Rank advancement automation |
| Phase 7 | 3-5 days | Testing (unit, integration, E2E) |
| Phase 8 | 1-2 days | Deployment and verification |
| **TOTAL** | **20-35 days** | Complete implementation |

**Recommended**: 4-5 weeks for full implementation with thorough testing

---

## 🎯 CRITICAL SUCCESS FACTORS

### 1. Database Integrity

✅ **Before starting**:
- Backup entire database
- Verify existing matrix fields (`matrix_parent_id`, `matrix_position`, `matrix_depth`)
- Test migration script on staging first

### 2. No Double-Dipping

✅ **Override calculation must**:
- Check `enroller_id` FIRST
- Pay 30% to enroller and STOP
- Then check `matrix_parent_id` for remaining upline
- Each upline member paid ONCE per sale

### 3. BV Accuracy

✅ **BV calculation must**:
- Use actual price paid (member vs retail)
- Calculate AFTER bonus/leadership deductions
- Handle Business Center exception (BV = 39, not commission pool)
- Roll up correctly (personal + group BV)

### 4. Spillover Correctness

✅ **Placement algorithm must**:
- Enforce 5-wide limit (never more than 5 positions per level)
- Fill left-to-right, top-to-bottom (breadth-first)
- Respect 7-level depth limit
- Never skip levels (always fill shallowest available first)

### 5. UI Clarity

✅ **Matrix page must**:
- Show 5-wide structure (always 5 positions per level)
- Display empty slots as placeholders
- Badge personal enrollments (⭐)
- Distinguish spillover members (👥)
- Be responsive (mobile-first)

---

## 🔑 KEY IMPLEMENTATION RULES

### Rule 1: Two Separate Trees
```
ENROLLMENT TREE (enroller_id):
- Unlimited width
- Tracks who recruited whom
- Used for 30% L1 override
- IMMUTABLE (never changes)

PLACEMENT MATRIX (matrix_parent_id):
- 5-wide forced width
- Tracks matrix positions
- Used for L2-L5 depth overrides
- Changes with spillover
```

### Rule 2: Enroller Priority (No Double-Dipping)
```python
if org_member.enroller_id == upline_rep.member_id:
    pay 30% enroller override
    STOP (do not check matrix)
else:
    check matrix_parent_id
    pay ranked matrix override
```

### Rule 3: BV = Commission Pool
```python
# Standard products
bv = round(price_paid * 0.4606)

# Business Center exception
if product == 'business_center':
    bv = 39  # Fixed, not commission pool ($18)
```

### Rule 4: Spillover = Breadth-First
```python
# Always fill shallowest available position first
# Left-to-right within each level
# Never skip levels
```

### Rule 5: 50 BV Minimum for Overrides
```python
if member.personal_bv_monthly < 50:
    overrides = 0
    bonuses = 0
else:
    calculate_overrides()
    calculate_bonuses()
```

---

## 📊 DATA FLOW DIAGRAM

```
NEW ENROLLMENT
    ↓
1. Create member record
   - Set enroller_id (immutable)
    ↓
2. Find matrix placement
   - Run spillover algorithm
   - Find next available position
    ↓
3. Set matrix fields
   - matrix_parent_id
   - matrix_position (1-5)
   - matrix_depth (0-7)
    ↓
4. Member now in BOTH trees
   - Enrollment tree (via enroller_id)
   - Placement matrix (via matrix_parent_id)

WHEN SALE OCCURS
    ↓
1. Calculate BV
   - Use actual price paid
   - BV = price × 0.4606 (or 39 for BC)
    ↓
2. Pay seller (60% of BV)
    ↓
3. Distribute overrides (40% of BV)
   - Check enroller → Pay 30%
   - Check matrix upline → Pay L2-L5 based on rank
   - Skip unqualified upline (compression)
    ↓
4. Log all commissions to ledger

MONTHLY COMMISSION RUN
    ↓
1. Calculate BV totals
   - Personal BV (direct sales)
   - Group BV (entire organization)
    ↓
2. Evaluate ranks
   - Check BV requirements
   - Check downline rank requirements
   - Schedule promotions (take effect next month)
    ↓
3. Pay rank bonuses
   - One-time per rank
   - Only on first achievement
    ↓
4. Distribute all commissions
```

---

## 🧪 TESTING CHECKLIST

### Unit Tests
- [ ] BV calculation (all products, member vs retail)
- [ ] Spillover placement (5-wide enforcement, breadth-first)
- [ ] Override calculation (enroller priority, no double-dipping)
- [ ] Compression (skip unqualified upline)
- [ ] Rank evaluation (BV requirements, downline requirements)

### Integration Tests
- [ ] New enrollment → Auto-placement in matrix
- [ ] Sale → BV calculated → Overrides distributed
- [ ] Spillover scenario (recruit #6 goes to Level 2)
- [ ] Rank qualification → Promotion scheduled
- [ ] Grace period → Demotion delayed

### E2E Tests
- [ ] Matrix page displays 5-wide structure
- [ ] Enrollment badges (⭐) show correctly
- [ ] Empty slots display as placeholders
- [ ] Member detail modal shows correct info
- [ ] Commission statements show correct overrides

### Data Integrity Tests
- [ ] No duplicate matrix positions
- [ ] All positions 1-5 only
- [ ] All depths 0-7 only
- [ ] No orphaned members (missing parent)
- [ ] BV totals match expected values

---

## 📞 ROLLBACK PLAN

If implementation has critical issues:

**Database Rollback**:
```sql
-- Restore from backup
psql -h HOST -U postgres -d DB < backup.sql
```

**Code Rollback**:
```bash
# Revert to previous commit
git revert HEAD
git push
```

**Partial Rollback** (keep database, revert UI):
- Deploy previous UI code
- Keep new database schema (BV fields)
- Manually fix any commission discrepancies

---

## ✅ COMPLETION CRITERIA

**The Tech Ladder 5×7 Forced Matrix implementation is COMPLETE when:**

1. ✅ All 22 unplaced distributors are placed in matrix
2. ✅ Matrix page displays 5-wide structure with enrollment badges
3. ✅ Spillover placement works correctly (recruit #6+ auto-places)
4. ✅ BV calculation matches specification (all products)
5. ✅ Override calculation follows enroller-first rule
6. ✅ No double-dipping (each upline paid once per sale)
7. ✅ Rank evaluation uses BV instead of credits
8. ✅ Commission statements show correct breakdowns
9. ✅ All tests pass (unit, integration, E2E)
10. ✅ Production deployment successful with zero downtime

---

## 📚 REFERENCE DOCUMENTS INDEX

| Document | Purpose |
|----------|---------|
| `TECH-LADDER-SPEC-REFERENCE.md` | Original spec extraction, complete reference |
| `BV-CALCULATION-REFERENCE.md` | BV formulas, all products, examples |
| `MATRIX-SPILLOVER-ALGORITHM.md` | Spillover placement logic, code samples |
| `TWO-TREES-OVERRIDE-SYSTEM.md` | Dual tree system, override rules |
| `MATRIX-UI-DESIGN-SPEC.md` | UI mockups, component structure |
| `UNPLACED-DISTRIBUTORS-MIGRATION.md` | Migration script for 22 unplaced members |
| **This Document** | Master implementation plan, roadmap |

---

## 🎯 FINAL CHECKLIST BEFORE STARTING

**Pre-Implementation**:
- [ ] All 6 reference documents reviewed
- [ ] Database backup created
- [ ] Staging environment ready for testing
- [ ] Team aligned on timeline (4-5 weeks)
- [ ] Clear understanding of dual tree system
- [ ] Clear understanding of enroller-first override rule

**Ready to Start?**:
- [ ] Yes → Begin with Phase 1 (Database Layer)
- [ ] No → Review reference documents, ask questions

---

**END OF MASTER IMPLEMENTATION PLAN**

*All decisions made. All specifications documented. Ready for implementation.*

**Context tokens remaining: ~93,000** ✅
