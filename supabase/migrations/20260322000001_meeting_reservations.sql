-- =============================================
-- MEETING RESERVATIONS SYSTEM
-- Enables reps to create event registration pages
-- =============================================

-- =============================================
-- MEETING_EVENTS TABLE
-- Stores meeting/event details created by distributors
-- =============================================

CREATE TABLE IF NOT EXISTS meeting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to distributor (rep who owns this meeting)
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Meeting details
  title TEXT NOT NULL,
  description TEXT,
  custom_message TEXT, -- Optional message shown on registration page

  -- Date and time
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),

  -- Location information
  location_type TEXT NOT NULL CHECK (location_type IN ('virtual', 'physical', 'hybrid')),
  virtual_link TEXT, -- Required if location_type = 'virtual' or 'hybrid'
  physical_address TEXT, -- Required if location_type = 'physical' or 'hybrid'

  -- URL slug for registration page
  registration_slug TEXT NOT NULL, -- e.g., 'business-webinar-2026'

  -- Meeting status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'completed', 'canceled')),

  -- Capacity settings
  max_attendees INTEGER CHECK (max_attendees IS NULL OR max_attendees > 0), -- NULL = unlimited
  registration_deadline TIMESTAMPTZ, -- NULL = no deadline

  -- Denormalized stats (updated via triggers for performance)
  total_registered INTEGER NOT NULL DEFAULT 0,
  total_confirmed INTEGER NOT NULL DEFAULT 0,
  total_not_going INTEGER NOT NULL DEFAULT 0,
  total_needs_followup INTEGER NOT NULL DEFAULT 0,
  total_with_questions INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE meeting_events IS 'Event registration pages created by distributors for prospect meetings';
COMMENT ON COLUMN meeting_events.registration_slug IS 'URL-safe slug used in registration link: /[slug]/register/[registration_slug]';
COMMENT ON COLUMN meeting_events.total_registered IS 'Count of all registrations regardless of status (denormalized for performance)';
COMMENT ON COLUMN meeting_events.total_confirmed IS 'Count of registrations with status = confirmed (denormalized)';
COMMENT ON COLUMN meeting_events.max_attendees IS 'NULL = unlimited capacity, otherwise integer > 0';

-- =============================================
-- MEETING_REGISTRATIONS TABLE
-- Stores individual registrations for meetings
-- =============================================

CREATE TABLE IF NOT EXISTS meeting_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to meeting event
  meeting_event_id UUID NOT NULL REFERENCES meeting_events(id) ON DELETE CASCADE,

  -- Registrant information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Registration status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'not_going', 'needs_followup')),

  -- Additional fields
  has_questions BOOLEAN NOT NULL DEFAULT FALSE,
  questions_text TEXT, -- Optional questions/comments from registrant

  -- Email tracking
  confirmation_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_email_sent_at TIMESTAMPTZ,
  reminder_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_email_sent_at TIMESTAMPTZ,

  -- Rep notes
  rep_notes TEXT, -- Private notes from rep about this registrant

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE meeting_registrations IS 'Individual registrations for meeting events';
COMMENT ON COLUMN meeting_registrations.status IS 'pending = registered but not confirmed, confirmed = will attend, not_going = declined, needs_followup = flagged by rep';
COMMENT ON COLUMN meeting_registrations.has_questions IS 'TRUE if questions_text is not empty';

-- =============================================
-- INDEXES
-- =============================================

-- Meeting events indexes
CREATE INDEX idx_meeting_events_distributor ON meeting_events(distributor_id);
CREATE INDEX idx_meeting_events_status ON meeting_events(status);
CREATE INDEX idx_meeting_events_date ON meeting_events(event_date);
CREATE UNIQUE INDEX idx_meeting_events_slug ON meeting_events(distributor_id, registration_slug); -- Ensure slug unique per distributor

-- Meeting registrations indexes
CREATE INDEX idx_meeting_registrations_event ON meeting_registrations(meeting_event_id);
CREATE INDEX idx_meeting_registrations_email ON meeting_registrations(email);
CREATE INDEX idx_meeting_registrations_status ON meeting_registrations(status);
CREATE UNIQUE INDEX idx_meeting_registrations_unique ON meeting_registrations(meeting_event_id, email); -- Prevent duplicate registrations

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE meeting_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_registrations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- MEETING_EVENTS RLS POLICIES
-- =============================================

-- Distributors can view their own meetings
CREATE POLICY "Distributors can view own meetings"
  ON meeting_events FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));

-- Distributors can create meetings
CREATE POLICY "Distributors can create meetings"
  ON meeting_events FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));

-- Distributors can update their own meetings
CREATE POLICY "Distributors can update own meetings"
  ON meeting_events FOR UPDATE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ))
  WITH CHECK (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));

-- Distributors can delete their own meetings
CREATE POLICY "Distributors can delete own meetings"
  ON meeting_events FOR DELETE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));

