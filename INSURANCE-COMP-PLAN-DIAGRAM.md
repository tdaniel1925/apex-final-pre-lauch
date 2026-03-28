# Insurance Compensation Plan - Complete Diagram

**Source:** `Insurance Comp. Plan - Final.txt`

---

## ⚠️ IMPORTANT: INSURANCE IS NOT A MATRIX!

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ INSURANCE STRUCTURE = UNLIMITED WIDTH GENERATIONAL MODEL                     │
│ (Traditional Insurance MLM Structure)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ✅ UNLIMITED WIDTH at every generation                                      │
│    └─ You can recruit as many people as you want at Gen 1                  │
│    └─ Each of them can recruit unlimited at Gen 2                          │
│    └─ No limit on organization width                                        │
│                                                                              │
│ ✅ 6 GENERATIONS of overrides (Gen 1-6)                                     │
│    └─ Gen 7 exists but is a bonus pool (Premier MGAs only)                 │
│                                                                              │
│ ❌ NO FORCED MATRIX                                                          │
│    └─ NOT 5-wide like tech products                                         │
│    └─ NO fixed positions (no P1-P5)                                         │
│    └─ NO spillover placement                                                │
│                                                                              │
│ ✅ PURE GENERATIONAL TREE                                                    │
│    └─ Based on sponsor_id (who you report to)                              │
│    └─ Based on enroller_id (who recruited you)                             │
│    └─ Traditional insurance agency structure                                │
└─────────────────────────────────────────────────────────────────────────────┘

TECH PRODUCTS (Different Structure):
├─ 5-wide forced matrix (matrix_parent_id, matrix_position 1-5)
├─ 7 levels deep (L1-L5 pay, L6-L7 pay $0)
└─ Spillover when Level 1 is full

