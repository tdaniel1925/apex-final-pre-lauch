# Compensation System Fix Requirements

**CRITICAL:** The compensation system is mixing enrollment tree with matrix placement tree. This WILL cause wrong commission calculations.

## The Problem

The compensation system has TWO types of overrides:

1. **L1 Enrollment Override** - Paid on YOUR PERSONAL ENROLLEES (sponsor_id)
2. **L2-L5 Matrix Override** - Paid on YOUR MATRIX DOWNLINE (matrix_parent_id)

**Current Code is WRONG:** It's treating matrix levels as if they come from the enrollment tree.

---

## Files That Need Fixing

### 1. src/lib/compensation/override-resolution.ts

**Lines 73, 80, 88, 190, 206, 209**

**Current (WRONG):**
```typescript
interface OverrideEntry {
  type: 'L1_enroller' | `L${number}_matrix`;
  level: number; // ← WRONG: Calculated from enrollment tree!
  matrixLevel?: number; // ← Treating this as optional/derived
}

// Line 88:
level: isEnroller ? 1 : (matrixLevel ?? 0),  // ← WRONG!

// Line 190 comment:
* This traverses the matrix/enroller tree  // ← WRONG: These are DIFFERENT!

// Line 206:
const matrixLevel = i + 1; // L1, L2, L3, L4, L5  // ← WRONG SOURCE!

// Line 209:
const result = calculateOverride(member, sale, isEnroller, matrixLevel);
```

**Should Be (CORRECT):**
```typescript
interface OverrideEntry {
  type: 'L1_enrollment' | 'L2_matrix' | 'L3_matrix' | 'L4_matrix' | 'L5_matrix';
  level: number;
  source_tree: 'enrollment' | 'matrix'; // ← NEW: Explicitly state which tree
  relationship_id: string; // ← sponsor_id OR matrix_parent_id
}

// For L1 Enrollment Override:
if (sale.distributor.sponsor_id === currentDistributor.id) {
  overrides.push({
    type: 'L1_enrollment',
    level: 1,
    source_tree: 'enrollment',
    relationship_id: sale.distributor.sponsor_id,
    amount: calculateL1Override(sale),
  });
}

// For L2-L5 Matrix Override:
// Walk UP the matrix tree (NOT enrollment tree!)
let current = sale.distributor;
for (let matrixLevel = 2; matrixLevel <= 5; matrixLevel++) {
  if (!current.matrix_parent_id) break;

  const parent = await getDistributor(current.matrix_parent_id);
  if (!parent) break;

  overrides.push({
    type: `L${matrixLevel}_matrix`,
    level: matrixLevel,
    source_tree: 'matrix',
    relationship_id: current.matrix_parent_id,
    amount: calculateMatrixOverride(sale, matrixLevel),
  });

  current = parent;
}
```

---

### 2. src/lib/compensation/override-calculator.ts

**Line 59**

**Current (WRONG):**
```typescript
override_type: 'L1_enroller' | `L${number}_matrix`;
```

**Should Be (CORRECT):**
```typescript
override_type:
  | 'L1_enrollment'  // ← From sponsor_id
  | 'L2_matrix'      // ← From matrix_parent_id
  | 'L3_matrix'
  | 'L4_matrix'
  | 'L5_matrix';
```

---

## Why This Matters (Real Example)

### Scenario: Charles Potter Sells $100 Product

**Enrollment Tree:**
```
Apex Vision
└─ Charles Potter (L1 enrollee of Apex Vision)
   └─ Donna Potter (L1 enrollee of Charles)
```

**Matrix Tree:**
```
Apex Vision (Depth 0)
├─ Position 1: Trent Daniel (Depth 1)
├─ Position 2: ???
├─ Position 3: Donna Potter (Depth 1)
│  └─ Position 1: Charles Potter (Depth 2)  ← DIFFERENT POSITION!
└─ Position 4: ???
```

**WRONG Calculation (Current Code):**
- L1 Override to: Apex Vision (enrollment parent)
- L2 Override to: ??? (walks enrollment tree up)

