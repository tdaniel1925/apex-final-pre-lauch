-- =============================================
-- Update matrix_depth constraint to allow -1 for Level 0A
-- =============================================

-- Drop existing constraint
ALTER TABLE distributors
DROP CONSTRAINT IF EXISTS distributors_matrix_depth_check;

-- Add new constraint allowing -1 to 20
ALTER TABLE distributors
ADD CONSTRAINT distributors_matrix_depth_check
CHECK (matrix_depth >= -1 AND matrix_depth <= 20);

-- Verify the change
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'distributors_matrix_depth_check';
