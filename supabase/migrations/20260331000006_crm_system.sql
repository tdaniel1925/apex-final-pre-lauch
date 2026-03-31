-- =============================================
-- MIGRATION: CRM System - Complete Schema
-- Date: 2026-03-31
-- Priority: HIGH (Wave 8 - Agents 15-17)
-- =============================================
--
-- PURPOSE: Create all tables needed for the CRM system:
-- - Leads (prospects not yet customers)
-- - Contacts (converted leads or existing customers)
-- - Activities (calls, emails, meetings, notes)
-- - Tasks (to-do items linked to leads/contacts)
--
-- TABLES CREATED:
-- 1. crm_leads - New leads/prospects
-- 2. crm_contacts - Converted leads or existing customers
-- 3. crm_activities - Interaction history (calls, emails, meetings, notes)
-- 4. crm_tasks - To-do items and follow-ups
--
-- =============================================

-- =============================================
-- TABLE 1: crm_leads
-- =============================================
-- Purpose: Track new leads/prospects before they become customers

CREATE TABLE IF NOT EXISTS crm_leads (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor Reference (who owns this lead)
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Lead Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,

  -- Lead Status
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new',
    'contacted',
    'qualified',
    'unqualified',
    'converted',
    'lost'
  )),

  -- Lead Source
  source TEXT CHECK (source IN (
    'website',
    'referral',
    'social_media',
    'event',
    'cold_call',
    'email_campaign',
    'other'
  )),

  -- Qualification
  interest_level TEXT CHECK (interest_level IN (
    'low',
    'medium',
    'high'
  )),

  -- Notes
  notes TEXT,

  -- Tags (searchable keywords)
  tags TEXT[],

  -- Conversion tracking
  converted_to_contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for crm_leads
CREATE INDEX idx_crm_leads_distributor ON crm_leads(distributor_id);
CREATE INDEX idx_crm_leads_status ON crm_leads(status);
CREATE INDEX idx_crm_leads_source ON crm_leads(source);
CREATE INDEX idx_crm_leads_email ON crm_leads(email) WHERE email IS NOT NULL;
CREATE INDEX idx_crm_leads_phone ON crm_leads(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_crm_leads_created ON crm_leads(created_at DESC);
CREATE INDEX idx_crm_leads_interest ON crm_leads(interest_level);
CREATE INDEX idx_crm_leads_tags ON crm_leads USING gin(tags);

-- Updated_at trigger
CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE crm_leads IS 'CRM leads - prospects not yet customers';
COMMENT ON COLUMN crm_leads.status IS 'Lead status: new, contacted, qualified, unqualified, converted, lost';
COMMENT ON COLUMN crm_leads.source IS 'How the lead was acquired';
COMMENT ON COLUMN crm_leads.interest_level IS 'Qualification level: low, medium, high';
COMMENT ON COLUMN crm_leads.tags IS 'Searchable tags for categorization';

-- =============================================
-- TABLE 2: crm_contacts
-- =============================================
-- Purpose: Track converted leads or existing customers

CREATE TABLE IF NOT EXISTS crm_contacts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor Reference (who owns this contact)
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Contact Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,

  -- Contact Type
  contact_type TEXT DEFAULT 'customer' CHECK (contact_type IN (
    'customer',
    'prospect',
    'partner',
    'vendor'
  )),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active',
    'inactive',
    'archived'
  )),

  -- Customer Value
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  -- Tags (searchable keywords)
  tags TEXT[],

  -- Source (if converted from lead)
  original_lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  original_source TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for crm_contacts
CREATE INDEX idx_crm_contacts_distributor ON crm_contacts(distributor_id);
CREATE INDEX idx_crm_contacts_type ON crm_contacts(contact_type);
CREATE INDEX idx_crm_contacts_status ON crm_contacts(status);
CREATE INDEX idx_crm_contacts_email ON crm_contacts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_crm_contacts_phone ON crm_contacts(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_crm_contacts_created ON crm_contacts(created_at DESC);
CREATE INDEX idx_crm_contacts_tags ON crm_contacts USING gin(tags);
CREATE INDEX idx_crm_contacts_original_lead ON crm_contacts(original_lead_id) WHERE original_lead_id IS NOT NULL;

-- Updated_at trigger
CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE crm_contacts IS 'CRM contacts - converted leads or existing customers';
COMMENT ON COLUMN crm_contacts.contact_type IS 'Type of contact: customer, prospect, partner, vendor';
COMMENT ON COLUMN crm_contacts.status IS 'Contact status: active, inactive, archived';
COMMENT ON COLUMN crm_contacts.lifetime_value IS 'Total revenue from this contact';
COMMENT ON COLUMN crm_contacts.original_lead_id IS 'Reference to lead if converted';

-- =============================================
-- TABLE 3: crm_activities
-- =============================================
-- Purpose: Log all interactions with leads and contacts

CREATE TABLE IF NOT EXISTS crm_activities (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor Reference (who performed this activity)
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Related Entity (lead OR contact, never both)
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  CONSTRAINT crm_activities_entity_check CHECK (
    (lead_id IS NOT NULL AND contact_id IS NULL) OR
    (lead_id IS NULL AND contact_id IS NOT NULL)
  ),

  -- Activity Type
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'call',
    'email',
    'meeting',
    'note',
    'task_completed'
  )),

  -- Activity Details
  subject TEXT NOT NULL,
  description TEXT,

  -- Duration (for calls/meetings, in minutes)
  duration_minutes INTEGER,

  -- Outcome (for calls/meetings)
  outcome TEXT CHECK (outcome IN (
    'successful',
    'no_answer',
    'voicemail',
    'scheduled_followup',
    'not_interested'
  )),

  -- Timestamp
  activity_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for crm_activities
