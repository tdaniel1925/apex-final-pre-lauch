-- Update all products with Stripe LIVE mode price IDs
-- Created: 2026-04-03
-- Purpose: Switch from test mode to live mode pricing

UPDATE products SET stripe_price_id = 'price_1TIClI0s7Jg0EdCp8kq6nbox' WHERE slug = 'pulsemarket';

UPDATE products SET stripe_price_id = 'price_1TIClI0s7Jg0EdCpLwhhiZuz' WHERE slug = 'pulseflow';

UPDATE products SET stripe_price_id = 'price_1TIClJ0s7Jg0EdCpWY9OpdFh' WHERE slug = 'pulsedrive';

UPDATE products SET stripe_price_id = 'price_1TIClK0s7Jg0EdCpbAoW8JXA' WHERE slug = 'pulsecommand';

UPDATE products SET stripe_price_id = 'price_1TIClL0s7Jg0EdCp58wU2LyJ' WHERE slug = 'smartlock';

UPDATE products SET stripe_price_id = 'price_1TIClL0s7Jg0EdCpywREFLha' WHERE slug = 'businesscenter';

-- Verify the updates
SELECT slug, name, stripe_price_id FROM products ORDER BY slug;
