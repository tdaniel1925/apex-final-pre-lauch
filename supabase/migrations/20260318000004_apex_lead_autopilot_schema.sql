-- =============================================
-- APEX LEAD AUTOPILOT SYSTEM
-- 4-tier meeting invitation and lead automation system
-- =============================================
-- Migration: 20260318000004
-- Created: 2026-03-18
-- =============================================

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

-- Indexes for autopilot_subscriptions
CREATE INDEX idx_autopilot_subscriptions_distributor ON autopilot_subscriptions(distributor_id);
CREATE INDEX idx_autopilot_subscriptions_tier ON autopilot_subscriptions(tier);
CREATE INDEX idx_autopilot_subscriptions_status ON autopilot_subscriptions(status);
CREATE INDEX idx_autopilot_subscriptions_stripe_sub ON autopilot_subscriptions(stripe_subscription_id);
CREATE INDEX idx_autopilot_subscriptions_stripe_customer ON autopilot_subscriptions(stripe_customer_id);
CREATE INDEX idx_autopilot_subscriptions_trial_end ON autopilot_subscriptions(trial_end) WHERE trial_end IS NOT NULL;
CREATE INDEX idx_autopilot_subscriptions_next_payment ON autopilot_subscriptions(next_payment_date) WHERE next_payment_date IS NOT NULL;

-- Comments
COMMENT ON TABLE autopilot_subscriptions IS 'Subscription tiers for the Apex Lead Autopilot system';
COMMENT ON COLUMN autopilot_subscriptions.tier IS 'free, social_connector ($9), lead_autopilot_pro ($79), team_edition ($119)';
COMMENT ON COLUMN autopilot_subscriptions.status IS 'active, canceled, past_due, trialing, paused';

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
  meeting_location TEXT, -- 'virtual' or physical address
  meeting_link TEXT, -- Zoom/Teams/Google Meet link
  meeting_timezone TEXT DEFAULT 'America/Chicago',

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN (
    'draft',
    'sent',
    'opened',
    'responded_yes',
    'responded_no',
    'responded_maybe',
    'expired',
    'canceled'
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

  -- Follow-up tracking
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

-- Indexes for meeting_invitations
CREATE INDEX idx_meeting_invitations_distributor ON meeting_invitations(distributor_id);
CREATE INDEX idx_meeting_invitations_status ON meeting_invitations(status);
CREATE INDEX idx_meeting_invitations_recipient_email ON meeting_invitations(recipient_email);
CREATE INDEX idx_meeting_invitations_meeting_date ON meeting_invitations(meeting_date_time);
CREATE INDEX idx_meeting_invitations_sent_at ON meeting_invitations(sent_at);
CREATE INDEX idx_meeting_invitations_response_type ON meeting_invitations(response_type) WHERE response_type IS NOT NULL;
CREATE INDEX idx_meeting_invitations_expires_at ON meeting_invitations(expires_at) WHERE expires_at IS NOT NULL;

-- Comments
COMMENT ON TABLE meeting_invitations IS 'Meeting invitations sent via email with response tracking';
COMMENT ON COLUMN meeting_invitations.status IS 'draft, sent, opened, responded_yes, responded_no, responded_maybe, expired, canceled';
COMMENT ON COLUMN meeting_invitations.open_count IS 'Number of times recipient opened the invitation';

-- =============================================
-- TABLE 3: SOCIAL POSTS
-- Social media scheduling and posting ($9 tier)
-- =============================================

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Platform
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'twitter', 'x')),

  -- Content
  post_content TEXT NOT NULL,
  image_url TEXT,
  image_urls TEXT[], -- Multiple images for carousel posts
  video_url TEXT,
  link_url TEXT,
  hashtags TEXT[],

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posting', 'posted', 'failed', 'canceled')),
  error_message TEXT,

  -- Engagement metrics
  engagement_metrics JSONB DEFAULT '{
    "likes": 0,
    "shares": 0,
    "comments": 0,
    "clicks": 0,
    "impressions": 0,
    "reach": 0
  }'::jsonb,

  -- External platform data
  platform_post_id TEXT,
  platform_post_url TEXT,

  -- Metadata
  is_flyer_post BOOLEAN DEFAULT FALSE,
  flyer_template_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for social_posts