INSURANCE PRODUCTS (This Document):
├─ UNLIMITED width generational model
├─ 6 generations of overrides
└─ NO matrix, NO spillover, NO fixed positions
```

---

## 1. RANK PROGRESSION LADDER

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INSURANCE RANK LADDER                                │
└─────────────────────────────────────────────────────────────────────────────┘

Level 0: NEW HIRE (50%)
│        ├─ No requirements
│        ├─ Can recruit (but recruits roll to upline)
│        └─ Gets 35% production credit from recruits
│
│        Requirement: $10,000 in rolling 90 days
│        ↓
├────────────────────────────────────────────────────────────────────────────┤
│
Level 1: PRE-ASSOCIATE (55%)
│        ├─ Annual target: $40,000/year
│        ├─ 90-day target: $10,000
│        ├─ Can recruit (but recruits roll to upline)
│        ├─ Gets 35% production credit from recruits
│        └─ Quality: 60% placement + 80% persistency
│
│        Requirement: $20,000 in rolling 90 days
│        ↓
├────────────────────────────────────────────────────────────────────────────┤
│
Level 2: ASSOCIATE (60%)
│        ├─ Annual target: $80,000/year
│        ├─ 90-day target: $20,000
│        ├─ Can recruit (but recruits roll to upline)
│        ├─ Gets 35% production credit from recruits
│        └─ Quality: 60% placement + 80% persistency
│
│        Requirement: $30,000 in rolling 90 days
│        ↓
├────────────────────────────────────────────────────────────────────────────┤
│
Level 3: AGENT (70%) ← FIRST LEADERSHIP RANK
│        ├─ Annual target: $120,000/year
│        ├─ 90-day target: $30,000
│        ├─ Recruits NOW come to you (no more rollup!)
│        ├─ Previous recruits "released back" to you
│        ├─ Override access: Gen 1-3 ONLY
│        └─ Quality: 60% placement + 80% persistency
│
│        Requirements:
│        ├─ $75,000 in rolling 90 days
│        ├─ 5 qualified downline producers
│        └─ 1 new producer every 90 days
│        ↓
├────────────────────────────────────────────────────────────────────────────┤
│
Level 4: SR. AGENT (80%)
│        ├─ Annual target: $300,000/year
│        ├─ 90-day target: $75,000
│        ├─ Override access: Gen 1-5
│        ├─ Leadership & management focus
│        ├─ Income: $90K-$175K/year
│        └─ Quality: 60% placement + 80% persistency
│
│        Requirements:
│        ├─ $150,000 in rolling 90 days
│        ├─ 10 qualified downline producers
│        └─ 3 new producers every 90 days
│        ↓
├────────────────────────────────────────────────────────────────────────────┤
│
Level 5: MGA (90%) - BUSINESS OWNERSHIP
│        ├─ Annual target: $600,000/year (to maintain)
│        ├─ 90-day target: $150,000
│        ├─ Override access: Gen 1-6 (FULL ACCESS)
│        ├─ Base shop override: 20% [PENDING: 15% vs 20%?]
│        ├─ Can recruit new MGAs [PENDING: until end 2026?]
│        ├─ Income: $150K-$500K+/year
│        └─ Quality: 60% placement + 80% persistency
│
│        Requirements (to maintain):
│        ├─ $150,000 in rolling 90 days
│        ├─ 10 qualified downline producers
│        └─ 3 new producers every 90 days
│
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. RECRUITMENT ROLLUP SYSTEM

### 2A. Pre-Associate/Associate Recruitment (Levels 0-2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO: John (Pre-Associate) recruits Sarah                               │
└─────────────────────────────────────────────────────────────────────────────┘

BEFORE:
                Phil (MGA)
                    │
                    │
                John (Pre-Associate)


John recruits Sarah:

AFTER:
                Phil (MGA)
                    │
        ┌───────────┼───────────┐
        │                       │
    John (Pre-Associate)    Sarah (New Hire)
                                │
                    ┌───────────┴───────────┐
                    │                       │
                enroller_id: John       sponsor_id: Phil
                (for credit)            (for overrides)


HOW IT WORKS:
├─ Sarah's enroller_id = John ✅ (John gets credit for recruiting)
├─ Sarah's sponsor_id = Phil ✅ (Phil receives overrides - ROLLUP!)
├─ Sarah's temporary_sponsor_id = Phil ✅ (marked as temporary)
├─ Sarah's original_recruiter_id = John ✅ (for releasing later)
│
├─ John gets 35% production credit from Sarah toward promotion
│  (If Sarah produces $10K, John gets $3,500 credit)
│
└─ Phil receives Gen 1 override (15%) on Sarah's production


WHEN JOHN ADVANCES TO AGENT (70%):
                Phil (MGA)
                    │
                    │
                John (Agent) ← PROMOTED!
                    │
                    └─ Sarah (New Hire)
                       │
           ┌───────────┴───────────┐
           │                       │
       enroller_id: John       sponsor_id: John ← CHANGED!
       (unchanged)             (was Phil, now John)

Sarah "released back" to John:
├─ Sarah's sponsor_id changes: Phil → John
├─ John NOW receives Gen 1 overrides on Sarah
├─ Phil STOPS receiving overrides on Sarah
└─ John's future recruits come directly to him
```

---

### 2B. Agent+ Recruitment (Level 3+)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO: Mike (Agent) recruits Lisa                                        │
└─────────────────────────────────────────────────────────────────────────────┘

                Phil (MGA)
                    │
                    │
                Mike (Agent)

Mike recruits Lisa:

                Phil (MGA)
                    │
                    │
                Mike (Agent)
                    │
                    └─ Lisa (New Hire)
                       │
           ┌───────────┴───────────┐
           │                       │
       enroller_id: Mike       sponsor_id: Mike
       (recruiting credit)     (overrides go to Mike)

