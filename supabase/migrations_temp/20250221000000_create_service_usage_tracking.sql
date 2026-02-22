-- =============================================
-- Service Usage and Cost Tracking System
-- Created: February 21, 2026
-- Purpose: Track 3rd party service usage and costs
-- =============================================

-- =============================================
-- Services Table
-- Stores configuration for each 3rd party service
-- =============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'openai', 'anthropic', 'redis', 'resend'
  display_name TEXT NOT NULL, -- 'OpenAI', 'Anthropic Claude', etc.
  category TEXT NOT NULL, -- 'ai', 'infrastructure', 'email', 'storage'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Service Usage Logs
-- Tracks every API call/usage with cost
-- =============================================
CREATE TABLE IF NOT EXISTS service_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Request details
  operation TEXT NOT NULL, -- 'completion', 'embedding', 'email.send', 'cache.get'
  endpoint TEXT, -- API endpoint used

  -- Usage metrics (varies by service)
  tokens_input INTEGER, -- AI services
  tokens_output INTEGER, -- AI services
  total_tokens INTEGER, -- AI services
  requests_count INTEGER DEFAULT 1, -- All services
  data_size_bytes BIGINT, -- Storage/Redis
  emails_sent INTEGER, -- Email service

  -- Cost tracking
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0, -- Cost in USD
  cost_calculation JSONB, -- Details of how cost was calculated

  -- Context
  triggered_by TEXT, -- 'user', 'admin', 'system', 'cron'
  user_id UUID, -- If triggered by user action
  admin_id UUID, -- If triggered by admin
  feature TEXT, -- 'training-transcription', 'welcome-email', 'pulse-follow'

  -- Metadata
  request_metadata JSONB, -- Model, temperature, etc.
  response_metadata JSONB, -- Response details
  error TEXT, -- If request failed
  duration_ms INTEGER, -- Request duration

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Service Budgets
-- Monthly budgets per service
-- =============================================
CREATE TABLE IF NOT EXISTS service_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Budget period
  month DATE NOT NULL, -- First day of month (e.g., '2026-02-01')

  -- Budget amounts
  budget_usd DECIMAL(10, 2) NOT NULL, -- Monthly budget
  spent_usd DECIMAL(10, 6) DEFAULT 0, -- Current spend
  projected_spend_usd DECIMAL(10, 6), -- Projected end-of-month spend

  -- Alerts
  alert_threshold_percent INTEGER DEFAULT 80, -- Alert at 80%
  alert_sent_at TIMESTAMP WITH TIME ZONE,
  budget_exceeded_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(service_id, month)
);

-- =============================================
-- Cost Alerts
-- Log of budget alerts sent
-- =============================================
CREATE TABLE IF NOT EXISTS service_cost_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES service_budgets(id) ON DELETE SET NULL,

  alert_type TEXT NOT NULL, -- 'threshold', 'exceeded', 'anomaly'
  severity TEXT NOT NULL, -- 'warning', 'critical'

  message TEXT NOT NULL,
  details JSONB,

  -- Resolution
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID, -- Admin who acknowledged
  acknowledged_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Service Pricing
-- Current pricing per service (for cost calculation)
-- =============================================
CREATE TABLE IF NOT EXISTS service_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Pricing model
  pricing_type TEXT NOT NULL, -- 'per_token', 'per_request', 'per_email', 'per_gb'
  model_name TEXT, -- For AI services (gpt-4, claude-3-opus, etc.)

  -- Costs
  input_cost_per_1k DECIMAL(10, 6), -- AI: cost per 1k input tokens
  output_cost_per_1k DECIMAL(10, 6), -- AI: cost per 1k output tokens
  request_cost DECIMAL(10, 6), -- Per-request cost
  monthly_base_cost DECIMAL(10, 2), -- Fixed monthly cost

  -- Validity
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Service usage logs indexes
CREATE INDEX idx_service_usage_logs_service_id
  ON service_usage_logs(service_id);

CREATE INDEX idx_service_usage_logs_created_at
  ON service_usage_logs(created_at DESC);

CREATE INDEX idx_service_usage_logs_service_date
  ON service_usage_logs(service_id, created_at DESC);

CREATE INDEX idx_service_usage_logs_feature
  ON service_usage_logs(feature)
  WHERE feature IS NOT NULL;

CREATE INDEX idx_service_usage_logs_user_id
  ON service_usage_logs(user_id)
  WHERE user_id IS NOT NULL;

-- Service budgets indexes
CREATE INDEX idx_service_budgets_month
  ON service_budgets(month DESC);

CREATE INDEX idx_service_budgets_service_month
  ON service_budgets(service_id, month DESC);

-- Cost alerts indexes
CREATE INDEX idx_service_cost_alerts_acknowledged
  ON service_cost_alerts(acknowledged, created_at DESC);

CREATE INDEX idx_service_cost_alerts_service
  ON service_cost_alerts(service_id, created_at DESC);

-- =============================================
-- Seed Data: Services
-- =============================================
INSERT INTO services (name, display_name, category) VALUES
  ('openai', 'OpenAI', 'ai'),
  ('anthropic', 'Anthropic Claude', 'ai'),
  ('redis', 'Upstash Redis', 'infrastructure'),
  ('resend', 'Resend Email', 'email')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- Seed Data: Current Pricing (as of Feb 2026)
-- =============================================

-- OpenAI GPT-4o pricing
INSERT INTO service_pricing (service_id, pricing_type, model_name, input_cost_per_1k, output_cost_per_1k, effective_from)
SELECT id, 'per_token', 'gpt-4o', 0.0025, 0.01, '2024-01-01'
FROM services WHERE name = 'openai';

