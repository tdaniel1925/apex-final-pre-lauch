-- Step 1: Find Brian's member_id
SELECT m.member_id, m.full_name, m.email
FROM members m
WHERE m.full_name LIKE '%Brian%' OR m.email LIKE '%brian%';

-- Step 2: Check if Brian has enrollees in MEMBERS table
-- (Replace the member_id below with the actual value from Step 1)
SELECT
  m.member_id,
  m.full_name,
  m.email,
  m.enroller_id,
  m.status
FROM members m
WHERE m.enroller_id = '2ca889e6-0015-4100-ae08-043903926ee4';

-- Step 3: Check Brian in DISTRIBUTORS table
SELECT
  d.id as distributor_id,
  d.member_id,
  d.matrix_parent_id,
  d.matrix_position,
  d.matrix_depth
FROM distributors d
INNER JOIN members m ON d.member_id = m.member_id
WHERE m.full_name LIKE '%Brian%';

-- Step 4: Check if Brian's enrollees are in DISTRIBUTORS
SELECT
  d.id as distributor_id,
  d.member_id,
  d.matrix_parent_id,
  d.matrix_position,
  m.full_name
FROM distributors d
INNER JOIN members m ON d.member_id = m.member_id
WHERE d.matrix_parent_id IN (
  SELECT d2.id
  FROM distributors d2
  INNER JOIN members m2 ON d2.member_id = m2.member_id
  WHERE m2.full_name LIKE '%Brian%'
);
