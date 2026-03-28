# Root Cause Analysis: Charles Potter Matrix Display Issue

**Date:** March 19, 2026  
**Status:** Root cause identified  
**Issue:** Charles Potter cannot see Brian Rawlston's downline in matrix view

---

## Key Finding

**Brian Rawlston has NO children in the DISTRIBUTORS matrix table.**

Query result:
```
SELECT COUNT(*) FROM distributors 
WHERE matrix_parent_id = '2cc55161-5519-41e1-975d-ea74a5909050'
-- Returns: 0 (EMPTY)
```

---

## Database Facts

### Charles Potter (Distributor)
```
ID:                712a4dbf-7397-4fe6-8fcf-8a9a51172858
Email:             fyifromcharles@gmail.com
Matrix Parent:     2a4e222e-8d30-4bd4-8bdd-b40247a4702a
Position:          1
Depth:             4
```

### Brian Rawlston (Distributor)
```
ID:                2cc55161-5519-41e1-975d-ea74a5909050
Email:             bclaybornr@gmail.com
Matrix Parent:     712a4dbf-7397-4fe6-8fcf-8a9a51172858 (Charles) ✓
Position:          1
Depth:             5
Matrix Children:   0 (EMPTY) ← PROBLEM
```

### MEMBERS Table Data
Brian DOES have relationships in MEMBERS table:
- Brian has enroller_id = Charles's member_id
- But MEMBERS data is NOT used by the matrix API

---

## Root Cause

### The Problem
1. Matrix children API queries DISTRIBUTORS table
2. It searches for: `WHERE matrix_parent_id = Brian's distributor ID`
3. Returns: **0 records** - Brian has no children

### Why
**There are people in MEMBERS table enrolled under Brian, but NOT linked in DISTRIBUTORS matrix**

Two separate systems:
- MEMBERS table: Uses `enroller_id` for relationships
- DISTRIBUTORS table: Uses `matrix_parent_id` for matrix visualization

Data is in MEMBERS but not synced to DISTRIBUTORS matrix.

---

## Affected API Endpoint

**File:** `src/app/api/admin/distributors/[id]/matrix-children/route.ts`

```typescript
// Line 35-40
const { data: children } = await serviceClient
  .from('distributors')
  .select('*')
  .eq('matrix_parent_id', id)  // Queries only DISTRIBUTORS
  .neq('status', 'deleted')
  .order('matrix_position', { ascending: true });

// Result for Brian: Empty array []
```

---

## Solution

### Step 1: Verify Data Exists in MEMBERS
```sql
SELECT COUNT(*) FROM members 
WHERE enroller_id = (SELECT member_id FROM members WHERE email ILIKE '%brian%');
```

If > 0: People are enrolled under Brian but not in matrix

### Step 2: Sync to DISTRIBUTORS
```sql
UPDATE distributors
SET matrix_parent_id = '2cc55161-5519-41e1-975d-ea74a5909050'
WHERE distributor_id IN (
  SELECT member_id FROM members 
  WHERE enroller_id = (SELECT member_id FROM members WHERE email ILIKE '%brian%')
);
```

---

## Impact

- Charles can SEE Brian in his matrix (position 1)
- Charles CANNOT drill down into Brian's team
- Commission calculations for Brian's team may be affected
- Data consistency issue between MEMBERS and DISTRIBUTORS

