# Matrix Spillover Algorithm - Tech Ladder 5×7 Forced Matrix

**Date**: March 22, 2026
**Status**: FINAL - Ready for Implementation
**Decision**: Left-to-Right, Top-to-Bottom (Breadth-First) Spillover

---

## 📋 CORE DECISION

**Spillover Algorithm**: **Left-to-Right, Top-to-Bottom (Breadth-First)**

When a sponsor recruits person #6+, the system automatically places them in the next available position, filling positions from left to right, level by level.

---

## 🎯 THE ALGORITHM

### Visual Example: Sponsor Recruits 13 People

```
                    SPONSOR (YOU)
                         |
        ┌────┬────┬─────┼─────┬────┐
        |    |    |     |     |    |
       R1   R2   R3    R4    R5       LEVEL 1 (Positions 1-5)
        |
    ┌───┼───┬───┬───┐
    |   |   |   |   |
   R6  R7  R8  R9  R10                LEVEL 2 (Under R1, Positions 1-5)
   |
  ┌┼┬┬┐
  |||||
 R11 R12 R13 □ □                      LEVEL 3 (Under R6, Positions 1-3 filled)
```

**Placement Order:**
1. R1-R5: Fill sponsor's direct Level 1 (5 positions)
2. R6-R10: Fill R1's Level 1 (5 positions) - spillover starts here
3. R11-R15: Fill R2's Level 1 (5 positions)
4. R16-R20: Fill R3's Level 1 (5 positions)
5. And so on...

**Key Rule**: Always fill the **leftmost available position** at the **shallowest level**.

---

## 🔢 ALGORITHM LOGIC

### Breadth-First Search (BFS) Placement

```python
def find_next_available_position(sponsor_id):
    """
    Find the next available matrix position for a new recruit.
    Uses breadth-first search to fill left-to-right, top-to-bottom.

    Returns: (parent_id, position_number, depth)
    """
    from collections import deque

    # Start with the sponsor
    queue = deque([(sponsor_id, 0)])  # (member_id, depth)

    while queue:
        current_id, current_depth = queue.popleft()

        # Check if current member has any open positions
        children = get_matrix_children(current_id)

        if len(children) < 5:
            # Found an open position!
            open_position = len(children) + 1  # Position 1-5
            return {
                'parent_id': current_id,
                'position': open_position,
                'depth': current_depth + 1
            }

        # All 5 positions filled, add children to queue (left to right)
        for child in children:
            if current_depth + 1 < 7:  # Don't exceed 7 levels
                queue.append((child.id, current_depth + 1))

    # Matrix is completely full (19,531 positions filled)
    return None

def get_matrix_children(parent_id):
    """
    Get all matrix children of a parent, ordered by position (1-5).
    """
    return db.query("""
        SELECT id, matrix_position
        FROM members
        WHERE matrix_parent_id = ?
        ORDER BY matrix_position ASC
    """, parent_id)
```

---

## 📊 PLACEMENT EXAMPLES

### Example 1: First 5 Recruits (Simple)

**Sponsor recruits 5 people:**

```
Recruit 1 → Sponsor's Position 1
Recruit 2 → Sponsor's Position 2
Recruit 3 → Sponsor's Position 3
Recruit 4 → Sponsor's Position 4
Recruit 5 → Sponsor's Position 5
```

**Database Records:**
```
Recruit 1: matrix_parent_id = SPONSOR, matrix_position = 1, matrix_depth = 1
Recruit 2: matrix_parent_id = SPONSOR, matrix_position = 2, matrix_depth = 1
Recruit 3: matrix_parent_id = SPONSOR, matrix_position = 3, matrix_depth = 1
Recruit 4: matrix_parent_id = SPONSOR, matrix_position = 4, matrix_depth = 1
Recruit 5: matrix_parent_id = SPONSOR, matrix_position = 5, matrix_depth = 1
```

---

### Example 2: Recruit #6-10 (First Spillover)

**Sponsor recruits 5 more people (total 10):**

```
Recruit 6 → R1's Position 1 (spillover)
Recruit 7 → R1's Position 2
Recruit 8 → R1's Position 3
Recruit 9 → R1's Position 4
Recruit 10 → R1's Position 5
```

**Database Records:**
```
Recruit 6:  matrix_parent_id = R1, matrix_position = 1, matrix_depth = 2
Recruit 7:  matrix_parent_id = R1, matrix_position = 2, matrix_depth = 2
Recruit 8:  matrix_parent_id = R1, matrix_position = 3, matrix_depth = 2
Recruit 9:  matrix_parent_id = R1, matrix_position = 4, matrix_depth = 2
Recruit 10: matrix_parent_id = R1, matrix_position = 5, matrix_depth = 2
```

**Important**: Sponsor still gets **30% L1 override** on R6-R10 (enroller rule), even though they're in R1's matrix positions.

---

### Example 3: Recruit #11-30 (Deeper Spillover)

**Sponsor recruits 20 more people (total 30):**

```
Recruit 11-15 → R2's Positions 1-5
Recruit 16-20 → R3's Positions 1-5
Recruit 21-25 → R4's Positions 1-5
Recruit 26-30 → R5's Positions 1-5
```

**Now sponsor's Level 1 AND Level 2 are completely full:**
- Level 1: 5 positions (R1-R5)
- Level 2: 25 positions (5 under each of R1-R5)