NO ROLLUP!
├─ Lisa comes DIRECTLY to Mike
├─ Mike receives Gen 1 overrides on Lisa
└─ Mike gets 100% production credit (no split)
```

---

## 3. QUALIFIED DOWNLINE PRODUCER RULES

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ WHO COUNTS AS A "QUALIFIED DOWNLINE PRODUCER"?                              │
└─────────────────────────────────────────────────────────────────────────────┘

✅ MUST MEET ALL 4 REQUIREMENTS:

1. $2,500+ per month in personal production
2. 2 consecutive months of $2,500+ production
3. 90+ days with APEX (from contract date)
4. Active writing agent (not suspended/terminated)


EXAMPLE: You have 10 recruits

┌─────────────────────────────────────────────────────────────────────────────┐
│ ✅ QUALIFIED (4 agents)                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Sarah:  $5,200/mo × 4 months, 120 days tenure  ✅ COUNTS                   │
│ Mike:   $3,800/mo × 6 months, 180 days tenure  ✅ COUNTS                   │
│ Lisa:   $4,100/mo × 3 months, 95 days tenure   ✅ COUNTS                   │
│ Tom:    $2,800/mo × 5 months, 150 days tenure  ✅ COUNTS                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ ❌ NOT QUALIFIED (6 agents)                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Amy:    $2,300/mo × 2 months, 90 days   ❌ Below $2,500 minimum           │
│ Dan:    $2,600/mo × 1 month, 85 days    ❌ Need 1 more month + 5 days     │
│ Kim:    $3,200/mo × 2 months, 45 days   ❌ Need 45 more days              │
│ John:   $1,800/mo × 6 months, 120 days  ❌ Below $2,500 minimum           │
│ Kelly:  $3K, then $0 last month          ❌ Not consecutive               │
│ Mark:   Suspended                        ❌ Not active                     │
└─────────────────────────────────────────────────────────────────────────────┘

YOUR QUALIFIED DOWNLINE COUNT: 4 (not 10!)

To reach Sr. Agent (need 5 qualified):
└─ Help Amy increase production by $200/month to qualify!
```

---

## 4. GENERATIONAL OVERRIDE STRUCTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OVERRIDE PERCENTAGES (% of commissionable premium)                          │
└─────────────────────────────────────────────────────────────────────────────┘

Generation    Relationship              Override %
─────────────────────────────────────────────────────
Gen 1         Direct Recruits           15%
Gen 2         2nd Level Agents          5%
Gen 3         3rd Level Agents          3%
Gen 4         4th Level Agents          2%
Gen 5         5th Level Agents          1%
Gen 6         6th Level Agents          0.5%
Gen 7         Bonus Pool                (Premier MGAs only)


EXAMPLE ORGANIZATION (UNLIMITED WIDTH):

                                YOU (MGA)
                                   │
        ┌──────┬───────┬───────┬───┼───┬───────┬───────┬──────┬──────┐
        │      │       │       │   │   │       │       │      │      │
       R1     R2      R3      R4  R5  R6      R7      R8     R9    R10... ← Gen 1 (UNLIMITED direct recruits!)
        │      │       │                │       │
    ┌───┼──┬──┼──┐    │            ┌───┼───┬───┼───┐
    │   │  │  │  │    │            │   │   │   │   │
   R11 R12 R13 R14 R15 R16        R17 R18 R19 R20 R21... ← Gen 2 (UNLIMITED 2nd level!)
    │      │                          │
   R22    R23                        R24              ← Gen 3 (Unlimited 3rd level)
    │                                  │
   R25                                R26             ← Gen 4 (Unlimited 4th level)
    │
   R27                                                ← Gen 5 (Unlimited 5th level)
    │
   R28                                                ← Gen 6 (Unlimited 6th level)


KEY POINTS:
✅ NO limit on Gen 1 recruits (can recruit 10, 20, 100+ direct recruits!)
✅ NO limit on Gen 2 (each Gen 1 can recruit unlimited)
✅ NO limit at ANY generation
✅ This is WHY it's called "generational" not "matrix"
✅ Traditional insurance agency model


OVERRIDE CALCULATION EXAMPLE:

Let's say you have 10 direct recruits (Gen 1), and the organization grows:

Gen 1: 10 agents × $5,000/mo × 15% = $7,500/month ← UNLIMITED WIDTH!
Gen 2: 25 agents × $5,000/mo × 5% = $6,250/month  ← Each Gen 1 recruited 2-3
Gen 3: 15 agents × $5,000/mo × 3% = $2,250/month
Gen 4: 8 agents × $5,000/mo × 2% = $800/month
Gen 5: 3 agents × $5,000/mo × 1% = $150/month
Gen 6: 2 agents × $5,000/mo × 0.5% = $50/month

TOTAL MONTHLY OVERRIDE: $17,000
ANNUAL OVERRIDE INCOME: $204,000

