/**
 * Real-Time Earnings Estimation Service
 *
 * Creates estimated earnings immediately after a transaction is processed.
 * Estimates are shown to users in "pending qualification" status until
 * validated at month end.
 *
 * Flow:
 * 1. Transaction completed → GV propagated
 * 2. createEstimatedEarnings() called
 * 3. Calculate what commissions WOULD be earned if month ended today
 * 4. Create records in estimated_earnings table
 * 5. Daily cron updates qualification status
 * 6. Month end validates and moves to earnings_ledger
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateEstimatedEarningInput,
  EstimationResult,
  EstimatedEarning,
  EarningType,
} from './types/estimated-earnings';
import { RANKED_OVERRIDE_SCHEDULES, WATERFALL_CONFIG, OVERRIDE_QUALIFICATION_MIN_CREDITS } from './config';

const SELLER_COMMISSION_PCT = WATERFALL_CONFIG.SELLER_COMMISSION_PCT;

/**
 * Create estimated earnings for a transaction
 *
 * Called immediately after GV propagation in the Stripe webhook.
 * Calculates what commissions would be paid if the month ended right now.
 *
 * @param transactionId - ID of the transaction that triggered this
 * @param distributorId - ID of the distributor who made the sale
 * @param supabase - Supabase client (with service role for RLS bypass)
 */
