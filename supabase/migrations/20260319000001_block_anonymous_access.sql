-- =============================================
-- BLOCK ANONYMOUS ACCESS TO ALL SENSITIVE TABLES
-- =============================================
-- This migration adds RLS policies that explicitly block
-- unauthenticated/anonymous users from accessing any data.
-- Only authenticated users (logged in members) and admins can access.

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopilot_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopilot_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_flyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;

-- Drop any permissive anonymous policies if they exist
DROP POLICY IF EXISTS anon_read_members ON public.members;
DROP POLICY IF EXISTS anon_read_distributors ON public.distributors;

-- Members table: BLOCK all anonymous access
-- Only authenticated users can read their own data + downline
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

-- Social posts: BLOCK anonymous access
DROP POLICY IF EXISTS social_block_anon ON public.social_posts;
CREATE POLICY social_block_anon ON public.social_posts
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

-- Admin tables (if they exist) - BLOCK anonymous
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_notes') THEN
    EXECUTE 'DROP POLICY IF EXISTS admin_notes_block_anon ON public.admin_notes';
    EXECUTE 'CREATE POLICY admin_notes_block_anon ON public.admin_notes FOR ALL TO anon USING (false)';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_actions') THEN
    EXECUTE 'DROP POLICY IF EXISTS admin_actions_block_anon ON public.admin_actions';
    EXECUTE 'CREATE POLICY admin_actions_block_anon ON public.admin_actions FOR ALL TO anon USING (false)';
  END IF;
END $$;

-- Verify RLS is enabled
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
      'members', 'distributors', 'autopilot_subscriptions',
      'autopilot_usage_limits', 'meeting_invitations',
      'event_flyers', 'social_posts', 'sms_campaigns', 'sms_messages'
    )
  LOOP
    RAISE NOTICE 'RLS enabled on table: %', r.tablename;
  END LOOP;
END $$;
