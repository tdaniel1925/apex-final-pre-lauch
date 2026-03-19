-- =============================================
-- FIX COMPANY EVENTS RLS POLICY
-- Add WITH CHECK clause for inserts
-- =============================================
-- Migration: 20260319000011
-- Created: 2026-03-19
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage all events" ON company_events;

-- Recreate with WITH CHECK clause
CREATE POLICY "Admins can manage all events"
  ON company_events FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );
