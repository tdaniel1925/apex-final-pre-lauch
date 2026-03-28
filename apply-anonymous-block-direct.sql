-- =============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- =============================================
-- This blocks ALL anonymous (unauthenticated) access
-- to sensitive tables. Only logged-in users can access data.

-- Members table: BLOCK all anonymous access
DROP POLICY IF EXISTS member_block_anon ON public.members;
CREATE POLICY member_block_anon ON public.members
  FOR ALL
  TO anon
  USING (false);

-- Distributors table: BLOCK all anonymous access
DROP POLICY IF EXISTS distributor_block_anon ON public.distributors;
CREATE POLICY distributor_block_anon ON public.distributors
  FOR ALL
  TO anon
  USING (false);

-- Autopilot subscriptions: BLOCK anonymous access
DROP POLICY IF EXISTS autopilot_sub_block_anon ON public.autopilot_subscriptions;
CREATE POLICY autopilot_sub_block_anon ON public.autopilot_subscriptions
  FOR ALL
  TO anon
  USING (false);

-- Autopilot usage limits: BLOCK anonymous access
DROP POLICY IF EXISTS autopilot_limits_block_anon ON public.autopilot_usage_limits;
CREATE POLICY autopilot_limits_block_anon ON public.autopilot_usage_limits
  FOR ALL
  TO anon
  USING (false);

-- Meeting invitations: BLOCK anonymous access
DROP POLICY IF EXISTS invitations_block_anon ON public.meeting_invitations;
CREATE POLICY invitations_block_anon ON public.meeting_invitations
  FOR ALL
  TO anon
  USING (false);

-- Event flyers: BLOCK anonymous access
DROP POLICY IF EXISTS flyers_block_anon ON public.event_flyers;
CREATE POLICY flyers_block_anon ON public.event_flyers
  FOR ALL
  TO anon
  USING (false);

-- SMS campaigns: BLOCK anonymous access
DROP POLICY IF EXISTS sms_campaigns_block_anon ON public.sms_campaigns;
CREATE POLICY sms_campaigns_block_anon ON public.sms_campaigns
  FOR ALL
  TO anon
  USING (false);

-- SMS messages: BLOCK anonymous access
DROP POLICY IF EXISTS sms_messages_block_anon ON public.sms_messages;
CREATE POLICY sms_messages_block_anon ON public.sms_messages
  FOR ALL
  TO anon
  USING (false);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Anonymous access blocked on 8 tables';
  RAISE NOTICE '✅ Only authenticated users can access data';
END $$;
