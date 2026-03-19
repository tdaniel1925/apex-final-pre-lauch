-- =============================================
-- COMPLETE RLS SECURITY - BLOCK ALL ANONYMOUS ACCESS
-- =============================================
-- This migration ensures ONLY authenticated members and admins can access data
-- Anonymous (unauthenticated) users are blocked from ALL sensitive tables

-- Enable RLS on all sensitive tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopilot_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopilot_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_flyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;

-- MEMBERS: Already has member_block_anon policy (created in previous migration)
-- Just ensuring it exists
DROP POLICY IF EXISTS member_block_anon ON public.members;
CREATE POLICY member_block_anon ON public.members
  FOR ALL
  TO anon
  USING (false);

-- DISTRIBUTORS: Block anonymous access
DROP POLICY IF EXISTS distributor_block_anon ON public.distributors;
CREATE POLICY distributor_block_anon ON public.distributors
  FOR ALL
  TO anon
  USING (false);

-- AUTOPILOT SUBSCRIPTIONS: Block anonymous access
DROP POLICY IF EXISTS autopilot_sub_block_anon ON public.autopilot_subscriptions;
CREATE POLICY autopilot_sub_block_anon ON public.autopilot_subscriptions
  FOR ALL
  TO anon
  USING (false);

-- AUTOPILOT USAGE LIMITS: Block anonymous access
DROP POLICY IF EXISTS autopilot_limits_block_anon ON public.autopilot_usage_limits;
CREATE POLICY autopilot_limits_block_anon ON public.autopilot_usage_limits
  FOR ALL
  TO anon
  USING (false);

-- MEETING INVITATIONS: Block anonymous access
DROP POLICY IF EXISTS invitations_block_anon ON public.meeting_invitations;
CREATE POLICY invitations_block_anon ON public.meeting_invitations
  FOR ALL
  TO anon
  USING (false);

-- EVENT FLYERS: Block anonymous access
DROP POLICY IF EXISTS flyers_block_anon ON public.event_flyers;
CREATE POLICY flyers_block_anon ON public.event_flyers
  FOR ALL
  TO anon
  USING (false);

-- SMS CAMPAIGNS: Block anonymous access
DROP POLICY IF EXISTS sms_campaigns_block_anon ON public.sms_campaigns;
CREATE POLICY sms_campaigns_block_anon ON public.sms_campaigns
  FOR ALL
  TO anon
  USING (false);

-- SMS MESSAGES: Block anonymous access
DROP POLICY IF EXISTS sms_messages_block_anon ON public.sms_messages;
CREATE POLICY sms_messages_block_anon ON public.sms_messages
  FOR ALL
  TO anon
  USING (false);
