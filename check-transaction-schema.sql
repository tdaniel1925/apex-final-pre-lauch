-- Check what columns transactions table actually has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- Check sample transaction to see structure
SELECT * FROM transactions LIMIT 1;
