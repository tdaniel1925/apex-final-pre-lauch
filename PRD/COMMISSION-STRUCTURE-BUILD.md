# COMPENSATION ENGINE — Feature Build Instructions

## WHAT THIS IS

You are adding a **compensation engine** to an existing system. This engine calculates and pays commissions on retail product sales for Apex Affinity Group. Read every file in this package before writing any code.

**IMPORTANT RULES:**
- This plan covers **RETAIL PRODUCT SALES ONLY** — not insurance
- Insurance commissions are handled separately by carriers — do NOT build anything for insurance
- The `$39/mo Custom Business Center` fee is **NON-commissionable** (0 BV, no commissions paid on it)
- The `~$79/mo AgentPulse software` that most reps subscribe to IS commissionable (~40 BV)
- `1 BV = $1.00` for all commission calculations
- A distributor must maintain **50 PBV/month** to be "active" — inactive reps get compressed (skipped) in commission calculations
- New reps get a **60-day grace period** before the 50 PBV requirement kicks in

---

## THE 5×7 FORCED MATRIX

Every distributor is placed into a **5-wide, 7-level deep** matrix tree.

**Placement Logic (BFS Left-to-Right):**
1. When a new rep enrolls, find their sponsor's position in the matrix
2. If sponsor has an open slot on Level 1 (max 5 direct children), place there (leftmost open)
3. If sponsor's Level 1 is full, BFS search down the tree — find the first open slot at the shallowest level, left-to-right
4. This is called "spillover" — your sponsor's other recruits can fill positions under you

**Matrix Size Per Organization:**
- Level 1: 5 positions
- Level 2: 25 positions
- Level 3: 125 positions
- Level 4: 625 positions
- Level 5: 3,125 positions
- Level 6: 15,625 positions
- Level 7: 78,125 positions
- **Total: 97,655 positions per org**

