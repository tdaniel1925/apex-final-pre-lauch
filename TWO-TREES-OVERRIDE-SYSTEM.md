# Two Trees & Override System - Tech Ladder Compensation

**Date**: March 22, 2026
**Status**: FINAL - Ready for Implementation
**Decision**: Dual Override System with Enroller Priority (No Double-Dipping)

---

## 📋 CORE CONCEPT: TWO SEPARATE TREES

The Tech Ladder uses **TWO completely separate tree structures** for different purposes:

1. **ENROLLMENT TREE** - Tracks who recruited whom (unlimited width)
2. **PLACEMENT MATRIX** - 5-wide forced matrix for organizing team (forced width)

---

## 🌳 THE TWO TREES EXPLAINED

### Tree 1: ENROLLMENT TREE (Unlimited Width)

**Database Field**: `enroller_id` (IMMUTABLE - never changes)

**Purpose**: Track who recruited whom

**Width**: UNLIMITED - you can personally recruit as many people as you want

**Visual Example - You recruit 8 people:**
```
                    YOU
                     |
    ┌────┬────┬────┬┼┬────┬────┬────┐
    |    |    |    | |    |    |    |
   R1   R2   R3   R4 R5  R6   R7   R8

enroller_id for ALL 8 = YOU
```

**Commission Impact**:
- You earn **30% L1 override** on ALL 8 people
- No limit on width
- Paid from the **40% override pool**
- 30% of $92.91 = $27.87 per sale (on $499 PulseCommand example)

---

### Tree 2: PLACEMENT MATRIX (5-Wide Forced)

**Database Fields**: `matrix_parent_id`, `matrix_position` (1-5), `matrix_depth` (0-7)

**Purpose**: Organize team into 5-wide structure for depth-based overrides

**Width**: LIMITED to 5 positions per level (FORCED)

**Visual Example - Same 8 recruits, but placed in matrix:**
```
                    YOU
                     |
        ┌────┬────┬─┼─┬────┐
        |    |    | | |    |
       R1   R2   R3 R4 R5        (YOUR Level 1 - 5 positions)
        |
     ┌──┼──┬──┐
     |  |  |  |
    R6 R7 R8 □ □                 (R1's Level 1 - spillover)

matrix_parent_id:
- R1-R5: YOU
- R6-R8: R1 (spillover)
```

