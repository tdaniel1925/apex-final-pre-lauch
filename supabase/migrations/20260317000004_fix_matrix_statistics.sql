-- =============================================
-- Fix Matrix Statistics Function
-- Exclude Level 0 distributors from filled count
-- =============================================
-- Issue: UI showing 32 filled positions instead of 38
-- Root Cause: Counting Level 0 seed distributors
-- Fix: Only count matrix_depth >= 1
-- =============================================

CREATE OR REPLACE FUNCTION get_matrix_statistics()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_positions', (
      -- Total visible positions: 5^1 + 5^2 + 5^3 + ... up to max_depth
      -- For now, calculate based on actual structure
      SELECT SUM(POWER(5, level)::INTEGER)
      FROM generate_series(1, COALESCE((SELECT MAX(matrix_depth) FROM distributors WHERE status != 'deleted' AND matrix_depth >= 1), 1)) AS level
    ),
    'filled_positions', (
      -- Only count distributors at depth >= 1 (exclude Level 0 seed data)
      SELECT COUNT(*)
      FROM distributors
      WHERE status != 'deleted'
      AND matrix_depth >= 1
    ),
    'available_positions', (
      -- Calculate available: total possible - filled
      SELECT (
        SELECT SUM(POWER(5, level)::INTEGER)
        FROM generate_series(1, COALESCE((SELECT MAX(matrix_depth) FROM distributors WHERE status != 'deleted' AND matrix_depth >= 1), 1)) AS level
      ) - (
        SELECT COUNT(*)
        FROM distributors
        WHERE status != 'deleted'
        AND matrix_depth >= 1
      )
    ),
    'max_depth', (
      -- Max depth of visible matrix (exclude Level 0)
      SELECT COALESCE(MAX(matrix_depth), 0)
      FROM distributors
      WHERE status != 'deleted'
      AND matrix_depth >= 1
    ),
    'by_level', (
      SELECT json_agg(level_stats)
      FROM (
        SELECT
          matrix_depth as level,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE status = 'active') as active_count
        FROM distributors
        WHERE status != 'deleted'
        AND matrix_depth >= 1  -- Only include visible levels
        GROUP BY matrix_depth
        ORDER BY matrix_depth
      ) level_stats
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT get_matrix_statistics();
