-- Migration: Add paying_rank column to members table
-- Date: 2026-03-22
-- Purpose: Separate permanent rank (tech_rank) from payment level (paying_rank)
--
-- Business Rule: Rank is permanent (never demotes), but payment level can drop
-- after grace period if member doesn't maintain requirements.

-- Add paying_rank column
ALTER TABLE members
ADD COLUMN paying_rank TEXT DEFAULT 'starter';

-- Add constraint to ensure valid rank values
ALTER TABLE members
ADD CONSTRAINT members_paying_rank_check
  CHECK (paying_rank IN (
    'starter', 'bronze', 'silver', 'gold', 'platinum',
    'ruby', 'diamond', 'crown', 'elite'
  ));

-- Initialize paying_rank = tech_rank for all existing members
UPDATE members
SET paying_rank = tech_rank
WHERE paying_rank IS NULL OR paying_rank = 'starter';

-- Create index for faster queries
CREATE INDEX idx_members_paying_rank ON members(paying_rank);

-- Add comments to clarify the difference
COMMENT ON COLUMN members.tech_rank IS 'Current qualified rank - can drop after grace period if requirements not met, but used for display purposes';
COMMENT ON COLUMN members.paying_rank IS 'Current payment level - determines commission rates. Can drop with grace period if requirements not met';
COMMENT ON COLUMN members.highest_tech_rank IS 'Highest rank ever achieved - NEVER drops (lifetime achievement)';
COMMENT ON COLUMN members.tech_rank_grace_period_start IS 'When grace period started for current rank (NULL if qualified)';

-- Add function to sync paying_rank on rank updates (optional helper)
CREATE OR REPLACE FUNCTION sync_paying_rank_on_rank_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If tech_rank goes UP, paying_rank should also go up
  IF NEW.tech_rank IS DISTINCT FROM OLD.tech_rank THEN
    -- Only update if new rank is higher
    IF (
      SELECT array_position(
        ARRAY['starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'],
        NEW.tech_rank
      )
    ) > (
      SELECT array_position(
        ARRAY['starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'],
        OLD.paying_rank
      )
    ) THEN
      NEW.paying_rank := NEW.tech_rank;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (optional - can be removed if you handle this in app logic)
CREATE TRIGGER sync_paying_rank_trigger
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION sync_paying_rank_on_rank_change();

COMMENT ON FUNCTION sync_paying_rank_on_rank_change() IS 'Auto-syncs paying_rank when tech_rank goes UP (never down)';