CREATE INDEX idx_social_posts_distributor ON social_posts(distributor_id);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_scheduled_for ON social_posts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_social_posts_posted_at ON social_posts(posted_at) WHERE posted_at IS NOT NULL;
CREATE INDEX idx_social_posts_is_flyer ON social_posts(is_flyer_post) WHERE is_flyer_post = TRUE;

-- Comments
COMMENT ON TABLE social_posts IS 'Social media posts scheduling and tracking (Social Connector $9 tier)';
COMMENT ON COLUMN social_posts.platform IS 'facebook, instagram, linkedin, twitter, x';
COMMENT ON COLUMN social_posts.status IS 'draft, scheduled, posting, posted, failed, canceled';
COMMENT ON COLUMN social_posts.engagement_metrics IS 'JSONB storing likes, shares, comments, clicks, impressions, reach';

-- =============================================
-- TABLE 4: EVENT FLYERS
-- Pre-made event flyers ($9 tier)
-- =============================================

CREATE TABLE IF NOT EXISTS event_flyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Template
  flyer_template_id TEXT NOT NULL, -- References template in system
  flyer_template_name TEXT,

  -- Event details
  flyer_title TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  event_time TEXT, -- Formatted time string (e.g., "7:00 PM EST")
  event_location TEXT,
  event_address TEXT,
  event_description TEXT,

  -- Customization
  custom_text TEXT,
  custom_colors JSONB, -- { "primary": "#FF0000", "secondary": "#0000FF" }
  custom_logo_url TEXT,

  -- Generated output
  generated_image_url TEXT,
  generated_pdf_url TEXT,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'failed')),
  generation_error TEXT,

  -- Contact info on flyer
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

-- Indexes for event_flyers
CREATE INDEX idx_event_flyers_distributor ON event_flyers(distributor_id);
CREATE INDEX idx_event_flyers_template ON event_flyers(flyer_template_id);
CREATE INDEX idx_event_flyers_status ON event_flyers(status);
CREATE INDEX idx_event_flyers_event_date ON event_flyers(event_date) WHERE event_date IS NOT NULL;
CREATE INDEX idx_event_flyers_created_at ON event_flyers(created_at DESC);

-- Comments
COMMENT ON TABLE event_flyers IS 'Pre-made event flyers for meetings (Social Connector $9 tier)';
COMMENT ON COLUMN event_flyers.status IS 'draft, generating, ready, failed';

-- =============================================
-- TABLE 5: CRM CONTACTS
-- Full CRM with 500 contact limit ($79 tier)
-- =============================================

CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Basic info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,

  -- Additional contact info
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'United States',

  -- Lead tracking
  lead_source TEXT, -- 'website', 'referral', 'event', 'cold_call', 'social_media'
  lead_source_details TEXT,
  lead_status TEXT DEFAULT 'new' CHECK (lead_status IN (
    'new',
    'contacted',
    'qualified',
    'unqualified',
    'nurturing',
    'converted',
    'lost'
  )),

  -- AI lead scoring (0-100)
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_score_factors JSONB, -- AI explanation of score
  last_score_updated_at TIMESTAMPTZ,

  -- Engagement tracking
  last_contact_date TIMESTAMPTZ,
  last_contact_type TEXT, -- 'email', 'call', 'meeting', 'sms'
  next_followup_date TIMESTAMPTZ,
  contact_frequency TEXT, -- 'daily', 'weekly', 'monthly'

  -- Communication preferences
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'whatsapp', NULL)),
  do_not_contact BOOLEAN DEFAULT FALSE,
  email_opt_in BOOLEAN DEFAULT TRUE,
  sms_opt_in BOOLEAN DEFAULT FALSE,

  -- Notes and tags
  notes JSONB DEFAULT '[]'::jsonb, -- Array of note objects with timestamp
  tags TEXT[], -- Flexible tagging system
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Relationship
  relationship_stage TEXT, -- 'cold', 'warm', 'hot', 'customer'
  converted_to_distributor_id UUID REFERENCES distributors(id),
  converted_at TIMESTAMPTZ,

  -- Lifecycle
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  archived_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for crm_contacts
CREATE INDEX idx_crm_contacts_distributor ON crm_contacts(distributor_id);
CREATE INDEX idx_crm_contacts_email ON crm_contacts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_crm_contacts_phone ON crm_contacts(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_crm_contacts_lead_status ON crm_contacts(lead_status);
CREATE INDEX idx_crm_contacts_lead_score ON crm_contacts(lead_score DESC);
CREATE INDEX idx_crm_contacts_next_followup ON crm_contacts(next_followup_date) WHERE next_followup_date IS NOT NULL;
CREATE INDEX idx_crm_contacts_tags ON crm_contacts USING GIN(tags);
CREATE INDEX idx_crm_contacts_archived ON crm_contacts(is_archived);
CREATE INDEX idx_crm_contacts_converted ON crm_contacts(converted_to_distributor_id) WHERE converted_to_distributor_id IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_crm_contacts_fulltext ON crm_contacts USING GIN(
  to_tsvector('english',
    COALESCE(first_name, '') || ' ' ||
    COALESCE(last_name, '') || ' ' ||
    COALESCE(email, '') || ' ' ||
    COALESCE(company, '')
  )
);

-- Comments
COMMENT ON TABLE crm_contacts IS 'CRM contacts with AI lead scoring (Lead Autopilot Pro $79 tier, 500 contact limit)';
COMMENT ON COLUMN crm_contacts.lead_status IS 'new, contacted, qualified, unqualified, nurturing, converted, lost';
COMMENT ON COLUMN crm_contacts.lead_score IS 'AI-generated score from 0-100';
COMMENT ON COLUMN crm_contacts.notes IS 'JSONB array of note objects with timestamp and content';

-- =============================================
-- TABLE 6: CRM PIPELINE
-- Sales pipeline tracking ($79 tier)
-- =============================================

CREATE TABLE IF NOT EXISTS crm_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,

  -- Pipeline stage
  stage TEXT NOT NULL CHECK (stage IN (
    'prospect',
    'contacted',
    'demo_scheduled',
    'demo_completed',
    'proposal_sent',
    'negotiation',
    'closed_won',
    'closed_lost'
  )),

  previous_stage TEXT,
  stage_changed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Deal details
  deal_name TEXT,
  estimated_value NUMERIC(10, 2),
  actual_value NUMERIC(10, 2),
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,

  -- Tracking
  days_in_stage INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM NOW() - stage_changed_at)::INTEGER
  ) STORED,

  -- Loss reasons (for closed_lost)
  lost_reason TEXT,
  lost_reason_details TEXT,

  -- Win details (for closed_won)
  won_product TEXT,
  won_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for crm_pipeline
CREATE INDEX idx_crm_pipeline_distributor ON crm_pipeline(distributor_id);
CREATE INDEX idx_crm_pipeline_contact ON crm_pipeline(contact_id);
CREATE INDEX idx_crm_pipeline_stage ON crm_pipeline(stage);
CREATE INDEX idx_crm_pipeline_expected_close ON crm_pipeline(expected_close_date) WHERE expected_close_date IS NOT NULL;
CREATE INDEX idx_crm_pipeline_probability ON crm_pipeline(probability DESC) WHERE probability IS NOT NULL;

-- Comments
COMMENT ON TABLE crm_pipeline IS 'Sales pipeline stages for CRM contacts';
COMMENT ON COLUMN crm_pipeline.stage IS 'prospect, contacted, demo_scheduled, demo_completed, proposal_sent, negotiation, closed_won, closed_lost';
COMMENT ON COLUMN crm_pipeline.days_in_stage IS 'Auto-calculated days spent in current stage';

-- =============================================
-- TABLE 7: CRM TASKS
-- Task management for follow-ups ($79 tier)
-- =============================================

CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Related contact (optional)
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,

  -- Task details
  task_type TEXT NOT NULL CHECK (task_type IN ('call', 'email', 'meeting', 'follow_up', 'sms', 'other')),
  title TEXT NOT NULL,
  description TEXT,

  -- Scheduling
  due_date TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,

  -- Priority
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  recurrence_end_date DATE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for crm_tasks
CREATE INDEX idx_crm_tasks_distributor ON crm_tasks(distributor_id);
CREATE INDEX idx_crm_tasks_contact ON crm_tasks(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_crm_tasks_status ON crm_tasks(status);
CREATE INDEX idx_crm_tasks_priority ON crm_tasks(priority);
CREATE INDEX idx_crm_tasks_due_date ON crm_tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_crm_tasks_reminder ON crm_tasks(reminder_at) WHERE reminder_at IS NOT NULL AND reminder_sent = FALSE;

-- Comments
COMMENT ON TABLE crm_tasks IS 'Task management for CRM follow-ups and activities';
COMMENT ON COLUMN crm_tasks.task_type IS 'call, email, meeting, follow_up, sms, other';
COMMENT ON COLUMN crm_tasks.priority IS 'low, medium, high, urgent';
COMMENT ON COLUMN crm_tasks.status IS 'pending, in_progress, completed, canceled';

-- =============================================
-- TABLE 8: SMS CAMPAIGNS
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
  recipient_filter JSONB, -- Filter criteria for 'filtered' type
  recipient_contact_ids UUID[], -- Specific contact IDs
  recipient_phone_numbers TEXT[], -- Custom phone numbers

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  send_immediately BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'scheduled',
    'sending',
    'completed',
    'failed',
    'canceled'
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
  failed_recipients JSONB, -- Array of failed recipients with reasons

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sms_campaigns
CREATE INDEX idx_sms_campaigns_distributor ON sms_campaigns(distributor_id);
CREATE INDEX idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX idx_sms_campaigns_scheduled_for ON sms_campaigns(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_sms_campaigns_sent_at ON sms_campaigns(sent_at) WHERE sent_at IS NOT NULL;

-- Comments
COMMENT ON TABLE sms_campaigns IS 'Bulk SMS campaigns with automation (Lead Autopilot Pro $79 tier)';
COMMENT ON COLUMN sms_campaigns.status IS 'draft, scheduled, sending, completed, failed, canceled';
COMMENT ON COLUMN sms_campaigns.estimated_segments IS 'Number of SMS segments (160 chars each) for pricing';

-- =============================================
-- TABLE 9: SMS MESSAGES
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
    'pending',
    'queued',
    'sending',
    'sent',
    'delivered',
    'failed',
    'bounced'
  )),

  -- External provider tracking
  provider_message_id TEXT,
  provider_name TEXT, -- 'twilio', 'plivo', etc.

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

-- Indexes for sms_messages
CREATE INDEX idx_sms_messages_campaign ON sms_messages(campaign_id);
CREATE INDEX idx_sms_messages_distributor ON sms_messages(distributor_id);
CREATE INDEX idx_sms_messages_contact ON sms_messages(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_sms_messages_status ON sms_messages(status);
CREATE INDEX idx_sms_messages_recipient_phone ON sms_messages(recipient_phone);
CREATE INDEX idx_sms_messages_provider_id ON sms_messages(provider_message_id) WHERE provider_message_id IS NOT NULL;

-- Comments
COMMENT ON TABLE sms_messages IS 'Individual SMS messages within campaigns';
COMMENT ON COLUMN sms_messages.status IS 'pending, queued, sending, sent, delivered, failed, bounced';

-- =============================================
-- TABLE 10: TEAM BROADCASTS
-- Team communication ($119 tier)
-- =============================================

CREATE TABLE IF NOT EXISTS team_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sender
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  sender_name TEXT,

  -- Broadcast details
  broadcast_type TEXT NOT NULL CHECK (broadcast_type IN ('email', 'sms', 'in_app', 'push')),
  subject TEXT, -- For email
  content TEXT NOT NULL,

  -- Attachments (for email)
  attachment_urls TEXT[],

  -- Recipients (downline targeting)
  send_to_all_downline BOOLEAN DEFAULT TRUE,
  send_to_downline_levels INTEGER[], -- [1, 2, 3] = first 3 levels
  send_to_specific_ranks TEXT[], -- ['associate', 'manager', 'director']
  send_to_specific_distributors UUID[], -- Specific distributor IDs

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'scheduled',
    'sending',
    'sent',
    'failed',
    'canceled'
  )),

  -- Delivery tracking
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,

  -- Engagement tracking (for email and in-app)
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_responded INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,

  -- Error handling
  error_message TEXT,

  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_announcement BOOLEAN DEFAULT FALSE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for team_broadcasts
