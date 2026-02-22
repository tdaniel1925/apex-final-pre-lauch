-- =============================================
-- Add Platform Services (Vercel, Supabase)
-- Created: February 21, 2026
-- Purpose: Track platform costs for THIS project only
-- =============================================

-- =============================================
-- Add Vercel and Supabase services
-- =============================================

-- Note: Resend already added in previous migration
-- These are platform services with project-specific tracking

INSERT INTO services (name, display_name, category) VALUES
  ('vercel', 'Vercel Hosting', 'infrastructure'),
  ('supabase', 'Supabase Database', 'infrastructure')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- Vercel Pricing (Pro plan)
-- =============================================

-- Vercel Pro plan: $20/month base + usage
INSERT INTO service_pricing (service_id, pricing_type, monthly_base_cost, effective_from)
SELECT id, 'per_request', 20.00, '2024-01-01'
FROM services WHERE name = 'vercel';

-- Additional Vercel costs (tracked separately):
-- - Function executions: First 1M free, then $0.60 per additional 1M
-- - Bandwidth: First 100GB free, then $0.40 per GB
-- - Build minutes: First 6000 free, then $40 per 1000

-- =============================================
-- Supabase Pricing (Pro plan)
-- =============================================

-- Supabase Pro plan: $25/month base
-- Includes: 8GB database, 50GB bandwidth, 250GB storage
INSERT INTO service_pricing (service_id, pricing_type, monthly_base_cost, effective_from)
SELECT id, 'per_request', 25.00, '2024-01-01'
FROM services WHERE name = 'supabase';

-- Additional Supabase costs (tracked separately):
-- - Database size: First 8GB free, then $0.125 per GB/month
-- - Bandwidth: First 50GB free, then $0.09 per GB
-- - Storage: First 250GB free, then $0.021 per GB/month

-- =============================================
-- Platform Usage Tracking Table
-- For services that need daily snapshots (not per-request)
-- =============================================

CREATE TABLE IF NOT EXISTS platform_usage_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Snapshot date
  snapshot_date DATE NOT NULL,

  -- Vercel metrics
  function_executions BIGINT,
  bandwidth_gb DECIMAL(10, 4),
  build_minutes INTEGER,

  -- Supabase metrics
  database_size_gb DECIMAL(10, 4),
  database_bandwidth_gb DECIMAL(10, 4),
  storage_size_gb DECIMAL(10, 4),
  database_requests BIGINT,

  -- Cost breakdown
  base_cost_usd DECIMAL(10, 2),
  overage_cost_usd DECIMAL(10, 6),
  total_cost_usd DECIMAL(10, 6),
  cost_calculation JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(service_id, snapshot_date)
);

-- =============================================
-- Indexes for Platform Snapshots
-- =============================================

CREATE INDEX idx_platform_snapshots_service_date
  ON platform_usage_snapshots(service_id, snapshot_date DESC);

CREATE INDEX idx_platform_snapshots_date
  ON platform_usage_snapshots(snapshot_date DESC);

-- =============================================
-- Function to Calculate Platform Costs
-- =============================================

CREATE OR REPLACE FUNCTION calculate_platform_cost(
  p_service_name TEXT,
  p_snapshot_date DATE
)
RETURNS JSONB AS $$
DECLARE
  v_service_id UUID;
  v_snapshot RECORD;
  v_base_cost DECIMAL(10, 2);
  v_overage_cost DECIMAL(10, 6) := 0;
  v_total_cost DECIMAL(10, 6);
  v_cost_details JSONB := '{}';
