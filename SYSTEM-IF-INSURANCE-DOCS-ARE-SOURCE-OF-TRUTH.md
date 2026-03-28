# What the System Would Look Like Using Insurance Docs as Single Source of Truth

**Based on:** `Insurance Comp. Plan - Final.txt` as authoritative source

---

## Executive Summary

If we use the insurance compensation documents as the single source of truth, here are the key changes:

### ✅ What Gets EASIER:
- **Lower production thresholds** for Associate ($20K vs $25K) and Agent ($30K vs $45K)
- **Clear recruitment path** with documented rollup rules
- **Better quality control** with strict downline producer definition

### ❌ What Gets STRICTER:
- **Override access restricted** by rank (Agent: Gen 1-3 only)
- **Down line definition tighter** ($2,500/mo × 2 consecutive months + 90 days)
- **Some existing agents would lose Gen 4-6 overrides** (potential financial impact)

### 📊 Impact on Existing Agents:
- Agents currently earning Gen 4-6 would **lose $10K-$20K/year**
- Some Sr. Agents might not qualify anymore (if downline isn't "qualified")
- Need grandfather clause or major disruption

---

## 1. INSURANCE LADDER - Complete Rank Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ NEW HIRE (50%)                                                   │
│ • No requirements to start                                       │
│ • Can recruit, but recruits roll to upline until Agent rank     │
├──────────────────────────────────────────────────────────────────┤
│ PRE-ASSOCIATE (55%)                                              │
│ • $10,000 in rolling 90 days OR $40,000/year                    │
│ • Can recruit, gets 35% production credit                        │
├──────────────────────────────────────────────────────────────────┤
│ ASSOCIATE (60%)                                                  │
│ • $20,000 in rolling 90 days OR $80,000/year                    │
│ • 60% placement + 80% persistency required                       │
│ • Can recruit, gets 35% production credit                        │
├──────────────────────────────────────────────────────────────────┤
│ AGENT (70%) ← FIRST LEADERSHIP RANK                             │
│ • $30,000 in rolling 90 days OR $120,000/year                   │
│ • Recruits NOW come to you (no more rollup!)                    │
│ • Override access: Gen 1-3 ONLY                                  │
│ • 60% placement + 80% persistency required                       │
├──────────────────────────────────────────────────────────────────┤
│ SR. AGENT (80%)                                                  │
│ • $75,000 in rolling 90 days OR $300,000/year                   │
│ • 5 qualified downline producers                                 │
│ • 1 new producer every 90 days                                   │
│ • Override access: Gen 1-5                                       │
│ • 60% placement + 80% persistency required                       │
├──────────────────────────────────────────────────────────────────┤
│ MGA (90%)                                                        │
│ • $150,000 in rolling 90 days OR $600,000/year (to maintain)    │
│ • 10 qualified downline producers                                │
│ • 3 new producers every 90 days                                  │
│ • Override access: Gen 1-6 (full access)                         │
│ • Base shop override: 20% [PENDING: 15% vs 20% conflict]        │
│ • 60% placement + 80% persistency required                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. QUALIFIED DOWNLINE PRODUCER DEFINITION

**This is the BIG change - not just any recruit counts!**

### ✅ Requirements (ALL must be met):
```
1. $2,500+ per month in personal production
2. 2 consecutive months of $2,500+ production
3. 90+ days with APEX (from contract date)
4. Active writing agent (not suspended/terminated)
```

### Example: You Have 10 Recruits

```
QUALIFIED (Count Toward Rank):4
├─ Sarah: $5,200/mo × 4 months, 120 days ✅
├─ Mike: $3,800/mo × 6 months, 180 days ✅
├─ Lisa: $4,100/mo × 3 months, 95 days ✅
└─ Tom: $2,800/mo × 5 months, 150 days ✅

NOT QUALIFIED (Don't Count):
├─ Amy: $2,300/mo × 2 months, 90 days ❌ ($200 below minimum)
├─ Dan: $2,600/mo × 1 month, 85 days ❌ (need 5 more days + 1 more month)
├─ Kim: $3,200/mo × 2 months, 45 days ❌ (need 45 more days)
├─ John: $1,800/mo consistently ❌ (below $2,500 minimum)
├─ Kelly: $0 last month ❌ (not consecutive)
└─ Mark: Suspended ❌ (not active)

Your Qualified Downline Count: 4 (not 10!)
```

**Impact:** You need 5 qualified for Sr. Agent, but you only have 4.
**Solution:** Help Amy increase by $200/month to qualify.

---

## 3. RECRUITMENT ROLLUP SYSTEM

**Pre-Associate/Associate recruits roll to upline until recruiter hits Agent rank**

### How It Works:

```
Phil (MGA)
└─ John (Pre-Associate)

John recruits Sarah:
├─ enroller_id: John ← John gets credit for recruiting
├─ sponsor_id: Phil ← Phil receives overrides (rollup!)
├─ temporary_sponsor_id: Phil ← Marked as temporary
└─ original_recruiter_id: John ← For releasing later

Production Credit:
└─ John gets 35% of Sarah's production toward promotion
   (need $20K to reach Associate, can get $7K from recruits = 35%)

Phil receives:
└─ Gen 1 override (15%) on Sarah's production

When John advances to Agent (70%):
└─ Sarah's sponsor_id changes: Phil → John
   ├─ John now receives Gen 1 overrides on Sarah
   └─ Phil stops receiving overrides on Sarah
```

---

## 4. OVERRIDE ACCESS BY RANK

**Your rank determines how deep you earn overrides**

```
┌─────────────────────────────────────────────────────────────────┐
│ AGENT (70%)                                                      │
│ Override Depth: Gen 1-3 ONLY                                     │
│                                                                  │
│ You have 6 generations, but only get paid on Gen 1-3.          │
│ Gen 4-6 overrides "roll up" to your upline MGA.                │
└─────────────────────────────────────────────────────────────────┘

Example: You (Agent) with 6 generations:
├─ Gen 1: John ($10K) → You earn 15% = $1,500 ✅
├─ Gen 2: Sarah ($8K) → You earn 5% = $400 ✅
├─ Gen 3: Mike ($6K) → You earn 3% = $180 ✅
├─ Gen 4: Lisa ($5K) → You earn 0% (rank too low) ❌
├─ Gen 5: Tom ($4K) → You earn 0% (rank too low) ❌
└─ Gen 6: Amy ($3K) → You earn 0% (rank too low) ❌

Lisa, Tom, Amy's overrides go to your upline MGA.
```

---

## 5. MAJOR DIFFERENCES FROM CURRENT SPEC

### 5.1 Production Thresholds

| Rank | Spec (Current) | Insurance Docs | Change |
|------|----------------|----------------|--------|
| Pre-Associate | $0 | $10K/90 days | ⬆️ Higher |
| Associate | $25K/90 days | $20K/90 days | ⬇️ Lower (easier!) |
| Agent | $45K/90 days | $30K/90 days | ⬇️ Lower (easier!) |
| Sr. Agent | $75K/90 days | $75K/90 days | ✅ Same |
| MGA | $150K/90 days | $150K/90 days | ✅ Same |

**Impact:** Easier to advance to Agent rank, but harder for Pre-Associate.

---

### 5.2 Recruitment Rollup

| Current | New (Insurance Docs) |
|---------|----------------------|
| ❌ Not implemented | ✅ Fully implemented |
| Everyone keeps their recruits | Pre-Associate/Associate recruits roll to upline |
| No production credit sharing | 35% credit to recruiter, 65% must be personal |
| Recruits never "come back" | Recruits transfer when hitting Agent rank |

**Impact:** Massive change requiring database schema updates.

---

### 5.3 Downline Producer Definition

| Current | New (Insurance Docs) |
|---------|----------------------|
| Any active member counts | Must meet 4 strict requirements |
| `status='active'` = qualified | $2,500/mo × 2 months + 90 days tenure |
| Could have 20 "qualified" downline | Might drop to 8 "qualified" downline |

**Impact:** Some Sr. Agents/MGAs might not qualify anymore!

---

### 5.4 Override Access

| Current | New (Insurance Docs) |
|---------|----------------------|
| Everyone gets Gen 1-6 if they have downline | Restricted by rank |
| Agent earns on 6 generations | Agent earns on 3 generations ONLY |
| Sr. Agent earns on 6 generations | Sr. Agent earns on 5 generations |

**Financial Impact:** Agents lose Gen 4-6 overrides = $10K-$20K/year!

---

### 5.5 MGA Tier Names

| Spec Names | Insurance Doc Names |
|------------|---------------------|
| Associate MGA (2) | Associate MGA (2) ✅ |
| Senior MGA (4) | Sr. Associate MGA (4) ⚠️ |
| Regional MGA (6) | Executive MGA (6) ⚠️ |
| National MGA (8) | Sr. Executive MGA (8) ⚠️ |
| Executive MGA (10) | National MGA (10) ⚠️ |
| Premier MGA (12) | Premier MGA (12) ✅ |

**Impact:** Need to update all UI, marketing, and database references.

---

## 6. FINANCIAL IMPACT ON EXISTING AGENTS

### Scenario: Agent Currently Earning Gen 4-6 Overrides

**Current Monthly Income (Using Spec):**
```
Gen 1: $2,400 (15% × $16K downline production)
Gen 2: $1,800 (5% × $36K)
Gen 3: $1,200 (3% × $40K)
Gen 4: $800 (2% × $40K)   ← Would LOSE
Gen 5: $400 (1% × $40K)   ← Would LOSE
Gen 6: $200 (0.5% × $40K) ← Would LOSE
─────────────────────────
TOTAL: $6,800/month = $81,600/year
```

**New Monthly Income (Using Insurance Docs):**
```
Gen 1: $2,400
Gen 2: $1,800
Gen 3: $1,200
Gen 4-6: $0 (rank restriction)
─────────────────────────
TOTAL: $5,400/month = $64,800/year

LOSS: $1,400/month = $16,800/year ❌
```

**Agent's Options:**
1. Accept the $16,800/year loss
2. Advance to Sr. Agent to regain Gen 4-5 access
3. File complaint about "bait and switch"

---

### Scenario: Sr. Agent with "Unqualified" Downline

**Current:**
```
Has 12 active recruits
All 12 count as "qualified downline producers"
Rank: Sr. Agent (80%) ✅
```

**New (Strict Definition):**
```
Has 12 active recruits:
├─ 4 meet $2,500/mo × 2 months + 90 days ✅
├─ 8 don't meet requirements ❌
└─ Only 4 count as "qualified"

Requirements for Sr. Agent: 5 qualified downline
Status: 4 qualified (need 5) ❌

Result: DEMOTED to Agent (70%) ⬇️
```

**Impact:**
- Commission rate drops: 80% → 70%
- Override access drops: Gen 1-5 → Gen 1-3
- Could lose $20K-$40K/year

---

## 7. DATABASE SCHEMA CHANGES

### New Fields Required:

```sql
-- Recruitment rollup tracking
ALTER TABLE members ADD COLUMN sponsor_id UUID;
ALTER TABLE members ADD COLUMN temporary_sponsor_id UUID;
ALTER TABLE members ADD COLUMN original_recruiter_id UUID;
ALTER TABLE members ADD COLUMN rollup_released_at TIMESTAMP;

-- Qualified downline tracking
ALTER TABLE members ADD COLUMN qualified_downline_count INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN new_producers_this_quarter INTEGER DEFAULT 0;

-- Production qualification tracking
CREATE TABLE monthly_production_tracking (
  member_id UUID NOT NULL,
  month DATE NOT NULL,
  production_amount DECIMAL(12,2),
  meets_minimum BOOLEAN, -- TRUE if >= $2,500
  consecutive_months INTEGER,
  PRIMARY KEY (member_id, month)
);

-- Rollup audit trail
CREATE TABLE recruitment_rollup_log (
  id UUID PRIMARY KEY,
  recruiter_id UUID NOT NULL,
  recruit_id UUID NOT NULL,
  action TEXT, -- 'rolled_up' or 'released'
  temporary_upline_id UUID,
  credit_percentage DECIMAL(5,2),
  occurred_at TIMESTAMP
);
```

---

## 8. UI/UX CHANGES REQUIRED

### 8.1 Dashboard - Rank Progress Widget

**New Fields to Display:**
- Qualified downline count (not just total recruits)
- New producers this quarter
- Production credit breakdown (personal vs recruit credit)
- Rollup status (for Pre-Associate/Associate)

### 8.2 Matrix Page - Dual View

**Current:** Shows enrollment tree only

**New:** Two tabs
1. **Personal Team** - Enrollment tree (who you recruited)
2. **Matrix Organization** - 5-wide placement matrix

### 8.3 Recruitment Rollup Tracker

**For Pre-Associate/Associate ranks only:**
```
┌─────────────────────────────────────────────────────────┐
│ YOUR RECRUITS (Currently Under Upline)                  │
├─────────────────────────────────────────────────────────┤
│ You have 3 recruits temporarily under Phil:             │
│                                                          │
│ ├─ Sarah: $1,800/mo → 35% credit to you = $630         │
│ ├─ Mike: $2,400/mo → 35% credit to you = $840          │
│ └─ Lisa: $3,500/mo → 35% credit to you = $1,225        │
│                                                          │
│ TOTAL CREDIT: $2,695/month toward promotion             │
│                                                          │
│ 💡 Reach Agent rank to start earning overrides!         │
│    Estimated: ($1,800+$2,400+$3,500) × 15% = $1,155/mo │
└─────────────────────────────────────────────────────────┘
```

### 8.4 Qualified Downline Counter

```
┌─────────────────────────────────────────────────────────┐
│ QUALIFIED DOWNLINE PRODUCERS                             │
├─────────────────────────────────────────────────────────┤
│ Qualified: 4 / 5 needed for Sr. Agent                   │
│                                                          │
│ ✅ QUALIFIED (4):                                        │
│ ├─ Sarah: $5,200/mo × 4 months, 120 days               │
│ ├─ Mike: $3,800/mo × 6 months, 180 days                │
│ ├─ Lisa: $4,100/mo × 3 months, 95 days                 │
│ └─ Tom: $2,800/mo × 5 months, 150 days                 │
│                                                          │
│ ⚠️  PENDING (3):                                         │
│ ├─ Amy: Need $200/mo more ($2,300 → $2,500)            │
│ ├─ Dan: Need 1 more month + 5 more days                │
│ └─ Kim: Need 45 more days (45/90 complete)             │
└─────────────────────────────────────────────────────────┘
```

---

## 9. TRANSITION STRATEGY

### Option A: Hard Cut (No Grandfather)

**Pros:**
- Clean implementation
- Everyone on same rules
- No legacy code to maintain

**Cons:**
- Existing agents lose income immediately
- Potential lawsuits ("bait and switch")
- Mass exodus of agents

**Verdict:** ❌ Too risky

---

### Option B: Grandfather Existing Agents

**Pros:**
- No disruption to existing agents
- Fair to early adopters
- Smooth transition

**Cons:**
- Two sets of rules to maintain
- Complex system (legacy vs new)
- Agents may feel "second class"

**Implementation:**
```sql
ALTER TABLE members ADD COLUMN legacy_comp_plan BOOLEAN DEFAULT FALSE;

-- Mark all existing agents as legacy
UPDATE members
SET legacy_comp_plan = TRUE
WHERE created_at < '2026-04-01';

-- New signups after April 1, 2026 use new rules
-- Legacy agents keep old rules indefinitely
```

**Verdict:** ✅ Recommended

---

### Option C: Gradual Migration

**Pros:**
- Gives agents time to adapt
- Can phase in changes slowly
- Less shocking

**Cons:**
- Very complex to manage
- Confusing for agents
- Long transition period

**Implementation:**
- Year 1: Announce changes, no enforcement
- Year 2: New rules for new ranks only
- Year 3: Full enforcement

**Verdict:** ⚠️ Possible but complex

---

## 10. EXECUTIVE DECISION REQUIRED

### Questions That MUST Be Answered:

1. **Production Thresholds:**
   - Use $20K/$30K (insurance docs) or $25K/$45K (spec)?

2. **Recruitment Rollup:**
   - Implement fully or not at all?
   - If yes, when does it take effect?

3. **Downline Definition:**
   - Enforce $2,500/mo × 2 months + 90 days rule?
   - Grandfather existing "qualified" agents?

4. **Override Access Restrictions:**
   - Restrict Agent/Sr. Agent override depth or not?
   - If yes, grandfather existing agents earning Gen 4-6?

5. **MGA Tier Names:**
   - Use spec names or insurance doc names?

6. **Direct MGA Recruitment:**
   - Does this exist until end of 2026?
   - If yes, what are the requirements?

7. **Base Shop Override:**
   - Is it 15% or 20%?

---

## 11. RECOMMENDATION

**Use Insurance Docs as Single Source of Truth with Grandfather Clause:**

### ✅ DO:
1. Use insurance doc production thresholds ($20K/$30K)
2. Implement recruitment rollup for new agents only
3. Enforce strict downline definition going forward
4. Use insurance doc MGA tier names
5. Restrict override access by rank for new agents
6. Grandfather all existing agents under old rules

### ❌ DON'T:
1. Force existing agents onto new rules (lawsuits)
2. Remove Gen 4-6 overrides from current Agents
3. Demote existing Sr. Agents who don't meet new downline definition
4. Make changes without 90-day notice period

### Timeline:
```
April 1, 2026: Announce changes
May 1, 2026: Documentation updated
June 1, 2026: New system goes live for NEW signups only
Indefinite: Existing agents keep legacy rules
```

---

**This is what the system would look like using insurance docs as the authoritative source.**
