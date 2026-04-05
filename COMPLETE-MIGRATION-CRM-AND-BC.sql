-- ============================================================================
-- COMPLETE MIGRATION: CRM System + Business Center Sprint 1
-- Apply this ENTIRE file in Supabase SQL Editor in ONE execution
-- https://supabase.com/dashboard/project/brejvdvzwshroxkkhmzy/sql/new
-- ============================================================================
--
-- This file combines:
-- 1. CRM System tables (if they don't exist)
-- 2. Business Center Sprint 1 optimizations (usage limits + nurture campaign update)
--
-- Safe to run multiple times - uses CREATE IF NOT EXISTS and CREATE OR REPLACE
-- ============================================================================

-- ============================================================================
-- PART 1: CRM SYSTEM TABLES
-- ============================================================================

-- TABLE 1: crm_leads
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost')),
  source TEXT CHECK (source IN ('website', 'referral', 'social_media', 'event', 'cold_call', 'email_campaign', 'other')),
  interest_level TEXT CHECK (interest_level IN ('low', 'medium', 'high')),
  notes TEXT,
  tags TEXT[],
  converted_to_contact_id UUID,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE 2: crm_contacts
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  contact_type TEXT DEFAULT 'customer' CHECK (contact_type IN ('customer', 'prospect', 'partner', 'vendor')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[],
  original_lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  original_source TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE 3: crm_activities
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'task_completed')),
  subject TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  outcome TEXT CHECK (outcome IN ('successful', 'no_answer', 'voicemail', 'scheduled_followup', 'not_interested')),
  activity_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE 4: crm_tasks
CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to existing tables (if they exist but are incomplete)
DO $$
BEGIN
  -- Add status column to crm_contacts if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crm_contacts') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'status') THEN
      ALTER TABLE crm_contacts ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'));
    END IF;
  END IF;

  -- Add status column to crm_leads if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crm_leads') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_leads' AND column_name = 'status') THEN
      ALTER TABLE crm_leads ADD COLUMN status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'));
    END IF;
  END IF;

  -- Add status column to crm_tasks if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crm_tasks') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_tasks' AND column_name = 'status') THEN
      ALTER TABLE crm_tasks ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));
    END IF;
  END IF;
END $$;

-- Create indexes (safe - IF NOT EXISTS)
DO $$
BEGIN
  -- crm_leads indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_crm_leads_distributor') THEN
    CREATE INDEX idx_crm_leads_distributor ON crm_leads(distributor_id);
  END IF;

  -- Only create status index if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_leads' AND column_name = 'status') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_crm_leads_status') THEN
      CREATE INDEX idx_crm_leads_status ON crm_leads(status);
    END IF;
  END IF;

  -- crm_contacts indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_crm_contacts_distributor') THEN
    CREATE INDEX idx_crm_contacts_distributor ON crm_contacts(distributor_id);
  END IF;

  -- Only create status index if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'status') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_crm_contacts_status') THEN
      CREATE INDEX idx_crm_contacts_status ON crm_contacts(status);
    END IF;
  END IF;

  -- crm_activities indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_crm_activities_distributor') THEN
    CREATE INDEX idx_crm_activities_distributor ON crm_activities(distributor_id);
  END IF;

  -- crm_tasks indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_crm_tasks_distributor') THEN
    CREATE INDEX idx_crm_tasks_distributor ON crm_tasks(distributor_id);
  END IF;

  -- Only create status index if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_tasks' AND column_name = 'status') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_crm_tasks_status') THEN
      CREATE INDEX idx_crm_tasks_status ON crm_tasks(status);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- PART 2: BUSINESS CENTER - CRM USAGE LIMITS
-- ============================================================================

-- Add usage count columns to distributors table
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS crm_leads_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crm_contacts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crm_tasks_count INTEGER DEFAULT 0;

-- Create index for faster queries
DROP INDEX IF EXISTS idx_distributors_crm_counts;
CREATE INDEX idx_distributors_crm_counts ON distributors(id, crm_leads_count, crm_contacts_count, crm_tasks_count);

-- Function: Update leads count
CREATE OR REPLACE FUNCTION update_crm_leads_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE distributors
    SET crm_leads_count = crm_leads_count + 1
    WHERE id = NEW.distributor_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE distributors
    SET crm_leads_count = GREATEST(0, crm_leads_count - 1)
    WHERE id = OLD.distributor_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update contacts count
CREATE OR REPLACE FUNCTION update_crm_contacts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE distributors
    SET crm_contacts_count = crm_contacts_count + 1
    WHERE id = NEW.distributor_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE distributors
    SET crm_contacts_count = GREATEST(0, crm_contacts_count - 1)
    WHERE id = OLD.distributor_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update tasks count
CREATE OR REPLACE FUNCTION update_crm_tasks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE distributors
    SET crm_tasks_count = crm_tasks_count + 1
    WHERE id = NEW.distributor_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE distributors
    SET crm_tasks_count = GREATEST(0, crm_tasks_count - 1)
    WHERE id = OLD.distributor_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS trigger_update_crm_leads_count ON crm_leads;
DROP TRIGGER IF EXISTS trigger_update_crm_contacts_count ON crm_contacts;
DROP TRIGGER IF EXISTS trigger_update_crm_tasks_count ON crm_tasks;

CREATE TRIGGER trigger_update_crm_leads_count
AFTER INSERT OR DELETE ON crm_leads
FOR EACH ROW
EXECUTE FUNCTION update_crm_leads_count();

CREATE TRIGGER trigger_update_crm_contacts_count
AFTER INSERT OR DELETE ON crm_contacts
FOR EACH ROW
EXECUTE FUNCTION update_crm_contacts_count();

CREATE TRIGGER trigger_update_crm_tasks_count
AFTER INSERT OR DELETE ON crm_tasks
FOR EACH ROW
EXECUTE FUNCTION update_crm_tasks_count();

-- Initialize counts for existing distributors
UPDATE distributors d
SET crm_leads_count = (SELECT COUNT(*) FROM crm_leads l WHERE l.distributor_id = d.id);

UPDATE distributors d
SET crm_contacts_count = (SELECT COUNT(*) FROM crm_contacts c WHERE c.distributor_id = d.id);

UPDATE distributors d
SET crm_tasks_count = (SELECT COUNT(*) FROM crm_tasks t WHERE t.distributor_id = d.id);

-- ============================================================================
-- PART 3: BUSINESS CENTER - NURTURE CAMPAIGN LIMIT UPDATE (1 → 3)
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
  SELECT business_center INTO v_has_business_center
  FROM distributors
  WHERE id = p_distributor_id;

  SELECT COUNT(*) INTO v_active_campaigns
  FROM nurture_campaigns
  WHERE distributor_id = p_distributor_id
    AND campaign_status IN ('active', 'paused');

  IF v_has_business_center THEN
    v_result := jsonb_build_object(
      'can_create', true,
      'limit', -1,
      'current', v_active_campaigns,
      'reason', 'unlimited_business_center'
    );
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
-- ✅ CRM tables created (if they didn't exist)
-- ✅ CRM usage tracking enabled with automatic counts
-- ✅ Nurture campaign limit updated to 3 for free users
-- ✅ All triggers and functions installed
-- ============================================================================
