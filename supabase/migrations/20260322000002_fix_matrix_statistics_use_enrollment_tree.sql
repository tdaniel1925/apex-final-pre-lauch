-- =============================================
-- Fix Matrix Statistics to Use Enrollment Tree
-- Use sponsor_id (enrollment) instead of matrix_parent_id (placement)
-- =============================================
-- Issue: Matrix Management showing 6/5 at Level 1 (120% - impossible)
-- Root Cause: Using matrix_depth which has bad data
-- Fix: Calculate depth from sponsor_id tree dynamically
-- =============================================

CREATE OR REPLACE FUNCTION get_enrollment_depth(dist_id UUID, current_depth INT DEFAULT 0)
RETURNS INT AS $$
DECLARE
  sponsor UUID;
BEGIN
  -- Prevent infinite loops
  IF current_depth > 20 THEN
    RETURN current_depth;
  END IF;

  -- Get sponsor of this distributor
  SELECT sponsor_id INTO sponsor
  FROM distributors
  WHERE id = dist_id
  AND status != 'deleted';

  -- If no sponsor (root level), return current depth
  IF sponsor IS NULL THEN
    RETURN current_depth;
  END IF;

  -- Recursively calculate depth
  RETURN get_enrollment_depth(sponsor, current_depth + 1);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Updated Matrix Statistics Function
-- Now uses sponsor_id tree instead of matrix_depth
-- =============================================

CREATE OR REPLACE FUNCTION get_matrix_statistics()
RETURNS JSON AS $$
DECLARE
  stats JSON;
  max_depth_val INT;
BEGIN
  -- Calculate max depth from enrollment tree
  SELECT MAX(get_enrollment_depth(id)) INTO max_depth_val
  FROM distributors
  WHERE status != 'deleted'
  AND sponsor_id IS NOT NULL;

  -- Build statistics using enrollment tree
  SELECT json_build_object(
    'total_positions', (
      -- Total positions: 5^1 + 5^2 + ... up to max_depth
      SELECT COALESCE(SUM(POWER(5, level)::INTEGER), 0)
      FROM generate_series(1, COALESCE(max_depth_val, 1)) AS level
    ),
    'filled_positions', (
      -- Count all enrolled distributors (have sponsor_id)
      SELECT COUNT(*)
      FROM distributors
      WHERE status != 'deleted'
      AND sponsor_id IS NOT NULL
    ),
    'available_positions', (
      -- Calculate available: total possible - filled
      SELECT (
        SELECT COALESCE(SUM(POWER(5, level)::INTEGER), 0)
        FROM generate_series(1, COALESCE(max_depth_val, 1)) AS level
      ) - (
        SELECT COUNT(*)
        FROM distributors
        WHERE status != 'deleted'
        AND sponsor_id IS NOT NULL
      )
    ),
    'max_depth', (
      -- Max depth from enrollment tree
      COALESCE(max_depth_val, 0)
    ),
    'by_level', (
      -- Count distributors by enrollment depth
      SELECT json_agg(level_stats)
      FROM (
        SELECT
          get_enrollment_depth(id) as level,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE status = 'active') as active_count
        FROM distributors
        WHERE status != 'deleted'
        AND sponsor_id IS NOT NULL
        GROUP BY get_enrollment_depth(id)
        ORDER BY get_enrollment_depth(id)
      ) level_stats
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT get_matrix_statistics();

-- =============================================
-- VERIFICATION QUERY
-- Compare old matrix_depth vs new enrollment depth
-- =============================================
/*
SELECT
  id,
  first_name,
  last_name,
  matrix_depth as old_depth,
  get_enrollment_depth(id) as new_depth,
  CASE
    WHEN matrix_depth = get_enrollment_depth(id) THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM distributors
WHERE status != 'deleted'
AND sponsor_id IS NOT NULL
ORDER BY matrix_depth, first_name;
*/
