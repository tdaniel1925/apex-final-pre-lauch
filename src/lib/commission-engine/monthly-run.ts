/**
 * MONTHLY COMMISSION RUN ENGINE
 *
 * Executes the complete monthly commission calculation for all distributors.
 * This is the CORE of the MLM compensation system.
 *
 * CRITICAL SPECS:
 * - Source: APEX_COMP_ENGINE_SPEC_7_LEVEL.md
 * - L1 Override: Uses ENROLLMENT TREE (sponsor_id) - Always 25%
 * - L2-L7 Overrides: Use MATRIX TREE (matrix_parent_id) - Varies by rank
 * - 50 QV Minimum: Must have 50+ personal QV to earn overrides
 * - Breakage: 100% to Apex (unpaid override pool)
 *
 * @module lib/commission-engine/monthly-run
 */

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { calculateWaterfall } from '@/lib/compensation/waterfall';
import { calculateOverridesForSale, CompensationMember, Sale } from '@/lib/compensation/override-calculator';
import { WATERFALL_CONFIG, BUSINESS_CENTER_CONFIG, RANKED_OVERRIDE_SCHEDULES, type TechRank } from '@/lib/compensation/config';
import { checkOverrideQualificationWithRetail } from '@/lib/compliance/retail-validation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// =============================================
// TYPES
// =============================================

export interface MonthlyCommissionRunParams {
  month: string; // Format: 'YYYY-MM'
  dryRun?: boolean; // If true, don't insert into database
  supabaseClient?: SupabaseClient; // Optional: Pass client for non-Next.js contexts
}

