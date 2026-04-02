-- Investigate apex-vision credits issue
-- Check why they have 499 org credits with no sales

-- 1. Find apex-vision distributor
SELECT
  d.id,
  d.email,
  d.first_name,
  d.last_name,
  d.slug,
  d.status
FROM distributors d
WHERE d.slug LIKE '%apex-vision%' OR d.email LIKE '%apex-vision%'
LIMIT 5;

-- 2. Check member record
SELECT
  m.member_id,
  m.full_name,
  m.email,
  m.personal_credits_monthly as pv,
  m.team_credits_monthly as gv,
  m.paying_rank,
  m.created_at
FROM members m
JOIN distributors d ON d.id = m.distributor_id
WHERE d.slug LIKE '%apex-vision%' OR d.email LIKE '%apex-vision%';

-- 3. Check all transactions for this member
SELECT
  t.id,
  t.transaction_type,
  t.description,
  t.product_slug,
  t.seller_distributor_id,
  t.created_at
FROM transactions t
JOIN members m ON m.member_id = t.seller_distributor_id
JOIN distributors d ON d.id = m.distributor_id
WHERE d.slug LIKE '%apex-vision%' OR d.email LIKE '%apex-vision%'
ORDER BY t.created_at DESC;

-- 4. Check orders
SELECT
  o.id,
  o.order_number,
  o.total_cents / 100.0 as total_dollars,
  o.total_bv,
  o.payment_status,
  o.created_at
FROM orders o
JOIN distributors d ON d.id = o.distributor_id
WHERE d.slug LIKE '%apex-vision%' OR d.email LIKE '%apex-vision%'
ORDER BY o.created_at DESC;

-- 5. Check if credits were manually added
SELECT
  aa.id,
  aa.action_type,
  aa.action_description,
  aa.created_at,
  aa.admin_name
FROM admin_activity aa
JOIN distributors d ON d.id = aa.distributor_id
WHERE (d.slug LIKE '%apex-vision%' OR d.email LIKE '%apex-vision%')
AND aa.action_description LIKE '%credit%'
ORDER BY aa.created_at DESC;
