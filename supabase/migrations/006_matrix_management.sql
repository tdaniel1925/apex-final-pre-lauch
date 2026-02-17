-- =============================================
-- Stage 4: Matrix View & Management
-- Spillover queue, position locking, matrix tools
-- =============================================

-- Create spillover queue table for tracking placement waiting list
CREATE TABLE IF NOT EXISTS matrix_spillover_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  desired_parent_id UUID REFERENCES distributors(id),
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  placed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'placed', 'expired'
);

COMMENT ON TABLE matrix_spillover_queue IS 'Queue for distributors waiting for matrix placement';
COMMENT ON COLUMN matrix_spillover_queue.distributor_id IS 'Distributor waiting for placement';
COMMENT ON COLUMN matrix_spillover_queue.sponsor_id IS 'Who sponsored this distributor';
COMMENT ON COLUMN matrix_spillover_queue.desired_parent_id IS 'Preferred matrix parent (optional)';
COMMENT ON COLUMN matrix_spillover_queue.priority IS 'Higher priority gets placed first';

CREATE INDEX IF NOT EXISTS idx_spillover_queue_status ON matrix_spillover_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_spillover_queue_distributor ON matrix_spillover_queue(distributor_id);

-- Enable RLS
ALTER TABLE matrix_spillover_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all queue entries
CREATE POLICY "Admins can view spillover queue"
ON matrix_spillover_queue FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM distributors
    WHERE distributors.auth_user_id = auth.uid()
    AND (distributors.is_master = true OR distributors.admin_role IS NOT NULL)
  )
);

-- Policy: Service role full access
CREATE POLICY "Service role full access to spillover queue"
ON matrix_spillover_queue FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add position locking for admin manual placement
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS position_locked BOOLEAN DEFAULT false;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS position_locked_by UUID REFERENCES distributors(id);
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS position_locked_at TIMESTAMPTZ;

COMMENT ON COLUMN distributors.position_locked IS 'Prevents automatic placement changes';
COMMENT ON COLUMN distributors.position_locked_by IS 'Admin who locked the position';
COMMENT ON COLUMN distributors.position_locked_at IS 'When position was locked';

-- Function to get matrix children count for a distributor
CREATE OR REPLACE FUNCTION get_matrix_children_count(parent_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM distributors
    WHERE matrix_parent_id = parent_id
    AND status != 'deleted'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get available matrix positions at a level
CREATE OR REPLACE FUNCTION get_available_positions_at_level(depth_level INTEGER)
RETURNS TABLE(
  distributor_id UUID,
  distributor_name TEXT,
  position_number INTEGER,
  available_slots INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.first_name || ' ' || d.last_name,
    d.matrix_position,
    (5 - COALESCE((
      SELECT COUNT(*)
      FROM distributors children
      WHERE children.matrix_parent_id = d.id
      AND children.status != 'deleted'
    ), 0))::INTEGER as available_slots
  FROM distributors d
  WHERE d.matrix_depth = depth_level
  AND d.status != 'deleted'
  AND (
    SELECT COUNT(*)
    FROM distributors children
    WHERE children.matrix_parent_id = d.id
    AND children.status != 'deleted'
  ) < 5
  ORDER BY d.matrix_position;
END;
$$ LANGUAGE plpgsql;

-- Function to get matrix statistics
CREATE OR REPLACE FUNCTION get_matrix_statistics()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_positions', COUNT(*),
    'filled_positions', COUNT(*) FILTER (WHERE matrix_parent_id IS NOT NULL),
    'available_positions', COUNT(*) FILTER (WHERE matrix_parent_id IS NULL),
    'max_depth', COALESCE(MAX(matrix_depth), 0),
    'by_level', (
      SELECT json_agg(level_stats)
      FROM (
        SELECT
          matrix_depth as level,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE status = 'active') as active_count
        FROM distributors
        WHERE status != 'deleted'
        AND matrix_depth IS NOT NULL
        GROUP BY matrix_depth
        ORDER BY matrix_depth
      ) level_stats
    )
  ) INTO stats
  FROM distributors
  WHERE status != 'deleted';

  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to validate matrix move
CREATE OR REPLACE FUNCTION can_move_to_position(
  dist_id UUID,
  new_parent_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  parent_children_count INTEGER;
BEGIN
  -- Check if new parent has space (max 5 children)
  SELECT COUNT(*) INTO parent_children_count
  FROM distributors
  WHERE matrix_parent_id = new_parent_id
  AND status != 'deleted';

  IF parent_children_count >= 5 THEN
    RETURN false;
  END IF;

  -- Check if not moving to self or descendant (would create cycle)
  IF EXISTS (
    WITH RECURSIVE descendants AS (
      SELECT id FROM distributors WHERE id = dist_id
      UNION
      SELECT d.id
      FROM distributors d
      INNER JOIN descendants d_desc ON d.matrix_parent_id = d_desc.id
    )
    SELECT 1 FROM descendants WHERE id = new_parent_id
  ) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;
