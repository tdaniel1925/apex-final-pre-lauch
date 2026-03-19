-- =============================================
-- Prevent Test Data in Activity Feed
-- Adds is_test_account flag and excludes test accounts from feed
-- =============================================

-- 1. Add is_test_account flag to distributors table
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN DEFAULT FALSE;

-- 2. Create index for fast filtering
CREATE INDEX IF NOT EXISTS idx_distributors_is_test_account
ON distributors(is_test_account)
WHERE is_test_account = TRUE;

-- 3. Mark existing test accounts
UPDATE distributors
SET is_test_account = TRUE
WHERE
  first_name ILIKE '%test%' OR
  last_name ILIKE '%test%' OR
  email ILIKE '%test%' OR
  first_name ILIKE '%dummy%' OR
  last_name ILIKE '%dummy%' OR
  first_name ILIKE '%demo%' OR
  last_name ILIKE '%demo%';

-- 4. Update signup activity trigger to exclude test accounts
CREATE OR REPLACE FUNCTION create_signup_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  upline_id UUID;
  depth_val INTEGER;
BEGIN
  -- Skip if this is a test account
  IF NEW.is_test_account = TRUE THEN
    RETURN NEW;
  END IF;

  -- Create activity for each person in upline
  FOR upline_id IN
    SELECT unnest(get_upline_ids(NEW.id))
  LOOP
    -- Calculate depth
    depth_val := calculate_depth_from_root(NEW.id, upline_id);

    -- Insert activity
    INSERT INTO activity_feed (
      actor_id,
      event_type,
      event_title,
      event_description,
      organization_root_id,
      depth_from_root,
      metadata
    ) VALUES (
      NEW.id,
      'signup',
      NEW.first_name || ' ' || NEW.last_name || ' joined!',
      'New distributor enrolled',
      upline_id,
      depth_val,
      jsonb_build_object(
        'licensing_status', NEW.licensing_status,
        'sponsor_id', NEW.sponsor_id
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- 5. Update rank change activity trigger to exclude test accounts
CREATE OR REPLACE FUNCTION create_rank_change_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  upline_id UUID;
  depth_val INTEGER;
BEGIN
  -- Skip if this is a test account
  IF NEW.is_test_account = TRUE THEN
    RETURN NEW;
  END IF;

  -- Only trigger if rank actually changed
  IF OLD.current_rank IS DISTINCT FROM NEW.current_rank THEN
    -- Create activity for each person in upline
    FOR upline_id IN
      SELECT unnest(get_upline_ids(NEW.id))
    LOOP
      depth_val := calculate_depth_from_root(NEW.id, upline_id);

      INSERT INTO activity_feed (
        actor_id,
        event_type,
        event_title,
        event_description,
        organization_root_id,
        depth_from_root,
        metadata
      ) VALUES (
        NEW.id,
        'rank_advancement',
        NEW.first_name || ' ' || NEW.last_name || ' advanced to ' || NEW.current_rank || '!',
        'Rank advancement achieved',
        upline_id,
        depth_val,
        jsonb_build_object(
          'old_rank', OLD.current_rank,
          'new_rank', NEW.current_rank
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- 6. Update matrix filled activity trigger to exclude test accounts
CREATE OR REPLACE FUNCTION create_matrix_filled_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  upline_id UUID;
  depth_val INTEGER;
  parent_dist RECORD;
  child_count INTEGER;
BEGIN
  -- Skip if this is a test account
  IF NEW.is_test_account = TRUE THEN
    RETURN NEW;
  END IF;

  -- Check if this new placement fills someone's matrix (5 children)
  SELECT d.*, COUNT(children.id) as child_count
  INTO parent_dist
  FROM distributors d
  LEFT JOIN distributors children ON children.matrix_parent_id = d.id
  WHERE d.id = NEW.matrix_parent_id
  GROUP BY d.id;

  -- Skip if parent is a test account
  IF parent_dist.is_test_account = TRUE THEN
    RETURN NEW;
  END IF;

  -- If parent now has exactly 5 children, their matrix is filled
  IF parent_dist.child_count = 5 THEN
    -- Create activity for parent's upline
    FOR upline_id IN
      SELECT unnest(get_upline_ids(parent_dist.id))
    LOOP
      depth_val := calculate_depth_from_root(parent_dist.id, upline_id);

      INSERT INTO activity_feed (
        actor_id,
        event_type,
        event_title,
        event_description,
        organization_root_id,
        depth_from_root,
        metadata
      ) VALUES (
        parent_dist.id,
        'matrix_filled',
        parent_dist.first_name || ' ' || parent_dist.last_name || ' filled their matrix!',
        'All 5 positions filled',
        upline_id,
        depth_val,
        jsonb_build_object(
          'matrix_depth', parent_dist.matrix_depth
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- 7. Add comment for documentation
COMMENT ON COLUMN distributors.is_test_account IS 'Flag to mark test/demo accounts. Test accounts are excluded from activity feed and reports.';
