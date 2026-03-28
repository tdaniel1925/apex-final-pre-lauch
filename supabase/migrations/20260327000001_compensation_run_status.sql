-- =============================================
-- Compensation Run Status Tracking
-- Security Fix #2: Prevents duplicate runs and provides audit trail
-- =============================================
-- Migration: Add compensation_run_status table
-- Date: 2026-03-27
-- Purpose: Track compensation run lifecycle and prevent race conditions

-- =============================================
-- 1. CREATE COMPENSATION RUN STATUS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS compensation_run_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Period Info
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Run Info
  run_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN (
    'pending',      -- Created, waiting to start
    'in_progress',  -- Currently running
    'completed',    -- Successfully finished
    'failed',       -- Error occurred
    'cancelled'     -- Manually cancelled by admin
  )),

  -- Who & When
  initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Results
  members_processed INT DEFAULT 0,
  commissions_calculated INT DEFAULT 0,
  total_amount_cents BIGINT DEFAULT 0,
  error_message TEXT,

  -- Metadata
  dry_run BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Only one active run per period
  -- This prevents race conditions at the database level
  UNIQUE(period_start, period_end, status)
    WHERE status IN ('in_progress', 'pending')
);

-- =============================================
-- 2. CREATE INDEXES
-- =============================================

-- Fast lookups by period
CREATE INDEX IF NOT EXISTS idx_comp_run_status_period
  ON compensation_run_status(period_start, period_end);

-- Fast lookups by status
CREATE INDEX IF NOT EXISTS idx_comp_run_status_status
  ON compensation_run_status(status);

-- Fast lookups by run_id
CREATE INDEX IF NOT EXISTS idx_comp_run_status_run_id
  ON compensation_run_status(run_id);

-- Fast lookups for active runs
CREATE INDEX IF NOT EXISTS idx_comp_run_status_active
  ON compensation_run_status(period_start, period_end, status)
  WHERE status IN ('in_progress', 'pending');

-- =============================================
-- 3. CREATE AUTO-UPDATE TRIGGER
-- =============================================

-- Create or update the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to compensation_run_status
CREATE TRIGGER update_compensation_run_status_updated_at
  BEFORE UPDATE ON compensation_run_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. ADD HELPFUL COMMENTS
-- =============================================

COMMENT ON TABLE compensation_run_status IS 'Tracks compensation run lifecycle and prevents duplicate runs for the same period';
COMMENT ON COLUMN compensation_run_status.run_id IS 'Unique identifier for this compensation run, matches entries in earnings_ledger';
COMMENT ON COLUMN compensation_run_status.status IS 'Current status of the run: pending, in_progress, completed, failed, or cancelled';
COMMENT ON COLUMN compensation_run_status.dry_run IS 'If true, this was a dry run (no actual database changes)';
COMMENT ON CONSTRAINT compensation_run_status_period_start_period_end_status_key ON compensation_run_status IS 'Prevents multiple active runs for the same period';

-- =============================================
-- 5. GRANT PERMISSIONS
-- =============================================

-- Service role needs full access
GRANT ALL ON compensation_run_status TO service_role;

-- Authenticated users can view (RLS will restrict to admins in application layer)
GRANT SELECT ON compensation_run_status TO authenticated;

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE compensation_run_status ENABLE ROW LEVEL SECURITY;

-- Policy: Service role bypasses RLS
CREATE POLICY "Service role has full access to compensation_run_status"
  ON compensation_run_status
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can view all runs (admin check done in API)
CREATE POLICY "Authenticated users can view compensation_run_status"
  ON compensation_run_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Note: INSERT, UPDATE, DELETE are restricted to service_role only
-- Application code will check admin status before allowing modifications
