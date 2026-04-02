-- =============================================
-- ADD FULFILLMENT TRACKING
-- Add fulfillment_stage and calendar_event_id to onboarding_sessions
-- =============================================
-- Migration: 20260402000009
-- Created: 2026-04-02
-- =============================================

-- Add fulfillment tracking fields to onboarding_sessions table
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_fulfillment_stage
  ON onboarding_sessions(fulfillment_stage);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_calendar_event
  ON onboarding_sessions(calendar_event_id);

-- Add comments
COMMENT ON COLUMN onboarding_sessions.fulfillment_stage IS 'Current stage in the fulfillment pipeline';
COMMENT ON COLUMN onboarding_sessions.calendar_event_id IS 'Cal.com event ID for tracking';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
