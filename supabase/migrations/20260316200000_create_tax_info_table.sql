-- =============================================
-- Distributor Tax Information Table
-- Separate table for PII/tax data with encryption
-- =============================================

-- Create tax_info table
CREATE TABLE IF NOT EXISTS public.distributor_tax_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,

  -- SSN stored encrypted (use pgcrypto or application-level encryption)
  ssn_encrypted TEXT NOT NULL,
  ssn_last_4 VARCHAR(4) NOT NULL, -- For display purposes (XXX-XX-1234)

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Ensure one tax record per distributor
  UNIQUE(distributor_id)
);

-- Create index for fast lookups
CREATE INDEX idx_tax_info_distributor_id ON public.distributor_tax_info(distributor_id);
CREATE INDEX idx_tax_info_last_4 ON public.distributor_tax_info(ssn_last_4);

-- Enable RLS
ALTER TABLE public.distributor_tax_info ENABLE ROW LEVEL SECURITY;

-- Policy: Distributors can view their own tax info
CREATE POLICY "Distributors can view own tax info"
  ON public.distributor_tax_info
  FOR SELECT
  TO authenticated
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors
      WHERE auth_user_id = auth.uid()
    )
  );

-- Policy: Distributors can update their own tax info (within 30 days of creation)
CREATE POLICY "Distributors can update own tax info within 30 days"
  ON public.distributor_tax_info
  FOR UPDATE
  TO authenticated
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors
      WHERE auth_user_id = auth.uid()
    )
    AND created_at > NOW() - INTERVAL '30 days'
  );

-- Policy: Admins can view all tax info
CREATE POLICY "Admins can view all tax info"
  ON public.distributor_tax_info
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.auth_user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Policy: Admins can insert tax info
CREATE POLICY "Admins can insert tax info"
  ON public.distributor_tax_info
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.auth_user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Policy: Admins can update all tax info
CREATE POLICY "Admins can update all tax info"
  ON public.distributor_tax_info
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.auth_user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create audit log for SSN access
CREATE TABLE IF NOT EXISTS public.ssn_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.admins(id),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  admin_email TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'view_last_4', 'reveal_full', 'update'
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for audit log
CREATE INDEX idx_ssn_access_distributor_id ON public.ssn_access_log(distributor_id);
CREATE INDEX idx_ssn_access_admin_id ON public.ssn_access_log(admin_id);
CREATE INDEX idx_ssn_access_created_at ON public.ssn_access_log(created_at);

-- Enable RLS on audit log
ALTER TABLE public.ssn_access_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit log
CREATE POLICY "Admins can view SSN access log"
  ON public.ssn_access_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.auth_user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Policy: Only admins can insert audit log entries
CREATE POLICY "Admins can insert SSN access log"
  ON public.ssn_access_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.auth_user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_tax_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER tax_info_updated_at
  BEFORE UPDATE ON public.distributor_tax_info
  FOR EACH ROW
  EXECUTE FUNCTION update_tax_info_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.distributor_tax_info TO authenticated;
GRANT SELECT, INSERT ON public.ssn_access_log TO authenticated;

-- Comments
COMMENT ON TABLE public.distributor_tax_info IS 'Encrypted tax information for distributors (SSN, tax ID)';
COMMENT ON COLUMN public.distributor_tax_info.ssn_encrypted IS 'Encrypted Social Security Number';
COMMENT ON COLUMN public.distributor_tax_info.ssn_last_4 IS 'Last 4 digits of SSN for display (XXX-XX-1234)';
COMMENT ON TABLE public.ssn_access_log IS 'Audit log for all SSN access and modifications';
