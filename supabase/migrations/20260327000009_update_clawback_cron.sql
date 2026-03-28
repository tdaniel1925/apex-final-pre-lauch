-- =====================================================
-- Update CAB Clawback Cron Job
-- Date: 2026-03-27
-- Purpose: Update cron job to use Next.js API endpoint instead of Edge Function
-- =====================================================

-- Remove old cron job (if exists)
SELECT cron.unschedule('process-cab-clawback-daily');

-- Schedule new cron job pointing to Next.js API endpoint
-- Runs daily at 2:00 AM
SELECT cron.schedule(
  'process-cab-clawback-daily',
  '0 2 * * *', -- Every day at 2:00 AM
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.api_url') || '/api/cron/process-clawbacks',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-token', current_setting('app.settings.cron_secret')
    ),
    body := jsonb_build_object('trigger', 'cron', 'timestamp', NOW())
  ) AS request_id;
  $$
);

-- Update comment
COMMENT ON TABLE cab_clawback_queue IS 'Queue for CAB clawback processing. Items are processed daily by cron job at 2:00 AM via /api/cron/process-clawbacks endpoint.';

-- Log the cron job update
INSERT INTO audit_log (
  action,
  actor_type,
  actor_id,
  table_name,
  record_id,
  details,
  timestamp
) VALUES (
  'cab_clawback_cron_updated',
  'system',
  NULL,
  'cron_jobs',
  NULL,
  jsonb_build_object(
    'cron_name', 'process-cab-clawback-daily',
    'schedule', '0 2 * * *',
    'endpoint', '/api/cron/process-clawbacks',
    'description', 'Daily CAB clawback processing (updated to use Next.js API)',
    'updated_at', NOW()
  ),
  NOW()
);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- To verify the cron job is scheduled:
-- SELECT * FROM cron.job WHERE jobname = 'process-cab-clawback-daily';
--
-- To manually trigger the cron job:
-- SELECT cron.schedule_in_database('process-cab-clawback-daily', '* * * * *', $$SELECT 1$$);
-- =====================================================
