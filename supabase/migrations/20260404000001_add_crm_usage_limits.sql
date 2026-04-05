-- ============================================
-- CRM Usage Limits System
-- Track CRM usage (leads, contacts, tasks) and enforce limits for free users
-- Business Center subscribers get unlimited access
-- ============================================

-- Add usage count columns to distributors table
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS crm_leads_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crm_contacts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crm_tasks_count INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_distributors_crm_counts ON distributors(id, crm_leads_count, crm_contacts_count, crm_tasks_count);

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

-- ============================================
-- COMPLETE
-- ============================================
-- CRM usage tracking system installed successfully
-- Limits enforced in application code via lib/subscription/crm-limits.ts
