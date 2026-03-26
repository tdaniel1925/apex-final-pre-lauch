-- =============================================
-- Onboarding Sessions
-- Migration: 20260326000002
-- Customer onboarding session booking system
-- =============================================

-- Onboarding sessions table
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
  zoom_link TEXT, -- Will be provided by admin

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_date ON onboarding_sessions(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_customer ON onboarding_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_rep ON onboarding_sessions(rep_distributor_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_order ON onboarding_sessions(order_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_onboarding_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER onboarding_sessions_updated_at
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_sessions_updated_at();

-- RLS Policies
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can see all sessions
CREATE POLICY "Admins can view all onboarding sessions"
  ON onboarding_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND (distributors.is_admin = true OR distributors.is_master = true)
    )
  );

-- Admins can update all sessions
CREATE POLICY "Admins can update onboarding sessions"
  ON onboarding_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND (distributors.is_admin = true OR distributors.is_master = true)
    )
  );

-- Reps can view their own customer sessions
CREATE POLICY "Reps can view their customer sessions"
  ON onboarding_sessions FOR SELECT
  USING (
    rep_distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Public insert for booking (no auth required)
CREATE POLICY "Anyone can create onboarding sessions"
  ON onboarding_sessions FOR INSERT
  WITH CHECK (true);

-- =============================================
-- MIGRATION COMPLETE
-- Onboarding sessions table ready
-- =============================================
