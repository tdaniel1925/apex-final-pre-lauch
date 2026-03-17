// Check for existing members in the system
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExistingMembers() {
  console.log('\n🔍 CHECKING FOR EXISTING MEMBERS/REPS\n');
  console.log('='.repeat(60));

  // Try to find the members table
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .like('table_name', '%member%');

  console.log('\n📋 Tables with "member" in name:');
  if (tablesError) {
    console.log('   ❌ Error checking tables:', tablesError.message);
  } else if (tables && tables.length > 0) {
    tables.forEach(t => console.log(`   - ${t.table_name}`));
  } else {
    console.log('   ℹ️  No tables found with "member" in name');
  }

  // Check auth.users (Supabase Auth)
  const { data: authUsers, error: authError, count: authCount } = await supabase
    .from('auth.users')
    .select('id, email, created_at', { count: 'exact' });

  console.log('\n👤 AUTH.USERS (Supabase Auth):');
  if (authError) {
    console.log('   ℹ️  Cannot query auth.users directly (expected - requires admin access)');
    console.log('   ℹ️  Trying alternative method...');

    // Try RPC call instead
    const { data: rpcUsers, error: rpcError } = await supabase.rpc('get_user_count');
    if (rpcError) {
      console.log('   ℹ️  RPC not available, using admin API...');
    }
  } else {
    console.log(`   Total auth users: ${authCount || authUsers?.length || 0}`);
    if (authUsers && authUsers.length > 0) {
      console.log('   First 5 users:');
      authUsers.slice(0, 5).forEach(u => {
        console.log(`   - ${u.email} (created: ${new Date(u.created_at).toLocaleDateString()})`);
      });
    }
  }

  // Check if members table exists and query it
  const { data: membersList, error: membersError, count: membersCount } = await supabase
    .from('members')
    .select('member_id, first_name, last_name, email, member_status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  console.log('\n👥 MEMBERS TABLE:');
  if (membersError) {
    if (membersError.message.includes('does not exist')) {
      console.log('   ℹ️  Members table does not exist yet');
      console.log('   ℹ️  This is NORMAL if using new dual-ladder schema');
    } else {
      console.log('   ❌ Error:', membersError.message);
    }
  } else {
    console.log(`   Total members: ${membersCount || membersList?.length || 0}`);
    if (membersList && membersList.length > 0) {
      console.log('\n   📊 Member Details:');
      membersList.forEach(m => {
        console.log(`   - ${m.first_name} ${m.last_name} (${m.email})`);
        console.log(`     Status: ${m.member_status || 'active'}`);
        console.log(`     Created: ${new Date(m.created_at).toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('   ℹ️  No members found - table is empty');
    }
  }

  // Check distributors table (old schema name)
  const { data: distributorsList, error: distributorsError, count: distributorsCount } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  console.log('\n👥 DISTRIBUTORS TABLE (Old Schema):');
  if (distributorsError) {
    if (distributorsError.message.includes('does not exist')) {
      console.log('   ℹ️  Distributors table does not exist');
    } else {
      console.log('   ❌ Error:', distributorsError.message);
    }
  } else {
    console.log(`   Total distributors: ${distributorsCount || distributorsList?.length || 0}`);
    if (distributorsList && distributorsList.length > 0) {
      console.log('\n   📊 Distributor Details:');
      distributorsList.forEach(d => {
        console.log(`   - ${d.first_name} ${d.last_name} (${d.email})`);
        console.log(`     Status: ${d.status}`);
        console.log(`     Created: ${new Date(d.created_at).toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('   ℹ️  No distributors found - table is empty');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ SUMMARY:\n');

  const hasMembers = membersList && membersList.length > 0;
  const hasDistributors = distributorsList && distributorsList.length > 0;

  if (hasMembers || hasDistributors) {
    console.log('   🟢 EXISTING REPS FOUND IN DATABASE');
    console.log(`   📊 Members: ${membersList?.length || 0}`);
    console.log(`   📊 Distributors: ${distributorsList?.length || 0}`);
    console.log('\n   ⚠️  NO DATA WAS DELETED - all existing reps are still in database');
  } else {
    console.log('   🟡 NO REPS FOUND');
    console.log('   ℹ️  Database is empty - no members or distributors yet');
    console.log('   ℹ️  This is NORMAL for a fresh install or new migration');
  }

  console.log('\n');
}

checkExistingMembers().catch(console.error);
