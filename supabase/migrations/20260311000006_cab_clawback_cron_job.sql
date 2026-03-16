-- =====================================================
-- CAB Clawback Daily Cron Job
-- Phase 2.2: Revenue Protection
-- Author: Claude Code
-- Date: 2026-03-11
-- =====================================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily CAB clawback processing at 2:00 AM
-- This will call the process-cab-clawback Edge Function daily
SELECT cron.schedule(
  'process-cab-clawback-daily',
  '0 2 * * *', -- Every day at 2:00 AM
  $$
  SELECT net.http_post(
    url := 'https://hqlltztusflhcwtmufnd.supabase.co/functions/v1/process-cab-clawback',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object('trigger', 'cron')
  ) AS request_id;
  $$
);

-- Add index on cab_clawback_queue for performance
CREATE INDEX IF NOT EXISTS idx_cab_clawback_queue_status_eligible
  ON cab_clawback_queue(status, clawback_eligible_until)
  WHERE status = 'pending';

-- Add index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_action_timestamp
  ON audit_log(action, timestamp DESC)
  WHERE action = 'cab_clawback_processed';

-- Add comment for documentation
COMMENT ON TABLE cab_clawback_queue IS 'Queue for CAB clawback processing. Items are processed daily by cron job at 2:00 AM.';

-- Log the cron job creation
INSERT INTO audit_log (
  action,
  actor_type,
  actor_id,
  table_name,
  record_id,
  details,
  timestamp
) VALUES (
  'cab_clawback_cron_enabled',
  'system',
  NULL,
  'cron_jobs',
  NULL,
  jsonb_build_object(
    'cron_name', 'process-cab-clawback-daily',
    'schedule', '0 2 * * *',
    'description', 'Daily CAB clawback processing',
    'enabled_at', NOW()
  ),
  NOW()
);