As you can see, MORE direct recruits = MORE Gen 1 overrides!
No cap, no matrix limits, pure generational growth.
```

---

## 5. OVERRIDE ACCESS BY RANK

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ YOUR RANK DETERMINES HOW DEEP YOU CAN EARN OVERRIDES                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────┬──────────────────────────────────────────────────┐
│ RANK                   │ OVERRIDE ACCESS                                  │
├────────────────────────┼──────────────────────────────────────────────────┤
│ New Hire (50%)         │ NONE - No overrides until Agent rank           │
│ Pre-Associate (55%)    │ NONE - No overrides until Agent rank           │
│ Associate (60%)        │ NONE - No overrides until Agent rank           │
├────────────────────────┼──────────────────────────────────────────────────┤
│ Agent (70%)            │ Gen 1-3 ONLY                                    │
│                        │ Gen 4-6 roll up to upline MGA                   │
├────────────────────────┼──────────────────────────────────────────────────┤
│ Sr. Agent (80%)        │ Gen 1-5                                         │
│                        │ Gen 6 rolls up to upline MGA                    │
├────────────────────────┼──────────────────────────────────────────────────┤
│ MGA (90%)              │ Gen 1-6 (FULL ACCESS)                           │
│                        │ Receives Gen 4-6 rollups from downline Agents   │
└────────────────────────┴──────────────────────────────────────────────────┘


EXAMPLE: You (Agent) with 6 generations of downline

                            YOU (Agent, 70%)
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                                                      │
    Gen 1 ($10K/mo)                                      Your Upline
        │                                                   (MGA, 90%)
    Gen 2 ($8K/mo)
        │
    Gen 3 ($6K/mo) ← Your override access stops here
        │
    Gen 4 ($5K/mo) ← You earn $0, rolls up to upline MGA
        │
    Gen 5 ($4K/mo) ← You earn $0, rolls up to upline MGA
        │
    Gen 6 ($3K/mo) ← You earn $0, rolls up to upline MGA


YOUR OVERRIDE EARNINGS:
├─ Gen 1: $10,000 × 15% = $1,500 ✅
├─ Gen 2: $8,000 × 5% = $400 ✅
├─ Gen 3: $6,000 × 3% = $180 ✅
├─ Gen 4: $5,000 × 2% = $0 ❌ (rank too low)
├─ Gen 5: $4,000 × 1% = $0 ❌ (rank too low)
└─ Gen 6: $3,000 × 0.5% = $0 ❌ (rank too low)

YOUR TOTAL: $2,080/month

YOUR UPLINE MGA RECEIVES:
├─ Gen 4 override: $5,000 × 2% = $100 ✅ (rolled up from you)
├─ Gen 5 override: $4,000 × 1% = $40 ✅ (rolled up from you)
└─ Gen 6 override: $3,000 × 0.5% = $15 ✅ (rolled up from you)

UPLINE TOTAL FROM YOUR ROLLUP: $155/month
```

---

## 6. MGA TIER STRUCTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MGA LEADERSHIP TIERS (Based on Direct MGA Recruits)                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────┬──────────┬────────────────────────────────────────┐
│ TIER                  │ MGAs     │ GENERATIONAL OVERRIDES                 │
├───────────────────────┼──────────┼────────────────────────────────────────┤
│ MGA (BASE)            │ 0        │ Base Shop: 20% [PENDING: 15% or 20%?] │
│                       │          │ Gen 1: 15%                             │
├───────────────────────┼──────────┼────────────────────────────────────────┤
│ Associate MGA         │ 2        │ Gen 1: 15%                             │
├───────────────────────┼──────────┼────────────────────────────────────────┤
│ Sr. Associate MGA     │ 4        │ Gen 1: 15%, Gen 2: 5%                  │
├───────────────────────┼──────────┼────────────────────────────────────────┤
│ Executive MGA         │ 6        │ Gen 1: 15%, Gen 2: 5%, Gen 3: 3%       │
│ (Regional MGA)        │          │ Income: $420K/year possible            │
├───────────────────────┼──────────┼────────────────────────────────────────┤
│ Sr. Executive MGA     │ 8        │ Gen 1-4: 15%, 5%, 3%, 2%               │
├───────────────────────┼──────────┼────────────────────────────────────────┤
│ National MGA          │ 10       │ Gen 1-5: 15%, 5%, 3%, 2%, 1%           │
├───────────────────────┼──────────┼────────────────────────────────────────┤
│ Premier MGA           │ 12       │ Gen 1-6: 15%, 5%, 3%, 2%, 1%, 0.5%     │
│                       │          │ Gen 7: Bonus pool (pooled)             │
└───────────────────────┴──────────┴────────────────────────────────────────┘


