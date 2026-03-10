// Apex Affinity Group - Commission Run Pipeline
// Source: 02_commission_examples.md (12-step sequence), 03_rep_policies.md

import type {
  Rep,
  Subscription,
  CABRecord,
  CommissionRun,
  CommissionLineItem,
  BVSnapshot,
  RankSnapshot,
  Rank
} from './types';
import { calculateWaterfall, calculateBizCenterSplit } from './waterfall';
import { resolveAllOverrides } from './compression';
import { COMP_PLAN_CONFIG, round2 } from './config';

/**
 * 12-STEP COMMISSION RUN SEQUENCE
 * (from 02_commission_examples.md)
 *
 * Executes on 3rd business day of following month
 *
 * 1. Create commission_run record (status = PROCESSING)
 * 2. Pull BV snapshots for all active reps
 * 3. Pull rank snapshots for prior month
 * 4. For each active subscription (status = ACTIVE):
 *    a. Calculate waterfall (or BizCenter flat split)
 *    b. Create SELLER line item
 *    c. Resolve override chain with compression
 *    d. Create OVERRIDE_L1 through OVERRIDE_L7 line items
 * 5. For each CAB record (state = PENDING, release_eligible_date <= today):
 *    a. Check if subscription still ACTIVE
 *    b. Transition CAB to EARNED
 *    c. Create CAB_EARNED line item
 * 6. For each CAB record (state = CLAWBACK):
 *    a. Create CAB_CLAWBACK line item (negative amount)
 * 7. Calculate bonuses:
 *    a. Volume Kicker
 *    b. Personal Volume Bonus (PVB)
 *    c. Team Volume Bonus (TVB)
 *    d. Retention Bonus
 *    e. Matching Bonus
 *    f. Check Match
 *    g. Gold Rush Bonus (GRS)
 *    h. Gold Accelerator (one-time)
 *    i. Infinity Bonus
 *    j. Car Allowance
 * 8. Aggregate line items per rep
 * 9. Apply clawback carry-forward balance
 * 10. Check $25 minimum payout threshold
 * 11. Update commission_run aggregates
 * 12. Lock run (status = LOCKED)
 */

export interface CommissionRunContext {
  month: number;
  year: number;
  runId: string;
  priorMonth: number;
  priorYear: number;
}

export interface CommissionRunResult {
  runId: string;
  totalReps: number;
  totalPayout: number;
  totalSellerCommissions: number;
  totalOverrides: number;
  totalCABReleased: number;
  totalCABClawbacks: number;
  totalBonuses: number;
  totalCarryForwards: number;
  totalBotMakers: number;
  totalApex: number;
  totalBonusPoolContributions: number;
  lineItemsCreated: number;
}

/**
 * Execute monthly commission run
 *
 * CRITICAL: This function must be idempotent - if run fails mid-process,
 * it should be safe to re-run without duplicating payments
 *
 * @param month - Month to process (1-12)
 * @param year - Year
 * @param db - Database connection (Supabase client)
 * @returns Commission run result
 */
