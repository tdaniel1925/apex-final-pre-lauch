-- =============================================
-- COMPLETE MIGRATION SCRIPT
-- This creates the onboarding_sessions table AND applies all new migrations
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- STEP 1: Create onboarding_sessions table (if it doesn't exist)
-- =============================================
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  customer_id UUID REFERENCES customers(id),
  order_id UUID REFERENCES orders(id),
  rep_distributor_id UUID REFERENCES distributors(id),

  -- Session details
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone TEXT DEFAULT 'America/Chicago',
  duration_minutes INTEGER DEFAULT 60,
  zoom_link TEXT,

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',

  -- Customer info (denormalized for easy access)
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,

  -- Products purchased (for session prep)
  products_purchased JSONB,

  -- Notes
  session_notes TEXT,
  completed_notes TEXT,

  -- Reminders sent
  confirmation_sent_at TIMESTAMPTZ,
  reminder_24h_sent_at TIMESTAMPTZ,
  reminder_1h_sent_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES distributors(id),
  cancellation_reason TEXT
);

-- Indexes for onboarding_sessions
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_date ON onboarding_sessions(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_customer ON onboarding_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_rep ON onboarding_sessions(rep_distributor_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_order ON onboarding_sessions(order_id);

-- Updated_at trigger for onboarding_sessions
CREATE OR REPLACE FUNCTION update_onboarding_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS onboarding_sessions_updated_at ON onboarding_sessions;
CREATE TRIGGER onboarding_sessions_updated_at
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_sessions_updated_at();

-- RLS Policies for onboarding_sessions
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all onboarding sessions" ON onboarding_sessions;
CREATE POLICY "Admins can view all onboarding sessions"
  ON onboarding_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND (distributors.is_admin = true OR distributors.is_master = true)
    )
  );

DROP POLICY IF EXISTS "Admins can update onboarding sessions" ON onboarding_sessions;
CREATE POLICY "Admins can update onboarding sessions"
  ON onboarding_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND (distributors.is_admin = true OR distributors.is_master = true)
    )
  );

DROP POLICY IF EXISTS "Reps can view their customer sessions" ON onboarding_sessions;
CREATE POLICY "Reps can view their customer sessions"
  ON onboarding_sessions FOR SELECT
  USING (
    rep_distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can create onboarding sessions" ON onboarding_sessions;
CREATE POLICY "Anyone can create onboarding sessions"
  ON onboarding_sessions FOR INSERT
  WITH CHECK (true);

-- =============================================
-- STEP 2: MIGRATION 1 - Remove Business Center Trial
-- =============================================
UPDATE products
SET trial_days = 0
WHERE slug = 'businesscenter';

-- =============================================
-- STEP 3: MIGRATION 2 - Add Fulfillment Tracking
-- =============================================
ALTER TABLE onboarding_sessions
  ADD COLUMN IF NOT EXISTS fulfillment_stage TEXT
    CHECK (fulfillment_stage IN (
      'payment_made',
      'onboarding_scheduled',
      'onboarding_complete',
      'building_pages',
      'social_proofs',
      'content_approved',
      'campaigns_live',
      'completed'
    )) DEFAULT 'payment_made',
  ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_fulfillment_stage
  ON onboarding_sessions(fulfillment_stage);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_calendar_event
  ON onboarding_sessions(calendar_event_id);

COMMENT ON COLUMN onboarding_sessions.fulfillment_stage IS 'Current stage in the fulfillment pipeline';
COMMENT ON COLUMN onboarding_sessions.calendar_event_id IS 'Cal.com event ID for tracking';

-- =============================================
-- STEP 4: MIGRATION 3 - Fulfillment Notes Table
-- =============================================
CREATE TABLE IF NOT EXISTS fulfillment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  note_text TEXT NOT NULL CHECK (char_length(note_text) > 0 AND char_length(note_text) <= 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_fulfillment_notes_session
ON fulfillment_notes(onboarding_session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fulfillment_notes_admin
ON fulfillment_notes(admin_id);

CREATE INDEX IF NOT EXISTS idx_fulfillment_notes_deleted
ON fulfillment_notes(deleted_at)
WHERE deleted_at IS NULL;

ALTER TABLE fulfillment_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all notes" ON fulfillment_notes;
DROP POLICY IF EXISTS "Admins can insert notes" ON fulfillment_notes;
DROP POLICY IF EXISTS "Admins can update own notes" ON fulfillment_notes;

-- Admins can view all notes
CREATE POLICY "Admins can view all notes"
ON fulfillment_notes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM distributors d
    WHERE d.auth_user_id = auth.uid()
    AND (d.is_admin = true OR d.is_master = true)
  )
);

-- Admins can insert notes
CREATE POLICY "Admins can insert notes"
ON fulfillment_notes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM distributors d
    WHERE d.auth_user_id = auth.uid()
    AND (d.is_admin = true OR d.is_master = true)
  )
);

-- Admins can update own notes
CREATE POLICY "Admins can update own notes"
ON fulfillment_notes FOR UPDATE
TO authenticated
USING (admin_id = auth.uid())
WITH CHECK (admin_id = auth.uid());

-- Updated_at trigger for fulfillment_notes
CREATE OR REPLACE FUNCTION update_fulfillment_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fulfillment_notes_updated_at ON fulfillment_notes;
CREATE TRIGGER fulfillment_notes_updated_at
BEFORE UPDATE ON fulfillment_notes
FOR EACH ROW
EXECUTE FUNCTION update_fulfillment_notes_updated_at();

-- =============================================
-- STEP 5: MIGRATION 4 - CRM Activities Table
-- =============================================
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
CREATE INDEX IF NOT EXISTS idx_crm_activities_distributor ON public.crm_activities(distributor_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_date ON public.crm_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON public.crm_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON public.crm_activities(contact_id);

-- RLS Policies
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Distributors can view own activities" ON public.crm_activities;
CREATE POLICY "Distributors can view own activities"
  ON public.crm_activities
  FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Distributors can create own activities" ON public.crm_activities;
CREATE POLICY "Distributors can create own activities"
  ON public.crm_activities
  FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM public.distributors WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Distributors can update own activities" ON public.crm_activities;
CREATE POLICY "Distributors can update own activities"
  ON public.crm_activities
  FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Distributors can delete own activities" ON public.crm_activities;
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

DROP TRIGGER IF EXISTS update_crm_activities_updated_at ON public.crm_activities;
CREATE TRIGGER update_crm_activities_updated_at
  BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_activities_updated_at();

-- =============================================
-- ALL MIGRATIONS COMPLETE
-- =============================================
-- ✅ onboarding_sessions table created
-- ✅ Business Center trial removed
-- ✅ Fulfillment tracking added
-- ✅ Fulfillment notes system created
-- ✅ CRM Activities table created
-- =============================================
