-- =============================================
-- Email Nurture Campaign System
-- Tables for automated email sequences
-- =============================================

-- =============================================
-- Table 1: email_templates
-- Stores email template content and configuration
-- =============================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template identification
  template_key TEXT UNIQUE NOT NULL,
  template_name TEXT NOT NULL,
  description TEXT,

  -- Email content
  subject TEXT NOT NULL,
  body TEXT NOT NULL, -- HTML content
  preview_text TEXT, -- Email preview text (optional)

  -- Targeting and sequence
  licensing_status TEXT NOT NULL CHECK (licensing_status IN ('licensed', 'non_licensed', 'all')),
  sequence_order INTEGER NOT NULL, -- 0 for welcome, 1, 2, 3, etc.
  delay_days INTEGER NOT NULL DEFAULT 0, -- Days after signup to send (0 = immediate)

  -- Variables used in template
  variables_used TEXT[], -- Array of variable names like ['first_name', 'dashboard_link']

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- AI generation metadata
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT, -- Original prompt used to generate (if AI-generated)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES distributors(id) ON DELETE SET NULL,

  -- Ensure unique sequence per licensing status
  CONSTRAINT unique_sequence_per_status UNIQUE (licensing_status, sequence_order)
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_email_templates_licensing_status ON email_templates(licensing_status);
CREATE INDEX IF NOT EXISTS idx_email_templates_sequence ON email_templates(sequence_order);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;

