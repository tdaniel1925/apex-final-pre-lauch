-- =============================================
-- MIGRATION: 20260311000001_create_comp_engine_config_tables.sql
-- Create compensation engine configuration tables
-- =============================================

-- =============================================
-- 1. SaaS Compensation Engine Config
-- =============================================

CREATE TABLE IF NOT EXISTS public.saas_comp_engine_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.saas_comp_engine_config IS 'Configuration for SaaS product compensation (AgentPulse products)';
COMMENT ON COLUMN public.saas_comp_engine_config.key IS 'Config key (e.g., product.pulseflow, waterfall.botmakers_pct)';
COMMENT ON COLUMN public.saas_comp_engine_config.value IS 'JSON value for the config';
COMMENT ON COLUMN public.saas_comp_engine_config.effective_date IS 'When this config becomes effective';

-- =============================================
-- 2. Insurance Compensation Engine Config
-- =============================================

CREATE TABLE IF NOT EXISTS public.insurance_comp_engine_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.insurance_comp_engine_config IS 'Configuration for insurance product compensation';
COMMENT ON COLUMN public.insurance_comp_engine_config.key IS 'Config key (e.g., rank.associate, ppb.week1_pct)';
COMMENT ON COLUMN public.insurance_comp_engine_config.value IS 'JSON value for the config';

-- =============================================
-- 3. Compensation Engine Change Log
-- =============================================

CREATE TABLE IF NOT EXISTS public.comp_engine_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_type TEXT NOT NULL CHECK (engine_type IN ('saas', 'insurance')),
  field_key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.comp_engine_change_log IS 'Audit log for all compensation engine config changes';
COMMENT ON COLUMN public.comp_engine_change_log.engine_type IS 'Which engine: saas or insurance';
COMMENT ON COLUMN public.comp_engine_change_log.field_key IS 'Config key that was changed';

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_saas_comp_config_key ON public.saas_comp_engine_config(key);
CREATE INDEX IF NOT EXISTS idx_insurance_comp_config_key ON public.insurance_comp_engine_config(key);
CREATE INDEX IF NOT EXISTS idx_comp_change_log_engine_key ON public.comp_engine_change_log(engine_type, field_key);
CREATE INDEX IF NOT EXISTS idx_comp_change_log_changed_at ON public.comp_engine_change_log(changed_at DESC);

-- =============================================
-- RLS Policies
-- =============================================

ALTER TABLE public.saas_comp_engine_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_comp_engine_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comp_engine_change_log ENABLE ROW LEVEL SECURITY;

-- Allow admins to read/write config
CREATE POLICY "Admins can manage SaaS comp config"
  ON public.saas_comp_engine_config
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage insurance comp config"
  ON public.insurance_comp_engine_config
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view change log"
  ON public.comp_engine_change_log
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
