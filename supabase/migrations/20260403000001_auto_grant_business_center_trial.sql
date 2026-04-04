-- Auto-grant 14-day Business Center trial on distributor signup
-- This ensures every new distributor gets a trial automatically

CREATE OR REPLACE FUNCTION grant_business_center_trial()
RETURNS TRIGGER AS $$
DECLARE
  bc_product_id UUID;
BEGIN
  -- Get Business Center product ID
  SELECT id INTO bc_product_id
  FROM products
  WHERE slug = 'businesscenter'
  LIMIT 1;

  -- Only proceed if Business Center product exists
  IF bc_product_id IS NOT NULL THEN
    -- Grant 14-day trial access
    INSERT INTO service_access (
      distributor_id,
      product_id,
      status,
      granted_at,
      expires_at,
      is_trial,
      trial_ends_at
    ) VALUES (
      NEW.id,
      bc_product_id,
      'active',
      NOW(),
      NOW() + INTERVAL '14 days',
      TRUE,
      NOW() + INTERVAL '14 days'
    )
    ON CONFLICT (distributor_id, product_id) DO NOTHING;

    -- Log the trial grant
    RAISE NOTICE 'Granted 14-day Business Center trial to distributor %', NEW.id;
  ELSE
    RAISE WARNING 'Business Center product not found - cannot grant trial';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to fire after distributor insert
DROP TRIGGER IF EXISTS auto_grant_bc_trial ON distributors;

CREATE TRIGGER auto_grant_bc_trial
  AFTER INSERT ON distributors
  FOR EACH ROW
  EXECUTE FUNCTION grant_business_center_trial();

-- Grant trial to existing distributors who don't have it yet
-- (Run this once during migration)
DO $$
DECLARE
  bc_product_id UUID;
  dist_record RECORD;
  granted_count INTEGER := 0;
BEGIN
  -- Get Business Center product ID
  SELECT id INTO bc_product_id
  FROM products
  WHERE slug = 'businesscenter'
  LIMIT 1;

  IF bc_product_id IS NULL THEN
    RAISE EXCEPTION 'Business Center product not found';
  END IF;

  -- Grant trial to existing distributors without access
  FOR dist_record IN
    SELECT d.id, d.created_at
    FROM distributors d
    LEFT JOIN service_access sa ON sa.distributor_id = d.id AND sa.product_id = bc_product_id
    WHERE sa.id IS NULL  -- No existing access
  LOOP
    INSERT INTO service_access (
      distributor_id,
      product_id,
      status,
      granted_at,
      expires_at,
      is_trial,
      trial_ends_at
    ) VALUES (
      dist_record.id,
      bc_product_id,
      'active',
      dist_record.created_at,  -- Use their signup date as grant date
      dist_record.created_at + INTERVAL '14 days',
      TRUE,
      dist_record.created_at + INTERVAL '14 days'
    );

    granted_count := granted_count + 1;
  END LOOP;

  RAISE NOTICE 'Granted Business Center trial to % existing distributors', granted_count;
END $$;
