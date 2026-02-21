-- =============================================
-- BUSINESS CENTER SYSTEM - Complete Migration
-- 4-Tier: FREE, Basic, Enhanced, Platinum
-- =============================================
-- Migration: 20260221000002
-- Created: 2026-02-21
-- =============================================

-- =============================================
-- 1. ADD BUSINESS CENTER FIELDS TO DISTRIBUTORS
-- =============================================

-- Add affiliate code (unique referral link identifier)
ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS affiliate_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS business_center_tier TEXT DEFAULT 'free'
    CHECK (business_center_tier IN ('free', 'basic', 'enhanced', 'platinum'));

-- Generate affiliate codes for existing distributors
UPDATE distributors
SET affiliate_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT), 1, 8))
WHERE affiliate_code IS NULL;

-- Make affiliate_code NOT NULL after setting values
ALTER TABLE distributors
  ALTER COLUMN affiliate_code SET NOT NULL;

-- Create index for fast affiliate code lookups
CREATE INDEX IF NOT EXISTS idx_distributors_affiliate_code ON distributors(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_distributors_bc_tier ON distributors(business_center_tier);

-- =============================================
-- 2. BUSINESS CENTER SUBSCRIPTIONS
-- =============================================

CREATE TABLE IF NOT EXISTS business_center_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'enhanced', 'platinum')),

  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,

  -- Subscription status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'unpaid')),

  -- Billing periods
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_bc_subscriptions_distributor ON business_center_subscriptions(distributor_id);
CREATE INDEX IF NOT EXISTS idx_bc_subscriptions_stripe_sub ON business_center_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_bc_subscriptions_stripe_customer ON business_center_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_bc_subscriptions_status ON business_center_subscriptions(status);

-- =============================================
-- 3. AFFILIATE TRACKING
-- =============================================

