# APEX AFFINITY GROUP — COMPENSATION ENGINE SPECIFICATION

> **Version:** FINAL
> **Date:** March 2026
> **Purpose:** Technical specification for the Apex dual-ladder compensation engine.

---

## 1. REVENUE WATERFALL

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
         → Distributed across 5 levels at 30/25/20/15/10% of override pool
```

### BUSINESS CENTER EXCEPTION — Fixed Split (NOT waterfall)

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

BC does NOT flow through the standard waterfall. Fixed dollar amounts only.

### Waterfall Implementation

```python
def waterfall(price, product_type='standard'):
    if product_type == 'business_center':
        return {
            'price': 39, 'bm_fee': 11, 'apex_take': 8,
            'seller_commission': 10, 'sponsor_bonus': 8,
            'costs': 2, 'override_pool': 0,
            'bonus_pool': 0, 'leadership_pool': 0,
        }
    
    bm_fee = price * 0.30
    adjusted_gross = price - bm_fee
    apex_take = adjusted_gross * 0.30
    remainder = adjusted_gross - apex_take
    bonus_pool = remainder * 0.035
    leadership_pool = remainder * 0.015
    commission_pool = remainder - bonus_pool - leadership_pool
    seller_commission = commission_pool * 0.60
    override_pool = commission_pool * 0.40
    
    return {
        'price': price,
        'bm_fee': bm_fee,
        'adjusted_gross': adjusted_gross,
        'apex_take': apex_take,
        'remainder': remainder,
        'bonus_pool': bonus_pool,
        'leadership_pool': leadership_pool,
        'commission_pool': commission_pool,
        'seller_commission': seller_commission,
        'override_pool': override_pool,
    }
```

---

## 2. PRODUCTS & PRODUCTION CREDITS

| Product | Member | Retail | Credit % | Mem Credits | Ret Credits |
|---|---|---|---|---|---|
| PulseGuard | $59 | $79 | 30% | 18 | 24 |
| PulseFlow | $129 | $149 | 50% | 65 | 75 |
| PulseDrive | $219 | $299 | 100% | 219 | 299 |
| PulseCommand | $349 | $499 | 100% | 349 | 499 |
| SmartLook | $99 | $99 | 40% | 40 | 40 |
| Business Center | $39 | — | — | 39 | — |

### Credit Calculation

```python
def calc_credits(product, price_type):
    if product.id == 'business_center':
        return 39  # Fixed BV
    price = product.member_price if price_type == 'member' else product.retail_price
    return round(price * product.credit_pct)
