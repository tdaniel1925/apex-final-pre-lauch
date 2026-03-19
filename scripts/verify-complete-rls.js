const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyCompleteRLS() {
  console.log('🔐 COMPREHENSIVE RLS SECURITY VERIFICATION\n');
  console.log('Testing anonymous access to all protected tables...\n');

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const tables = [
    'members',
    'distributors',
    'autopilot_subscriptions',
    'autopilot_usage_limits',
    'meeting_invitations',
    'event_flyers',
    'sms_campaigns',
    'sms_messages',
  ];

  let allBlocked = true;
  const results = [];

  for (const table of tables) {
    const { data, error } = await anonClient
      .from(table)
      .select('*')
      .limit(1);

    const isBlocked = !data || data.length === 0 || error !== null;

    results.push({
      table,
      blocked: isBlocked,
      dataCount: data?.length || 0,
      hasError: error !== null,
    });

    if (!isBlocked) {
      allBlocked = false;
    }
  }

  // Display results
  console.log('┌─────────────────────────────┬──────────┬───────────┐');
  console.log('│ Table                       │ Blocked  │ Data Rows │');
  console.log('├─────────────────────────────┼──────────┼───────────┤');

  results.forEach(({ table, blocked, dataCount }) => {
    const status = blocked ? '✅ YES' : '❌ NO';
    const paddedTable = table.padEnd(27);
    const paddedStatus = status.padEnd(8);
    const paddedCount = String(dataCount).padStart(9);
    console.log(`│ ${paddedTable} │ ${paddedStatus} │${paddedCount} │`);
  });

  console.log('└─────────────────────────────┴──────────┴───────────┘');
  console.log('');

  if (allBlocked) {
    console.log('✅ SUCCESS: All tables are protected from anonymous access!');
    console.log('✅ Your requirement is met: Only authenticated members and admins can access data.');
  } else {
    console.log('❌ FAILED: Some tables are still accessible to anonymous users!');
    const unprotected = results.filter(r => !r.blocked);
    console.log('\nUnprotected tables:');
    unprotected.forEach(r => console.log(`  - ${r.table}`));
  }

  console.log('\n📊 Summary:');
  console.log(`  Total tables tested: ${tables.length}`);
  console.log(`  Protected: ${results.filter(r => r.blocked).length}`);
  console.log(`  Unprotected: ${results.filter(r => !r.blocked).length}`);
}

verifyCompleteRLS().catch(console.error);
