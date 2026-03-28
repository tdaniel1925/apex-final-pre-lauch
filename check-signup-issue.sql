-- Check signup status for harveydk@sbcglobal.net
-- Run this in Supabase SQL Editor

-- 1. Check if distributor record exists
SELECT
  id,
  first_name,
  last_name,
  email,
  slug,
  created_at,
  auth_user_id,
  sponsor_id,
  matrix_parent_id,
  matrix_position,
  matrix_depth
FROM distributors
WHERE email = 'harveydk@sbcglobal.net';

-- 2. Check if auth user exists
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'harveydk@sbcglobal.net';

-- 3. Check if member record exists
SELECT
  m.member_id,
  m.distributor_id,
  m.email,
  m.status,
  m.enrollment_date
FROM members m
JOIN distributors d ON m.distributor_id = d.id
WHERE d.email = 'harveydk@sbcglobal.net';

-- 4. Check if tax info exists
SELECT
  ti.id,
  ti.distributor_id,
  ti.ssn_last_4,
  ti.tax_id_type,
  ti.created_at
FROM distributor_tax_info ti
JOIN distributors d ON ti.distributor_id = d.id
WHERE d.email = 'harveydk@sbcglobal.net';

-- 5. Check for any signup rate limit entries (if applicable)
SELECT
  ip_address,
  created_at,
  COUNT(*) as attempts
FROM signup_rate_limits
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address, created_at
ORDER BY created_at DESC
LIMIT 10;