```

### Seller Earnings (after waterfall)

| Product | Member Price | Rep Earns | Eff % | Retail Price | Rep Earns | Eff % |
|---|---|---|---|---|---|---|
| PulseGuard | $59 | $16.48 | 27.9% | $79 | $22.06 | 27.9% |
| PulseFlow | $129 | $36.03 | 27.9% | $149 | $41.62 | 27.9% |
| PulseDrive | $219 | $61.17 | 27.9% | $299 | $83.51 | 27.9% |
| PulseCommand | $349 | $97.48 | 27.9% | $499 | $139.37 | 27.9% |
| SmartLook | $99 | $27.65 | 27.9% | $99 | $27.65 | 27.9% |
| Business Center | $39 | $10.00 | 25.6% | — | — | — |

**User-facing docs show real dollar amounts, never internal waterfall percentages.**
**If showing %, must be effective % of the full retail/member price.**

---

## 3. DATA MODEL

```sql
CREATE TABLE members (
  member_id              UUID PRIMARY KEY,
  enroller_id            UUID NOT NULL,       -- IMMUTABLE
  matrix_parent_id       UUID,
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
  
  -- Insurance Metrics
  insurance_production_90day DECIMAL(12,2) DEFAULT 0,
  placement_ratio            DECIMAL(5,4) DEFAULT 0,
  persistency_ratio          DECIMAL(5,4) DEFAULT 0,
  
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

---

## 4. TECH LADDER — 9 RANKS

### Rank Requirements (Credit-Based Only)

| Rank | Personal Credits/Mo | Group Credits/Mo | Downline Rank Req | Rank Bonus | Override Depth |
|---|---|---|---|---|---|
| Starter | 0 | 0 | None | — | L1 only |
| Bronze | 150 | 300 | None | $250 | L1–L2 |
| Silver | 500 | 1,500 | None | $1,000 | L1–L3 |
| Gold | 1,200 | 5,000 | 1 Bronze (sponsored) | $3,000 | L1–L4 |
| Platinum | 2,500 | 15,000 | 2 Silvers (sponsored) | $7,500 | L1–L5 |
| Ruby | 4,000 | 30,000 | 2 Golds (sponsored) | $12,000 | L1–L5 |
| Diamond | 5,000 | 50,000 | 3 Golds OR 2 Plat (sponsored) | $18,000 | L1–L5 |
| Crown | 6,000 | 75,000 | 2 Plat + 1 Gold (sponsored) | $22,000 | L1–L5 |
| Elite | 8,000 | 120,000 | 3 Plat OR 2 Diamond (sponsored) | $30,000 | L1–L5+Ldshp |

Total rank bonuses Starter→Elite: **$93,750**
Bonuses paid **once per rank per lifetime**. Re-qualification does NOT earn second bonus.
Downline rank requirements must be **personally sponsored** members (not spillover).

### Rank Evaluation

```python
TECH_RANKS = [
    {'name': 'starter', 'personal': 0, 'group': 0, 'downline': None},
    {'name': 'bronze', 'personal': 150, 'group': 300, 'downline': None},
    {'name': 'silver', 'personal': 500, 'group': 1500, 'downline': None},
    {'name': 'gold', 'personal': 1200, 'group': 5000, 'downline': {'bronze': 1}},
    {'name': 'platinum', 'personal': 2500, 'group': 15000, 'downline': {'silver': 2}},
    {'name': 'ruby', 'personal': 4000, 'group': 30000, 'downline': {'gold': 2}},
    {'name': 'diamond', 'personal': 5000, 'group': 50000, 'downline': [{'gold': 3}, {'platinum': 2}]},
    {'name': 'crown', 'personal': 6000, 'group': 75000, 'downline': {'platinum': 2, 'gold': 1}},
    {'name': 'elite', 'personal': 8000, 'group': 120000, 'downline': [{'platinum': 3}, {'diamond': 2}]},
]

def evaluate_tech_rank(member):
    for rank in reversed(TECH_RANKS):
        if (member.personal_credits_monthly >= rank['personal'] and
            member.group_credits_monthly >= rank['group'] and
            check_downline_requirements(member, rank['downline'])):
            return rank['name']
    return 'starter'

def check_downline_requirements(member, req):
    if req is None:
        return True
    if isinstance(req, list):  # OR condition (Diamond, Elite)
        return any(check_downline_requirements(member, r) for r in req)
    # Count personally sponsored members at each required rank
    sponsored = get_personally_sponsored(member)
    for required_rank, count in req.items():
        if sum(1 for s in sponsored if rank_value(s.tech_rank) >= rank_value(required_rank)) < count:
            return False
    return True
```

### Promotions Take Effect Next Month

```python
def monthly_rank_evaluation():
    """Run at end of each month."""
    for member in active_members:
        new_rank = evaluate_tech_rank(member)
        
        if rank_value(new_rank) > rank_value(member.tech_rank):
            # PROMOTION — takes effect next month
            schedule_promotion(member, new_rank, effective_date=first_of_next_month())
            
            if rank_value(new_rank) > rank_value(member.highest_tech_rank):
                member.highest_tech_rank = new_rank
                schedule_rank_bonus(member, new_rank)
        
        elif rank_value(new_rank) < rank_value(member.tech_rank):
            handle_demotion(member, new_rank)
```

### Demotion Rules

- **Grace period:** 30 days below requirements before demotion
- **Minimum floor:** Starter rank always (seller commission ~27.9% always available)
- **Re-qualification:** Any subsequent month, no waiting period

---

## 5. OVERRIDE COMMISSION CALCULATION

### 5.1 Override Qualification — 50 Credits/Month Minimum

```python
def check_override_qualified(member):
    """Must generate 50+ personal credits/month to earn overrides and bonuses."""
    member.override_qualified = member.personal_credits_monthly >= 50
    # If not qualified: seller commission still paid, overrides = $0, bonuses = $0
```

### 5.2 Ranked Override Schedule (% of Override Pool)

| Tech Rank | L1 (enrollees) | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Starter | 30% | — | — | — | — |
| Bronze | 30% | 5% | — | — | — |
| Silver | 30% | 10% | 5% | — | — |
| Gold | 30% | 15% | 10% | 5% | — |
| Platinum | 30% | 18% | 12% | 8% | 3% |
| Ruby | 30% | 20% | 15% | 10% | 5% |
| Diamond | 30% | 22% | 18% | 12% | 8% |
| Crown | 30% | 25% | 20% | 15% | 10% |
| Elite | 30% | 25% | 20% | 15% | 10% |

**L1 = 30% for ALL ranks always (Enroller Override Rule).**
**These are % of the override pool, NOT % of the retail/member price.**

### 5.3 Enroller Override Rule

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
Commission ledger records which rule applied (override_rule field).
```

### 5.4 Override Calculation

```python
TECH_OVERRIDES = {
    'starter':   [0.30, 0.00, 0.00, 0.00, 0.00],
    'bronze':    [0.30, 0.05, 0.00, 0.00, 0.00],
    'silver':    [0.30, 0.10, 0.05, 0.00, 0.00],
    'gold':      [0.30, 0.15, 0.10, 0.05, 0.00],
    'platinum':  [0.30, 0.18, 0.12, 0.08, 0.03],
    'ruby':      [0.30, 0.20, 0.15, 0.10, 0.05],
    'diamond':   [0.30, 0.22, 0.18, 0.12, 0.08],
    'crown':     [0.30, 0.25, 0.20, 0.15, 0.10],
    'elite':     [0.30, 0.25, 0.20, 0.15, 0.10],
}

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
    
    if org_member.enroller_id == rep.member_id:
        rate = 0.30  # Enroller Rule: always L1
        level = 1
        rule = 'enroller'
    else:
        level = get_matrix_level(rep, org_member)
        if level < 1 or level > 5:
            return 0
        rate = schedule[level - 1]
        if rate == 0:
            return 0
        rule = 'positional'
    
    amount = override_pool * rate
    log_commission(rep, org_member, f'override_l{level}', amount, rule)
    return amount
```

### 5.5 Override Dollar Examples (PulseCommand $499 Retail)

```
Override Pool = $92.91

L1 (30%): $27.87  ← personal enrollee always gets this
L2 (25%): $23.23
L3 (20%): $18.58
L4 (15%): $13.94
L5 (10%):  $9.29
```

---

## 6. INSURANCE LADDER

### 6.1 Ranks

| Rank | Commission | 90-Day Premium | Agents | Quality |
|---|---|---|---|---|
| Pre-Associate | 50% | — | — | — |
| Associate | 55% | $10K | — | 60%P + 80%P |
| Sr. Associate | 60% | $25K | — | 60%P + 80%P |
| Agent | 70% | $45K | — | 60%P + 80%P |
| Sr. Agent | 80% | $75K | 5 | 60%P + 80%P |
| MGA | 90% | $150K | 10 | 60%P + 80%P |

### 6.2 MGA Tiers & Generational Overrides

| Rank | MGAs | Gen 1 (15%) | Gen 2 (5%) | Gen 3 (3%) | Gen 4 (2%) | Gen 5 (1%) | Gen 6 (0.5%) |
|---|---|---|---|---|---|---|---|
| MGA | — | Base Shop 20% | — | — | — | — | — |
| Associate MGA | 2 | ✓ | — | — | — | — | — |
| Senior MGA | 4 | ✓ | ✓ | — | — | — | — |
| Regional MGA | 6 | ✓ | ✓ | ✓ | — | — | — |
| National MGA | 8 | ✓ | ✓ | ✓ | ✓ | — | — |
| Executive MGA | 10 | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Premier MGA | 12 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (pooled) |

### 6.3 Insurance Bonus Programs

**Weekly Production Bonus:** $2,000/wk threshold. Wk1=1%, Wk2=2%, Wk3=3%, Wk4+=4%. Reset on miss.
**MGA Quarterly Recruiting:** $150K shop min. 9 recruits=1%, 12=2%, 15=3%, 18=4%.
Both require 60% placement + 80% persistency + no chargebacks.

---

## 7. CROSS-CREDIT SYSTEM

**LEGAL COMPLIANCE UPDATE (March 16, 2026):**
Insurance-to-Tech cross-credit has been **REMOVED** to comply with state insurance licensing laws. Non-licensed members cannot receive any benefit (direct or indirect) from insurance sales.

```python
# Tech → Insurance (LEGAL - Licensed agents can benefit from tech sales)
PRODUCT_CREDITS = {
    'pulse_guard': 0.30, 'pulse_flow': 0.50,
    'pulse_drive': 1.00, 'pulse_command': 1.00,
    'smartlook': 0.40, 'business_center': 0,
}

def calc_tech_to_insurance(member):
    """
    Licensed insurance agents CAN earn credits from tech product sales.
    This is legal because licensed agents are expanding their product line.
    """
    if not member.is_licensed_agent:
        return 0  # Only licensed agents benefit from cross-credit

    total = 0
    for sub in member.active_subscriptions:
        total += round(sub.monthly_price * PRODUCT_CREDITS[sub.product_id])
    member.cross_credit_tech_to_ins = total
    return total

# Insurance → Tech (REMOVED FOR LEGAL COMPLIANCE)
def calc_insurance_to_tech(member):
    """
    Insurance credits DO NOT flow to Tech Ladder.

    REASON: Non-licensed members cannot receive ANY benefit from insurance sales.
    This would violate state insurance licensing laws in all 50 states.

    See LEGAL-COMPLIANCE-MEMO.md for full legal analysis.
    """
    return 0  # Always zero - insurance credits NEVER cross to tech ladder
```

### Ladder Separation (REQUIRED FOR COMPLIANCE)

```
LEGAL STRUCTURE:

✓ Tech Ladder
  ├─ Calculated from: Tech products ONLY
  ├─ Participants: All members (licensed and non-licensed)
  └─ Credits: sum_tech_product_credits(member)

✓ Insurance Ladder
  ├─ Calculated from: Insurance production ONLY
  ├─ Participants: Licensed agents ONLY
  └─ Credits: sum_insurance_production(member)

✓ One-Way Cross-Credit (Legal)
  └─ Tech → Insurance: Licensed agents CAN cross-qualify using tech credits

✗ Insurance → Tech: PROHIBITED
  └─ Non-licensed upline CANNOT benefit from insurance sales
```

---

## 8. POOLS

### 8.1 Bonus Pool (3.5% of Remainder)

Funds incentive programs:
- 25% → Trip Incentives (Gold in 90 days)
- 20% → Fast Start ($250/$500/$1,000)
- 15% → Quarterly Contests ($5K/$3K/$2K+)
- 15% → Car Allowance (Plat $500, Ruby $750, Dia+ $1,000/mo)
- 10% → Leadership Retreat (Diamond+ annual)
- 10% → Enhanced Rank Bonuses (50% multiplier if < 12 months)
- 5% → Reserve/Flex

### 8.2 Leadership Pool (1.5% of Remainder)

- 1,000 total shares
- Allocated to early leaders (pre-launch through Year 1)
- Vesting: 24-month (founders), 18-month (launch), 12-month (growth)
- Diamond rank = 100% immediate vest acceleration
- Must maintain Gold+ tech rank for payouts
- Paid monthly with commissions
- Non-transferable, non-sellable
- Unvested shares forfeit on departure; vested pays 6 months then stops

### 8.3 Additional Incentive Funding

50% of ranked override savings → additional incentive budget
50% of ranked override savings → Apex operations

---

## 9. COMMISSION CALCULATION ORDER

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

## 10. MLM PROTECTIONS

```python
MLM_PROTECTIONS = {
    '50_credit_minimum': True,        # Must earn 50 personal credits/mo for overrides
    'promotions_next_month': True,     # End-of-month eval, new rates 1st of following month
    'anti_frontloading': True,         # Max 1 self-sub per product counts toward credits
    'retail_customer_70pct': True,     # 70% of credits must come from non-rep customers
    'refund_clawback_30day': True,     # 30-day refund = commission clawback
    'inactivity_suspension_3mo': True, # 0 credits for 3 months = overrides suspended
    'income_disclosure_required': True,# All recruiting must reference IDS
    'bc_non_waterfall': True,          # BC uses fixed split, no override pool
    'compression': True,               # Inactive in chain = compresses up
    'no_breakaway': True,              # Upline keeps overrides when downline matches rank
    'widow_hardship_12mo': True,       # 12-month income continuation to beneficiary
    'annual_recertification': True,    # Compliance training required annually
    'anti_raiding': True,              # Cross-line recruiting prohibited
    'downline_rank_requirements': True,# Gold+ requires ranked sponsored leaders
}
```

---

## 11. FEATURE FLAGS

```python
FEATURE_FLAGS = {
    'ranked_overrides': True,
    'enroller_override_rule': True,
    'cross_credit_tech_to_ins': True,
    'cross_credit_ins_to_tech': True,     # PENDING BILL on 0.5%
    'fast_start_bonus': True,
    'trip_incentive': True,
    'car_allowance': True,
    'leadership_pool': True,
    'leadership_retreat': False,           # Not yet activated
    'powerline_rates': False,              # PENDING BILL
    'enhanced_rank_bonuses': True,
    'bonus_pool_3_5pct': True,
    'leadership_pool_1_5pct': True,
}
```

---

## 12. KEY RULES SUMMARY

1. **Waterfall:** Price → BM 30% → Apex 30% of adj → 3.5% bonus → 1.5% leadership → 60/40 split
2. **BC Exception:** Fixed split $11/$8/$10/$8/$2. 39 credits. No override pool.
3. **Seller commission:** ~27.9% effective (all ranks, day one)
4. **L1 override:** 30% of override pool for ALL ranks on personal enrollees (Enroller Rule)
5. **L2-L5:** Unlock with rank. % of override pool, not % of price.
6. **50 credits/month:** Minimum for override + bonus eligibility
7. **Promotions:** Take effect next month (end-of-month evaluation)
8. **Credit-based only:** No account counts. Everything in production credits.
9. **Downline requirements:** Gold+ requires ranked leaders (personally sponsored)
10. **enroller_id is IMMUTABLE.** Check before matrix position.
11. **Two ranks simultaneously.** Insurance + Tech. Evaluated independently.
12. **Cross-credit:** Tech→Ins (Bill's %) + Ins→Tech (0.5%)
13. **15 MLM protections** active (Section 10)

---

> **END OF SPECIFICATION**
> Version FINAL — March 2026
> Apex Affinity Group — Confidential

---

## APPENDIX A: BONUS POOL — COMPLETE IMPLEMENTATION GUIDE

### A.1 Pool Funding Calculation

```python
def calculate_bonus_pool(period):
    """Calculate bonus pool from two funding sources each pay period."""
    
    # Source 1: 3.5% of Remainder from waterfall (every subscription)
    waterfall_pool = 0
    for sub in active_subscriptions:
        if sub.product_type != 'business_center':
            wf = waterfall(sub.monthly_price)
            waterfall_pool += wf['bonus_pool']  # remainder * 0.035
    
    # Source 2: 50% of ranked override savings
    # Savings = what WOULD have been paid under flat model - what IS paid under ranked model
    flat_override_cost = sum_flat_overrides(period)      # If everyone earned 30/25/20/15/10
    ranked_override_cost = sum_ranked_overrides(period)   # Actual paid based on rep ranks
    override_savings = flat_override_cost - ranked_override_cost
    savings_to_incentives = override_savings * 0.50
    
    total_incentive_budget = waterfall_pool + savings_to_incentives
    
    return {
        'waterfall_pool': waterfall_pool,
        'override_savings_pool': savings_to_incentives,
        'total_budget': total_incentive_budget,
    }
```

### A.2 Pool Allocation

```python
BONUS_ALLOCATIONS = {
    'trips':              0.25,  # 25%
    'fast_start':         0.20,  # 20%
    'quarterly_contests': 0.15,  # 15%
    'car_allowance':      0.15,  # 15%
    'leadership_retreat':  0.10,  # 10%
    'enhanced_rank':       0.10,  # 10%
    'reserve':             0.05,  # 5%
}

def allocate_bonus_pool(total_budget):
    return {k: total_budget * v for k, v in BONUS_ALLOCATIONS.items()}
```

---

### A.3 TRIP INCENTIVE — Full Implementation

```python
# Data Model
class TripIncentive:
    member_id: UUID
    enrollment_date: datetime
    qualification_date: datetime = None
    qualified: bool = False
    trip_awarded: bool = False
    destination: str = None

# Configuration
TRIP_CONFIG = {
    'target_rank': 'gold',           # Must achieve Gold
    'time_limit_days': 90,           # Within 90 days of enrollment
    'cost_per_qualifier': 4000,      # Estimated $3,000-$5,000
    'spouse_included': True,
    'cash_equivalent': False,         # No cash option
    'must_maintain_rank': True,       # Must hold Gold at time of trip
    'destinations': ['Cancun', 'Costa Rica', 'Bahamas'],  # Rotates
}

def evaluate_trip_incentive(member):
    """Run monthly for all members enrolled within last 90 days."""
    if member.trip_incentive_awarded:
        return  # Already earned
    
    days_since_enrollment = (today() - member.enrollment_date).days
    
    if days_since_enrollment > TRIP_CONFIG['time_limit_days']:
        return  # Window expired
    
    if rank_value(member.tech_rank) >= rank_value(TRIP_CONFIG['target_rank']):
        member.trip_incentive_qualified = True
        member.trip_qualification_date = today()
        create_incentive_record(
            member_id=member.member_id,
            incentive_type='trip',
            qualification_date=today(),
            status='qualified_pending_trip'
        )

def validate_trip_at_event(member):
    """Check rank at time of actual trip."""
    if not TRIP_CONFIG['must_maintain_rank']:
        return True
    return rank_value(member.tech_rank) >= rank_value(TRIP_CONFIG['target_rank'])
```

---

### A.4 FAST START BONUS — Full Implementation

```python
# Configuration
FAST_START_TIERS = [
    {
        'name': 'fast_start_30',
        'days': 30,
        'personal_accounts': 3,  # 3 active credit-generating subscriptions
        'min_rank': None,
        'bonus': 250,
    },
    {
        'name': 'fast_start_60',
        'days': 60,
        'personal_accounts': 8,
        'min_rank': None,
        'bonus': 500,
    },
    {
        'name': 'fast_start_90',
        'days': 90,
        'personal_accounts': 15,
        'min_rank': 'bronze',  # Must also achieve Bronze
        'bonus': 1000,
    },
]
# All tiers are STACKABLE. Max per rep: $1,750 ($250 + $500 + $1,000)
# Paid by 15th of month following qualification

# Data Model
class FastStartRecord:
    member_id: UUID
    tier: str              # 'fast_start_30', 'fast_start_60', 'fast_start_90'
    qualified: bool
    qualification_date: datetime
    paid: bool
    paid_date: datetime
    amount: Decimal

def evaluate_fast_start(member):
    """Run monthly. Check each tier independently."""
    days = (today() - member.enrollment_date).days
    
    for tier in FAST_START_TIERS:
        # Skip if already qualified for this tier
        if has_fast_start_record(member.member_id, tier['name']):
            continue
        
        # Check time window
        if days > tier['days']:
            continue
        
        # Check personal account count (active credit-generating subs)
        active_accounts = count_active_credit_subs(member)
        if active_accounts < tier['personal_accounts']:
            continue
        
        # Check rank requirement (90-day tier requires Bronze)
        if tier['min_rank'] and rank_value(member.tech_rank) < rank_value(tier['min_rank']):
            continue
        
        # QUALIFIED
        create_fast_start_record(member.member_id, tier['name'], tier['bonus'])
        schedule_payment(member.member_id, tier['bonus'], pay_date=fifteenth_of_next_month())

def count_active_credit_subs(member):
    """Count subscriptions that generate credits (excludes BC if credits=0)."""
    return sum(1 for sub in member.personal_subscriptions 
               if sub.status == 'active' and sub.product.credit_pct > 0)
```

---

### A.5 QUARTERLY PRODUCTION CONTESTS — Full Implementation

```python
# Configuration
CONTEST_CONFIG = {
    'frequency': 'quarterly',        # Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec
    'metric': 'personal_tech_revenue',  # Total revenue from personal tech sales
    'tiebreaker': 'personal_credits',   # If tied, higher credits wins
    'prizes': {
        1: 5000,   # 1st place
        2: 3000,   # 2nd place
        3: 2000,   # 3rd place
        4: 500, 5: 500, 6: 500, 7: 500, 8: 500, 9: 500, 10: 500,  # 4th-10th
    },
    'total_per_quarter': 13500,
    'payment_date': 'fifteenth_of_month_after_quarter',
}

# Data Model
class ContestEntry:
    member_id: UUID
    quarter: str           # '2026-Q1', '2026-Q2', etc.
    personal_revenue: Decimal
    personal_credits: int
    rank: int              # 1-10 (or null if not top 10)
    prize: Decimal

def run_quarterly_contest(quarter):
    """Run at end of each quarter."""
    # Gather all active reps' personal tech revenue for the quarter
    entries = []
    for member in active_members:
        revenue = sum_personal_tech_revenue(member, quarter)
        credits = sum_personal_credits(member, quarter)
        entries.append({'member': member, 'revenue': revenue, 'credits': credits})
    
    # Sort by revenue descending, tiebreak by credits
    entries.sort(key=lambda e: (e['revenue'], e['credits']), reverse=True)
    
    # Award top 10
    for i, entry in enumerate(entries[:10]):
        place = i + 1
        prize = CONTEST_CONFIG['prizes'].get(place, 0)
        if prize > 0:
            create_contest_record(
                member_id=entry['member'].member_id,
                quarter=quarter, rank=place, prize=prize
            )
            schedule_payment(entry['member'].member_id, prize,
                           pay_date=CONTEST_CONFIG['payment_date'])
```

---

### A.6 CAR/LIFESTYLE ALLOWANCE — Full Implementation

```python
# Configuration
CAR_ALLOWANCE = {
    'platinum': 500,     # $500/month
    'ruby': 750,         # $750/month
    'diamond': 1000,     # $1,000/month
    'crown': 1000,       # $1,000/month
    'elite': 1000,       # $1,000/month
}
# Paid monthly with regular commissions
# Must MAINTAIN qualifying rank each month
# Drops immediately with demotion — no grace period for car allowance
# No retroactive payment if rank is regained

def calculate_car_allowance(member):
    """Run monthly for all Platinum+ members."""
    if member.tech_rank in CAR_ALLOWANCE:
        amount = CAR_ALLOWANCE[member.tech_rank]
        create_commission(
            member_id=member.member_id,
            commission_type='car_allowance',
            amount=amount,
            description=f'Car allowance for {member.tech_rank} rank'
        )
        return amount
    return 0
```

---

### A.7 LEADERSHIP RETREAT — Full Implementation

```python
# Configuration
RETREAT_CONFIG = {
    'frequency': 'annual',
    'min_rank': 'diamond',          # Diamond, Crown, Elite
    'covers': ['airfare', 'hotel', 'meals', 'programming'],
    'spouse_included': True,
    'duration_days': 3,
    'budget_per_qualifier': 3000,   # Estimated
}

def evaluate_retreat_eligibility(member):
    """Annual check. Must hold Diamond+ at time of evaluation."""
    return rank_value(member.tech_rank) >= rank_value(RETREAT_CONFIG['min_rank'])
```

---

### A.8 ENHANCED RANK BONUSES — Full Implementation

```python
# Configuration
ENHANCED_BONUS_CONFIG = {
    'multiplier': 0.50,        # 50% extra on top of standard rank bonus
    'window_months': 12,       # Must achieve rank within 12 months of enrollment
    'applies_to': 'first_time_only',  # Only first achievement, not re-qualification
}

TECH_RANK_BONUSES = {
    'starter': 0, 'bronze': 250, 'silver': 1000, 'gold': 3000,
    'platinum': 7500, 'ruby': 12000, 'diamond': 18000,
    'crown': 22000, 'elite': 30000,
}

def pay_rank_bonus(member, new_rank):
    """Called when member achieves a new highest rank."""
    standard_bonus = TECH_RANK_BONUSES[new_rank]
    if standard_bonus == 0:
        return
    
    # Check if this is truly a new highest rank (not re-qualification)
    if rank_value(new_rank) <= rank_value(member.highest_tech_rank):
        return  # Already achieved this rank before — no bonus
    
    # Pay standard bonus
    create_commission(member.member_id, 'rank_bonus', standard_bonus)
    
    # Check enhanced bonus eligibility (within 12 months of enrollment)
    months_since_enrollment = months_between(member.enrollment_date, today())
    if months_since_enrollment <= ENHANCED_BONUS_CONFIG['window_months']:
        enhanced = standard_bonus * ENHANCED_BONUS_CONFIG['multiplier']
        create_commission(member.member_id, 'enhanced_rank_bonus', enhanced)
    
    # Update highest rank
    member.highest_tech_rank = new_rank
```

---

### A.9 LEADERSHIP POOL — Full Implementation

```python
# Configuration
LEADERSHIP_POOL_CONFIG = {
    'total_shares': 1000,
    'min_rank_for_payout': 'gold',  # Must maintain Gold+ to receive
    'diamond_full_vest': True,       # Diamond = immediate 100% vest
    'departure_vested_payout_months': 6,  # Vested shares pay 6 months after departure
}

# Data Model
class LeadershipShare:
    member_id: UUID
    shares: int
    grant_date: datetime
    vesting_schedule: str        # '24-month', '18-month', '12-month'
    vested_pct: Decimal          # 0.00 to 1.00
    vested_shares: int
    status: str                  # 'active', 'departed_paying', 'terminated'
    departure_date: datetime = None

VESTING_SCHEDULES = {
    '24-month': [(6, 0.25), (12, 0.50), (18, 0.75), (24, 1.00)],
    '18-month': [(6, 0.33), (12, 0.66), (18, 1.00)],
    '12-month': [(6, 0.50), (12, 1.00)],
}

def calculate_share_value(period):
    """Monthly: (1.5% of that month's Remainder) / total_shares."""
    total_remainder = sum_all_remainders(period)  # From waterfall
    leadership_pool = total_remainder * 0.015
    value_per_share = leadership_pool / LEADERSHIP_POOL_CONFIG['total_shares']
    return value_per_share

def update_vesting(share):
    """Run monthly. Check if vesting milestones reached."""
    months = months_between(share.grant_date, today())
    schedule = VESTING_SCHEDULES[share.vesting_schedule]
    
    # Check Diamond acceleration
    member = get_member(share.member_id)
    if (LEADERSHIP_POOL_CONFIG['diamond_full_vest'] and 
        rank_value(member.tech_rank) >= rank_value('diamond')):
        share.vested_pct = 1.00
        share.vested_shares = share.shares
        return
    
    # Standard vesting
    for milestone_months, pct in schedule:
        if months >= milestone_months:
            share.vested_pct = pct
            share.vested_shares = int(share.shares * pct)

def pay_leadership_shares(period):
    """Monthly payout for all active share holders."""
    value_per_share = calculate_share_value(period)
    
    for share in active_shares:
        member = get_member(share.member_id)
        
        # Must maintain Gold+ for payout
        if rank_value(member.tech_rank) < rank_value(LEADERSHIP_POOL_CONFIG['min_rank_for_payout']):
            continue
        
        # Pay on vested shares only
        update_vesting(share)
        payout = share.vested_shares * value_per_share
        
        if payout > 0:
            create_commission(
                member_id=share.member_id,
                commission_type='leadership_pool',
                amount=payout,
                description=f'{share.vested_shares} shares x ${value_per_share:.4f}'
            )

def handle_leader_departure(share):
    """When a leader leaves the organization."""
    share.status = 'departed_paying'
    share.departure_date = today()
    # Unvested shares forfeit immediately
    share.shares = share.vested_shares
    # Vested shares pay for 6 more months then stop
    schedule_termination(share, months=LEADERSHIP_POOL_CONFIG['departure_vested_payout_months'])
```

---

### A.10 RESERVE/FLEX BUDGET

```python
RESERVE_CONFIG = {
    'allocation_pct': 0.05,  # 5% of total incentive budget
    'requires_ceo_approval': True,
    'valid_uses': [
        'holiday_promotion',
        'product_launch_incentive',
        'recruiting_contest',
        'emergency_recognition',
        'team_milestone_celebration',
    ],
}

# No automated logic — disbursed manually by CEO
# Must document purpose and expected outcome
# Unused reserve rolls forward to next period
```

---

### A.11 INSURANCE BONUS PROGRAMS

```python
# Weekly Production Bonus
WEEKLY_PRODUCTION_CONFIG = {
    'threshold': 2000,  # $2,000 commissionable target premium per week
    'rates': {1: 0.01, 2: 0.02, 3: 0.03, 4: 0.04},  # Consecutive weeks
    'reset_on_miss': True,  # Miss threshold = reset to week 1
    'requirements': {
        'placement_ratio': 0.60,
        'persistency_ratio': 0.80,
        'no_chargebacks': True,
    },
    'payment': 'fifteenth_of_following_month',
}

def evaluate_weekly_production(member, week_premium):
    if week_premium >= WEEKLY_PRODUCTION_CONFIG['threshold']:
        member.consecutive_weeks += 1
        week_num = min(member.consecutive_weeks, 4)
        rate = WEEKLY_PRODUCTION_CONFIG['rates'][week_num]
        bonus = week_premium * rate
        
        if (member.placement_ratio >= 0.60 and
            member.persistency_ratio >= 0.80 and
            not member.has_chargebacks):
            create_commission(member.member_id, 'weekly_production_bonus', bonus)
    else:
        member.consecutive_weeks = 0  # Reset

# Quarterly MGA Recruiting Bonus
MGA_RECRUITING_CONFIG = {
    'min_shop_premium': 150000,
    'tiers': {9: 0.01, 12: 0.02, 15: 0.03, 18: 0.04},
    'qualified_recruit': 'places_1_policy_same_quarter',
    'requirements': {
        'placement_ratio': 0.60,
        'persistency_ratio': 0.80,
        'no_chargebacks': True,
    },
}

def evaluate_mga_recruiting(mga, quarter_data):
    if mga.insurance_rank != 'mga':
        return
    if quarter_data.shop_premium < MGA_RECRUITING_CONFIG['min_shop_premium']:
        return
    if not meets_quality_requirements(mga, MGA_RECRUITING_CONFIG['requirements']):
        return
    
    recruits = count_qualified_recruits(mga, quarter_data)
    for threshold in sorted(MGA_RECRUITING_CONFIG['tiers'].keys(), reverse=True):
        if recruits >= threshold:
            bonus = quarter_data.shop_premium * MGA_RECRUITING_CONFIG['tiers'][threshold]
            create_commission(mga.member_id, 'mga_recruiting_bonus', bonus)
            break
```

---

### A.12 BONUS POOL DATABASE TABLES

```sql
-- Track all incentive records
CREATE TABLE incentive_records (
    record_id        UUID PRIMARY KEY,
    member_id        UUID NOT NULL,
    incentive_type   ENUM('trip','fast_start_30','fast_start_60','fast_start_90',
                          'quarterly_contest','car_allowance','leadership_retreat',
                          'enhanced_rank_bonus','reserve_award',
                          'weekly_production','mga_recruiting'),
    amount           DECIMAL(10,2),
    qualification_date TIMESTAMP,
    status           ENUM('qualified','scheduled','paid','forfeited'),
    pay_period       DATE NULL,
    paid_date        TIMESTAMP NULL,
    notes            TEXT NULL,
    created_at       TIMESTAMP
);

-- Leadership Pool shares
CREATE TABLE leadership_shares (
    share_id         UUID PRIMARY KEY,
    member_id        UUID NOT NULL,
    shares_granted   INT NOT NULL,
    shares_vested    INT DEFAULT 0,
    vesting_schedule VARCHAR(20),   -- '24-month', '18-month', '12-month'
    grant_date       TIMESTAMP,
    full_vest_date   TIMESTAMP NULL, -- Set when Diamond achieved or schedule completes
    status           ENUM('active','departed_paying','terminated'),
    departure_date   TIMESTAMP NULL,
    termination_date TIMESTAMP NULL, -- 6 months after departure
    created_at       TIMESTAMP
);

-- Quarterly contest results
CREATE TABLE contest_results (
    result_id    UUID PRIMARY KEY,
    quarter      VARCHAR(10),       -- '2026-Q1'
    member_id    UUID NOT NULL,
    place        INT,               -- 1-10
    revenue      DECIMAL(12,2),
    credits      INT,
    prize        DECIMAL(10,2),
    paid         BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP
);

-- Bonus pool ledger (tracks funding sources)
CREATE TABLE bonus_pool_ledger (
    ledger_id        UUID PRIMARY KEY,
    period           DATE NOT NULL,
    source           ENUM('waterfall_3_5pct','override_savings_50pct'),
    amount           DECIMAL(12,2),
    allocated_to     VARCHAR(30) NULL,  -- Program name or NULL if unallocated
    created_at       TIMESTAMP
);
```

