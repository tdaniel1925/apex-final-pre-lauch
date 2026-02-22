-- =============================================
-- FIX: Add 'associate' to current_rank constraint
-- evaluate_ranks() sets rank to 'associate' but constraint doesn't allow it
-- =============================================
-- Migration: 20260221000013
-- Created: 2026-02-22
-- Fixes: new row violates check constraint "distributors_current_rank_check"
-- =============================================

-- Drop the old constraint
ALTER TABLE distributors
  DROP CONSTRAINT IF EXISTS distributors_current_rank_check;

-- Add new constraint with 'associate' included
ALTER TABLE distributors
  ADD CONSTRAINT distributors_current_rank_check
    CHECK (current_rank IN (
      'affiliate', 'associate', 'bronze', 'silver', 'gold',
      'platinum', 'diamond', 'crown_diamond', 'royal_diamond'
    ));

COMMENT ON CONSTRAINT distributors_current_rank_check ON distributors IS
'Ensures current_rank is one of the valid rank levels in the compensation plan';
