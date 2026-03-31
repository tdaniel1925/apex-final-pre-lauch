# Dual-Tree System - Visual Guide

This document provides a visual explanation of the dual-tree system used in the Apex compensation plan.

---

## The Two Trees

### 1. Enrollment Tree (Sponsor Tree)
**Database Field:** `distributors.sponsor_id`
**Width:** Unlimited (no position limit)
**Purpose:** Tracks who enrolled whom

```
                    Master
                      |
        +-------------+-------------+
        |             |             |
      John          Mary          Bob
        |             |             |
    +---+---+     +---+---+     +---+---+
    |   |   |     |   |   |     |   |   |
   Sue Ann Tom   Joe Kim Lee   Sam Pat Tim

   John enrolled: Sue, Ann, Tom (3 personal enrollees)
   Mary enrolled: Joe, Kim, Lee (3 personal enrollees)
   Bob enrolled: Sam, Pat, Tim (3 personal enrollees)
```

**Used For:**
- ✅ L1 Override (30% of override pool) - Goes to sponsor
- ✅ "Personal Enrollees" count - How many you recruited
- ✅ "Team Size" reports - Total downline you enrolled
- ✅ Genealogy View - Shows your enrollment organization

**Key Trait:** Unlimited width - you can enroll as many people as you want.

---

### 2. Matrix Tree (Placement Tree)
**Database Field:** `distributors.matrix_parent_id`
**Width:** 5 positions per person (forced matrix)
**Depth:** 7 levels maximum
**Purpose:** Forced 5×7 matrix with spillover

```
                    Master
                      |
        +---+---+---+---+---+
        | 1 | 2 | 3 | 4 | 5 |
        |   |   |   |   |   |
      John Mary Bob Sue Ann
        |
    +---+---+---+---+---+
    | 1 | 2 | 3 | 4 | 5 |
    |   |   |   |   |   |
   Tom Joe Kim Lee Sam

   John's matrix positions: 5 people (Tom, Joe, Kim, Lee, Sam)
   BUT: John may have only enrolled Tom personally!
        Joe, Kim, Lee, Sam could be spillover from other sponsors.
```

**Used For:**
- ✅ L2-L5 Overrides (varies by rank) - Goes to matrix upline
- ✅ Matrix View - Shows your position and downline in forced matrix
- ✅ Spillover Tracking - Where new recruits get placed

**Key Trait:** Limited width (5 max) - extra recruits "spill over" to next available position in the tree.

---

## Example Scenario: John Enrolls 8 People

Let's say John personally enrolls 8 people. Here's how they're tracked:

### Enrollment Tree (sponsor_id):
```
                    John
                      |
    +---+---+---+---+---+---+---+---+
    |   |   |   |   |   |   |   |   |
   P1  P2  P3  P4  P5  P6  P7  P8

   John's enrollment tree shows 8 direct enrollees.
   These are HIS people - he recruited all 8.
```

### Matrix Tree (matrix_parent_id):
```
                    John
                      |
        +---+---+---+---+---+
        | 1 | 2 | 3 | 4 | 5 |
        |   |   |   |   |   |
       P1  P2  P3  P4  P5
        |
    +---+---+---+
    | 1 | 2 | 3 |
    |   |   |   |
   P6  P7  P8

   John's matrix is FULL (5 positions).
   P6, P7, P8 "spilled over" under P1 (first position).

   In the matrix tree:
   - John's matrix_parent_id: Master
   - P1-P5's matrix_parent_id: John
   - P6-P8's matrix_parent_id: P1 (spillover!)
```

### What This Means for Commissions:

**L1 Override (30%):**
- Paid based on **ENROLLMENT TREE** (sponsor_id)
- John gets L1 override on ALL 8 sales (P1-P8)
- Why? Because John personally enrolled all 8

**L2-L5 Overrides:**
- Paid based on **MATRIX TREE** (matrix_parent_id)
- John's upline in matrix gets L2 override on P1-P5 sales
- P1's upline (which is John!) gets L2 override on P6-P8 sales
- Why? Because overrides follow matrix placement, not enrollment

---

## Real-World Example with Spillover

### Scenario:
- Alice enrolls 12 people
- Her sponsor is Bob
- Bob's sponsor is Carol

### Enrollment Tree:
```
         Carol
           |
         Bob
           |
        Alice
           |
    +------+------+------+------+
    |      |      |      |      |
   R1-R12 (Alice enrolled 12 people)
```

**Alice's "Personal Enrollees" = 12** (based on sponsor_id)