BEGIN
  -- Get service ID
  SELECT id INTO v_service_id FROM services WHERE name = p_service_name;
  IF v_service_id IS NULL THEN
    RAISE EXCEPTION 'Service % not found', p_service_name;
  END IF;

  -- Get snapshot
  SELECT * INTO v_snapshot
  FROM platform_usage_snapshots
  WHERE service_id = v_service_id
    AND snapshot_date = p_snapshot_date;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Snapshot not found');
  END IF;

  -- Get base cost from pricing
  SELECT monthly_base_cost INTO v_base_cost
  FROM service_pricing
  WHERE service_id = v_service_id
    AND is_active = true
  LIMIT 1;

  -- Calculate overages based on service
  IF p_service_name = 'vercel' THEN
    -- Vercel overages
    -- Function executions: > 1M = $0.60 per additional 1M
    IF v_snapshot.function_executions > 1000000 THEN
      v_overage_cost := v_overage_cost +
        ((v_snapshot.function_executions - 1000000) / 1000000.0) * 0.60;
      v_cost_details := v_cost_details || jsonb_build_object(
        'function_executions_overage', (v_snapshot.function_executions - 1000000),
        'function_cost', ((v_snapshot.function_executions - 1000000) / 1000000.0) * 0.60
      );
    END IF;

    -- Bandwidth: > 100GB = $0.40 per GB
    IF v_snapshot.bandwidth_gb > 100 THEN
      v_overage_cost := v_overage_cost +
        (v_snapshot.bandwidth_gb - 100) * 0.40;
      v_cost_details := v_cost_details || jsonb_build_object(
        'bandwidth_overage_gb', v_snapshot.bandwidth_gb - 100,
        'bandwidth_cost', (v_snapshot.bandwidth_gb - 100) * 0.40
      );
    END IF;

    -- Build minutes: > 6000 = $40 per 1000
    IF v_snapshot.build_minutes > 6000 THEN
      v_overage_cost := v_overage_cost +
        ((v_snapshot.build_minutes - 6000) / 1000.0) * 40;
      v_cost_details := v_cost_details || jsonb_build_object(
        'build_minutes_overage', (v_snapshot.build_minutes - 6000),
        'build_cost', ((v_snapshot.build_minutes - 6000) / 1000.0) * 40
      );
    END IF;

  ELSIF p_service_name = 'supabase' THEN
    -- Supabase overages
    -- Database size: > 8GB = $0.125 per GB/month
    IF v_snapshot.database_size_gb > 8 THEN
      v_overage_cost := v_overage_cost +
        (v_snapshot.database_size_gb - 8) * 0.125;
      v_cost_details := v_cost_details || jsonb_build_object(
        'database_size_overage_gb', v_snapshot.database_size_gb - 8,
        'database_size_cost', (v_snapshot.database_size_gb - 8) * 0.125
      );
    END IF;

    -- Bandwidth: > 50GB = $0.09 per GB
    IF v_snapshot.database_bandwidth_gb > 50 THEN
      v_overage_cost := v_overage_cost +
        (v_snapshot.database_bandwidth_gb - 50) * 0.09;
      v_cost_details := v_cost_details || jsonb_build_object(
        'bandwidth_overage_gb', v_snapshot.database_bandwidth_gb - 50,
        'bandwidth_cost', (v_snapshot.database_bandwidth_gb - 50) * 0.09
      );
    END IF;

    -- Storage: > 250GB = $0.021 per GB/month
    IF v_snapshot.storage_size_gb > 250 THEN
      v_overage_cost := v_overage_cost +
        (v_snapshot.storage_size_gb - 250) * 0.021;
      v_cost_details := v_cost_details || jsonb_build_object(
        'storage_overage_gb', v_snapshot.storage_size_gb - 250,
        'storage_cost', (v_snapshot.storage_size_gb - 250) * 0.021
      );
    END IF;
  END IF;

  -- Calculate total (base cost is monthly, so prorate by days)
  v_total_cost := (v_base_cost / 30.0) + v_overage_cost;

  RETURN jsonb_build_object(
    'base_cost', v_base_cost / 30.0,
    'overage_cost', v_overage_cost,
    'total_cost', v_total_cost,
    'details', v_cost_details
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE platform_usage_snapshots IS 'Daily usage snapshots for platform services (Vercel, Supabase)';
COMMENT ON FUNCTION calculate_platform_cost IS 'Calculate daily cost for platform services with overage charges';

-- =============================================
-- Analyze
-- =============================================

ANALYZE services;
ANALYZE service_pricing;
ANALYZE platform_usage_snapshots;