export async function executeCommissionRun(
  month: number,
  year: number,
  db: any  // Replace with proper Supabase client type
): Promise<CommissionRunResult> {
  // ===== STEP 1: Create commission run record =====
  const context = await createCommissionRun(month, year, db);

  try {
    // ===== STEP 2: Pull BV snapshots =====
    const bvSnapshots = await db
      .from('bv_snapshots')
      .select('*')
      .eq('month', month)
      .eq('year', year);

    if (!bvSnapshots.data || bvSnapshots.data.length === 0) {
      throw new Error(`No BV snapshots found for ${year}-${month}. Run BV snapshot job first.`);
    }

    // ===== STEP 3: Pull rank snapshots for PRIOR month =====
    const rankSnapshots = await db
      .from('rank_snapshots')
      .select('*')
      .eq('month', context.priorMonth)
      .eq('year', context.priorYear);

    const rankSnapshotMap = new Map<string, Rank>(
      rankSnapshots.data?.map((snap: RankSnapshot) => [snap.rep_id, snap.rank]) || []
    );

    // Helper function to get prior month rank
    const getPriorMonthRank = async (repId: string): Promise<Rank | null> => {
      return rankSnapshotMap.get(repId) || null;
    };

    // ===== STEP 4: Process all active subscriptions =====
    const subscriptions = await db
      .from('subscriptions')
      .select('*')
      .eq('status', 'ACTIVE');

    const lineItems: CommissionLineItem[] = [];
    let totalBotMakers = 0;
    let totalApex = 0;
    let totalBonusPool = 0;

    for (const subscription of subscriptions.data || []) {
      const seller = await db
        .from('reps')
        .select('*')
        .eq('rep_id', subscription.rep_id)
        .maybeSingle();

      if (!seller.data) continue;

      // Calculate commission (waterfall or BizCenter)
      if (subscription.product_id === 'BIZCENTER') {
        const split = calculateBizCenterSplit();

        // Seller commission
        lineItems.push({
          line_item_id: crypto.randomUUID(),
          run_id: context.runId,
          rep_id: seller.data.rep_id,
          line_type: 'SELLER_BIZ',
          amount: split.sellerAmount,
          subscription_id: subscription.subscription_id,
          cab_id: null,
          source_rep_id: null,
          override_level: null,
          compressed: false,
          notes: null,
          created_at: new Date(),
        });

        // Enroller referral
        if (seller.data.enroller_id) {
          const enroller = await db
            .from('reps')
            .select('*')
            .eq('rep_id', seller.data.enroller_id)
            .maybeSingle();

          if (enroller.data && enroller.data.status === 'ACTIVE') {
            lineItems.push({
              line_item_id: crypto.randomUUID(),
              run_id: context.runId,
              rep_id: enroller.data.rep_id,
              line_type: 'BIZ_REFERRAL',
              amount: split.enrollerAmount,
              subscription_id: subscription.subscription_id,
              cab_id: null,
              source_rep_id: seller.data.rep_id,
              override_level: null,
              compressed: false,
              notes: null,
              created_at: new Date(),
            });
          }
        }
      } else {
        // Standard waterfall calculation
        const waterfall = calculateWaterfall(subscription.actual_price_paid, false);  // TODO: Check Powerline

        totalBotMakers += waterfall.botmakersFee;
        totalApex += waterfall.apexMargin;
        totalBonusPool += waterfall.bonusPoolContribution;

        // Seller commission
        lineItems.push({
          line_item_id: crypto.randomUUID(),
          run_id: context.runId,
          rep_id: seller.data.rep_id,
          line_type: 'SELLER',
          amount: waterfall.sellerCommission,
          subscription_id: subscription.subscription_id,
          cab_id: null,
          source_rep_id: null,
          override_level: null,
          compressed: false,
          notes: null,
          created_at: new Date(),
        });

        // Resolve override chain
        const uplineChain = await getUplineChain(seller.data.rep_id, db);
        const enroller = seller.data.enroller_id
          ? await db.from('reps').select('*').eq('rep_id', seller.data.enroller_id).maybeSingle().then((r: any) => r.data)
          : null;

        const overrideRecipients = await resolveAllOverrides(
          seller.data,
          waterfall.overrideLevels,
          uplineChain,
          getPriorMonthRank,
          enroller
        );

        // Create override line items
        for (const recipient of overrideRecipients) {
          lineItems.push({
            line_item_id: crypto.randomUUID(),
            run_id: context.runId,
            rep_id: recipient.rep.rep_id,
            line_type: recipient.compressed ? 'OVERRIDE_COMPRESSED' : `OVERRIDE_L${recipient.level}` as any,
            amount: recipient.amount,
            subscription_id: subscription.subscription_id,
            cab_id: null,
            source_rep_id: seller.data.rep_id,
            override_level: recipient.level,
            compressed: recipient.compressed,
            notes: recipient.compressed ? `Compressed from L${recipient.originalLevel}` : null,
            created_at: new Date(),
          });
        }
      }
    }

    // ===== STEP 5: Process CABs releasing this month =====
    const cabsToRelease = await db
      .from('cab_records')
      .select('*, subscriptions(*)')
      .eq('state', 'PENDING')
      .lte('release_eligible_date', new Date().toISOString());

    for (const cab of cabsToRelease.data || []) {
      // Check subscription still active
      if (cab.subscriptions.status === 'ACTIVE') {
        // Transition CAB to EARNED
        await db
          .from('cab_records')
          .update({ state: 'EARNED', released_in_run_id: context.runId })
          .eq('cab_id', cab.cab_id);

        // Create CAB_EARNED line item
        lineItems.push({
          line_item_id: crypto.randomUUID(),
          run_id: context.runId,
          rep_id: cab.rep_id,
          line_type: 'CAB_EARNED',
          amount: cab.amount,
          subscription_id: cab.subscription_id,
          cab_id: cab.cab_id,
          source_rep_id: null,
          override_level: null,
          compressed: false,
          notes: `Day ${Math.floor((new Date().getTime() - new Date(cab.enrollment_date).getTime()) / (1000 * 60 * 60 * 24))}`,
          created_at: new Date(),
        });
      }
    }

    // ===== STEP 6: Process CAB clawbacks =====
    const cabsToClawback = await db
      .from('cab_records')
      .select('*')
      .eq('state', 'CLAWBACK')
      .is('clawback_applied_run_id', null);

    for (const cab of cabsToClawback.data || []) {
      await db
        .from('cab_records')
        .update({ clawback_applied_run_id: context.runId })
        .eq('cab_id', cab.cab_id);

      lineItems.push({
        line_item_id: crypto.randomUUID(),
        run_id: context.runId,
        rep_id: cab.rep_id,
        line_type: 'CAB_CLAWBACK',
        amount: -cab.amount,  // Negative
        subscription_id: cab.subscription_id,
        cab_id: cab.cab_id,
        source_rep_id: null,
        override_level: null,
        compressed: false,
        notes: cab.trigger_reason,
        created_at: new Date(),
      });
    }

    // ===== STEP 7: Calculate bonuses =====
    // (Simplified - full bonus logic would be in separate module)
    // TODO: Implement all 10 bonus types

    // ===== STEP 8: Aggregate line items per rep =====
    const repTotals = aggregateLineItemsByRep(lineItems);

    // ===== STEP 9: Apply clawback carry-forward =====
    const repsWithCarryForward = await db
      .from('reps')
      .select('*')
      .gt('clawback_carry_forward_balance', 0);

    for (const rep of repsWithCarryForward.data || []) {
      const repTotal = repTotals.get(rep.rep_id) || 0;
      const carryForward = rep.clawback_carry_forward_balance;

      if (carryForward > 0) {
        const debit = Math.min(repTotal, carryForward);

        lineItems.push({
          line_item_id: crypto.randomUUID(),
          run_id: context.runId,
          rep_id: rep.rep_id,
          line_type: 'CAB_CLAWBACK_CARRYFORWARD',
          amount: -debit,
          subscription_id: null,
          cab_id: null,
          source_rep_id: null,
          override_level: null,
          compressed: false,
          notes: `Prior clawback balance: $${carryForward.toFixed(2)}`,
          created_at: new Date(),
        });

        // Update carry-forward balance
        const newBalance = carryForward - debit;
        await db
          .from('reps')
          .update({ clawback_carry_forward_balance: newBalance })
          .eq('rep_id', rep.rep_id);

        // Update rep total
        repTotals.set(rep.rep_id, repTotal - debit);
      }
    }

    // ===== STEP 10: Check $25 minimum payout threshold =====
    let totalCarryForwards = 0;

    for (const [repId, total] of repTotals.entries()) {
      if (total > 0 && total < COMP_PLAN_CONFIG.minimum_payout) {
        // Below threshold → carry forward
        await db
          .from('reps')
          .update({ commission_carry_forward: total })
          .eq('rep_id', repId);

        totalCarryForwards += total;
        repTotals.set(repId, 0);  // No payout this month
      }
    }

    // ===== STEP 11: Save all line items to database =====
    if (lineItems.length > 0) {
      await db.from('commission_line_items').insert(lineItems);
    }

    // ===== STEP 12: Update aggregates and lock run =====
    const result: CommissionRunResult = {
      runId: context.runId,
      totalReps: repTotals.size,
      totalPayout: Array.from(repTotals.values()).reduce((sum, val) => sum + val, 0),
      totalSellerCommissions: lineItems.filter(li => li.line_type === 'SELLER' || li.line_type === 'SELLER_BIZ').reduce((sum, li) => sum + li.amount, 0),
      totalOverrides: lineItems.filter(li => li.line_type.startsWith('OVERRIDE_')).reduce((sum, li) => sum + li.amount, 0),
      totalCABReleased: lineItems.filter(li => li.line_type === 'CAB_EARNED').reduce((sum, li) => sum + li.amount, 0),
      totalCABClawbacks: lineItems.filter(li => li.line_type === 'CAB_CLAWBACK').reduce((sum, li) => sum + li.amount, 0),
      totalBonuses: lineItems.filter(li => li.line_type.startsWith('BONUS_')).reduce((sum, li) => sum + li.amount, 0),
      totalCarryForwards,
      totalBotMakers,
      totalApex,
      totalBonusPoolContributions: totalBonusPool,
      lineItemsCreated: lineItems.length,
    };

    await db
      .from('commission_runs')
      .update({
        status: 'LOCKED',
        total_reps: result.totalReps,
        total_payout: result.totalPayout,
        total_seller_commissions: result.totalSellerCommissions,
        total_overrides: result.totalOverrides,
        total_cab_released: result.totalCABReleased,
        total_cab_clawbacks: result.totalCABClawbacks,
        total_bonuses: result.totalBonuses,
        total_carry_forwards: result.totalCarryForwards,
        total_botmakers: result.totalBotMakers,
        total_apex: result.totalApex,
        total_bonus_pool_contributions: result.totalBonusPoolContributions,
        processed_at: new Date().toISOString(),
        locked_at: new Date().toISOString(),
      })
      .eq('run_id', context.runId);

    return result;
  } catch (error) {
    // Rollback: Mark run as failed
    await db
      .from('commission_runs')
      .update({ status: 'PENDING' })
      .eq('run_id', context.runId);

    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createCommissionRun(month: number, year: number, db: any): Promise<CommissionRunContext> {
  // Check if run already exists
  const existing = await db
    .from('commission_runs')
    .select('*')
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  if (existing.data) {
    throw new Error(`Commission run for ${year}-${month} already exists (ID: ${existing.data.run_id})`);
  }

  // Create new run
  const runId = crypto.randomUUID();
  await db.from('commission_runs').insert({
    run_id: runId,
    month,
    year,
    status: 'PROCESSING',
    created_at: new Date().toISOString(),
  });

  // Calculate prior month
  const priorMonth = month === 1 ? 12 : month - 1;
  const priorYear = month === 1 ? year - 1 : year;

  return { month, year, runId, priorMonth, priorYear };
}

async function getUplineChain(repId: string, db: any): Promise<Rep[]> {
  // Use recursive CTE or materialized path
  const result = await db.rpc('get_upline_chain', { start_rep_id: repId, max_depth: 8 });
  return result.data || [];
}

function aggregateLineItemsByRep(lineItems: CommissionLineItem[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const item of lineItems) {
    const current = totals.get(item.rep_id) || 0;
    totals.set(item.rep_id, current + item.amount);
  }

  return totals;
}
