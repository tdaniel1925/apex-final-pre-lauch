-- Business Center Nurture Campaign
-- Automated email sequence for trial users

-- Table to track scheduled nurture emails
CREATE TABLE IF NOT EXISTS business_center_nurture_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  email_day INTEGER NOT NULL, -- 1, 3, 7, 10, 12, 13, 15
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  email_id TEXT, -- Resend email ID
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, sent, failed, cancelled
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(distributor_id, email_day)
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_nurture_scheduled
  ON business_center_nurture_emails(scheduled_for, status)
  WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_nurture_distributor
  ON business_center_nurture_emails(distributor_id);

-- Function to schedule nurture emails when trial is granted
CREATE OR REPLACE FUNCTION schedule_business_center_nurture_emails()
RETURNS TRIGGER AS $$
DECLARE
  trial_start TIMESTAMPTZ;
BEGIN
  -- Only schedule if this is a trial grant for Business Center
  IF NEW.is_trial = TRUE THEN
    trial_start := NEW.granted_at;

    -- Schedule all 7 emails
    INSERT INTO business_center_nurture_emails (distributor_id, email_day, scheduled_for, status)
    VALUES
      (NEW.distributor_id, 1, trial_start + INTERVAL '1 day', 'scheduled'),
      (NEW.distributor_id, 3, trial_start + INTERVAL '3 days', 'scheduled'),
      (NEW.distributor_id, 7, trial_start + INTERVAL '7 days', 'scheduled'),
      (NEW.distributor_id, 10, trial_start + INTERVAL '10 days', 'scheduled'),
      (NEW.distributor_id, 12, trial_start + INTERVAL '12 days', 'scheduled'),
      (NEW.distributor_id, 13, trial_start + INTERVAL '13 days', 'scheduled'),
      (NEW.distributor_id, 15, trial_start + INTERVAL '15 days', 'scheduled')
    ON CONFLICT (distributor_id, email_day) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-schedule nurture emails when trial is granted
DROP TRIGGER IF EXISTS schedule_nurture_on_trial_grant ON service_access;
CREATE TRIGGER schedule_nurture_on_trial_grant
  AFTER INSERT ON service_access
  FOR EACH ROW
  WHEN (NEW.is_trial = TRUE)
  EXECUTE FUNCTION schedule_business_center_nurture_emails();

-- Function to cancel nurture emails if user subscribes
CREATE OR REPLACE FUNCTION cancel_nurture_on_subscribe()
RETURNS TRIGGER AS $$
BEGIN
  -- If user subscribed (no longer trial), cancel remaining emails
  IF OLD.is_trial = TRUE AND NEW.is_trial = FALSE THEN
    UPDATE business_center_nurture_emails
    SET status = 'cancelled', updated_at = NOW()
    WHERE distributor_id = NEW.distributor_id
      AND status = 'scheduled'
      AND scheduled_for > NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cancel emails when user subscribes
DROP TRIGGER IF EXISTS cancel_nurture_on_subscribe ON service_access;
CREATE TRIGGER cancel_nurture_on_subscribe
  AFTER UPDATE ON service_access
  FOR EACH ROW
  WHEN (OLD.is_trial = TRUE AND NEW.is_trial = FALSE)
  EXECUTE FUNCTION cancel_nurture_on_subscribe();

-- Enable RLS
ALTER TABLE business_center_nurture_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all (for cron job)
CREATE POLICY service_role_nurture_emails ON business_center_nurture_emails
  FOR ALL USING (true);

COMMENT ON TABLE business_center_nurture_emails IS 'Tracks automated nurture email sequence for Business Center trial users';
COMMENT ON COLUMN business_center_nurture_emails.email_day IS 'Which email in the sequence (1, 3, 7, 10, 12, 13, 15)';
COMMENT ON COLUMN business_center_nurture_emails.scheduled_for IS 'When this email should be sent';
COMMENT ON COLUMN business_center_nurture_emails.sent_at IS 'When this email was actually sent';
COMMENT ON COLUMN business_center_nurture_emails.status IS 'scheduled, sent, failed, cancelled';
