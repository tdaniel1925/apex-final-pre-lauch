-- =============================================
-- Stage 2: Distributor Management
-- Status tracking, suspension, and soft delete
-- =============================================

-- Add status tracking
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
-- Possible values: 'active', 'suspended', 'deleted'

COMMENT ON COLUMN distributors.status IS 'Distributor status: active, suspended, deleted';

-- Add suspension tracking
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES distributors(id);
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

COMMENT ON COLUMN distributors.suspended_at IS 'When the distributor was suspended';
COMMENT ON COLUMN distributors.suspended_by IS 'Admin who suspended the distributor';
COMMENT ON COLUMN distributors.suspension_reason IS 'Reason for suspension';

-- Add soft delete tracking
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES distributors(id);

COMMENT ON COLUMN distributors.deleted_at IS 'When the distributor was soft deleted';
COMMENT ON COLUMN distributors.deleted_by IS 'Admin who deleted the distributor';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_distributors_status ON distributors(status);
CREATE INDEX IF NOT EXISTS idx_distributors_email ON distributors(email);
CREATE INDEX IF NOT EXISTS idx_distributors_slug ON distributors(slug);
CREATE INDEX IF NOT EXISTS idx_distributors_created_at ON distributors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_distributors_sponsor_id ON distributors(sponsor_id);

-- Update existing distributors to have 'active' status
UPDATE distributors
SET status = 'active'
WHERE status IS NULL;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_distributors_updated_at ON distributors;
CREATE TRIGGER update_distributors_updated_at
    BEFORE UPDATE ON distributors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get distributor counts by status
CREATE OR REPLACE FUNCTION get_distributor_counts()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'total', (SELECT COUNT(*) FROM distributors WHERE status != 'deleted'),
    'active', (SELECT COUNT(*) FROM distributors WHERE status = 'active'),
    'suspended', (SELECT COUNT(*) FROM distributors WHERE status = 'suspended'),
    'deleted', (SELECT COUNT(*) FROM distributors WHERE status = 'deleted')
  );
END;
$$ LANGUAGE plpgsql;