### Matrix Tree:
```
Level 0:            Bob
                     |
Level 1:         +---+---+---+---+---+
                 | 1 | 2 | 3 | 4 | 5 |
                 |   |   |   |   |   |
              Alice ?   ?   ?   ?
                 |
Level 2:     +---+---+---+---+---+
             | 1 | 2 | 3 | 4 | 5 |
             |   |   |   |   |   |
            R1  R2  R3  R4  R5
             |
Level 3:     +---+---+---+---+---+
             | 1 | 2 | 3 | 4 | 5 |
             |   |   |   |   |   |
            R6  R7  R8  R9  R10
             |
Level 4:     +---+
             | 1 | 2 |
             |   |   |
            R11 R12
```

**Alice's matrix shows:**
- L2: 5 people (R1-R5) with Alice as matrix_parent_id
- L3: 5 people (R6-R10) with R1 as matrix_parent_id (spillover!)
- L4: 2 people (R11-R12) with R6 as matrix_parent_id (spillover!)

**Key Insight:**
- Alice enrolled ALL 12 people (sponsor_id = Alice for R1-R12)
- But only 5 are "under" Alice in the matrix (matrix_parent_id = Alice for R1-R5)
- The other 7 spilled over into deeper levels

### Commissions:
**When R6 makes a sale:**

