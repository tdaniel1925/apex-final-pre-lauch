-- =============================================
-- ADD: rank_achieved_at Column to Distributors
-- Tracks when distributor achieved their current rank
-- =============================================
-- Migration: 20260221000012
-- Created: 2026-02-22
-- Fixes: evaluate_ranks() tries to update rank_achieved_at
-- =============================================

ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS rank_achieved_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_distributors_rank_achieved ON distributors(rank_achieved_at);

COMMENT ON COLUMN distributors.rank_achieved_at IS
'Timestamp when the distributor achieved their current rank';
