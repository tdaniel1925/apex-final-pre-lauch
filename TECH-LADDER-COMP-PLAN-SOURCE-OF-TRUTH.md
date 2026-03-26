# 🎯 APEX AFFINITY GROUP - TECH LADDER COMPENSATION PLAN
## SINGLE SOURCE OF TRUTH

**Last Updated**: March 26, 2026
**Status**: AUTHORITATIVE - All code must match this document
**Confidentiality**: INTERNAL ONLY - BV calculations are proprietary

---

## ⚠️ CRITICAL: BV WATERFALL (CONFIDENTIAL)

**ALL commissions and overrides are calculated from BV (Business Volume), NOT retail price.**

### BV Calculation Formula:

```
STEP 1: Customer pays RETAIL PRICE
STEP 2: BotMakers takes 30% of retail price
STEP 3: Apex takes 30% of what's left (after BotMakers)
STEP 4: Leadership Pool gets 1.5% of what's left (after Apex)
STEP 5: Bonus Pool gets 3.5% of what's left (after Leadership)
STEP 6: BV = Everything remaining
STEP 7: Commissions paid from BV
```

### Example: $149 Product

```
Retail Price:                    $149.00

Step 1: BotMakers (30% of retail)
$149.00 × 30% =                  -$44.70
Remaining:                        $104.30

Step 2: Apex (30% of remaining)
$104.30 × 30% =                  -$31.29
Remaining:                        $73.01

Step 3: Leadership Pool (1.5% of remaining)
$73.01 × 1.5% =                  -$1.10
Remaining:                        $71.91

Step 4: Bonus Pool (3.5% of remaining)
$71.91 × 3.5% =                  -$2.52
Remaining:                        $69.39

===================================
BV (Business Volume):             $69.39
===================================

This BV is what commissions are calculated from.
```

---

## 💰 COMMISSION STRUCTURE (3 TYPES)

### 1. Seller Commission (60% of BV)

**Who Gets It**: The person who made the sale
**Amount**: 60% of BV

**Example**:
- Product BV: $69.39
- Seller Commission: $69.39 × 60% = **$41.63**

---

### 2. Enrollment Override (30% of BV - UNLIMITED)

**Who Gets It**: The person who recruited the seller (enroller)
**Amount**: 30% of BV on ALL their direct recruits' sales
**Width**: UNLIMITED - No cap on direct recruits

**Example**:
- You recruit 10 people
- Each sells $149/month product (BV = $69.39)
- You earn: $69.39 × 30% = $20.82 per person
- Total: $20.82 × 10 = **$208.20/month**

**Database Field**: `members.enroller_id`

---

### 3. Matrix Depth Overrides (Varies by Rank)

**Who Gets It**: Upline members in the 5-wide forced matrix
**Amount**: Percentage of BV based on:
  - Your rank
  - Depth level (L1-L5)
**Width**: LIMITED to 5 positions per level

**Database Fields**: `distributors.matrix_parent_id`, `matrix_position`, `matrix_depth`

---

## 🏆 THE 9 TECH LADDER RANKS

| Rank | Personal BV | Group BV | Downline Required | One-Time Bonus | Override Depth |
|------|------------|----------|-------------------|----------------|----------------|
| **Starter** | $0 | $0 | None | $0 | L1 only |
| **Bronze** | $150 | $300 | None | $250 | L1-L2 |
| **Silver** | $500 | $1,500 | None | $1,000 | L1-L3 |
| **Gold** | $1,200 | $5,000 | 1 Bronze sponsored | $3,000 | L1-L4 |
| **Platinum** | $2,500 | $15,000 | 2 Silvers sponsored | $7,500 | L1-L5 |
| **Ruby** | $4,000 | $30,000 | 2 Golds sponsored | $12,000 | L1-L5 |
| **Diamond** | $5,000 | $50,000 | 3 Golds OR 2 Platinums | $18,000 | L1-L5 |
| **Crown** | $6,000 | $75,000 | 2 Platinums + 1 Gold | $22,000 | L1-L5 |
| **Elite** | $8,000 | $120,000 | 3 Platinums OR 2 Diamonds | $30,000 | L1-L5 + Pool |

