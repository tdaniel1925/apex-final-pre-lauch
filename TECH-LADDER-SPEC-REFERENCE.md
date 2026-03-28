# Tech Ladder 5×7 Forced Matrix - Specification Reference

**Date**: March 21, 2026
**Source**: APEX_COMP_ENGINE_SPEC_FINAL.md
**Purpose**: Complete reference for Tech Ladder matrix implementation discussion

---

## 📋 TABLE OF CONTENTS

1. [Matrix Structure Overview](#matrix-structure-overview)
2. [Two Separate Trees (Critical Distinction)](#two-separate-trees)
3. [Override Commission Rules](#override-commission-rules)
4. [9 Tech Ranks](#9-tech-ranks)
5. [Commission Waterfall](#commission-waterfall)
6. [Products & Credits](#products--credits)
7. [Database Schema](#database-schema)
8. [Commission Calculation Order](#commission-calculation-order)
9. [Key Implementation Rules](#key-implementation-rules)
10. [Current vs Desired State](#current-vs-desired-state)

---

## MATRIX STRUCTURE OVERVIEW

### 5×7 Forced Matrix

| Level | Width | Total Positions | Calculation |
|-------|-------|-----------------|-------------|
| L1 | 1 | 1 | YOU (root) |
| L2 | 5 | 5 | 5 × 1 |
| L3 | 5 | 25 | 5 × 5 |
| L4 | 5 | 125 | 5 × 25 |
| L5 | 5 | 625 | 5 × 125 |
| L6 | 5 | 3,125 | 5 × 625 |
| L7 | 5 | 15,625 | 5 × 3,125 |
| **TOTAL** | — | **19,531** | All positions |

### Key Characteristics

- **Fixed Width**: Exactly 5 positions per level (FORCED)
- **Fixed Depth**: 7 levels maximum
- **Spillover**: Recruit #6+ automatically spills to next available position in downline
- **Geometric Growth**: Each level = 5× previous level
- **Total Capacity**: 19,531 total positions in complete matrix

---

## TWO SEPARATE TREES

**CRITICAL: The Tech Ladder uses TWO DIFFERENT tree structures for DIFFERENT purposes.**

### 1. ENROLLMENT TREE (Unlimited Width)

**Database Field**: `enroller_id` (IMMUTABLE - never changes)

**Purpose**: Track who recruited whom

**Commission**: 30% on ALL direct recruits (L1 override - no limit)

**Width**: UNLIMITED

**Visual Example**:
```
                    YOU
                     |
    ┌────┬────┬────┼────┬────┬────┬────┬────┐
    |    |    |    |    |    |    |    |    |
   P1   P2   P3   P4   P5   P6   P7   P8   P9...
  (ALL YOUR DIRECT RECRUITS - UNLIMITED)

You earn 30% L1 override on ALL of these, forever
```

### 2. PLACEMENT MATRIX (5-Wide Forced)

**Database Fields**: `matrix_parent_id`, `matrix_position` (1-5), `matrix_depth` (0-7)

**Purpose**: Organize members into 5-wide matrix for depth overrides (L2-L5)

**Commission**: Ranked percentages based on depth and rank

**Width**: LIMITED to 5 per level

**Visual Example**:
```
Level 1:                YOU
                         |
        ┌────┬────┬────┼────┬────┐
        |    |    |    |    |    |
       P1   P2   P3   P4   P5
    (ONLY 5 POSITIONS - FORCED WIDTH)

    Recruit #6+ spills to downline

Level 2: Each of the 5 has 5 positions = 25 total
Level 3: 125 positions
Level 4: 625 positions
Level 5: 3,125 positions
Level 6: 15,625 positions
Level 7: 78,125 positions
```

### Why Two Trees?

1. **Enrollment Tree** = Unlimited 30% on personal recruits (incentive to recruit)
2. **Placement Matrix** = Forced 5-wide for depth overrides (incentive to build depth)

---

## OVERRIDE COMMISSION RULES

### 🚨 ENROLLER OVERRIDE RULE (MOST CRITICAL)

**From APEX_COMP_ENGINE_SPEC_FINAL.md Section 5.3:**

```
CRITICAL RULE:
IF org_member.enroller_id == rep.member_id:
    → ALWAYS use L1 rate (30% of override pool)
    → Regardless of matrix position
    → Regardless of rep's rank
ELSE:
    → Use matrix level rate based on rep's current tech rank
    → If level not unlocked for rank → $0

enroller_id is IMMUTABLE. Set at enrollment. Never changes.
Override calculation checks enroller_id BEFORE matrix position.
```

**Translation**:
- If you personally enrolled someone, you get 30% override on them **forever**
- This is true even if they spill out of your direct matrix positions
- After checking enrollments, calculate matrix-based overrides separately

### Override Qualification

**50 Credit Minimum** (Section 5.1):
```python
def check_override_qualified(member):
    """Must generate 50+ personal credits/month to earn overrides and bonuses."""
    member.override_qualified = member.personal_credits_monthly >= 50
    # If not qualified: seller commission still paid, overrides = $0, bonuses = $0
```

**Translation**: You must have 50+ personal credits each month to receive ANY override commissions or bonuses.

### Ranked Override Schedule (% of Override Pool)

From Section 5.2:

| Tech Rank | L1 (enrollees) | L2 | L3 | L4 | L5 |
|-----------|---------------|----|----|----|----|
| Starter | 30% | — | — | — | — |
| Bronze | 30% | 5% | — | — | — |
| Silver | 30% | 10% | 5% | — | — |
| Gold | 30% | 15% | 10% | 5% | — |
| Platinum | 30% | 18% | 12% | 8% | 3% |
| Ruby | 30% | 20% | 15% | 10% | 5% |
| Diamond | 30% | 22% | 18% | 12% | 8% |
| Crown | 30% | 25% | 20% | 15% | 10% |
| Elite | 30% | 25% | 20% | 15% | 10% |

**KEY FACTS**:
- **L1 = 30% for ALL ranks always** (Enroller Override Rule)
- These are **% of the override pool**, NOT % of retail/member price
- Higher ranks unlock deeper levels
- Higher ranks get higher percentages at each level

### Override Calculation Example (Section 5.4)

```python
def calculate_override(rep, org_member, subscription):
    if not rep.override_qualified:
        return 0  # Below 50 credits/month

    if subscription.product_type == 'business_center':
        # BC only pays $8 flat to direct sponsor
        if org_member.enroller_id == rep.member_id:
            return 8.00
        return 0  # BC has no override pool

    wf = waterfall(subscription.monthly_price)
    override_pool = wf['override_pool']
    schedule = TECH_OVERRIDES[rep.tech_rank]

    # CHECK ENROLLER FIRST
    if org_member.enroller_id == rep.member_id:
        rate = 0.30  # Enroller Rule: always L1
        level = 1
        rule = 'enroller'
    else:
        # Check matrix position
        level = get_matrix_level(rep, org_member)
        if level < 1 or level > 5:
            return 0
        rate = schedule[level - 1]
        if rate == 0:
            return 0  # Rank hasn't unlocked this level
        rule = 'positional'

    amount = override_pool * rate
    log_commission(rep, org_member, f'override_l{level}', amount, rule)
    return amount
```

---

## 9 TECH RANKS

From Section 4 - Rank Requirements (Credit-Based Only):

| Rank | Personal Credits/Mo | Group Credits/Mo | Downline Rank Req | Rank Bonus | Override Depth |
|------|---------------------|------------------|-------------------|------------|----------------|
| **Starter** | 0 | 0 | None | — | L1 only |
| **Bronze** | 150 | 300 | None | $250 | L1–L2 |
| **Silver** | 500 | 1,500 | None | $1,000 | L1–L3 |
| **Gold** | 1,200 | 5,000 | 1 Bronze (sponsored) | $3,000 | L1–L4 |
| **Platinum** | 2,500 | 15,000 | 2 Silvers (sponsored) | $7,500 | L1–L5 |
| **Ruby** | 4,000 | 30,000 | 2 Golds (sponsored) | $12,000 | L1–L5 |
| **Diamond** | 5,000 | 50,000 | 3 Golds OR 2 Plat (sponsored) | $18,000 | L1–L5 |
| **Crown** | 6,000 | 75,000 | 2 Plat + 1 Gold (sponsored) | $22,000 | L1–L5 |
| **Elite** | 8,000 | 120,000 | 3 Plat OR 2 Diamond (sponsored) | $30,000 | L1–L5+Ldshp |

**Total rank bonuses Starter→Elite**: $93,750

### Rank Rules

1. **Bonuses**: Paid **once per rank per lifetime** (re-qualification doesn't earn second bonus)
2. **Downline requirements**: Must be **personally sponsored** members (not spillover)
3. **Promotions**: Take effect next month (end-of-month evaluation)
4. **Grace period**: 2 months below requirements before demotion
5. **Rank lock**: New reps cannot be demoted for first 6 months
6. **Minimum floor**: Starter rank always available (seller commission ~27.9% always)

---

## COMMISSION WATERFALL

From Section 1:

### Standard Products (PulseGuard, PulseFlow, etc.)

```
STEP 1: Customer pays PRICE (retail or member)
STEP 2: BotMakers takes 30% of price
         = ADJUSTED GROSS
STEP 3: Apex takes 30% of Adjusted Gross
         = REMAINDER
STEP 4: 3.5% of Remainder → BONUS POOL
STEP 5: 1.5% of Remainder → LEADERSHIP POOL
         = COMMISSION POOL (Remainder - 3.5% - 1.5%)
STEP 6: Seller gets 60% of Commission Pool (~27.9% effective)
STEP 7: Override Pool gets 40% of Commission Pool
         → Distributed across 5 levels based on rank
```

### Business Center Exception (Fixed Split - NOT Waterfall)

```
Business Center $39/mo:
  BotMakers:        $11
  Apex:             $8
  Rep (seller):     $10
  Sponsor:          $8
  Costs/Expenses:   $2
  TOTAL:            $39
  Credits:          39
  Override Pool:    NONE
  Bonus Pool:       NONE
  Leadership Pool:  NONE
```

**BC does NOT flow through the standard waterfall. Fixed dollar amounts only.**

---

## PRODUCTS & CREDITS

From Section 2:

| Product | Member | Retail | Credit % | Mem Credits | Ret Credits |
|---------|--------|--------|----------|-------------|-------------|
| PulseGuard | $59 | $79 | 30% | 18 | 24 |
| PulseFlow | $129 | $149 | 50% | 65 | 75 |
| PulseDrive | $219 | $299 | 100% | 219 | 299 |
| PulseCommand | $349 | $499 | 100% | 349 | 499 |
| SmartLook | $99 | $99 | 40% | 40 | 40 |
| Business Center | $39 | — | — | 39 | — |

### Seller Earnings (after waterfall)

| Product | Member Price | Rep Earns | Eff % | Retail Price | Rep Earns | Eff % |
|---------|--------------|-----------|-------|--------------|-----------|-------|
| PulseGuard | $59 | $16.48 | 27.9% | $79 | $22.06 | 27.9% |
| PulseFlow | $129 | $36.03 | 27.9% | $149 | $41.62 | 27.9% |
| PulseDrive | $219 | $61.17 | 27.9% | $299 | $83.51 | 27.9% |
| PulseCommand | $349 | $97.48 | 27.9% | $499 | $139.37 | 27.9% |
| SmartLook | $99 | $27.65 | 27.9% | $99 | $27.65 | 27.9% |
| Business Center | $39 | $10.00 | 25.6% | — | — | — |

**Note**: User-facing docs show real dollar amounts, never internal waterfall percentages.

---

## DATABASE SCHEMA

From Section 3:

```sql
CREATE TABLE members (
  member_id              UUID PRIMARY KEY,
  enroller_id            UUID NOT NULL,       -- IMMUTABLE (enrollment tree)
  matrix_parent_id       UUID,                -- 5-wide placement matrix
  enrollment_date        TIMESTAMP NOT NULL,

  -- Dual Ranks
  insurance_rank         VARCHAR(20) DEFAULT 'pre_associate',
  tech_rank              VARCHAR(20) DEFAULT 'starter',
  highest_insurance_rank VARCHAR(20) DEFAULT 'pre_associate',
  highest_tech_rank      VARCHAR(20) DEFAULT 'starter',

  -- Credits (measured in production credits, not dollars)
  personal_credits_monthly   INT DEFAULT 0,
  group_credits_monthly      INT DEFAULT 0,

  -- Cross-Credit
  cross_credit_tech_to_ins   INT DEFAULT 0,
  cross_credit_ins_to_tech   INT DEFAULT 0,

  -- Status
  active_status   ENUM('active','inactive','suspended','terminated'),
  bc_active       BOOLEAN DEFAULT FALSE,

  -- Grace
  tech_grace_months      INT DEFAULT 0,
  insurance_grace_months INT DEFAULT 0,

  -- Override Qualification
  override_qualified     BOOLEAN DEFAULT FALSE  -- TRUE if personal_credits >= 50
);
```

**Additional Fields Needed**:
```sql
-- For matrix placement tracking
matrix_position        INTEGER,  -- Which slot (1-5)
matrix_depth          INTEGER,  -- How deep (0-7)
```

---

## COMMISSION CALCULATION ORDER

From Section 9:

```python
def run_pay_period(period):
    # 1. Calculate credits for all members
    for m in active_members:
        m.personal_credits_monthly = sum_product_credits(m) + m.cross_credit_ins_to_tech
        m.group_credits_monthly = sum_org_credits(m)
        m.override_qualified = m.personal_credits_monthly >= 50

    # 2. Evaluate ranks (both ladders) — promotions take effect NEXT month
    for m in active_members:
        evaluate_and_schedule_ranks(m)

    # 3. For each subscription, run waterfall
    for sub in active_subscriptions:
        if sub.product_type == 'business_center':
            pay_bc_fixed_split(sub)  # $10 seller, $8 sponsor, etc.
        else:
            wf = waterfall(sub.monthly_price)
            pay_seller(sub.seller_id, wf['seller_commission'])
            add_to_bonus_pool(wf['bonus_pool'])
            add_to_leadership_pool(wf['leadership_pool'])
            distribute_overrides(sub, wf['override_pool'])

    # 4. Apply payout caps (soft 55%, hard 65%, floor 35%)
    apply_caps(period)

    # 5. Pay rank bonuses for newly promoted members
    pay_scheduled_rank_bonuses(period)

    # 6. Evaluate incentive programs
    evaluate_fast_start(period)
    evaluate_trip_incentives(period)
    evaluate_car_allowances(period)

    # 7. Pay leadership pool shares
    distribute_leadership_shares(period)

    # 8. Process insurance commissions (separate system)
    process_insurance_commissions(period)
```

---

## KEY IMPLEMENTATION RULES

From Section 12 - Key Rules Summary:

1. **Waterfall**: Price → BM 30% → Apex 30% of adj → 3.5% bonus → 1.5% leadership → 60/40 split
2. **BC Exception**: Fixed split $11/$8/$10/$8/$2. 39 credits. No override pool.
3. **Seller commission**: ~27.9% effective (all ranks, day one)
4. **L1 override**: 30% of override pool for ALL ranks on personal enrollees (Enroller Rule)
5. **L2-L5**: Unlock with rank. % of override pool, not % of price.
6. **50 credits/month**: Minimum for override + bonus eligibility
7. **Promotions**: Take effect next month (end-of-month evaluation)
8. **Credit-based only**: No account counts. Everything in production credits.
9. **Downline requirements**: Gold+ requires ranked leaders (personally sponsored)
10. **enroller_id is IMMUTABLE**: Check before matrix position.
11. **Two ranks simultaneously**: Insurance + Tech. Evaluated independently.
12. **Cross-credit**: Tech→Ins (licensed agents only)

---

## CURRENT VS DESIRED STATE

### ✅ What's Currently Built

From database and code:
- Database fields: `enroller_id`, `matrix_parent_id`, `matrix_position`, `matrix_depth`
- 9 tech rank definitions
- Override schedules configured
- Rank requirements defined
- Rank bonus amounts configured

### ❌ What's Broken/Missing

1. **Matrix Page Shows Wrong Data**:
   - Currently displays enrollment tree (unlimited width)
   - Should display 5-wide forced matrix
   - File: `src/app/dashboard/matrix/page.tsx` uses `enroller_id` instead of `matrix_parent_id`

2. **Level Calculator Uses Wrong Field**:
   - File: `src/lib/matrix/level-calculator.ts` uses `enroller_id`
   - Should use `matrix_parent_id` and respect 5-wide limit

3. **Commission Calculation**:
   - Only calculates enrollment overrides (30% L1)
   - Missing matrix depth override calculation (L2-L5)
   - Missing override compression (when upline doesn't qualify)
   - Missing 50-credit qualification check

4. **Rank Advancement**:
   - No automated rank qualification checks
   - No grace period tracking (2 months)
   - No rank lock enforcement (6 months for new reps)
   - No one-time bonus payment system

5. **Spillover Logic**:
   - No automatic placement algorithm
   - Manual placement required for new recruits
   - No "first available position" finder
   - 22 distributors currently unplaced in matrix

6. **UI/UX**:
   - No 5-wide enforcement visualization
   - No empty slot display (should show 5 positions per level)
   - No spillover indicators
   - No matrix vs enrollment tree toggle

---

## 🎯 NEXT STEPS FOR DISCUSSION

**Before implementing, we need to clarify:**

1. **UI Display**: Show both trees separately, or just the matrix?
2. **Existing Distributors**: How to handle the 22 unplaced distributors?
3. **Override Calculation**: Confirm we implement BOTH enrollment override (30% on enrollees) AND matrix overrides (L2-L5 based on position)
4. **Spillover Algorithm**: Define exact rules for placement when positions are full
5. **Other Caveats**: User mentioned "some other caveats" - what are they?

---

**END OF REFERENCE DOCUMENT**

*This document consolidates all relevant Tech Ladder specifications from APEX_COMP_ENGINE_SPEC_FINAL.md for implementation planning.*