CREATE INDEX idx_team_broadcasts_distributor ON team_broadcasts(distributor_id);
CREATE INDEX idx_team_broadcasts_type ON team_broadcasts(broadcast_type);
CREATE INDEX idx_team_broadcasts_status ON team_broadcasts(status);
CREATE INDEX idx_team_broadcasts_scheduled_for ON team_broadcasts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_team_broadcasts_sent_at ON team_broadcasts(sent_at) WHERE sent_at IS NOT NULL;
CREATE INDEX idx_team_broadcasts_priority ON team_broadcasts(priority);

-- Comments
COMMENT ON TABLE team_broadcasts IS 'Team communications to downline (Team Edition $119 tier)';
COMMENT ON COLUMN team_broadcasts.broadcast_type IS 'email, sms, in_app, push';
COMMENT ON COLUMN team_broadcasts.send_to_downline_levels IS 'Array of levels to send to (e.g., [1,2,3])';

-- =============================================
-- TABLE 11: TRAINING SHARES
-- Share training videos with downline ($119 tier)
-- =============================================

CREATE TABLE IF NOT EXISTS training_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sharer
  shared_by_distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  shared_by_name TEXT,

  -- Recipient
  shared_with_distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  shared_with_name TEXT,

  -- Training content
  training_video_id UUID NOT NULL, -- References training_videos table
  training_title TEXT,
  personal_message TEXT, -- Custom message from sharer

  -- Access tracking
  accessed BOOLEAN DEFAULT FALSE,
  accessed_at TIMESTAMPTZ,
  watch_progress_percent INTEGER DEFAULT 0 CHECK (watch_progress_percent >= 0 AND watch_progress_percent <= 100),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  -- Engagement tracking
  watch_duration_seconds INTEGER DEFAULT 0,
  last_watched_at TIMESTAMPTZ,

  -- Notification
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  notification_opened BOOLEAN DEFAULT FALSE,
  notification_opened_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for training_shares
CREATE INDEX idx_training_shares_shared_by ON training_shares(shared_by_distributor_id);
CREATE INDEX idx_training_shares_shared_with ON training_shares(shared_with_distributor_id);
CREATE INDEX idx_training_shares_video ON training_shares(training_video_id);
CREATE INDEX idx_training_shares_accessed ON training_shares(accessed);
CREATE INDEX idx_training_shares_completed ON training_shares(completed);

-- Comments
COMMENT ON TABLE training_shares IS 'Training videos shared with downline team members (Team Edition $119 tier)';
COMMENT ON COLUMN training_shares.watch_progress_percent IS 'Video watch progress percentage 0-100';

-- =============================================
-- TABLE 12: AUTOPILOT USAGE LIMITS
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
  email_invites_limit INTEGER NOT NULL, -- Free: 10, Social: 50, Pro: unlimited, Team: unlimited

  -- SMS messages
  sms_sent_this_month INTEGER DEFAULT 0,
  sms_limit INTEGER NOT NULL, -- Free/Social: 0, Pro: 1000, Team: unlimited

  -- CRM contacts
  contacts_count INTEGER DEFAULT 0,
  contacts_limit INTEGER NOT NULL, -- Free/Social: 0, Pro: 500, Team: unlimited

  -- Social posts
  social_posts_this_month INTEGER DEFAULT 0,
  social_posts_limit INTEGER NOT NULL, -- Free: 0, Social: 30, Pro: 100, Team: unlimited

  -- Event flyers
  flyers_created_this_month INTEGER DEFAULT 0,
  flyers_limit INTEGER NOT NULL, -- Free: 0, Social: 10, Pro: 50, Team: unlimited

  -- Team broadcasts
  broadcasts_this_month INTEGER DEFAULT 0,
  broadcasts_limit INTEGER NOT NULL, -- Free/Social/Pro: 0, Team: unlimited

  -- Training shares
  training_shares_this_month INTEGER DEFAULT 0,
  training_shares_limit INTEGER NOT NULL, -- Free/Social/Pro: 0, Team: unlimited

  -- Meeting invitations sent
  meetings_created_this_month INTEGER DEFAULT 0,
  meetings_limit INTEGER NOT NULL, -- All tiers have limits

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

