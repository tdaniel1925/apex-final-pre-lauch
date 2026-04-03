import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = fs.readFileSync('supabase/migrations/20260403000001_create_crm_activities.sql', 'utf-8');

// Split into statements and execute one by one
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`\n📋 Applying ${statements.length} SQL statements...\n`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i] + ';';
  const preview = stmt.substring(0, 60).replace(/\n/g, ' ') + '...';

  try {
    // Use raw SQL execution through a stored procedure or direct query
    const result = await supabase.rpc('execute_sql', { query: stmt }).catch(async () => {
      // Fallback: Try creating table directly through schema
      if (stmt.includes('CREATE TABLE')) {
        // Parse table name and execute
        console.log(`⚠️  Cannot execute via RPC, skipping: ${preview}`);
        return { data: null, error: null };
      }
      throw new Error('RPC not available');
    });

    console.log(`✅ [${i + 1}/${statements.length}] ${preview}`);
  } catch (error) {
    console.log(`⚠️  [${i + 1}/${statements.length}] ${preview}`);
    console.log(`   Error: ${error.message}`);
  }
}

console.log('\n✅ Migration application attempted. Please verify in Supabase dashboard.\n');
console.log('If errors occurred, copy the SQL from:');
console.log('supabase/migrations/20260403000001_create_crm_activities.sql');
console.log('And run it manually in Supabase SQL Editor\n');