1. **L1 Override (30%)** → Goes to **Alice** (because Alice enrolled R6, per sponsor_id)
2. **L2 Override** → Goes to **R1** (because R6's matrix_parent_id = R1)
3. **L3 Override** → Goes to **Alice** (because R1's matrix_parent_id = Alice)
4. **L4 Override** → Goes to **Bob** (because Alice's matrix_parent_id = Bob)
5. **L5 Override** → Goes to **Carol** (because Bob's matrix_parent_id = Carol)

**Notice:**
- Alice gets BOTH L1 (as sponsor) AND L3 (as matrix ancestor)
- This is by design - you benefit from spillover in the matrix tree

---

## Views Explained

### Matrix View (`/dashboard/matrix`)
**Shows:** Matrix tree (matrix_parent_id)
**Purpose:** See your position in the forced 5×7 matrix
**Displays:**
- Your matrix parent (who you're placed under in matrix)
- Your 5 matrix positions (your direct matrix children)
- Drill down to see deeper levels
- Matrix stats: depth, position, capacity

**Key Feature:** Click on any matrix child to view THEIR matrix (drill down)

---

### Genealogy View (`/dashboard/genealogy`)
**Shows:** Enrollment tree (sponsor_id)
**Purpose:** See your personal organization (who YOU enrolled)
**Displays:**
- Your direct enrollees (people you personally recruited)
- Their enrollees (recursive)
- Total organization size
- Organization BV/credits
- Enrollment dates

**Key Feature:** Only shows people YOU enrolled, not spillover

---

### Team View (`/dashboard/team`)
**Shows:** L1 enrollment tree only (sponsor_id)
**Purpose:** Quick view of your direct enrollees
**Displays:**
- Only L1 (people you personally enrolled)
- Team statistics
- L1 override earnings this month
- Individual member stats

**Key Feature:** Focused on L1 for commission tracking

---

## Database Queries Cheat Sheet

### ❌ WRONG - Mixing Trees
```typescript
// DON'T DO THIS - Mixing enrollment and matrix
const { data } = await supabase
  .from('distributors')
  .select('*')
  .eq('matrix_parent_id', userId)  // Matrix query...
  .order('created_at');  // ...but sorting by enrollment date?
```

### ✅ CORRECT - Enrollment Tree
```typescript
// Get personal enrollees
const { data } = await supabase
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (
      personal_credits_monthly,
      team_credits_monthly
    )
  `)
  .eq('sponsor_id', userId)  // ✅ Uses sponsor_id
  .order('created_at');
```

### ✅ CORRECT - Matrix Tree
```typescript
// Get matrix children
const { data } = await supabase
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (
      personal_credits_monthly,
      team_credits_monthly
    )
  `)
  .eq('matrix_parent_id', userId)  // ✅ Uses matrix_parent_id
  .order('matrix_position');  // ✅ Orders by matrix position
```

### ✅ CORRECT - BV/Credits (Always JOIN)
```typescript
// ALWAYS fetch live BV/credits from members table
const { data } = await supabase
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (
      personal_credits_monthly,  // ✅ Live from members table
      team_credits_monthly       // ✅ Live from members table
    )
  `)
  .eq('id', distributorId);

// ❌ NEVER use cached fields:
// - distributors.personal_bv_monthly (CACHED/STALE)
// - distributors.group_bv_monthly (CACHED/STALE)
```

---

## Commission Calculation Flow

### When a Sale Happens:

1. **Identify Seller** (distributor who made the sale)
2. **Calculate BV** from sale amount
3. **Revenue Waterfall**:
   - BotMakers gets X%
   - Apex gets Y%
   - Override pool gets remaining

4. **L1 Override (30% of pool)**:
   - Query: `SELECT * FROM distributors WHERE id = seller.sponsor_id`
   - Pay seller's SPONSOR (enrollment tree)

5. **L2-L5 Overrides (varies by rank)**:
   - Walk UP the MATRIX TREE (matrix_parent_id)
   - Query: `SELECT * FROM distributors WHERE id = seller.matrix_parent_id` (L2)
   - Then: `SELECT * FROM distributors WHERE id = L2.matrix_parent_id` (L3)
   - Continue up to 5 levels
   - Pay based on rank and qualification

6. **Compression**:
   - Skip unqualified reps (< 50 BV)
   - Next qualified rep "compresses up" to receive override

7. **Record Earnings**:
   - Insert into `earnings_ledger` table
   - Track: member_id, earning_type, override_level, amount_usd, sale_id

---

## Visual Comparison

### Scenario: John Recruits 3 People Who Each Recruit 2

**Enrollment Tree View:**
```
                John
                  |
        +---------+---------+
        |         |         |
      Alice      Bob      Carol
        |         |         |
      +---+     +---+     +---+
      |   |     |   |     |   |
     Sue Joe   Tim Sam   Ann Pat
```

John can see:
- 3 direct enrollees (Alice, Bob, Carol)
- 6 second-level enrollees (Sue, Joe, Tim, Sam, Ann, Pat)
- Total organization: 9 people

**Matrix Tree View (if positions are filled):**
```
                John
                  |
        +---+---+---+---+---+
        | 1 | 2 | 3 | 4 | 5 |
        |   |   |   |   |   |
      Alice Bob Carol Sue Joe
        |
    +---+---+---+
    | 1 | 2 | 3 | 4 |
    |   |   |   |   |
   Tim Sam Ann Pat
```

John's matrix shows:
- L1: 5 positions filled (Alice, Bob, Carol, Sue, Joe)
- L2: 4 positions under Alice (Tim, Sam, Ann, Pat)
- NOTE: Sue, Joe (Alice's enrollees) are in John's L1 due to spillover!

**Key Difference:**
- Genealogy shows WHO YOU ENROLLED (unlimited width)
- Matrix shows YOUR POSITIONS in forced 5-wide structure (includes spillover)

---

## Quick Reference

| Need | Use This Field | Tree Type |
|------|---------------|-----------|
| Who did I enroll? | `sponsor_id` | Enrollment |
| Who gets L1 override? | `sponsor_id` | Enrollment |
| How many people in my team? | `sponsor_id` | Enrollment |
| Who is in my matrix? | `matrix_parent_id` | Matrix |
| Who gets L2-L5 overrides? | `matrix_parent_id` | Matrix |
| Where do new recruits go? | `matrix_parent_id` | Matrix |
| What's my current BV? | JOIN `members.personal_credits_monthly` | Members |
| What's my team BV? | JOIN `members.team_credits_monthly` | Members |

---

## Testing Your Understanding

### Question 1:
Alice enrolls Bob. Bob enrolls Carol. Where does Carol's L1 override go?

**Answer:** Bob (Carol's sponsor_id = Bob)

---

### Question 2:
Alice's matrix is full (5 positions). Alice enrolls Dave. Where does Dave get placed in the matrix?

**Answer:** Under Alice's first position holder (spillover follows breadth-first search)

---

### Question 3:
You want to count how many people Sarah personally recruited. Which field do you query?

**Answer:** `sponsor_id` (count where sponsor_id = Sarah's distributor_id)

---

### Question 4:
You want to display Sarah's matrix children. Which field do you query?

**Answer:** `matrix_parent_id` (select where matrix_parent_id = Sarah's distributor_id)

---

### Question 5:
You need to calculate overrides for a sale. Where do you get the seller's BV?

**Answer:** JOIN with `members` table, use `members.personal_credits_monthly` (NOT cached distributors fields)

---

## Resources

- **Full Audit Report:** `MATRIX-GENEALOGY-AUDIT-REPORT.md`
- **Source of Truth Rules:** `CLAUDE.md` (Section: "SINGLE SOURCE OF TRUTH")
- **Compensation Spec:** `APEX_COMP_ENGINE_SPEC_FINAL.md`
- **Tree Utilities:** `src/lib/genealogy/tree-utils.ts` (model implementation)
- **Placement Algorithm:** `src/lib/matrix/placement-algorithm.ts`

---

**Last Updated:** 2026-03-31
