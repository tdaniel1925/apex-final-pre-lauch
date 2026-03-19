-- =============================================
-- APEX LEAD AUTOPILOT ADDITIONS
-- Add Lead Autopilot specific tables without conflicting with existing CRM
-- =============================================
-- Migration: 20260318000005
-- Created: 2026-03-18
-- =============================================

-- NOTE: This migration works alongside existing crm_contacts, crm_tasks,
-- team_broadcasts, social_content, and training tables

-- =============================================
-- TABLE 1: AUTOPILOT SUBSCRIPTIONS
-- Tracks subscription tiers for the lead automation system
-- =============================================

CREATE TABLE IF NOT EXISTS autopilot_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Subscriber
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Subscription tier
  tier TEXT NOT NULL CHECK (tier IN ('free', 'social_connector', 'lead_autopilot_pro', 'team_edition')),

  -- Subscription status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')),

  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,

  -- Billing periods
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Trial tracking
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Cancellation
  canceled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,

  -- Payment tracking
  last_payment_date TIMESTAMPTZ,
  last_payment_amount NUMERIC(10, 2),
  next_payment_date TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One active subscription per distributor
  UNIQUE(distributor_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_subscriptions_distributor ON autopilot_subscriptions(distributor_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_subscriptions_tier ON autopilot_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_autopilot_subscriptions_status ON autopilot_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_autopilot_subscriptions_stripe_sub ON autopilot_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_subscriptions_stripe_customer ON autopilot_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_subscriptions_trial_end ON autopilot_subscriptions(trial_end) WHERE trial_end IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_autopilot_subscriptions_next_payment ON autopilot_subscriptions(next_payment_date) WHERE next_payment_date IS NOT NULL;

-- Comments
COMMENT ON TABLE autopilot_subscriptions IS 'Subscription tiers for the Apex Lead Autopilot system';
COMMENT ON COLUMN autopilot_subscriptions.tier IS 'free, social_connector ($9), lead_autopilot_pro ($79), team_edition ($119)';

-- =============================================
-- TABLE 2: MEETING INVITATIONS
-- Email invites to meetings with tracking
-- =============================================

CREATE TABLE IF NOT EXISTS meeting_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sender
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Recipient
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_phone TEXT,

  -- Meeting details
  meeting_title TEXT NOT NULL,
  meeting_description TEXT,
  meeting_date_time TIMESTAMPTZ NOT NULL,
  meeting_duration_minutes INTEGER DEFAULT 60,
  meeting_location TEXT,
  meeting_link TEXT,
  meeting_timezone TEXT DEFAULT 'America/Chicago',

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN (
    'draft', 'sent', 'opened', 'responded_yes', 'responded_no',
    'responded_maybe', 'expired', 'canceled'
  )),

  -- Engagement tracking
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  open_count INTEGER DEFAULT 0,
  responded_at TIMESTAMPTZ,
  response_type TEXT CHECK (response_type IN ('yes', 'no', 'maybe', NULL)),
  response_notes TEXT,

  -- Reminder tracking
  reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,

  -- Follow-up
  follow_up_sent BOOLEAN DEFAULT FALSE,
  follow_up_sent_at TIMESTAMPTZ,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Metadata
  custom_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_distributor ON meeting_invitations(distributor_id);
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_status ON meeting_invitations(status);
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_recipient_email ON meeting_invitations(recipient_email);
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_meeting_date ON meeting_invitations(meeting_date_time);
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_sent_at ON meeting_invitations(sent_at);

-- Comments
COMMENT ON TABLE meeting_invitations IS 'Meeting invitations sent via email with response tracking';

-- =============================================
-- TABLE 3: EVENT FLYERS
-- Pre-made event flyers ($9 tier)
-- =============================================

CREATE TABLE IF NOT EXISTS event_flyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Template
  flyer_template_id TEXT NOT NULL,
  flyer_template_name TEXT,

  -- Event details
  flyer_title TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  event_time TEXT,
  event_location TEXT,
  event_address TEXT,
  event_description TEXT,

  -- Customization
  custom_text TEXT,
  custom_colors JSONB,
  custom_logo_url TEXT,

  -- Generated output
  generated_image_url TEXT,
  generated_pdf_url TEXT,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'failed')),
  generation_error TEXT,

  -- Contact info
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_website TEXT,

  -- Usage tracking
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  shared_count INTEGER DEFAULT 0,
  last_shared_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_flyers_distributor ON event_flyers(distributor_id);
