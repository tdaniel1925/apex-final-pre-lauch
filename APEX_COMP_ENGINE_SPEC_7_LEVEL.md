# APEX AFFINITY GROUP — 7-LEVEL COMPENSATION ENGINE SPECIFICATION

> **Version:** 7-LEVEL FINAL
> **Date:** March 31, 2026
> **Purpose:** Technical specification for the Apex dual-ladder compensation engine with 7-level override system.
> **Supersedes:** APEX_COMP_ENGINE_SPEC_FINAL.md (5-level system)

---

## 1. REVENUE WATERFALL

### Standard Products Waterfall

```
STEP 1: Customer pays PRICE (retail or member)
STEP 2: BotMakers takes 30% of price
         = ADJUSTED GROSS
STEP 3: Apex takes 30% of Adjusted Gross
         = REMAINDER
STEP 4: Bonus Pool: 3.5% of Remainder
STEP 5: Leadership Pool: 1.5% of Remainder
         = BV (Business Volume) = Remainder - 5%
STEP 6: Seller gets 60% of BV
STEP 7: Override Pool gets 40% of BV
         → Distributed across 7 levels by rank
         → Unpaid breakage goes 100% to Apex
```

### BUSINESS CENTER EXCEPTION — Fixed Split

```
Business Center $39/mo:
  BotMakers:        $11.00 (30% flat)
  Apex:              $6.00 (flat)
  COGS:              $3.90 (paid to BotMakers separately)
  Rep (seller):      $5.00 (flat)
  Override Pool:    $13.10 ($1.75 per level × 7 levels)
  TOTAL:            $39.00

  Credits:          39 (fixed)
  Bonus Pool:       NONE
  Leadership Pool:  NONE
```

BC does NOT flow through the standard waterfall. Fixed dollar amounts only.

### Waterfall Implementation

```python
def waterfall(price, product_type='standard'):
    if product_type == 'business_center':
        return {
            'price': 39.00,
            'bm_fee': 11.00,
            'apex_take': 6.00,
            'cogs': 3.90,  # Paid to BotMakers separately
            'seller_commission': 5.00,
            'override_pool': 13.10,  # $1.75 × 7 levels
            'override_per_level': 1.75,  # Flat per level
            'bonus_pool': 0,
            'leadership_pool': 0,
        }

    # Standard waterfall
    bm_fee = price * 0.30
    adjusted_gross = price - bm_fee
    apex_take = adjusted_gross * 0.30
    remainder = adjusted_gross - apex_take
    bonus_pool = remainder * 0.035
    leadership_pool = remainder * 0.015
    bv = remainder - bonus_pool - leadership_pool
    seller_commission = bv * 0.60
    override_pool = bv * 0.40

    return {
        'price': price,
        'bm_fee': bm_fee,
        'adjusted_gross': adjusted_gross,
        'apex_take': apex_take,
        'remainder': remainder,
        'bonus_pool': bonus_pool,
        'leadership_pool': leadership_pool,
        'bv': bv,
        'seller_commission': seller_commission,
        'override_pool': override_pool,
    }
```

---

## 2. PRODUCTS & BUSINESS VOLUME

| Product | Member | Retail | QV % | QV (Member) | QV (Retail) | BV (Member) | BV (Retail) |
|---|---|---|---|---|---|---|---|
| PulseMarket | $59 | $79 | 100% | 59 | 79 | $27.58 | $36.94 |
| PulseFlow | $129 | $149 | 100% | 129 | 149 | $60.32 | $69.65 |
| PulseDrive | $249 | $299 | 100% | 249 | 299 | $116.48 | $139.83 |
| PulseCommand | $399 | $499 | 100% | 399 | 499 | $186.62 | $233.37 |
| SmartLook | $99 | $99 | 100% | 99 | 99 | $46.29 | $46.29 |
| Business Center | $39 | — | — | 39 | — | $18.10 | — |

### QV & BV Calculation

