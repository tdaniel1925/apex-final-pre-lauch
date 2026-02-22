-- =============================================
-- Performance Optimization Indexes
-- Created: February 20, 2026
-- Purpose: Speed up common queries in dashboard and admin pages
-- =============================================

-- Dashboard queries - used frequently
CREATE INDEX IF NOT EXISTS idx_distributors_sponsor_id
  ON distributors(sponsor_id)
  WHERE sponsor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_distributors_matrix_parent_id
  ON distributors(matrix_parent_id)
  WHERE matrix_parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_distributors_auth_user_id
  ON distributors(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- Admin queries - filter by created_at frequently
CREATE INDEX IF NOT EXISTS idx_distributors_created_at
  ON distributors(created_at DESC);

-- Admin queries - filter by status (when implemented in Stage 2)
CREATE INDEX IF NOT EXISTS idx_distributors_status
  ON distributors(status)
  WHERE status IS NOT NULL;

-- Matrix depth queries
CREATE INDEX IF NOT EXISTS idx_distributors_matrix_depth
  ON distributors(matrix_depth)
  WHERE matrix_depth IS NOT NULL;

-- Composite index for admin dashboard stats
-- Speeds up queries that filter by created_at AND need status
CREATE INDEX IF NOT EXISTS idx_distributors_created_status
  ON distributors(created_at DESC, status)
  WHERE status IS NOT NULL;

-- Composite index for matrix queries
-- Speeds up finding children by parent and position
CREATE INDEX IF NOT EXISTS idx_distributors_matrix_parent_position
  ON distributors(matrix_parent_id, matrix_position)
  WHERE matrix_parent_id IS NOT NULL;

-- Email campaign queries (existing tables)
CREATE INDEX IF NOT EXISTS idx_email_campaigns_distributor_id
  ON email_campaigns(distributor_id);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at
  ON email_campaigns(sent_at)
  WHERE sent_at IS NOT NULL;

-- Training system indexes (for new training system)
CREATE INDEX IF NOT EXISTS idx_training_progress_user_id
  ON training_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_training_progress_content_id
  ON training_progress(content_id);

CREATE INDEX IF NOT EXISTS idx_training_subscriptions_user_id
  ON training_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_training_streaks_user_id
  ON training_streaks(user_id);

CREATE INDEX IF NOT EXISTS idx_training_streaks_leaderboard
  ON training_streaks(total_points DESC);

-- COMMENT: Explain what these indexes do
COMMENT ON INDEX idx_distributors_sponsor_id IS 'Speeds up queries to find direct referrals (sponsor_id = X)';
COMMENT ON INDEX idx_distributors_matrix_parent_id IS 'Speeds up queries to find matrix children (matrix_parent_id = X)';
COMMENT ON INDEX idx_distributors_created_at IS 'Speeds up admin dashboard queries filtered by signup date';
COMMENT ON INDEX idx_distributors_created_status IS 'Composite index for admin stats queries (date + status)';
COMMENT ON INDEX idx_distributors_matrix_parent_position IS 'Speeds up matrix tree traversal and position lookups';

-- =============================================
-- Analyze tables to update statistics
-- This helps the query planner make better decisions
-- =============================================
ANALYZE distributors;
ANALYZE email_campaigns;
ANALYZE training_progress;
ANALYZE training_subscriptions;
ANALYZE training_streaks;
