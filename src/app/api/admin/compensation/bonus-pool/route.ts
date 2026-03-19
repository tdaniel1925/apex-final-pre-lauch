// =============================================
// DUAL-LADDER COMPENSATION BONUS POOL API
// =============================================
// Phase: 4 (Update APIs)
// Agent: 4B
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { calculateBonusPoolShares } from '@/lib/compensation/bonus-programs';

/**
 * Allocate Bonus Pool (3.5%)
 *
 * POST /api/admin/compensation/bonus-pool
 *
 * This endpoint:
 * 1. Calculates bonus pool allocation for a period
 * 2. Queries members who earned rank bonuses (qualified members)
 * 3. Divides pool EQUALLY among all qualified members
 * 4. Inserts allocation into bonus_pool_ledger table
 * 5. Creates individual shares in leadership_shares table
 * 6. Returns distribution summary
 *
 * From spec:
 * "3.5% bonus pool is divided EQUALLY among all members who earned rank bonuses in the period"
 *
 * Note: This is a simplified implementation for Phase 4.
 * Full production implementation would include:
 * - Transaction management
 * - Validation of period closure
 * - Duplicate allocation prevention
 * - Audit logging
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Parse request body
    const body = await request.json();
    const { periodStart, periodEnd, periodLabel, totalPoolCents, dryRun = true } = body;

    if (!periodStart || !periodEnd || !periodLabel || totalPoolCents === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'periodStart, periodEnd, periodLabel, and totalPoolCents are required',
        },
        { status: 400 }
      );
    }

    if (typeof totalPoolCents !== 'number' || totalPoolCents < 0) {
      return NextResponse.json(
        {
          error: 'Invalid totalPoolCents',
          message: 'totalPoolCents must be a non-negative number',
        },
        { status: 400 }
      );
    }

    // Step 1: Query members who earned rank bonuses in this period
    // In production, this would query earnings_ledger for earning_type = 'rank_bonus'
    // For Phase 4 simplified implementation, we'll query based on recent promotions
    const { data: rankBonusEarnings, error: earningsError } = await supabase
      .from('earnings_ledger')
      .select('member_id, member_name')
      .eq('earning_type', 'rank_bonus')
      .gte('pay_period_start', periodStart)
      .lte('pay_period_end', periodEnd)
      .eq('status', 'approved');

    if (earningsError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch rank bonus earnings',
          details: earningsError.message,
        },
        { status: 500 }
      );
    }

    // Get unique qualified members
    const qualifiedMembersMap = new Map();
    (rankBonusEarnings || []).forEach((earning: any) => {
      if (!qualifiedMembersMap.has(earning.member_id)) {
        qualifiedMembersMap.set(earning.member_id, {
          memberId: earning.member_id,
          memberName: earning.member_name,
        });
      }
    });

    const qualifiedMembers = Array.from(qualifiedMembersMap.values());

    // Step 2: Calculate bonus pool shares (equal distribution)
    const shares = calculateBonusPoolShares(totalPoolCents, qualifiedMembers, periodLabel);

    // Step 3: Calculate summary statistics
    const totalDistributed = shares.reduce((sum, share) => sum + share.shareAmountCents, 0);
    const remainderCents = totalPoolCents - totalDistributed;

    // Step 4: Insert bonus pool ledger entry (if not dry run)
    if (!dryRun) {
      // Insert bonus pool entry
      const { error: poolError } = await supabase.from('bonus_pool_ledger').insert({
        period_start: periodStart,
        period_end: periodEnd,
        period_label: periodLabel,
        total_sales_cents: 0, // Would be calculated from actual sales
        pool_percentage: 0.035,
        pool_amount_cents: totalPoolCents,
        distributed_amount_cents: totalDistributed,
        remaining_amount_cents: remainderCents,
        distribution_status: 'distributed',
        qualified_member_count: qualifiedMembers.length,
        share_per_member_cents: shares.length > 0 ? shares[0].shareAmountCents : 0,
      });

      if (poolError) {
        return NextResponse.json(
          {
            error: 'Failed to insert bonus pool ledger entry',
            details: poolError.message,
          },
          { status: 500 }
        );
      }

      // Insert individual shares into leadership_shares table
      // (reusing leadership_shares table for bonus pool shares)
      const shareInserts = shares.map((share) => ({
        period_label: periodLabel,
        period_start: periodStart,
        period_end: periodEnd,
        member_id: share.memberId,
        member_name: share.memberName,
        personal_credits: 0, // Not applicable for bonus pool
        team_credits: 0, // Not applicable for bonus pool
        share_points: 0, // Not applicable for bonus pool (equal distribution)
        share_percentage: qualifiedMembers.length > 0 ? 100 / qualifiedMembers.length : 0,
        payout_cents: share.shareAmountCents,
        pool_type: 'bonus', // Distinguish from leadership pool
        status: 'pending',
      }));

      if (shareInserts.length > 0) {
        const { error: sharesError } = await supabase
          .from('leadership_shares')
          .insert(shareInserts);

        if (sharesError) {
          return NextResponse.json(
            {
              error: 'Failed to insert bonus pool shares',
              details: sharesError.message,
            },
            { status: 500 }
          );
        }
      }
    }

    // Step 5: Return summary
    return NextResponse.json(
      {
        success: true,
        periodLabel,
        periodStart,
        periodEnd,
        dryRun,
        summary: {
          totalPoolCents,
          qualifiedMemberCount: qualifiedMembers.length,
          sharePerMemberCents: shares.length > 0 ? shares[0].shareAmountCents : 0,
          totalDistributedCents: totalDistributed,
          remainderCents,
        },
        shares: shares.map((share) => ({
          memberId: share.memberId,
          memberName: share.memberName,
          amountCents: share.shareAmountCents,
          amountFormatted: `$${(share.shareAmountCents / 100).toFixed(2)}`,
        })),
        message: dryRun
          ? 'Dry run complete. Set dryRun=false to commit allocations.'
          : 'Bonus pool allocated successfully.',
        note: 'Phase 4 simplified implementation. Full production would include transaction management and duplicate prevention.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Bonus Pool Allocation] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get Bonus Pool Status
 *
 * GET /api/admin/compensation/bonus-pool?periodLabel=2026-03
 *
 * Returns bonus pool allocation status for a specific period
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Get period label from query params
    const { searchParams } = new URL(request.url);
    const periodLabel = searchParams.get('periodLabel');

    if (!periodLabel) {
      // Return most recent bonus pool allocation
      const { data: recentPool, error } = await supabase
        .from('bonus_pool_ledger')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(1);

      if (error) {
        return NextResponse.json(
          {
            error: 'Failed to fetch bonus pool status',
            details: error.message,
          },
          { status: 500 }
        );
      }

      if (!recentPool || recentPool.length === 0) {
        return NextResponse.json(
          {
            message: 'No bonus pool allocations found',
            note: 'Run POST /api/admin/compensation/bonus-pool to allocate first pool',
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          latestPool: recentPool[0],
        },
        { status: 200 }
      );
    }

    // Get specific period's bonus pool allocation
    const { data: poolData, error: poolError } = await supabase
      .from('bonus_pool_ledger')
      .select('*')
      .eq('period_label', periodLabel)
      .single();

    if (poolError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch bonus pool for period',
          details: poolError.message,
        },
        { status: 500 }
      );
    }

    // Get individual shares for this period
    const { data: shares, error: sharesError } = await supabase
      .from('leadership_shares')
      .select('member_id, member_name, payout_cents, status')
      .eq('period_label', periodLabel)
      .eq('pool_type', 'bonus');

    if (sharesError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch bonus pool shares',
          details: sharesError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        pool: poolData,
        shares: shares || [],
        summary: {
          totalPoolCents: poolData.pool_amount_cents,
          distributedCents: poolData.distributed_amount_cents,
          remainderCents: poolData.remaining_amount_cents,
          qualifiedMembers: poolData.qualified_member_count,
          sharePerMember: poolData.share_per_member_cents,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Bonus Pool Status] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