-- OpenAI GPT-4o-mini pricing
INSERT INTO service_pricing (service_id, pricing_type, model_name, input_cost_per_1k, output_cost_per_1k, effective_from)
SELECT id, 'per_token', 'gpt-4o-mini', 0.00015, 0.0006, '2024-01-01'
FROM services WHERE name = 'openai';

-- Anthropic Claude 3.5 Sonnet pricing
INSERT INTO service_pricing (service_id, pricing_type, model_name, input_cost_per_1k, output_cost_per_1k, effective_from)
SELECT id, 'per_token', 'claude-3-5-sonnet-20241022', 0.003, 0.015, '2024-01-01'
FROM services WHERE name = 'anthropic';

-- Resend email pricing (free tier: 100 emails/day, then $0.001 per email)
INSERT INTO service_pricing (service_id, pricing_type, request_cost, effective_from)
SELECT id, 'per_email', 0.001, '2024-01-01'
FROM services WHERE name = 'resend';

-- Redis pricing (free tier: 10k requests/day, then ~$0.2 per 100k requests)
INSERT INTO service_pricing (service_id, pricing_type, request_cost, effective_from)
SELECT id, 'per_request', 0.000002, '2024-01-01'
FROM services WHERE name = 'redis';

-- =============================================
-- Functions
-- =============================================

-- Function to get current month's budget for a service
CREATE OR REPLACE FUNCTION get_service_budget(service_name TEXT)
RETURNS TABLE (
  budget_usd DECIMAL(10, 2),
  spent_usd DECIMAL(10, 6),
  remaining_usd DECIMAL(10, 6),
  percent_used DECIMAL(5, 2)
) AS $$
DECLARE
  current_month DATE := DATE_TRUNC('month', CURRENT_DATE);
BEGIN
  RETURN QUERY
  SELECT
    sb.budget_usd,
    sb.spent_usd,
    (sb.budget_usd - sb.spent_usd) AS remaining_usd,
    CASE
      WHEN sb.budget_usd > 0 THEN (sb.spent_usd / sb.budget_usd * 100)
      ELSE 0
    END AS percent_used
  FROM service_budgets sb
  JOIN services s ON s.id = sb.service_id
  WHERE s.name = service_name
    AND sb.month = current_month;
END;
$$ LANGUAGE plpgsql;

-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
  current_month DATE := DATE_TRUNC('month', NEW.created_at);
  budget_record RECORD;
BEGIN
  -- Update the spent amount in the budget
  UPDATE service_budgets
  SET
    spent_usd = spent_usd + NEW.cost_usd,
    updated_at = NOW()
  WHERE service_id = NEW.service_id
    AND month = current_month;

  -- Check if budget exceeded
  SELECT * INTO budget_record
  FROM service_budgets
  WHERE service_id = NEW.service_id
    AND month = current_month;

  IF budget_record IS NOT NULL THEN
    -- Check if threshold exceeded (and alert not sent)
    IF budget_record.spent_usd >= (budget_record.budget_usd * budget_record.alert_threshold_percent / 100)
       AND budget_record.alert_sent_at IS NULL THEN

      UPDATE service_budgets
      SET alert_sent_at = NOW()
      WHERE id = budget_record.id;

      INSERT INTO service_cost_alerts (service_id, budget_id, alert_type, severity, message, details)
      VALUES (
        NEW.service_id,
        budget_record.id,
        'threshold',
        'warning',
        format('Service budget threshold (%s%%) reached', budget_record.alert_threshold_percent),
        jsonb_build_object(
          'budget_usd', budget_record.budget_usd,
          'spent_usd', budget_record.spent_usd,
          'threshold_percent', budget_record.alert_threshold_percent
        )
      );
    END IF;

    -- Check if budget exceeded (and not already marked)
    IF budget_record.spent_usd >= budget_record.budget_usd
       AND budget_record.budget_exceeded_at IS NULL THEN

      UPDATE service_budgets
      SET budget_exceeded_at = NOW()
      WHERE id = budget_record.id;

      INSERT INTO service_cost_alerts (service_id, budget_id, alert_type, severity, message, details)
      VALUES (
        NEW.service_id,
        budget_record.id,
        'exceeded',
        'critical',
        'Service budget exceeded!',
        jsonb_build_object(
          'budget_usd', budget_record.budget_usd,
          'spent_usd', budget_record.spent_usd,
          'overage_usd', budget_record.spent_usd - budget_record.budget_usd
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update budget on new usage
CREATE TRIGGER trigger_update_budget_spent
AFTER INSERT ON service_usage_logs
FOR EACH ROW
EXECUTE FUNCTION update_budget_spent();

-- =============================================
-- Comments
-- =============================================
COMMENT ON TABLE services IS 'Configuration for 3rd party services being tracked';
COMMENT ON TABLE service_usage_logs IS 'Every API call/usage with cost tracking';
COMMENT ON TABLE service_budgets IS 'Monthly budgets and spend tracking per service';
COMMENT ON TABLE service_cost_alerts IS 'Budget alerts and warnings';
COMMENT ON TABLE service_pricing IS 'Pricing models for cost calculation';

-- =============================================
-- Analyze tables for query optimization
-- =============================================
ANALYZE services;
ANALYZE service_usage_logs;
ANALYZE service_budgets;
ANALYZE service_cost_alerts;
ANALYZE service_pricing;
