-- =============================================
-- Migration: Add Attendance Tracking to Meeting Invitations
-- Date: 2026-03-19
-- Purpose: Track when invitees view the entrance page and attend meetings
-- =============================================

-- Add attendance tracking columns to meeting_invitations table
ALTER TABLE meeting_invitations
ADD COLUMN IF NOT EXISTS entrance_page_viewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS entrance_page_viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS attended_at TIMESTAMPTZ;

-- Add index for querying attended invitations
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_attended
ON meeting_invitations(attended, attended_at DESC);

-- Add index for querying entrance page views
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_entrance_viewed
ON meeting_invitations(entrance_page_viewed, entrance_page_viewed_at DESC);

-- Add comment to document the new columns
COMMENT ON COLUMN meeting_invitations.entrance_page_viewed IS 'Whether the invitee viewed the /live/[id] entrance page';
COMMENT ON COLUMN meeting_invitations.entrance_page_viewed_at IS 'Timestamp when the invitee first viewed the entrance page';
COMMENT ON COLUMN meeting_invitations.attended IS 'Whether the invitee clicked "Enter Room" to attend the meeting';
COMMENT ON COLUMN meeting_invitations.attended_at IS 'Timestamp when the invitee clicked "Enter Room" to attend';
