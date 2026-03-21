-- =====================================================
-- SmartOffice Integration Tables
-- Date: 2026-03-21
-- Description: Tables for SmartOffice CRM integration
-- =====================================================

-- =====================================================
-- TABLE: smartoffice_sync_config
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smartoffice_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_url TEXT NOT NULL DEFAULT 'https://api.sandbox.smartofficecrm.com/3markapex/v1/send',
  sitename TEXT NOT NULL DEFAULT 'PREPRODNEW',
  username TEXT NOT NULL DEFAULT 'PREPRODNEW_SDC_UAT_tdaniel',
  api_key TEXT NOT NULL DEFAULT 'fa0fc95d45e2405ca006a1bfe5d09b1f',
  api_secret TEXT NOT NULL DEFAULT 'n2vcZOBHpfoFYDxm4xHKlTaQOvLpoe77',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sync_frequency_hours INTEGER NOT NULL DEFAULT 6,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  webhook_secret TEXT,
  webhook_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only allow one config row (singleton pattern)
CREATE UNIQUE INDEX IF NOT EXISTS idx_smartoffice_config_singleton ON public.smartoffice_sync_config ((true));

-- Insert default config with working credentials
INSERT INTO public.smartoffice_sync_config (
  api_url,
  sitename,
  username,
  api_key,
  api_secret,
  is_active
) VALUES (
  'https://api.sandbox.smartofficecrm.com/3markapex/v1/send',
  'PREPRODNEW',
  'PREPRODNEW_SDC_UAT_tdaniel',
  'fa0fc95d45e2405ca006a1bfe5d09b1f',
  'n2vcZOBHpfoFYDxm4xHKlTaQOvLpoe77',
  true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- TABLE: smartoffice_agents
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smartoffice_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smartoffice_id TEXT NOT NULL UNIQUE, -- SmartOffice Agent ID (e.g., "Agent.5000.1364")
  contact_id TEXT, -- SmartOffice Contact ID
  apex_agent_id UUID REFERENCES public.distributors(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  tax_id TEXT,
  client_type TEXT,
  status TEXT,
  hierarchy_id TEXT, -- Parent agent ID in SmartOffice
  raw_data JSONB, -- Full raw API response
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smartoffice_agents_smartoffice_id ON public.smartoffice_agents(smartoffice_id);
CREATE INDEX IF NOT EXISTS idx_smartoffice_agents_apex_agent_id ON public.smartoffice_agents(apex_agent_id);
CREATE INDEX IF NOT EXISTS idx_smartoffice_agents_email ON public.smartoffice_agents(email);
CREATE INDEX IF NOT EXISTS idx_smartoffice_agents_synced_at ON public.smartoffice_agents(synced_at);

-- =====================================================
-- TABLE: smartoffice_policies
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smartoffice_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smartoffice_id TEXT NOT NULL UNIQUE, -- SmartOffice Policy ID
  smartoffice_agent_id TEXT REFERENCES public.smartoffice_agents(smartoffice_id),
  primary_advisor_contact_id TEXT, -- SmartOffice Contact ID
  policy_number TEXT,
  product_name TEXT,
  carrier_name TEXT,
  holding_type INTEGER, -- 1 = Life, 3 = Other
  holding_type_name TEXT,
  annual_premium NUMERIC(12, 2),
  status TEXT,
  issue_date DATE,
  effective_date DATE,
  writing_agent_id TEXT, -- SmartOffice Agent ID
  raw_data JSONB, -- Full raw API response
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smartoffice_policies_smartoffice_id ON public.smartoffice_policies(smartoffice_id);
CREATE INDEX IF NOT EXISTS idx_smartoffice_policies_agent_id ON public.smartoffice_policies(smartoffice_agent_id);
CREATE INDEX IF NOT EXISTS idx_smartoffice_policies_policy_number ON public.smartoffice_policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_smartoffice_policies_synced_at ON public.smartoffice_policies(synced_at);

-- =====================================================
-- TABLE: smartoffice_commissions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smartoffice_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smartoffice_id TEXT NOT NULL UNIQUE, -- SmartOffice CommPayable ID
  policy_number TEXT,
  agent_role TEXT, -- Changed from 'current_role' (reserved keyword) to 'agent_role'
  receivable NUMERIC(12, 2),
  payable_due_date DATE,
  paid_amount NUMERIC(12, 2),
  status TEXT,
  comm_type TEXT,
  component_premium NUMERIC(12, 2),
  receivable_percent NUMERIC(5, 2),
  receivable_percent_of TEXT,
  raw_data JSONB, -- Full raw API response
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smartoffice_commissions_smartoffice_id ON public.smartoffice_commissions(smartoffice_id);
CREATE INDEX IF NOT EXISTS idx_smartoffice_commissions_policy_number ON public.smartoffice_commissions(policy_number);
CREATE INDEX IF NOT EXISTS idx_smartoffice_commissions_synced_at ON public.smartoffice_commissions(synced_at);

-- =====================================================
-- TABLE: smartoffice_sync_logs
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smartoffice_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- 'full', 'agents', 'policies', 'commissions'
  status TEXT NOT NULL, -- 'running', 'success', 'error'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  agents_synced INTEGER DEFAULT 0,
  agents_created INTEGER DEFAULT 0,
  agents_updated INTEGER DEFAULT 0,
  policies_synced INTEGER DEFAULT 0,
  policies_created INTEGER DEFAULT 0,
  policies_updated INTEGER DEFAULT 0,
  commissions_synced INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_messages JSONB,
  triggered_by TEXT, -- 'system', 'admin-manual', 'cron', 'webhook'
  triggered_by_user_id UUID REFERENCES public.distributors(id)
);

CREATE INDEX IF NOT EXISTS idx_smartoffice_sync_logs_started_at ON public.smartoffice_sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_smartoffice_sync_logs_status ON public.smartoffice_sync_logs(status);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- smartoffice_agents: Admin-only access
ALTER TABLE public.smartoffice_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read all SmartOffice agents"
  ON public.smartoffice_agents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors
      WHERE id = auth.uid()
      AND role IN ('admin', 'cfo')
    )
  );