```python
def calc_qv_and_bv(product, price_type):
    if product.slug == 'business_center':
        return {'qv': 39, 'bv': 18.10}

    price = product.member_price if price_type == 'member' else product.retail_price
    qv = round(price * product.qv_pct)  # Usually 100%

    # Calculate BV from waterfall
    waterfall_result = waterfall(price, 'standard')
    bv = waterfall_result['bv']

    return {'qv': qv, 'bv': bv}
```

### Seller Earnings (after waterfall)

| Product | Member Price | Rep Earns | Eff % | Retail Price | Rep Earns | Eff % |
|---|---|---|---|---|---|---|
| PulseMarket | $59 | $16.55 | 28.1% | $79 | $22.16 | 28.1% |
| PulseFlow | $129 | $36.19 | 28.1% | $149 | $41.79 | 28.1% |
| PulseDrive | $249 | $69.89 | 28.1% | $299 | $83.90 | 28.1% |
| PulseCommand | $399 | $111.97 | 28.1% | $499 | $140.02 | 28.1% |
| SmartLook | $99 | $27.77 | 28.1% | $99 | $27.77 | 28.1% |
| Business Center | $39 | $5.00 | 12.8% | — | — | — |

**User-facing docs show real dollar amounts, never internal waterfall percentages.**

---

## 3. DATA MODEL

```sql
CREATE TABLE members (
  member_id              UUID PRIMARY KEY,
  distributor_id         UUID REFERENCES distributors(id),
  enrollment_date        TIMESTAMP NOT NULL,

  -- Dual Ranks
  insurance_rank         insurance_rank DEFAULT 'inactive',
  tech_rank              tech_rank DEFAULT 'starter',  -- 7 ranks
  paying_rank            tech_rank DEFAULT 'starter',  -- Payment level
  highest_tech_rank      tech_rank DEFAULT 'starter',  -- Lifetime achievement

  -- Credits (measured in QV)
  personal_qv_monthly    INT DEFAULT 0,
  team_qv_monthly        INT DEFAULT 0,

  -- BV (Business Volume in dollars)
  personal_bv_monthly    DECIMAL(12,2) DEFAULT 0,
  team_bv_monthly        DECIMAL(12,2) DEFAULT 0,

  -- Cross-Credit
  cross_credit_tech_to_ins_qv   INT DEFAULT 0,
  cross_credit_ins_to_tech_qv   INT DEFAULT 0,

  -- Insurance Metrics
  insurance_production_90day DECIMAL(12,2) DEFAULT 0,
  placement_ratio            DECIMAL(5,4) DEFAULT 0,
  persistency_ratio          DECIMAL(5,4) DEFAULT 0,

  -- Status
  active_status         VARCHAR(20) DEFAULT 'active',
  bc_active             BOOLEAN DEFAULT FALSE,

  -- Grace
  tech_grace_days       INT DEFAULT 0,

  -- Override Qualification
  override_qualified    BOOLEAN DEFAULT FALSE  -- TRUE if personal_qv >= 50
);

CREATE TABLE distributors (
  id                    UUID PRIMARY KEY,
  sponsor_id            UUID REFERENCES distributors(id),  -- Enrollment tree
  matrix_parent_id      UUID REFERENCES distributors(id),  -- Matrix tree
  matrix_position       INT,
  matrix_depth          INT,
  created_at            TIMESTAMP NOT NULL
);

CREATE TABLE commission_runs (
  id                    UUID PRIMARY KEY,
  period_start          DATE NOT NULL,
  period_end            DATE NOT NULL,
  total_sales_cents     BIGINT DEFAULT 0,
  total_commissions_cents BIGINT DEFAULT 0,
  breakage_pool_cents   INTEGER DEFAULT 0,  -- 100% to Apex
  status                VARCHAR(20) DEFAULT 'pending',
  created_at            TIMESTAMP NOT NULL
);

-- Tech Rank Enum (7 ranks)
CREATE TYPE tech_rank AS ENUM (
  'starter',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'ruby',
  'diamond_ambassador'
);
```

---

## 4. TECH LADDER — 7 RANKS

### Rank Requirements (QV-Based)

