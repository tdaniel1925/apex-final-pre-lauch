-- =====================================================
-- AI Lead Nurture Campaign System
-- Allows reps to create personalized 7-week email campaigns
-- Freemium: 1 campaign for free users, unlimited for Business Center
-- =====================================================

-- =====================================================
-- 1. NURTURE CAMPAIGNS TABLE
-- =====================================================

-- Drop table if it exists (clean slate)
DROP TABLE IF EXISTS public.nurture_emails CASCADE;
DROP TABLE IF EXISTS public.nurture_campaigns CASCADE;

CREATE TABLE public.nurture_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id uuid NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,

  -- Prospect information
  prospect_name text NOT NULL,
  prospect_email text NOT NULL,
  prospect_source text, -- "coffee shop meeting", "Facebook", "referral", etc.
  prospect_interests text[], -- ["work from home", "health", "passive income"]
  prospect_personal jsonb, -- { "birthday": "05-15", "kids": 2, "hobbies": ["yoga", "reading"] }

  -- Campaign status
  campaign_status text NOT NULL DEFAULT 'active',
  -- 'active' - Campaign running
  -- 'paused' - Manually paused by user
  -- 'completed' - All 7 weeks sent
  -- 'cancelled' - Stopped early

  current_week integer NOT NULL DEFAULT 1, -- Which week (1-7) we're currently on
  next_email_at timestamptz, -- When to send next email

  -- Tracking
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,

  -- Constraints
  CONSTRAINT valid_week CHECK (current_week >= 1 AND current_week <= 7),
  CONSTRAINT valid_status CHECK (campaign_status IN ('active', 'paused', 'completed', 'cancelled'))
);

-- Index for finding active campaigns to process
CREATE INDEX idx_nurture_campaigns_active
ON public.nurture_campaigns(distributor_id, campaign_status);

-- Index for next email scheduling
CREATE INDEX idx_nurture_campaigns_next_email
ON public.nurture_campaigns(next_email_at, campaign_status)
WHERE next_email_at IS NOT NULL;

-- =====================================================
-- 2. NURTURE EMAILS TABLE
-- =====================================================

CREATE TABLE public.nurture_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.nurture_campaigns(id) ON DELETE CASCADE,

  -- Email details
  week_number integer NOT NULL, -- 1-7
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text NOT NULL,

  -- Send tracking
  scheduled_at timestamptz NOT NULL, -- When it was scheduled to send
  sent_at timestamptz, -- When it actually sent (NULL = not sent yet)

  -- Engagement tracking (from Resend webhooks)
  opened_at timestamptz, -- When first opened
  clicked_at timestamptz, -- When first link clicked
  open_count integer DEFAULT 0, -- Total opens
  click_count integer DEFAULT 0, -- Total clicks

  -- Email service tracking
  resend_email_id text, -- Resend email ID for webhook matching

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_week_number CHECK (week_number >= 1 AND week_number <= 7)
);

-- Index for campaign lookup
CREATE INDEX idx_nurture_emails_campaign
ON public.nurture_emails(campaign_id, week_number);

-- Index for Resend webhook matching
CREATE INDEX idx_nurture_emails_resend_id
ON public.nurture_emails(resend_email_id);

-- =====================================================
-- 3. CAMPAIGN LIMIT CHECK FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION check_campaign_limit(p_distributor_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_business_center boolean;
  v_active_campaigns integer;
  v_result jsonb;
BEGIN
  -- Check if user has Business Center subscription
  SELECT business_center INTO v_has_business_center
  FROM distributors
  WHERE id = p_distributor_id;

  -- Count active campaigns (not completed/cancelled)
  SELECT COUNT(*) INTO v_active_campaigns
  FROM nurture_campaigns
  WHERE distributor_id = p_distributor_id
    AND campaign_status IN ('active', 'paused');

  -- Business Center users = unlimited
  IF v_has_business_center THEN
    v_result := jsonb_build_object(
      'can_create', true,
      'limit', -1,
      'current', v_active_campaigns,
      'reason', 'unlimited_business_center'
    );
  -- Free users = 1 campaign max
  ELSIF v_active_campaigns < 1 THEN
    v_result := jsonb_build_object(
      'can_create', true,
      'limit', 1,
      'current', v_active_campaigns,
      'reason', 'within_free_limit'
    );
  ELSE
    v_result := jsonb_build_object(
      'can_create', false,
      'limit', 1,
      'current', v_active_campaigns,
      'reason', 'free_limit_reached'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- =====================================================
-- 4. UPDATE TIMESTAMP TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_nurture_campaign_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_nurture_campaigns_timestamp
BEFORE UPDATE ON public.nurture_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_nurture_campaign_timestamp();

-- =====================================================
-- 5. AUTO-COMPLETE CAMPAIGN TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION auto_complete_campaign()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If current_week reaches 8 (after sending week 7), mark as completed
  IF NEW.current_week > 7 AND NEW.campaign_status = 'active' THEN
    NEW.campaign_status := 'completed';
    NEW.completed_at := now();
    NEW.next_email_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_campaign_completion
BEFORE UPDATE ON public.nurture_campaigns
FOR EACH ROW
EXECUTE FUNCTION auto_complete_campaign();

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.nurture_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurture_emails ENABLE ROW LEVEL SECURITY;

-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON public.nurture_campaigns
  FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Users can create campaigns (subject to limit check)
CREATE POLICY "Users can create campaigns"
  ON public.nurture_campaigns
  FOR INSERT
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns"
  ON public.nurture_campaigns
  FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Users can view emails for their campaigns
CREATE POLICY "Users can view own campaign emails"
  ON public.nurture_emails
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.nurture_campaigns nc
      WHERE nc.distributor_id IN (
        SELECT id FROM public.distributors
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- Only service role can insert/update emails (generated by AI)
CREATE POLICY "Service role can manage emails"
  ON public.nurture_emails
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Service role can view all campaigns (for admin dashboard)
CREATE POLICY "Service role can view all campaigns"
  ON public.nurture_campaigns
  FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can view all emails"
  ON public.nurture_emails
  FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- USAGE NOTES
-- =====================================================

-- Check if user can create campaign:
-- SELECT check_campaign_limit('user-uuid-here');

-- Create campaign:
-- INSERT INTO nurture_campaigns (distributor_id, prospect_name, prospect_email, ...)
-- VALUES (...);

-- Schedule next email (cron job):
-- UPDATE nurture_campaigns
-- SET next_email_at = now() + interval '7 days'
-- WHERE id = campaign_id;

-- Mark email as sent:
-- UPDATE nurture_emails
-- SET sent_at = now(), resend_email_id = 'resend-id'
-- WHERE id = email_id;

-- Increment week after sending:
-- UPDATE nurture_campaigns
-- SET current_week = current_week + 1
-- WHERE id = campaign_id;

-- =====================================================
