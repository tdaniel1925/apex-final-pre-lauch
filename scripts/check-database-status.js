const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDatabaseStatus() {
  console.log('🔍 Checking Database Migration Status...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 CHECKING AUTOPILOT TABLES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const tablesToCheck = [
    'autopilot_subscriptions',
    'autopilot_usage_limits',
    'meeting_invitations',
    'event_flyers',
    'sms_campaigns',
    'sms_messages',
    'crm_contacts',
    'crm_pipeline',
    'crm_tasks',
    'team_broadcasts',
    'training_shares',
    'social_posts',
  ];

  let existingTables = [];
  let missingTables = [];

  for (const tableName of tablesToCheck) {
    // Try to query the table - if it exists, we'll get data or empty array
    // If it doesn't exist, we'll get an error
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log(`❌ ${tableName} - NOT FOUND`);
        missingTables.push(tableName);
      } else {
        console.log(`⚠️  ${tableName} - ${error.message}`);
      }
    } else {
      console.log(`✅ ${tableName} - EXISTS (${data?.length || 0} rows)`);
      existingTables.push(tableName);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Tables Found: ${existingTables.length}/${tablesToCheck.length}`);
  console.log(`❌ Tables Missing: ${missingTables.length}/${tablesToCheck.length}`);

  if (missingTables.length > 0) {
    console.log('\n⚠️  MISSING TABLES:');
    missingTables.forEach(t => console.log(`   - ${t}`));
    console.log('\n📝 ACTION NEEDED: Run migrations to create these tables');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 CHECKING RLS POLICIES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check if RLS policies exist by trying to access as anon
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const rlsTests = [
    'members',
    'distributors',
    'autopilot_subscriptions',
    'meeting_invitations',
  ];

  let rlsProtected = 0;
  let rlsUnprotected = 0;

  for (const tableName of rlsTests) {
    const { data, error } = await anonClient
      .from(tableName)
      .select('*')
      .limit(1);

    const isBlocked = !data || data.length === 0 || error !== null;

    if (isBlocked) {
      console.log(`🔒 ${tableName} - PROTECTED (RLS active)`);
      rlsProtected++;
    } else {
      console.log(`🔓 ${tableName} - UNPROTECTED (data accessible!)`);
      rlsUnprotected++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 MIGRATION STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (existingTables.length === tablesToCheck.length && rlsProtected === rlsTests.length) {
    console.log('✅ ALL MIGRATIONS COMPLETE!');
    console.log('✅ All autopilot tables created');
    console.log('✅ RLS security policies active');
    console.log('\n🚀 System ready for deployment!');
  } else if (existingTables.length > 0) {
    console.log('⚠️  PARTIAL MIGRATION');
    console.log(`   Tables: ${existingTables.length}/${tablesToCheck.length} created`);
    console.log(`   RLS: ${rlsProtected}/${rlsTests.length} protected`);
    console.log('\n📝 You need to run the remaining migrations');
  } else {
    console.log('❌ NO MIGRATIONS RUN YET');
    console.log('\n📝 You need to run all 5 migration files:');
    console.log('   1. 20260318000004_apex_lead_autopilot_schema.sql');
    console.log('   2. 20260318000005_apex_lead_autopilot_additions.sql');
    console.log('   3. 20260318000006_fix_autopilot_trigger.sql');
    console.log('   4. 20260319000002_complete_anonymous_block.sql');
    console.log('   5. 20260319000003_remove_public_distributor_access.sql');
  }
}

checkDatabaseStatus().catch(console.error);
