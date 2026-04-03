-- Create crm_activities table
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,

  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note')),
  subject TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration INTEGER, -- in minutes

  -- Related records
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_crm_activities_distributor ON public.crm_activities(distributor_id);
CREATE INDEX idx_crm_activities_date ON public.crm_activities(activity_date DESC);
CREATE INDEX idx_crm_activities_type ON public.crm_activities(activity_type);
CREATE INDEX idx_crm_activities_contact ON public.crm_activities(contact_id);

-- RLS Policies
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

-- Distributors can only see their own activities
CREATE POLICY "Distributors can view own activities"
  ON public.crm_activities
  FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can create their own activities
CREATE POLICY "Distributors can create own activities"
  ON public.crm_activities
  FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM public.distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can update their own activities
CREATE POLICY "Distributors can update own activities"
  ON public.crm_activities
  FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can delete their own activities
CREATE POLICY "Distributors can delete own activities"
  ON public.crm_activities
  FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_crm_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crm_activities_updated_at
  BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_activities_updated_at();
