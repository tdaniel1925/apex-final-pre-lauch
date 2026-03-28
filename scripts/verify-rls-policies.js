const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyRLSPolicies() {
  console.log('🔍 Verifying RLS Policies in Database...\n');

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Query PostgreSQL system catalog to check policies
  const { data: policies, error } = await serviceClient.rpc('exec_sql', {
    sql_query: `
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename IN ('members', 'distributors', 'autopilot_subscriptions')
        AND 'anon' = ANY(roles)
      ORDER BY tablename, policyname;
    `
  }).catch((err) => {
    // If exec_sql doesn't exist, try direct query
    return serviceClient.from('pg_policies').select('*');
  });

  if (error) {
    console.log('❌ Error querying policies:', error.message);
    console.log('\nTrying alternative method...\n');

    // Try checking if RLS is enabled
    const { data: tables } = await serviceClient.rpc('exec_sql', {
      sql_query: `
        SELECT tablename, rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename IN ('members', 'distributors', 'autopilot_subscriptions');
      `
    }).catch(() => ({ data: null }));

    if (tables) {
      console.log('RLS Status:');
      console.log(tables);
    }
  } else {
    console.log('📋 RLS Policies for anon role:\n');
    if (policies && policies.length > 0) {
      policies.forEach(policy => {
        console.log(`Table: ${policy.tablename}`);
        console.log(`  Policy: ${policy.policyname}`);
        console.log(`  Command: ${policy.cmd}`);
        console.log(`  USING: ${policy.qual}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No policies found for anon role!');
      console.log('This means the RLS policies were NOT applied or were removed.');
    }
  }
}

verifyRLSPolicies().catch(console.error);