export interface CommissionRunResult {
  run_id: string;
  month: string;
  transactions_processed: number;
  total_sales_amount: number;
  total_bv_amount: number;
  total_seller_commissions: number;
  total_override_commissions: number;
  total_rank_bonuses: number;
  total_bonus_pool: number;
  total_leadership_pool: number;
  breakage_amount: number;
  distributors_paid: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface CommissionLedgerEntry {
  run_id: string;
  run_date: Date;
  pay_period_start: Date;
  pay_period_end: Date;
  member_id: string;
  member_name: string;
  earning_type: string;
  source_member_id?: string;
  source_member_name?: string;
  source_order_id?: string;
  source_product_name?: string;
  override_level?: number;
  override_percentage?: number;
  member_tech_rank?: string;
  member_insurance_rank?: string;
  base_amount_cents: number;
  adjustment_cents: number;
  final_amount_cents: number;
  status: 'pending' | 'approved' | 'paid' | 'held' | 'reversed' | 'disputed';
  notes?: string;
}

// =============================================
// MAIN COMMISSION RUN FUNCTION
// =============================================

/**
 * Execute the monthly commission run for a specific month
 *
 * @param params - Commission run parameters
 * @returns Commission run result with totals
 */
export async function executeMonthlyCommissionRun(
  params: MonthlyCommissionRunParams
): Promise<CommissionRunResult> {
  const { month, dryRun = false, supabaseClient } = params;
  const supabase = supabaseClient || (await createClient());

  // Parse month
  const [year, monthNum] = month.split('-').map(Number);
  const periodStart = new Date(year, monthNum - 1, 1);
  const periodEnd = new Date(year, monthNum, 0, 23, 59, 59, 999);

  console.log(`\n🚀 Starting Commission Run for ${month}`);
  console.log(`   Period: ${periodStart.toISOString()} to ${periodEnd.toISOString()}`);
  console.log(`   Dry Run: ${dryRun ? 'YES (no database writes)' : 'NO (will write to database)'}\n`);

  let runId: string | undefined;

  try {
    // =============================================
    // STEP 1: Create Commission Run Record
    // =============================================

    if (!dryRun) {
      const { data: existingRun } = await supabase
        .from('earnings_ledger')
        .select('run_id')
        .eq('run_date', periodEnd)
        .limit(1)
        .single();

      if (existingRun) {
        throw new Error(`Commission run for ${month} already exists (run_id: ${existingRun.run_id})`);
      }

      // Generate a unique run_id for this commission run (UUID)
      runId = randomUUID();
    } else {
      runId = randomUUID(); // Use UUID for dry runs too
    }

    console.log(`   Run ID: ${runId}\n`);

    // =============================================
    // STEP 2: Get All Product Sales for the Month
    // =============================================

    console.log('📊 STEP 2: Fetching product sales...');

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        id,
        distributor_id,
        amount,
        product_slug,
        created_at,
        distributor:distributors!transactions_distributor_id_fkey (
          id,
          first_name,
          last_name,
          sponsor_id,
          matrix_parent_id,
          member:members!members_distributor_id_fkey (
            member_id,
            full_name,
            tech_rank,
            paying_rank,
            insurance_rank,
            personal_credits_monthly,
            override_qualified
          )
        )
      `)
      .eq('transaction_type', 'product_sale')
      .eq('status', 'completed')
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())
      .order('created_at', { ascending: true });

    if (transactionsError) {
      throw new Error(`Failed to fetch transactions: ${transactionsError.message}`);
    }

    console.log(`   ✓ Found ${transactions?.length || 0} product sales\n`);

    if (!transactions || transactions.length === 0) {
      console.log('   ℹ️  No transactions to process');
      return {
        run_id: runId,
        month,
        transactions_processed: 0,
        total_sales_amount: 0,
        total_bv_amount: 0,
        total_seller_commissions: 0,
        total_override_commissions: 0,
        total_rank_bonuses: 0,
        total_bonus_pool: 0,
        total_leadership_pool: 0,
        breakage_amount: 0,
        distributors_paid: 0,
        status: 'completed',
      };
    }

    // =============================================
    // STEP 3: Calculate Commissions for Each Transaction
    // =============================================

    console.log('💰 STEP 3: Calculating commissions...');

    const ledgerEntries: CommissionLedgerEntry[] = [];
    let totalSalesAmount = 0;
    let totalBVAmount = 0;
    let totalSellerCommissions = 0;
    let totalOverrideCommissions = 0;
    let totalBreakage = 0;
    let totalBonusPool = 0;
    let totalLeadershipPool = 0;

    for (const transaction of transactions) {
      console.log(`   Processing transaction ${transaction.id} ($${transaction.amount})...`);

      const distributor: any = transaction.distributor;
      if (!distributor || !distributor.member) {
        console.log(`     ⚠️  Skipping - no distributor/member data`);
        continue;
      }

      const member = Array.isArray(distributor.member) ? distributor.member[0] : distributor.member;
      if (!member) {
        console.log(`     ⚠️  Skipping - no member record`);
        continue;
      }

      const amountCents = Math.round(transaction.amount * 100);
      totalSalesAmount += transaction.amount;

      // Determine product type
      const isBusinessCenter = transaction.product_slug === 'business-center';
      const productType = isBusinessCenter ? 'business_center' : 'standard';

      // Calculate waterfall (BV calculation)
      const waterfall = calculateWaterfall(amountCents, productType);
      const bvCents = waterfall.commissionPoolCents;
      const bvAmount = bvCents / 100;

      totalBVAmount += bvAmount;
      totalBonusPool += waterfall.bonusPoolCents / 100;
      totalLeadershipPool += waterfall.leadershipPoolCents / 100;

      console.log(`     BV: $${bvAmount.toFixed(2)}`);

      // =============================================
      // 3A: SELLER COMMISSION (60% of BV)
      // =============================================

      const sellerCommissionCents = waterfall.sellerCommissionCents;
      const sellerCommissionAmount = sellerCommissionCents / 100;
      totalSellerCommissions += sellerCommissionAmount;

      ledgerEntries.push({
        run_id: runId,
        run_date: periodEnd,
        pay_period_start: periodStart,
        pay_period_end: periodEnd,
        member_id: member.member_id,
        member_name: member.full_name,
        earning_type: 'seller_commission',
        source_order_id: transaction.id,
        source_product_name: transaction.product_slug || 'unknown',
        member_tech_rank: member.tech_rank,
        member_insurance_rank: member.insurance_rank,
        base_amount_cents: sellerCommissionCents,
        adjustment_cents: 0,
        final_amount_cents: sellerCommissionCents,
        status: 'pending',
        notes: `Seller commission for ${transaction.product_slug} sale`,
      });

      console.log(`     Seller Commission: $${sellerCommissionAmount.toFixed(2)}`);

      // =============================================
      // 3B: OVERRIDE COMMISSIONS (L1-L7)
      // =============================================

      // Build CompensationMember object for seller
      const sellerMember: CompensationMember = {
        distributor_id: distributor.id,
        sponsor_id: distributor.sponsor_id,
        matrix_parent_id: distributor.matrix_parent_id,
        matrix_depth: 0, // Not needed for this calculation
        member_id: member.member_id,
        full_name: member.full_name,
        email: '', // Not needed
        tech_rank: member.tech_rank as TechRank,
        paying_rank: member.paying_rank as TechRank,
        personal_qv_monthly: member.personal_credits_monthly || 0,
        override_qualified: member.override_qualified || false,
      };

      // Build Sale object
      const sale: Sale = {
        sale_id: transaction.id,
        seller_member_id: member.member_id,
        product_name: transaction.product_slug || 'unknown',
        price_paid: transaction.amount,
        bv: bvAmount,
      };

      // Calculate overrides (pass supabase client for non-Next.js contexts)
      const overrideResult = await calculateOverridesForSale(sale, sellerMember, supabase);

      console.log(`     Override Pool: $${(bvAmount * 0.40).toFixed(2)}`);
      console.log(`     Overrides Paid: $${overrideResult.total_paid.toFixed(2)}`);
      console.log(`     Breakage: $${overrideResult.unpaid_amount.toFixed(2)}`);

      totalOverrideCommissions += overrideResult.total_paid;
      totalBreakage += overrideResult.unpaid_amount;

      // Add override payments to ledger
      for (const payment of overrideResult.payments) {
        const overrideCents = Math.round(payment.override_amount * 100);

        ledgerEntries.push({
          run_id: runId,
          run_date: periodEnd,
          pay_period_start: periodStart,
          pay_period_end: periodEnd,
          member_id: payment.upline_member_id,
          member_name: payment.upline_member_name,
          earning_type: 'override',
          source_member_id: member.member_id,
          source_member_name: member.full_name,
          source_order_id: transaction.id,
          source_product_name: transaction.product_slug || 'unknown',
          override_level: parseInt(payment.override_type.match(/\d+/)?.[0] || '0'),
          override_percentage: payment.override_rate,
          base_amount_cents: overrideCents,
          adjustment_cents: 0,
          final_amount_cents: overrideCents,
          status: 'pending',
          notes: `${payment.override_type} override from ${member.full_name}`,
        });
      }
    }

    // =============================================
    // STEP 4: Calculate Rank Advancement Bonuses
    // =============================================

    console.log('\n🏆 STEP 4: Checking rank advancement bonuses...');

    const { data: rankAdvancements, error: rankError } = await supabase
      .from('rank_history')
      .select(`
        id,
        distributor_id,
        to_rank,
        achieved_at,
        distributor:distributors!rank_history_distributor_id_fkey (
          member:members!members_distributor_id_fkey (
            member_id,
            full_name,
            tech_rank,
            insurance_rank
          )
        )
      `)
      .gte('achieved_at', periodStart.toISOString())
      .lte('achieved_at', periodEnd.toISOString());

    if (!rankError && rankAdvancements && rankAdvancements.length > 0) {
      console.log(`   ✓ Found ${rankAdvancements.length} rank advancements`);

      // TODO: Add rank bonus calculation based on RANKED_OVERRIDE_SCHEDULES
      // For now, we'll skip rank bonuses
    } else {
      console.log(`   ℹ️  No rank advancements this month`);
    }

    // =============================================
    // STEP 5: Calculate Bonus Pool Distribution
    // =============================================

    console.log('\n🎁 STEP 5: Calculating bonus pool distribution...');
    console.log(`   Total Bonus Pool: $${totalBonusPool.toFixed(2)}`);

    // Bonus pool distributed equally among members who earned rank bonuses
    // For now, we'll skip bonus pool distribution
    // TODO: Implement bonus pool distribution

    // =============================================
    // STEP 6: Calculate Leadership Pool Distribution
    // =============================================

    console.log('\n👑 STEP 6: Calculating leadership pool distribution...');
    console.log(`   Total Leadership Pool: $${totalLeadershipPool.toFixed(2)}`);

    // Leadership pool distributed among Diamond Ambassador members
    // For now, we'll skip leadership pool distribution
    // TODO: Implement leadership pool distribution

    // =============================================
    // STEP 7: Insert Commissions into Database
    // =============================================

    console.log('\n💾 STEP 7: Inserting commissions into database...');

    if (!dryRun) {
      console.log(`   Inserting ${ledgerEntries.length} ledger entries...`);

      const { error: insertError } = await supabase
        .from('earnings_ledger')
        .insert(ledgerEntries);

      if (insertError) {
        throw new Error(`Failed to insert earnings: ${insertError.message}`);
      }

      console.log(`   ✓ Successfully inserted ${ledgerEntries.length} ledger entries`);
    } else {
      console.log(`   ℹ️  DRY RUN - Skipping database insert (would insert ${ledgerEntries.length} entries)`);
    }

    // =============================================
    // STEP 8: Return Summary
    // =============================================

    const distributorsPaid = new Set(ledgerEntries.map(e => e.member_id)).size;

    const result: CommissionRunResult = {
      run_id: runId,
      month,
      transactions_processed: transactions.length,
      total_sales_amount: Number(totalSalesAmount.toFixed(2)),
      total_bv_amount: Number(totalBVAmount.toFixed(2)),
      total_seller_commissions: Number(totalSellerCommissions.toFixed(2)),
      total_override_commissions: Number(totalOverrideCommissions.toFixed(2)),
      total_rank_bonuses: 0, // TODO: Implement
      total_bonus_pool: Number(totalBonusPool.toFixed(2)),
      total_leadership_pool: Number(totalLeadershipPool.toFixed(2)),
      breakage_amount: Number(totalBreakage.toFixed(2)),
      distributors_paid: distributorsPaid,
      status: 'completed',
    };

    console.log('\n✅ COMMISSION RUN COMPLETE');
    console.log('========================================');
    console.log(`   Run ID: ${result.run_id}`);
    console.log(`   Transactions: ${result.transactions_processed}`);
    console.log(`   Total Sales: $${result.total_sales_amount.toFixed(2)}`);
    console.log(`   Total BV: $${result.total_bv_amount.toFixed(2)}`);
    console.log(`   Seller Commissions: $${result.total_seller_commissions.toFixed(2)}`);
    console.log(`   Override Commissions: $${result.total_override_commissions.toFixed(2)}`);
    console.log(`   Breakage (to Apex): $${result.breakage_amount.toFixed(2)}`);
    console.log(`   Bonus Pool: $${result.total_bonus_pool.toFixed(2)}`);
    console.log(`   Leadership Pool: $${result.total_leadership_pool.toFixed(2)}`);
    console.log(`   Distributors Paid: ${result.distributors_paid}`);
    console.log('========================================\n');

    return result;

  } catch (error) {
    console.error('\n❌ COMMISSION RUN FAILED');
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}\n`);

    return {
      run_id: runId || 'failed-run',
      month,
      transactions_processed: 0,
      total_sales_amount: 0,
      total_bv_amount: 0,
      total_seller_commissions: 0,
      total_override_commissions: 0,
      total_rank_bonuses: 0,
      total_bonus_pool: 0,
      total_leadership_pool: 0,
      breakage_amount: 0,
      distributors_paid: 0,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Get previous month in YYYY-MM format
 *
 * @returns Previous month string
 */
export function getPreviousMonth(): string {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = previousMonth.getFullYear();
  const month = String(previousMonth.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get next month in YYYY-MM format
 *
 * @param month - Current month in YYYY-MM format
 * @returns Next month string
 */
export function getNextMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const nextMonth = new Date(year, monthNum, 1);
  const nextYear = nextMonth.getFullYear();
  const nextMonthNum = String(nextMonth.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonthNum}`;
}
