/**
 * Cleanup: Delete Phil Resch's Invalid Transactions
 * These are test transactions with no payment_intent_id
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  console.log('\n🧹 CLEANING UP INVALID TRANSACTIONS\n');
  console.log('='.repeat(70));

  try {
    // 1. Find Phil Resch
    console.log('\n📋 STEP 1: Finding Phil Resch...\n');

    const { data: distributor } = await supabase
      .from('distributors')
      .select('id, first_name, last_name')
      .eq('slug', 'phil-resch')
      .single();

    if (!distributor) {
      console.log('❌ Phil Resch not found');
      return;
    }

    console.log(`✅ Found: ${distributor.first_name} ${distributor.last_name}`);
    console.log(`   Distributor ID: ${distributor.id}\n`);

    // 2. Get current state
    console.log('📊 STEP 2: Current state...\n');

    const { data: member } = await supabase
      .from('members')
      .select('member_id, personal_credits_monthly, team_credits_monthly')
      .eq('distributor_id', distributor.id)
      .single();

    if (member) {
      console.log(`   Current PV: ${member.personal_credits_monthly}`);
      console.log(`   Current GV: ${member.team_credits_monthly}\n`);
    }

    // 3. Get transactions to delete
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id, created_at, amount, product_slug, metadata')
      .eq('distributor_id', distributor.id);

    console.log(`📋 STEP 3: Found ${transactions?.length || 0} transaction(s) to delete:\n`);

    if (transactions && transactions.length > 0) {
      transactions.forEach((tx, i) => {
        const hasPaymentIntent = tx.metadata?.payment_intent_id || false;
        console.log(`   ${i + 1}. ${new Date(tx.created_at).toLocaleString()}`);
        console.log(`      Amount: $${tx.amount}, Product: ${tx.product_slug}`);
        console.log(`      Payment Intent: ${hasPaymentIntent ? '✅ YES' : '❌ NO (INVALID)'}`);
      });
      console.log('');
    }

    // 4. Delete transactions
    console.log('🗑️  STEP 4: Deleting transactions...\n');

    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('distributor_id', distributor.id);

    if (deleteError) {
      console.error('❌ Error deleting transactions:', deleteError);
      return;
    }

    console.log(`✅ Deleted ${transactions?.length || 0} transaction(s)\n`);

    // 5. Reset PV to 0
    console.log('🔄 STEP 5: Resetting PV to 0...\n');

    const { error: pvError } = await supabase
      .from('members')
      .update({ personal_credits_monthly: 0 })
      .eq('member_id', member.member_id);

    if (pvError) {
      console.error('❌ Error resetting PV:', pvError);
      return;
    }

    console.log('✅ PV reset to 0\n');

    // 6. Reset Apex Vision's GV
    console.log('🔄 STEP 6: Resetting Apex Vision GV...\n');

    const { data: apexVision } = await supabase
      .from('distributors')
      .select('id')
      .eq('slug', 'apex-vision')
      .single();

    if (apexVision) {
      const { data: apexMember } = await supabase
        .from('members')
        .select('member_id, team_credits_monthly')
        .eq('distributor_id', apexVision.id)
        .single();

      if (apexMember) {
        console.log(`   Current Apex Vision GV: ${apexMember.team_credits_monthly}`);

        const { error: gvError } = await supabase
          .from('members')
          .update({ team_credits_monthly: 0 })
          .eq('member_id', apexMember.member_id);

        if (gvError) {
          console.error('❌ Error resetting GV:', gvError);
        } else {
          console.log('   ✅ Apex Vision GV reset to 0\n');
        }
      }
    }

    // 7. Verify cleanup
    console.log('✅ STEP 7: Verifying cleanup...\n');

    const { data: verifyTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('distributor_id', distributor.id);

    const { data: verifyMember } = await supabase
      .from('members')
      .select('personal_credits_monthly, team_credits_monthly')
      .eq('distributor_id', distributor.id)
      .single();

    console.log(`   Phil Resch transactions: ${verifyTx?.length || 0}`);
    console.log(`   Phil Resch PV: ${verifyMember?.personal_credits_monthly || 0}`);
    console.log(`   Phil Resch GV: ${verifyMember?.team_credits_monthly || 0}\n`);

    const { data: verifyApex } = await supabase
      .from('members')
      .select('team_credits_monthly')
      .eq('distributor_id', apexVision.id)
      .single();

    console.log(`   Apex Vision GV: ${verifyApex?.team_credits_monthly || 0}\n`);

    console.log('='.repeat(70));
    console.log('🎉 CLEANUP COMPLETE!\n');
    console.log('✅ All invalid transactions deleted');
    console.log('✅ PV reset to 0');
    console.log('✅ GV reset to 0');
    console.log('\n🚀 Ready for real sales with auto-PV calculation!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
  }
}

cleanup();
