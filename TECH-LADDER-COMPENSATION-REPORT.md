# Apex Affinity Group - Tech Ladder Compensation Structure
## Complete Analysis & Report

**Generated**: March 21, 2026
**Source Documents**: `COMPENSATION-MASTER-INDEX.md`, `COMPENSATION-STRUCTURE-DIAGRAM.md`, `src/lib/compensation/config.ts`, `src/lib/compensation/types.ts`

---

## 📋 EXECUTIVE SUMMARY

The **Tech Ladder** is one of two separate compensation systems at Apex Affinity Group. It applies exclusively to technology products (PulseGuard, PulseFlow, PulseDrive, PulseCommand, SmartLook, Business Center) and uses a **5-wide forced matrix structure** with 9 advancement ranks.

**Key Characteristics**:
- **Structure**: 5-wide forced matrix (LIMITED to 5 positions per level)
- **Depth**: 7 levels deep (19,531 total positions)
- **Spillover**: Yes (recruits #6+ automatically spill to downline)
- **Commission**: 30% enrollment override + ranked matrix depth overrides
- **Advancement**: 9 ranks from Starter to Elite

---

## 🎯 THE 9 TECH LADDER RANKS

### Complete Rank Structure

| Rank | Personal Credits | Group Credits | Downline Required | One-Time Bonus | Override Depth |
|------|-----------------|---------------|-------------------|----------------|----------------|
| **Starter** | $0 | $0 | None | $0 | L1 only |
| **Bronze** | 150 | 300 | None | $250 | L1-L2 |
| **Silver** | 500 | 1,500 | None | $1,000 | L1-L3 |
| **Gold** | 1,200 | 5,000 | 1 Bronze sponsored | $3,000 | L1-L4 |
| **Platinum** | 2,500 | 15,000 | 2 Silvers sponsored | $7,500 | L1-L5 |
| **Ruby** | 4,000 | 30,000 | 2 Golds sponsored | $12,000 | L1-L5 |
| **Diamond** | 5,000 | 50,000 | 3 Golds OR 2 Platinums | $18,000 | L1-L5 |
| **Crown** | 6,000 | 75,000 | 2 Platinums + 1 Gold | $22,000 | L1-L5 |
| **Elite** | 8,000 | 120,000 | 3 Platinums OR 2 Diamonds | $30,000 | L1-L5 + Leadership Pool |

### Rank Progression Notes:

1. **Monthly Requirements**: Personal and group credits must be maintained monthly
2. **Downline Requirements**: Only count **personally sponsored** members (not just anyone in your matrix)
3. **One-Time Bonuses**: Paid once per rank, per lifetime when rank is first achieved
4. **Grace Period**: 2 months below requirements before demotion
5. **Rank Lock**: New members cannot be demoted for first 6 months

---

## 💰 OVERRIDE SCHEDULES BY RANK

Each rank unlocks specific override levels with specific percentages. These percentages apply to the **Override Pool** (40% of commission pool after waterfall).

### Override Percentages (of Override Pool):

| Rank | L1 | L2 | L3 | L4 | L5 | Total Potential |
|------|----|----|----|----|----|----|
| **Starter** | 30% | - | - | - | - | 30% |
| **Bronze** | 30% | 5% | - | - | - | 35% |
| **Silver** | 30% | 10% | 5% | - | - | 45% |
| **Gold** | 30% | 15% | 10% | 5% | - | 60% |
| **Platinum** | 30% | 18% | 12% | 8% | 3% | 71% |
| **Ruby** | 30% | 20% | 15% | 10% | 5% | 80% |
| **Diamond** | 30% | 22% | 18% | 12% | 8% | 90% |
| **Crown** | 30% | 25% | 20% | 15% | 10% | 100% |
| **Elite** | 30% | 25% | 20% | 15% | 10% | 100% + Leadership Pool |

### Key Rules:

1. **L1 (Level 1) is ALWAYS 30%** - This is the "Enroller Override" and applies to ALL ranks
2. **Higher ranks unlock deeper levels** - You can only earn overrides on levels your rank has unlocked
3. **Higher ranks get higher percentages** - At deeper levels, higher ranks earn more
4. **Elite members also qualify for Leadership Pool** - Additional 1.5% of all revenue split among Elites

---

## 🌳 TWO SEPARATE TREES

The Tech Ladder tracks members in **TWO DIFFERENT STRUCTURES**:

### 1. ENROLLMENT TREE (Unlimited Width)

**Purpose**: Track who recruited whom
**Database Field**: `enroller_id`
**Commission**: 30% on ALL direct recruits (no limit)
**Width**: UNLIMITED

```
                    YOU
                     |
    ┌────┬────┬────┼────┬────┬────┬────┬────┐
    |    |    |    |    |    |    |    |    |
   P1   P2   P3   P4   P5   P6   P7   P8   P9...
  (ALL YOUR DIRECT RECRUITS - UNLIMITED)

You earn 30% override on ALL of these, forever
```

### 2. PLACEMENT MATRIX (5-Wide Forced)

**Purpose**: Organize members into 5-wide matrix for depth overrides
**Database Fields**: `matrix_parent_id`, `matrix_position` (1-5)
**Commission**: Ranked percentages based on depth
**Width**: LIMITED to 5 per level

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
TOTAL: 97,656 positions in full 7-level matrix
```

---

## 📊 HOW SPILLOVER WORKS

### Example: You Recruit 8 People

**Enrollment Tree (30% override on all 8)**:
```
YOU
├─ John (Direct #1) ✅ 30% override
├─ Sarah (Direct #2) ✅ 30% override
├─ Mike (Direct #3) ✅ 30% override
├─ Lisa (Direct #4) ✅ 30% override
├─ Tom (Direct #5) ✅ 30% override
├─ Amy (Direct #6) ✅ 30% override
├─ Bob (Direct #7) ✅ 30% override
└─ Carol (Direct #8) ✅ 30% override
```

**Placement Matrix (spillover to downline)**:
```
                 YOU
                  |
     ┌────┬────┼────┬────┐
     |    |    |    |    |
   John Sarah Mike Lisa Tom
   (P1) (P2) (P3) (P4) (P5)
     |
  ┌──┼──┬──┬──┐
  |  |  |  |  |
Amy Bob Carol ⬜ ⬜
(P1)(P2)(P3) (P4)(P5)
```

**Commission Breakdown**:
1. **Enrollment Overrides**: 30% on all 8 people (unlimited)
2. **Matrix Overrides** (if Bronze rank):
   - Level 1: Earn on John, Sarah, Mike, Lisa, Tom (5 people)
   - Level 2: Earn on Amy, Bob, Carol (3 people)
   - Total: 8 people in your matrix earning depth overrides

---

## 💵 COMMISSION CALCULATION EXAMPLE

### Scenario: You're a Gold Rank Rep

**Your Production**:
- Personal sales: $2,000/month (1,200 credits)
- Group sales: $8,000/month (5,000+ credits)
- Downline: 1 Bronze sponsored member

**Commission Breakdown**:

#### 1. Seller Commission (Your Personal Sales)

**CORRECT BV WATERFALL FORMULA:**
```
Your sale: PulseCommand at $149/month
Retail: $149.00
STEP 1: BotMakers (30% of retail): $44.70
        Remaining: $104.30
STEP 2: Apex (30% of remaining): $31.29
        Remaining: $73.01
STEP 3: Leadership Pool (1.5% of remaining): $1.10
        Remaining: $71.91
STEP 4: Bonus Pool (3.5% of remaining): $2.52
        BV (Commission Pool): $69.39

YOU EARN:
- Seller Commission (60% of BV) = $41.63/month per subscription
```

**CRITICAL:** ALL commissions calculated from BV ($69.39), NOT retail price ($149)

#### 2. Enrollment Overrides (Your Direct Recruits)
```
You recruited 5 people who each sell $149/month
BV (Commission Pool) per sale: $69.39
YOUR L1 OVERRIDE: 30% of BV = 30% of $69.39 = $20.82/person

Total from 5 directs: $20.82 × 5 = $104.10/month
```

**Note:** L1 enrollment override is 30% of BV, not retail price

#### 3. Matrix Depth Overrides (Gold Rank = L1-L4)
```
BV per sale: $69.39
Override Pool (40% of BV): $27.76

Gold rank override schedule:
- L1: 30% of Override Pool = $8.33/person
- L2: 15% of Override Pool = $4.16/person
- L3: 10% of Override Pool = $2.78/person
- L4: 5% of Override Pool = $1.39/person

Matrix Level 1 (5 people): 5 × $8.33 = $41.65
Matrix Level 2 (25 people): 25 × $4.16 = $104.00
Matrix Level 3 (125 people): 125 × $2.78 = $347.50
Matrix Level 4 (625 people): 625 × $1.39 = $868.75

Total Matrix Overrides: $1,361.90/month
(if matrix is full and everyone is active)
```

**Important:** Matrix overrides are percentages of the Override Pool (40% of BV), not retail price

#### 4. Rank Bonus
```
One-time when you hit Gold: $3,000
```

### Total Potential Monthly Income (Gold Rank):
- Seller Commissions: $41.63
- Enrollment Overrides: $104.10
- Matrix Overrides: $1,361.90
- **TOTAL: ~$1,507.63/month**

**Note:** This assumes full matrix with all positions active. Actual income will vary based on team size and activity.

---

## 🚨 CRITICAL QUALIFICATION RULE

### 50 Credit Minimum for Overrides

**From spec**: "Must generate 50+ personal credits/month to earn overrides and bonuses"

**What this means**:
- **Below 50 credits/month**: You still earn seller commission on your own sales
- **Below 50 credits/month**: You earn $0 in overrides and $0 in bonuses
- **50+ credits/month**: You qualify for ALL overrides and bonuses

**Example**:
- If you only generate 30 personal credits this month
- You keep your seller commission ($59.89 in example above)
- But you get $0 from enrollment overrides
- And $0 from matrix overrides
- And $0 from any bonuses

**This ensures active participation is required to earn team-based commissions.**

---

## 🏗️ DATABASE STRUCTURE

### Members Table (Enrollment Tracking):
```sql
enroller_id UUID    -- Who recruited you (for 30% override)
sponsor_id UUID     -- Insurance side sponsor (may differ)
```

### Distributors Table (Matrix Placement):
```sql
matrix_parent_id UUID    -- Parent in 5-wide matrix
matrix_position INTEGER  -- Which slot (1-5)
matrix_depth INTEGER     -- How deep (0-7)
```

### How It Works:
1. When someone is recruited:
   - `enroller_id` = recruiter's member_id (always)
   - Recruiter earns 30% on all their sales (forever)

2. For matrix placement:
   - System checks: Does recruiter have open slots in Level 1?
   - ✅ Yes → Place recruit in recruiter's matrix (matrix_parent_id = recruiter)
   - ❌ No → Spillover to downline's first available position
   - Set `matrix_position` (1-5) and `matrix_depth`

---

## 📈 WATERFALL (REVENUE SPLIT) - CORRECTED

**SINGLE SOURCE OF TRUTH FOR BV WATERFALL:**

For every tech product sale, revenue splits as follows:

### Standard Products (PulseGuard, PulseFlow, etc.):
```
$149.00 Retail Price
STEP 1: BotMakers (30% of retail): $44.70
        Remaining: $104.30
STEP 2: Apex (30% of remaining): $31.29
        Remaining: $73.01
STEP 3: Leadership Pool (1.5% of remaining): $1.10
        Remaining: $71.91
STEP 4: Bonus Pool (3.5% of remaining): $2.52
        BV (Commission Pool): $69.39
            ├─ Seller (60% of BV): $41.63
            └─ Override Pool (40% of BV): $27.76
                └─ Distributed to upline (L1-L5)
```

**CRITICAL RULE:** ALL commissions (seller + overrides) are calculated from BV ($69.39), NOT retail price ($149.00)

### Business Center ($39/month fixed - EXCEPTION):
```
$39.00 Retail Price (Fixed Split, NOT Waterfall)
├─ BotMakers: $11.00
├─ Apex: $8.00
├─ Seller: $10.00
├─ Sponsor: $8.00 (flat bonus to direct enroller)
├─ Costs: $2.00
└─ Override Pool: $0.00 (NO override pool for BC)
    Bonus Pool: $0.00 (NO bonus pool for BC)
    Leadership Pool: $0.00 (NO leadership pool for BC)
```

**Business Center does NOT use the standard waterfall. It has fixed dollar amounts.**

---

## 🎁 BONUS PROGRAMS

### 1. Rank Advancement Bonuses (One-Time)
- Paid once when you first achieve each rank
- Must be override-qualified (50+ personal credits/month)
- Amounts: $250 (Bronze) to $30,000 (Elite)

### 2. Bonus Pool (3.5% of all revenue)
- Equal share among all members who:
  - Achieved a rank advancement THIS month
  - Are override-qualified (50+ credits)
- Example: If 100 people rank up in January, each gets 1/100th of the pool

### 3. Leadership Pool (1.5% of all revenue - Elite Only)
- Distributed proportionally among Elite members
- Based on personal production volume
- Example: Elite with 2x production gets 2x share

---

## ⚠️ CURRENT SYSTEM STATUS

### ✅ What's Built:
- Database tables with `enroller_id`, `matrix_parent_id`, `matrix_position`
- Type definitions for all 9 ranks
- Override schedules configured
- Rank requirements defined
- Bonus amounts configured

### 🔴 What's Missing/Broken:
1. **Matrix Page Shows Wrong Data**:
   - Currently displays enrollment tree (unlimited width)
   - Should display 5-wide forced matrix
   - 22 distributors are unplaced in matrix

2. **Commission Calculation**:
   - Only calculates enrollment overrides
   - Missing matrix depth override calculation
   - Missing override compression (when upline doesn't qualify)
   - Missing 50-credit qualification check

3. **Rank Advancement**:
   - No automated rank qualification checks
   - No grace period tracking (2 months)
   - No rank lock enforcement (6 months for new reps)
   - No one-time bonus payment system

4. **Spillover Logic**:
   - No automatic placement algorithm
   - Manual placement required for new recruits
   - No "first available position" finder

---

## 🔄 COMPARISON: TECH VS INSURANCE

| Feature | Tech Ladder | Insurance Ladder |
|---------|-------------|------------------|
| **Structure** | 5-wide forced matrix | Unlimited generational |
| **Width** | 5 per level (LIMITED) | UNLIMITED |
| **Depth** | 7 levels | 6 generations |
| **Spillover** | Yes (auto-spillover) | No spillover |
| **Database** | `matrix_parent_id` | `sponsor_id` |
| **Ranks** | 9 tech ranks | 7 insurance ranks |
| **Commission** | 30% L1 + ranked overrides | 15% Gen1 → 0.5% Gen6 |
| **Products** | Tech products only | Insurance only |

**Key Difference**: Tech uses a FORCED 5-wide matrix with spillover. Insurance uses an UNLIMITED generational tree with no width restrictions.

---

## 📅 IMPLEMENTATION ROADMAP

### To Complete Tech Ladder System:

**Phase 1: Database** (2-3 days)
- Add missing fields: `rank_lock_until`, `grace_period_start`
- Create matrix placement algorithm
- Build spillover automation

**Phase 2: Commission Engine** (5-7 days)
- Implement matrix depth override calculation
- Add override compression logic
- Add 50-credit qualification checks
- Build rank advancement automation

**Phase 3: UI** (3-5 days)
- Rebuild matrix page to show 5-wide structure
- Add matrix placement visualization
- Show available positions
- Display override earnings by level

**Phase 4: Testing** (3-5 days)
- Unit tests for rank qualification
- Integration tests for commission calculation
- E2E tests for spillover scenarios

**Total Estimate**: 13-20 days to complete full Tech Ladder system

---

## 📞 KEY CONTACTS & QUESTIONS

**Executive Review Required**: None (Tech Ladder has no documented conflicts)

**Implementation Team**:
- Database: Migration scripts for matrix placement
- Backend: Commission calculation engine rebuild
- Frontend: Matrix visualization components
- Testing: Full coverage of rank advancement logic

---

## 📚 RELATED DOCUMENTATION

- **Master Index**: `COMPENSATION-MASTER-INDEX.md`
- **Structure Diagram**: `COMPENSATION-STRUCTURE-DIAGRAM.md`
- **Type Definitions**: `src/lib/compensation/types.ts`
- **Configuration**: `src/lib/compensation/config.ts`
- **Insurance Ladder**: `INSURANCE-COMP-PLAN-DIAGRAM.md` (separate system)

---

## ✅ SUMMARY

The Tech Ladder is a well-defined 9-rank advancement system using a 5-wide forced matrix structure. It provides:

1. **Unlimited enrollment overrides** (30% on all direct recruits)
2. **Ranked matrix depth overrides** (up to L5 for higher ranks)
3. **One-time rank bonuses** ($250 to $30,000)
4. **Leadership pool access** (Elite rank only)

**Current Status**: Fully documented and configured, but commission calculation engine needs to be built to implement matrix depth overrides and automated rank advancement.

**No Conflicts**: Unlike the Insurance Ladder, the Tech Ladder has no documented conflicts requiring executive resolution.

---

**END OF REPORT**
