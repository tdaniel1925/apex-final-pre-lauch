/**
 * Clawback Processor
 *
 * Handles commission clawback for refunded/cancelled orders within 60-day window.
 *
 * COMPLIANCE REQUIREMENT (FTC):
 * - Track order refunds/chargebacks
 * - Reverse commission entries
 * - Update earnings_ledger with negative amounts
 * - Deduct from future payouts if already paid
 *
 * PROCESS:
 * 1. Detect refunded orders
 * 2. Find associated earnings in earnings_ledger
 * 3. Create clawback queue entries
 * 4. Create negative earnings_ledger entries to reverse commissions
 * 5. Update member balances
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

/**
 * Clawback record in cab_clawback_queue table
 */
export interface ClawbackQueueRecord {
  id: string;
  rep_id: string;
  customer_id: string | null;
  order_id: string;
  cab_amount: number;
  cancel_date: Date;
  clawback_eligible_until: Date;
  status: 'pending' | 'clawback' | 'cleared';
  commission_run_id: string | null;
  created_at: Date;
}

/**
 * Clawback result summary
 */
export interface ClawbackResult {
  success: boolean;
  order_id: string;
  total_clawed_back_cents: number;
  affected_members: string[];
  error?: string;
}

/**
 * Process clawback for a refunded order
 *
 * @param orderId - Order that was refunded/cancelled
 * @returns ClawbackResult with details of reversed commissions
 */
export async function processOrderClawback(orderId: string): Promise<ClawbackResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // 1. Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return {
        success: false,
        order_id: orderId,
        total_clawed_back_cents: 0,
        affected_members: [],
        error: `Order not found: ${orderId}`,
      };
    }

    // 2. Find all earnings associated with this order
    const { data: earnings, error: earningsError } = await supabase
      .from('earnings_ledger')
      .select('*')
      .eq('source_order_id', orderId)
      .in('status', ['pending', 'approved', 'paid']);

    if (earningsError) {
      return {
        success: false,
        order_id: orderId,
        total_clawed_back_cents: 0,
        affected_members: [],
        error: `Failed to fetch earnings: ${earningsError.message}`,
      };
    }

    if (!earnings || earnings.length === 0) {
      return {
        success: true,
        order_id: orderId,
        total_clawed_back_cents: 0,
        affected_members: [],
        error: 'No earnings found for this order (may already be clawed back)',
      };
    }

    const affectedMembers = new Set<string>();
    let totalClawedBackCents = 0;

    // 3. For each earning, create a clawback entry
    for (const earning of earnings) {
      affectedMembers.add(earning.member_id);

      // Create negative earnings_ledger entry (reversal)
      const { error: reversalError } = await supabase
        .from('earnings_ledger')
        .insert({
          run_id: earning.run_id,
          run_date: earning.run_date,
          pay_period_start: earning.pay_period_start,
          pay_period_end: earning.pay_period_end,
          member_id: earning.member_id,
          member_name: earning.member_name,
          earning_type: earning.earning_type,
          source_member_id: earning.source_member_id,
          source_member_name: earning.source_member_name,
          source_order_id: orderId,
          source_product_name: earning.source_product_name,
          override_level: earning.override_level,
          override_percentage: earning.override_percentage,
          member_tech_rank: earning.member_tech_rank,
          member_insurance_rank: earning.member_insurance_rank,
          base_amount_cents: -earning.final_amount_cents, // Negative amount (reversal)
          adjustment_cents: 0,
          final_amount_cents: -earning.final_amount_cents,
          status: 'approved', // Auto-approve clawbacks
          notes: `CLAWBACK: Refund of order ${orderId} (original earning: ${earning.earning_id})`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (reversalError) {
        console.error(`Failed to create reversal for earning ${earning.earning_id}:`, reversalError);
        continue;
      }

      // Mark original earning as reversed
      await supabase
        .from('earnings_ledger')
        .update({
          status: 'reversed',
          notes: `REVERSED: Order ${orderId} was refunded`,
          updated_at: new Date().toISOString(),
        })
        .eq('earning_id', earning.earning_id);

      totalClawedBackCents += earning.final_amount_cents;
    }

    // 4. Add entry to clawback queue (for tracking)
    const cancelDate = new Date();
    const clawbackEligibleUntil = new Date(cancelDate);
    clawbackEligibleUntil.setDate(clawbackEligibleUntil.getDate() + 60); // 60-day window

    const { error: queueError } = await supabase
      .from('cab_clawback_queue')
      .insert({
        rep_id: order.rep_id,
        customer_id: order.customer_id,
        order_id: orderId,
        cab_amount: totalClawedBackCents / 100, // Convert cents to dollars
        cancel_date: cancelDate.toISOString(),
        clawback_eligible_until: clawbackEligibleUntil.toISOString(),
        status: 'clawback',
        created_at: new Date().toISOString(),
      });

    if (queueError) {
      console.error('Failed to add to clawback queue:', queueError);
    }

    return {
      success: true,
      order_id: orderId,
      total_clawed_back_cents: totalClawedBackCents,
      affected_members: Array.from(affectedMembers),
    };
  } catch (error) {
    console.error('Clawback processing error:', error);
    return {
      success: false,
      order_id: orderId,
      total_clawed_back_cents: 0,
      affected_members: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process clawbacks for multiple orders (batch processing)
 *
 * @param orderIds - Array of order IDs to process
 * @returns Array of ClawbackResult
 */
export async function batchProcessClawbacks(orderIds: string[]): Promise<ClawbackResult[]> {
  const results: ClawbackResult[] = [];

  for (const orderId of orderIds) {
    const result = await processOrderClawback(orderId);
    results.push(result);
  }

  return results;
}

/**
 * Find pending clawbacks for a specific member
 *
 * @param memberId - Member to check
 * @returns Total amount pending clawback (in cents)
 */
export async function getMemberPendingClawbacks(memberId: string): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data: earnings, error } = await supabase
    .from('earnings_ledger')
    .select('final_amount_cents')
    .eq('member_id', memberId)
    .eq('status', 'reversed')
    .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()); // Last 60 days

  if (error || !earnings) {
    return 0;
  }

  return earnings.reduce((sum: number, e: any) => sum + Math.abs(e.final_amount_cents), 0);
}

/**
 * Get clawback queue entries that are still within the 60-day window
 *
 * @returns Array of ClawbackQueueRecord
 */
export async function getActiveClawbackQueue(): Promise<ClawbackQueueRecord[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data, error } = await supabase
    .from('cab_clawback_queue')
    .select('*')
    .eq('status', 'pending')
    .gte('clawback_eligible_until', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as ClawbackQueueRecord[];
}

/**
 * Mark clawback queue entries as cleared (after 60-day window passes)
 */
export async function clearExpiredClawbackQueue(): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data, error } = await supabase
    .from('cab_clawback_queue')
    .update({ status: 'cleared' })
    .eq('status', 'pending')
    .lt('clawback_eligible_until', new Date().toISOString())
    .select('id');

  if (error) {
    console.error('Failed to clear expired clawback queue:', error);
    return 0;
  }

  return data?.length || 0;
}
