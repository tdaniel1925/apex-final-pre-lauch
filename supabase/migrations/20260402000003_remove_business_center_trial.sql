-- Remove trial period from Business Center product
-- Business Center should not have a trial - immediate payment required

UPDATE products
SET trial_days = 0
WHERE slug = 'businesscenter';
