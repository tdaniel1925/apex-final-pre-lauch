-- Quick verification of estimated_earnings table
SELECT 
  'Table exists' as check_item,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ YES' 
    ELSE '❌ NO' 
  END as status
FROM information_schema.tables 
WHERE table_name = 'estimated_earnings';