-- Indexes for autopilot_usage_limits
CREATE INDEX idx_autopilot_usage_distributor ON autopilot_usage_limits(distributor_id);
CREATE INDEX idx_autopilot_usage_tier ON autopilot_usage_limits(tier);
CREATE INDEX idx_autopilot_usage_next_reset ON autopilot_usage_limits(next_reset_at);

-- Comments
COMMENT ON TABLE autopilot_usage_limits IS 'Track usage against tier limits for each distributor';
COMMENT ON COLUMN autopilot_usage_limits.contacts_limit IS 'Free/Social: 0, Pro: 500, Team: unlimited (-1)';
COMMENT ON COLUMN autopilot_usage_limits.next_reset_at IS 'When usage counters reset (monthly)';

-- =============================================
-- AUTO-UPDATE TRIGGERS
-- =============================================

-- Update autopilot_subscriptions.updated_at
CREATE TRIGGER update_autopilot_subscriptions_updated_at
  BEFORE UPDATE ON autopilot_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update meeting_invitations.updated_at
CREATE TRIGGER update_meeting_invitations_updated_at
  BEFORE UPDATE ON meeting_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update social_posts.updated_at
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update event_flyers.updated_at
CREATE TRIGGER update_event_flyers_updated_at
  BEFORE UPDATE ON event_flyers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update crm_contacts.updated_at
CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update crm_pipeline.updated_at
CREATE TRIGGER update_crm_pipeline_updated_at
  BEFORE UPDATE ON crm_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update crm_tasks.updated_at
CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON crm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update sms_campaigns.updated_at
CREATE TRIGGER update_sms_campaigns_updated_at
  BEFORE UPDATE ON sms_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update sms_messages.updated_at
CREATE TRIGGER update_sms_messages_updated_at
  BEFORE UPDATE ON sms_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update team_broadcasts.updated_at
CREATE TRIGGER update_team_broadcasts_updated_at
  BEFORE UPDATE ON team_broadcasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update training_shares.updated_at
CREATE TRIGGER update_training_shares_updated_at
  BEFORE UPDATE ON training_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update autopilot_usage_limits.updated_at
CREATE TRIGGER update_autopilot_usage_limits_updated_at
  BEFORE UPDATE ON autopilot_usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE autopilot_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_flyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopilot_usage_limits ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: AUTOPILOT_SUBSCRIPTIONS
-- =============================================

CREATE POLICY "Distributors can view own subscription"
  ON autopilot_subscriptions FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all subscriptions"
  ON autopilot_subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage subscriptions"
  ON autopilot_subscriptions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: MEETING_INVITATIONS
-- =============================================

CREATE POLICY "Distributors can view own invitations"
  ON meeting_invitations FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create invitations"
  ON meeting_invitations FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can update own invitations"
  ON meeting_invitations FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can delete own invitations"
  ON meeting_invitations FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all invitations"
  ON meeting_invitations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: SOCIAL_POSTS
-- =============================================

CREATE POLICY "Distributors can view own posts"
  ON social_posts FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create posts"
  ON social_posts FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can update own posts"
  ON social_posts FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can delete own posts"
  ON social_posts FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all posts"
  ON social_posts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: EVENT_FLYERS
-- =============================================

CREATE POLICY "Distributors can view own flyers"
  ON event_flyers FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create flyers"
  ON event_flyers FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can update own flyers"
  ON event_flyers FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can delete own flyers"
  ON event_flyers FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all flyers"
  ON event_flyers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: CRM_CONTACTS
-- =============================================

CREATE POLICY "Distributors can view own contacts"
  ON crm_contacts FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create contacts"
  ON crm_contacts FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can update own contacts"
  ON crm_contacts FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can delete own contacts"
  ON crm_contacts FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all contacts"
  ON crm_contacts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: CRM_PIPELINE
