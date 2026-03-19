-- Fix ambiguous column reference in initialize_autopilot_usage_limits function

DROP FUNCTION IF EXISTS initialize_autopilot_usage_limits() CASCADE;

CREATE OR REPLACE FUNCTION initialize_autopilot_usage_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_email_limit INTEGER;
  v_sms_limit INTEGER;
  v_contacts_limit INTEGER;
  v_social_limit INTEGER;
  v_flyers_limit INTEGER;
  v_broadcasts_limit INTEGER;
  v_training_limit INTEGER;
  v_meetings_limit INTEGER;
BEGIN
  -- Set limits based on tier
  CASE NEW.tier
    WHEN 'free' THEN
      v_email_limit := 10;
      v_sms_limit := 0;
      v_contacts_limit := 0;
      v_social_limit := 0;
      v_flyers_limit := 0;
      v_broadcasts_limit := 0;
      v_training_limit := 0;
      v_meetings_limit := 10;
    WHEN 'social_connector' THEN
      v_email_limit := 50;
      v_sms_limit := 0;
      v_contacts_limit := 0;
      v_social_limit := 30;
      v_flyers_limit := 10;
      v_broadcasts_limit := 0;
      v_training_limit := 0;
      v_meetings_limit := 50;
    WHEN 'lead_autopilot_pro' THEN
      v_email_limit := -1; -- unlimited
      v_sms_limit := 1000;
      v_contacts_limit := 500;
      v_social_limit := 100;
      v_flyers_limit := 50;
      v_broadcasts_limit := 0;
      v_training_limit := 0;
      v_meetings_limit := -1; -- unlimited
    WHEN 'team_edition' THEN
      v_email_limit := -1; -- unlimited
      v_sms_limit := -1; -- unlimited
      v_contacts_limit := -1; -- unlimited
      v_social_limit := -1; -- unlimited
      v_flyers_limit := -1; -- unlimited
      v_broadcasts_limit := -1; -- unlimited
      v_training_limit := -1; -- unlimited
      v_meetings_limit := -1; -- unlimited
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
    v_email_limit,
    v_sms_limit,
    v_contacts_limit,
    v_social_limit,
    v_flyers_limit,
    v_broadcasts_limit,
    v_training_limit,
    v_meetings_limit
  )
  ON CONFLICT (distributor_id) DO UPDATE SET
    tier = NEW.tier,
    email_invites_limit = v_email_limit,
    sms_limit = v_sms_limit,
    contacts_limit = v_contacts_limit,
    social_posts_limit = v_social_limit,
    flyers_limit = v_flyers_limit,
    broadcasts_limit = v_broadcasts_limit,
    training_shares_limit = v_training_limit,
    meetings_limit = v_meetings_limit,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS create_usage_limits_on_subscription ON autopilot_subscriptions;

CREATE TRIGGER create_usage_limits_on_subscription
  AFTER INSERT OR UPDATE OF tier ON autopilot_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION initialize_autopilot_usage_limits();
