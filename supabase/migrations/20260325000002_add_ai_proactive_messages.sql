-- Create ai_proactive_messages table for proactive AI engagement
CREATE TABLE IF NOT EXISTS ai_proactive_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('motivation', 'congratulations', 'encouragement', 'notification', 'reminder')),
  message_content TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX ai_proactive_messages_distributor_idx ON ai_proactive_messages(distributor_id);
CREATE INDEX ai_proactive_messages_read_idx ON ai_proactive_messages(distributor_id, read_at) WHERE read_at IS NULL;
CREATE INDEX ai_proactive_messages_triggered_idx ON ai_proactive_messages(triggered_at DESC);

-- Add RLS policies
ALTER TABLE ai_proactive_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own messages
CREATE POLICY "Users can view own proactive messages"
  ON ai_proactive_messages
  FOR SELECT
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update own proactive messages"
  ON ai_proactive_messages
  FOR UPDATE
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Service role can insert messages
CREATE POLICY "Service role can insert proactive messages"
  ON ai_proactive_messages
  FOR INSERT
  WITH CHECK (true);

-- Add preferred_language column to distributors table
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- Add comment
COMMENT ON TABLE ai_proactive_messages IS 'Stores AI-generated proactive messages for users based on activity triggers';
COMMENT ON COLUMN distributors.preferred_language IS 'User preferred language for AI chat (en, es, fr, pt, etc.)';