**Commission Impact**:
- YOU earn matrix overrides on R1-R5 (based on your rank)
- R1 earns matrix overrides on R6-R8 (based on R1's rank)
- Paid from the **40% override pool**
- Percentages based on depth and rank

---

## 💰 OVERRIDE CALCULATION SYSTEM

### The 40% Override Pool Distribution

**Example: PulseCommand Retail $499**

```
Commission Pool (BV) = $232.28
├─ 60% Seller: $139.37
└─ 40% Override Pool: $92.91  ← THIS is what gets distributed

The $92.91 Override Pool is split across L1-L5:
├─ L1: 30% of $92.91 = $27.87
├─ L2: 25% of $92.91 = $23.23  (Crown/Elite rank)
├─ L3: 20% of $92.91 = $18.58  (Crown/Elite rank)
├─ L4: 15% of $92.91 = $13.94  (Crown/Elite rank)
└─ L5: 10% of $92.91 = $9.29   (Crown/Elite rank)
```

---

### 🚨 CRITICAL RULE: Enroller Priority (No Double-Dipping)

**When calculating overrides for each upline member, check enroller FIRST:**

```python
def calculate_override(upline_rep, org_member, sale):
    """
    Calculate override for one upline rep on one org member's sale.

    RULE: Check enroller_id FIRST. If match, pay 30% and stop.
    Otherwise, check matrix position and pay based on rank.

    NO DOUBLE-DIPPING: Each upline rep gets paid ONCE per sale.
    """
    if not upline_rep.override_qualified:
        return 0  # Must have 50+ BV/month to qualify

    override_pool = sale.bv * 0.40  # 40% of BV

    # STEP 1: Check enroller_id FIRST
    if org_member.enroller_id == upline_rep.member_id:
        # ENROLLER RULE: Always 30% of override pool
        amount = override_pool * 0.30
        log_commission(upline_rep, org_member, 'L1_enroller', amount)
        return amount

    # STEP 2: Check matrix position (only if NOT the enroller)
    matrix_level = get_matrix_level(upline_rep, org_member)

    if matrix_level is None or matrix_level < 1 or matrix_level > 5:
        return 0  # Not in matrix upline

    # Get override percentage based on rank and level
    override_schedule = get_override_schedule(upline_rep.tech_rank)
    rate = override_schedule[matrix_level - 1]  # L1=index 0, L2=index 1, etc.

    if rate == 0:
        return 0  # Rank hasn't unlocked this level

    amount = override_pool * rate
    log_commission(upline_rep, org_member, f'L{matrix_level}_matrix', amount)
    return amount
```

---

## 📊 OVERRIDE EXAMPLES

### Example 1: Personal Recruit in Your Matrix

**Scenario:**
- You recruit R1
- R1 is in Position 1 of YOUR matrix
- R1 makes a sale: $499 PulseCommand (BV = $232, Override Pool = $92.91)

**Override Calculation:**
```
Check: Is YOU the enroller of R1? YES
→ YOU get: $92.91 × 30% = $27.87 (L1 enroller override)
→ DONE. No additional matrix override.

Result: YOU earn $27.87 from this sale
```

**Why no double-dipping?**
- You ARE the enroller → 30% paid
- You ARE the matrix parent → SKIP (already paid as enroller)

---

### Example 2: Personal Recruit NOT in Your Matrix (Spillover)

**Scenario:**
- You recruit R6 (7th recruit overall, after R1-R5 filled your Level 1)
- R6 is placed under R1 in the matrix (spillover)
- R6 makes a sale: $499 PulseCommand (Override Pool = $92.91)

**Override Calculation:**

**For YOU:**
```
Check: Is YOU the enroller of R6? YES
→ YOU get: $92.91 × 30% = $27.87 (L1 enroller override)
→ DONE.

Result: YOU earn $27.87
```

**For R1 (R6's matrix parent):**
```
Check: Is R1 the enroller of R6? NO (YOU are)
→ Check matrix position: R6 is in R1's Level 1
→ R1's rank: Gold (L1-L4 unlocked)
→ L1 rate for Gold: 30%
→ R1 gets: $92.91 × 30% = $27.87 (L1 matrix override)

Result: R1 ALSO earns $27.87
```

**Total paid from override pool: $27.87 + $27.87 = $55.74 (60% of $92.91)**

**Remaining in pool: $92.91 - $55.74 = $37.17 (available for L2-L5 upline)**

---

### Example 3: NOT Your Recruit, But in Your Matrix

**Scenario:**
- R1 recruits R1-A
- R1's matrix is full (5 positions)
- R1-A spills to YOUR Level 2 (under R1, who is in your matrix)
- R1-A makes a sale: $499 PulseCommand (Override Pool = $92.91)

**Override Calculation:**

**For R1 (enroller):**
```
Check: Is R1 the enroller of R1-A? YES
→ R1 gets: $92.91 × 30% = $27.87 (L1 enroller override)
→ DONE.

Result: R1 earns $27.87
```

**For YOU (matrix upline, but NOT enroller):**
```
Check: Is YOU the enroller of R1-A? NO (R1 is)
→ Check matrix position: R1-A is in YOUR Level 2 (under R1)
→ Your rank: Crown (L1-L5 unlocked)
→ L2 rate for Crown: 25%
→ YOU get: $92.91 × 25% = $23.23 (L2 matrix override)

Result: YOU earn $23.23
```

**Total paid: $27.87 + $23.23 = $51.10 (55% of pool)**

---

## 🔄 OVERRIDE COMPRESSION

**What happens when an upline member is NOT override-qualified?**

**Rule: Compression UP** - Skip them and pay the next qualified upline

**Example:**
```
Level 1: R1 (NOT qualified - only 30 BV this month, needs 50)
Level 2: YOU (qualified - 500 BV this month)

R1's recruit makes a sale.

Normal:
- R1 gets 30% enroller override

With compression:
- R1 gets $0 (not qualified)
- Compress UP to YOU
- YOU get 30% (next qualified upline in enrollment tree)
```

**Code:**
```python
def distribute_overrides_with_compression(sale, org_member):
    """
    Distribute overrides with compression for unqualified upline.
    """
    override_pool = sale.bv * 0.40

    # Start with enroller
    enroller = get_member(org_member.enroller_id)

    if enroller.override_qualified:
        pay_override(enroller, override_pool * 0.30, 'L1_enroller')
    else:
        # Compress to next qualified upline in enrollment tree
        next_qualified = find_next_qualified_enroller(enroller)
        if next_qualified:
            pay_override(next_qualified, override_pool * 0.30, 'L1_enroller_compressed')

    # Then distribute matrix overrides (L2-L5)
    distribute_matrix_overrides(sale, org_member, override_pool)
```

---

## 📈 RANKED OVERRIDE SCHEDULES

**Percentages of the 40% Override Pool:**

| Tech Rank | L1 (Enroller or Matrix) | L2 | L3 | L4 | L5 |
|-----------|------------------------|----|----|----|----|
| **Starter** | 30% | — | — | — | — |
| **Bronze** | 30% | 5% | — | — | — |
| **Silver** | 30% | 10% | 5% | — | — |
| **Gold** | 30% | 15% | 10% | 5% | — |
| **Platinum** | 30% | 18% | 12% | 8% | 3% |
| **Ruby** | 30% | 20% | 15% | 10% | 5% |
| **Diamond** | 30% | 22% | 18% | 12% | 8% |
| **Crown** | 30% | 25% | 20% | 15% | 10% |
| **Elite** | 30% | 25% | 20% | 15% | 10% |

**Key Rules:**
- L1 is ALWAYS 30% (whether enroller override or matrix override)
- Higher ranks unlock deeper levels (L2-L5)
- Higher ranks get higher percentages at each level
- Must be override-qualified (50+ BV/month) to earn

---

## 🛠️ DATABASE SCHEMA

```sql
CREATE TABLE members (
  member_id UUID PRIMARY KEY,

  -- ENROLLMENT TREE (immutable)
  enroller_id UUID NOT NULL,

  -- PLACEMENT MATRIX (spillover-driven)
  matrix_parent_id UUID,
  matrix_position INT,  -- 1-5
  matrix_depth INT,     -- 0-7

  -- Rank & Qualification
  tech_rank VARCHAR(20) DEFAULT 'starter',
  personal_bv_monthly INT DEFAULT 0,
  group_bv_monthly INT DEFAULT 0,
  override_qualified BOOLEAN DEFAULT FALSE,  -- TRUE if personal_bv >= 50

  -- Timestamps
  enrollment_date TIMESTAMP NOT NULL,
  matrix_placement_date TIMESTAMP
);

-- Commission Ledger
CREATE TABLE commission_ledger (
  ledger_id UUID PRIMARY KEY,
  member_id UUID NOT NULL,
  org_member_id UUID NOT NULL,  -- Who generated the sale
  commission_type VARCHAR(30),   -- 'L1_enroller', 'L2_matrix', etc.
  amount DECIMAL(10,2),
  override_pool_total DECIMAL(10,2),
  sale_bv DECIMAL(10,2),
  pay_period DATE,
  created_at TIMESTAMP
);
```

---

## 💡 KEY RULES SUMMARY

1. ✅ **Two separate trees**: Enrollment (`enroller_id`) + Matrix (`matrix_parent_id`)
2. ✅ **Enroller priority**: Check enroller_id FIRST, pay 30%, then stop
3. ✅ **No double-dipping**: Each upline gets paid ONCE per sale
4. ✅ **L1 always 30%**: Whether enroller override or matrix override
5. ✅ **Override pool is 40% of BV**: Distributed across L1-L5
6. ✅ **50 BV minimum**: Must qualify monthly to earn overrides
7. ✅ **Compression**: Skip unqualified upline, pay next qualified member
8. ✅ **Ranked schedules**: Higher ranks unlock deeper levels with higher %

---

## 🎯 IMPLEMENTATION STEPS

### Step 1: When Member Enrolls
```python
new_member.enroller_id = sponsor_id  # IMMUTABLE
placement = find_next_available_position(sponsor_id)
new_member.matrix_parent_id = placement['parent_id']
new_member.matrix_position = placement['position']
new_member.matrix_depth = placement['depth']
```

### Step 2: When Sale Occurs
```python
sale = {
    'member_id': seller_id,
    'product': 'pulse_command',
    'price_paid': 499,
    'bv': 232
}

# Pay seller (60% of BV)
pay_seller(seller_id, sale.bv * 0.60)

# Distribute overrides (40% of BV)
distribute_overrides(sale, seller_id)
```

### Step 3: Distribute Overrides
```python
def distribute_overrides(sale, org_member_id):
    override_pool = sale.bv * 0.40
    org_member = get_member(org_member_id)

    # STEP 1: Pay enroller (30% L1)
    enroller = get_member(org_member.enroller_id)
    if enroller.override_qualified:
        pay(enroller, override_pool * 0.30, 'L1_enroller')

    # STEP 2: Pay matrix upline (L1-L5 based on rank)
    upline = get_matrix_upline(org_member, max_depth=5)
    for level, upline_member in enumerate(upline, start=1):
        # Skip if this is the enroller (already paid)
        if upline_member.member_id == org_member.enroller_id:
            continue

        if upline_member.override_qualified:
            rate = get_override_rate(upline_member.tech_rank, level)
            if rate > 0:
                pay(upline_member, override_pool * rate, f'L{level}_matrix')
```

---

**END OF TWO TREES & OVERRIDE SYSTEM SPECIFICATION**

*Next Topic: UI Design (Show Both Trees or Just Matrix?)*
