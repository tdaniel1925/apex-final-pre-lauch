-- =============================================
-- Rep Number: Globally Unique Sequential ID
-- Each distributor gets a permanent rep number
-- based on BFS order in the matrix (1, 2, 3...)
-- =============================================

-- 1. Create the sequence
CREATE SEQUENCE IF NOT EXISTS distributor_rep_seq START 1;

-- 2. Add the column
ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS rep_number INTEGER UNIQUE;

-- 3. Backfill existing records in BFS order
--    (master first, then level-by-level, left-to-right by matrix_position)
WITH RECURSIVE bfs AS (
  SELECT id, 0 AS bfs_level, ARRAY[matrix_position] AS path
  FROM distributors
  WHERE is_master = true

  UNION ALL

  SELECT d.id, bfs.bfs_level + 1, bfs.path || d.matrix_position
  FROM distributors d
  JOIN bfs ON d.matrix_parent_id = bfs.id
),
ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY bfs_level ASC, path ASC
    ) AS rn
  FROM bfs
)
UPDATE distributors d
SET rep_number = o.rn
FROM ordered o
WHERE d.id = o.id;

-- 4. Advance the sequence past the highest assigned number
SELECT setval(
  'distributor_rep_seq',
  COALESCE((SELECT MAX(rep_number) FROM distributors), 0) + 1,
  false
);

-- 5. Trigger: auto-assign rep_number on every new insert
CREATE OR REPLACE FUNCTION assign_rep_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rep_number IS NULL THEN
    NEW.rep_number := nextval('distributor_rep_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_assign_rep_number
  BEFORE INSERT ON distributors
  FOR EACH ROW
  EXECUTE FUNCTION assign_rep_number();

-- 6. Index for fast rep_number lookups
CREATE INDEX IF NOT EXISTS idx_distributors_rep_number
  ON distributors(rep_number);

COMMENT ON COLUMN distributors.rep_number IS
'Globally unique sequential rep ID. Master = 1. Each new signup gets the next number. Permanent and never reused.';
