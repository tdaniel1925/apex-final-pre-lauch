// Script to apply ACH fields migration
// Run with: npx tsx scripts/apply-ach-migration.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🔄 Reading migration file...');
    const migrationPath = path.join(
      process.cwd(),
      'supabase',
      'migrations',
      '20260223000001_add_ach_fields.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📋 Migration SQL to execute:');
    console.log('---');
    console.log(migrationSQL);
    console.log('---\n');

    console.log('🔄 Attempting to apply migration...\n');

    // Since Supabase client doesn't support raw SQL execution directly,
    // we'll need to use the SQL editor in the dashboard
    // But let's try to verify if the columns already exist

    console.log('Checking if columns already exist...');

    const { data: testData, error: testError } = await supabase
      .from('distributors')
      .select('bank_name, bank_routing_number')
      .limit(0);

    if (!testError) {
      console.log('✅ Columns already exist! Migration may have been applied.');
      return;
    }

    // Columns don't exist, provide instructions
    console.log('\n⚠️  Columns do not exist yet. Manual application required.\n');
    console.log('📝 INSTRUCTIONS:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click "SQL Editor" in the left sidebar');
    console.log('4. Click "New Query"');
    console.log('5. Copy and paste the SQL above');
    console.log('6. Click "Run" to execute\n');
    console.log('Or, copy this file path and paste its contents:');
    console.log(`   ${migrationPath}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

applyMigration();
