// Apply SmartOffice migration to production database
// Reads the migration SQL and executes it via Supabase client

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('🚀 Applying SmartOffice Migration to Production\n');
  console.log(`📡 Database: ${supabaseUrl}\n`);

  // Read migration file
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '20260321000001_smartoffice_integration.sql'
  );

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📄 Migration file loaded');
  console.log(`   → Path: ${migrationPath}`);
  console.log(`   → Size: ${migrationSQL.length} characters\n`);

  console.log('⚠️  WARNING: About to execute SQL migration on production database!\n');
  console.log('This will create the following tables:');
  console.log('  - smartoffice_sync_config (with credentials)');
  console.log('  - smartoffice_agents');
  console.log('  - smartoffice_policies');
  console.log('  - smartoffice_commissions');
  console.log('  - smartoffice_sync_logs\n');

  console.log('Proceeding in 3 seconds...\n');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    console.log('🔄 Executing migration SQL...\n');

    // Use Supabase client to execute raw SQL
    // Note: We need to execute this via RPC or use the management API
    // For production, you should use Supabase Dashboard or CLI

    console.log('⚠️  IMPORTANT: This script cannot execute raw SQL via Supabase client.');
    console.log('   → Supabase client does not support raw SQL execution for security\n');

    console.log('📋 Please apply this migration manually:\n');
    console.log('Option 1: Supabase Dashboard SQL Editor');
    console.log('  1. Go to: https://supabase.com/dashboard/project/brejvdvzwshroxkkhmzy/sql/new');
    console.log('  2. Copy the SQL from: supabase/migrations/20260321000001_smartoffice_integration.sql');
    console.log('  3. Paste and run it\n');

    console.log('Option 2: Supabase CLI');
    console.log('  1. Install Supabase CLI: npm install -g supabase');
    console.log('  2. Link project: supabase link --project-ref brejvdvzwshroxkkhmzy');
    console.log('  3. Push migrations: supabase db push\n');

    console.log('Option 3: Use this script output (COPY BELOW):\n');
    console.log('='.repeat(60));
    console.log(migrationSQL);
    console.log('='.repeat(60));
    console.log('\n✅ Copy the SQL above and run it in Supabase Dashboard SQL Editor');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration().catch(console.error);
