/**
 * Run SmartOffice Migration
 * Executes the SmartOffice database migration directly
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('📝 Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260321000001_smartoffice_integration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration executed successfully!');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables' as any)
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'smartoffice%');

    if (tablesError) {
      console.error('⚠️  Could not verify tables:', tablesError);
    } else {
      console.log('📊 SmartOffice tables created:');
      tables?.forEach((t: any) => console.log(`  - ${t.table_name}`));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runMigration();