**Notes**:
- Personal BV and Group BV must be maintained **monthly**
- Downline requirements = **personally sponsored** members (not just matrix members)
- 2-month grace period before demotion
- 6-month rank lock for new members
- One-time bonuses paid once per rank, per lifetime

---

## 📊 MATRIX OVERRIDE PERCENTAGES (OF BV)

| Rank | L1 | L2 | L3 | L4 | L5 |
|------|----|----|----|----|----|
| **Starter** | 30% | - | - | - | - |
| **Bronze** | 30% | 5% | - | - | - |
| **Silver** | 30% | 10% | 5% | - | - |
| **Gold** | 30% | 15% | 10% | 5% | - |
| **Platinum** | 30% | 18% | 12% | 8% | 3% |
| **Ruby** | 30% | 20% | 15% | 10% | 5% |
| **Diamond** | 30% | 22% | 18% | 12% | 8% |
| **Crown** | 30% | 25% | 20% | 15% | 10% |
| **Elite** | 30% | 25% | 20% | 15% | 10% |

**Key Rules**:
1. L1 is ALWAYS 30% (enrollment override) for all ranks
2. Higher ranks unlock deeper levels
3. Percentages apply to BV, not retail price
4. Elite members also qualify for Leadership Pool distribution

---

## 🌳 THE 5-WIDE FORCED MATRIX

### Structure:

```
Level 1:                YOU
                         |
        ┌────┬────┬────┬────┬────┐
        1    2    3    4    5
      (ONLY 5 POSITIONS)

Level 2: Each has 5 = 25 total positions
Level 3: 125 positions
Level 4: 625 positions
Level 5: 3,125 positions
Level 6: 15,625 positions
Level 7: 78,125 positions
```

### Spillover Rules:

- Your first 5 recruits → Placed in YOUR Level 1 (positions 1-5)
- Recruit #6+ → **Spills over** to first available position in downline
- You STILL earn 30% enrollment override on recruit #6+
- PLUS you earn matrix override if they're in your matrix depth

---

## 🚨 QUALIFICATION RULES

### 50 BV Minimum (Monthly)

To earn overrides and bonuses, you MUST generate at least 50 BV/month in personal sales.

**Below 50 BV**:
- ✅ Keep seller commission on your own sales
- ❌ $0 enrollment overrides
- ❌ $0 matrix overrides
- ❌ $0 bonuses

**50+ BV**:
- ✅ All commissions and bonuses qualify

---

## 📈 REAL COMMISSION EXAMPLE

### Scenario: Gold Rank Rep

**Your Stats**:
- Personal BV: $1,200/month (qualified ✅)
- 5 direct recruits (each selling $149/month product)
- Matrix partially filled

### Your Monthly Earnings:

#### 1. Seller Commission (Your Sales)
```
Your sales: $1,200 BV
Commission: $1,200 × 60% = $720/month
```

#### 2. Enrollment Overrides (5 Direct Recruits)
```
Each recruit generates $69.39 BV/month
Override: $69.39 × 30% = $20.82 per person
Total: $20.82 × 5 = $104.10/month
```

#### 3. Matrix Overrides (Gold = L1-L4)
```
Assume 10 people in your matrix total:
- L1: 5 people × $69.39 BV × 30% = $104.09
- L2: 3 people × $69.39 BV × 15% = $31.23
- L3: 2 people × $69.39 BV × 10% = $13.88
- L4: 0 people (not filled yet)

Total Matrix: $149.20/month
```

#### 4. Rank Bonus
```
One-time when you achieved Gold: $3,000
```

### Total Monthly Income:
```
Seller: $720
Enrollment: $104.10
Matrix: $149.20
───────────────
TOTAL: $973.30/month
+ $3,000 one-time rank bonus
```

---

## 🎁 BONUS PROGRAMS

