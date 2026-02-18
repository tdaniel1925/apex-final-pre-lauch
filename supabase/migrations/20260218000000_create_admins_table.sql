-- =============================================
-- Admins Table
-- Separate super admin accounts (not distributors)
-- =============================================

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Profile
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,

  -- Admin metadata
  role TEXT DEFAULT 'super_admin', -- Future: could have different admin roles

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_auth_user_id ON admins(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admin can read their own record
DROP POLICY IF EXISTS admins_select_own ON admins;
CREATE POLICY admins_select_own ON admins
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Only admins can update (via service client)
-- No public policies for insert/update/delete

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admins_updated_at ON admins;
CREATE TRIGGER admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admins_updated_at();

-- Migration: Move existing super admin to admins table
-- Find the super admin in distributors and move them
DO $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Find distributors with is_master = true
  FOR admin_record IN
    SELECT id, auth_user_id, email, first_name, last_name
    FROM distributors
    WHERE is_master = true
  LOOP
    -- Insert into admins table
    INSERT INTO admins (auth_user_id, email, first_name, last_name, role)
    VALUES (
      admin_record.auth_user_id,
      admin_record.email,
      admin_record.first_name,
      admin_record.last_name,
      'super_admin'
    )
    ON CONFLICT (auth_user_id) DO NOTHING;

    -- Delete from distributors table
    DELETE FROM distributors WHERE id = admin_record.id;
  END LOOP;
END $$;

-- Function to check email uniqueness across both tables
CREATE OR REPLACE FUNCTION check_email_unique()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email exists in admins table
  IF EXISTS (SELECT 1 FROM admins WHERE email = NEW.email) THEN
    RAISE EXCEPTION 'Email already registered as admin';
  END IF;

  -- Check if email exists in distributors table
  IF TG_TABLE_NAME = 'admins' THEN
    IF EXISTS (SELECT 1 FROM distributors WHERE email = NEW.email) THEN
      RAISE EXCEPTION 'Email already registered as distributor';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce email uniqueness on distributors
DROP TRIGGER IF EXISTS distributors_email_unique ON distributors;
CREATE TRIGGER distributors_email_unique
  BEFORE INSERT OR UPDATE ON distributors
  FOR EACH ROW
  EXECUTE FUNCTION check_email_unique();

-- Trigger to enforce email uniqueness on admins
DROP TRIGGER IF EXISTS admins_email_unique ON admins;
CREATE TRIGGER admins_email_unique
  BEFORE INSERT OR UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION check_email_unique();
