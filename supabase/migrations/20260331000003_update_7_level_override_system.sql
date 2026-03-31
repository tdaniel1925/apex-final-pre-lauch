-- =============================================
-- 7-LEVEL OVERRIDE SYSTEM MIGRATION
-- =============================================
-- Migrates from 5-level to 7-level override system
-- Removes Crown and Elite ranks, adds Ruby and Diamond Ambassador
-- Adds breakage pool tracking
-- =============================================

-- Step 1: Add breakage_pool_cents column to track unpaid overrides
ALTER TABLE commission_runs
ADD COLUMN IF NOT EXISTS breakage_pool_cents INTEGER DEFAULT 0;

COMMENT ON COLUMN commission_runs.breakage_pool_cents IS 'Total breakage (unpaid override pool) in cents that goes 100% to Apex';

-- Step 2: Update tech_rank enum to add Ruby and Diamond Ambassador, remove Crown and Elite
-- NOTE: PostgreSQL doesn't allow direct enum modification, so we need to:
-- 1. Create new enum type
-- 2. Migrate data
-- 3. Drop old enum
-- 4. Rename new enum

-- Create new enum with updated ranks
CREATE TYPE tech_rank_new AS ENUM (
  'starter',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'ruby',
  'diamond_ambassador'
);

-- Update members table to use new enum
-- First, add temporary column with new enum type
ALTER TABLE members
ADD COLUMN tech_rank_new tech_rank_new;

-- Migrate existing data
UPDATE members
SET tech_rank_new = CASE
  WHEN tech_rank = 'starter' THEN 'starter'::tech_rank_new
  WHEN tech_rank = 'bronze' THEN 'bronze'::tech_rank_new
  WHEN tech_rank = 'silver' THEN 'silver'::tech_rank_new
  WHEN tech_rank = 'gold' THEN 'gold'::tech_rank_new
  WHEN tech_rank = 'platinum' THEN 'platinum'::tech_rank_new
  WHEN tech_rank = 'ruby' THEN 'ruby'::tech_rank_new
  WHEN tech_rank = 'diamond' THEN 'diamond_ambassador'::tech_rank_new
  WHEN tech_rank = 'crown' THEN 'diamond_ambassador'::tech_rank_new -- Promote Crown to Diamond Ambassador
  WHEN tech_rank = 'elite' THEN 'diamond_ambassador'::tech_rank_new -- Promote Elite to Diamond Ambassador
  ELSE 'starter'::tech_rank_new
END;

-- Same for paying_rank
ALTER TABLE members
ADD COLUMN paying_rank_new tech_rank_new;

UPDATE members
SET paying_rank_new = CASE
  WHEN paying_rank = 'starter' THEN 'starter'::tech_rank_new
  WHEN paying_rank = 'bronze' THEN 'bronze'::tech_rank_new
  WHEN paying_rank = 'silver' THEN 'silver'::tech_rank_new
  WHEN paying_rank = 'gold' THEN 'gold'::tech_rank_new
  WHEN paying_rank = 'platinum' THEN 'platinum'::tech_rank_new
  WHEN paying_rank = 'ruby' THEN 'ruby'::tech_rank_new
  WHEN paying_rank = 'diamond' THEN 'diamond_ambassador'::tech_rank_new
  WHEN paying_rank = 'crown' THEN 'diamond_ambassador'::tech_rank_new
  WHEN paying_rank = 'elite' THEN 'diamond_ambassador'::tech_rank_new
  ELSE 'starter'::tech_rank_new
END;

-- Same for highest_tech_rank
ALTER TABLE members
ADD COLUMN highest_tech_rank_new tech_rank_new;

UPDATE members
SET highest_tech_rank_new = CASE
  WHEN highest_tech_rank = 'starter' THEN 'starter'::tech_rank_new
  WHEN highest_tech_rank = 'bronze' THEN 'bronze'::tech_rank_new
  WHEN highest_tech_rank = 'silver' THEN 'silver'::tech_rank_new
  WHEN highest_tech_rank = 'gold' THEN 'gold'::tech_rank_new
  WHEN highest_tech_rank = 'platinum' THEN 'platinum'::tech_rank_new
  WHEN highest_tech_rank = 'ruby' THEN 'ruby'::tech_rank_new
  WHEN highest_tech_rank = 'diamond' THEN 'diamond_ambassador'::tech_rank_new
  WHEN highest_tech_rank = 'crown' THEN 'diamond_ambassador'::tech_rank_new
  WHEN highest_tech_rank = 'elite' THEN 'diamond_ambassador'::tech_rank_new
  ELSE 'starter'::tech_rank_new
END;

-- Drop old columns (this will drop the old enum dependency)
ALTER TABLE members DROP COLUMN tech_rank;
ALTER TABLE members DROP COLUMN paying_rank;
ALTER TABLE members DROP COLUMN highest_tech_rank;

-- Rename new columns to original names
ALTER TABLE members RENAME COLUMN tech_rank_new TO tech_rank;
ALTER TABLE members RENAME COLUMN paying_rank_new TO paying_rank;
ALTER TABLE members RENAME COLUMN highest_tech_rank_new TO highest_tech_rank;

-- Drop old enum type (if it exists and has no more dependencies)
DROP TYPE IF EXISTS tech_rank_old CASCADE;

-- Rename new enum to tech_rank
ALTER TYPE tech_rank_new RENAME TO tech_rank;

-- Set NOT NULL constraints back
ALTER TABLE members ALTER COLUMN tech_rank SET NOT NULL;
ALTER TABLE members ALTER COLUMN paying_rank SET NOT NULL;
ALTER TABLE members ALTER COLUMN highest_tech_rank SET NOT NULL;

-- Set defaults
ALTER TABLE members ALTER COLUMN tech_rank SET DEFAULT 'starter'::tech_rank;
ALTER TABLE members ALTER COLUMN paying_rank SET DEFAULT 'starter'::tech_rank;
ALTER TABLE members ALTER COLUMN highest_tech_rank SET DEFAULT 'starter'::tech_rank;

-- Step 3: Add comment explaining the new system
COMMENT ON TYPE tech_rank IS '7-level tech ladder ranks: Starter → Bronze → Silver → Gold → Platinum → Ruby → Diamond Ambassador';

-- Step 4: Log migration
INSERT INTO migration_log (migration_name, description, applied_at)
VALUES (
  '20260331000003_update_7_level_override_system',
  'Migrated to 7-level override system: Added Ruby and Diamond Ambassador ranks, removed Crown and Elite, added breakage pool tracking',
  NOW()
);
