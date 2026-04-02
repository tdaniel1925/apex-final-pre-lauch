/**
 * Investigation: Apex-Vision 499 Credits Mystery
 *
 * This script checks why apex-vision rep has 499 org credits
 * when no sales have happened and no PV or BV has been generated.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigate() {
  console.log('\n🔍 INVESTIGATING APEX-VISION CREDITS MYSTERY\n');
  console.log('='.repeat(70));

  try {
    // 1. Find apex-vision distributor
    console.log('\n📋 STEP 1: Finding apex-vision distributor...\n');

    const { data: distributors, error: distError } = await supabase
      .from('distributors')
      .select('id, email, first_name, last_name, slug, status')
      .or('slug.ilike.%apex-vision%,email.ilike.%apex-vision%')
      .limit(5);

    if (distError) {
      console.error('Error finding distributor:', distError);
      return;
    }

    if (!distributors || distributors.length === 0) {
      console.log('❌ No apex-vision distributor found');
      return;
    }

    console.log('✅ Found distributor(s):');
    distributors.forEach(d => {
      console.log(`   • ${d.first_name} ${d.last_name} (${d.email})`);
      console.log(`     Slug: ${d.slug}`);
      console.log(`     Status: ${d.status}`);
      console.log('');
    });

    const distributor = distributors[0];

    // 2. Check member record
    console.log('📊 STEP 2: Checking member record...\n');

    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('distributor_id', distributor.id)
      .single();

    if (memberError) {
      console.error('Error finding member:', memberError);
      return;
    }

    console.log('✅ Member Details:');
    console.log(`   Name: ${member.full_name}`);
    console.log(`   Email: ${member.email}`);
    console.log(`   PV (Personal Credits): ${member.personal_credits_monthly || 0}`);
    console.log(`   GV (Team Credits): ${member.team_credits_monthly || 0}`);
    console.log(`   Rank: ${member.paying_rank || 'starter'}`);
    console.log(`   Created: ${new Date(member.created_at).toLocaleDateString()}`);
    console.log('');

    if (member.team_credits_monthly === 499) {
      console.log('🎯 FOUND IT! Team credits = 499');
      console.log('   This is the "org credits" mentioned in the issue\n');
    }

    // 3. Check transactions
    console.log('💳 STEP 3: Checking transactions...\n');

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false });

    if (txError) {
      console.error('Error finding transactions:', txError);
    } else if (!transactions || transactions.length === 0) {
      console.log('❌ No transactions found for this distributor');
    } else {
      console.log(`✅ Found ${transactions.length} transaction(s):`);
      transactions.forEach(tx => {
        console.log(`   • ${new Date(tx.created_at).toLocaleDateString()}: ${tx.transaction_type}`);
        console.log(`     Product: ${tx.product_slug || 'N/A'}`);
        console.log(`     Amount: $${tx.amount || 0}`);
        console.log('');
      });
    }

    // 4. Check orders
    console.log('📦 STEP 4: Checking orders...\n');

    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false });

    if (orderError) {
      console.error('Error finding orders:', orderError);
    } else if (!orders || orders.length === 0) {
      console.log('❌ No orders found for this distributor');
    } else {
      console.log(`✅ Found ${orders.length} order(s):`);
      orders.forEach(order => {
        console.log(`   • Order #${order.order_number}`);
        console.log(`     Date: ${new Date(order.created_at).toLocaleDateString()}`);
        console.log(`     Total: $${(order.total_cents / 100).toFixed(2)}`);
        console.log(`     BV: ${order.total_bv || 0}`);
        console.log(`     Status: ${order.payment_status}`);
        console.log('');
      });
    }

    // 5. Check for manual credit adjustments
    console.log('⚙️ STEP 5: Checking for manual credit adjustments...\n');

    const { data: adminActivity, error: adminError } = await supabase
      .from('admin_activity')
      .select('*')
      .eq('distributor_id', distributor.id)
      .ilike('action_description', '%credit%')
      .order('created_at', { ascending: false });

    if (adminError) {
      console.log('   (admin_activity table may not exist - skipping)');
    } else if (!adminActivity || adminActivity.length === 0) {
      console.log('❌ No admin activity records found');
    } else {
      console.log(`✅ Found ${adminActivity.length} admin action(s):`);
      adminActivity.forEach(action => {
        console.log(`   • ${new Date(action.created_at).toLocaleDateString()}: ${action.action_type}`);
        console.log(`     By: ${action.admin_name || 'Unknown'}`);
        console.log(`     Description: ${action.action_description}`);
        console.log('');
      });
    }

    // 6. Check downline (source of org credits)
    console.log('👥 STEP 6: Checking downline (source of team credits)...\n');

    const { data: downline, error: downlineError } = await supabase
      .from('distributors')
      .select(`
        id,
        first_name,
        last_name,
        slug,
        member:members!members_distributor_id_fkey (
          personal_credits_monthly,
          team_credits_monthly
        )
      `)
      .eq('sponsor_id', distributor.id);

    if (downlineError) {
      console.error('Error finding downline:', downlineError);
    } else if (!downline || downline.length === 0) {
      console.log('❌ No direct enrollees found (sponsor_id chain)');
    } else {
      console.log(`✅ Found ${downline.length} direct enrollee(s):`);
      let totalDownlinePV = 0;
      downline.forEach(d => {
        const pv = d.member?.personal_credits_monthly || 0;
        const gv = d.member?.team_credits_monthly || 0;
        totalDownlinePV += pv;
        console.log(`   • ${d.first_name} ${d.last_name} (${d.slug})`);
        console.log(`     PV: ${pv}, GV: ${gv}`);
        console.log('');
      });
      console.log(`📊 Total PV from direct enrollees: ${totalDownlinePV}`);
      console.log('');
    }

    // ANALYSIS
    console.log('='.repeat(70));
    console.log('\n📊 ANALYSIS:\n');

    if (member.team_credits_monthly === 499) {
      console.log('✅ CONFIRMED: team_credits_monthly = 499');
      console.log('');

      if (!transactions || transactions.length === 0) {
        console.log('❌ NO TRANSACTIONS found for this member');
      }

      if (!orders || orders.length === 0) {
        console.log('❌ NO ORDERS found for this member');
      }

      if (member.personal_credits_monthly === 0) {
        console.log('❌ Personal credits = 0 (no personal sales)');
      }

      console.log('');
      console.log('🔍 Possible Explanations:');
      console.log('   1. Manual adjustment by admin (check admin_activity)');
      console.log('   2. System initialization credits (test data)');
      console.log('   3. Downline sales propagated up (check team members)');
      console.log('   4. Import from another system');
      console.log('   5. Bug in credit calculation');
      console.log('');

      if (downline && downline.length > 0) {
        const totalDownlinePV = downline.reduce((sum, d) => sum + (d.member?.personal_credits_monthly || 0), 0);
        console.log(`   Team credits should equal total team PV: ${totalDownlinePV}`);
        console.log(`   Actual team credits: ${member.team_credits_monthly}`);
        console.log(`   Difference: ${member.team_credits_monthly - totalDownlinePV}`);
        console.log('');

        if (totalDownlinePV !== member.team_credits_monthly) {
          console.log('⚠️  MISMATCH DETECTED!');
          console.log('   Team credits does not match sum of downline PV');
          console.log('   This suggests:');
          console.log('   - Manual adjustment was made, OR');
          console.log('   - Credits were set during initialization, OR');
          console.log('   - Bug in GV propagation logic');
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🏁 Investigation Complete\n');

  } catch (error) {
    console.error('\n❌ Investigation failed:', error.message);
  }
}

investigate();