EXAMPLE: Executive MGA (6 direct MGAs) Structure

                        YOU (Executive MGA)
                    (Base Shop: $600K/year)
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
    MGA #1                 MGA #2                MGA #3  ← Gen 1
    ($600K)                ($600K)              ($600K)
        │                      │                      │
    ┌───┴───┐              ┌───┴───┐              │
    │       │              │       │              │
  MGA #4  MGA #5         MGA #6   ...           ...    ← Gen 2
  ($600K) ($600K)        ($600K)

YOUR INCOME:
1. Base Shop Override (20%):    $600K × 20% = $120,000
2. Gen 1 (15%):                  2 MGAs × $600K × 15% = $180,000
3. Gen 2 (5%):                   2 MGAs × $600K × 5% = $60,000
4. Gen 3 (3%):                   2 MGAs × $600K × 3% = $36,000
5. Recruiting Bonus (4%):        $600K × 4% = $24,000

TOTAL ANNUAL INCOME: $420,000 (override income only)
```

---

## 7. BONUS PROGRAMS

### 7A. Weekly Production Bonus

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ WEEKLY PRODUCTION BONUS                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

QUALIFICATION:
├─ $2,000+ in commissionable premium per week
├─ 60% placement ratio
├─ 80% persistency ratio
└─ No chargebacks

BONUS STRUCTURE (% of weekly premium):
Week 1:  1%
Week 2:  2%
Week 3:  3%
Week 4+: 4%

RESET TRIGGER: Miss $2,000 threshold any week → Reset to Week 1


EXAMPLE:

Week 1: $2,500 premium → $25 bonus (1%) ✅
Week 2: $3,000 premium → $60 bonus (2%) ✅
Week 3: $2,800 premium → $84 bonus (3%) ✅
Week 4: $3,200 premium → $128 bonus (4%) ✅
Week 5: $2,700 premium → $108 bonus (4%) ✅
Week 6: $1,800 premium → $0 bonus → RESET! ❌
Week 7: $2,600 premium → $26 bonus (1%) ← Back to Week 1

PAYMENT: Calculated monthly, paid by 15th of following month
```

---

### 7B. MGA Quarterly Recruiting Bonus

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MGA QUARTERLY RECRUITING BONUS                                               │
└─────────────────────────────────────────────────────────────────────────────┘

ELIGIBILITY: MGA rank only

BASE REQUIREMENT: $150,000 in quarterly production (base shop)

BONUS STRUCTURE (% of base shop production):
9 new recruits:   1%
12 new recruits:  2%
15 new recruits:  3%
18 new recruits:  4%

QUALITY REQUIREMENTS:
├─ 60% placement ratio
├─ 80% persistency ratio
└─ No chargebacks during quarter

RECRUIT DEFINITION:
├─ Contracted within the calendar quarter
├─ Submitted at least 1 placed policy
└─ Policy issued and paid


EXAMPLE:

Quarter: Q1 2026 (Jan-Mar)
Base Shop Production: $180,000
New Recruits: 14 agents (each placed 1+ policy)

Bonus: $180,000 × 2% = $3,600

