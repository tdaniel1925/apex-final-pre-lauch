-- =============================================
-- FIX PARTIAL MIGRATIONS
-- Drop tables that were partially created from old migration attempts
-- This allows the new migrations to create them properly
-- =============================================
-- Migration: 20260221000001
-- Created: 2026-02-21
-- =============================================

-- Drop email_campaigns if it exists (will be recreated properly in 002)
DROP TABLE IF EXISTS email_campaigns CASCADE;

-- Drop campaign_emails_sent if it exists
DROP TABLE IF EXISTS campaign_emails_sent CASCADE;

-- Drop email_sequence_templates if it exists (from old nurture migration)
-- Will be recreated properly in migration 002
DROP TABLE IF EXISTS email_sequence_templates CASCADE;