CREATE INDEX IF NOT EXISTS idx_event_flyers_template ON event_flyers(flyer_template_id);
CREATE INDEX IF NOT EXISTS idx_event_flyers_status ON event_flyers(status);
CREATE INDEX IF NOT EXISTS idx_event_flyers_event_date ON event_flyers(event_date) WHERE event_date IS NOT NULL;

-- Comments
COMMENT ON TABLE event_flyers IS 'Pre-made event flyers for meetings (Social Connector $9 tier)';

-- =============================================
-- TABLE 4: SMS CAMPAIGNS
-- Bulk SMS automation ($79 tier)
-- =============================================

CREATE TABLE IF NOT EXISTS sms_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Campaign details
  campaign_name TEXT NOT NULL,
  message_content TEXT NOT NULL,

  -- Character count for pricing
  character_count INTEGER GENERATED ALWAYS AS (LENGTH(message_content)) STORED,
  estimated_segments INTEGER GENERATED ALWAYS AS (CEIL(LENGTH(message_content)::NUMERIC / 160)) STORED,

  -- Recipients
  recipient_list_type TEXT CHECK (recipient_list_type IN ('all_contacts', 'filtered', 'custom_list', 'single')),
  recipient_filter JSONB,
  recipient_contact_ids UUID[],
  recipient_phone_numbers TEXT[],

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  send_immediately BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'scheduled', 'sending', 'completed', 'failed', 'canceled'
  )),

  -- Delivery tracking
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,

  -- Response tracking
  total_responses INTEGER DEFAULT 0,
  total_opt_outs INTEGER DEFAULT 0,

  -- Cost tracking
  estimated_cost NUMERIC(10, 2),
  actual_cost NUMERIC(10, 2),

  -- Error handling
  error_message TEXT,
  failed_recipients JSONB,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_distributor ON sms_campaigns(distributor_id);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_scheduled_for ON sms_campaigns(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_sent_at ON sms_campaigns(sent_at) WHERE sent_at IS NOT NULL;

-- Comments
COMMENT ON TABLE sms_campaigns IS 'Bulk SMS campaigns with automation (Lead Autopilot Pro $79 tier)';

-- =============================================
-- TABLE 5: SMS MESSAGES
-- Individual SMS messages within campaigns
-- =============================================

CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign link
  campaign_id UUID REFERENCES sms_campaigns(id) ON DELETE CASCADE,
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Recipient
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,

  -- Message content
  message_content TEXT NOT NULL,

  -- Delivery status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced'
  )),

  -- External provider tracking
  provider_message_id TEXT,
  provider_name TEXT,

  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  error_code TEXT,

  -- Response tracking
  response_received BOOLEAN DEFAULT FALSE,
  response_text TEXT,
  responded_at TIMESTAMPTZ,

  -- Cost
  cost NUMERIC(10, 4),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sms_messages_campaign ON sms_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_distributor ON sms_messages(distributor_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_contact ON sms_messages(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sms_messages_status ON sms_messages(status);
CREATE INDEX IF NOT EXISTS idx_sms_messages_recipient_phone ON sms_messages(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_sms_messages_provider_id ON sms_messages(provider_message_id) WHERE provider_message_id IS NOT NULL;

-- Comments
COMMENT ON TABLE sms_messages IS 'Individual SMS messages within campaigns';

-- =============================================
-- TABLE 6: AUTOPILOT USAGE LIMITS
-- Track usage against tier limits
-- =============================================

CREATE TABLE IF NOT EXISTS autopilot_usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor (one record per distributor)
  distributor_id UUID NOT NULL UNIQUE REFERENCES distributors(id) ON DELETE CASCADE,

  -- Current tier
  tier TEXT NOT NULL CHECK (tier IN ('free', 'social_connector', 'lead_autopilot_pro', 'team_edition')),

  -- Email invitations
  email_invites_used_this_month INTEGER DEFAULT 0,
  email_invites_limit INTEGER NOT NULL,

  -- SMS messages
  sms_sent_this_month INTEGER DEFAULT 0,
  sms_limit INTEGER NOT NULL,

  -- CRM contacts
  contacts_count INTEGER DEFAULT 0,
  contacts_limit INTEGER NOT NULL,

  -- Social posts
  social_posts_this_month INTEGER DEFAULT 0,
  social_posts_limit INTEGER NOT NULL,

  -- Event flyers
  flyers_created_this_month INTEGER DEFAULT 0,
  flyers_limit INTEGER NOT NULL,

  -- Team broadcasts
  broadcasts_this_month INTEGER DEFAULT 0,
  broadcasts_limit INTEGER NOT NULL,

  -- Training shares
  training_shares_this_month INTEGER DEFAULT 0,
  training_shares_limit INTEGER NOT NULL,

  -- Meeting invitations
  meetings_created_this_month INTEGER DEFAULT 0,
  meetings_limit INTEGER NOT NULL,

  -- Reset tracking
  current_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  current_period_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  next_reset_at DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),

  -- Overage tracking
  has_overages BOOLEAN DEFAULT FALSE,
  overage_details JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_usage_distributor ON autopilot_usage_limits(distributor_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_usage_tier ON autopilot_usage_limits(tier);
CREATE INDEX IF NOT EXISTS idx_autopilot_usage_next_reset ON autopilot_usage_limits(next_reset_at);

-- Comments
COMMENT ON TABLE autopilot_usage_limits IS 'Track usage against tier limits for each distributor';

-- =============================================
-- AUTO-UPDATE TRIGGERS
-- =============================================

CREATE TRIGGER update_autopilot_subscriptions_updated_at
  BEFORE UPDATE ON autopilot_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_invitations_updated_at
  BEFORE UPDATE ON meeting_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_flyers_updated_at
  BEFORE UPDATE ON event_flyers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_campaigns_updated_at
  BEFORE UPDATE ON sms_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_messages_updated_at
  BEFORE UPDATE ON sms_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_autopilot_usage_limits_updated_at
  BEFORE UPDATE ON autopilot_usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE autopilot_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_flyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopilot_usage_limits ENABLE ROW LEVEL SECURITY;

-- Autopilot Subscriptions Policies
CREATE POLICY "Distributors can view own subscription"
  ON autopilot_subscriptions FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can manage subscriptions"
  ON autopilot_subscriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

-- Meeting Invitations Policies
CREATE POLICY "Distributors can manage own invitations"
  ON meeting_invitations FOR ALL
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can manage all invitations"
  ON meeting_invitations FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

-- Event Flyers Policies
CREATE POLICY "Distributors can manage own flyers"
  ON event_flyers FOR ALL
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can manage all flyers"
  ON event_flyers FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

-- SMS Campaigns Policies
CREATE POLICY "Distributors can manage own campaigns"
  ON sms_campaigns FOR ALL
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can manage all campaigns"
  ON sms_campaigns FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

-- SMS Messages Policies
CREATE POLICY "Distributors can manage own messages"
  ON sms_messages FOR ALL
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can manage all messages"
  ON sms_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

-- Usage Limits Policies
CREATE POLICY "Distributors can view own usage"
  ON autopilot_usage_limits FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can manage usage limits"
  ON autopilot_usage_limits FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Initialize usage limits when subscription is created
CREATE OR REPLACE FUNCTION initialize_autopilot_usage_limits()
RETURNS TRIGGER AS $$
DECLARE
  email_limit INTEGER;
  sms_limit INTEGER;
  contacts_limit INTEGER;
  social_limit INTEGER;
  flyers_limit INTEGER;
  broadcasts_limit INTEGER;
  training_limit INTEGER;
  meetings_limit INTEGER;
BEGIN
  -- Set limits based on tier
  CASE NEW.tier
    WHEN 'free' THEN
      email_limit := 10; sms_limit := 0; contacts_limit := 0; social_limit := 0;
      flyers_limit := 0; broadcasts_limit := 0; training_limit := 0; meetings_limit := 10;
    WHEN 'social_connector' THEN
      email_limit := 50; sms_limit := 0; contacts_limit := 0; social_limit := 30;
      flyers_limit := 10; broadcasts_limit := 0; training_limit := 0; meetings_limit := 50;
    WHEN 'lead_autopilot_pro' THEN
      email_limit := -1; sms_limit := 1000; contacts_limit := 500; social_limit := 100;
      flyers_limit := 50; broadcasts_limit := 0; training_limit := 0; meetings_limit := -1;
    WHEN 'team_edition' THEN
      email_limit := -1; sms_limit := -1; contacts_limit := -1; social_limit := -1;
      flyers_limit := -1; broadcasts_limit := -1; training_limit := -1; meetings_limit := -1;
  END CASE;

  INSERT INTO autopilot_usage_limits (
    distributor_id, tier, email_invites_limit, sms_limit, contacts_limit,
    social_posts_limit, flyers_limit, broadcasts_limit, training_shares_limit, meetings_limit
  ) VALUES (
    NEW.distributor_id, NEW.tier, email_limit, sms_limit, contacts_limit,
    social_limit, flyers_limit, broadcasts_limit, training_limit, meetings_limit
  )
  ON CONFLICT (distributor_id) DO UPDATE SET
    tier = NEW.tier,
    email_invites_limit = email_limit,
    sms_limit = sms_limit,
    contacts_limit = contacts_limit,
    social_posts_limit = social_limit,
    flyers_limit = flyers_limit,
    broadcasts_limit = broadcasts_limit,
    training_shares_limit = training_limit,
    meetings_limit = meetings_limit,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_usage_limits_on_subscription
  AFTER INSERT OR UPDATE OF tier ON autopilot_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION initialize_autopilot_usage_limits();

-- Check if distributor has reached tier limit
CREATE OR REPLACE FUNCTION check_autopilot_limit(
  p_distributor_id UUID,
  p_limit_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  usage_record RECORD;
  current_usage INTEGER;
  limit_value INTEGER;
BEGIN
  SELECT * INTO usage_record FROM autopilot_usage_limits WHERE distributor_id = p_distributor_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  CASE p_limit_type
    WHEN 'email' THEN current_usage := usage_record.email_invites_used_this_month; limit_value := usage_record.email_invites_limit;
    WHEN 'sms' THEN current_usage := usage_record.sms_sent_this_month; limit_value := usage_record.sms_limit;
    WHEN 'contacts' THEN current_usage := usage_record.contacts_count; limit_value := usage_record.contacts_limit;
    WHEN 'social' THEN current_usage := usage_record.social_posts_this_month; limit_value := usage_record.social_posts_limit;
    WHEN 'flyers' THEN current_usage := usage_record.flyers_created_this_month; limit_value := usage_record.flyers_limit;
    WHEN 'broadcasts' THEN current_usage := usage_record.broadcasts_this_month; limit_value := usage_record.broadcasts_limit;
    WHEN 'training' THEN current_usage := usage_record.training_shares_this_month; limit_value := usage_record.training_shares_limit;
    WHEN 'meetings' THEN current_usage := usage_record.meetings_created_this_month; limit_value := usage_record.meetings_limit;
    ELSE RETURN FALSE;
  END CASE;

  IF limit_value = -1 THEN RETURN TRUE; END IF;
  RETURN current_usage < limit_value;
END;
$$ LANGUAGE plpgsql;

-- Increment usage counter
CREATE OR REPLACE FUNCTION increment_autopilot_usage(
  p_distributor_id UUID,
  p_limit_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
BEGIN
  CASE p_limit_type
    WHEN 'email' THEN
      UPDATE autopilot_usage_limits SET email_invites_used_this_month = email_invites_used_this_month + p_increment WHERE distributor_id = p_distributor_id;
    WHEN 'sms' THEN
      UPDATE autopilot_usage_limits SET sms_sent_this_month = sms_sent_this_month + p_increment WHERE distributor_id = p_distributor_id;
    WHEN 'contacts' THEN
      UPDATE autopilot_usage_limits SET contacts_count = contacts_count + p_increment WHERE distributor_id = p_distributor_id;
    WHEN 'social' THEN
      UPDATE autopilot_usage_limits SET social_posts_this_month = social_posts_this_month + p_increment WHERE distributor_id = p_distributor_id;
    WHEN 'flyers' THEN
      UPDATE autopilot_usage_limits SET flyers_created_this_month = flyers_created_this_month + p_increment WHERE distributor_id = p_distributor_id;
    WHEN 'broadcasts' THEN
      UPDATE autopilot_usage_limits SET broadcasts_this_month = broadcasts_this_month + p_increment WHERE distributor_id = p_distributor_id;
    WHEN 'training' THEN
      UPDATE autopilot_usage_limits SET training_shares_this_month = training_shares_this_month + p_increment WHERE distributor_id = p_distributor_id;
    WHEN 'meetings' THEN
      UPDATE autopilot_usage_limits SET meetings_created_this_month = meetings_created_this_month + p_increment WHERE distributor_id = p_distributor_id;
    ELSE RETURN FALSE;
  END CASE;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Reset monthly usage counters (run via cron)
CREATE OR REPLACE FUNCTION reset_autopilot_usage_counters()
RETURNS INTEGER AS $$
DECLARE
  rows_reset INTEGER;
BEGIN
  UPDATE autopilot_usage_limits
  SET
    email_invites_used_this_month = 0,
    sms_sent_this_month = 0,
    social_posts_this_month = 0,
    flyers_created_this_month = 0,
    broadcasts_this_month = 0,
    training_shares_this_month = 0,
    meetings_created_this_month = 0,
    current_period_start = CURRENT_DATE,
    current_period_end = CURRENT_DATE + INTERVAL '1 month',
    next_reset_at = CURRENT_DATE + INTERVAL '1 month',
    updated_at = NOW()
  WHERE next_reset_at <= CURRENT_DATE;

  GET DIAGNOSTICS rows_reset = ROW_COUNT;
  RETURN rows_reset;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