**CORRECT Calculation (Fixed Code):**
- L1 Enrollment Override to: Nobody (Charles has no enrollees making sales)
- L2 Matrix Override to: Donna Potter (Charles's matrix_parent_id)
- L3 Matrix Override to: Apex Vision (Donna's matrix_parent_id)

**Impact:** If we use enrollment tree for matrix overrides, Donna won't get paid!

---

## How To Fix

### Step 1: Separate the Trees

```typescript
// Get enrollment upline (for L1 override)
async function getEnrollmentUpline(distributorId: string): Promise<Distributor | null> {
  const { data } = await supabase
    .from('distributors')
    .select('*')
    .eq('id', distributorId)
    .single();

  if (!data || !data.sponsor_id) return null;

  const { data: sponsor } = await supabase
    .from('distributors')
    .select('*')
    .eq('id', data.sponsor_id)
    .single();

  return sponsor;
}

// Get matrix upline (for L2-L5 overrides)
async function getMatrixUpline(distributorId: string, levels: number): Promise<Distributor[]> {
  const upline: Distributor[] = [];
  let currentId = distributorId;

  for (let i = 0; i < levels; i++) {
    const { data } = await supabase
      .from('distributors')
      .select('*')
      .eq('id', currentId)
      .single();

    if (!data || !data.matrix_parent_id) break;

    const { data: parent } = await supabase
      .from('distributors')
      .select('*')
      .eq('id', data.matrix_parent_id)
      .single();

    if (!parent) break;

    upline.push(parent);
    currentId = parent.id;
  }

  return upline;
}
```

### Step 2: Calculate Overrides Separately

```typescript
async function calculateAllOverrides(sale: Sale): Promise<Override[]> {
  const overrides: Override[] = [];

  // L1 ENROLLMENT Override (sponsor_id)
  const sponsor = await getEnrollmentUpline(sale.distributor_id);
  if (sponsor) {
    overrides.push({
      distributor_id: sponsor.id,
      type: 'L1_enrollment',
      amount: sale.bv * 0.10, // 10%
      sale_id: sale.id,
      source_relationship: 'sponsor_id',
    });
  }

  // L2-L5 MATRIX Overrides (matrix_parent_id)
  const matrixUpline = await getMatrixUpline(sale.distributor_id, 4); // L2-L5

  matrixUpline.forEach((dist, index) => {
    const level = index + 2; // L2, L3, L4, L5
    const percentage = [0.05, 0.03, 0.02, 0.01][index]; // 5%, 3%, 2%, 1%

    overrides.push({
      distributor_id: dist.id,
      type: `L${level}_matrix`,
      amount: sale.bv * percentage,
      sale_id: sale.id,
      source_relationship: 'matrix_parent_id',
    });
  });

  return overrides;
}
```

---

## Testing Requirements

### Test Case 1: Direct Enrollment
```
Given: Charles enrolls Trent
When: Trent makes a $100 sale
Then: Charles gets L1 enrollment override ($10)
      Charles's matrix parent gets L2 matrix override ($5)
```

### Test Case 2: Matrix Spillover
```
Given: Trent is placed under Charles in matrix (but sponsored by someone else)
When: Trent makes a $100 sale
Then: Trent's sponsor gets L1 enrollment override ($10)
      Charles gets L2 matrix override ($5) (because Trent is in his matrix)
```

### Test Case 3: Both Trees Align
```
Given: Donna enrolls and is placed directly under Charles
When: Donna makes a $100 sale
Then: Charles gets BOTH L1 enrollment ($10) AND L2 matrix ($5) = $15 total
```

---

## Migration Plan

1. **DON'T touch the existing commission runs!** (They're in the past)
2. **Create new override calculation functions** (keep old ones for reference)
3. **Test new calculations against known scenarios**
4. **Run parallel calculations for one cycle** (old vs new)
5. **Compare results and verify correctness**
6. **Switch to new system after verification**

---

## Verification Queries

```sql
-- Check if anyone is in matrix but not enrolled under same person
SELECT
  d.id,
  d.first_name,
  d.last_name,
  s.first_name as sponsor_name,
  m.first_name as matrix_parent_name
FROM distributors d
LEFT JOIN distributors s ON d.sponsor_id = s.id
LEFT JOIN distributors m ON d.matrix_parent_id = m.id
WHERE d.sponsor_id != d.matrix_parent_id
  AND d.sponsor_id IS NOT NULL
  AND d.matrix_parent_id IS NOT NULL;

-- This query will show you WHO has different enrollment vs matrix paths
-- These are the people where the bug would cause wrong commissions!
```

---

## Summary

**CRITICAL CHANGES NEEDED:**

1. **override-resolution.ts**
   - Stop mixing enrollment tree with matrix tree
   - Create separate functions for L1 (enrollment) and L2-L5 (matrix)
   - Walk the correct tree for each override type

2. **override-calculator.ts**
   - Update override type definitions
   - Separate L1_enrollment from L2-L5_matrix

3. **Add Tests**
   - Test all 3 scenarios above
   - Verify overrides go to correct people
   - Compare old vs new calculations

**DO NOT DEPLOY** compensation changes until:
- [ ] Tests pass
- [ ] Parallel run matches expected results
- [ ] Reviewed by business/compliance

**This is a CRITICAL fix.** Wrong commissions = legal liability + angry reps!

---

**Last Updated:** March 22, 2026
**Assigned To:** Development Team
**Priority:** HIGH - Do not deploy until fixed