**Second Organization Token (SOT):**
- Crown Diamond rank for 2 consecutive months → unlocks 2nd independent matrix (Org #2)
- Royal Diamond rank for 2 consecutive months → unlocks 3rd independent matrix (Org #3)
- SOT tokens are NON-REVOCABLE once granted
- Each org operates independently — all commissions calculated separately per org and stacked

---

## RANKS & QUALIFICATIONS

Evaluated monthly. 1-month grace period if within 10% of requirements.

```
ASSOCIATE:    PBV=50,  GBV=0,       Sponsored=0, Legs=none
BRONZE:       PBV=75,  GBV=500,     Sponsored=2, Legs=none
SILVER:       PBV=100, GBV=2000,    Sponsored=3, Legs=2 @ 200+ BV
GOLD:         PBV=100, GBV=5000,    Sponsored=4, Legs=3 @ 500+ BV
PLATINUM:     PBV=150, GBV=15000,   Sponsored=5, Legs=3 @ 2000+ BV
DIAMOND:      PBV=150, GBV=50000,   Sponsored=5, Legs=4 @ 5000+ BV
CROWN_DIAMOND:PBV=200, GBV=150000,  Sponsored=5, Legs=4 @ 15000+ BV
ROYAL_DIAMOND:PBV=200, GBV=500000,  Sponsored=5, Legs=5 @ 50000+ BV
```

- **PBV** = Personal Business Volume (the rep's own purchases + their retail customer purchases)
- **GBV** = Group Business Volume (total BV of everyone in the rep's downline organization, all levels)
- **Sponsored** = personally enrolled active distributors (NOT matrix placement — enrollment count)
- **Legs** = separate downline branches from the rep's personally sponsored distributors. Each "leg" is the total BV of one sponsor's entire sub-tree. The requirement means N of those legs must each independently meet the BV threshold.

---

## ALL 16 COMMISSION TYPES — CALCULATION LOGIC

### 1. RETAIL CASH COMMISSION
```
trigger: every retail order
amount: retail_price - wholesale_price (the markup)
paid_to: the distributor who made the sale
frequency: weekly (every Friday)
cap: none
```

### 2. CUSTOMER ACQUISITION BONUS (CAB)
```
trigger: new retail customer's first order
amount: based on first order BV:
  15-24 BV  → $5
  25-49 BV  → $10
  50-99 BV  → $15
  100-149 BV → $25
  150-249 BV → $50
  250+ BV   → $75
paid_to: the distributor who acquired the customer
frequency: per customer (one-time per new customer)
```

### 3. CUSTOMER MILESTONE BONUS
```
trigger: monthly evaluation of new customers acquired that month
amount:
  5 new customers  → $100
  10 new customers → $300
  15 new customers → $500
  20 new customers → $750
  30+ new customers → $1,500
paid_to: the distributor
frequency: monthly
note: tiers do NOT stack — highest threshold met is paid
```

### 4. CUSTOMER RETENTION BONUS
```
trigger: monthly count of active autoship/subscription customers
amount:
  10+ active autoship customers → $50/mo
  25+ → $150/mo
  50+ → $400/mo
  100+ → $1,000/mo
paid_to: the distributor
frequency: monthly
note: highest tier met is paid (not stacked)
```

### 5. MATRIX COMMISSIONS (Levels 1-7)
```
trigger: monthly commission run
calculation: for each active person in your matrix (L1-7), 
             you earn a % of THEIR BV based on YOUR rank and THEIR level

RATE TABLE (your_rank → level → percentage):
                    L1    L2    L3    L4    L5    L6    L7
  ASSOCIATE:        5%    3%    2%    0%    0%    0%    0%
  BRONZE:           6%    4%    3%    2%    0%    0%    0%
  SILVER:           7%    5%    3%    2%    1%    0%    0%
  GOLD:             8%    5%    4%    3%    2%    1%    0%
  PLATINUM:         9%    6%    5%    3%    2%    1%    1%
  DIAMOND:         10%    7%    5%    4%    3%    2%    1%
  CROWN_DIAMOND:   11%    8%    6%    5%    4%    3%    2%
  ROYAL_DIAMOND:   12%    9%    7%    5%    4%    3%    3%

paid_to: the matrix position holder
frequency: monthly (15th)
compression: skip inactive positions — if someone on L2 is inactive, 
             their downline moves UP for commission purposes (L3 becomes L2, etc.)
note: calculate per organization independently, then sum
```

### 6. MATCHING BONUS (Generation 1)
```
trigger: monthly, after matrix commissions are calculated
calculation: you earn a % of your PERSONALLY SPONSORED distributors' 
             MATRIX COMMISSION CHECKS (not their BV — their actual matrix commission dollar amount)

RATE TABLE:
  ASSOCIATE:    0%
  BRONZE:       5%
  SILVER:       10%
  GOLD:         15%
  PLATINUM:     20%
  DIAMOND:      25%
  CROWN_DIAMOND: 30%
  ROYAL_DIAMOND: 30%

paid_to: the sponsor
frequency: monthly
cap: $25,000/month HARD CAP per distributor
note: "personally sponsored" = people YOU enrolled, regardless of where they sit in the matrix
```

### 7. GENERATIONAL MATCHING (Generations 2-3)
```
trigger: monthly, after matrix commissions calculated
definition: a "generation" starts at each personally sponsored distributor 
            who is ranked Silver or above. Gen 1 = your direct sponsored people.
            Gen 2 = the next Silver+ ranked person's team below each Gen 1.
            Gen 3 = the next Silver+ below Gen 2.

RATE TABLE:
  DIAMOND:       Gen2=10%, Gen3=0%
  CROWN_DIAMOND: Gen2=15%, Gen3=5%
  ROYAL_DIAMOND: Gen2=20%, Gen3=10%

calculation: sum of matrix commission checks earned by everyone in that generation
paid_to: the qualifying distributor
frequency: monthly
cap: included in the $25,000/month matching cap
```

### 8. OVERRIDE BONUSES
```
trigger: monthly commission run
calculation: you earn a differential % on the organizational GBV of 
             LOWER-RANKED distributors in your downline

RATE TABLE (your_rank → on_their_rank → override %):
  BRONZE:        on Associate=2%
  SILVER:        on Associate=4%, on Bronze=3%
  GOLD:          on Associate=6%, on Bronze=5%, on Silver=3%
  PLATINUM:      on Associate=8%, on Bronze=7%, on Silver=5%, on Gold=3%
  DIAMOND:       on Associate=10%, on Bronze=9%, on Silver=7%, on Gold=5%, on Platinum=3%
  CROWN_DIAMOND: on Associate=11%, on Bronze=10%, on Silver=8%, on Gold=6%, on Platinum=4%, on Diamond=3%
  ROYAL_DIAMOND: on Associate=13%, on Bronze=12%, on Silver=10%, on Gold=8%, on Platinum=6%, on Diamond=5%

BREAK RULE: overrides STOP (break) when you hit someone of EQUAL or HIGHER rank
paid_to: the higher-ranked upline
frequency: monthly
```

### 9. CODED INFINITY BONUS (Level 8+)
```
trigger: monthly commission run
calculation: for EVERY active person below Level 7 in your matrix (L8, L9, L10... infinite),
             you earn a flat % of their BV

RATES:
  DIAMOND:       1%
  CROWN_DIAMOND: 2%
  ROYAL_DIAMOND: 3%

BREAK RULE: stops at equal rank (if you're Diamond, stops when you hit another Diamond below you)
paid_to: the qualifying Diamond+ distributor
frequency: monthly
CIRCUIT BREAKER: if total infinity payouts company-wide exceed 5% of total company BV, 
                 auto-reduce all infinity rates by 0.5%
```

### 10. FAST START BONUS
```
trigger: achievements within FIRST 30 DAYS of enrollment
amounts (highest tier replaces lower — not stacked per category):
  ENROLLMENT BONUSES:
    Enroll 3 active distributors  → $100
    Enroll 5 active distributors  → $250 (replaces $100)
    Enroll 10 active distributors → $500 (replaces $250)
  
  GBV BONUSES:
    500+ Personal GBV  → $150
    1000+ Personal GBV → $300 (replaces $150)
  
  CUSTOMER BONUSES:
    5+ new retail customers  → $100
    10+ new retail customers → $250 (replaces $100)
  
  RANK BONUSES:
    Achieve Bronze in 30 days → $500
    Achieve Silver in 30 days → $1,000 (replaces $500)

max_total: $2,050 (one from each category can stack)
paid_to: the new distributor
frequency: one-time
```

### 11. UPLINE FAST START BONUS
```
trigger: when a new rep earns any Fast Start Bonus
amount: 10% of whatever Fast Start amount the new rep earned
paid_to: the new rep's SPONSOR (the person who enrolled them)
frequency: one-time
```

### 12. RANK ADVANCEMENT BONUS
```
trigger: when a distributor achieves a new rank (first time only — paid once per rank)
amounts:
  BRONZE:        $250
  SILVER:        $500
  GOLD:          $1,500
  PLATINUM:      $5,000
  DIAMOND:       $10,000
  CROWN_DIAMOND: $25,000
  ROYAL_DIAMOND: $50,000

PAYMENT RULE: Diamond, Crown Diamond, Royal Diamond bonuses are split into 
              3 EQUAL MONTHLY PAYMENTS (not lump sum)
              e.g. Diamond = $3,333.33/mo for 3 months
              Bronze through Platinum = paid in full immediately
```

### 13. SPEED MULTIPLIER
```
trigger: when rank advancement bonus is earned
calculation: if the rep achieved the rank faster than normal, multiply the bonus

MULTIPLIERS:
  Achieved within 60 days of previous rank → 2.0× (double the base bonus)
  Achieved within 90 days of previous rank → 1.5× (1.5× the base bonus)
  Achieved after 90 days → 1.0× (base bonus, no multiplier)

NOTE: there is NO 3× multiplier — max is 2×
example: Diamond in 55 days from Platinum = $10,000 × 2.0 = $20,000 (paid as $6,666.67/mo × 3)

MOMENTUM BONUS (additional, separate):
  3 ranks in 6 months = $2,500
  4 ranks in 6 months = $5,000
  5+ ranks in 8 months = $10,000
```

### 14. CAR BONUS
```
trigger: monthly evaluation
tiers:
  CRUISER:   rank=Gold,          GBV>=7,500,   bonus=$500/mo
  EXECUTIVE: rank=Platinum,      GBV>=20,000,  bonus=$800/mo
  PRESTIGE:  rank=Diamond,       GBV>=75,000,  bonus=$1,200/mo
  APEX:      rank=Crown_Diamond+, GBV>=200,000, bonus=$2,000/mo

activation: must maintain qualifying GBV for 3 CONSECUTIVE months to activate
deactivation: if GBV drops below threshold for 2 months, bonus pauses (resumes when re-qualified)
HARD CAP: $3,000/month TOTAL across ALL organizations (if rep has 3 SOT orgs)
paid_to: the qualifying distributor
frequency: monthly
```

### 15. VACATION BONUS
```
trigger: first time achieving each rank
amounts (one-time per rank, paid once):
  SILVER:        $500
  GOLD:          $1,500
  PLATINUM:      $3,500
  DIAMOND:       $7,500
  CROWN_DIAMOND: $15,000
  ROYAL_DIAMOND: $30,000

total_lifetime: $58,000
cash_equivalent: yes — rep can take cash instead of travel
paid_to: the distributor
frequency: one-time per rank
```

### 16. INFINITY POOL
```
trigger: monthly calculation
pool_size: 3% of TOTAL COMPANY-WIDE BV for the month
distribution: divided by total shares held by qualifying distributors

SHARES:
  DIAMOND:       1 share
  CROWN_DIAMOND: 2 shares
  ROYAL_DIAMOND: 4 shares

qualification: must maintain rank + minimum 25,000 GBV
example: if company BV = $5,000,000/mo → pool = $150,000
         if 50 shares outstanding → $3,000 per share
         Diamond (1 share) = $3,000/mo
         Royal Diamond (4 shares) = $12,000/mo

paid_to: qualifying Diamond+ distributors
frequency: monthly (20th)
```

---

## COMPRESSION LOGIC

When calculating matrix commissions, **skip inactive distributors**:

```
function getEffectiveLevel(position, uplinePosition):
  // Walk up from position to uplinePosition
  // Count only ACTIVE positions (50+ PBV)
  // Inactive positions are "compressed out" — they don't count as a level
  
  level = 0
  current = position.parent
  while current != uplinePosition:
    if current.user.status == 'active':
      level += 1
    current = current.parent
  return level
```

This means if someone on your "Level 3" is inactive, and the person on "Level 4" is active, that Level 4 person effectively becomes your Level 3 for commission calculations. This makes commissions flow deeper through inactive gaps.

---

## MONTHLY COMMISSION RUN — EXECUTION ORDER

This runs on the **1st of each month** for the previous month's activity:

```
1. SNAPSHOT
   - Freeze all BV totals (personal, group) for the period
   - Mark users active/inactive based on 50 PBV threshold
   - Apply 60-day grace period for new reps
   - Increment consecutive_inactive_months for inactive users
   - Terminate accounts with 12+ consecutive inactive months

2. RANK EVALUATION
   - For each distributor, check PBV, GBV, sponsored count, leg requirements
   - Promote if qualified (record in rank_history with speed_days)
   - Apply 10% grace if within threshold
   - Calculate speed multiplier (days since last rank)
   - Generate rank advancement commissions (Diamond+ split into 3 payments)
   - Check SOT eligibility (Crown Diamond 2 months → Org #2, Royal Diamond 2 months → Org #3)

3. MATRIX COMMISSIONS
   - For each organization independently:
     - For each active position holder, walk UP the tree 7 levels
     - Apply compression (skip inactive)
     - At each effective level, calculate: position_holder_BV × rate[upline_rank][level]
     - Credit commission to the upline

4. MATCHING BONUS
   - For each distributor with rank >= Bronze:
     - Find all PERSONALLY SPONSORED distributors (enrollment relationship, not matrix)
     - Sum their matrix commission DOLLAR AMOUNTS from step 3
     - Apply matching rate based on sponsor's rank
     - For Diamond+: also calculate Gen 2 and Gen 3 (next Silver+ in each line)
     - Apply $25,000/month hard cap

5. OVERRIDE BONUSES
   - For each distributor with rank >= Bronze:
     - Walk down their downline tree
     - For each lower-ranked distributor found, calculate: their_org_GBV × override_rate
     - STOP at equal or higher rank (break rule)

6. CODED INFINITY BONUS
   - For each Diamond+ distributor:
     - Walk down their matrix past Level 7 (L8, L9, L10... unlimited)
     - For each active position: their_BV × infinity_rate
     - STOP at equal rank (break rule)
     - Check circuit breaker: if total infinity payouts > 5% of company BV, reduce rates by 0.5%

7. CAR BONUS
   - Check rank + GBV threshold + 3-month consecutive qualification
   - Apply tier amount
   - Apply $3,000/month cap across all orgs

8. INFINITY POOL
   - Calculate 3% of total company BV
   - Count total shares (Diamond=1, Crown=2, Royal=4) from qualifying distributors
   - Divide pool by shares, pay each qualifying distributor

9. CUSTOMER BONUSES (CAB, Milestones, Retention)
   - These were likely already calculated in real-time during the month
   - Reconcile and include in monthly payout

10. SAFEGUARD CHECK
    - Calculate total payout ratio: sum(all_commissions) / total_product_revenue
    - If ratio > 55%: DEFER non-essential bonuses (quarterly promos, event bonuses) to next month
    - If ratio > 50% for 2 consecutive months: FLAG for admin review
    - Log payout ratio to audit table

11. APPROVE & PAY
    - Set all commission records to status='approved'
    - On the 15th: process payouts via Stripe Connect (or your existing payment system)
    - Infinity Pool payouts on the 20th
    - Weekly retail commissions continue on their own Friday cycle
```

---

## BUSINESS CENTER BILLING

The `$39/month Custom Business Center` is a separate subscription:
- Billed monthly via Stripe (or your existing billing system)
- **NOT commissionable** — generates 0 BV, pays no commissions to anyone
- 100% company revenue
- Track as `subscription_type = 'business_center'` separate from product subscriptions
- Features provided: personalized back office, CRM access, marketing materials, compliance tools
- Optional — not required to be a distributor

---

## SAFEGUARDS TO IMPLEMENT

```
1. AUTO-THROTTLE
   if monthly_payout_ratio > 0.55:
     defer quarterly_promos and event_bonuses to next month
     alert admin

2. CASH RESERVE CHECK
   if available_cash < (2 × average_monthly_commissions):
     alert admin, flag as critical

3. INFINITY CIRCUIT BREAKER
   if total_infinity_payouts > (0.05 × total_company_bv):
     reduce all infinity rates by 0.5% for that month

4. RETAIL ENFORCEMENT
   if company_wide_retail_customer_ratio < 0.51:
     suspend new distributor enrollments
     alert admin

5. MATCHING CAP
   hard_limit: $25,000/month per distributor on matching + generational matching combined

6. CAR BONUS CAP
   hard_limit: $3,000/month total across all organizations per distributor
```

---

## KEY EDGE CASES TO HANDLE

1. **Sponsor vs. Matrix Parent**: A rep's SPONSOR (who enrolled them) and their MATRIX PARENT (who they sit under in the tree) may be DIFFERENT people due to spillover. Matching bonuses follow the SPONSOR relationship. Matrix commissions follow the MATRIX POSITION relationship.

2. **Multiple Organizations**: A Crown/Royal Diamond can have 2-3 independent matrices. Each org's commissions are calculated separately and then summed. Car bonus cap applies to the SUM across all orgs.

3. **Compression**: When an inactive person is between an earner and a payer in the matrix, they're skipped. This means Level 3 in the tree might be "effective Level 2" for commission purposes if the actual Level 2 person is inactive.

4. **Rank Rollback Grace**: If someone drops below rank requirements, they keep their rank for 1 month if they're within 10% of all requirements. After that, they drop.

5. **Diamond+ Installments**: Rank advancement bonuses for Diamond ($10K), Crown Diamond ($25K), and Royal Diamond ($50K) are paid in 3 equal monthly installments, not lump sum. If the rep loses the rank before all 3 payments, remaining payments are still honored.

6. **Speed Multiplier Timing**: Speed is measured from the DATE the previous rank was achieved (not the month). If someone hit Platinum on March 15 and Diamond on May 10, that's 56 days → qualifies for 2× multiplier.

7. **Fast Start Window**: The 30-day window starts from the enrollment DATE, not the calendar month. All achievements within exactly 30 calendar days count.

8. **Autoship BV**: Recurring subscriptions generate BV every month automatically. This counts toward both PBV (if the rep's own subscription) and GBV (for the upline).

---

## PRODUCT SEED DATA

Seed all 33 products from the comp plan. Here are the key ones for reference:

```
AGENTPULSE INDIVIDUAL:
  WarmLine:     retail=$79/mo,  wholesale=$55/mo,  bv=40
  LeadLoop:     retail=$69/mo,  wholesale=$48/mo,  bv=35
  PulseInsight: retail=$59/mo,  wholesale=$41/mo,  bv=30
  AgentPilot:   retail=$99/mo,  wholesale=$69/mo,  bv=50
  PulseFollow:  retail=$69/mo,  wholesale=$48/mo,  bv=35
  PolicyPing:   retail=$49/mo,  wholesale=$34/mo,  bv=25

AGENTPULSE BUNDLES:
  Starter:      retail=$119/mo, wholesale=$83/mo,  bv=60
  Pro:          retail=$199/mo, wholesale=$139/mo, bv=100
  Elite:        retail=$299/mo, wholesale=$209/mo, bv=150
  Elite Annual: retail=$2990/yr,wholesale=$2090/yr,bv=150/mo

POWER BUNDLES:
  Agent Starter Pack:    retail=$139/mo, wholesale=$97/mo,  bv=70
  Agent Growth Pack:     retail=$229/mo, wholesale=$160/mo, bv=115
  Agent Domination Pack: retail=$349/mo, wholesale=$244/mo, bv=175
  Education Power:       retail=$999,    wholesale=$699,    bv=500
  Full Ecosystem Pass:   retail=$599/mo, wholesale=$419/mo, bv=300
```

See the full comp plan markdown for all 33 products including Estate Planning and Education tiers.

---

## WHAT TO DELIVER

1. **Database migrations** — tables, indexes, RLS policies
2. **Commission calculation engine** — the core logic for all 16 types
3. **Monthly commission run job** — the orchestrator that runs steps 1-11 in order
4. **Rank evaluation function** — monthly rank check with grace periods and speed multipliers
5. **Matrix placement function** — BFS placement with spillover
6. **SOT unlock function** — checks eligibility, creates new org + matrix
7. **Safeguard checks** — auto-throttle, circuit breaker, retail enforcement, caps
8. **Product seed data** — all 33 products
9. **API endpoints or server actions** for:
   - Enroll new distributor (with matrix placement)
   - Process order (with instant retail commission)
   - View commission history
   - View genealogy tree
   - View rank progress
   - Admin: trigger monthly run
   - Admin: view payout ratio and safeguard status
