-- =============================================
-- AI PHONE PROVISIONING FIELDS
-- Add fields to track AI assistant and phone number for each distributor
-- =============================================
-- Migration: 20260323000001
-- Created: 2026-03-23
-- =============================================

-- Add AI phone and VAPI assistant fields to distributors table
ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS ai_phone_number TEXT,
  ADD COLUMN IF NOT EXISTS ai_phone_number_sid TEXT,
  ADD COLUMN IF NOT EXISTS vapi_assistant_id TEXT,
  ADD COLUMN IF NOT EXISTS vapi_phone_number_id TEXT,
  ADD COLUMN IF NOT EXISTS ai_minutes_balance INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS ai_trial_expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  ADD COLUMN IF NOT EXISTS ai_provisioned_at TIMESTAMPTZ;

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_distributors_ai_phone
  ON distributors(ai_phone_number) WHERE ai_phone_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_distributors_vapi_assistant
  ON distributors(vapi_assistant_id) WHERE vapi_assistant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_distributors_ai_trial_expires
  ON distributors(ai_trial_expires_at) WHERE ai_trial_expires_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN distributors.ai_phone_number IS 'E.164 formatted phone number for distributor AI assistant (e.g., +12145551234)';
COMMENT ON COLUMN distributors.ai_phone_number_sid IS 'Twilio phone number SID for management';
COMMENT ON COLUMN distributors.vapi_assistant_id IS 'VAPI assistant ID for voice AI';
COMMENT ON COLUMN distributors.vapi_phone_number_id IS 'VAPI phone number ID linking assistant to Twilio number';
COMMENT ON COLUMN distributors.ai_minutes_balance IS 'Remaining free AI minutes (starts at 20 for new signups)';
COMMENT ON COLUMN distributors.ai_trial_expires_at IS 'When the free 24-hour AI trial expires';
COMMENT ON COLUMN distributors.ai_provisioned_at IS 'When the AI phone number was provisioned';

-- =============================================
-- AI CALL LOGS
-- Track all AI phone calls for analytics and billing
-- =============================================

CREATE TABLE IF NOT EXISTS ai_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Call details
  vapi_call_id TEXT,
  caller_number TEXT,
  ai_phone_number TEXT NOT NULL,

  -- Call metadata
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  -- Transcription and analysis
  transcript TEXT,
  call_summary TEXT,
  lead_quality TEXT CHECK (lead_quality IN ('hot', 'warm', 'cold', 'spam')),

  -- Billing
  minutes_charged DECIMAL(10, 2),
  cost_usd DECIMAL(10, 4),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for call logs
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_distributor
  ON ai_call_logs(distributor_id);

CREATE INDEX IF NOT EXISTS idx_ai_call_logs_started_at
  ON ai_call_logs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_call_logs_lead_quality
  ON ai_call_logs(lead_quality) WHERE lead_quality IS NOT NULL;

-- Add RLS policy for call logs
ALTER TABLE ai_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Distributors can view their own call logs"
  ON ai_call_logs
  FOR SELECT
  USING (
    distributor_id = auth.uid()::uuid
    OR
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.id = auth.uid()::uuid
      AND distributors.is_admin = TRUE
    )
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to check if AI trial is active
CREATE OR REPLACE FUNCTION is_ai_trial_active(distributor_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_expires TIMESTAMPTZ;
  minutes_remaining INTEGER;
BEGIN
  SELECT ai_trial_expires_at, ai_minutes_balance
  INTO trial_expires, minutes_remaining
  FROM distributors
  WHERE id = distributor_id_param;

  -- Trial is active if:
  -- 1. Trial hasn't expired yet AND
  -- 2. Minutes balance > 0
  RETURN (trial_expires > NOW() AND minutes_remaining > 0);
END;
$$;

-- Function to deduct AI minutes
CREATE OR REPLACE FUNCTION deduct_ai_minutes(
  distributor_id_param UUID,
  minutes_used DECIMAL(10, 2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT ai_minutes_balance INTO current_balance
  FROM distributors
  WHERE id = distributor_id_param
  FOR UPDATE;

  -- Check if enough minutes
  IF current_balance < minutes_used THEN
    RETURN FALSE;
  END IF;

  -- Deduct minutes
  UPDATE distributors
  SET ai_minutes_balance = ai_minutes_balance - CEIL(minutes_used)
  WHERE id = distributor_id_param;

  RETURN TRUE;
END;
$$;

-- =============================================
-- GRANTS
-- =============================================

GRANT EXECUTE ON FUNCTION is_ai_trial_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_ai_minutes(UUID, DECIMAL) TO authenticated;
