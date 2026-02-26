-- =============================================
-- Activity Feed System
-- Track and display organization-wide events
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Activity Feed Events Table
-- =============================================
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who/What
  actor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  target_id UUID REFERENCES distributors(id) ON DELETE SET NULL, -- For "enrolled X" events

  -- Event Details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'signup',
    'rank_advancement',
    'matrix_filled',
    'first_sale',
    'fast_start_complete',
    'team_milestone',
    'volume_goal'
  )),
  event_title TEXT NOT NULL,
  event_description TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Visibility
  organization_root_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE, -- Who can see this
  depth_from_root INTEGER NOT NULL DEFAULT 0, -- How many levels down from viewer

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_feed_org_root ON activity_feed(organization_root_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_actor ON activity_feed(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_event_type ON activity_feed(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);

-- Composite index for filtered queries
CREATE INDEX IF NOT EXISTS idx_activity_feed_org_type_date
  ON activity_feed(organization_root_id, event_type, created_at DESC);

-- =============================================
-- Function: Get All Upline IDs
-- Returns array of all sponsor IDs above a distributor
-- =============================================
CREATE OR REPLACE FUNCTION get_upline_ids(dist_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
AS $$
DECLARE
  upline_ids UUID[] := ARRAY[]::UUID[];
  current_sponsor_id UUID;
  depth INTEGER := 0;
  max_depth INTEGER := 50; -- Safety limit
BEGIN
  -- Get the distributor's sponsor
  SELECT sponsor_id INTO current_sponsor_id
  FROM distributors
  WHERE id = dist_id;

  -- Traverse up the sponsor chain
  WHILE current_sponsor_id IS NOT NULL AND depth < max_depth LOOP
    upline_ids := array_append(upline_ids, current_sponsor_id);

    -- Get next sponsor
    SELECT sponsor_id INTO current_sponsor_id
    FROM distributors
    WHERE id = current_sponsor_id;

    depth := depth + 1;
  END LOOP;

  RETURN upline_ids;
END;
$$;

-- =============================================
-- Function: Calculate Depth From Root
-- Returns how many levels down actor is from root
-- =============================================
CREATE OR REPLACE FUNCTION calculate_depth_from_root(actor_id UUID, root_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  depth INTEGER := 0;
  current_id UUID := actor_id;
  max_depth INTEGER := 50;
BEGIN
  -- If actor is the root, depth is 0
  IF actor_id = root_id THEN
    RETURN 0;
  END IF;

  -- Traverse up until we reach root
  WHILE current_id IS NOT NULL AND depth < max_depth LOOP
    SELECT sponsor_id INTO current_id
    FROM distributors
    WHERE id = current_id;

    depth := depth + 1;

    IF current_id = root_id THEN
      RETURN depth;
    END IF;
  END LOOP;

  -- If we never found root, return -1 (not in upline)
  RETURN -1;
END;
$$;

-- =============================================
-- Trigger Function: Create Activity on Signup
-- =============================================
CREATE OR REPLACE FUNCTION create_signup_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  upline_id UUID;
  depth_val INTEGER;
BEGIN
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

-- =============================================
-- Trigger Function: Create Activity on Rank Change
-- =============================================
CREATE OR REPLACE FUNCTION create_rank_change_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  upline_id UUID;
  depth_val INTEGER;
BEGIN
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

-- =============================================
-- Trigger Function: Create Activity on Matrix Fill
-- =============================================
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
  -- Check if this new placement fills someone's matrix (5 children)
  SELECT d.*, COUNT(children.id) as child_count
  INTO parent_dist
  FROM distributors d
  LEFT JOIN distributors children ON children.matrix_parent_id = d.id
  WHERE d.id = NEW.matrix_parent_id
  GROUP BY d.id;

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

-- =============================================
-- Create Triggers
-- =============================================

-- Trigger on new distributor signup
DROP TRIGGER IF EXISTS trigger_signup_activity ON distributors;
CREATE TRIGGER trigger_signup_activity
  AFTER INSERT ON distributors
  FOR EACH ROW
  EXECUTE FUNCTION create_signup_activity();

-- Trigger on rank change
DROP TRIGGER IF EXISTS trigger_rank_change_activity ON distributors;
CREATE TRIGGER trigger_rank_change_activity
  AFTER UPDATE OF current_rank ON distributors
  FOR EACH ROW
  EXECUTE FUNCTION create_rank_change_activity();

-- Trigger on matrix position filled
DROP TRIGGER IF EXISTS trigger_matrix_filled_activity ON distributors;
CREATE TRIGGER trigger_matrix_filled_activity
  AFTER INSERT ON distributors
  FOR EACH ROW
  WHEN (NEW.matrix_parent_id IS NOT NULL)
  EXECUTE FUNCTION create_matrix_filled_activity();

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Users can see activities in their organization
DROP POLICY IF EXISTS activity_feed_view_own_org ON activity_feed;
CREATE POLICY activity_feed_view_own_org ON activity_feed
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.id = activity_feed.organization_root_id
      AND distributors.auth_user_id = auth.uid()
    )
  );

-- Admins can see everything
DROP POLICY IF EXISTS activity_feed_admin_all ON activity_feed;
CREATE POLICY activity_feed_admin_all ON activity_feed
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- =============================================
-- Backfill existing signups as activities
-- (Optional - creates historical feed)
-- =============================================
DO $$
DECLARE
  dist RECORD;
  upline_id UUID;
  depth_val INTEGER;
BEGIN
  -- For each existing distributor (limit to recent ones to avoid overload)
  FOR dist IN
    SELECT * FROM distributors
    WHERE created_at > NOW() - INTERVAL '30 days'
    ORDER BY created_at ASC
  LOOP
    -- Create signup activity for their upline
    FOR upline_id IN
      SELECT unnest(get_upline_ids(dist.id))
    LOOP
      depth_val := calculate_depth_from_root(dist.id, upline_id);

      INSERT INTO activity_feed (
        actor_id,
        event_type,
        event_title,
        event_description,
        organization_root_id,
        depth_from_root,
        metadata,
        created_at
      ) VALUES (
        dist.id,
        'signup',
        dist.first_name || ' ' || dist.last_name || ' joined!',
        'New distributor enrolled',
        upline_id,
        depth_val,
        jsonb_build_object(
          'licensing_status', dist.licensing_status,
          'sponsor_id', dist.sponsor_id
        ),
        dist.created_at
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
