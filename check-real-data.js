// Check for real vs mock data in the system
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRealData() {
  console.log('\n🔍 CHECKING FOR REAL VS MOCK DATA\n');
  console.log('='.repeat(60));

  // Check members
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, first_name, last_name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\n👥 MEMBERS:');
  if (membersError) {
    console.log('   ❌ Error:', membersError.message);
  } else {
    console.log(`   Total members: ${members?.length || 0}`);
    if (members && members.length > 0) {
      members.forEach(m => {
        console.log(`   - ${m.first_name} ${m.last_name} (${m.email}) - Created: ${new Date(m.created_at).toLocaleDateString()}`);
      });
    } else {
      console.log('   ⚠️  No members found');
    }
  }

  // Check sales
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('id, seller_id, product_id, status, total_cents, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\n💰 COMPLETED SALES:');
  if (salesError) {
    console.log('   ❌ Error:', salesError.message);
  } else {
    console.log(`   Total completed sales: ${sales?.length || 0}`);
    if (sales && sales.length > 0) {
      sales.forEach(s => {
        console.log(`   - Sale #${s.id} - $${(s.total_cents / 100).toFixed(2)} - ${new Date(s.created_at).toLocaleDateString()}`);
      });
    } else {
      console.log('   ⚠️  No sales found');
    }
  }

  // Check earnings
  const { data: earnings, error: earningsError } = await supabase
    .from('earnings_ledger')
    .select('id, member_id, earning_type, amount_cents, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\n💵 EARNINGS LEDGER:');
  if (earningsError) {
    console.log('   ❌ Error:', earningsError.message);
  } else {
    console.log(`   Total earnings entries: ${earnings?.length || 0}`);
    if (earnings && earnings.length > 0) {
      earnings.forEach(e => {
        console.log(`   - ${e.earning_type} - $${(e.amount_cents / 100).toFixed(2)} - ${new Date(e.created_at).toLocaleDateString()}`);
      });
    } else {
      console.log('   ⚠️  No earnings found');
    }
  }

  // Check compensation config (should have data from seed)
  const { data: config, error: configError } = await supabase
    .from('compensation_plan_configs')
    .select('id, name, version, is_active, created_at')
    .order('created_at', { ascending: false });

  console.log('\n⚙️  COMPENSATION CONFIG:');
  if (configError) {
    console.log('   ❌ Error:', configError.message);
  } else {
    console.log(`   Total configs: ${config?.length || 0}`);
    if (config && config.length > 0) {
      config.forEach(c => {
        console.log(`   - ${c.name} (v${c.version}) - ${c.is_active ? '✅ ACTIVE' : '⏸️  Inactive'} - ${new Date(c.created_at).toLocaleDateString()}`);
      });
    } else {
      console.log('   ⚠️  No configs found');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ VERDICT:');

  const hasMembers = members && members.length > 0;
  const hasSales = sales && sales.length > 0;
  const hasEarnings = earnings && earnings.length > 0;
  const hasConfig = config && config.length > 0;

  if (hasMembers || hasSales || hasEarnings) {
    console.log('   🟢 System has REAL data from user signups/activity');
    if (!hasSales) console.log('   ⚠️  No sales yet - expected if just launched');
    if (!hasEarnings) console.log('   ⚠️  No earnings yet - expected if no sales');
  } else if (hasConfig) {
    console.log('   🟡 System has compensation CONFIG only (from seed migration)');
    console.log('   ℹ️  No members, sales, or earnings yet');
    console.log('   ℹ️  This is EXPECTED for a fresh install');
  } else {
    console.log('   🔴 System appears EMPTY - no data at all');
  }

  console.log('\n');
}

checkRealData().catch(console.error);