-- =============================================

CREATE POLICY "Distributors can view own pipeline"
  ON crm_pipeline FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create pipeline"
  ON crm_pipeline FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can update own pipeline"
  ON crm_pipeline FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can delete own pipeline"
  ON crm_pipeline FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all pipeline"
  ON crm_pipeline FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: CRM_TASKS
-- =============================================

CREATE POLICY "Distributors can view own tasks"
  ON crm_tasks FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create tasks"
  ON crm_tasks FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can update own tasks"
  ON crm_tasks FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can delete own tasks"
  ON crm_tasks FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all tasks"
  ON crm_tasks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: SMS_CAMPAIGNS
-- =============================================

CREATE POLICY "Distributors can view own campaigns"
  ON sms_campaigns FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create campaigns"
  ON sms_campaigns FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can update own campaigns"
  ON sms_campaigns FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can delete own campaigns"
  ON sms_campaigns FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all campaigns"
  ON sms_campaigns FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: SMS_MESSAGES
-- =============================================

CREATE POLICY "Distributors can view own messages"
  ON sms_messages FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create messages"
  ON sms_messages FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can update own messages"
  ON sms_messages FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all messages"
  ON sms_messages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: TEAM_BROADCASTS
-- =============================================

CREATE POLICY "Distributors can view own broadcasts"
  ON team_broadcasts FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create broadcasts"
  ON team_broadcasts FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can update own broadcasts"
  ON team_broadcasts FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can delete own broadcasts"
  ON team_broadcasts FOR DELETE
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all broadcasts"
  ON team_broadcasts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: TRAINING_SHARES
-- =============================================

