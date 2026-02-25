# Level 0A Migration Instructions

## Overview
This migration adds **"Apex Affinity Team"** as Level 0A - a corporate override position above Apex Vision.

## New Matrix Structure

```
Level 0A (Depth -1): Apex Affinity Team ← NEW!
   │
   └─ ONLY ONE CHILD
      │
Level 0 (Depth 0): Apex Vision
   / | | | \
Level 1: First 5 reps (unchanged)
   ...
```

## What Level 0A Does

- **Gets ALL commissions** from entire organization
- **Gets ALL overrides** on all levels
- **Always bonus qualified** (like a master account)
- **Only has 1 child** - Apex Vision
- **Can be viewed from admin dashboard** (prominent blue banner at top)

## Migration Steps

### STEP 1: Update Database Constraint

**You must run this SQL in Supabase SQL Editor FIRST:**

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy and paste this SQL:

```sql
-- Drop existing constraint
ALTER TABLE distributors
DROP CONSTRAINT IF EXISTS distributors_matrix_depth_check;

-- Add new constraint allowing -1 to 20
ALTER TABLE distributors
ADD CONSTRAINT distributors_matrix_depth_check
CHECK (matrix_depth >= -1 AND matrix_depth <= 20);
```

3. Click "Run" to execute

### STEP 2: Run Migration Script

After the SQL is executed, run this command:

```bash
npx tsx scripts/add-level-0a.ts
```

**Expected Output:**
```
🚀 Starting Level 0A Migration...

📍 Step 1: Finding Apex Vision...
✅ Found Apex Vision: Apex Vision (ID: xxx)

📍 Step 2: Checking if Level 0A already exists...
📍 Step 3: Creating Apex Affinity Team (Level 0A)...
✅ Created Apex Affinity Team (ID: xxx)

📍 Step 4: Updating Apex Vision to be child of Apex Affinity Team...
✅ Updated Apex Vision

📍 Step 5: Verifying new structure...
✅ Structure verified:

📊 New Matrix Structure:
─────────────────────────────────────────
Level 0A (Depth -1): Apex Affinity Team
   └─ Parent: None (Root)
   └─ Children: 1 (Apex Vision)

Level 0 (Depth 0): Apex Vision
   └─ Parent: Apex Affinity Team
   └─ Children: 5 (Level 1 reps)
─────────────────────────────────────────

✅ Migration Complete!
```

### STEP 3: Verify in Admin Dashboard

1. Go to `/admin` in your browser
2. You should see a **blue banner at the top** saying:
   - "🏆 Apex Affinity Team"
   - "Level 0A - Corporate Override & Bonus Position"
3. Click the banner to view the organization

## What Changed

### Database
- New distributor created: "Apex Affinity Team"
  - ID: (auto-generated)
  - matrix_depth: -1
  - rep_number: 0
  - email: team@theapexway.net
  - slug: apex-affinity-team

### Apex Vision Updated
- matrix_parent_id: Now points to Apex Affinity Team
- sponsor_id: Now points to Apex Affinity Team
- matrix_position: 1 (first and only child of Level 0A)
- matrix_depth: 0 (unchanged)

### All Other Reps
- **NO CHANGES** - Everyone stays exactly where they are

## Rollback (if needed)

If you need to rollback this migration:

```bash
# Update Apex Vision to be root again
UPDATE distributors
SET matrix_parent_id = NULL,
    sponsor_id = NULL,
    matrix_position = 1
WHERE slug = 'apex-vision';

# Delete Apex Affinity Team
DELETE FROM distributors
WHERE matrix_depth = -1;
```

## Support

If you encounter any issues:
1. Check that the SQL constraint was updated successfully
2. Verify Apex Vision exists before running migration
3. Check the console output for specific error messages
