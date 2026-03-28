-- =============================================
-- SUPPORT TICKET SYSTEM
-- =============================================
-- Orphaned Page Fix: Support ticket tracking
-- Allows distributors to submit support requests
-- =============================================

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ticket details
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ticket_type VARCHAR(50) NOT NULL, -- bug, question, feedback, other
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(20) NOT NULL DEFAULT 'open', -- open, in_progress, waiting_response, resolved, closed

  -- User information
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Resolution
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metadata
  tags TEXT[],
  category VARCHAR(100),
  browser_info JSONB,
  device_info JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_response_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- =============================================
-- TICKET ATTACHMENTS
-- =============================================

CREATE TABLE IF NOT EXISTS support_ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  -- File information
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),

  -- Storage
  storage_bucket VARCHAR(100) DEFAULT 'support-attachments',
  storage_path TEXT,

  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TICKET RESPONSES
-- =============================================

CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  -- Response content
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false, -- Internal notes vs customer-facing responses

  -- Author information
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_email VARCHAR(255) NOT NULL,
  author_name VARCHAR(255),
  is_staff BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Support tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user
  ON support_tickets(user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON support_tickets(status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned
  ON support_tickets(assigned_to)
  WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_support_tickets_created
  ON support_tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_number
  ON support_tickets(ticket_number);

CREATE INDEX IF NOT EXISTS idx_support_tickets_search
  ON support_tickets USING gin(to_tsvector('english', subject || ' ' || description));

-- Attachments
CREATE INDEX IF NOT EXISTS idx_support_attachments_ticket
  ON support_ticket_attachments(ticket_id);

-- Responses
CREATE INDEX IF NOT EXISTS idx_support_responses_ticket
  ON support_ticket_responses(ticket_id, created_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_responses_updated_at
  BEFORE UPDATE ON support_ticket_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  v_number VARCHAR(20);
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate format: TICK-YYYYMMDD-XXXX
    v_number := 'TICK-' ||
                TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM support_tickets WHERE ticket_number = v_number) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_support_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Function to update last_response_at
CREATE OR REPLACE FUNCTION update_ticket_last_response()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_tickets
  SET last_response_at = NOW()
  WHERE id = NEW.ticket_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_last_response_trigger
  AFTER INSERT ON support_ticket_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_last_response();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_responses ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own tickets (subject/description only)
CREATE POLICY "Users can update own tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

-- Admins can update all tickets
CREATE POLICY "Admins can update all tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

-- Attachments policies
CREATE POLICY "Users can view attachments for their tickets"
  ON support_ticket_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all attachments"
  ON support_ticket_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

CREATE POLICY "Users can add attachments to their tickets"
  ON support_ticket_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Responses policies
CREATE POLICY "Users can view responses on their tickets"
  ON support_ticket_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
    AND is_internal = false
  );

CREATE POLICY "Admins can view all responses"
  ON support_ticket_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

CREATE POLICY "Users can add responses to their tickets"
  ON support_ticket_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
    AND is_staff = false
    AND is_internal = false
  );

CREATE POLICY "Admins can add responses to any ticket"
  ON support_ticket_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

-- Service role can do everything
GRANT ALL ON support_tickets TO service_role;
GRANT ALL ON support_ticket_attachments TO service_role;
GRANT ALL ON support_ticket_responses TO service_role;

-- Comment on tables
COMMENT ON TABLE support_tickets IS 'Support ticket system for distributor help requests';
COMMENT ON TABLE support_ticket_attachments IS 'File attachments for support tickets';
COMMENT ON TABLE support_ticket_responses IS 'Responses and notes on support tickets';
