-- =============================================
-- Prospects System
-- For pre-distributors / sign-ups / leads
-- =============================================

-- Create prospects table
CREATE TABLE IF NOT EXISTS public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',

  -- Source Information
  how_did_you_hear TEXT,
  referral_source TEXT,
  signup_event TEXT, -- For tracking tonight's event, etc.

  -- Status Management
  status TEXT NOT NULL DEFAULT 'new',
  -- Possible statuses: 'new', 'contacted', 'pending', 'qualified', 'converted', 'declined', 'archived'

  -- Admin Management
  assigned_to UUID REFERENCES public.admins(id),
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  contacted_count INT DEFAULT 0,

  -- Conversion Tracking
  converted_to_distributor_id UUID REFERENCES public.distributors(id),
  converted_at TIMESTAMPTZ,
  converted_by UUID REFERENCES public.admins(id),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT prospects_email_unique UNIQUE (email)
);

-- Create index for quick lookups
CREATE INDEX idx_prospects_email ON public.prospects(email);
CREATE INDEX idx_prospects_status ON public.prospects(status);
CREATE INDEX idx_prospects_created_at ON public.prospects(created_at DESC);
CREATE INDEX idx_prospects_assigned_to ON public.prospects(assigned_to);
CREATE INDEX idx_prospects_converted ON public.prospects(converted_to_distributor_id);

-- Enable RLS
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can insert (sign up)
CREATE POLICY "Anyone can sign up as prospect"
  ON public.prospects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view all prospects
CREATE POLICY "Admins can view all prospects"
  ON public.prospects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admins can update prospects
CREATE POLICY "Admins can update prospects"
  ON public.prospects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admins can delete prospects
CREATE POLICY "Admins can delete prospects"
  ON public.prospects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_prospects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prospects_updated_at
  BEFORE UPDATE ON public.prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_prospects_updated_at();

-- Create function to get prospect statistics
CREATE OR REPLACE FUNCTION get_prospect_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'new', COUNT(*) FILTER (WHERE status = 'new'),
    'contacted', COUNT(*) FILTER (WHERE status = 'contacted'),
    'qualified', COUNT(*) FILTER (WHERE status = 'qualified'),
    'converted', COUNT(*) FILTER (WHERE status = 'converted'),
    'declined', COUNT(*) FILTER (WHERE status = 'declined'),
    'today', COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)
  )
  INTO result
  FROM public.prospects;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
