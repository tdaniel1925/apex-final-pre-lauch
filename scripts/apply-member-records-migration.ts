// =============================================
// Apply Member Records Migration
// Creates trigger + backfills member records
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Applying member records migration...\n');

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260317000001_auto_create_member_records.sql'
  );

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Execute migration
  console.log('📝 Executing SQL migration...');
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // Try direct execution if exec_sql doesn't exist
    console.log('⚠️  exec_sql not available, trying direct execution...');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      const { error: stmtError } = await supabase.rpc('exec', {
        query: statement
      });

      if (stmtError) {
        console.error('❌ Error executing statement:', stmtError);
        console.error('Statement:', statement.substring(0, 100) + '...');
      }
    }
  }

  // Verify backfill
  console.log('\n✅ Migration applied!');
  console.log('\n📊 Verifying results...\n');

  // Count distributors without member records
  const { count: missingCount } = await supabase
    .from('distributors')
    .select('id', { count: 'exact', head: true })
    .not('id', 'in', `(SELECT distributor_id FROM members)`);

  console.log(`Distributors without member records: ${missingCount || 0}`);

  // Count members by rank
  const { data: rankCounts } = await supabase
    .from('members')
    .select('tech_rank')
    .order('tech_rank');

  if (rankCounts) {
    const grouped = rankCounts.reduce((acc: any, m: any) => {
      acc[m.tech_rank] = (acc[m.tech_rank] || 0) + 1;
      return acc;
    }, {});

    console.log('\nMembers by rank:');
    Object.entries(grouped).forEach(([rank, count]) => {
      console.log(`  ${rank}: ${count}`);
    });
  }

  console.log('\n✅ Done!');
}

applyMigration().catch(console.error);
