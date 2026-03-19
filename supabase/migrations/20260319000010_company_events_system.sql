-- =============================================
-- COMPANY EVENTS SYSTEM
-- Admin-managed events that reps can invite prospects to
-- =============================================
-- Migration: 20260319000010
-- Created: 2026-03-19
-- =============================================

-- =============================================
-- TABLE: COMPANY_EVENTS
-- Admin-created events that all reps can use
-- =============================================

CREATE TABLE IF NOT EXISTS company_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event details
  event_name TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN (
    'product_launch',
    'training',
    'webinar',
    'conference',
    'social',
    'business_opportunity',
    'other'
  )),
  event_description TEXT,

  -- Date/Time
  event_date_time TIMESTAMPTZ NOT NULL,
  event_duration_minutes INTEGER DEFAULT 120,
  event_timezone TEXT DEFAULT 'America/Chicago',
  event_end_time TIMESTAMPTZ, -- Calculated or set manually

  -- Location
  location_type TEXT NOT NULL DEFAULT 'in_person' CHECK (location_type IN ('in_person', 'virtual', 'hybrid')),
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_state TEXT,
  venue_zip TEXT,
  venue_country TEXT DEFAULT 'United States',
  virtual_meeting_link TEXT,
  virtual_meeting_platform TEXT, -- 'zoom', 'teams', 'meet', 'other'
  virtual_meeting_id TEXT,
  virtual_meeting_passcode TEXT,

  -- Registration
  requires_registration BOOLEAN DEFAULT TRUE,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  rsvp_deadline TIMESTAMPTZ,

  -- Pre-set messaging templates
  invitation_subject TEXT,
  invitation_template TEXT, -- Pre-written invitation message for email
  reminder_template TEXT,   -- Pre-written reminder message
  confirmation_template TEXT, -- Auto-response when someone RSVPs

  -- Branding
  flyer_template_id TEXT,
  event_banner_url TEXT,
  event_logo_url TEXT,
  event_image_url TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'active',
    'full',
    'canceled',
    'completed',
    'archived'
  )),
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE, -- Visible to all reps
  display_order INTEGER DEFAULT 0, -- For sorting on selection dropdown

  -- Admin control
  created_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_by_name TEXT,

  -- Visibility control
  visible_to_ranks TEXT[], -- Empty = all ranks, or ['bronze', 'silver', 'gold']
  visible_from_date TIMESTAMPTZ, -- When event becomes visible to reps

  -- Stats (auto-calculated via triggers)
  total_invitations_sent INTEGER DEFAULT 0,
  total_rsvps_yes INTEGER DEFAULT 0,
  total_rsvps_no INTEGER DEFAULT 0,
  total_rsvps_maybe INTEGER DEFAULT 0,
  total_attendees_confirmed INTEGER DEFAULT 0,

  -- Notes and internal tracking
  internal_notes TEXT,
  tags TEXT[],

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for company_events
CREATE INDEX idx_company_events_status ON company_events(status);
CREATE INDEX idx_company_events_event_date ON company_events(event_date_time);
CREATE INDEX idx_company_events_is_featured ON company_events(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_company_events_is_public ON company_events(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_company_events_location_type ON company_events(location_type);
CREATE INDEX idx_company_events_event_type ON company_events(event_type);
CREATE INDEX idx_company_events_display_order ON company_events(display_order);
CREATE INDEX idx_company_events_visible_from ON company_events(visible_from_date) WHERE visible_from_date IS NOT NULL;
CREATE INDEX idx_company_events_tags ON company_events USING GIN(tags) WHERE tags IS NOT NULL;
CREATE INDEX idx_company_events_created_by ON company_events(created_by_admin_id) WHERE created_by_admin_id IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_company_events_search ON company_events USING GIN(
  to_tsvector('english',
    COALESCE(event_name, '') || ' ' ||
    COALESCE(event_description, '') || ' ' ||
    COALESCE(venue_name, '')
  )
);

-- Comments
COMMENT ON TABLE company_events IS 'Company-wide events managed by admins that reps can invite prospects to';
COMMENT ON COLUMN company_events.status IS 'draft, active, full, canceled, completed, archived';
COMMENT ON COLUMN company_events.location_type IS 'in_person, virtual, hybrid';
COMMENT ON COLUMN company_events.is_public IS 'If true, visible to all reps; if false, only specific ranks can see';
COMMENT ON COLUMN company_events.visible_to_ranks IS 'Empty array = all ranks; specific ranks = only those ranks';

-- =============================================
-- UPDATE MEETING_INVITATIONS TABLE
-- Add company event reference
-- =============================================

-- Add new columns to meeting_invitations
ALTER TABLE meeting_invitations
  ADD COLUMN IF NOT EXISTS company_event_id UUID REFERENCES company_events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invitation_type TEXT DEFAULT 'personal' CHECK (invitation_type IN ('personal', 'company_event'));

-- Index for company event invitations
CREATE INDEX idx_meeting_invitations_company_event
  ON meeting_invitations(company_event_id)
  WHERE company_event_id IS NOT NULL;

CREATE INDEX idx_meeting_invitations_type
  ON meeting_invitations(invitation_type);

-- Comment
COMMENT ON COLUMN meeting_invitations.company_event_id IS 'If set, this invitation is for a company-wide event';
COMMENT ON COLUMN meeting_invitations.invitation_type IS 'personal = custom meeting, company_event = admin-created event';

-- =============================================
-- AUTO-UPDATE TRIGGER
-- =============================================

CREATE TRIGGER update_company_events_updated_at
  BEFORE UPDATE ON company_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TRIGGER: UPDATE EVENT STATS
-- Automatically update company_events stats when invitations change
-- =============================================

CREATE OR REPLACE FUNCTION update_company_event_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats for the company event
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.company_event_id IS NOT NULL THEN
      UPDATE company_events
      SET
        total_invitations_sent = (
          SELECT COUNT(*)
          FROM meeting_invitations
          WHERE company_event_id = NEW.company_event_id
        ),
        total_rsvps_yes = (
          SELECT COUNT(*)
          FROM meeting_invitations
          WHERE company_event_id = NEW.company_event_id
          AND response_type = 'yes'
        ),
        total_rsvps_no = (
          SELECT COUNT(*)
          FROM meeting_invitations
          WHERE company_event_id = NEW.company_event_id
          AND response_type = 'no'
        ),
        total_rsvps_maybe = (
          SELECT COUNT(*)
          FROM meeting_invitations
          WHERE company_event_id = NEW.company_event_id
          AND response_type = 'maybe'
        ),
        total_attendees_confirmed = (
          SELECT COUNT(*)
          FROM meeting_invitations
          WHERE company_event_id = NEW.company_event_id
          AND status = 'responded_yes'
        ),
        current_attendees = (
          SELECT COUNT(*)
          FROM meeting_invitations
          WHERE company_event_id = NEW.company_event_id
          AND response_type = 'yes'
        ),
        updated_at = NOW()
      WHERE id = NEW.company_event_id;
    END IF;
  END IF;

  -- Also update OLD event if company_event_id changed
  IF TG_OP = 'UPDATE' AND OLD.company_event_id IS NOT NULL AND OLD.company_event_id != NEW.company_event_id THEN
    UPDATE company_events
    SET
      total_invitations_sent = (
        SELECT COUNT(*)
        FROM meeting_invitations
        WHERE company_event_id = OLD.company_event_id
      ),
      total_rsvps_yes = (
        SELECT COUNT(*)
        FROM meeting_invitations
        WHERE company_event_id = OLD.company_event_id
        AND response_type = 'yes'
      ),
      total_rsvps_no = (
        SELECT COUNT(*)
        FROM meeting_invitations
        WHERE company_event_id = OLD.company_event_id
        AND response_type = 'no'
      ),
      total_rsvps_maybe = (
        SELECT COUNT(*)
        FROM meeting_invitations
        WHERE company_event_id = OLD.company_event_id
        AND response_type = 'maybe'
      ),
      updated_at = NOW()
    WHERE id = OLD.company_event_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_event_stats
  AFTER INSERT OR UPDATE OF company_event_id, response_type, status ON meeting_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_company_event_stats();

-- =============================================
-- TRIGGER: AUTO-UPDATE EVENT STATUS TO FULL
-- Mark event as full when max_attendees reached
-- =============================================

CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS TRIGGER AS $$
BEGIN
  -- If event has max attendees and is now full
  IF NEW.max_attendees IS NOT NULL AND NEW.max_attendees > 0 THEN
    IF NEW.current_attendees >= NEW.max_attendees AND NEW.status = 'active' THEN
      NEW.status := 'full';
    ELSIF NEW.current_attendees < NEW.max_attendees AND NEW.status = 'full' THEN
      -- Reopen if capacity becomes available
      NEW.status := 'active';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_event_capacity
  BEFORE UPDATE OF current_attendees ON company_events
  FOR EACH ROW
  EXECUTE FUNCTION check_event_capacity();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all events"
  ON company_events FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- Distributors can view public events
CREATE POLICY "Distributors can view public events"
  ON company_events FOR SELECT
  USING (
    is_public = TRUE
    AND status IN ('active', 'full')
    AND (visible_from_date IS NULL OR visible_from_date <= NOW())
  );

-- Distributors can view events for their rank
CREATE POLICY "Distributors can view rank-specific events"
  ON company_events FOR SELECT
  USING (
    status IN ('active', 'full')
    AND (visible_from_date IS NULL OR visible_from_date <= NOW())
    AND (
      visible_to_ranks IS NULL
      OR array_length(visible_to_ranks, 1) IS NULL
      OR EXISTS (
        SELECT 1 FROM distributors d
        WHERE d.auth_user_id = auth.uid()
        AND d.tech_rank = ANY(visible_to_ranks)
      )
    )
  );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get upcoming events
CREATE OR REPLACE FUNCTION get_upcoming_events(days_ahead INTEGER DEFAULT 90)
RETURNS TABLE (
  id UUID,
  event_name TEXT,
  event_date_time TIMESTAMPTZ,
  location_type TEXT,
  venue_name TEXT,
  total_invitations_sent INTEGER,
  total_rsvps_yes INTEGER,
  current_attendees INTEGER,
  max_attendees INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.event_name,
    e.event_date_time,
    e.location_type,
    e.venue_name,
    e.total_invitations_sent,
    e.total_rsvps_yes,
    e.current_attendees,
    e.max_attendees
  FROM company_events e
  WHERE e.status IN ('active', 'full')
    AND e.event_date_time >= NOW()
    AND e.event_date_time <= NOW() + (days_ahead || ' days')::INTERVAL
    AND e.is_public = TRUE
  ORDER BY e.event_date_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if event has capacity
CREATE OR REPLACE FUNCTION has_event_capacity(event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  event_record RECORD;
BEGIN
  SELECT max_attendees, current_attendees
  INTO event_record
  FROM company_events
  WHERE id = event_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- If no max attendees, always has capacity
  IF event_record.max_attendees IS NULL OR event_record.max_attendees = 0 THEN
    RETURN TRUE;
  END IF;

  -- Check if under capacity
  RETURN event_record.current_attendees < event_record.max_attendees;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL DATA (OPTIONAL)
-- Create a sample event for testing
-- =============================================

-- Uncomment to create sample event:
-- INSERT INTO company_events (
--   event_name,
--   event_type,
--   event_description,
--   event_date_time,
--   location_type,
--   venue_name,
--   status,
--   is_featured,
--   invitation_template
-- ) VALUES (
--   'Spring Product Launch 2026',
--   'product_launch',
--   'Join us for the exciting launch of our new product line! Be among the first to see revolutionary new offerings.',
--   NOW() + INTERVAL '30 days',
--   'hybrid',
--   'Dallas Convention Center',
--   'active',
--   TRUE,
--   'You''re invited to our exclusive Spring Product Launch! Join us to discover game-changing products that will transform your business. This is a can''t-miss event!'
-- );

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON SCHEMA public IS 'Company Events System - Admin-managed events for rep invitations';
