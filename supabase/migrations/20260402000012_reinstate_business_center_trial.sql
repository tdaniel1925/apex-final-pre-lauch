-- Reinstate 14-day trial for Business Center product
-- Users will have full access for 14 days before requiring payment

UPDATE products
SET trial_days = 14
WHERE slug = 'businesscenter';
