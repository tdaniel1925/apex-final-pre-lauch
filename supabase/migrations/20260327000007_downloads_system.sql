-- =============================================
-- DOWNLOADS SYSTEM
-- =============================================
-- Orphaned Page Fix: Downloads file management
-- Allows admins to upload files for distributors
-- =============================================

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File information
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  purpose TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),

  -- File storage
  storage_bucket VARCHAR(100) DEFAULT 'downloads',
  storage_path TEXT,

  -- Metadata
  category VARCHAR(50) DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Query by active status
CREATE INDEX IF NOT EXISTS idx_downloads_active
  ON downloads(is_active)
  WHERE is_active = true;

-- Query by category
CREATE INDEX IF NOT EXISTS idx_downloads_category
  ON downloads(category);

-- Query by creation date
CREATE INDEX IF NOT EXISTS idx_downloads_created
  ON downloads(created_at DESC);

-- Search by file name
CREATE INDEX IF NOT EXISTS idx_downloads_search
  ON downloads USING gin(to_tsvector('english', file_name || ' ' || purpose));

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_downloads_updated_at
  BEFORE UPDATE ON downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active downloads
CREATE POLICY "Authenticated users can view active downloads"
  ON downloads
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can manage all downloads
CREATE POLICY "Admins can manage downloads"
  ON downloads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

-- Service role can do everything
GRANT ALL ON downloads TO service_role;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_download_view(p_download_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE downloads
  SET view_count = view_count + 1
  WHERE id = p_download_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(p_download_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE downloads
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = p_download_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on functions
COMMENT ON FUNCTION increment_download_view IS 'Increment view count for download tracking';
COMMENT ON FUNCTION increment_download_count IS 'Increment download count and update timestamp';

-- =============================================
-- SEED DATA
-- =============================================

-- Insert the existing hardcoded download
INSERT INTO downloads (
  file_name,
  file_type,
  purpose,
  file_url,
  storage_path,
  category
) VALUES (
  'General - Apex Flyer.pptx',
  'PowerPoint',
  'Event invitation flyer for Tuesday/Thursday online events',
  '/General - Apex Flyer.pptx',
  'General - Apex Flyer.pptx',
  'marketing'
) ON CONFLICT DO NOTHING;
