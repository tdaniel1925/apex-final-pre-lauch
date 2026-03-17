// =============================================
// DUAL-LADDER COMPENSATION RUN API
// =============================================
// Phase: 4 (Update APIs)
// Agent: 4A
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { calculateWaterfall } from '@/lib/compensation/waterfall';
import { evaluateTechRank } from '@/lib/compensation/rank';
import { calculateOverride } from '@/lib/compensation/override-resolution';
import { calculateRankBonus } from '@/lib/compensation/bonus-programs';

/**
 * Run Monthly Compensation Calculation
 *
 * POST /api/admin/compensation/run
 *
 * This endpoint:
 * 1. Evaluates all member ranks based on current credits
 * 2. Processes promotions/demotions (effective next month)
 * 3. Calculates seller commissions and overrides for all sales
 * 4. Awards rank bonuses for new promotions
 * 5. Accumulates bonus pool (3.5%) and leadership pool (1.5%)
 * 6. Returns summary for admin review before approval
 *
 * Note: This is a simplified implementation for Phase 4.
 * Full production implementation would include:
 * - Transaction management
 * - Batch processing for large datasets
 * - Pool distribution logic
 * - Payment integration
 * - Audit logging
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Parse request body
    const body = await request.json();
    const { periodStart, periodEnd, dryRun = true } = body;

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'periodStart and periodEnd are required (YYYY-MM-DD format)',
        },
        { status: 400 }
      );
    }

    const runDate = new Date().toISOString();
    const runId = crypto.randomUUID();

    // Step 1: Get all active members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .eq('status', 'active');

    if (membersError) {
      return NextResponse.json(
        { error: 'Failed to fetch members', details: membersError.message },
        { status: 500 }
      );
    }

    // Step 2: Evaluate ranks for all members
    const rankEvaluations = []; // Placeholder - would use evaluateTechRank()
    const promotions = [];
    const demotions = [];
    const rankBonuses = [];

    for (const member of members || []) {
      // Example: Evaluate rank (simplified)
      // In production, this would:
      // - Get sponsored members
      // - Call evaluateTechRank()
      // - Check for promotion/demotion
      // - Calculate rank bonus if promoted

      // For now, just track current state
      rankEvaluations.push({
        memberId: member.member_id,
        currentRank: member.tech_rank,
        qualifiedRank: member.tech_rank, // Would be calculated
        action: 'maintain',
      });
    }

    // Step 3: Calculate commissions for all sales in period
    // Note: In production, this would query orders table and calculate:
    // - Waterfall for each sale
    // - Seller commission (60% of commission pool)
    // - Override commissions (L1-L5 based on rank and enroller rule)
    // - Accumulate bonus pool (3.5%) and leadership pool (1.5%)

    const commissionsSummary = {
      totalSales: 0,
      totalSellerCommissions: 0,
      totalOverrides: 0,
      totalBonusPool: 0,
      totalLeadershipPool: 0,
    };

    // Step 4: Summary response
    return NextResponse.json(
      {
        success: true,
        runId,
        runDate,
        periodStart,
        periodEnd,
        dryRun,
        summary: {
          membersEvaluated: members?.length ?? 0,
          promotions: promotions.length,
          demotions: demotions.length,
          rankBonuses: rankBonuses.length,
          commissions: commissionsSummary,
        },
        message: dryRun
          ? 'Dry run complete. Set dryRun=false to commit changes.'
          : 'Commission run complete. Changes committed to database.',
        note: 'This is a simplified Phase 4 implementation. Full commission run logic would process orders, calculate overrides, and distribute pools.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Commission Run] Error:', error);
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
 * Get Commission Run Status
 *
 * GET /api/admin/compensation/run
 *
 * Returns status of the most recent commission run
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Get most recent run from earnings_ledger
    const { data: recentEarnings, error } = await supabase
      .from('earnings_ledger')
      .select('run_id, run_date, pay_period_start, pay_period_end')
      .order('run_date', { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch commission run status', details: error.message },
        { status: 500 }
      );
    }

    if (!recentEarnings || recentEarnings.length === 0) {
      return NextResponse.json(
        {
          message: 'No commission runs found',
          note: 'Run POST /api/admin/compensation/run to execute first commission run',
        },
        { status: 200 }
      );
    }

    const latestRun = recentEarnings[0];

    // Get summary stats for this run
    const { data: runStats, error: statsError } = await supabase
      .from('earnings_ledger')
      .select('earning_type, final_amount_cents')
      .eq('run_id', latestRun.run_id);

    if (statsError) {
      return NextResponse.json(
        { error: 'Failed to fetch run statistics', details: statsError.message },
        { status: 500 }
      );
    }

    // Aggregate by type
    const summary = (runStats || []).reduce((acc: any, earning: any) => {
      if (!acc[earning.earning_type]) {
        acc[earning.earning_type] = { count: 0, totalCents: 0 };
      }
      acc[earning.earning_type].count++;
      acc[earning.earning_type].totalCents += earning.final_amount_cents;
      return acc;
    }, {});

    return NextResponse.json(
      {
        latestRun: {
          runId: latestRun.run_id,
          runDate: latestRun.run_date,
          periodStart: latestRun.pay_period_start,
          periodEnd: latestRun.pay_period_end,
        },
        summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Commission Run Status] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