CREATE POLICY "System can insert/update SmartOffice agents"
  ON public.smartoffice_agents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- smartoffice_policies: Admin-only access
ALTER TABLE public.smartoffice_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read all SmartOffice policies"
  ON public.smartoffice_policies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors
      WHERE id = auth.uid()
      AND role IN ('admin', 'cfo')
    )
  );

CREATE POLICY "System can insert/update SmartOffice policies"
  ON public.smartoffice_policies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- smartoffice_commissions: Admin-only access
ALTER TABLE public.smartoffice_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read all SmartOffice commissions"
  ON public.smartoffice_commissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors
      WHERE id = auth.uid()
      AND role IN ('admin', 'cfo')
    )
  );

CREATE POLICY "System can insert/update SmartOffice commissions"
  ON public.smartoffice_commissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- smartoffice_sync_logs: Admin-only access
ALTER TABLE public.smartoffice_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read all sync logs"
  ON public.smartoffice_sync_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors
      WHERE id = auth.uid()
      AND role IN ('admin', 'cfo')
    )
  );

CREATE POLICY "System can insert/update sync logs"
  ON public.smartoffice_sync_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- smartoffice_sync_config: Admin-only access
ALTER TABLE public.smartoffice_sync_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read config"
  ON public.smartoffice_sync_config
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors
      WHERE id = auth.uid()
      AND role IN ('admin', 'cfo')
    )
  );

CREATE POLICY "Admin can update config"
  ON public.smartoffice_sync_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors
      WHERE id = auth.uid()
      AND role IN ('admin', 'cfo')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.distributors
      WHERE id = auth.uid()
      AND role IN ('admin', 'cfo')
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_smartoffice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_smartoffice_agents_updated_at
  BEFORE UPDATE ON public.smartoffice_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_smartoffice_updated_at();

CREATE TRIGGER update_smartoffice_policies_updated_at
  BEFORE UPDATE ON public.smartoffice_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_smartoffice_updated_at();

CREATE TRIGGER update_smartoffice_commissions_updated_at
  BEFORE UPDATE ON public.smartoffice_commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_smartoffice_updated_at();

CREATE TRIGGER update_smartoffice_sync_config_updated_at
  BEFORE UPDATE ON public.smartoffice_sync_config
  FOR EACH ROW
  EXECUTE FUNCTION update_smartoffice_updated_at();
