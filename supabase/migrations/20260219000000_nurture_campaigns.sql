-- =============================================
-- AI Nurture Campaign System
-- Stores campaigns and scheduled emails
-- =============================================

CREATE TABLE nurture_campaigns (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_name  TEXT NOT NULL,
  prospect_email TEXT NOT NULL,
  prospect_context TEXT,
  product       TEXT NOT NULL DEFAULT 'Term Life',
  plan          TEXT NOT NULL DEFAULT 'free',   -- 'free' | 'starter'
  interval_days INTEGER NOT NULL DEFAULT 3,
  total_emails  INTEGER NOT NULL DEFAULT 2,
  emails_sent   INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'cancelled'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nurture_campaigns_user ON nurture_campaigns(user_id);
CREATE INDEX idx_nurture_campaigns_status ON nurture_campaigns(status);

ALTER TABLE nurture_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own campaigns"
  ON nurture_campaigns FOR ALL
  USING (auth.uid() = user_id);

-- ── nurture_emails ────────────────────────────────

CREATE TABLE nurture_emails (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id  UUID NOT NULL REFERENCES nurture_campaigns(id) ON DELETE CASCADE,
  email_number INTEGER NOT NULL,
  subject      TEXT NOT NULL,
  body         TEXT NOT NULL,
  send_at      TIMESTAMPTZ NOT NULL,
  sent_at      TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'scheduled' -- 'scheduled' | 'sent' | 'failed'
);

CREATE INDEX idx_nurture_emails_campaign ON nurture_emails(campaign_id);
CREATE INDEX idx_nurture_emails_send_at  ON nurture_emails(send_at) WHERE status = 'scheduled';

ALTER TABLE nurture_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own campaign emails"
  ON nurture_emails FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM nurture_campaigns WHERE user_id = auth.uid()
    )
  );
