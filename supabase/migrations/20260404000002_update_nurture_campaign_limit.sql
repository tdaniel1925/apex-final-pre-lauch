-- ============================================
-- Update Nurture Campaign Limit (1 → 3)
-- Update the check_campaign_limit function to allow 3 campaigns for free users
-- ============================================

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
  -- Free users = 3 campaigns max (updated from 1)
  ELSIF v_active_campaigns < 3 THEN
    v_result := jsonb_build_object(
      'can_create', true,
      'limit', 3,
      'current', v_active_campaigns,
      'reason', 'within_free_limit'
    );
  ELSE
    v_result := jsonb_build_object(
      'can_create', false,
      'limit', 3,
      'current', v_active_campaigns,
      'reason', 'free_limit_reached'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- ============================================
-- COMPLETE
-- ============================================
-- Nurture campaign limit updated from 1 to 3 for free users
