-- Update Hannah Townsend's slug to 'hannah'
UPDATE distributors 
SET slug = 'hannah', updated_at = NOW()
WHERE LOWER(first_name) = 'hannah' AND LOWER(last_name) = 'townsend';

-- Update David Townsend's slug to 'david'
UPDATE distributors 
SET slug = 'david', updated_at = NOW()
WHERE LOWER(first_name) = 'david' AND LOWER(last_name) = 'townsend';

-- Show the updated records
SELECT id, first_name, last_name, slug, email 
FROM distributors 
WHERE (LOWER(first_name) = 'hannah' OR LOWER(first_name) = 'david') 
  AND LOWER(last_name) = 'townsend';