| Rank | Personal QV/Mo | Team QV/Mo | Downline Rank Req | Rank Bonus | Override Depth |
|---|---|---|---|---|---|
| Starter | 0 | 0 | None | — | L1 only |
| Bronze | 150 | 300 | None | $250 | L1–L2 |
| Silver | 500 | 1,500 | None | $1,000 | L1–L3 |
| Gold | 1,200 | 5,000 | 1 Bronze (sponsored) | $3,000 | L1–L4 |
| Platinum | 2,500 | 15,000 | 2 Silvers (sponsored) | $7,500 | L1–L5 |
| Ruby | 4,000 | 30,000 | 2 Golds (sponsored) | $12,000 | L1–L6 |
| Diamond Ambassador | 5,000 | 50,000 | 3 Golds OR 2 Plat (sponsored) | $18,000 | L1–L7 |

**Total rank bonuses Starter→Diamond Ambassador: $41,750**

Bonuses paid **once per rank per lifetime**. Re-qualification does NOT earn second bonus.
Downline rank requirements must be **personally sponsored** members (via sponsor_id, not spillover).

### Rank Evaluation

```python
TECH_RANKS = [
    {'name': 'starter', 'personal': 0, 'group': 0, 'downline': None, 'override_depth': 1},
    {'name': 'bronze', 'personal': 150, 'group': 300, 'downline': None, 'override_depth': 2},
    {'name': 'silver', 'personal': 500, 'group': 1500, 'downline': None, 'override_depth': 3},
    {'name': 'gold', 'personal': 1200, 'group': 5000, 'downline': {'bronze': 1}, 'override_depth': 4},
    {'name': 'platinum', 'personal': 2500, 'group': 15000, 'downline': {'silver': 2}, 'override_depth': 5},
    {'name': 'ruby', 'personal': 4000, 'group': 30000, 'downline': {'gold': 2}, 'override_depth': 6},
    {'name': 'diamond_ambassador', 'personal': 5000, 'group': 50000,
     'downline': [{'gold': 3}, {'platinum': 2}], 'override_depth': 7},
]

def evaluate_tech_rank(member):
    for rank in reversed(TECH_RANKS):
        if (member.personal_qv_monthly >= rank['personal'] and
            member.team_qv_monthly >= rank['group'] and
            check_downline_requirements(member, rank['downline'])):
            return rank['name']
    return 'starter'
```

### Promotions Take Effect Next Month

- Rank evaluation runs at end of each month
- Promotions take effect on 1st of next month
- Rank bonuses paid once per rank per lifetime
- `highest_tech_rank` NEVER drops (lifetime achievement)

### Demotion Rules

- **Grace period:** 30 days below requirements before payment level drops
- `tech_rank` can drop after grace period (display rank)
- `paying_rank` determines commission rates (drops to highest qualified)
- **Re-qualification:** Any subsequent month, no waiting period

---

## 5. OVERRIDE COMMISSION CALCULATION — 7 LEVEL SYSTEM

### 5.1 Override Qualification — 50 QV/Month Minimum

```python
def check_override_qualified(member):
    """Must generate 50+ personal QV/month to earn overrides and bonuses."""
    member.override_qualified = member.personal_qv_monthly >= 50
    # If not qualified: seller commission still paid, overrides = $0, bonuses = $0
```

### 5.2 Ranked Override Schedule (% of Override Pool)

| Tech Rank | L1 | L2 | L3 | L4 | L5 | L6 | L7 | Total | Breakage |
|---|---|---|---|---|---|---|---|---|---|
| Starter | 25% | — | — | — | — | — | — | 25% | 75% |
| Bronze | 25% | 20% | — | — | — | — | — | 45% | 55% |
| Silver | 25% | 20% | 18% | — | — | — | — | 63% | 37% |
| Gold | 25% | 20% | 18% | 15% | — | — | — | 78% | 22% |
| Platinum | 25% | 20% | 18% | 15% | 10% | — | — | 88% | 12% |
| Ruby | 25% | 20% | 18% | 15% | 10% | 7% | — | 95% | 5% |
| Diamond Ambassador | 25% | 20% | 18% | 15% | 10% | 7% | 5% | 100% | 0% |

