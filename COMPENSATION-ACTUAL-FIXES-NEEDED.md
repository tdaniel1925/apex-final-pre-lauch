# Compensation System - Actual Fixes Needed

**Date:** March 22, 2026
**Priority:** CRITICAL
**Status:** Requires immediate attention before ANY commission runs

---

## The REAL Problem

The compensation system has the **RIGHT LOGIC** but is querying the **WRONG TABLES**.

### Issue 1: Members Table Doesn't Have Matrix Fields

**File:** `src/lib/compensation/override-calculator.ts`
**Lines:** 25-35, 162

**Current Code (WRONG):**
```typescript
export interface Member {
  member_id: string;
  enroller_id: string | null;
  matrix_parent_id: string | null;  // ← DOESN'T EXIST IN members TABLE!
  matrix_depth: number;              // ← DOESN'T EXIST IN members TABLE!
  // ...
}

// Line 162:
let currentMemberId = sellerMember.matrix_parent_id;  // ← WRONG TABLE!
```

**members table has:**
- `member_id` ✅
- `enroller_id` ✅ (insurance enrollment)
- NO `matrix_parent_id` ❌
- NO `matrix_depth` ❌

**distributors table has:**
- `id` ✅
- `sponsor_id` ✅ (enrollment tree)
- `matrix_parent_id` ✅ (placement matrix)
- `matrix_depth` ✅ (placement matrix)

---

## The Fix Strategy

### Option 1: JOIN Both Tables (RECOMMENDED)

Query `distributors` table and JOIN to `members` for BV/rank data.

```typescript
export interface CompensationMember {
  // From distributors table
  distributor_id: string;
  sponsor_id: string | null;        // ← Enrollment tree
  matrix_parent_id: string | null;  // ← Matrix tree
  matrix_depth: number;
  matrix_position: number | null;

  // From members table (via JOIN)
  member_id: string;
  tech_rank: TechRank;
  personal_credits_monthly: number;
  override_qualified: boolean;
}
```

**Database Query:**
```typescript
const { data: sellerData } = await supabase
  .from('distributors')
  .select(`
    id,
    sponsor_id,
    matrix_parent_id,
    matrix_depth,
    matrix_position,
    member:members!members_distributor_id_fkey (
      member_id,
      tech_rank,
      personal_credits_monthly,
      override_qualified
    )
  `)
  .eq('id', distributorId)
  .single();
```

---

### Option 2: Add Matrix Fields to Members Table (NOT RECOMMENDED)

This would duplicate data and cause sync issues.

❌ **Don't do this!**

---

## Specific Fixes Required

### File 1: `src/lib/compensation/override-calculator.ts`

#### Fix 1a: Update Member Interface

**Lines 25-35**

**BEFORE:**
```typescript
export interface Member {
  member_id: string;
  full_name: string;
  email: string;
  tech_rank: TechRank;
  enroller_id: string | null;       // ← members table
  matrix_parent_id: string | null;  // ← WRONG TABLE!
  matrix_depth: number;              // ← WRONG TABLE!
  personal_bv_monthly: number;
  override_qualified: boolean;
}
```

**AFTER:**
```typescript
export interface CompensationMember {
  // Distributor info (from distributors table)
  distributor_id: string;
  sponsor_id: string | null;        // ← Enrollment tree (distributors.sponsor_id)
  matrix_parent_id: string | null;  // ← Matrix tree (distributors.matrix_parent_id)
  matrix_depth: number;              // ← distributors.matrix_depth

  // Member info (from members table)
  member_id: string;
  full_name: string;
  email: string;
  tech_rank: TechRank;
  personal_credits_monthly: number;  // ← members.personal_credits_monthly
  override_qualified: boolean;        // ← members.override_qualified
}
```

#### Fix 1b: Update calculateOverridesForSale Function

**Lines 116-156: Enroller Override (CORRECT - Keep As Is)**

This part is already correct! It uses `enroller_id` from the members table.

