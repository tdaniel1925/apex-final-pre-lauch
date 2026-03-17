-- =============================================
-- Password Reset Rate Limiting Table
-- Tracks password reset attempts by IP to prevent abuse
-- =============================================

CREATE TABLE IF NOT EXISTS public.password_reset_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_password_reset_rate_limits_ip_created
  ON public.password_reset_rate_limits(ip_address, created_at DESC);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_password_reset_rate_limits_created
  ON public.password_reset_rate_limits(created_at);

-- RLS Policies (service role only)
ALTER TABLE public.password_reset_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access - service role only
CREATE POLICY "Service role only access"
  ON public.password_reset_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
