// =============================================
// Run SQL Migration to Update Matrix Depth Constraint
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQLMigration() {
  console.log('🚀 Running SQL Migration...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'update-matrix-depth-constraint.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📍 Executing SQL:');
    console.log('─────────────────────────────────────────');
    console.log(sql);
    console.log('─────────────────────────────────────────\n');

    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct execution
      console.log('⚠️  RPC method failed, trying direct execution...\n');

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.toLowerCase().includes('select')) {
          // Query statement
          const { data: queryData, error: queryError } = await supabase
            .from('information_schema.check_constraints')
            .select('*')
            .eq('constraint_name', 'distributors_matrix_depth_check');

          if (queryError) {
            console.error('❌ Query failed:', queryError.message);
          } else {
            console.log('✅ Constraint verification:', queryData);
          }
        }
      }

      console.log('\n⚠️  Note: SQL execution requires manual intervention.');
      console.log('📝 Please run the following SQL in Supabase SQL Editor:\n');
      console.log('─────────────────────────────────────────');
      console.log(sql);
      console.log('─────────────────────────────────────────\n');
      return;
    }

    console.log('✅ SQL Migration completed successfully!\n');
    console.log('📝 Result:', data);

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
runSQLMigration()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
