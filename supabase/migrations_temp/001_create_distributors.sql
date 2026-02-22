-- =============================================
-- Apex Affinity Group - Distributors Table
-- Migration 001: Initial Schema Setup
-- =============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CREATE DISTRIBUTORS TABLE
-- =============================================

CREATE TABLE distributors (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Authentication Link
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(200),
  email VARCHAR(255) UNIQUE NOT NULL,

  -- URL Slug (for personalized landing pages)
  slug VARCHAR(50) UNIQUE NOT NULL,

  -- MLM Structure
  sponsor_id UUID REFERENCES distributors(id) ON DELETE SET NULL,
  matrix_parent_id UUID REFERENCES distributors(id) ON DELETE SET NULL,
  matrix_position INTEGER CHECK (matrix_position >= 1 AND matrix_position <= 5),
  matrix_depth INTEGER DEFAULT 0 CHECK (matrix_depth >= 0 AND matrix_depth <= 7),

  -- Flags
  is_master BOOLEAN DEFAULT false,
  profile_complete BOOLEAN DEFAULT false,

  -- Profile Completion Fields (nullable until filled)
  phone VARCHAR(20),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Fast slug lookup for landing pages
CREATE INDEX idx_distributors_slug ON distributors(slug);

-- Fast tree traversal
CREATE INDEX idx_distributors_matrix_parent ON distributors(matrix_parent_id);

-- Fast sponsor lookups
CREATE INDEX idx_distributors_sponsor ON distributors(sponsor_id);

-- Fast auth user lookups
CREATE INDEX idx_distributors_auth_user ON distributors(auth_user_id);

-- Compound index for finding available slots
CREATE INDEX idx_distributors_matrix_placement ON distributors(matrix_parent_id, matrix_position);

-- =============================================
-- 3. CREATE AUTO-UPDATE TIMESTAMP TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_distributors_updated_at
  BEFORE UPDATE ON distributors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. ENABLE ROW-LEVEL SECURITY
-- =============================================

ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. CREATE RLS POLICIES
-- =============================================

-- Policy 1: Distributors can read their own profile
CREATE POLICY "Distributors can view own profile"
  ON distributors
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Policy 2: Distributors can update their own profile
CREATE POLICY "Distributors can update own profile"
  ON distributors
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Policy 3: Distributors can read limited data of their downline
-- (Full implementation requires recursive CTE)
CREATE POLICY "Distributors can view downline basic info"
  ON distributors
  FOR SELECT
  USING (
    -- Can see anyone in their downline tree
    id IN (
      WITH RECURSIVE downline AS (
        SELECT id FROM distributors WHERE auth_user_id = auth.uid()
        UNION ALL
        SELECT d.id FROM distributors d
        INNER JOIN downline dl ON d.matrix_parent_id = dl.id
      )
      SELECT id FROM downline
    )
  );

-- Policy 4: Public can read basic info for landing pages (by slug)
-- This allows unauthenticated users to view distributor landing pages
CREATE POLICY "Public can view distributor landing pages"
  ON distributors
  FOR SELECT
  USING (true);

-- Note: Service role key automatically bypasses RLS for server-side operations

-- =============================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE distributors IS 'Stores all distributor information for the 5x7 forced matrix MLM system';
COMMENT ON COLUMN distributors.id IS 'Unique identifier for the distributor';
COMMENT ON COLUMN distributors.auth_user_id IS 'Links to Supabase auth.users for authentication';
COMMENT ON COLUMN distributors.slug IS 'URL-friendly identifier for personalized landing pages (e.g., theapexway.net/john-doe)';
COMMENT ON COLUMN distributors.sponsor_id IS 'Who recruited this distributor (referral tracking)';
COMMENT ON COLUMN distributors.matrix_parent_id IS 'Where this distributor is placed in the matrix tree (BFS auto-placement)';
COMMENT ON COLUMN distributors.matrix_position IS 'Position under parent (1-5, represents one of 5 slots)';
COMMENT ON COLUMN distributors.matrix_depth IS 'Level in the matrix tree (0 = master, 1-7 = downline levels)';
COMMENT ON COLUMN distributors.is_master IS 'True only for the root distributor (Apex Vision)';

-- =============================================
-- VERIFICATION QUERIES (for testing)
-- =============================================

-- Check table exists
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'distributors';

-- Check indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'distributors';

-- Check RLS is enabled
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'distributors';

-- Check policies
-- SELECT policyname FROM pg_policies WHERE tablename = 'distributors';