PAYMENT: Calculated at quarter close, paid by 15th of next month
```

---

## 8. COMPLETE FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE INSURANCE COMPENSATION FLOW                      │
└─────────────────────────────────────────────────────────────────────────────┘

1. AGENT WRITES POLICY
   │
   ├─ Carrier pays agent direct commission (50%-90% based on rank)
   │
   └─ Policy commissionable premium = $10,000

2. OVERRIDE CALCULATION
   │
   ├─ Traverse UP the sponsor chain (sponsor_id)
   │
   ├─ Gen 1 (Direct sponsor): $10,000 × 15% = $1,500
   │  └─ Check rank: Does this person have Gen 1 access? (Agent+)
   │     ├─ YES: Pay $1,500 ✅
   │     └─ NO: Roll up to next qualified upline
   │
   ├─ Gen 2 (Sponsor's sponsor): $10,000 × 5% = $500
   │  └─ Check rank: Does this person have Gen 2 access? (Agent+)
   │     ├─ YES: Pay $500 ✅
   │     └─ NO: Roll up to next qualified upline
   │
   ├─ Gen 3: $10,000 × 3% = $300
   │  └─ Check rank: Does this person have Gen 3 access? (Agent+)
   │     ├─ YES: Pay $300 ✅
   │     └─ NO: Roll up to next qualified upline
   │
   ├─ Gen 4: $10,000 × 2% = $200
   │  └─ Check rank: Does this person have Gen 4 access? (Sr. Agent+)
   │     ├─ YES: Pay $200 ✅
   │     └─ NO: Roll up to next qualified upline (usually MGA)
   │
   ├─ Gen 5: $10,000 × 1% = $100
   │  └─ Check rank: Does this person have Gen 5 access? (Sr. Agent+)
   │     ├─ YES: Pay $100 ✅
   │     └─ NO: Roll up to next qualified upline (usually MGA)
   │
   └─ Gen 6: $10,000 × 0.5% = $50
      └─ Check rank: Does this person have Gen 6 access? (MGA only)
         ├─ YES: Pay $50 ✅
         └─ NO: End of chain

3. BONUS PROGRAMS
   │
   ├─ Weekly Production Bonus (if agent wrote $2K+ this week)
   │  └─ Calculate 1-4% based on consecutive weeks
   │
   └─ MGA Recruiting Bonus (if MGA hit $150K shop + recruited 9-18)
      └─ Calculate 1-4% based on number of recruits

4. RANK ADVANCEMENT CHECK (Monthly/Quarterly)
   │
   ├─ Calculate 90-day rolling production
   ├─ Count qualified downline producers
   ├─ Count new producers this quarter
   ├─ Check quality metrics (60% placement + 80% persistency)
   │
   └─ If all requirements met:
      ├─ Schedule promotion for next month
      ├─ If advancing to Agent:
      │  └─ Release rolled-up recruits back to agent
      └─ Update override access level
```

---

## 9. KEY FORMULAS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CRITICAL CALCULATIONS                                                        │
└─────────────────────────────────────────────────────────────────────────────┘

QUALIFIED DOWNLINE PRODUCER:
├─ Monthly production >= $2,500
├─ Consecutive months >= 2
├─ Tenure days >= 90
└─ Status = 'active'

OVERRIDE AMOUNT:
├─ Override = Commissionable Premium × Override %
├─ Gen 1: Premium × 15%
├─ Gen 2: Premium × 5%
├─ Gen 3: Premium × 3%
├─ Gen 4: Premium × 2%
├─ Gen 5: Premium × 1%
└─ Gen 6: Premium × 0.5%

PRODUCTION CREDIT (for Pre-Associate/Associate):
├─ Personal credit = Personal production
├─ Recruit credit = Recruit production × 35%
├─ Total credit = Personal + Recruit credit
└─ Requirement must be met with >= 65% personal

RANK ADVANCEMENT:
├─ IF production >= threshold
├─ AND qualified_downline >= required
├─ AND new_producers >= required
├─ AND placement_ratio >= 60%
├─ AND persistency_ratio >= 80%
└─ THEN promote to next rank

OVERRIDE ACCESS:
├─ Agent (70%): Can earn Gen 1-3
├─ Sr. Agent (80%): Can earn Gen 1-5
└─ MGA (90%): Can earn Gen 1-6
```

---

## 10. SUMMARY TABLE

```
┌─────────────┬──────────┬──────────┬──────────┬──────────┬─────────────────┐
│ Rank        │ Rate     │ 90-Day   │ Annual   │ Override │ Qualified DL    │
├─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────┤
│ New Hire    │ 50%      │ $0       │ $0       │ None     │ 0               │
│ Pre-Assoc   │ 55%      │ $10K     │ $40K     │ None     │ 0               │
│ Associate   │ 60%      │ $20K     │ $80K     │ None     │ 0               │
│ Agent       │ 70%      │ $30K     │ $120K    │ Gen 1-3  │ 0               │
│ Sr. Agent   │ 80%      │ $75K     │ $300K    │ Gen 1-5  │ 5 + 1 new/90d   │
│ MGA         │ 90%      │ $150K    │ $600K    │ Gen 1-6  │ 10 + 3 new/90d  │
└─────────────┴──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

---

**This is the complete insurance compensation plan based on `Insurance Comp. Plan - Final.txt`**
