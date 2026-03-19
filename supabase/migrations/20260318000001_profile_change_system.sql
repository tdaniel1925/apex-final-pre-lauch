-- ============================================================================
-- PROFILE CHANGE SYSTEM
-- Migration: 20260318000001
-- Purpose: Comprehensive profile editing with email verification,
--          external platform sync queue, and audit logging
-- ============================================================================

-- ============================================================================
-- 1. EMAIL VERIFICATION TOKENS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  old_email TEXT NOT NULL,
  new_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,

  CONSTRAINT email_verification_tokens_distributor_fk
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- Index for token lookup
CREATE INDEX idx_email_verification_tokens_token
  ON email_verification_tokens(token)
  WHERE used_at IS NULL;

-- Index for cleanup of expired tokens
CREATE INDEX idx_email_verification_tokens_expires_at
  ON email_verification_tokens(expires_at)
  WHERE used_at IS NULL;

-- Index for distributor lookup
CREATE INDEX idx_email_verification_tokens_distributor
  ON email_verification_tokens(distributor_id);

COMMENT ON TABLE email_verification_tokens IS
  'Stores email change verification tokens. Tokens expire after 24 hours and can only be used once.';

-- ============================================================================
-- 2. PROFILE CHANGE QUEUE TABLE (External Platform Sync)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profile_change_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('jordyn', 'agentpulse', 'winflex')),
  change_type TEXT NOT NULL CHECK (change_type IN ('email', 'name', 'phone', 'address', 'all')),
  sync_data JSONB NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  sync_attempts INT NOT NULL DEFAULT 0,
  max_retries INT NOT NULL DEFAULT 5,
  last_attempt_at TIMESTAMPTZ,
  last_error TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT profile_change_queue_distributor_fk
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- Index for processing queue (ordered by priority and creation time)
CREATE INDEX idx_profile_change_queue_processing
  ON profile_change_queue(priority DESC, created_at ASC)
  WHERE status = 'pending' OR status = 'failed' AND sync_attempts < max_retries;

-- Index for distributor lookup
CREATE INDEX idx_profile_change_queue_distributor
  ON profile_change_queue(distributor_id);

-- Index for platform lookup
CREATE INDEX idx_profile_change_queue_platform
  ON profile_change_queue(platform, status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_profile_change_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_change_queue_updated_at
  BEFORE UPDATE ON profile_change_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_change_queue_updated_at();

COMMENT ON TABLE profile_change_queue IS
  'Queue for syncing profile changes to external platforms (jordyn, agentpulse, winflex). Processed by background job.';

-- ============================================================================
-- 3. PROFILE CHANGE AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS profile_change_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  changed_by_id UUID NOT NULL, -- Could be same distributor or admin
  change_type TEXT NOT NULL CHECK (change_type IN ('personal_info', 'address', 'banking', 'tax_info', 'email')),
  old_values JSONB NOT NULL,
  new_values JSONB NOT NULL,
  change_reason TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT profile_change_audit_distributor_fk
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- Index for distributor lookup (most common query)
CREATE INDEX idx_profile_change_audit_distributor
  ON profile_change_audit_log(distributor_id, created_at DESC);

-- Index for changed_by lookup (find what admin changed)
CREATE INDEX idx_profile_change_audit_changed_by
  ON profile_change_audit_log(changed_by_id, created_at DESC);

-- Index for severity (find critical changes)
CREATE INDEX idx_profile_change_audit_severity
  ON profile_change_audit_log(severity, created_at DESC)
  WHERE severity IN ('high', 'critical');

-- Index for change type
CREATE INDEX idx_profile_change_audit_type
  ON profile_change_audit_log(change_type, created_at DESC);

COMMENT ON TABLE profile_change_audit_log IS
  'Comprehensive audit trail of all profile changes with old/new values, reason, and severity.';

-- ============================================================================
-- 4. TWO-FACTOR AUTHENTICATION CODES TABLE (for banking changes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS two_factor_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('banking_change', 'email_change', 'sensitive_action')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,

  CONSTRAINT two_factor_codes_distributor_fk
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
);

-- Index for code lookup
CREATE INDEX idx_two_factor_codes_lookup
  ON two_factor_codes(distributor_id, code, purpose)
  WHERE used_at IS NULL AND expires_at > NOW();

-- Index for cleanup of expired codes
CREATE INDEX idx_two_factor_codes_expires_at
  ON two_factor_codes(expires_at)
  WHERE used_at IS NULL;

COMMENT ON TABLE two_factor_codes IS
  'Stores 2FA codes for sensitive operations like banking changes. Codes expire after 10 minutes.';

-- ============================================================================
-- 5. RATE LIMITING TABLES
-- ============================================================================

-- Email change rate limiting
CREATE TABLE IF NOT EXISTS email_change_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  change_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  window_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',

  CONSTRAINT email_change_rate_limits_distributor_fk
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE,
  CONSTRAINT email_change_rate_limits_unique_window
    UNIQUE(distributor_id, window_start)
);

