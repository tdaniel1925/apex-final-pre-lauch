-- Check which tables from migration 002 exist
SELECT 
    'email_campaigns' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'email_campaigns') 
        THEN 'EXISTS' ELSE 'MISSING' END as status;

SELECT 
    'business_center_subscriptions' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'business_center_subscriptions') 
        THEN 'EXISTS' ELSE 'MISSING' END as status;

SELECT 
    'crm_contacts' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'crm_contacts') 
        THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Check columns in email_campaigns if it exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'email_campaigns'
ORDER BY ordinal_position;
