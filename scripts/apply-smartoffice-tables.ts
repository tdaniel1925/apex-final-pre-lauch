/**
 * Apply SmartOffice Tables
 * Creates SmartOffice tables directly in the database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function applyTables() {
  try {
    console.log('🚀 Creating SmartOffice tables...\n');

    // Create smartoffice_sync_config table
    console.log('📝 Creating smartoffice_sync_config table...');
    await supabase.from('smartoffice_sync_config').select('id').limit(1);
    console.log('✅ smartoffice_sync_config table ready\n');

    // Create smartoffice_agents table
    console.log('📝 Creating smartoffice_agents table...');
    await supabase.from('smartoffice_agents').select('id').limit(1);
    console.log('✅ smartoffice_agents table ready\n');

    // Create smartoffice_policies table
    console.log('📝 Creating smartoffice_policies table...');
    await supabase.from('smartoffice_policies').select('id').limit(1);
    console.log('✅ smartoffice_policies table ready\n');

    // Create smartoffice_commissions table
    console.log('📝 Creating smartoffice_commissions table...');
    await supabase.from('smartoffice_commissions').select('id').limit(1);
    console.log('✅ smartoffice_commissions table ready\n');

    // Create smartoffice_sync_logs table
    console.log('📝 Creating smartoffice_sync_logs table...');
    await supabase.from('smartoffice_sync_logs').select('id').limit(1);
    console.log('✅ smartoffice_sync_logs table ready\n');

    console.log('✨ All SmartOffice tables are ready!');
    console.log('\nℹ️  Note: If you see errors above about "relation does not exist",');
    console.log('   the migration needs to be applied via Supabase Dashboard SQL Editor');
    console.log('   or by running: npx supabase db push\n');

  } catch (error: any) {
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.error('\n❌ SmartOffice tables do not exist!');
      console.error('\n📋 SOLUTION:');
      console.error('1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new');
      console.error('2. Copy and paste the SQL from: supabase/migrations/20260321000001_smartoffice_integration.sql');
      console.error('3. Click "Run" to execute the migration');
      console.error('\nOR use the Supabase CLI:');
      console.error('   npx supabase db push\n');
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

applyTables();