CREATE INDEX idx_crm_activities_distributor ON crm_activities(distributor_id);
CREATE INDEX idx_crm_activities_lead ON crm_activities(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_crm_activities_contact ON crm_activities(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_crm_activities_type ON crm_activities(activity_type);
CREATE INDEX idx_crm_activities_date ON crm_activities(activity_date DESC);
CREATE INDEX idx_crm_activities_created ON crm_activities(created_at DESC);

-- Comments
COMMENT ON TABLE crm_activities IS 'CRM activities - interaction history with leads and contacts';
COMMENT ON COLUMN crm_activities.activity_type IS 'Type of activity: call, email, meeting, note, task_completed';
COMMENT ON COLUMN crm_activities.outcome IS 'Outcome for calls/meetings';
COMMENT ON COLUMN crm_activities.duration_minutes IS 'Duration in minutes (for calls/meetings)';

-- =============================================
-- TABLE 4: crm_tasks
-- =============================================
-- Purpose: Track to-do items and follow-ups

CREATE TABLE IF NOT EXISTS crm_tasks (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor Reference (who owns this task)
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Related Entity (lead OR contact, optional)
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,

  -- Task Details
  title TEXT NOT NULL,
  description TEXT,

  -- Priority
  priority TEXT DEFAULT 'medium' CHECK (priority IN (
    'low',
    'medium',
    'high',
    'urgent'
  )),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
  )),

  -- Due Date
  due_date TIMESTAMPTZ,

  -- Completion
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for crm_tasks
CREATE INDEX idx_crm_tasks_distributor ON crm_tasks(distributor_id);
CREATE INDEX idx_crm_tasks_lead ON crm_tasks(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_crm_tasks_contact ON crm_tasks(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_crm_tasks_priority ON crm_tasks(priority);
CREATE INDEX idx_crm_tasks_status ON crm_tasks(status);
CREATE INDEX idx_crm_tasks_due ON crm_tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_crm_tasks_active ON crm_tasks(distributor_id, status, due_date)
  WHERE status IN ('pending', 'in_progress');
CREATE INDEX idx_crm_tasks_created ON crm_tasks(created_at DESC);

-- Updated_at trigger
CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON crm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE crm_tasks IS 'CRM tasks - to-do items and follow-ups';
COMMENT ON COLUMN crm_tasks.priority IS 'Task priority: low, medium, high, urgent';
COMMENT ON COLUMN crm_tasks.status IS 'Task status: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN crm_tasks.due_date IS 'When the task is due';

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all CRM tables
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - crm_leads
-- =============================================

-- Distributors can view their own leads
CREATE POLICY "Distributors can view own leads"
  ON crm_leads FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can insert their own leads
CREATE POLICY "Distributors can insert own leads"
  ON crm_leads FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can update their own leads
CREATE POLICY "Distributors can update own leads"
  ON crm_leads FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can delete their own leads
CREATE POLICY "Distributors can delete own leads"
  ON crm_leads FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Admins have full access to all leads
CREATE POLICY "Admins have full access to leads"
  ON crm_leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES - crm_contacts
-- =============================================

-- Distributors can view their own contacts
CREATE POLICY "Distributors can view own contacts"
  ON crm_contacts FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can insert their own contacts
CREATE POLICY "Distributors can insert own contacts"
  ON crm_contacts FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can update their own contacts
CREATE POLICY "Distributors can update own contacts"
  ON crm_contacts FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can delete their own contacts
CREATE POLICY "Distributors can delete own contacts"
  ON crm_contacts FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Admins have full access to all contacts
CREATE POLICY "Admins have full access to contacts"
  ON crm_contacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES - crm_activities
-- =============================================

-- Distributors can view their own activities
CREATE POLICY "Distributors can view own activities"
  ON crm_activities FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can insert their own activities
CREATE POLICY "Distributors can insert own activities"
  ON crm_activities FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can update their own activities
CREATE POLICY "Distributors can update own activities"
  ON crm_activities FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can delete their own activities
CREATE POLICY "Distributors can delete own activities"
  ON crm_activities FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Admins have full access to all activities
CREATE POLICY "Admins have full access to activities"
  ON crm_activities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES - crm_tasks
-- =============================================

-- Distributors can view their own tasks
CREATE POLICY "Distributors can view own tasks"
  ON crm_tasks FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can insert their own tasks
CREATE POLICY "Distributors can insert own tasks"
  ON crm_tasks FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can update their own tasks
CREATE POLICY "Distributors can update own tasks"
  ON crm_tasks FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Distributors can delete their own tasks
CREATE POLICY "Distributors can delete own tasks"
  ON crm_tasks FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Admins have full access to all tasks
CREATE POLICY "Admins have full access to tasks"
  ON crm_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify all tables exist
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_name IN ('crm_leads', 'crm_contacts', 'crm_activities', 'crm_tasks')) = 4,
         'Not all CRM tables were created';
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM pg_tables
          WHERE tablename IN ('crm_leads', 'crm_contacts', 'crm_activities', 'crm_tasks')
          AND rowsecurity = true) = 4,
         'RLS not enabled on all CRM tables';
END $$;