export async function createEstimatedEarnings(
  transactionId: string,
  distributorId: string,
  supabase: SupabaseClient
): Promise<EstimationResult> {
  const estimates: EstimatedEarning[] = [];
  const errors: string[] = [];

  try {
    console.log(`💰 Creating estimated earnings for transaction ${transactionId}...`);

    // 1. Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) {
      throw new Error(`Failed to fetch transaction: ${txError?.message}`);
    }

    // 2. Get seller's member record with current PV/GV
    const { data: sellerMember, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('distributor_id', distributorId)
      .single();

    if (memberError || !sellerMember) {
      throw new Error(`Failed to fetch seller member: ${memberError?.message}`);
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    // Calculate BV from product (since bv_amount doesn't exist in transactions table)
    let bvAmount = 0;

    if (transaction.product_slug) {
      const { data: product } = await supabase
        .from('products')
        .select('wholesale_price_cents')
        .eq('slug', transaction.product_slug)
        .single();

      if (product) {
        // Calculate BV using waterfall formula
        const retailPrice = product.wholesale_price_cents;
        const botmakersFee = Math.round(retailPrice * WATERFALL_CONFIG.BOTMAKERS_FEE_PCT);
        const afterBotmakers = retailPrice - botmakersFee;
        const apexTake = Math.round(afterBotmakers * WATERFALL_CONFIG.APEX_TAKE_PCT);
        const afterApex = afterBotmakers - apexTake;
        const leadershipPool = Math.round(afterApex * WATERFALL_CONFIG.LEADERSHIP_POOL_PCT);
        const afterLeadership = afterApex - leadershipPool;
        const bonusPool = Math.round(afterLeadership * WATERFALL_CONFIG.BONUS_POOL_PCT);
        bvAmount = afterLeadership - bonusPool;
      }
    }

    // 3. Calculate seller's retail percentage
    const retailPct = await calculateRetailPercentage(
      sellerMember.member_id,
      currentMonth,
      supabase
    );

    // 4. Create seller commission estimate (always earned, regardless of retail %)
    const sellerCommissionCents = Math.round(bvAmount * SELLER_COMMISSION_PCT);

    const sellerEstimate = await createSingleEstimate(
      {
        transaction_id: transactionId,
        member_id: sellerMember.member_id,
        run_month: currentMonth,
        earning_type: 'seller_commission',
        estimated_amount_cents: sellerCommissionCents,
        snapshot_member_pv: sellerMember.personal_credits_monthly || 0,
        snapshot_member_gv: sellerMember.team_credits_monthly || 0,
        snapshot_member_rank: sellerMember.paying_rank || 'starter',
        snapshot_retail_pct: retailPct,
      },
      supabase
    );

    if (sellerEstimate) estimates.push(sellerEstimate);

    // 5. Calculate override estimates (L1-L5)
    const overrideEstimates = await createOverrideEstimates(
      transactionId,
      distributorId,
      bvAmount,
      currentMonth,
      supabase
    );

    estimates.push(...overrideEstimates);

    // 6. Check for rank bonus eligibility
    // (Rank bonuses are typically paid once when rank is achieved, not per transaction)
    // We'll handle this in the monthly run, not here

    console.log(`✅ Created ${estimates.length} estimated earnings`);

    return {
      success: true,
      count: estimates.length,
      estimates,
    };
  } catch (error) {
    console.error('❌ Error creating estimated earnings:', error);
    errors.push(error instanceof Error ? error.message : String(error));

    return {
      success: false,
      count: 0,
      estimates: [],
      errors,
    };
  }
}

/**
 * Create override estimates (L1-L5)
 *
 * L1 = Enrollment sponsor (distributors.sponsor_id)
 * L2-L5 = Matrix parents (distributors.matrix_parent_id)
 */
async function createOverrideEstimates(
  transactionId: string,
  sellerId: string,
  bvAmount: number,
  runMonth: string,
  supabase: SupabaseClient
): Promise<EstimatedEarning[]> {
  const estimates: EstimatedEarning[] = [];

  try {
    // Get seller's distributor record
    const { data: seller, error: sellerError } = await supabase
      .from('distributors')
      .select('sponsor_id, matrix_parent_id')
      .eq('id', sellerId)
      .single();

    if (sellerError || !seller) {
      console.error('Failed to fetch seller for overrides:', sellerError);
      return [];
    }

    // L1 Override - Enrollment Sponsor (30% of override pool)
    if (seller.sponsor_id) {
      const l1Estimate = await createLevelOverrideEstimate(
        transactionId,
        seller.sponsor_id,
        bvAmount,
        1,
        runMonth,
        supabase
      );
      if (l1Estimate) estimates.push(l1Estimate);
    }

    // L2-L5 Overrides - Matrix Tree
    let currentMatrixParentId = seller.matrix_parent_id;
    for (let level = 2; level <= 5; level++) {
      if (!currentMatrixParentId) break;

      const levelEstimate = await createLevelOverrideEstimate(
        transactionId,
        currentMatrixParentId,
        bvAmount,
        level,
        runMonth,
        supabase
      );

      if (levelEstimate) estimates.push(levelEstimate);

      // Move up the matrix tree
      const { data: parent } = await supabase
        .from('distributors')
        .select('matrix_parent_id')
        .eq('id', currentMatrixParentId)
        .single();

      currentMatrixParentId = parent?.matrix_parent_id || null;
    }

    return estimates;
  } catch (error) {
    console.error('Error creating override estimates:', error);
    return [];
  }
}

/**
 * Create estimate for a single override level
 */
async function createLevelOverrideEstimate(
  transactionId: string,
  distributorId: string,
  bvAmount: number,
  level: number,
  runMonth: string,
  supabase: SupabaseClient
): Promise<EstimatedEarning | null> {
  try {
    // Get member record with current PV/GV/rank
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*, distributor:distributors!members_distributor_id_fkey(*)')
      .eq('distributor_id', distributorId)
      .single();

    if (memberError || !member) {
      console.error(`Failed to fetch member for L${level} override:`, memberError);
      return null;
    }

    const rank = member.paying_rank || 'starter';
    const overrideSchedule = RANKED_OVERRIDE_SCHEDULES[rank as keyof typeof RANKED_OVERRIDE_SCHEDULES];

    if (!overrideSchedule) {
      console.log(`No override schedule for rank: ${rank}`);
      return null;
    }

    // Get override percentage for this level (array is 0-indexed, so level 1 = index 0)
    const overridePct = overrideSchedule[level - 1] || 0;

    if (overridePct === 0) {
      // Rank doesn't qualify for this level
      return null;
    }

    // Calculate estimated amount
    // overridePct is already a decimal (e.g., 0.25 for 25%), so multiply directly
    const estimatedAmountCents = Math.round(bvAmount * overridePct);

    if (estimatedAmountCents === 0) {
      return null;
    }

    // Calculate retail percentage
    const retailPct = await calculateRetailPercentage(member.member_id, runMonth, supabase);

    // Create the estimate
    return await createSingleEstimate(
      {
        transaction_id: transactionId,
        member_id: member.member_id,
        run_month: runMonth,
        earning_type: `override_l${level}` as EarningType,
        override_level: level,
        estimated_amount_cents: estimatedAmountCents,
        snapshot_member_pv: member.personal_credits_monthly || 0,
        snapshot_member_gv: member.team_credits_monthly || 0,
        snapshot_member_rank: rank,
        snapshot_retail_pct: retailPct,
      },
      supabase
    );
  } catch (error) {
    console.error(`Error creating L${level} override estimate:`, error);
    return null;
  }
}

/**
 * Create a single estimated earning record
 */
async function createSingleEstimate(
  input: CreateEstimatedEarningInput,
  supabase: SupabaseClient
): Promise<EstimatedEarning | null> {
  try {
    const { data, error } = await supabase
      .from('estimated_earnings')
      .insert({
        transaction_id: input.transaction_id,
        member_id: input.member_id,
        run_month: input.run_month,
        earning_type: input.earning_type,
        override_level: input.override_level || null,
        estimated_amount_cents: input.estimated_amount_cents,
        snapshot_member_pv: input.snapshot_member_pv,
        snapshot_member_gv: input.snapshot_member_gv,
        snapshot_member_rank: input.snapshot_member_rank,
        snapshot_retail_pct: input.snapshot_retail_pct || null,
        current_qualification_status: 'pending',
        qualification_checks: {},
        disqualification_reasons: [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting estimate:', error);
      return null;
    }

    return data as EstimatedEarning;
  } catch (error) {
    console.error('Error creating single estimate:', error);
    return null;
  }
}

/**
 * Calculate retail percentage for a member
 *
 * Retail % = (PV from retail customers / Total PV) * 100
 *
 * A retail customer is someone who purchased but is NOT a distributor.
 * This is tracked via the is_retail flag on transactions.
 */
async function calculateRetailPercentage(
  memberId: string,
  month: string,
  supabase: SupabaseClient
): Promise<number> {
  try {
    // Get all transactions for this member this month
    const startDate = `${month}-01`;
    const endDate = new Date(month + '-01');
    endDate.setMonth(endDate.getMonth() + 1);
    const endDateStr = endDate.toISOString().slice(0, 10);

    // Get member's distributor_id
    const { data: member } = await supabase
      .from('members')
      .select('distributor_id')
      .eq('member_id', memberId)
      .single();

    if (!member) return 0;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('product_slug, metadata')
      .eq('distributor_id', member.distributor_id)
      .gte('created_at', startDate)
      .lt('created_at', endDateStr);

    if (error || !transactions || transactions.length === 0) {
      return 0;
    }

    // Calculate BV for each transaction
    let totalBV = 0;
    let retailBV = 0;

    for (const tx of transactions) {
      let bv = 0;

      // Calculate BV from product
      if (tx.product_slug) {
        const { data: product } = await supabase
          .from('products')
          .select('wholesale_price_cents')
          .eq('slug', tx.product_slug)
          .single();

        if (product) {
          const retailPrice = product.wholesale_price_cents;
          const botmakersFee = Math.round(retailPrice * WATERFALL_CONFIG.BOTMAKERS_FEE_PCT);
          const afterBotmakers = retailPrice - botmakersFee;
          const apexTake = Math.round(afterBotmakers * WATERFALL_CONFIG.APEX_TAKE_PCT);
          const afterApex = afterBotmakers - apexTake;
          const leadershipPool = Math.round(afterApex * WATERFALL_CONFIG.LEADERSHIP_POOL_PCT);
          const afterLeadership = afterApex - leadershipPool;
          const bonusPool = Math.round(afterLeadership * WATERFALL_CONFIG.BONUS_POOL_PCT);
          bv = afterLeadership - bonusPool;
        }
      }

      totalBV += bv;

      // Check if retail transaction (stored in metadata)
      const isRetail = tx.metadata?.is_retail === true;
      if (isRetail) {
        retailBV += bv;
      }
    }

    if (totalBV === 0) return 0;

    return Math.round((retailBV / totalBV) * 100 * 100) / 100; // Round to 2 decimals
  } catch (error) {
    console.error('Error calculating retail percentage:', error);
    return 0;
  }
}
