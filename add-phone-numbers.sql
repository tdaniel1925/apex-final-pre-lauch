-- =============================================
-- Add Phone Numbers to Distributors
-- Run this in Supabase SQL Editor to enable SMS notifications
-- =============================================

-- STEP 1: Check which distributors exist
-- (Run this first to see the current state)
SELECT
  id,
  first_name,
  last_name,
  email,
  phone
FROM distributors
ORDER BY created_at DESC;

-- STEP 2: Add YOUR phone number for testing
-- IMPORTANT: Replace 'your-email@example.com' with YOUR actual email
-- IMPORTANT: Replace '+16517287626' with YOUR actual phone number (E.164 format)

-- Example 1: Add phone to distributor by email
UPDATE distributors
SET phone = '+16517287626'  -- Your actual phone number
WHERE email = 'your-email@example.com';  -- Your email

-- Example 2: Add phone to distributor by ID (if you know the ID)
-- UPDATE distributors
-- SET phone = '+16517287626'
-- WHERE id = 'distributor-uuid-here';

-- STEP 3: Verify the update worked
SELECT
  id,
  first_name,
  last_name,
  email,
  phone
FROM distributors
WHERE phone IS NOT NULL
ORDER BY updated_at DESC;

-- =============================================
-- PHONE NUMBER FORMAT REQUIREMENTS
-- =============================================
-- ✅ CORRECT: '+16517287626' (E.164 format)
-- ✅ CORRECT: '+14155551234'
-- ✅ CORRECT: '+442071838750' (UK)
-- ❌ WRONG: '6517287626' (missing + and country code)
-- ❌ WRONG: '(651) 728-7626' (has formatting)
-- ❌ WRONG: '651-728-7626' (has dashes)

-- Use this tool to convert: https://www.twilio.com/lookup
-- Or format manually: +[country code][area code][number]
-- US/Canada: +1 followed by 10 digits

-- =============================================
-- BATCH UPDATE (if you want to add multiple)
-- =============================================

-- Add phone numbers to multiple distributors at once
UPDATE distributors
SET phone = CASE
  WHEN email = 'distributor1@example.com' THEN '+14155551234'
  WHEN email = 'distributor2@example.com' THEN '+14155555678'
  WHEN email = 'distributor3@example.com' THEN '+14155559999'
  ELSE phone  -- Keep existing phone if not in list
END
WHERE email IN (
  'distributor1@example.com',
  'distributor2@example.com',
  'distributor3@example.com'
);

-- =============================================
-- TROUBLESHOOTING
-- =============================================

-- Find distributors with invalid phone numbers (missing +)
SELECT
  id,
  first_name,
  last_name,
  email,
  phone
FROM distributors
WHERE phone IS NOT NULL
  AND phone NOT LIKE '+%';

-- Find distributors without phone numbers
SELECT
  id,
  first_name,
  last_name,
  email,
  phone
FROM distributors
WHERE phone IS NULL OR phone = '';
