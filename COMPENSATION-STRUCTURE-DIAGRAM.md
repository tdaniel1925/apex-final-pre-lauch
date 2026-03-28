# Apex Affinity Group - Compensation Structure Diagram

## ⚠️ THIS IS FOR TECH PRODUCTS ONLY!

**TECH PRODUCTS = 5-WIDE FORCED MATRIX STRUCTURE**
(Distributor/Technology Product Sales)

**For Insurance Products**, see: `INSURANCE-COMP-PLAN-DIAGRAM.md`
(Insurance uses UNLIMITED WIDTH generational model, NOT a matrix)

---

## TWO SEPARATE COMPENSATION SYSTEMS:

| System | Structure | Width Limit | Depth | Override Source |
|--------|-----------|-------------|-------|-----------------|
| **Tech Products** | 5-Wide Forced Matrix | 5 per level | 7 levels | matrix_parent_id |
| **Insurance** | Unlimited Generational | UNLIMITED | 6 generations | sponsor_id (generational) |

**This document covers TECH PRODUCTS ONLY.**

---

## YOU (Rep)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         YOUR COMPENSATION                                │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────┬────────────────────────────────────┐
│   ENROLLMENT TREE (enroller_id)    │  PLACEMENT MATRIX (matrix_parent)  │
│                                    │                                    │
│   Purpose: Track Who Recruited     │   Purpose: 5-Wide Forced Matrix    │
│   Limit: UNLIMITED                 │   Limit: 5×7 (19,531 positions)    │
│   Commission: 30% on ALL directs   │   Commission: By rank depth        │
└────────────────────────────────────┴────────────────────────────────────┘
```

---

## ENROLLMENT TREE (Personal/Direct Recruits)

```
                              YOU
                               │
        ┌──────┬───────┬───────┼───────┬───────┬──────┬──────┬─────┐
        │      │       │       │       │       │      │      │     │
       P1     P2      P3      P4      P5      P6     P7     P8   P9...
    (Direct) (Direct) (Direct) (Direct) (Direct) (Direct) (Direct) (Direct)

    💰 You earn 30% override on ALL of these (unlimited)
    📊 Tracked by: enroller_id = your_member_id
```

---

## PLACEMENT MATRIX (5-Wide Organization)

```
Level 1 (L2):              YOU
                            │
         ┌──────────┬───────┼───────┬──────────┐
         │          │       │       │          │
        P1         P2      P3      P4         P5
    (Position 1-5 ONLY - these could be YOUR directs OR spillover)

         │
    ┌────┼────┬────┬────┐
    │    │    │    │    │
   P1   P2   P3   P4   P5     (×5 = 25 at Level 2)

   Each of these 25 has 5 positions...

   Level 3: 125 positions
   Level 4: 625 positions
   Level 5: 3,125 positions
   Level 6: 15,625 positions
   Level 7: Total = 19,531 positions

   💰 You earn override % based on rank:
      - Starter: Level 1 only
      - Bronze: Levels 1-2
      - Silver: Levels 1-3
      - Gold: Levels 1-4
      - Platinum+: Levels 1-7

   📊 Tracked by: matrix_parent_id, matrix_position (1-5)
```

---

## EXAMPLE SCENARIO: You Recruit 8 People

### Enrollment Tree View:
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

Total Direct Recruits: 8
Commission: 30% on all 8 (unlimited)
```

### Placement Matrix View:
```
                    YOU
                     │
     ┌───────┬───────┼───────┬───────┐
     │       │       │       │       │
   John    Sarah   Mike    Lisa    Tom
   (P1)    (P2)    (P3)    (P4)    (P5)
     │
  ┌──┼──┬──┬──┐
  │  │  │  │  │
Amy Bob Carol ⬜ ⬜  (spillover under John)
(P1)(P2) (P3) (P4)(P5)

Level 1: 5 filled (your first 5 recruits)
Level 2: 3 filled (your last 3 recruits spilled over)

Matrix Override: Based on rank depth
- If Starter: Only earn on John, Sarah, Mike, Lisa, Tom (Level 1)
- If Bronze+: Also earn on Amy, Bob, Carol (Level 2)
```

---

## HOW IT WORKS TOGETHER

### When You Recruit Someone:

1. **Enrollment Assignment:**
   - They get `enroller_id = your_member_id`
   - You ALWAYS earn 30% override on them
   - NO LIMIT on how many you can recruit

2. **Matrix Placement:**
   - System checks: Do you have open positions in Level 1 (P1-P5)?
     - ✅ Yes → Place them in your first available position
     - ❌ No → Spillover to your downline's first available position
   - They get `matrix_parent_id` = whoever they're placed under
   - They get `matrix_position` = which slot (1-5)

3. **Commission Calculation:**
   - **From Enrollment:** 30% on this person (your direct recruit)
   - **From Matrix:** Override % on all people in your matrix (up to rank depth)

---

## DATABASE STRUCTURE

### Enrollment Tracking (members table):
```
enroller_id → Points to the member_id of who recruited you
sponsor_id  → (Often same as enroller_id)
```

### Matrix Placement (distributors table):
```
matrix_parent_id → UUID of parent in placement tree
matrix_position  → Integer 1-5 (which slot)
matrix_depth     → Integer 0-7 (how deep in tree)
```

---

## CURRENT MATRIX PAGE ISSUE

**What it shows now:** ❌ Only enrollment tree (unlimited children)

**What it should show:** ✅ Both trees:
1. "Personal Team" section → Enrollment tree (all your directs)
2. "Matrix Organization" section → 5-wide placement matrix

**Fix needed:**
- Change matrix display to use `matrix_parent_id` instead of `enroller_id`
- Show exactly 5 positions per level
- Show empty slots as available positions
- Place the 22 unplaced distributors into the matrix