-- =============================================
-- Table 2: email_campaigns
-- Tracks each distributor's progress through email sequence
-- =============================================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Distributor
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Campaign details
  licensing_status TEXT NOT NULL CHECK (licensing_status IN ('licensed', 'non_licensed')),
  current_step INTEGER DEFAULT 0, -- Which email in sequence (0 = welcome sent, 1 = next, etc.)

  -- Status
  is_active BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ, -- When campaign finished (optional)
  paused_at TIMESTAMPTZ, -- If user unsubscribes or pauses

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_email_sent_at TIMESTAMPTZ,
  next_email_scheduled_for TIMESTAMPTZ, -- Calculated field for when next email should send

  -- Metadata
  total_emails_sent INTEGER DEFAULT 0,

  -- Ensure one campaign per distributor
  CONSTRAINT unique_campaign_per_distributor UNIQUE (distributor_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_distributor ON email_campaigns(distributor_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_active ON email_campaigns(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_campaigns_next_scheduled ON email_campaigns(next_email_scheduled_for) WHERE is_active = true;

-- =============================================
-- Table 3: email_sends
-- Logs every email sent (audit trail)
-- =============================================
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who and what
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,

  -- Email details
  email_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL, -- Actual rendered content with variables replaced

  -- Sequence info
  sequence_step INTEGER NOT NULL,

  -- Send status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'opened', 'clicked')),
  sent_at TIMESTAMPTZ,
  failed_reason TEXT,

  -- External service tracking
  external_id TEXT, -- ID from email service (Resend, SendGrid, etc.)

  -- Engagement tracking (optional)
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_sends_distributor ON email_sends(distributor_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends(sent_at);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- Policies for email_templates (admin only)
DROP POLICY IF EXISTS email_templates_admin_all ON email_templates;
CREATE POLICY email_templates_admin_all ON email_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Policies for email_campaigns (users can view their own, admins can view all)
DROP POLICY IF EXISTS email_campaigns_users_own ON email_campaigns;
CREATE POLICY email_campaigns_users_own ON email_campaigns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.id = email_campaigns.distributor_id
      AND distributors.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS email_campaigns_admin_all ON email_campaigns;
CREATE POLICY email_campaigns_admin_all ON email_campaigns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Policies for email_sends (users can view their own, admins can view all)
DROP POLICY IF EXISTS email_sends_users_own ON email_sends;
CREATE POLICY email_sends_users_own ON email_sends
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.id = email_sends.distributor_id
      AND distributors.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS email_sends_admin_all ON email_sends;
CREATE POLICY email_sends_admin_all ON email_sends
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- =============================================
-- Seed Data: Default Email Templates
-- =============================================

-- Welcome email for Licensed Agents
INSERT INTO email_templates (
  template_key,
  template_name,
  description,
  subject,
  body,
  preview_text,
  licensing_status,
  sequence_order,
  delay_days,
  variables_used,
  is_active
) VALUES (
  'welcome_licensed',
  'Welcome - Licensed Agent',
  'Welcome email for newly registered licensed insurance agents',
  'Welcome to Apex Affinity Group, {first_name}! 🎉',
  $$<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2B4C7E;">Welcome aboard, {first_name}!</h2>

    <p>We're thrilled to have you join Apex Affinity Group as a Licensed Agent. You're about to embark on an exciting journey with unlimited earning potential.</p>

    <h3 style="color: #2B4C7E;">Your First Step: License Verification</h3>
    <p>To unlock all features in your dashboard, we need to verify your insurance license. This typically takes 24-48 hours.</p>

    <div style="text-align: center; margin: 25px 0;">
      <a href="{dashboard_link}" style="background: #2B4C7E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Go to Dashboard →
      </a>
    </div>

    <h3 style="color: #2B4C7E;">What Happens Next?</h3>
    <ul>
      <li>Access advanced commission tools</li>
      <li>Get your unique referral link</li>
      <li>Start building your team</li>
      <li>Access exclusive training materials</li>
    </ul>

    <p>Questions? Reply to this email anytime—we're here to help!</p>

    <p style="margin-top: 30px;">To your success,<br><strong>The Apex Affinity Group Team</strong></p>
  </div>$$,
  'Welcome to Apex! Let''s get your license verified and start building.',
  'licensed',
  0,
  0,
  ARRAY['first_name', 'dashboard_link'],
  true
) ON CONFLICT (licensing_status, sequence_order) DO NOTHING;

-- Welcome email for Non-Licensed Distributors
INSERT INTO email_templates (
  template_key,
  template_name,
  description,
  subject,
  body,
  preview_text,
  licensing_status,
  sequence_order,
  delay_days,
  variables_used,
  is_active
) VALUES (
  'welcome_non_licensed',
  'Welcome - Non-Licensed Distributor',
  'Welcome email for newly registered non-licensed distributors',
  'Welcome to Apex Affinity Group, {first_name}! 🎉',
  $$<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2B4C7E;">Welcome aboard, {first_name}!</h2>

    <p>We're excited to have you join Apex Affinity Group! You're now part of a growing network of entrepreneurs building successful referral businesses.</p>

    <h3 style="color: #2B4C7E;">Your First Steps</h3>
    <p>Your dashboard is ready and waiting for you. Here's what you can do right now:</p>

    <ul>
      <li><strong>Get your referral link</strong> - Share it with your network</li>
      <li><strong>Explore training materials</strong> - Learn proven strategies</li>
      <li><strong>Access marketing tools</strong> - Professional resources at your fingertips</li>
    </ul>

    <div style="text-align: center; margin: 25px 0;">
      <a href="{dashboard_link}" style="background: #2B4C7E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Explore Your Dashboard →
      </a>
    </div>

    <h3 style="color: #2B4C7E;">What's Next?</h3>
    <p>Over the next few weeks, we'll send you tips, strategies, and success stories to help you build your business. Stay engaged and watch your network grow!</p>

    <p>Questions? Reply to this email anytime.</p>

    <p style="margin-top: 30px;">Here's to your success,<br><strong>The Apex Affinity Group Team</strong></p>
  </div>$$,
  'Welcome to Apex! Your referral journey starts now.',
  'non_licensed',
  0,
  0,
  ARRAY['first_name', 'dashboard_link'],
  true
) ON CONFLICT (licensing_status, sequence_order) DO NOTHING;

-- =============================================
-- Helper Function: Calculate Next Email Date
-- =============================================
CREATE OR REPLACE FUNCTION calculate_next_email_date(
  campaign_started_at TIMESTAMPTZ,
  current_step INTEGER,
  delay_days INTEGER
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN campaign_started_at + (delay_days || ' days')::INTERVAL;
END;
$$;

-- =============================================
-- Trigger: Update updated_at on email_templates
-- =============================================
CREATE OR REPLACE FUNCTION update_email_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_templates_updated_at ON email_templates;
CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_template_updated_at();