### 1. Rank Advancement Bonuses
- Paid **once** when you first achieve each rank
- Must be qualified (50+ BV/month)
- Non-recoverable if you drop rank later

| Rank | Bonus |
|------|-------|
| Bronze | $250 |
| Silver | $1,000 |
| Gold | $3,000 |
| Platinum | $7,500 |
| Ruby | $12,000 |
| Diamond | $18,000 |
| Crown | $22,000 |
| Elite | $30,000 |

### 2. Bonus Pool (3.5% of All Revenue)
- Distributed **equally** among all members who:
  - Ranked up THIS month
  - Are qualified (50+ BV)
- Example: If 100 people rank up, each gets 1/100th of total pool

### 3. Leadership Pool (1.5% of All Revenue - Elite Only)
- Distributed **proportionally** among Elite members
- Based on personal BV production
- Example: Elite with 2× BV gets 2× share

---

## 💻 TECHNICAL IMPLEMENTATION

### Database Schema:

#### Members Table (Enrollment Tracking)
```sql
enroller_id UUID    -- Who recruited this member
                    -- Used for 30% enrollment override
```

#### Distributors Table (Matrix Placement)
```sql
matrix_parent_id UUID      -- Parent in 5-wide matrix
matrix_position INTEGER    -- Position 1-5
matrix_depth INTEGER       -- Depth 0-7
```

### Commission Calculation Priority:

1. Calculate BV from retail price (waterfall)
2. Pay seller commission (60% of BV)
3. Pay enrollment override to enroller (30% of BV)
4. Walk up matrix tree paying depth overrides (L1-L5)
5. Apply compression if upline unqualified
6. Check 50 BV minimum qualification

---

## 🔒 PRODUCT BV ASSIGNMENTS

**Note**: BV is calculated dynamically via waterfall, not hardcoded per product.

### Standard Tech Products:
- All use the waterfall formula above
- BV = Retail price after: BotMakers (30%) → Apex (30%) → Leadership (1.5%) → Bonus (3.5%)

### Business Center ($39/month - Exception):
- Does NOT use standard waterfall
- Fixed split:
  - BotMakers: $11
  - Apex: $8
  - Seller: $10
  - Sponsor: $8 flat (NOT 30%)
  - Costs: $2
- NO matrix overrides
- NO bonus pool contribution
- NO leadership pool contribution

---

## ✅ VALIDATION CHECKLIST

Use this checklist when implementing or auditing compensation code:

- [ ] BV calculated using correct waterfall (30% → 30% → 1.5% → 3.5%)
- [ ] Seller commission is 60% of BV
- [ ] Enrollment override is 30% of BV (unlimited width)
- [ ] Matrix overrides use rank-based percentages of BV
- [ ] Matrix is 5-wide forced (spillover implemented)
- [ ] 50 BV minimum enforced for overrides
- [ ] Rank requirements check personal + group BV (not retail)
- [ ] Downline requirements check personally sponsored members
- [ ] Business Center uses fixed split (not waterfall)
- [ ] All amounts stored in cents for precision

---

## 📚 RELATED DOCUMENTS

- **Rank Requirements**: See lines 66-145 in `src/lib/compensation/config.ts`
- **Override Schedules**: See lines 147-226 in `src/lib/compensation/config.ts`
- **Waterfall Implementation**: `src/lib/compensation/waterfall.ts`
- **BV Calculator**: `src/lib/compensation/bv-calculator.ts`
- **Matrix Placement**: `src/lib/matrix/placement-algorithm.ts`

---

## 🚨 CONFIDENTIALITY NOTICE

**This document contains proprietary BV calculation formulas.**

**DO NOT**:
- Share with distributors or public
- Include in distributor-facing materials
- Expose in API responses
- Display in UI

**Distributors see**:
- Commission amounts (dollars)
- Rank requirements (BV totals)
- Override percentages

**Distributors do NOT see**:
- BV calculation formula
- Waterfall breakdown
- BotMakers/Apex percentages

---

**END OF DOCUMENT**
