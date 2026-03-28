-- =============================================
-- Add Phone Numbers to ALL Distributors
-- Custom script for your 17 distributors
-- =============================================

-- OPTION 1: Add phone numbers one by one (RECOMMENDED)
-- Replace the phone numbers with actual phone numbers for each person

UPDATE distributors SET phone = '+16517287626' WHERE email = 'tdaniel@botmakers.ai';  -- Trent/Apex Vision
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'marhughes@gmail.com';  -- Mark Hughes
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'saalik@lifeguardagency.com';  -- Saalik Patel
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'plan4securelife@gmail.com';  -- Falguni Jariwala
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'tdaniel@bundlefly.com';  -- Trent Daniel
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'hafeez@pifgonline.com';  -- Hafeez Rangwala
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'juandavid0305@icloud.com';  -- Juan Olivella
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'phil@valorfs.com';  -- Phil Resch
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'svn1906@hotmail.com';  -- John Tran
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'hannah@bedrockfinancialplanning.com';  -- Hannah Townsend
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'trinr187@gmail.com';  -- Trinity Rawlston
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'wullschleger.eric@gmail.com';  -- Eric Wullschleger
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'matthewbporter@yahoo.com';  -- Matthew Porter
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'grayson@3markslc.com';  -- Grayson Millard
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'justin@3markslc.com';  -- Justin Christensen
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'johnjacob67@gmail.com';  -- John Jacob
UPDATE distributors SET phone = '+1XXXXXXXXXX' WHERE email = 'dessiah@m.botmakers.ai';  -- Dessiah Daniel

-- =============================================

-- OPTION 2: Batch update with CASE statement
-- Replace all the phone numbers below

UPDATE distributors
SET phone = CASE
  WHEN email = 'tdaniel@botmakers.ai' THEN '+16517287626'  -- Apex Vision (Trent)
  WHEN email = 'marhughes@gmail.com' THEN '+1XXXXXXXXXX'  -- Mark Hughes
  WHEN email = 'saalik@lifeguardagency.com' THEN '+1XXXXXXXXXX'  -- Saalik Patel
  WHEN email = 'plan4securelife@gmail.com' THEN '+1XXXXXXXXXX'  -- Falguni Jariwala
  WHEN email = 'tdaniel@bundlefly.com' THEN '+1XXXXXXXXXX'  -- Trent Daniel
  WHEN email = 'hafeez@pifgonline.com' THEN '+1XXXXXXXXXX'  -- Hafeez Rangwala
  WHEN email = 'juandavid0305@icloud.com' THEN '+1XXXXXXXXXX'  -- Juan Olivella
  WHEN email = 'phil@valorfs.com' THEN '+1XXXXXXXXXX'  -- Phil Resch
  WHEN email = 'svn1906@hotmail.com' THEN '+1XXXXXXXXXX'  -- John Tran
  WHEN email = 'hannah@bedrockfinancialplanning.com' THEN '+1XXXXXXXXXX'  -- Hannah Townsend
  WHEN email = 'trinr187@gmail.com' THEN '+1XXXXXXXXXX'  -- Trinity Rawlston
  WHEN email = 'wullschleger.eric@gmail.com' THEN '+1XXXXXXXXXX'  -- Eric Wullschleger
  WHEN email = 'matthewbporter@yahoo.com' THEN '+1XXXXXXXXXX'  -- Matthew Porter
  WHEN email = 'grayson@3markslc.com' THEN '+1XXXXXXXXXX'  -- Grayson Millard
  WHEN email = 'justin@3markslc.com' THEN '+1XXXXXXXXXX'  -- Justin Christensen
  WHEN email = 'johnjacob67@gmail.com' THEN '+1XXXXXXXXXX'  -- John Jacob
  WHEN email = 'dessiah@m.botmakers.ai' THEN '+1XXXXXXXXXX'  -- Dessiah Daniel
  ELSE phone  -- Keep existing if not in list
END
WHERE email IN (
  'tdaniel@botmakers.ai',
  'marhughes@gmail.com',
  'saalik@lifeguardagency.com',
  'plan4securelife@gmail.com',
  'tdaniel@bundlefly.com',
  'hafeez@pifgonline.com',
  'juandavid0305@icloud.com',
  'phil@valorfs.com',
  'svn1906@hotmail.com',
  'hannah@bedrockfinancialplanning.com',
  'trinr187@gmail.com',
  'wullschleger.eric@gmail.com',
  'matthewbporter@yahoo.com',
  'grayson@3markslc.com',
  'justin@3markslc.com',
  'johnjacob67@gmail.com',
  'dessiah@m.botmakers.ai'
);

-- =============================================

-- OPTION 3: Just add YOUR phone for testing first
-- This is the safest way to start

UPDATE distributors
SET phone = '+16517287626'
WHERE email = 'tdaniel@botmakers.ai';

-- =============================================

-- VERIFY: Check which distributors now have phone numbers

SELECT
  first_name,
  last_name,
  email,
  phone
FROM distributors
WHERE phone IS NOT NULL AND phone != ''
ORDER BY first_name;

-- =============================================

-- PHONE FORMAT REMINDER:
-- ✅ CORRECT: '+16517287626' (E.164 format)
-- ❌ WRONG: '6517287626' (missing +1)
-- ❌ WRONG: '(651) 728-7626' (has formatting)

-- For US/Canada: +1 followed by 10 digits (no spaces, dashes, or parentheses)
-- Example: +14155551234

-- =============================================

-- YOUR 17 DISTRIBUTORS:
-- 1. Mark Hughes - marhughes@gmail.com
-- 2. Apex Vision (Trent) - tdaniel@botmakers.ai ✅ Ready (+16517287626)
-- 3. Saalik Patel - saalik@lifeguardagency.com
-- 4. Falguni Jariwala - plan4securelife@gmail.com
-- 5. Trent Daniel - tdaniel@bundlefly.com
-- 6. Hafeez Rangwala - hafeez@pifgonline.com
-- 7. Juan Olivella - juandavid0305@icloud.com
-- 8. Phil Resch - phil@valorfs.com
-- 9. John Tran - svn1906@hotmail.com
-- 10. Hannah Townsend - hannah@bedrockfinancialplanning.com
-- 11. Trinity Rawlston - trinr187@gmail.com
-- 12. Eric Wullschleger - wullschleger.eric@gmail.com
-- 13. Matthew Porter - matthewbporter@yahoo.com
-- 14. Grayson Millard - grayson@3markslc.com
-- 15. Justin Christensen - justin@3markslc.com
-- 16. John Jacob - johnjacob67@gmail.com
-- 17. Dessiah Daniel - dessiah@m.botmakers.ai
