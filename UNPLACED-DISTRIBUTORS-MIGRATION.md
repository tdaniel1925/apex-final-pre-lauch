# Unplaced Distributors Migration Plan

**Date**: March 22, 2026
**Status**: FINAL - Ready for Implementation
**Decision**: Automatic Placement Using Spillover Algorithm (Backfill by Enrollment Date)

---

## 📋 CURRENT SITUATION

**Problem**: 22 distributors exist in the system with NO matrix placement

**Database State**:
```sql
SELECT COUNT(*)
FROM distributors
WHERE matrix_parent_id IS NULL;

-- Result: 22 unplaced distributors
```

**Impact**:
- These distributors have `enroller_id` (they're in the enrollment tree)
- But they have NO `matrix_parent_id`, `matrix_position`, or `matrix_depth`
- They can't appear in their sponsor's matrix visualization
- Their sponsors aren't earning matrix depth overrides on them (only enrollment override)

---

## 🎯 SOLUTION: Automatic Backfill Migration

**Approach**: Run a one-time migration script that:
1. Finds all unplaced distributors
2. Sorts them by enrollment date (oldest first)
3. For each distributor, finds their sponsor's next available matrix position
4. Places them using the same spillover algorithm as new enrollments
5. Updates their `matrix_parent_id`, `matrix_position`, and `matrix_depth`

**Goal**: All 22 distributors placed in their proper matrix positions within minutes

---

## 🔢 MIGRATION ALGORITHM

### Step-by-Step Process

```python
def migrate_unplaced_distributors():
    """
    One-time migration to place all unplaced distributors.
    """
    # Step 1: Get all unplaced distributors (oldest first)
    unplaced = db.query("""
        SELECT member_id, enroller_id, enrollment_date, full_name
        FROM members
        WHERE matrix_parent_id IS NULL
        ORDER BY enrollment_date ASC
    """)

    print(f"Found {len(unplaced)} unplaced distributors")

    placed_count = 0
    failed_placements = []

    # Step 2: Place each distributor using spillover algorithm
    for distributor in unplaced:
        try:
            # Find next available position under their sponsor
            sponsor_id = distributor.enroller_id
            placement = find_next_available_position(sponsor_id)

            if placement:
                # Update distributor with matrix placement
                db.execute("""
                    UPDATE members
                    SET
                        matrix_parent_id = ?,
                        matrix_position = ?,
                        matrix_depth = ?,
                        matrix_placement_date = NOW()
                    WHERE member_id = ?
                """, (
                    placement['parent_id'],
                    placement['position'],
                    placement['depth'],
                    distributor.member_id
                ))

                placed_count += 1

                print(f"✅ Placed {distributor.full_name} "
                      f"under {placement['parent_id']} "
                      f"at Position {placement['position']}, "
                      f"Depth {placement['depth']}")

            else:
                # Sponsor's matrix is full (rare)
                failed_placements.append({
                    'member_id': distributor.member_id,
                    'name': distributor.full_name,
                    'reason': 'Sponsor matrix full (19,531 positions)'
                })

                print(f"⚠️ Could not place {distributor.full_name} - "
                      f"sponsor's matrix is full")

        except Exception as e:
            failed_placements.append({
                'member_id': distributor.member_id,
                'name': distributor.full_name,
                'reason': str(e)
            })
            print(f"❌ Error placing {distributor.full_name}: {e}")

    # Step 3: Report results
    print(f"\n{'='*60}")
    print(f"Migration Complete!")
    print(f"{'='*60}")
    print(f"✅ Successfully placed: {placed_count}/{len(unplaced)}")

    if failed_placements:
        print(f"❌ Failed placements: {len(failed_placements)}")
        for failed in failed_placements:
            print(f"  - {failed['name']}: {failed['reason']}")

    return {
        'total': len(unplaced),
        'placed': placed_count,
        'failed': failed_placements
    }
```

---

## 📊 EXAMPLE MIGRATION SCENARIO

### Before Migration

**Unplaced Distributors (22 total):**
```
Member ID | Name           | Enroller      | Enrolled On | Matrix Status
----------|----------------|---------------|-------------|---------------
abc-123   | John Smith     | sponsor-001   | 2025-11-15  | UNPLACED ❌
def-456   | Sarah Jones    | sponsor-001   | 2025-11-20  | UNPLACED ❌
ghi-789   | Mike Wilson    | sponsor-002   | 2025-12-01  | UNPLACED ❌
... (19 more)
```

**Sponsor-001's Current Matrix:**
```
Level 1: [Member-A] [Member-B] [Member-C] [Member-D] [Member-E]  (5/5 FULL)
Level 2: [Member-F] [Member-G] [ ] [ ] [ ]  (2/25, 3 positions available)
```

---

### After Migration

**Step 1: Place John Smith (oldest unplaced)**
```
Sponsor: sponsor-001
Next available position: Level 2, Position 3 (under Member-A)

UPDATE:
- matrix_parent_id = Member-A
- matrix_position = 3
- matrix_depth = 2
- matrix_placement_date = 2026-03-22
```

**Step 2: Place Sarah Jones (second oldest)**
```
Sponsor: sponsor-001
Next available position: Level 2, Position 4 (under Member-A)

UPDATE:
- matrix_parent_id = Member-A
- matrix_position = 4
- matrix_depth = 2
- matrix_placement_date = 2026-03-22
```

**Result:**
```
Level 1: [Member-A] [Member-B] [Member-C] [Member-D] [Member-E]
Level 2: [Member-F] [Member-G] [John] [Sarah] [ ]  (4/25, now only 1 open)
```

---

## 🛠️ MIGRATION SCRIPT (TypeScript/Node.js)

### Create Migration Script

**File**: `scripts/migrate-unplaced-distributors.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for migration
);

interface UnplacedDistributor {
  member_id: string;
  enroller_id: string;
  enrollment_date: string;
  full_name: string;
}

interface MatrixPlacement {
  parent_id: string;
  position: number;
  depth: number;
}

async function findNextAvailablePosition(
  sponsorId: string
): Promise<MatrixPlacement | null> {
  // Use the breadth-first spillover algorithm
  const queue: Array<{ id: string; depth: number }> = [
    { id: sponsorId, depth: 0 }
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Get current member's matrix children
    const { data: children } = await supabase
      .from('members')
      .select('member_id, matrix_position')
      .eq('matrix_parent_id', current.id)
      .order('matrix_position', { ascending: true });

    // Check if there's an open position (< 5 children)
    if (!children || children.length < 5) {
      const nextPosition = children ? children.length + 1 : 1;
      return {
        parent_id: current.id,
        position: nextPosition,
        depth: current.depth + 1
      };
    }

    // All 5 positions filled, add children to queue
    if (current.depth + 1 < 7) {
      for (const child of children) {
        queue.push({ id: child.member_id, depth: current.depth + 1 });
      }
    }
  }

  return null; // Matrix completely full (19,531 positions)
}

async function migrateUnplacedDistributors() {
  console.log('🚀 Starting unplaced distributors migration...\n');

  // Step 1: Get all unplaced distributors
  const { data: unplaced, error } = await supabase
    .from('members')
    .select('member_id, enroller_id, enrollment_date, full_name')
    .is('matrix_parent_id', null)
    .order('enrollment_date', { ascending: true });

  if (error) {
    console.error('❌ Error fetching unplaced distributors:', error);
    return;
  }

  if (!unplaced || unplaced.length === 0) {
    console.log('✅ No unplaced distributors found!');
    return;
  }

  console.log(`Found ${unplaced.length} unplaced distributors\n`);

  let placedCount = 0;
  const failedPlacements: Array<{
    member_id: string;
    name: string;
    reason: string;
  }> = [];

  // Step 2: Place each distributor
  for (const distributor of unplaced as UnplacedDistributor[]) {
    try {
      console.log(`Processing: ${distributor.full_name}...`);

      const placement = await findNextAvailablePosition(
        distributor.enroller_id
      );

      if (placement) {
        // Update distributor with matrix placement
        const { error: updateError } = await supabase
          .from('members')
          .update({
            matrix_parent_id: placement.parent_id,
            matrix_position: placement.position,
            matrix_depth: placement.depth,
            matrix_placement_date: new Date().toISOString()
          })
          .eq('member_id', distributor.member_id);

        if (updateError) {
          throw updateError;
        }

        placedCount++;
        console.log(
          `✅ Placed under ${placement.parent_id}, ` +
          `Position ${placement.position}, Depth ${placement.depth}\n`
        );
      } else {
        failedPlacements.push({
          member_id: distributor.member_id,
          name: distributor.full_name,
          reason: 'Sponsor matrix full (19,531 positions)'
        });
        console.log(`⚠️ Could not place - sponsor matrix full\n`);
      }
    } catch (err) {
      failedPlacements.push({
        member_id: distributor.member_id,
        name: distributor.full_name,
        reason: err instanceof Error ? err.message : 'Unknown error'
      });
      console.log(`❌ Error: ${err}\n`);
    }
  }

  // Step 3: Report results
  console.log('='.repeat(60));
  console.log('Migration Complete!');
  console.log('='.repeat(60));
  console.log(`✅ Successfully placed: ${placedCount}/${unplaced.length}`);

  if (failedPlacements.length > 0) {
    console.log(`❌ Failed placements: ${failedPlacements.length}`);
    failedPlacements.forEach(failed => {
      console.log(`  - ${failed.name}: ${failed.reason}`);
    });
  }
}

// Run migration
migrateUnplacedDistributors()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Migration script failed:', err);
    process.exit(1);
  });
```

---

## ▶️ RUNNING THE MIGRATION

### Prerequisites

1. **Backup Database** (CRITICAL!)
```bash
# Backup members table before migration
pg_dump -h YOUR_SUPABASE_HOST -U postgres -t members > members_backup.sql
```

2. **Set Environment Variables**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. **Test on Staging First**
```bash
# Run on staging environment first
NODE_ENV=staging npm run migrate:unplaced
```

---

### Execution Steps

```bash
# Step 1: Install dependencies (if needed)
npm install

# Step 2: Run migration script
npx tsx scripts/migrate-unplaced-distributors.ts

# Step 3: Verify results
psql -h YOUR_HOST -U postgres -d YOUR_DB -c "
  SELECT COUNT(*) AS unplaced_count
  FROM members
  WHERE matrix_parent_id IS NULL;
"
# Should return: 0 (or only failed placements)
```

---

## ✅ POST-MIGRATION VERIFICATION

### Verification Queries

**Check 1: All distributors placed?**
```sql
SELECT COUNT(*) AS unplaced_count
FROM members
WHERE matrix_parent_id IS NULL;

-- Expected: 0 (all placed)
```

**Check 2: Valid matrix positions?**
```sql
SELECT
  COUNT(*) AS invalid_positions
FROM members
WHERE
  matrix_position NOT BETWEEN 1 AND 5
  OR matrix_depth NOT BETWEEN 0 AND 7;

-- Expected: 0 (all valid)
```

**Check 3: No position conflicts?**
```sql
SELECT
  matrix_parent_id,
  matrix_position,
  COUNT(*) AS duplicate_count
FROM members
WHERE matrix_parent_id IS NOT NULL
GROUP BY matrix_parent_id, matrix_position
HAVING COUNT(*) > 1;

-- Expected: 0 rows (no duplicates)
```

**Check 4: Sample placement verification**
```sql
SELECT
  m.full_name,
  m.enrollment_date,
  m.enroller_id,
  m.matrix_parent_id,
  m.matrix_position,
  m.matrix_depth,
  parent.full_name AS parent_name
FROM members m
LEFT JOIN members parent ON m.matrix_parent_id = parent.member_id
WHERE m.member_id IN (
  SELECT member_id
  FROM members
  WHERE matrix_placement_date > NOW() - INTERVAL '1 hour'
)
ORDER BY m.enrollment_date;

-- Verify placements look correct
```

---

## 🚨 ROLLBACK PLAN

If migration fails or produces incorrect results:

```sql
-- Rollback: Clear all placements added during migration
UPDATE members
SET
  matrix_parent_id = NULL,
  matrix_position = NULL,
  matrix_depth = NULL,
  matrix_placement_date = NULL
WHERE matrix_placement_date > '2026-03-22 00:00:00';

-- Or restore from backup
psql -h YOUR_HOST -U postgres -d YOUR_DB < members_backup.sql
```

---

## 📋 MIGRATION CHECKLIST

**Pre-Migration:**
- [ ] Backup database (full members table dump)
- [ ] Test script on staging environment
- [ ] Verify service role key has correct permissions
- [ ] Notify team of planned migration
- [ ] Schedule during low-traffic window

**During Migration:**
- [ ] Run migration script
- [ ] Monitor console output for errors
- [ ] Record any failed placements

**Post-Migration:**
- [ ] Run all verification queries
- [ ] Check sample member matrix views in UI
- [ ] Verify commission calculations still work
- [ ] Confirm no duplicate positions
- [ ] Document any failed placements and resolve manually

---

## 💡 KEY RULES SUMMARY

1. ✅ **Automatic placement**: Uses same spillover algorithm as new enrollments
2. ✅ **Enrollment order**: Places oldest unplaced members first (fair)
3. ✅ **Sponsor benefit**: Distributors placed in sponsor's matrix (not random)
4. ✅ **One-time migration**: Run once, then all future enrollments auto-place
5. ✅ **Rollback safe**: Can restore from backup if needed
6. ✅ **Verification**: Multiple checks to ensure correctness

---

**END OF UNPLACED DISTRIBUTORS MIGRATION PLAN**

*Next Topic: Final Summary & Implementation Order*