```typescript
// STEP 1: ENROLLER OVERRIDE (30%) - Already Correct!
if (sellerMember.sponsor_id) {  // ← Change from enroller_id to sponsor_id
  const { data: sponsor } = await supabase
    .from('distributors')  // ← Change from 'members'
    .select(`
      id,
      member:members!members_distributor_id_fkey (
        member_id,
        full_name,
        tech_rank,
        personal_credits_monthly,
        override_qualified
      )
    `)
    .eq('id', sellerMember.sponsor_id)  // ← distributors.id
    .single();

  const sponsorMember = sponsor?.member?.[0] || sponsor?.member;

  if (sponsor && sponsorMember && isQualifiedForOverrides(sponsorMember.personal_credits_monthly)) {
    payments.push({
      upline_member_id: sponsorMember.member_id,
      upline_member_name: sponsorMember.full_name,
      override_type: 'L1_enroller',
      override_rate: 0.30,
      override_amount: Number((overridePool * 0.30).toFixed(2)),
      bv: sale.bv,
    });

    paidUplineIds.add(sponsorMember.member_id);
  }
}
```

#### Fix 1c: Update Matrix Overrides Loop

**Lines 158-211**

**BEFORE:**
```typescript
// Walk up the matrix tree (matrix_parent_id)
let currentMemberId = sellerMember.matrix_parent_id;  // ← WRONG TABLE!
let level = 1;

while (currentMemberId && level <= 5) {
  const { data: uplineMember, error } = await supabase
    .from('members')  // ← WRONG TABLE!
    .select('*')
    .eq('member_id', currentMemberId)
    .single();

  // ...
}
```

**AFTER:**
```typescript
// Walk up the matrix tree (distributors.matrix_parent_id)
let currentDistributorId = sellerMember.matrix_parent_id;
let level = 1;

while (currentDistributorId && level <= 5) {
  const { data: uplineDistributor, error } = await supabase
    .from('distributors')  // ← CORRECT TABLE!
    .select(`
      id,
      matrix_parent_id,
      member:members!members_distributor_id_fkey (
        member_id,
        full_name,
        tech_rank,
        personal_credits_monthly,
        override_qualified
      )
    `)
    .eq('id', currentDistributorId)
    .single();

  if (error || !uplineDistributor || !uplineDistributor.member) break;

  const uplineMember = Array.isArray(uplineDistributor.member)
    ? uplineDistributor.member[0]
    : uplineDistributor.member;

  // Skip if already paid as enroller (no double-dipping!)
  if (paidUplineIds.has(uplineMember.member_id)) {
    currentDistributorId = uplineDistributor.matrix_parent_id;
    level++;
    continue;
  }

  // Check if qualified for overrides
  if (!isQualifiedForOverrides(uplineMember.personal_credits_monthly)) {
    // COMPRESSION: Skip unqualified upline
    currentDistributorId = uplineDistributor.matrix_parent_id;
    level++;
    continue;
  }

  // Get override rate for this rank at this level
  const schedule = OVERRIDE_SCHEDULES[uplineMember.tech_rank as TechRank];
  const rate = schedule[level] || 0;

  if (rate > 0) {
    const amount = overridePool * rate;

    payments.push({
      upline_member_id: uplineMember.member_id,
      upline_member_name: uplineMember.full_name,
      override_type: `L${level + 1}_matrix`,
      override_rate: rate,
      override_amount: Number(amount.toFixed(2)),
      bv: sale.bv,
    });

    paidUplineIds.add(uplineMember.member_id);
  }

  // Move up the matrix tree
  currentDistributorId = uplineDistributor.matrix_parent_id;
  level++;
}
```

#### Fix 1d: Update getMatrixLevel Function

**Lines 318-347**

**BEFORE:**
```typescript
export async function getMatrixLevel(
  uplineMember: Member,
  downlineMember: Member
): Promise<number | null> {
  const supabase = await createClient();

  let currentMemberId = downlineMember.matrix_parent_id;  // ← WRONG!
  let level = 1;

  while (currentMemberId && level <= 5) {
    if (currentMemberId === uplineMember.member_id) {  // ← WRONG!
      return level;
    }

    const { data: parent, error } = await supabase
      .from('members')  // ← WRONG TABLE!
      .select('matrix_parent_id')
      .eq('member_id', currentMemberId)
      .single();

    // ...
  }
}
```

**AFTER:**
```typescript
export async function getMatrixLevel(
  uplineDistributorId: string,
  downlineDistributorId: string
): Promise<number | null> {
  const supabase = await createClient();

  let currentDistributorId = downlineDistributorId;
  let level = 0;

  while (currentDistributorId && level < 5) {
    // Get current distributor's matrix parent
    const { data: current, error } = await supabase
      .from('distributors')  // ← CORRECT TABLE!
      .select('matrix_parent_id')
      .eq('id', currentDistributorId)
      .single();

    if (error || !current || !current.matrix_parent_id) break;

    level++;

    // Check if this parent is our upline
    if (current.matrix_parent_id === uplineDistributorId) {
      return level;
    }

    currentDistributorId = current.matrix_parent_id;
  }

  return null; // Not in upline
}
```

