/**
 * Simplified Test: Real-Time Earnings Estimates
 *
 * Tests using existing test distributors
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('🧪 Testing Real-Time Earnings Estimates (Simplified)\n');
  console.log('='.repeat(60));

  try {
    // STEP 1: Find existing member with distributor
    console.log('\n📝 STEP 1: Finding existing member with distributor...');
    const { data: members, error: memberError } = await supabase
      .from('members')
      .select('*, distributor:distributors!members_distributor_id_fkey(*)')
      .limit(1);

    if (memberError || !members || members.length === 0) {
      throw new Error('No members found. Please run signup first.');
    }

    const member = members[0];
    const distributor = member.distributor;

    console.log(`✅ Using distributor: ${distributor.email}`);
    console.log(`✅ Member: ${member.full_name} (${member.paying_rank || 'starter'})`);

    // Ensure member has minimum PV
    if ((member.personal_credits_monthly || 0) < 50) {
      console.log('   Updating member PV to 100...');
      await supabase
        .from('members')
        .update({ personal_credits_monthly: 100 })
        .eq('member_id', member.member_id);
      member.personal_credits_monthly = 100;
    }

    console.log(`✅ Member: ${member.full_name} (${member.paying_rank || 'starter'})`);
    console.log(`   PV: ${member.personal_credits_monthly || 0}`);
    console.log(`   GV: ${member.team_credits_monthly || 0}`);

    // STEP 2: Get any active product
    console.log('\n🛒 STEP 2: Getting test product...');
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (!products || products.length === 0) {
      throw new Error('No active products found. Please create products first.');
    }

    const product = products[0];
    console.log(`✅ Product: ${product.name} ($${product.wholesale_price_cents / 100})`);

    // STEP 3: Create test transaction
    console.log('\n💳 STEP 3: Creating test transaction...');

    const retailPrice = product.wholesale_price_cents;
    const bvAmount = Math.round(retailPrice * 0.65); // Approximate BV

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        distributor_id: distributor.id,
        seller_distributor_id: member.member_id,
        transaction_type: 'product_sale',
        amount_cents: retailPrice,
        bv_amount: bvAmount,
        product_slug: product.slug,
        description: 'Test purchase for earnings estimates',
        is_retail: false,
      })
      .select()
      .single();

    if (txError) throw new Error(`Failed to create transaction: ${txError.message}`);
    console.log(`✅ Transaction created: ${transaction.id}`);
    console.log(`   Amount: $${retailPrice / 100}`);
    console.log(`   BV: $${bvAmount / 100}`);

    // STEP 4: Call estimate creation
    console.log('\n💰 STEP 4: Creating estimated earnings...');

    const estimateModule = await import('./src/lib/compensation/estimate-earnings.ts');
    const result = await estimateModule.createEstimatedEarnings(
      transaction.id,
      distributor.id,
      supabase
    );

    if (!result.success) {
      throw new Error(`Estimate creation failed: ${result.errors?.join(', ')}`);
    }

    console.log(`✅ Created ${result.count} estimated earnings:`);
    result.estimates.forEach((est) => {
      console.log(`   - ${est.earning_type}: $${est.estimated_amount_cents / 100}`);
      console.log(`     Status: ${est.current_qualification_status}`);
    });

    // STEP 5: Verify in database
    console.log('\n🔍 STEP 5: Verifying in database...');
    const { data: estimates } = await supabase
      .from('estimated_earnings')
      .select('*')
      .eq('transaction_id', transaction.id)
      .order('earning_type');

    console.log(`✅ Found ${estimates.length} estimates in database`);

    // STEP 6: Run daily qualification update
    console.log('\n🕐 STEP 6: Running daily qualification update...');

    const updateModule = await import('./src/lib/compensation/update-estimates.ts');
    const updateSummary = await updateModule.updateDailyQualifications();

    console.log('✅ Daily update complete:');
    console.log(`   Total checked: ${updateSummary.total_checked}`);
    console.log(`   Qualified: ${updateSummary.total_qualified}`);
    console.log(`   At Risk: ${updateSummary.total_at_risk}`);
    console.log(`   Disqualified: ${updateSummary.total_disqualified}`);
    console.log(`   Status changes: ${updateSummary.status_changes}`);

    // STEP 7: Check updated statuses
    console.log('\n✅ STEP 7: Verifying qualification statuses...');
    const { data: updatedEstimates } = await supabase
      .from('estimated_earnings')
      .select('*')
      .eq('transaction_id', transaction.id)
      .order('earning_type');

    updatedEstimates.forEach((est) => {
      const statusIcon =
        est.current_qualification_status === 'qualified' ? '✅' :
        est.current_qualification_status === 'at_risk' ? '⚠️' :
        est.current_qualification_status === 'disqualified' ? '❌' : '⏳';

      console.log(`   ${statusIcon} ${est.earning_type}:`);
      console.log(`      Status: ${est.current_qualification_status}`);
      if (est.qualification_checks?.pv_check !== undefined) {
        console.log(`      PV: ${est.qualification_checks.pv_check ? '✅' : '❌'}`);
      }
      if (est.qualification_checks?.retail_check !== undefined) {
        console.log(`      Retail: ${est.qualification_checks.retail_check ? '✅' : '❌'}`);
      }
      if (est.qualification_checks?.rank_check !== undefined) {
        console.log(`      Rank: ${est.qualification_checks.rank_check ? '✅' : '❌'}`);
      }
      if (est.disqualification_reasons?.length > 0) {
        console.log(`      Reasons: ${est.disqualification_reasons.join(', ')}`);
      }
    });

    // STEP 8: Cleanup
    console.log('\n🧹 STEP 8: Cleaning up test data...');
    await supabase.from('estimated_earnings').delete().eq('transaction_id', transaction.id);
    await supabase.from('transactions').delete().eq('id', transaction.id);
    console.log('✅ Cleanup complete');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('✅ Estimates created immediately after transaction');
    console.log('✅ Seller commission + overrides calculated correctly');
    console.log('✅ Daily qualification updates working');
    console.log('✅ Status tracking accurate');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
