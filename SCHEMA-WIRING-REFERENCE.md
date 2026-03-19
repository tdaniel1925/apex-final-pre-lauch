# Database Schema Wiring Reference - Quick Lookup

## Critical Formulas from APEX_COMP_ENGINE_SPEC_FINAL.md

### Waterfall for Standard Products

```
PRICE → BotMakers 30% → Adjusted Gross
Adjusted Gross × 30% Apex → Remainder

Remainder × 3.5% = Bonus Pool
Remainder × 1.5% = Leadership Pool
Remainder - Pools = Commission Pool

Seller Commission = Commission Pool × 60%
Override Pool = Commission Pool × 40%
```

### Seller Effective %

All products at ~27.9% effective (after all waterfall steps):
- PulseGuard: $16.48/$22.06 (retail)
- PulseFlow: $36.03/$41.62
- PulseDrive: $61.17/$83.51
- PulseCommand: $97.48/$139.37
- SmartLook: $27.65/$27.65
- Business Center: $10 flat (25.6%)

### Production Credits Calculation

```
monthly_credits = SUM(
  FOR each active subscription:
    IF customer THEN product.retail_credits
    ELSE product.member_credits
)

team_credits = SUM(personal_credits) for all downline members
```

### Rank Achievement

```
TECH_RANK_BONUSES = {
  'starter': 0,
  'bronze': 250,
  'silver': 1000,
  'gold': 3000,
  'platinum': 7500,
  'ruby': 12000,
  'diamond': 18000,
  'crown': 22000,
  'elite': 30000,
}

TOTAL = $93,750 (lifetime, paid once per rank)
```

### Override Qualification

```
IF personal_credits_monthly >= 50:
  override_qualified = TRUE
ELSE:
  override_qualified = FALSE
  override_commissions = $0
  bonuses = $0
  (seller commission still paid at Starter rate)
```

### Override Commission Calculation

```
def calculate_override(rep, org_member, subscription):
  if not rep.override_qualified:
    return 0
  
  if subscription.product == 'business_center':
    if org_member.enroller_id == rep.member_id:
      return 8.00  # BC fixed payment to sponsor
    return 0
  
  wf = waterfall(subscription.price)
  override_pool = wf['override_pool']
  
  IF org_member.enroller_id == rep.member_id:
    # ENROLLER RULE: ALWAYS L1
    level = 1
    rate = 0.30
  ELSE:
    # MATRIX RULE: Use rep's rank schedule
    level = get_matrix_level(rep, org_member)
    schedule = OVERRIDE_SCHEDULES[rep.tech_rank]
    rate = schedule[level-1] if level in [1,2,3,4,5] else 0
  
  return override_pool * rate
```

---

## Table Relationships

```
auth.users
    ↓
distributors (auth_user_id)
    ↓
members (distributor_id) ← UPLINE: enroller_id
    ↑
    ├─→ subscriptions ← products (credit system)
    ├─→ orders → order_items → subscriptions
    └─→ earnings_ledger (all payouts)

Members → Downline (enroller_id chain):
  Direct: WHERE enroller_id = rep_id
  All: Recursive query up enroller_id chain
```

---

## Tables for Data Wiring

**MUST POPULATE:**
- `members` - Rep identity + dual ranks + monthly credits
- `subscriptions` - Monthly recurring orders (PRIMARY credit source)
- `products` - Product catalog (already seeded with credit %)
- `earnings_ledger` - Commission detail (from runs)

**SUPPORT TABLES:**
- `bv_snapshots` - Monthly snapshot (locked after commission run)
- `bonus_pool_ledger` - 3.5% pool tracking
- `leadership_shares` - Elite pool allocation

---

## Data Wiring Sequence

1. **Ensure members records exist**
   - Each rep must have: distributor_id, enroller_id, email, full_name, status='active'

2. **Create subscriptions**
   - One per active product per rep
   - Link to product by ID
   - Set status='active', next_billing_date, etc.

3. **Calculate monthly credits** (monthly job)
   - Query all active subscriptions per rep
   - Sum credits (member_credits for rep purchases, retail_credits for customer purchases)
   - Update members.personal_credits_monthly

4. **Calculate team credits** (monthly job)
   - Recursive: SUM(personal_credits_monthly) for all downline
   - Update members.team_credits_monthly

5. **Evaluate ranks** (monthly, end-of-month)
   - Check personal_credits >= threshold
   - Check team_credits >= threshold
   - Check downline rank requirements (for Bronze+ downline)
   - If new rank: set tech_rank_promotion_scheduled (effective next month)
   - If new highest rank: schedule rank_bonus payment

6. **Calculate commissions** (after rank evaluation)
   - For each subscription with status='active' this period:
     - Run waterfall (or BC fixed split)
     - Calculate seller commission → earnings_ledger
     - Distribute override pool to upline chain
     - Accumulate bonus_pool and leadership_pool

7. **Process earnings** (end of month)
   - Rank bonuses paid for members who promoted
   - Bonus pool shares distributed to qualified members
   - Leadership pool shares vested and paid

---

## Key Database Indexes for Performance

Used for commission calculations:
- `idx_members_enroller` - Finding all downline
- `idx_members_override_qualified` - Finding reps who earn overrides
- `idx_subscriptions_distributor` - Member's active subscriptions
- `idx_earnings_member` - Member's earnings history
- `idx_earnings_run` - Commission run batch queries
- `idx_earnings_period` - Period-based queries

---

## Critical Business Rules (Database-Level Constraints)

1. **enroller_id is IMMUTABLE**
   - Set once at enrollment, never changes
   - Checked FIRST for override calculation
   - Before matrix position

2. **promotions_take_effect_next_month**
   - Evaluated: end of current month
   - Effective: first day of following month
   - Field: tech_rank_promotion_scheduled

3. **50_credit_minimum_for_overrides**
   - Field: override_qualified = (personal_credits_monthly >= 50)
   - Auto-trigger: updates whenever personal_credits_monthly changes

4. **rank_lock_6_months**
   - New reps: first rank achieved locked for 6 months
   - Field: tech_rank_lock_until
   - Prevents demotion during lock period

5. **demotion_grace_2_months**
   - Below threshold: 2-month grace before demotion
   - Field: tech_rank_grace_period_start
   - After grace: demotion effective

6. **compression_inactive_members**
   - If member inactive (0 credits for 3 months): compress upline
   - Downline members' upline skips inactive member
   - Updates: enroller_id for affected downline

7. **Business Center no override/bonus/leadership**
   - BC uses FIXED SPLIT (not waterfall)
   - No override pool, bonus pool, or leadership pool allocation
   - Product.credit_pct = 0.00

---