---

### File 2: `src/lib/compensation/override-resolution.ts`

This file is actually **CORRECT**! It just has a misleading COMMENT on line 190.

**Fix: Update Comment Only**

**Line 190:**

**BEFORE:**
```typescript
/**
 * Calculate overrides for all upline members
 *
 * This traverses the matrix/enroller tree and calculates overrides for each level
 *
 * @param sale - Sale information
 * @param uplineMembers - Upline members ordered from L1 to L5
 * @param enrollerId - Seller's enroller ID
 * @returns Array of override results
 */
```

**AFTER:**
```typescript
/**
 * Calculate overrides for all upline members
 *
 * IMPORTANT: The uplineMembers array should be built by the CALLER:
 * - If member is sponsor: isEnroller = true → L1 rate (30%)
 * - If member is in matrix tree: isEnroller = false → Matrix rate by rank/level
 *
 * This function does NOT traverse trees - it receives pre-built upline array.
 * The CALLER is responsible for walking the correct tree (enrollment vs matrix).
 *
 * @param sale - Sale information
 * @param uplineMembers - Upline members ordered from L1 to L5 (built by caller)
 * @param enrollerId - Seller's sponsor member ID
 * @returns Array of override results
 */
```

---

## Testing Requirements

### Test 1: Enrollment Override (L1)

```typescript
// Given: Donna enrolled Charles
// When: Charles makes a $100 sale (40 BV)
// Then: Donna gets 30% of override pool = 40 * 0.40 * 0.30 = $4.80

const sale = { bv: 40, price: 100 };
const charles = { sponsor_id: donnaDistributorId, matrix_parent_id: apexVisionId };

const result = await calculateOverridesForSale(sale, charles);
expect(result.payments).toContainEqual({
  upline_member_id: donnaMemberId,
  override_type: 'L1_enroller',
  override_amount: 4.80,
});
```

### Test 2: Matrix Override (L2-L5)

```typescript
// Given: Charles is in Apex Vision's matrix (but not enrolled by them)
// When: Charles makes a $100 sale
// Then: Apex Vision gets L2 matrix rate (25% if qualified at that rank)

const sale = { bv: 40, price: 100 };
const charles = { sponsor_id: donnaDistributorId, matrix_parent_id: apexVisionId };

const result = await calculateOverridesForSale(sale, charles);
expect(result.payments).toContainEqual({
  upline_member_id: apexVisionMemberId,
  override_type: 'L2_matrix',  // Because Apex is L2 in matrix (not sponsor)
  override_amount: 4.00,  // 40 * 0.40 * 0.25
});
```

### Test 3: No Double-Dipping

```typescript
// Given: Donna enrolled Charles AND Charles is in Donna's matrix
// When: Charles makes a sale
// Then: Donna gets L1 enroller (30%) ONLY, not matrix override

const result = await calculateOverridesForSale(sale, charles);
const donnaPayments = result.payments.filter(p => p.upline_member_id === donnaMemberId);

expect(donnaPayments.length).toBe(1);
expect(donnaPayments[0].override_type).toBe('L1_enroller');
```

---

## Migration Checklist

- [ ] Update `CompensationMember` interface
- [ ] Fix `calculateOverridesForSale` to query distributors table
- [ ] Update enrollment override section to use `sponsor_id`
- [ ] Fix matrix override loop to walk `distributors.matrix_parent_id`
- [ ] Update `getMatrixLevel` to use distributor IDs
- [ ] Add integration tests for all 3 scenarios
- [ ] Run parallel calculations (old vs new) on test data
- [ ] Verify results match expected behavior
- [ ] **DO NOT DEPLOY until tests pass**

---

## Summary

**The compensation logic is CORRECT.**

**The table queries are WRONG.**

The system needs to:
1. Use `distributors.sponsor_id` for L1 enrollment override
2. Use `distributors.matrix_parent_id` for L2-L5 matrix overrides
3. JOIN to `members` table for BV, rank, and qualification data

This is a **table relationship fix**, not a logic fix.

---

**Last Updated:** March 22, 2026
**Status:** Ready for implementation
**Est. Time:** 2-4 hours (includes testing)
