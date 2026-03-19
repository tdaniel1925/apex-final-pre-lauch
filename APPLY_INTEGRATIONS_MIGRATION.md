# Apply External Integrations Migration

## Quick Steps (5 minutes)

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

### 2. Copy Migration SQL
Open this file and copy ALL contents:
```
supabase/migrations/20260317181850_external_integrations_system.sql
```

### 3. Paste and Run
- Paste the SQL into the Supabase SQL Editor
- Click **"Run"** button
- Wait for success message

### 4. Verify Tables Created
Run this query to verify:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'integrations',
  'distributor_replicated_sites',
  'integration_product_mappings',
  'external_sales',
  'integration_webhook_logs'
);
```

You should see 5 tables listed.

### 5. Check Seeded Data
Run this query:
```sql
SELECT platform_name, display_name, is_enabled, supports_replicated_sites
FROM integrations
ORDER BY platform_name;
```

You should see:
- **agentpulse** (AgentPulse Cloud)
- **jordyn** (Jordyn.app)

## Done!

The integrations system is now ready to use. Go to:
- `/admin/integrations` - Manage platforms
- `/admin/integrations/product-mappings` - Configure products

## Troubleshooting

### "relation already exists"
Tables are already created. Skip to step 4 to verify.

### "permission denied"
Make sure you're using the Supabase Dashboard (not local psql).

### "syntax error"
Make sure you copied the ENTIRE file including all comments.