CREATE INDEX idx_email_change_rate_limits_distributor
  ON email_change_rate_limits(distributor_id, window_end)
  WHERE window_end > NOW();

COMMENT ON TABLE email_change_rate_limits IS
  'Rate limiting for email changes: max 3 changes per 30 days per distributor.';

-- Banking change rate limiting
CREATE TABLE IF NOT EXISTS banking_change_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  change_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  window_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',

  CONSTRAINT banking_change_rate_limits_distributor_fk
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE,
  CONSTRAINT banking_change_rate_limits_unique_window
    UNIQUE(distributor_id, window_start)
);

CREATE INDEX idx_banking_change_rate_limits_distributor
  ON banking_change_rate_limits(distributor_id, window_end)
  WHERE window_end > NOW();

COMMENT ON TABLE banking_change_rate_limits IS
  'Rate limiting for banking changes: max 5 changes per 30 days per distributor.';

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to check email change rate limit
CREATE OR REPLACE FUNCTION check_email_change_rate_limit(
  p_distributor_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_change_count INT;
BEGIN
  SELECT COALESCE(SUM(change_count), 0)
  INTO v_change_count
  FROM email_change_rate_limits
  WHERE distributor_id = p_distributor_id
    AND window_end > NOW();

  RETURN v_change_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment email change count
CREATE OR REPLACE FUNCTION increment_email_change_count(
  p_distributor_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO email_change_rate_limits (distributor_id)
  VALUES (p_distributor_id)
  ON CONFLICT (distributor_id, window_start)
  DO UPDATE SET change_count = email_change_rate_limits.change_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check banking change rate limit
CREATE OR REPLACE FUNCTION check_banking_change_rate_limit(
  p_distributor_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_change_count INT;
BEGIN
  SELECT COALESCE(SUM(change_count), 0)
  INTO v_change_count
  FROM banking_change_rate_limits
  WHERE distributor_id = p_distributor_id
    AND window_end > NOW();

  RETURN v_change_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment banking change count
CREATE OR REPLACE FUNCTION increment_banking_change_count(
  p_distributor_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO banking_change_rate_limits (distributor_id)
  VALUES (p_distributor_id)
  ON CONFLICT (distributor_id, window_start)
  DO UPDATE SET change_count = banking_change_rate_limits.change_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired tokens and codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_data()
RETURNS VOID AS $$
BEGIN
  -- Cleanup expired email verification tokens (older than 7 days)
  DELETE FROM email_verification_tokens
  WHERE expires_at < NOW() - INTERVAL '7 days';

  -- Cleanup expired 2FA codes (older than 1 day)
  DELETE FROM two_factor_codes
  WHERE expires_at < NOW() - INTERVAL '1 day';

  -- Cleanup old rate limit records (older than 60 days)
  DELETE FROM email_change_rate_limits
  WHERE window_end < NOW() - INTERVAL '60 days';

  DELETE FROM banking_change_rate_limits
  WHERE window_end < NOW() - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_change_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_change_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policies for email_verification_tokens
CREATE POLICY "Distributors can view their own verification tokens"
  ON email_verification_tokens FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));

CREATE POLICY "Admins can view all verification tokens"
  ON email_verification_tokens FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM distributors
    WHERE auth_user_id = auth.uid() AND is_admin = true
  ));

-- Policies for profile_change_queue
CREATE POLICY "Distributors can view their own sync queue"
  ON profile_change_queue FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));

CREATE POLICY "Admins can view all sync queue"
  ON profile_change_queue FOR ALL
  USING (EXISTS (
    SELECT 1 FROM distributors
    WHERE auth_user_id = auth.uid() AND is_admin = true
  ));

-- Policies for profile_change_audit_log
CREATE POLICY "Distributors can view their own audit log"
  ON profile_change_audit_log FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));

CREATE POLICY "Admins can view all audit logs"
  ON profile_change_audit_log FOR ALL
  USING (EXISTS (
    SELECT 1 FROM distributors
    WHERE auth_user_id = auth.uid() AND is_admin = true
  ));

-- Policies for two_factor_codes
CREATE POLICY "Distributors can view their own 2FA codes"
  ON two_factor_codes FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));

-- Policies for rate limits (view only)
CREATE POLICY "Distributors can view their own rate limits"
  ON email_change_rate_limits FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));

CREATE POLICY "Distributors can view their own banking rate limits"
  ON banking_change_rate_limits FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));

-- ============================================================================
-- 8. GRANTS
-- ============================================================================

-- Grant service role full access (for API routes)
GRANT ALL ON email_verification_tokens TO service_role;
GRANT ALL ON profile_change_queue TO service_role;
GRANT ALL ON profile_change_audit_log TO service_role;
GRANT ALL ON two_factor_codes TO service_role;
GRANT ALL ON email_change_rate_limits TO service_role;
GRANT ALL ON banking_change_rate_limits TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON SCHEMA public IS
  'Profile change system with email verification, 2FA, external sync queue, audit logging, and rate limiting - Migration 20260318000001';
