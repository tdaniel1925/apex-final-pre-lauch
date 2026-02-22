-- =============================================
-- ADD current_rank TO distributors
-- Stores the distributor's current rank level
-- =============================================
-- Migration: 20260221000008
-- Created: 2026-02-21
-- Fixes: record "v_distributor" has no field "current_rank"
-- =============================================

-- Add current_rank column to distributors
ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS current_rank TEXT DEFAULT 'affiliate'
    CHECK (current_rank IN (
      'affiliate', 'bronze', 'silver', 'gold',
      'platinum', 'diamond', 'crown_diamond', 'royal_diamond'
    ));

-- Create index for rank queries
CREATE INDEX IF NOT EXISTS idx_distributors_current_rank ON distributors(current_rank);

-- Set default ranks for existing distributors
UPDATE distributors
SET current_rank = 'affiliate'
WHERE current_rank IS NULL;

COMMENT ON COLUMN distributors.current_rank IS
'Current rank level of the distributor, updated monthly by evaluate_ranks()';