**Next recruit (#31) goes to Level 3:**
```
Recruit 31 → R6's Position 1 (R6 is R1's first child)
```

---

## 🔄 SPILLOVER ACROSS MULTIPLE SPONSORS

### Scenario: Team Building with Spillover

**You recruit 8 people:**
- Your Level 1: R1, R2, R3, R4, R5
- Spillover to Level 2: R6, R7, R8 (under R1)

**R3 recruits 7 people:**
- R3's Level 1: R3-1, R3-2, R3-3, R3-4, R3-5
- R3's spillover: R3-6, R3-7 (under R3-1)

**Visual:**
```
                    YOU
                     |
     ┌───┬───┬──────┼──────┬───┐
     |   |   |      |      |   |
    R1  R2  R3     R4     R5
     |       |
  ┌──┼──┐   ├─────┬───┬───┬───┐
  |  |  |   |     |   |   |   |
 R6 R7 R8  R3-1  R3-2 R3-3 R3-4 R3-5
              |
           ┌──┼──┐
           |  |  |
         R3-6 R3-7 □
```

**Key Point**: Each sponsor's spillover is independent. Your spillover goes under YOUR Level 1. R3's spillover goes under R3's Level 1.

---

## 💡 CRITICAL RULES

### Rule 1: Two Separate Trees

**Enrollment Tree** (`enroller_id`):
- Tracks who recruited whom
- IMMUTABLE (never changes)
- Used for 30% L1 override

**Placement Matrix** (`matrix_parent_id`):
- Tracks 5-wide forced matrix placement
- Can differ from enrollment tree (due to spillover)
- Used for L2-L5 depth overrides

**Example:**
```
You recruit R6, but R6 is placed under R1 in the matrix.

Enrollment: R6.enroller_id = YOU (30% L1 override)
Matrix: R6.matrix_parent_id = R1 (R1 earns L1 matrix override on R6)
```

### Rule 2: Spillover Never Skips Levels

The algorithm always fills the **shallowest available position** first.

**You cannot have:**
```
Level 1: [R1] [R2] [ ] [ ] [ ]  ← 2 filled, 3 empty
Level 2: [R3] ...                ← NO! Must fill Level 1 first
```

**Correct:**
```
Level 1: [R1] [R2] [R3] [ ] [ ]  ← Fill Level 1 first
Level 2: (empty)
```

### Rule 3: Matrix Depth Limit = 7 Levels

Matrix only goes 7 levels deep (19,531 total positions).

If a sponsor's matrix is completely full (all 19,531 positions filled), new recruits:
- Still have `enroller_id = sponsor` (30% L1 override)
- Get placed in **sponsor's upline's next available position** (spillover to upline)

**This is extremely rare and would only happen at massive scale.**

---

## 🛠️ DATABASE SCHEMA

### Required Fields

```sql
CREATE TABLE members (
  member_id UUID PRIMARY KEY,

  -- Enrollment Tree (IMMUTABLE)
  enroller_id UUID NOT NULL,  -- Who recruited this person

  -- Placement Matrix (Spillover-driven)
  matrix_parent_id UUID,      -- Who this person sits under in 5-wide matrix
  matrix_position INT,        -- Position 1-5 under parent
  matrix_depth INT,           -- How deep in matrix (0=root, 1-7=levels)

  -- Timestamps
  enrollment_date TIMESTAMP NOT NULL,
  matrix_placement_date TIMESTAMP
);

-- Index for fast matrix queries
CREATE INDEX idx_matrix_parent ON members(matrix_parent_id);
CREATE INDEX idx_matrix_position ON members(matrix_parent_id, matrix_position);
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### When a New Member Enrolls:

```python
def enroll_new_member(sponsor_id, new_member_data):
    """
    1. Create member record
    2. Set enroller_id (immutable)
    3. Find matrix placement
    4. Set matrix_parent_id, matrix_position, matrix_depth
    """
    # Step 1: Create member
    new_member = create_member(new_member_data)
    new_member.enroller_id = sponsor_id

    # Step 2: Find matrix placement using spillover algorithm
    placement = find_next_available_position(sponsor_id)

    if placement:
        new_member.matrix_parent_id = placement['parent_id']
        new_member.matrix_position = placement['position']
        new_member.matrix_depth = placement['depth']
        new_member.matrix_placement_date = now()
    else:
        # Matrix full (extremely rare)
        # Spillover to upline logic here
        pass

    db.save(new_member)
    return new_member
```

---

## 📋 SUMMARY

**Spillover Algorithm**: Left-to-Right, Top-to-Bottom (Breadth-First)

**Key Points**:
1. ✅ Each person has exactly 5 matrix positions
2. ✅ Recruit #6+ automatically spills to next available position
3. ✅ Fill left to right, top to bottom (breadth-first)
4. ✅ Two separate trees: enrollment (`enroller_id`) vs matrix (`matrix_parent_id`)
5. ✅ Sponsor always gets 30% L1 override on personal recruits (enroller rule)
6. ✅ Matrix placement determines L2-L5 depth overrides
7. ✅ Maximum 7 levels deep (19,531 positions)

---

**END OF SPILLOVER ALGORITHM SPECIFICATION**

*Next Topic: Two Trees (Enrollment vs Placement Matrix) - Detailed Explanation*
