-- ============================================================================
-- BUSINESS CENTER SPRINT 1 - MIGRATIONS
-- Apply these migrations in Supabase SQL Editor
-- https://supabase.com/dashboard/project/brejvdvzwshroxkkhmzy/sql/new
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Add CRM Usage Limits
-- File: supabase/migrations/20260404000001_add_crm_usage_limits.sql
-- ============================================================================

-- Add usage count columns to distributors table
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS crm_leads_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crm_contacts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crm_tasks_count INTEGER DEFAULT 0;

-- Create index for faster queries (drop first if exists to avoid conflicts)
DROP INDEX IF EXISTS idx_distributors_crm_counts;
CREATE INDEX idx_distributors_crm_counts ON distributors(id, crm_leads_count, crm_contacts_count, crm_tasks_count);

-- ============================================
-- Function: Update leads count
-- ============================================
CREATE OR REPLACE FUNCTION update_crm_leads_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count on insert
    UPDATE distributors
    SET crm_leads_count = crm_leads_count + 1
    WHERE id = NEW.distributor_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count on delete
    UPDATE distributors
    SET crm_leads_count = GREATEST(0, crm_leads_count - 1)
    WHERE id = OLD.distributor_id;

  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Update contacts count
-- ============================================
CREATE OR REPLACE FUNCTION update_crm_contacts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count on insert
    UPDATE distributors
    SET crm_contacts_count = crm_contacts_count + 1
    WHERE id = NEW.distributor_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count on delete
    UPDATE distributors
    SET crm_contacts_count = GREATEST(0, crm_contacts_count - 1)
    WHERE id = OLD.distributor_id;

  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Update tasks count
-- ============================================
CREATE OR REPLACE FUNCTION update_crm_tasks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count on insert
    UPDATE distributors
    SET crm_tasks_count = crm_tasks_count + 1
    WHERE id = NEW.distributor_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count on delete
    UPDATE distributors
    SET crm_tasks_count = GREATEST(0, crm_tasks_count - 1)
    WHERE id = OLD.distributor_id;

  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create Triggers
-- ============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_crm_leads_count ON crm_leads;
DROP TRIGGER IF EXISTS trigger_update_crm_contacts_count ON crm_contacts;
DROP TRIGGER IF EXISTS trigger_update_crm_tasks_count ON crm_tasks;

-- Leads trigger
CREATE TRIGGER trigger_update_crm_leads_count
AFTER INSERT OR DELETE ON crm_leads
FOR EACH ROW
EXECUTE FUNCTION update_crm_leads_count();

-- Contacts trigger
CREATE TRIGGER trigger_update_crm_contacts_count
AFTER INSERT OR DELETE ON crm_contacts
FOR EACH ROW
EXECUTE FUNCTION update_crm_contacts_count();

-- Tasks trigger
CREATE TRIGGER trigger_update_crm_tasks_count
AFTER INSERT OR DELETE ON crm_tasks
FOR EACH ROW
EXECUTE FUNCTION update_crm_tasks_count();

-- ============================================
-- Initialize counts for existing distributors
-- ============================================

-- Update leads count
UPDATE distributors d
SET crm_leads_count = (
  SELECT COUNT(*)
  FROM crm_leads l
  WHERE l.distributor_id = d.id
);

-- Update contacts count
UPDATE distributors d
SET crm_contacts_count = (
  SELECT COUNT(*)
  FROM crm_contacts c
  WHERE c.distributor_id = d.id
);

-- Update tasks count
UPDATE distributors d
SET crm_tasks_count = (
  SELECT COUNT(*)
  FROM crm_tasks t
  WHERE t.distributor_id = d.id
);

-- ============================================================================
-- MIGRATION 2: Update Nurture Campaign Limit (1 → 3)
-- File: supabase/migrations/20260404000002_update_nurture_campaign_limit.sql
-- ============================================================================

CREATE OR REPLACE FUNCTION check_campaign_limit(p_distributor_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_business_center boolean;
  v_active_campaigns integer;
  v_result jsonb;
BEGIN
  -- Check if user has Business Center subscription
  SELECT business_center INTO v_has_business_center
  FROM distributors
  WHERE id = p_distributor_id;

  -- Count active campaigns (not completed/cancelled)
  SELECT COUNT(*) INTO v_active_campaigns
  FROM nurture_campaigns
  WHERE distributor_id = p_distributor_id
    AND campaign_status IN ('active', 'paused');

  -- Business Center users = unlimited
  IF v_has_business_center THEN
    v_result := jsonb_build_object(
      'can_create', true,
      'limit', -1,
      'current', v_active_campaigns,
      'reason', 'unlimited_business_center'
    );
  -- Free users = 3 campaigns max (updated from 1)
  ELSIF v_active_campaigns < 3 THEN
    v_result := jsonb_build_object(
      'can_create', true,
      'limit', 3,
      'current', v_active_campaigns,
      'reason', 'within_free_limit'
    );
  ELSE
    v_result := jsonb_build_object(
      'can_create', false,
      'limit', 3,
      'current', v_active_campaigns,
      'reason', 'free_limit_reached'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- COMPLETE!
-- ============================================================================
-- Both migrations applied successfully
-- CRM usage tracking is now active
-- Nurture campaign limit updated to 3 for free users
-- ============================================================================
