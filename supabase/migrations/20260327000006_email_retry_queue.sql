-- =============================================
-- EMAIL RETRY QUEUE
-- =============================================
-- Security Fix #8: Email send rollback and retry
-- Ensures database consistency when email sending fails
-- =============================================

-- Create email retry queue table
CREATE TABLE IF NOT EXISTS email_retry_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email details
  email_type VARCHAR(50) NOT NULL, -- e.g., 'invitation', 'password_reset', 'notification'
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),

  -- Email content
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,

  -- Metadata
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  reply_to VARCHAR(255),

  -- Related entity (optional)
  entity_type VARCHAR(50), -- e.g., 'invitation', 'order', 'event'
  entity_id UUID,

  -- Retry tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed', 'abandoned'
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ,

  -- Error tracking
  last_error TEXT,
  error_history JSONB DEFAULT '[]',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ
);

-- =============================================
-- INDEXES
-- =============================================

-- Query by status
CREATE INDEX IF NOT EXISTS idx_email_retry_queue_status
  ON email_retry_queue(status);

-- Query by next retry time
CREATE INDEX IF NOT EXISTS idx_email_retry_queue_next_retry
  ON email_retry_queue(next_retry_at)
  WHERE status = 'pending';

-- Query by entity
CREATE INDEX IF NOT EXISTS idx_email_retry_queue_entity
  ON email_retry_queue(entity_type, entity_id);

-- Query by recipient
CREATE INDEX IF NOT EXISTS idx_email_retry_queue_recipient
  ON email_retry_queue(recipient_email);

-- Query by created time
CREATE INDEX IF NOT EXISTS idx_email_retry_queue_created
  ON email_retry_queue(created_at DESC);

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_email_retry_queue_updated_at
  BEFORE UPDATE ON email_retry_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE email_retry_queue ENABLE ROW LEVEL SECURITY;

-- Admins can view retry queue
CREATE POLICY "Admins can view email retry queue"
  ON email_retry_queue
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

-- Service role can do everything
GRANT ALL ON email_retry_queue TO service_role;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get pending emails ready for retry
CREATE OR REPLACE FUNCTION get_pending_email_retries(batch_size INTEGER DEFAULT 10)
RETURNS SETOF email_retry_queue AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM email_retry_queue
  WHERE status = 'pending'
  AND retry_count < max_retries
  AND (next_retry_at IS NULL OR next_retry_at <= NOW())
  ORDER BY created_at ASC
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment retry count with exponential backoff
CREATE OR REPLACE FUNCTION increment_email_retry(
  p_email_id UUID,
  p_error_message TEXT
)
RETURNS VOID AS $$
DECLARE
  v_retry_count INTEGER;
  v_next_retry TIMESTAMPTZ;
BEGIN
  -- Get current retry count
  SELECT retry_count INTO v_retry_count
  FROM email_retry_queue
  WHERE id = p_email_id;

  -- Calculate next retry time with exponential backoff
  -- 1st retry: 5 minutes
  -- 2nd retry: 15 minutes
  -- 3rd retry: 1 hour
  v_next_retry := NOW() +
    CASE v_retry_count
      WHEN 0 THEN INTERVAL '5 minutes'
      WHEN 1 THEN INTERVAL '15 minutes'
      ELSE INTERVAL '1 hour'
    END;

  -- Update email retry record
  UPDATE email_retry_queue
  SET
    retry_count = retry_count + 1,
    next_retry_at = v_next_retry,
    last_error = p_error_message,
    error_history = error_history || jsonb_build_object(
      'attempt', retry_count + 1,
      'error', p_error_message,
      'timestamp', NOW()
    ),
    status = CASE
      WHEN retry_count + 1 >= max_retries THEN 'abandoned'
      ELSE 'pending'
    END,
    abandoned_at = CASE
      WHEN retry_count + 1 >= max_retries THEN NOW()
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE id = p_email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark email as sent
CREATE OR REPLACE FUNCTION mark_email_sent(p_email_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE email_retry_queue
  SET
    status = 'sent',
    sent_at = NOW(),
    updated_at = NOW()
  WHERE id = p_email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on functions
COMMENT ON FUNCTION get_pending_email_retries IS 'Get batch of emails ready for retry';
COMMENT ON FUNCTION increment_email_retry IS 'Increment retry count with exponential backoff';
COMMENT ON FUNCTION mark_email_sent IS 'Mark email as successfully sent';

-- =============================================
-- ADD STATUS TRACKING TO INVITATIONS
-- =============================================

-- Add email_status column to invitations table if table exists
DO $$
BEGIN
  -- Check if invitations table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'invitations'
  ) THEN
    -- Add email tracking columns if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'invitations' AND column_name = 'email_status'
    ) THEN
      ALTER TABLE invitations ADD COLUMN email_status VARCHAR(20) DEFAULT 'pending';
      ALTER TABLE invitations ADD COLUMN email_sent_at TIMESTAMPTZ;
      ALTER TABLE invitations ADD COLUMN email_error TEXT;

      -- Create index
      CREATE INDEX IF NOT EXISTS idx_invitations_email_status
        ON invitations(email_status);
    END IF;
  END IF;
END $$;
