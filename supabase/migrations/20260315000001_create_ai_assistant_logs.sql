-- =============================================
-- AI Assistant Logs Table
-- Tracks all AI-assisted admin actions for audit
-- =============================================

CREATE TABLE IF NOT EXISTS ai_assistant_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  action_type VARCHAR(50),
  action_details JSONB,
  executed BOOLEAN DEFAULT false,
  execution_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries by admin
CREATE INDEX idx_ai_assistant_logs_admin_id ON ai_assistant_logs(admin_id);

-- Index for faster queries by action type
CREATE INDEX idx_ai_assistant_logs_action_type ON ai_assistant_logs(action_type);

-- Index for faster queries by created_at
CREATE INDEX idx_ai_assistant_logs_created_at ON ai_assistant_logs(created_at DESC);

-- RLS Policies
ALTER TABLE ai_assistant_logs ENABLE ROW LEVEL SECURITY;

-- Admins can see their own logs
CREATE POLICY "Admins can view own ai_assistant_logs"
  ON ai_assistant_logs
  FOR SELECT
  USING (
    admin_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.id = ai_assistant_logs.admin_id
    )
  );

-- Super admins can see all logs
CREATE POLICY "Super admins can view all ai_assistant_logs"
  ON ai_assistant_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
      AND distributors.admin_role = 'super_admin'
    )
  );

-- Service role can insert (API will use service client)
CREATE POLICY "Service role can insert ai_assistant_logs"
  ON ai_assistant_logs
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE ai_assistant_logs IS 'Audit log for all AI-assisted admin actions';
COMMENT ON COLUMN ai_assistant_logs.user_message IS 'The natural language command from admin';
COMMENT ON COLUMN ai_assistant_logs.assistant_response IS 'The AI response/confirmation';
COMMENT ON COLUMN ai_assistant_logs.action_type IS 'Type of action (move_rep, suspend, etc)';
COMMENT ON COLUMN ai_assistant_logs.action_details IS 'JSON details of the action performed';
COMMENT ON COLUMN ai_assistant_logs.executed IS 'Whether the action was actually executed';
COMMENT ON COLUMN ai_assistant_logs.execution_result IS 'Result of execution (success/error)';
