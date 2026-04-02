/**
 * Apply paying_rank migration to database
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function main() {
  console.log('📦 Applying paying_rank migration...\n');

  try {
    // Read the migration file
    const migrationSQL = await fs.readFile(
      'supabase/migrations/20260322000002_add_paying_rank_column.sql',
      'utf-8'
    );

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try direct approach if exec_sql doesn't exist
      console.log('Trying alternative approach...\n');

      // Split into individual statements and execute
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const statement of statements) {
        if (!statement) continue;

        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error: execError } = await supabase.rpc('exec_sql', { sql: statement + ';' });

        if (execError) {
          console.error(`❌ Error: ${execError.message}`);
          if (!execError.message.includes('already exists')) {
            throw execError;
          } else {
            console.log('   ⚠️  Already exists, skipping...');
          }
        } else {
          console.log('   ✅ Done');
        }
      }
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\nVerifying...');

    // Verify the column exists
    const { data, error: verifyError } = await supabase
      .from('members')
      .select('paying_rank')
      .limit(1);

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`);
    }

    console.log('✅ paying_rank column verified!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
