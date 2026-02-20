import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log('🚀 Running training system migration...\n');

  try {
    // Read migration file
    const migrationPath = join(
      process.cwd(),
      'supabase',
      'migrations',
      '20250220000000_create_training_system.sql'
    );

    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL...\n');

    // Execute migration using RPC (raw SQL)
    // Note: Supabase doesn't have a direct SQL execution endpoint,
    // so we'll need to apply this through the dashboard or use a different approach

    console.log('⚠️  Please apply the migration manually:');
    console.log('1. Go to https://brejvdvzwshroxkkhmzy.supabase.co/project/_/sql');
    console.log('2. Copy the contents of supabase/migrations/20250220000000_create_training_system.sql');
    console.log('3. Paste and run the SQL');
    console.log('\nOR');
    console.log('Run: npx supabase db push (after linking with: npx supabase link)\n');

    // Verify tables exist (this will work after manual migration)
    console.log('🔍 Checking if tables exist...');

    const { data: tables, error } = await supabase
      .from('training_content')
      .select('count')
      .limit(0);

    if (!error) {
      console.log('✅ training_content table exists!');
    } else {
      console.log('⚠️  Tables not yet created. Please run migration SQL manually.');
    }

  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