**CRITICAL CHANGES FROM 5-LEVEL SYSTEM:**
- L1 = 25% for ALL ranks (was 30%)
- L2-L7 = Matrix tree overrides (was L2-L5)
- Breakage = 100% to Apex (not split)
- Diamond Ambassador earns 100% of override pool (0% breakage)

**These are % of the override pool, NOT % of retail/member price.**

### 5.3 Dual-Tree System

```
L1 OVERRIDE (25%):
  → Uses ENROLLMENT TREE (distributors.sponsor_id)
  → ALWAYS 25% for all ranks
  → Paid to sponsor (who enrolled the seller)

L2-L7 OVERRIDES (varies by rank):
  → Uses MATRIX TREE (distributors.matrix_parent_id)
  → Percentages vary by upline's rank
  → Walks up matrix tree for L2, L3, L4, L5, L6, L7
```

**CRITICAL RULE:** No double-dipping! Each upline paid ONCE per sale.

### 5.4 Override Calculation Algorithm

```python
OVERRIDE_SCHEDULES = {
    'starter':            [0.25, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
    'bronze':             [0.25, 0.20, 0.00, 0.00, 0.00, 0.00, 0.00],
    'silver':             [0.25, 0.20, 0.18, 0.00, 0.00, 0.00, 0.00],
    'gold':               [0.25, 0.20, 0.18, 0.15, 0.00, 0.00, 0.00],
    'platinum':           [0.25, 0.20, 0.18, 0.15, 0.10, 0.00, 0.00],
    'ruby':               [0.25, 0.20, 0.18, 0.15, 0.10, 0.07, 0.00],
    'diamond_ambassador': [0.25, 0.20, 0.18, 0.15, 0.10, 0.07, 0.05],
}

def calculate_overrides(sale, seller):
    override_pool = sale.bv * 0.40
    payments = []
    paid_members = set()

    # STEP 1: L1 Enrollment Override (25%)
    if seller.sponsor_id:
        sponsor = get_member(seller.sponsor_id)
        if sponsor.override_qualified:
            amount = override_pool * 0.25
            payments.append({
                'member_id': sponsor.member_id,
                'level': 'L1_enrollment',
                'rate': 0.25,
                'amount': amount,
            })
            paid_members.add(sponsor.member_id)

    # STEP 2: L2-L7 Matrix Overrides
    current = seller.matrix_parent_id
    level = 1  # Start at 1 (but we'll use index for L2-L7)

    while current and level <= 7:
        upline = get_member(current)

        # Skip if already paid (no double-dipping)
        if upline.member_id in paid_members:
            current = upline.matrix_parent_id
            level += 1
            continue

        # Check qualification
        if not upline.override_qualified:
            current = upline.matrix_parent_id
            level += 1
            continue  # Compression: skip to next

        # Get rate for this rank and level
        schedule = OVERRIDE_SCHEDULES[upline.paying_rank]
        rate = schedule[level]

        if rate > 0:
            amount = override_pool * rate
            payments.append({
                'member_id': upline.member_id,
                'level': f'L{level + 1}_matrix',
                'rate': rate,
                'amount': amount,
            })
            paid_members.add(upline.member_id)

        current = upline.matrix_parent_id
        level += 1

    # STEP 3: Calculate breakage
    total_paid = sum(p['amount'] for p in payments)
    breakage = override_pool - total_paid

    return {
        'payments': payments,
        'total_paid': total_paid,
        'breakage': breakage,  # 100% to Apex
    }
```

### 5.5 Breakage Pool

**Breakage = Unpaid override pool percentage**

- **100% of breakage goes to Apex** (not 10% BotMakers / 90% Apex)
- Tracked in `commission_runs.breakage_pool_cents`
- Logged for reporting and transparency
- Calculated as: `override_pool - total_overrides_paid`

---

## 6. DUAL LADDER SYSTEM

### Tech Ladder (All Reps)
- 7 ranks: Starter → Diamond Ambassador
- Based on tech product sales (Pulse products)
- Uses distributors.sponsor_id for enrollment tree
- Uses distributors.matrix_parent_id for matrix tree

### Insurance Ladder (Licensed Agents Only)
- 7 ranks: Inactive → MGA
- Based on insurance premium production
- Uses members.enroller_id for insurance tree
- Separate from tech ladder

