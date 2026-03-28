# DUAL-TREE SYSTEM DOCUMENTATION

**Version:** 1.0
**Last Updated:** 2026-03-27
**Critical:** Read this before working with genealogy or compensation code

---

## 📋 TABLE OF CONTENTS

1. [What is the Dual-Tree System?](#what-is-the-dual-tree-system)
2. [Why Two Trees?](#why-two-trees)
3. [The Two Trees Explained](#the-two-trees-explained)
4. [When to Use Each Tree](#when-to-use-each-tree)
5. [Common Mistakes](#common-mistakes)
6. [Using the Tree Utilities Library](#using-the-tree-utilities-library)
7. [Code Examples](#code-examples)
8. [Database Schema Reference](#database-schema-reference)
9. [Testing Your Code](#testing-your-code)
10. [FAQs](#faqs)

---

## What is the Dual-Tree System?

The Apex MLM compensation plan uses **TWO SEPARATE TREE STRUCTURES** to organize distributors:

1. **Enrollment Tree** - Based on who enrolled whom
2. **Matrix Tree** - Based on 5×7 forced matrix placement with spillover

**CRITICAL RULE:** These trees are COMPLETELY SEPARATE. Never mix them!

```
❌ WRONG: Using matrix_parent_id to count "personal recruits"
✅ CORRECT: Using sponsor_id to count personal recruits
```

---

## Why Two Trees?

### Business Reasons

**Enrollment Tree (sponsor_id)**
- Tracks who brought whom into the business
- Used for L1 override commissions (30%)
- Rewards direct recruitment efforts
- Unlimited width (no position limit)

**Matrix Tree (matrix_parent_id)**
- Creates a structured organization (5 positions per level, 7 levels deep)
- Used for L2-L5 override commissions (varies by rank)
- Enables spillover (placing new recruits under downline members)
- Creates team leverage and passive income potential

### Technical Reasons

Separating the trees prevents:
- Commission calculation errors (paying wrong person)
- Team counting errors (including spillover as personal recruits)
- Placement conflicts (when sponsor's matrix is full)
- Compression issues (when sponsor isn't qualified for overrides)

---

## The Two Trees Explained

### Enrollment Tree (Sponsor Tree)

```
Database Field: distributors.sponsor_id
Purpose: Track who enrolled whom
Use For: L1 overrides, team counting, enrollment relationships
```

**Characteristics:**
- **Unlimited width** - One person can enroll unlimited people
- **Direct relationship** - sponsor_id always points to the person who enrolled you
- **Never changes** - Once enrolled, your sponsor never changes
- **Used for L1 overrides** - Sponsor gets 30% of override pool

**Example:**
```
John (id: A)
├── Mary (id: B, sponsor_id: A)
├── Steve (id: C, sponsor_id: A)
├── Lisa (id: D, sponsor_id: A)
└── Tom (id: E, sponsor_id: A)
```

John has 4 **personal enrollees** (Mary, Steve, Lisa, Tom).

### Matrix Tree (Placement Tree)

```
Database Field: distributors.matrix_parent_id
Purpose: 5×7 forced matrix placement
Use For: L2-L5 overrides, spillover tracking, matrix visualization
```

**Characteristics:**
- **Limited width** - Maximum 5 positions per level
- **Includes spillover** - Your matrix can include people you didn't enroll
- **Round-robin placement** - When your 5 positions are full, new recruits go under your downline
- **Used for L2-L5 overrides** - Matrix upline gets varying percentages based on rank

**Example:**
```
John (id: A)
├── Position 1: Mary (matrix_parent_id: A, matrix_position: 1)
├── Position 2: Steve (matrix_parent_id: A, matrix_position: 2)
├── Position 3: Lisa (matrix_parent_id: A, matrix_position: 3)
├── Position 4: Tom (matrix_parent_id: A, matrix_position: 4)
└── Position 5: Sarah (matrix_parent_id: A, matrix_position: 5)
```

**IMPORTANT:** Sarah might have been enrolled by Mary, but placed under John due to spillover!

---

## When to Use Each Tree

### Use Enrollment Tree (sponsor_id) For:

✅ **L1 Override Calculations**
- L1 override is ALWAYS paid to the enrollment sponsor
- 30% of override pool
- Use `getEnrollmentSponsor()` to find who gets L1 override

✅ **Counting Personal Enrollees**
- "How many people did I personally enroll?"
- Team building reports
- Personal recruitment stats
- Use `countEnrollmentChildren()` or `getEnrollmentChildren()`

✅ **Enrollment Reports**
- Genealogy reports showing who enrolled whom
- Enrollment tree visualization
- "My Personal Recruits" displays

✅ **Team Volume Rollup**
- Rolling up BV from personally enrolled team
- Team credits calculation (enrollment tree only)

### Use Matrix Tree (matrix_parent_id) For:

✅ **L2-L5 Override Calculations**
- L2, L3, L4, L5 overrides paid based on matrix upline
- Varies by rank (see override schedules)
- Use `getMatrixParent()` to walk up matrix tree

✅ **Matrix Visualization**
- Displaying the 5×7 matrix structure
- Showing matrix positions (1-5)
- Matrix depth displays

✅ **Spillover Tracking**
- Finding who received spillover from upline
- Matrix placement reports
- "My Matrix Organization" displays

✅ **Placement Operations**
- When enrolling a new distributor, find their matrix placement
- Use placement algorithm with matrix_parent_id

---

## Common Mistakes

### ❌ Mistake #1: Using Matrix Tree to Count Personal Recruits

```typescript
// ❌ WRONG - This includes spillover!
const { count } = await supabase
  .from('distributors')
  .select('*', { count: 'exact', head: true })
  .eq('matrix_parent_id', userId);  // WRONG!

console.log(`You enrolled ${count} people`);  // INCORRECT - includes spillover
```

**Why Wrong:** Matrix tree includes people you didn't enroll (spillover from upline).

**Fix:**
```typescript
// ✅ CORRECT - Use enrollment tree
const { count } = await supabase
  .from('distributors')
  .select('*', { count: 'exact', head: true })
  .eq('sponsor_id', userId);  // CORRECT!

console.log(`You enrolled ${count} people`);  // CORRECT - only your enrollees
```

### ❌ Mistake #2: Using Enrollment Tree for L2-L5 Overrides

```typescript
// ❌ WRONG - L2-L5 overrides use matrix tree!
let current = seller.sponsor_id;  // WRONG!
while (current && level <= 5) {
  const parent = await getSponsor(current);  // WRONG!
  // Pay override based on level
  current = parent?.sponsor_id;  // WRONG!
}
```

**Why Wrong:** L2-L5 overrides follow matrix upline, not enrollment upline.

**Fix:**
```typescript
// ✅ CORRECT - Use matrix tree for L2-L5
let current = seller.matrix_parent_id;  // CORRECT!
while (current && level <= 5) {
  const parent = await getMatrixParent(current);  // CORRECT!
  // Pay override based on level
  current = parent?.matrix_parent_id;  // CORRECT!
}
```

### ❌ Mistake #3: Confusing "Sponsor" with "Matrix Parent"

```typescript
// ❌ WRONG - These are NOT the same!
const sponsor = distributor.matrix_parent_id;  // WRONG terminology!
```

**Why Wrong:** "Sponsor" means enrollment sponsor (sponsor_id). Matrix parent (matrix_parent_id) may be different due to spillover.

**Fix:**
```typescript
// ✅ CORRECT - Use precise terminology
const enrollmentSponsor = distributor.sponsor_id;  // Who enrolled them
const matrixParent = distributor.matrix_parent_id;  // Who they're placed under

// These may be different people!
if (enrollmentSponsor !== matrixParent) {
  console.log('This distributor received spillover placement');
}
```

### ❌ Mistake #4: Mixing Trees in One Query

```typescript
// ❌ WRONG - Mixing enrollment and matrix trees
const { data } = await supabase
  .from('distributors')
  .select('*')
  .eq('sponsor_id', userId)  // Enrollment tree
  .eq('matrix_parent_id', userId);  // Matrix tree - CONFLICTING!
```

**Why Wrong:** You're trying to find people who are BOTH enrolled by you AND placed under you in matrix. This is a logical error.

**Fix:**
```typescript
// ✅ CORRECT - Separate queries for separate trees
const enrollees = await supabase
  .from('distributors')
  .select('*')
  .eq('sponsor_id', userId);  // My personal enrollees

const matrixChildren = await supabase
  .from('distributors')
  .select('*')
  .eq('matrix_parent_id', userId);  // My matrix positions (includes spillover)
```

---

## Using the Tree Utilities Library

The `src/lib/genealogy/tree-utils.ts` library provides type-safe functions for working with both trees.

### Import the Library

```typescript
import {
  // Enrollment tree functions
  getEnrollmentChildren,
  getEnrollmentSponsor,
  countEnrollmentChildren,
  walkEnrollmentTreeUp,

  // Matrix tree functions
  getMatrixChildren,
  getMatrixParent,
  walkMatrixTreeUp,

  // Utility functions
  isInEnrollmentDownline,
  isInMatrixDownline,
} from '@/lib/genealogy/tree-utils';
```

### Enrollment Tree Functions

#### getEnrollmentChildren()
Get all people personally enrolled by a distributor.

```typescript
const enrollees = await getEnrollmentChildren(distributorId);
console.log(`${enrollees.length} personal recruits`);
```

**Returns:** `EnrollmentChild[]` - Array of directly enrolled distributors
**Use For:** Team counting, personal recruit reports, L1 override identification

#### getEnrollmentSponsor()
Get the person who enrolled this distributor.

```typescript
const sponsor = await getEnrollmentSponsor(distributorId);
if (sponsor) {
  console.log(`${sponsor.first_name} gets L1 override (30%)`);
}
```

**Returns:** `DistributorNode | null`
**Use For:** Finding who gets L1 override

#### countEnrollmentChildren()
Count how many people were directly enrolled.

```typescript
const count = await countEnrollmentChildren(distributorId);
console.log(`You've enrolled ${count} people`);
```

**Returns:** `number`
**Use For:** Fast count without fetching all data

#### walkEnrollmentTreeUp()
Get all upline sponsors from distributor to root.

```typescript
const upline = await walkEnrollmentTreeUp(distributorId);
console.log(`${upline.length} levels of enrollment upline`);
```

**Returns:** `DistributorNode[]`
**Use For:** Enrollment genealogy reports, finding all enrollment upline

### Matrix Tree Functions

#### getMatrixChildren()
Get all distributors in matrix positions under this distributor.

```typescript
const matrixChildren = await getMatrixChildren(distributorId);
console.log(`${matrixChildren.length} matrix positions filled (includes spillover)`);
```

**Returns:** `MatrixChild[]`
**Use For:** Matrix visualization, L2-L5 override calculations

**WARNING:** This includes spillover! These may NOT be people you enrolled.

#### getMatrixParent()
Get the upline in matrix tree.

```typescript
const matrixParent = await getMatrixParent(distributorId);
if (matrixParent) {
  console.log(`Matrix parent gets L2 override (if qualified)`);
}
```

**Returns:** `DistributorNode | null`
**Use For:** L2-L5 override calculations

**WARNING:** This may NOT be who enrolled you!

#### walkMatrixTreeUp()
Get all upline in matrix tree (max 7 levels).

```typescript
const matrixUpline = await walkMatrixTreeUp(distributorId);
console.log(`${matrixUpline.length} levels of matrix upline`);
```

**Returns:** `DistributorNode[]` (max 7 levels)
**Use For:** L2-L5 override distribution, matrix genealogy

---

## Code Examples

### Example 1: Calculate L1 Override (Enrollment Tree)

```typescript
import { getEnrollmentSponsor } from '@/lib/genealogy/tree-utils';

async function calculateL1Override(sellerId: string, saleAmount: number) {
  // L1 override ALWAYS goes to enrollment sponsor
  const sponsor = await getEnrollmentSponsor(sellerId);

  if (!sponsor) {
    console.log('No sponsor - seller is at root');
    return null;
  }

  // Check if sponsor is qualified (50+ BV monthly)
  const { data: sponsorMember } = await supabase
    .from('members')
    .select('personal_credits_monthly, override_qualified')
    .eq('distributor_id', sponsor.id)
    .single();

  if (!sponsorMember?.override_qualified) {
    console.log('Sponsor not qualified for overrides (<50 BV)');
    return null;
  }

  const l1Override = saleAmount * 0.30;  // 30% of override pool

  return {
    upline_id: sponsor.id,
    upline_name: `${sponsor.first_name} ${sponsor.last_name}`,
    override_type: 'L1_enrollment',
    override_amount: l1Override
  };
}
```

### Example 2: Calculate L2-L5 Overrides (Matrix Tree)

```typescript
import { walkMatrixTreeUp } from '@/lib/genealogy/tree-utils';

async function calculateMatrixOverrides(sellerId: string, saleAmount: number) {
  const overrides = [];

  // Walk up matrix tree (max 5 levels for L2-L5)
  const matrixUpline = await walkMatrixTreeUp(sellerId, 5);

  // Override rates by level (L2, L3, L4, L5)
  const rates = [0.20, 0.15, 0.10, 0.10];  // Example for a rank

  for (let i = 0; i < matrixUpline.length && i < 4; i++) {
    const upline = matrixUpline[i];
    const level = i + 2;  // L2 = index 0, L3 = index 1, etc.

    // Check if qualified
    const { data: member } = await supabase
      .from('members')
      .select('personal_credits_monthly, override_qualified')
      .eq('distributor_id', upline.id)
      .single();

    if (!member?.override_qualified) {
      // Compression: Skip unqualified upline
      continue;
    }

    const overrideAmount = saleAmount * rates[i];

    overrides.push({
      upline_id: upline.id,
      upline_name: `${upline.first_name} ${upline.last_name}`,
      override_type: `L${level}_matrix`,
      override_amount: overrideAmount
    });
  }

  return overrides;
}
```

### Example 3: Display Team Statistics (Both Trees)

```typescript
import {
  getEnrollmentChildren,
  getMatrixChildren
} from '@/lib/genealogy/tree-utils';

async function getTeamStats(distributorId: string) {
  // Personal enrollees (enrollment tree)
  const enrollees = await getEnrollmentChildren(distributorId);

  // Matrix organization (matrix tree)
  const matrixChildren = await getMatrixChildren(distributorId);

  // Calculate stats
  const personalEnrollees = enrollees.length;
  const matrixPositionsFilled = matrixChildren.length;
  const matrixPositionsAvailable = 5 - matrixPositionsFilled;

  // Who received spillover?
  const spilloverRecipients = matrixChildren.filter(child => {
    // If in matrix but not in enrollment tree, it's spillover
    return !enrollees.some(enrollee => enrollee.id === child.id);
  });

  return {
    personal_enrollees: personalEnrollees,
    matrix_positions_filled: matrixPositionsFilled,
    matrix_positions_available: matrixPositionsAvailable,
    spillover_received: spilloverRecipients.length,
    spillover_recipients: spilloverRecipients.map(r => ({
      id: r.id,
      name: `${r.first_name} ${r.last_name}`,
      enrolled_by: r.sponsor_id  // Who actually enrolled them
    }))
  };
}
```

---

## Database Schema Reference

### distributors Table

```sql
CREATE TABLE distributors (
  id UUID PRIMARY KEY,

  -- Enrollment Tree (who enrolled whom)
  sponsor_id UUID REFERENCES distributors(id),  -- ✅ Use for L1 overrides

  -- Matrix Tree (5×7 forced matrix)
  matrix_parent_id UUID REFERENCES distributors(id),  -- ✅ Use for L2-L5 overrides
  matrix_position INTEGER CHECK (matrix_position BETWEEN 1 AND 5),
  matrix_depth INTEGER NOT NULL DEFAULT 0,

  -- Other fields...
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  status TEXT NOT NULL
);

-- Index for enrollment tree queries
CREATE INDEX idx_distributors_sponsor ON distributors(sponsor_id);

-- Index for matrix tree queries
CREATE INDEX idx_distributors_matrix_parent ON distributors(matrix_parent_id);
```

### Key Points

- **sponsor_id** - Foreign key to enrollment sponsor (enrollment tree)
- **matrix_parent_id** - Foreign key to matrix parent (matrix tree)
- **matrix_position** - Position under matrix parent (1-5)
- **matrix_depth** - Depth in matrix tree (0 = root, 1-7 = levels)

**NEVER use members.enroller_id for tech ladder queries!** Use distributors.sponsor_id instead.

---

## Testing Your Code

### Pre-Commit Hook

The `.husky/check-source-of-truth.js` hook checks for common mistakes:

```bash
git commit
```

If you see:
```
❌ SOURCE OF TRUTH VIOLATION DETECTED
🚨 FORBIDDEN: Using matrix_parent_id in queries
```

You're likely using matrix tree when you should use enrollment tree.

### Allowed Exceptions

These files are ALLOWED to use `matrix_parent_id`:
- `src/lib/matrix/placement-algorithm.ts`
- `src/lib/genealogy/tree-utils.ts`
- `src/app/api/admin/matrix/tree/route.ts`
- `src/app/dashboard/matrix/[id]/page.tsx`

All other files should carefully review why they need matrix tree access.

### Unit Testing

Create tests for dual-tree logic:

```typescript
describe('Dual-Tree System', () => {
  test('enrollment children != matrix children when spillover exists', async () => {
    // John enrolls Mary and Steve
    // Mary enrolls Tom
    // But Tom gets placed under John in matrix (spillover)

    const enrollmentChildren = await getEnrollmentChildren(johnId);
    expect(enrollmentChildren).toHaveLength(2);  // Mary, Steve

    const matrixChildren = await getMatrixChildren(johnId);
    expect(matrixChildren).toHaveLength(3);  // Mary, Steve, Tom (spillover)
  });

  test('L1 override goes to enrollment sponsor', async () => {
    // Mary enrolled Tom
    // Tom placed under John in matrix (spillover)
    // Tom makes a sale

    const l1Upline = await getEnrollmentSponsor(tomId);
    expect(l1Upline.id).toBe(maryId);  // Mary gets L1, not John!
  });
});
```

---

## FAQs

### Q: Can one person be both enrollment sponsor AND matrix parent?

**A:** Yes! In most cases, when you enroll someone, they're also placed in your matrix (if you have open positions). So `sponsor_id` and `matrix_parent_id` point to the same person.

**However**, when your 5 matrix positions are full, new enrollees are placed under your downline (spillover), so the two IDs will be different.

### Q: Why can't I just use one tree for everything?

**A:** The enrollment tree doesn't enforce the 5×7 matrix structure. The matrix tree includes spillover which shouldn't count as "personal recruits". Each tree serves a specific business purpose.

### Q: What happens when someone's matrix parent becomes inactive?

**A:** Nothing changes! `matrix_parent_id` remains the same. However, if the matrix parent doesn't qualify for overrides (<50 BV), compression applies and the override passes to the next qualified upline.

### Q: How do I know which tree to use?

**A:** Ask yourself:
- **Am I calculating L1 overrides?** → Enrollment tree
- **Am I counting personal recruits?** → Enrollment tree
- **Am I calculating L2-L5 overrides?** → Matrix tree
- **Am I showing matrix visualization?** → Matrix tree

### Q: Can I change someone's sponsor_id or matrix_parent_id after creation?

**A:** **NO!** Both are set once at creation and never change. This ensures integrity of commission calculations.

### Q: What if I need to query both trees?

**A:** Make separate queries! Never try to mix trees in one query:

```typescript
// ✅ CORRECT - Separate queries
const enrollees = await getEnrollmentChildren(id);
const matrixChildren = await getMatrixChildren(id);

// ❌ WRONG - Don't mix in one query
const { data } = await supabase
  .from('distributors')
  .select('*')
  .eq('sponsor_id', id)
  .eq('matrix_parent_id', id);  // CONFLICTING CONDITIONS!
```

---

## Summary

**The Golden Rules:**

1. **L1 Override** → Enrollment Tree (`sponsor_id`)
2. **L2-L5 Overrides** → Matrix Tree (`matrix_parent_id`)
3. **Personal Recruits** → Enrollment Tree (`sponsor_id`)
4. **Matrix Visualization** → Matrix Tree (`matrix_parent_id`)
5. **Never Mix Trees!**

**When in Doubt:**
1. Check the code examples in this document
2. Use functions from `tree-utils.ts` library
3. Read the JSDoc comments in the function definitions
4. Ask yourself: "Am I working with enrollment or matrix?"

---

**Questions?** See `src/lib/genealogy/tree-utils.ts` for complete implementation details.

**Related Documentation:**
- `APEX_COMP_ENGINE_SPEC_FINAL.md` - Compensation plan specification
- `SINGLE-SOURCE-OF-TRUTH.md` - Database query rules
- `src/db/schema.ts` - Database type definitions
