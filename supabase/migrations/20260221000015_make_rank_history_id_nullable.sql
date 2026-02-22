-- =============================================
-- FIX: rank_history_id NOT NULL constraint
-- Function doesn't provide rank_history_id when inserting
-- =============================================
-- Migration: 20260221000015
-- Created: 2026-02-22
-- Fixes: null value in column "rank_history_id" violates not-null constraint
-- =============================================

ALTER TABLE commissions_rank_advancement
  ALTER COLUMN rank_history_id DROP NOT NULL;

COMMENT ON COLUMN commissions_rank_advancement.rank_history_id IS
'Optional reference to rank_history table - may be null for system-calculated rank advancements';