CREATE POLICY "Distributors can view shares they sent"
  ON training_shares FOR SELECT
  USING (
    shared_by_distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can view shares received"
  ON training_shares FOR SELECT
  USING (
    shared_with_distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create shares"
  ON training_shares FOR INSERT
  WITH CHECK (
    shared_by_distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can update received shares"
  ON training_shares FOR UPDATE
  USING (
    shared_with_distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all shares"
  ON training_shares FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- RLS POLICIES: AUTOPILOT_USAGE_LIMITS
-- =============================================

CREATE POLICY "Distributors can view own usage"
  ON autopilot_usage_limits FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all usage"
  ON autopilot_usage_limits FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage usage limits"
  ON autopilot_usage_limits FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to initialize usage limits when a subscription is created
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
      email_limit := 10;
      sms_limit := 0;
      contacts_limit := 0;
      social_limit := 0;
      flyers_limit := 0;
      broadcasts_limit := 0;
      training_limit := 0;
      meetings_limit := 10;
    WHEN 'social_connector' THEN
      email_limit := 50;
      sms_limit := 0;
      contacts_limit := 0;
      social_limit := 30;
      flyers_limit := 10;
      broadcasts_limit := 0;
      training_limit := 0;
      meetings_limit := 50;
    WHEN 'lead_autopilot_pro' THEN
      email_limit := -1; -- unlimited
      sms_limit := 1000;
      contacts_limit := 500;
      social_limit := 100;
      flyers_limit := 50;
      broadcasts_limit := 0;
      training_limit := 0;
      meetings_limit := -1; -- unlimited
    WHEN 'team_edition' THEN
      email_limit := -1; -- unlimited
      sms_limit := -1; -- unlimited
      contacts_limit := -1; -- unlimited
      social_limit := -1; -- unlimited
      flyers_limit := -1; -- unlimited
      broadcasts_limit := -1; -- unlimited
      training_limit := -1; -- unlimited
      meetings_limit := -1; -- unlimited
  END CASE;

  -- Create or update usage limits record
  INSERT INTO autopilot_usage_limits (
    distributor_id,
    tier,
    email_invites_limit,
    sms_limit,
    contacts_limit,
    social_posts_limit,
    flyers_limit,
    broadcasts_limit,
    training_shares_limit,
    meetings_limit
  ) VALUES (
    NEW.distributor_id,
    NEW.tier,
    email_limit,
    sms_limit,
    contacts_limit,
    social_limit,
    flyers_limit,
    broadcasts_limit,
    training_limit,
    meetings_limit
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

-- Function to check if distributor has reached tier limit
CREATE OR REPLACE FUNCTION check_autopilot_limit(
  p_distributor_id UUID,
  p_limit_type TEXT -- 'email', 'sms', 'contacts', 'social', 'flyers', 'broadcasts', 'training', 'meetings'
)
RETURNS BOOLEAN AS $$
DECLARE
  usage_record RECORD;
  current_usage INTEGER;
  limit_value INTEGER;
BEGIN
  SELECT * INTO usage_record
  FROM autopilot_usage_limits
  WHERE distributor_id = p_distributor_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get current usage and limit based on type
  CASE p_limit_type
    WHEN 'email' THEN
      current_usage := usage_record.email_invites_used_this_month;
      limit_value := usage_record.email_invites_limit;
    WHEN 'sms' THEN
      current_usage := usage_record.sms_sent_this_month;
      limit_value := usage_record.sms_limit;
    WHEN 'contacts' THEN
      current_usage := usage_record.contacts_count;
      limit_value := usage_record.contacts_limit;
    WHEN 'social' THEN
      current_usage := usage_record.social_posts_this_month;
      limit_value := usage_record.social_posts_limit;
    WHEN 'flyers' THEN
      current_usage := usage_record.flyers_created_this_month;
      limit_value := usage_record.flyers_limit;
    WHEN 'broadcasts' THEN
      current_usage := usage_record.broadcasts_this_month;
      limit_value := usage_record.broadcasts_limit;
    WHEN 'training' THEN
      current_usage := usage_record.training_shares_this_month;
      limit_value := usage_record.training_shares_limit;
    WHEN 'meetings' THEN
      current_usage := usage_record.meetings_created_this_month;
      limit_value := usage_record.meetings_limit;
    ELSE
      RETURN FALSE;
  END CASE;

  -- If limit is -1, it's unlimited
  IF limit_value = -1 THEN
    RETURN TRUE;
  END IF;

  -- Check if under limit
  RETURN current_usage < limit_value;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_autopilot_usage(
  p_distributor_id UUID,
  p_limit_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  CASE p_limit_type
    WHEN 'email' THEN
      UPDATE autopilot_usage_limits
      SET email_invites_used_this_month = email_invites_used_this_month + p_increment,
          updated_at = NOW()
      WHERE distributor_id = p_distributor_id;
    WHEN 'sms' THEN
      UPDATE autopilot_usage_limits
      SET sms_sent_this_month = sms_sent_this_month + p_increment,
          updated_at = NOW()
      WHERE distributor_id = p_distributor_id;
    WHEN 'contacts' THEN
      UPDATE autopilot_usage_limits
      SET contacts_count = contacts_count + p_increment,
          updated_at = NOW()
      WHERE distributor_id = p_distributor_id;
    WHEN 'social' THEN
      UPDATE autopilot_usage_limits
      SET social_posts_this_month = social_posts_this_month + p_increment,
          updated_at = NOW()
      WHERE distributor_id = p_distributor_id;
    WHEN 'flyers' THEN
      UPDATE autopilot_usage_limits
      SET flyers_created_this_month = flyers_created_this_month + p_increment,
          updated_at = NOW()
      WHERE distributor_id = p_distributor_id;
    WHEN 'broadcasts' THEN
      UPDATE autopilot_usage_limits
      SET broadcasts_this_month = broadcasts_this_month + p_increment,
          updated_at = NOW()
      WHERE distributor_id = p_distributor_id;
    WHEN 'training' THEN
      UPDATE autopilot_usage_limits
      SET training_shares_this_month = training_shares_this_month + p_increment,
          updated_at = NOW()
      WHERE distributor_id = p_distributor_id;
    WHEN 'meetings' THEN
      UPDATE autopilot_usage_limits
      SET meetings_created_this_month = meetings_created_this_month + p_increment,
          updated_at = NOW()
      WHERE distributor_id = p_distributor_id;
    ELSE
      RETURN FALSE;
  END CASE;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly usage counters (to be run via cron)
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

COMMENT ON SCHEMA public IS 'Apex Lead Autopilot system - 4-tier meeting invitation and lead automation';