**CRITICAL:** Never mix enrollment tree with matrix tree!

---

## 7. BONUS & LEADERSHIP POOLS

### Bonus Pool (3.5% of Remainder)
- Divided EQUALLY among all members who earned rank bonuses in the period
- Equal share: `total_pool / number_of_qualified_members`

### Leadership Pool (1.5% of Remainder)
- Divided among Diamond Ambassador members only
- Proportional share based on production points (personal + team QV)
- Formula: `member_points / total_ambassador_points * leadership_pool`

---

## 8. COMMISSION RUN PROCESS

### Monthly Commission Run Steps

```python
def run_monthly_commissions(period_start, period_end):
    # 1. Evaluate ranks
    for member in active_members:
        evaluate_and_update_rank(member, period_end)

    # 2. Calculate seller commissions
    seller_commissions = calculate_seller_commissions(period_start, period_end)

    # 3. Calculate overrides (7 levels)
    override_results = calculate_all_overrides(period_start, period_end)

    # 4. Calculate breakage
    total_breakage = sum(r['breakage'] for r in override_results)

    # 5. Distribute bonus pool
    bonus_pool_total = calculate_bonus_pool(period_start, period_end)
    distribute_bonus_pool(bonus_pool_total)

    # 6. Distribute leadership pool
    leadership_pool_total = calculate_leadership_pool(period_start, period_end)
    distribute_leadership_pool(leadership_pool_total)

    # 7. Create commission run record
    commission_run = create_commission_run({
        'period_start': period_start,
        'period_end': period_end,
        'total_commissions_cents': calculate_total_commissions(),
        'breakage_pool_cents': total_breakage * 100,  # Convert to cents
        'status': 'completed',
    })

    return commission_run
```

---

## 9. MLM COMPLIANCE

### FTC Compliance Rules

1. **50 QV Minimum:** Must generate 50+ personal QV/month to earn overrides
2. **30-Day Grace Period:** Before payment level drops
3. **Promotions Next Month:** Take effect 1st of next month
4. **One-Time Rank Bonuses:** Paid once per rank per lifetime
5. **No Inventory Loading:** Products are digital/services
6. **70% Retail Rule:** 70% of purchases must be to retail customers (not reps)
7. **Refund Clawback:** Chargebacks deduct from upline overrides

### Anti-Pyramid Safeguards

- Seller commission (60% of BV) always paid, even if unqualified for overrides
- Minimum floor rank = Starter (~28% commission)
- Re-qualification any month, no waiting period
- Breakage goes to company, not upline

---

## 10. MIGRATION FROM 5-LEVEL TO 7-LEVEL

### Changes Summary

| Item | Old (5-Level) | New (7-Level) |
|------|---------------|---------------|
| Ranks | 9 ranks (Starter → Elite) | 7 ranks (Starter → Diamond Ambassador) |
| Override Levels | L1-L5 | L1-L7 |
| L1 Rate | 30% | 25% |
| Highest Rank | Elite | Diamond Ambassador |
| Breakage Split | 10% BotMakers / 90% Apex | 100% Apex |
| BC Override Pool | None | $13.10 ($1.75/level) |

### Data Migration

```sql
-- Crown → Diamond Ambassador
-- Elite → Diamond Ambassador
-- Diamond → Diamond Ambassador
-- All others preserved

UPDATE members
SET tech_rank = 'diamond_ambassador'
WHERE tech_rank IN ('crown', 'elite', 'diamond');
```

See migration: `supabase/migrations/20260331000003_update_7_level_override_system.sql`

---

## 11. IMPLEMENTATION CHECKLIST

- [x] Update config.ts with 7-level schedules
- [x] Update override-calculator.ts for 7 levels
- [x] Update Business Center waterfall
- [x] Add breakage pool tracking
- [x] Create database migration
- [x] Update TECH_RANKS enum
- [ ] Update UI components (dashboards, rank displays)
- [ ] Test override calculations
- [ ] Update commission run logic
- [ ] Update documentation

---

**END OF SPECIFICATION**
