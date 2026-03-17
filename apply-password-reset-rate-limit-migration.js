const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('=== Applying Password Reset Rate Limit Migration ===\n');

  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260316200100_create_password_reset_rate_limits.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Executing migration SQL...\n');

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Error applying migration:', error);

    // Try creating the table directly using the REST API method
    console.log('\nTrying alternative method...\n');

    // Create table using individual queries
    const queries = [
      `
      CREATE TABLE IF NOT EXISTS public.password_reset_rate_limits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ip_address TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      `,
      `
      CREATE INDEX IF NOT EXISTS idx_password_reset_rate_limits_ip_created
        ON public.password_reset_rate_limits(ip_address, created_at DESC);
      `,
      `
      CREATE INDEX IF NOT EXISTS idx_password_reset_rate_limits_created
        ON public.password_reset_rate_limits(created_at);
      `,
      `
      ALTER TABLE public.password_reset_rate_limits ENABLE ROW LEVEL SECURITY;
      `,
    ];

    for (const query of queries) {
      const { error: queryError } = await supabase.rpc('exec_sql', { sql_query: query });
      if (queryError) {
        console.error('Error executing query:', queryError);
      } else {
        console.log('✅ Query executed successfully');
      }
    }
  } else {
    console.log('✅ Migration applied successfully!');
  }

  console.log('\nDone!');
}

applyMigration();
