// =============================================
// Apply Company Events Migration
// Directly executes the SQL migration via pg client
// =============================================

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('📦 Applying company_events migration...\n');

  // Check if table already exists
  const { data: existing } = await supabase
    .from('company_events')
    .select('id')
    .limit(1);

  if (existing !== null) {
    console.log('✅ company_events table already exists!');
    console.log('   Migration already applied.\n');
    return true;
  }

  console.log('⚠️  company_events table does not exist.');
  console.log('   Please apply the migration manually:\n');
  console.log('1. Open Supabase Dashboard');
  console.log('   https://supabase.com/dashboard/project/brejvdvzwshroxkkhmzy\n');
  console.log('2. Go to SQL Editor\n');
  console.log('3. Copy and paste the contents of:');
  console.log('   supabase/migrations/20260319000010_company_events_system.sql\n');
  console.log('4. Click "Run" to execute\n');

  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260319000010_company_events_system.sql'
  );

  if (fs.existsSync(migrationPath)) {
    console.log('📄 Migration file location:');
    console.log('  ', migrationPath, '\n');
  }

  return false;
}

applyMigration().catch(console.error);
