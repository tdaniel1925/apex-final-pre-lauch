-- Check if the necessary columns exist on distributors table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'distributors' 
AND column_name IN ('admin_notes_count', 'last_admin_action', 'last_admin_action_by')
ORDER BY column_name;