-- Track affiliate link clicks
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code TEXT NOT NULL,
  distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL,

  -- Request metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- UTM parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,

  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for affiliate clicks
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON affiliate_clicks(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_distributor ON affiliate_clicks(distributor_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON affiliate_clicks(clicked_at DESC);

-- Track affiliate conversions (sales/signups)
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code TEXT NOT NULL,
  distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL,

  -- What was converted
  order_id UUID, -- Link to orders table when built
  customer_id UUID REFERENCES distributors(id) ON DELETE SET NULL,
  conversion_type TEXT CHECK (conversion_type IN ('product_sale', 'distributor_signup', 'subscription_start')),

  -- Value tracking
  conversion_value_usd DECIMAL(10, 2),
  bv_generated INTEGER DEFAULT 0,

  converted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for conversions
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_code ON affiliate_conversions(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_distributor ON affiliate_conversions(distributor_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_date ON affiliate_conversions(converted_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_type ON affiliate_conversions(conversion_type);

-- =============================================
-- 4. CRM CONTACTS (Enhanced + Platinum)
-- =============================================

CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Contact info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Organization
  tags TEXT[] DEFAULT '{}', -- e.g., ['hot', 'prospect', 'customer']
  notes TEXT,
  source TEXT CHECK (source IN ('manual', 'lead_form', 'import', 'referral', 'website')),

  -- Engagement tracking
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  kanban_stage TEXT DEFAULT 'cold_lead'
    CHECK (kanban_stage IN ('cold_lead', 'contacted', 'meeting_set', 'follow_up', 'enrolled')),

  -- Activity timestamps
  last_contact_date TIMESTAMPTZ,
  last_email_opened_at TIMESTAMPTZ,
  last_email_clicked_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for CRM
CREATE INDEX IF NOT EXISTS idx_crm_contacts_distributor ON crm_contacts(distributor_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_tags ON crm_contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_kanban ON crm_contacts(kanban_stage);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_engagement ON crm_contacts(engagement_score DESC);

-- =============================================
-- 5. EMAIL SEQUENCE TEMPLATES (Pre-Built)
-- =============================================

CREATE TABLE IF NOT EXISTS email_sequence_templates (
  id TEXT PRIMARY KEY, -- e.g., 'welcome_series', 'income_opportunity'
  name TEXT NOT NULL,
  description TEXT,
  tier_required TEXT NOT NULL CHECK (tier_required IN ('enhanced', 'platinum')),
  category TEXT CHECK (category IN ('onboarding', 'nurture', 'sales', 'reengagement')),

  -- Email sequence (array of email objects)
  emails JSONB NOT NULL, -- [{subject, body, day_delay, hour_of_day}]

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. EMAIL CAMPAIGNS (User-Created)
-- =============================================

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES email_sequence_templates(id),

  name TEXT NOT NULL,
  contact_ids UUID[] DEFAULT '{}',
  tag_filter TEXT, -- Send to contacts with this tag

  -- Campaign status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'canceled')),

  -- A/B Testing (Platinum)
  ab_test_enabled BOOLEAN DEFAULT FALSE,
  ab_test_subject_a TEXT,
  ab_test_subject_b TEXT,
  ab_test_winner TEXT, -- 'a' or 'b'
  ab_test_decided_at TIMESTAMPTZ,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_distributor ON email_campaigns(distributor_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_template ON email_campaigns(template_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);

-- =============================================
-- 7. CAMPAIGN EMAILS SENT (Individual Tracking)
-- =============================================

CREATE TABLE IF NOT EXISTS campaign_emails_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,

  email_index INTEGER NOT NULL, -- Which email in sequence (0, 1, 2...)
  subject TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,

  -- Tracking (via Resend webhooks)
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'sending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),

  -- Resend integration
  resend_email_id TEXT, -- Resend's email ID for webhook tracking
  ab_variant TEXT, -- 'a', 'b', or NULL
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for email tracking
CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign ON campaign_emails_sent(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_contact ON campaign_emails_sent(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_scheduled ON campaign_emails_sent(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_status ON campaign_emails_sent(status);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_resend ON campaign_emails_sent(resend_email_id);

-- =============================================
-- 8. CRM TASKS (Auto-Created + Manual)
-- =============================================

CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,

  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Completion
  due_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  -- Auto-creation tracking
  auto_created BOOLEAN DEFAULT FALSE,
  trigger_type TEXT, -- e.g., 'email_opened', 'no_response_3_days', 'meeting_complete'

  -- Google Calendar integration
  google_calendar_event_id TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_crm_tasks_distributor ON crm_tasks(distributor_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_contact ON crm_tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_completed ON crm_tasks(completed);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_priority ON crm_tasks(priority);

-- =============================================
-- 9. LEAD CAPTURE FORMS (Enhanced + Platinum)
-- =============================================

CREATE TABLE IF NOT EXISTS lead_capture_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly identifier

  -- Form configuration
  fields JSONB NOT NULL DEFAULT '[]', -- [{name: 'email', type: 'email', label: 'Email', required: true}]

  -- Auto-actions
  auto_tag TEXT, -- Auto-apply this tag to new contacts
  auto_campaign_id UUID REFERENCES email_campaigns(id), -- Auto-start this campaign

  -- User experience
  success_message TEXT DEFAULT 'Thank you! We''ll be in touch soon.',
  redirect_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  submissions_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, slug)
);

-- Indexes for forms
CREATE INDEX IF NOT EXISTS idx_lead_forms_distributor ON lead_capture_forms(distributor_id);
CREATE INDEX IF NOT EXISTS idx_lead_forms_slug ON lead_capture_forms(slug);
CREATE INDEX IF NOT EXISTS idx_lead_forms_active ON lead_capture_forms(is_active);

-- =============================================
-- 10. FORM SUBMISSIONS
-- =============================================

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES lead_capture_forms(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,

  -- Submitted data
  data JSONB NOT NULL, -- The form field values

  -- Request metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for submissions
CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_contact ON form_submissions(contact_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_date ON form_submissions(created_at DESC);

-- =============================================
-- 11. CALENDAR INTEGRATIONS (Platinum)
-- =============================================

CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE UNIQUE,

  provider TEXT NOT NULL DEFAULT 'google', -- 'google', 'outlook' (future)

  -- OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,

  -- Calendar settings
  calendar_id TEXT, -- Which calendar to sync to
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for calendar integrations
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_distributor ON calendar_integrations(distributor_id);

-- =============================================
-- 12. BRANDING SETTINGS
-- =============================================

CREATE TABLE IF NOT EXISTS business_center_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE UNIQUE,

  -- Visual branding
  logo_url TEXT, -- Supabase Storage URL
  favicon_url TEXT,
  og_image_url TEXT, -- Open Graph image for social sharing

  -- Colors (hex codes)
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  accent_color TEXT DEFAULT '#06b6d4',

  -- Text branding
  tagline TEXT,

  -- Domain settings
  custom_domain TEXT UNIQUE,
  custom_domain_verified BOOLEAN DEFAULT FALSE,

  -- White-label (Platinum only)
  hide_apex_branding BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for branding
CREATE INDEX IF NOT EXISTS idx_branding_distributor ON business_center_branding(distributor_id);
CREATE INDEX IF NOT EXISTS idx_branding_custom_domain ON business_center_branding(custom_domain);

-- =============================================
-- 13. API KEYS (Platinum Only)
-- =============================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the key
  key_prefix TEXT NOT NULL, -- First 8 chars for display (e.g., 'apx_12345678...')

  -- Permissions
  scopes TEXT[] DEFAULT '{}', -- ['read:contacts', 'write:contacts', 'read:campaigns']

  -- Usage tracking
  last_used_at TIMESTAMPTZ,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_distributor ON api_keys(distributor_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- =============================================
-- 14. WEBHOOK ENDPOINTS (Platinum Only)
-- =============================================

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['contact.created', 'email.opened', 'task.completed']
  secret TEXT NOT NULL, -- For HMAC signature verification

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Monitoring
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  last_failure_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for webhooks
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_distributor ON webhook_endpoints(distributor_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON webhook_endpoints(is_active);

-- =============================================
-- 15. TEAM BROADCASTS
-- =============================================

CREATE TABLE IF NOT EXISTS team_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  subject TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Recipients
  recipient_filter TEXT CHECK (recipient_filter IN ('all_downline', 'direct_sponsors', 'active_only', 'specific_ranks')),
  recipient_ranks TEXT[], -- If filter = 'specific_ranks'

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Stats
  recipient_count INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for broadcasts
CREATE INDEX IF NOT EXISTS idx_team_broadcasts_distributor ON team_broadcasts(distributor_id);
CREATE INDEX IF NOT EXISTS idx_team_broadcasts_status ON team_broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_team_broadcasts_scheduled ON team_broadcasts(scheduled_for);

-- =============================================
-- 16. ANALYTICS CACHE (Performance)
-- =============================================

CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  metric_type TEXT NOT NULL, -- 'team_performance', 'email_stats', 'lead_scoring'
  data JSONB NOT NULL,

  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  UNIQUE(distributor_id, metric_type)
);

-- Indexes for cache
CREATE INDEX IF NOT EXISTS idx_analytics_cache_distributor_metric ON analytics_cache(distributor_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at);

-- =============================================
-- 17. TRIGGERS
-- =============================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_bc_subscriptions_updated_at
  BEFORE UPDATE ON business_center_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON crm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_forms_updated_at
  BEFORE UPDATE ON lead_capture_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_integrations_updated_at
  BEFORE UPDATE ON calendar_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branding_updated_at
  BEFORE UPDATE ON business_center_branding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_sequence_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 18. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE business_center_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_emails_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_capture_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_center_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Affiliate tracking tables are write-only from public (no RLS needed)
-- Email sequence templates are readable by all authenticated users

-- RLS Policies: Users can only access their own data

-- Business Center Subscriptions
CREATE POLICY "Distributors can view own subscription"
  ON business_center_subscriptions FOR SELECT
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- CRM Contacts
CREATE POLICY "Distributors can manage own contacts"
  ON crm_contacts FOR ALL
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Email Campaigns
CREATE POLICY "Distributors can manage own campaigns"
  ON email_campaigns FOR ALL
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Campaign Emails Sent
CREATE POLICY "Distributors can view own campaign emails"
  ON campaign_emails_sent FOR SELECT
  USING (campaign_id IN (
    SELECT id FROM email_campaigns
    WHERE distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  ));

-- CRM Tasks
CREATE POLICY "Distributors can manage own tasks"
  ON crm_tasks FOR ALL
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Lead Capture Forms
CREATE POLICY "Distributors can manage own forms"
  ON lead_capture_forms FOR ALL
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Form Submissions - public can insert, owners can read
CREATE POLICY "Public can submit forms"
  ON form_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Distributors can view own form submissions"
  ON form_submissions FOR SELECT
  USING (form_id IN (
    SELECT id FROM lead_capture_forms
    WHERE distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  ));

-- Calendar Integrations
CREATE POLICY "Distributors can manage own calendar integration"
  ON calendar_integrations FOR ALL
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Branding
CREATE POLICY "Distributors can manage own branding"
  ON business_center_branding FOR ALL
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- API Keys
CREATE POLICY "Distributors can manage own API keys"
  ON api_keys FOR ALL
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Webhooks
CREATE POLICY "Distributors can manage own webhooks"
  ON webhook_endpoints FOR ALL
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Team Broadcasts
CREATE POLICY "Distributors can manage own broadcasts"
  ON team_broadcasts FOR ALL
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Analytics Cache
CREATE POLICY "Distributors can access own analytics cache"
  ON analytics_cache FOR ALL
  USING (distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  ));

-- Email Sequence Templates - all authenticated users can read
CREATE POLICY "Authenticated users can read email templates"
  ON email_sequence_templates FOR SELECT
  USING (auth.role() = 'authenticated');

-- =============================================
-- 19. SEED DATA: Email Sequence Templates
-- =============================================

-- Enhanced Tier Templates (5)
INSERT INTO email_sequence_templates (id, name, description, tier_required, category, emails) VALUES
('welcome_series', 'Welcome Series', '3-email sequence to welcome new contacts', 'enhanced', 'onboarding',
'[
  {"subject": "Welcome! Here''s what to expect", "body": "Hi {{name}},\n\nWelcome to our community! I''m excited to have you here.\n\nOver the next few days, I''ll be sharing valuable information about our products and how they can help you achieve your goals.\n\nIf you have any questions, feel free to reply to this email!\n\nBest regards,\n{{sender_name}}", "day_delay": 0, "hour_of_day": 10},
  {"subject": "Quick question about your goals", "body": "Hi {{name}},\n\nI wanted to follow up and learn more about what brought you here.\n\nWhat are your biggest challenges right now? I want to make sure I''m sending you the most relevant information.\n\nJust hit reply and let me know!\n\nTalk soon,\n{{sender_name}}", "day_delay": 3, "hour_of_day": 14},
  {"subject": "Here are some resources to get started", "body": "Hi {{name}},\n\nBased on our conversation, I''ve put together some resources that I think will be helpful for you:\n\n- [Resource 1]\n- [Resource 2]\n- [Resource 3]\n\nLet me know if you have any questions!\n\n{{sender_name}}", "day_delay": 7, "hour_of_day": 10}
]'::jsonb),

('follow_up', 'Follow-Up Series', '2-email sequence for general follow-ups', 'enhanced', 'nurture',
'[
  {"subject": "Just checking in", "body": "Hi {{name}},\n\nI wanted to reach out and see how things are going.\n\nHave you had a chance to check out the information I sent over?\n\nI''m here if you have any questions or want to chat about how we can help.\n\nBest,\n{{sender_name}}", "day_delay": 0, "hour_of_day": 11},
  {"subject": "Any questions I can answer?", "body": "Hi {{name}},\n\nI know you''re busy, so I''ll keep this brief.\n\nIs there anything I can clarify about our products or the opportunity?\n\nI''m happy to jump on a quick call if that''s easier.\n\nLet me know!\n{{sender_name}}", "day_delay": 3, "hour_of_day": 15}
]'::jsonb),

('product_launch', 'Product Launch', 'Single email for new product announcements', 'enhanced', 'sales',
'[
  {"subject": "Exciting news: New product available!", "body": "Hi {{name}},\n\nWe just launched something I think you''ll love!\n\n[Product Name] is now available, and it''s perfect for [benefit].\n\nHere''s what makes it special:\n- [Feature 1]\n- [Feature 2]\n- [Feature 3]\n\nCheck it out here: [link]\n\nQuestions? Just reply to this email.\n\n{{sender_name}}", "day_delay": 0, "hour_of_day": 9}
]'::jsonb),

('event_invite', 'Event Invitation', '2-email sequence for event invitations', 'enhanced', 'sales',
'[
  {"subject": "You''re invited: Exclusive training event", "body": "Hi {{name}},\n\nI''d love to invite you to an exclusive training event we''re hosting.\n\nDate: [Date]\nTime: [Time]\nFormat: [Zoom/In-person]\n\nWe''ll be covering:\n- [Topic 1]\n- [Topic 2]\n- [Topic 3]\n\nRegister here: [link]\n\nSpace is limited, so grab your spot today!\n\n{{sender_name}}", "day_delay": 0, "hour_of_day": 10},
  {"subject": "Reminder: Event is tomorrow!", "body": "Hi {{name}},\n\nJust a quick reminder that our training event is tomorrow!\n\nDate: [Date]\nTime: [Time]\nZoom Link: [link]\n\nLooking forward to seeing you there!\n\n{{sender_name}}", "day_delay": 6, "hour_of_day": 17}
]'::jsonb),

('reengagement', 'Re-Engagement', '2-email sequence to win back inactive contacts', 'enhanced', 'reengagement',
'[
  {"subject": "We miss you!", "body": "Hi {{name}},\n\nIt''s been a while since we last connected, and I wanted to reach out.\n\nAre you still interested in [topic]? Things have changed a lot since we last spoke:\n\n- [Update 1]\n- [Update 2]\n- [Update 3]\n\nI''d love to reconnect and see if there''s anything I can help with.\n\nJust hit reply and let me know you''re still around!\n\n{{sender_name}}", "day_delay": 0, "hour_of_day": 14},
  {"subject": "Last chance to reconnect", "body": "Hi {{name}},\n\nI wanted to reach out one more time before I archive your contact.\n\nIf you''re still interested in [topic], let me know and I''ll keep you in the loop.\n\nIf not, no worries! I wish you all the best.\n\nReply with ''Yes'' to stay connected.\n\n{{sender_name}}", "day_delay": 7, "hour_of_day": 11}
]'::jsonb);

-- Platinum Tier Templates (5 additional)
INSERT INTO email_sequence_templates (id, name, description, tier_required, category, emails) VALUES
('income_opportunity', 'Income Opportunity Series', '7-email sequence showcasing the compensation plan', 'platinum', 'sales',
'[
  {"subject": "What if you could earn income from home?", "body": "Hi {{name}},\n\nI wanted to share an opportunity that I think you''ll find interesting.\n\nWhat if you could:\n- Work from anywhere\n- Set your own schedule\n- Earn income helping others\n\nWould that interest you?\n\nLet me show you how it works...\n\n{{sender_name}}", "day_delay": 0, "hour_of_day": 10},
  {"subject": "Here''s how people are earning $500-$5,000/month", "body": "Hi {{name}},\n\nLet me show you the numbers.\n\nOur top earners are making anywhere from $500 to $5,000+ per month (some even more!).\n\nThe best part? Many of them started with ZERO experience.\n\nHere''s what they did differently... [continue]\n\n{{sender_name}}", "day_delay": 2, "hour_of_day": 14},
  {"subject": "The 16 ways to earn income", "body": "Hi {{name}},\n\nOur compensation plan has 16 different income streams.\n\nYes, 16!\n\nHere are just a few:\n1. Retail commissions\n2. Team bonuses\n3. Matching bonuses\n4. And 13 more...\n\nLet me break it down for you... [continue]\n\n{{sender_name}}", "day_delay": 4, "hour_of_day": 11},
  {"subject": "Real success stories from real people", "body": "Hi {{name}},\n\nDon''t just take my word for it.\n\nHere''s what some of our distributors are saying:\n\n[Testimonial 1]\n[Testimonial 2]\n[Testimonial 3]\n\nThese are everyday people like you and me.\n\nWhat''s stopping you from being next?\n\n{{sender_name}}", "day_delay": 6, "hour_of_day": 15},
  {"subject": "Common questions answered", "body": "Hi {{name}},\n\nYou might be wondering:\n\n''Is this a pyramid scheme?''\n''Do I need to be a salesperson?''\n''How much does it cost to start?''\n\nGreat questions! Let me address them... [continue]\n\n{{sender_name}}", "day_delay": 8, "hour_of_day": 10},
  {"subject": "How to get started (it''s free!)", "body": "Hi {{name}},\n\nReady to start?\n\nHere''s the best part: it costs $0 to join.\n\nZero. Nothing. Nada.\n\nHere''s what you need to do:\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\nClick here to get started: [link]\n\n{{sender_name}}", "day_delay": 10, "hour_of_day": 13},
  {"subject": "Your personal invitation to join", "body": "Hi {{name}},\n\nI''ve been in this business for [time period] and I can honestly say it''s changed my life.\n\nI''d love to work with you and help you achieve your goals.\n\nAre you ready to take the first step?\n\nJoin my team here: [link]\n\nLet''s do this together!\n\n{{sender_name}}", "day_delay": 12, "hour_of_day": 11}
]'::jsonb),

('objection_handler', 'Objection Handler', '5-email sequence addressing common objections', 'platinum', 'nurture',
'[
  {"subject": "''I don''t have time for this''", "body": "Hi {{name}},\n\nI hear this a lot, and I totally get it.\n\nWe''re all busy.\n\nBut here''s the thing: most of our successful distributors work this business in just 5-10 hours per week.\n\nThat''s less than 2 hours a day.\n\nWhat if you could find just ONE hour a day? Let me show you what''s possible...\n\n{{sender_name}}", "day_delay": 0, "hour_of_day": 14},
  {"subject": "''Is this one of those pyramid schemes?''", "body": "Hi {{name}},\n\nGreat question. Let me be crystal clear:\n\nNo, this is not a pyramid scheme.\n\nHere''s the difference:\n- Pyramid schemes pay for recruiting (illegal)\n- We pay for product sales (legal and FTC-compliant)\n\nWe sell real products to real customers. Period.\n\nLet me explain more... [continue]\n\n{{sender_name}}", "day_delay": 2, "hour_of_day": 11},
  {"subject": "''I''m not a salesperson''", "body": "Hi {{name}},\n\nNeither am I!\n\nAnd guess what? You don''t need to be.\n\nHere''s what you DO need:\n- A willingness to learn\n- The ability to share your story\n- A desire to help others\n\nWe''ll teach you everything else. Promise.\n\n{{sender_name}}", "day_delay": 4, "hour_of_day": 15},
  {"subject": "''What if I fail?''", "body": "Hi {{name}},\n\nThis is a valid concern.\n\nBut here''s the truth: you can''t fail if you don''t quit.\n\nWith our training, support, and proven system, you have everything you need to succeed.\n\nPlus, it costs $0 to join. What do you have to lose?\n\nLet''s talk about what you have to GAIN... [continue]\n\n{{sender_name}}", "day_delay": 6, "hour_of_day": 10},
  {"subject": "''I need to think about it''", "body": "Hi {{name}},\n\nOf course, take your time.\n\nBut while you''re thinking, consider this:\n\n- How long have you been thinking about making a change?\n- What''s different this time?\n- What if you started today and in 6 months you''re earning an extra $1,000/month?\n\nJust food for thought.\n\nI''m here when you''re ready.\n\n{{sender_name}}", "day_delay": 8, "hour_of_day": 13}
]'::jsonb),

('distributor_onboarding', 'New Distributor Onboarding', '10-email sequence for new distributors', 'platinum', 'onboarding',
'[
  {"subject": "Welcome to the team!", "body": "Hi {{name}},\n\nCongratulations on joining Apex Affinity Group!\n\nI''m so excited to work with you and help you build a successful business.\n\nHere''s what to expect over the next few weeks... [continue]\n\nLet''s get started!\n\n{{sender_name}}", "day_delay": 0, "hour_of_day": 9},
  {"subject": "Your first steps to success", "body": "Hi {{name}},\n\nHere''s your action plan for the first week:\n\n1. Complete your profile\n2. Watch the training videos\n3. Set up your replicated website\n4. Make your first 3 contacts\n\nFocus on these 4 things and you''ll be off to a great start!\n\n{{sender_name}}", "day_delay": 1, "hour_of_day": 10},
  {"subject": "How to use your back office", "body": "Hi {{name}},\n\nLet me give you a tour of your back office dashboard.\n\nHere you can:\n- View your team\n- Track commissions\n- Access training materials\n- And much more\n\n[Tutorial link]\n\n{{sender_name}}", "day_delay": 3, "hour_of_day": 14},
  {"subject": "Understanding the compensation plan", "body": "Hi {{name}},\n\nLet''s talk money.\n\nHere''s how you''ll get paid:\n1. Retail commissions (instant!)\n2. Team bonuses (monthly)\n3. Rank advancement bonuses\n4. And 13 more income streams\n\nWatch this video to learn more: [link]\n\n{{sender_name}}", "day_delay": 5, "hour_of_day": 11},
  {"subject": "How to share your affiliate link", "body": "Hi {{name}},\n\nYour affiliate link is one of your most powerful tools.\n\nHere''s how to use it:\n- Share on social media\n- Text it to friends\n- Add it to your email signature\n- Include it in your bio\n\nYour link: {{affiliate_link}}\n\n{{sender_name}}", "day_delay": 7, "hour_of_day": 15},
  {"subject": "Training resources for you", "body": "Hi {{name}},\n\nHere are the best training materials to accelerate your success:\n\n- Sales mastery course\n- Recruiting playbook\n- Social media templates\n- Email scripts\n\nAccess them all here: [link]\n\n{{sender_name}}", "day_delay": 10, "hour_of_day": 10},
  {"subject": "Your first sale checklist", "body": "Hi {{name}},\n\nReady to make your first sale?\n\nHere''s your checklist:\n[] Identify 10 prospects\n[] Practice your presentation\n[] Follow up within 24 hours\n[] Close the sale!\n\nYou''ve got this!\n\n{{sender_name}}", "day_delay": 14, "hour_of_day": 13},
  {"subject": "How to recruit your first distributor", "body": "Hi {{name}},\n\nLet''s talk about building a team.\n\nRecruitment tip #1: Share your WHY story\n\nPeople don''t join opportunities. They join people with a compelling vision.\n\nWhat''s your story? [continue]\n\n{{sender_name}}", "day_delay": 21, "hour_of_day": 11},
  {"subject": "Ranking up: Your path to Bronze", "body": "Hi {{name}},\n\nHere''s how to achieve Bronze rank:\n\n- 75 PBV\n- 500 GBV\n- 2 personally sponsored\n\nYou''re already on your way! Here''s what to focus on next... [continue]\n\n{{sender_name}}", "day_delay": 28, "hour_of_day": 14},
  {"subject": "You''ve got this!", "body": "Hi {{name}},\n\nYou''re doing great!\n\nRemember:\n- Success takes time\n- Consistency beats perfection\n- Your team is here to support you\n\nKeep going. You''ve got this!\n\nProud of you,\n{{sender_name}}", "day_delay": 35, "hour_of_day": 10}
]'::jsonb),

('customer_to_distributor', 'VIP Customer to Distributor Upgrade', '3-email sequence to convert customers', 'platinum', 'sales',
'[
  {"subject": "Have you considered earning income with us?", "body": "Hi {{name}},\n\nSince you love our products, I wanted to share something with you.\n\nWhat if you could get your products for FREE... and earn income by sharing them with others?\n\nInterested? Let me show you how... [continue]\n\n{{sender_name}}", "day_delay": 0, "hour_of_day": 11},
  {"subject": "Get your products for free (plus earn income)", "body": "Hi {{name}},\n\nWhat if I told you that many of our customers are now getting their products completely free?\n\nHere''s how:\n\n1. Become a distributor ($0 to join)\n2. Share with 3 friends\n3. Your products are covered!\n\nBonus: Everything beyond that is PROFIT.\n\nWant to learn more? [link]\n\n{{sender_name}}", "day_delay": 4, "hour_of_day": 14},
  {"subject": "Exclusive offer for valued customers", "body": "Hi {{name}},\n\nBecause you''re a loyal customer, I''m offering you exclusive access to join my team.\n\nHere''s what you get:\n- Personal mentorship from me\n- Access to our training library\n- A proven system that works\n- And of course, free products!\n\nReady to get started? [link]\n\n{{sender_name}}", "day_delay": 7, "hour_of_day": 10}
]'::jsonb),

('inactive_reactivation', 'Inactive Re-Activation', '3-email sequence to win back dormant distributors', 'platinum', 'reengagement',
'[
  {"subject": "We noticed you''ve been inactive", "body": "Hi {{name}},\n\nYour account shows no recent activity and I wanted to check in.\n\nIs everything okay? \n\nLife gets busy - I totally get it.\n\nBut I''d hate to see you miss out on what we''re building here.\n\nCan we chat about what''s holding you back?\n\n{{sender_name}}", "day_delay": 0, "hour_of_day": 13},
  {"subject": "What can we do to help you succeed?", "body": "Hi {{name}},\n\nI''d love to understand what''s been preventing you from building your business.\n\nIs it:\n- Time constraints?\n- Not sure what to do next?\n- Need more training?\n- Something else?\n\nJust hit reply and let me know. I''m here to help.\n\n{{sender_name}}", "day_delay": 5, "hour_of_day": 11},
  {"subject": "Special reactivation offer inside", "body": "Hi {{name}},\n\nWe''d love to have you back!\n\nFor the next 7 days, I''m offering:\n- 1-on-1 coaching session (FREE)\n- Bonus training materials\n- Direct access to our top earners\n\nLet''s get you back on track!\n\nReply ''YES'' to claim your spot.\n\n{{sender_name}}", "day_delay": 10, "hour_of_day": 15}
]'::jsonb);

-- =============================================
-- 20. COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE business_center_subscriptions IS 'Tracks paid Business Center tier subscriptions (Basic, Enhanced, Platinum)';
COMMENT ON TABLE crm_contacts IS 'Contact management system for Enhanced and Platinum users';
COMMENT ON TABLE email_sequence_templates IS 'Pre-built email sequences available based on tier';
COMMENT ON TABLE email_campaigns IS 'User-created email campaigns using templates or custom sequences';
COMMENT ON TABLE campaign_emails_sent IS 'Individual email tracking for campaigns (opens, clicks, etc.)';
COMMENT ON TABLE crm_tasks IS 'Task management with auto-creation based on contact behavior';
COMMENT ON TABLE lead_capture_forms IS 'Custom forms for capturing leads on websites';
COMMENT ON TABLE form_submissions IS 'Submissions from lead capture forms';
COMMENT ON TABLE calendar_integrations IS 'Google Calendar integration for task syncing (Platinum)';
COMMENT ON TABLE business_center_branding IS 'Custom branding settings (logo, colors, domain)';
COMMENT ON TABLE api_keys IS 'API keys for programmatic access (Platinum only)';
COMMENT ON TABLE webhook_endpoints IS 'Webhook endpoints for event notifications (Platinum only)';
COMMENT ON TABLE team_broadcasts IS 'Mass email broadcasts to downline team members';
COMMENT ON TABLE analytics_cache IS 'Cached analytics data for performance optimization';
COMMENT ON TABLE affiliate_clicks IS 'Tracks clicks on affiliate referral links';
COMMENT ON TABLE affiliate_conversions IS 'Tracks conversions from affiliate referrals (sales, signups)';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
