// =============================================
// DUAL-LADDER COMPENSATION LEADERSHIP POOL API
// =============================================
// Phase: 4 (Update APIs)
// Agent: 4C
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { calculateLeadershipPoolShares } from '@/lib/compensation/bonus-programs';
import { LEADERSHIP_POOL_ELIGIBLE_RANK } from '@/lib/compensation/config';

/**
 * Allocate Leadership Pool (1.5%)
 *
 * POST /api/admin/compensation/leadership-pool
 *
 * This endpoint:
 * 1. Calculates leadership pool allocation for a period
 * 2. Queries Elite members who are override qualified (50+ personal credits)
 * 3. Divides pool PROPORTIONALLY based on production points (personal + team credits)
 * 4. Inserts allocation into leadership_shares table
 * 5. Returns distribution summary with percentages
 *
 * From spec:
 * "1.5% leadership pool is divided among Elite members based on production points"
 * "Points = personal_credits + team_credits"
 * "Share % = member's points / total Elite points"
 *
 * Note: This is a simplified implementation for Phase 4.
 * Full production implementation would include:
 * - Transaction management
 * - Validation of period closure
 * - Duplicate allocation prevention
 * - Audit logging
 * - Integration with credit calculation system
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

    // Step 1: Query Elite members with production data
    // In production, this would calculate credits from orders in the period
    // For Phase 4 simplified implementation, we'll use member data
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('member_id, full_name, tech_rank, personal_credits_monthly, group_credits_monthly')
      .eq('status', 'active')
      .eq('tech_rank', LEADERSHIP_POOL_ELIGIBLE_RANK); // 'elite'

    if (membersError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch Elite members',
          details: membersError.message,
        },
        { status: 500 }
      );
    }

    // Step 2: Filter to override-qualified Elite members (50+ personal credits)
    const eliteMembers = (members || []).map((member: any) => ({
      memberId: member.member_id,
      memberName: member.full_name,
      personalCredits: member.personal_credits_monthly || 0,
      teamCredits: member.group_credits_monthly || 0,
      overrideQualified: (member.personal_credits_monthly || 0) >= 50,
    }));

    // Step 3: Calculate leadership pool shares (proportional distribution)
    const shares = calculateLeadershipPoolShares(totalPoolCents, eliteMembers, periodLabel);

    // Step 4: Calculate summary statistics
    const totalDistributed = shares.reduce((sum, share) => sum + share.payoutCents, 0);
    const remainderCents = totalPoolCents - totalDistributed;
    const totalProductionPoints = shares.reduce((sum, share) => sum + share.sharePoints, 0);

    // Step 5: Insert leadership shares (if not dry run)
    if (!dryRun) {
      const shareInserts = shares.map((share) => ({
        period_label: periodLabel,
        period_start: periodStart,
        period_end: periodEnd,
        member_id: share.memberId,
        member_name: share.memberName,
        personal_credits: share.personalCredits,
        team_credits: share.teamCredits,
        share_points: share.sharePoints,
        share_percentage: share.sharePercentage,
        payout_cents: share.payoutCents,
        pool_type: 'leadership',
        status: 'pending',
      }));

      if (shareInserts.length > 0) {
        const { error: sharesError } = await supabase
          .from('leadership_shares')
          .insert(shareInserts);

        if (sharesError) {
          return NextResponse.json(
            {
              error: 'Failed to insert leadership pool shares',
              details: sharesError.message,
            },
            { status: 500 }
          );
        }
      }

      // Record pool distribution history
      const { error: historyError } = await supabase.from('pool_distribution_history').insert({
        period_label: periodLabel,
        period_start: periodStart,
        period_end: periodEnd,
        pool_type: 'leadership',
        total_pool_cents: totalPoolCents,
        distributed_cents: totalDistributed,
        remainder_cents: remainderCents,
        eligible_member_count: shares.length,
        distribution_date: new Date().toISOString(),
        distribution_status: 'completed',
      });

      if (historyError) {
        console.error('[Leadership Pool] Failed to record distribution history:', historyError);
        // Don't fail the request if history insert fails
      }
    }

    // Step 6: Return summary
    return NextResponse.json(
      {
        success: true,
        periodLabel,
        periodStart,
        periodEnd,
        dryRun,
        summary: {
          totalPoolCents,
          qualifiedEliteCount: shares.length,
          totalProductionPoints,
          totalDistributedCents: totalDistributed,
          remainderCents,
        },
        shares: shares.map((share) => ({
          memberId: share.memberId,
          memberName: share.memberName,
          personalCredits: share.personalCredits,
          teamCredits: share.teamCredits,
          productionPoints: share.sharePoints,
          sharePercentage: share.sharePercentage.toFixed(2),
          payoutCents: share.payoutCents,
          payoutFormatted: `$${(share.payoutCents / 100).toFixed(2)}`,
        })),
        message: dryRun
          ? 'Dry run complete. Set dryRun=false to commit allocations.'
          : 'Leadership pool allocated successfully.',
        note: 'Phase 4 simplified implementation. Full production would include transaction management and credit calculation from actual orders.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Leadership Pool Allocation] Error:', error);
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
 * Get Leadership Pool Status
 *
 * GET /api/admin/compensation/leadership-pool?periodLabel=2026-03
 *
 * Returns leadership pool allocation status for a specific period
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Get period label from query params
    const { searchParams } = new URL(request.url);
    const periodLabel = searchParams.get('periodLabel');

    if (!periodLabel) {
      // Return most recent leadership pool allocation
      const { data: recentPool, error } = await supabase
        .from('pool_distribution_history')
        .select('*')
        .eq('pool_type', 'leadership')
        .order('period_start', { ascending: false })
        .limit(1);

      if (error) {
        return NextResponse.json(
          {
            error: 'Failed to fetch leadership pool status',
            details: error.message,
          },
          { status: 500 }
        );
      }

      if (!recentPool || recentPool.length === 0) {
        return NextResponse.json(
          {
            message: 'No leadership pool allocations found',
            note: 'Run POST /api/admin/compensation/leadership-pool to allocate first pool',
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

    // Get specific period's leadership pool allocation
    const { data: poolData, error: poolError } = await supabase
      .from('pool_distribution_history')
      .select('*')
      .eq('period_label', periodLabel)
      .eq('pool_type', 'leadership')
      .single();

    if (poolError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch leadership pool for period',
          details: poolError.message,
        },
        { status: 500 }
      );
    }

    // Get individual shares for this period
    const { data: shares, error: sharesError } = await supabase
      .from('leadership_shares')
      .select(
        'member_id, member_name, personal_credits, team_credits, share_points, share_percentage, payout_cents, status'
      )
      .eq('period_label', periodLabel)
      .eq('pool_type', 'leadership')
      .order('payout_cents', { ascending: false });

    if (sharesError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch leadership pool shares',
          details: sharesError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        pool: poolData,
        shares: (shares || []).map((share: any) => ({
          memberId: share.member_id,
          memberName: share.member_name,
          personalCredits: share.personal_credits,
          teamCredits: share.team_credits,
          productionPoints: share.share_points,
          sharePercentage: share.share_percentage,
          payoutCents: share.payout_cents,
          payoutFormatted: `$${(share.payout_cents / 100).toFixed(2)}`,
          status: share.status,
        })),
        summary: {
          totalPoolCents: poolData.total_pool_cents,
          distributedCents: poolData.distributed_cents,
          remainderCents: poolData.remainder_cents,
          qualifiedEliteMembers: poolData.eligible_member_count,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Leadership Pool Status] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