-- Admins can view all meetings
CREATE POLICY "Admins can view all meetings"
  ON meeting_events FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE is_admin = true
  ));

-- =============================================
-- MEETING_REGISTRATIONS RLS POLICIES
-- =============================================

-- Distributors can view registrations for their meetings
CREATE POLICY "Distributors can view own meeting registrations"
  ON meeting_registrations FOR SELECT
  USING (auth.uid() IN (
    SELECT d.auth_user_id FROM distributors d
    INNER JOIN meeting_events me ON me.distributor_id = d.id
    WHERE me.id = meeting_event_id
  ));

-- Distributors can update registrations for their meetings (status, notes)
CREATE POLICY "Distributors can update own meeting registrations"
  ON meeting_registrations FOR UPDATE
  USING (auth.uid() IN (
    SELECT d.auth_user_id FROM distributors d
    INNER JOIN meeting_events me ON me.distributor_id = d.id
    WHERE me.id = meeting_event_id
  ))
  WITH CHECK (auth.uid() IN (
    SELECT d.auth_user_id FROM distributors d
    INNER JOIN meeting_events me ON me.distributor_id = d.id
    WHERE me.id = meeting_event_id
  ));

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
  ON meeting_registrations FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE is_admin = true
  ));

-- NOTE: Public registration inserts handled via service client in API (bypasses RLS)

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_meeting_events_updated_at
  BEFORE UPDATE ON meeting_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_registrations_updated_at
  BEFORE UPDATE ON meeting_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DENORMALIZED STATS TRIGGER
-- Updates total counts on meeting_events when registrations change
-- =============================================

CREATE OR REPLACE FUNCTION update_meeting_event_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate stats for the affected meeting
  UPDATE meeting_events
  SET
    total_registered = (
      SELECT COUNT(*) FROM meeting_registrations
      WHERE meeting_event_id = COALESCE(NEW.meeting_event_id, OLD.meeting_event_id)
    ),
    total_confirmed = (
      SELECT COUNT(*) FROM meeting_registrations
      WHERE meeting_event_id = COALESCE(NEW.meeting_event_id, OLD.meeting_event_id)
        AND status = 'confirmed'
    ),
    total_not_going = (
      SELECT COUNT(*) FROM meeting_registrations
      WHERE meeting_event_id = COALESCE(NEW.meeting_event_id, OLD.meeting_event_id)
        AND status = 'not_going'
    ),
    total_needs_followup = (
      SELECT COUNT(*) FROM meeting_registrations
      WHERE meeting_event_id = COALESCE(NEW.meeting_event_id, OLD.meeting_event_id)
        AND status = 'needs_followup'
    ),
    total_with_questions = (
      SELECT COUNT(*) FROM meeting_registrations
      WHERE meeting_event_id = COALESCE(NEW.meeting_event_id, OLD.meeting_event_id)
        AND has_questions = true
    )
  WHERE id = COALESCE(NEW.meeting_event_id, OLD.meeting_event_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_meeting_event_stats() IS 'Trigger function to update denormalized stats on meeting_events table when registrations change';

-- Apply trigger to meeting_registrations table
CREATE TRIGGER update_stats_on_registration_insert
  AFTER INSERT ON meeting_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_event_stats();

CREATE TRIGGER update_stats_on_registration_update
  AFTER UPDATE ON meeting_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_event_stats();

CREATE TRIGGER update_stats_on_registration_delete
  AFTER DELETE ON meeting_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_event_stats();

-- =============================================
-- HELPER FUNCTION: Check if meeting at capacity
-- =============================================

CREATE OR REPLACE FUNCTION is_meeting_at_capacity(meeting_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  meeting_record RECORD;
BEGIN
  SELECT max_attendees, total_registered
  INTO meeting_record
  FROM meeting_events
  WHERE id = meeting_id;

  -- If no max_attendees set, never at capacity
  IF meeting_record.max_attendees IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if total_registered >= max_attendees
  RETURN meeting_record.total_registered >= meeting_record.max_attendees;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_meeting_at_capacity(UUID) IS 'Returns TRUE if meeting has reached max capacity, FALSE otherwise. NULL max_attendees = unlimited capacity.';

-- =============================================
-- HELPER FUNCTION: Check if registration deadline passed
-- =============================================

CREATE OR REPLACE FUNCTION is_registration_deadline_passed(meeting_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  deadline TIMESTAMPTZ;
BEGIN
  SELECT registration_deadline
  INTO deadline
  FROM meeting_events
  WHERE id = meeting_id;

  -- If no deadline set, never passed
  IF deadline IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if current time > deadline
  RETURN NOW() > deadline;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_registration_deadline_passed(UUID) IS 'Returns TRUE if registration deadline has passed, FALSE otherwise. NULL deadline = no deadline.';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Verify tables created
DO $$
BEGIN
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meeting_events')), 'meeting_events table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meeting_registrations')), 'meeting_registrations table not created';
  RAISE NOTICE 'Meeting Reservations schema created successfully';
END $$;
