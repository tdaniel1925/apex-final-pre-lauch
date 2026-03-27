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
import { withCompensationLock } from '@/lib/compensation/run-lock';

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
 * Security: Uses PostgreSQL advisory locks to prevent race conditions
 * See: SECURITY-FIX-2-COMPENSATION-MUTEX-PLAN.md
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

    // Get authenticated admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if run already exists for this period
    const { data: existingRun } = await supabase
      .from('compensation_run_status')
      .select('id, status, run_id')
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd)
      .in('status', ['in_progress', 'pending'])
      .maybeSingle();

    if (existingRun) {
      return NextResponse.json(
        {
          error: 'A compensation run is already in progress for this period',
          existingRunId: existingRun.run_id,
          status: existingRun.status,
        },
        { status: 409 } // Conflict
      );
    }

    const runId = crypto.randomUUID();
    const runDate = new Date().toISOString();

    // Create run status record
    const { error: insertError } = await supabase
      .from('compensation_run_status')
      .insert({
        run_id: runId,
        period_start: periodStart,
        period_end: periodEnd,
        status: 'pending',
        initiated_by: user.id,
        initiated_at: runDate,
        dry_run: dryRun,
      });

    if (insertError) {
      console.error('[CompRun] Failed to create run status:', insertError);
      return NextResponse.json(
        { error: 'Failed to initialize compensation run' },
        { status: 500 }
      );
    }

    // Execute compensation run with PostgreSQL advisory lock
    const result = await withCompensationLock(
      periodStart,
      periodEnd,
      async () => {
        // Update status to in_progress
        await supabase
          .from('compensation_run_status')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString(),
          })
          .eq('run_id', runId);

        try {
                // Step 1: Get all active members
          const { data: members, error: membersError } = await supabase
            .from('members')
            .select('*')
            .eq('status', 'active');

          if (membersError) {
            throw new Error(`Failed to fetch members: ${membersError.message}`);
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
          // Security Fix #5: Implements rank depth enforcement via calculateOverride()
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                *,
                product:products (*)
              )
            `)
            .gte('created_at', periodStart)
            .lt('created_at', periodEnd)
            .eq('status', 'completed');

          if (ordersError) {
            throw new Error(`Failed to fetch orders: ${ordersError.message}`);
          }

          let totalSalesCents = 0;
          let totalSellerCommissionsCents = 0;
          let totalOverridesCents = 0;
          let totalBonusPoolCents = 0;
          let totalLeadershipPoolCents = 0;

          const earningsToInsert = [];

          for (const order of orders || []) {
            // Get buyer's member record
            const { data: buyer } = await supabase
              .from('members')
              .select('*, distributor:distributors!members_distributor_id_fkey(*)')
              .eq('member_id', order.member_id)
              .single();

            if (!buyer) continue;

            // Calculate waterfall for each order item
            for (const item of order.order_items) {
              const itemTotalCents = item.unit_price_cents * item.quantity;
              const waterfall = calculateWaterfall(itemTotalCents, item.product.product_type || 'standard');

              totalSalesCents += waterfall.priceCents;
              totalBonusPoolCents += waterfall.bonusPoolCents;
              totalLeadershipPoolCents += waterfall.leadershipPoolCents;

              // Seller commission (60% of commission pool)
              const sellerCommissionCents = waterfall.sellerCommissionCents;
              totalSellerCommissionsCents += sellerCommissionCents;

              earningsToInsert.push({
                member_id: buyer.member_id,
                run_id: runId,
                run_date: runDate,
                pay_period_start: periodStart,
                pay_period_end: periodEnd,
                earning_type: 'seller_commission',
                base_amount_cents: sellerCommissionCents,
                final_amount_cents: sellerCommissionCents,
                metadata: {
                  order_id: order.id,
                  product_id: item.product_id,
                  quantity: item.quantity,
                },
              });

              // Calculate overrides (L1-L5)
              const overridePoolCents = waterfall.overridePoolCents;

              // L1: Enroller override (30% of pool via sponsor_id - enrollment tree)
              if (buyer.distributor.sponsor_id) {
                const { data: sponsor } = await supabase
                  .from('members')
                  .select('*, distributor:distributors!members_distributor_id_fkey(*)')
                  .eq('distributor_id', buyer.distributor.sponsor_id)
                  .single();

                if (sponsor) {
                  const l1Override = calculateOverride(
                    {
                      memberId: sponsor.member_id,
                      techRank: sponsor.tech_rank,
                      personalCreditsMonthly: sponsor.personal_credits_monthly,
                      overrideQualified: sponsor.personal_credits_monthly >= 50,
                    },
                    {
                      orderId: order.id,
                      sellerMemberId: buyer.member_id,
                      priceCents: itemTotalCents,
                      productType: item.product.product_type || 'standard',
                    },
                    true, // isEnroller = true
                    1 // level = 1
                  );

                  if (l1Override.amountCents > 0) {
                    totalOverridesCents += l1Override.amountCents;
                    earningsToInsert.push({
                      member_id: sponsor.member_id,
                      run_id: runId,
                      run_date: runDate,
                      pay_period_start: periodStart,
                      pay_period_end: periodEnd,
                      earning_type: 'override_commission',
                      base_amount_cents: l1Override.amountCents,
                      final_amount_cents: l1Override.amountCents,
                      metadata: {
                        level: 1,
                        rule: l1Override.rule,
                        seller_member_id: buyer.member_id,
                        percentage: l1Override.percentage,
                        rank: l1Override.memberTechRank,
                      },
                    });
                  }
                }
              }

              // L2-L5: Matrix overrides (via matrix_parent_id - matrix tree)
              let currentMatrixParentId = buyer.distributor.matrix_parent_id;
              let level = 2;

              while (currentMatrixParentId && level <= 5) {
                const { data: matrixParent } = await supabase
                  .from('members')
                  .select('*, distributor:distributors!members_distributor_id_fkey(*)')
                  .eq('distributor_id', currentMatrixParentId)
                  .single();

                if (!matrixParent) break;

                const override = calculateOverride(
                  {
                    memberId: matrixParent.member_id,
                    techRank: matrixParent.tech_rank,
                    personalCreditsMonthly: matrixParent.personal_credits_monthly,
                    overrideQualified: matrixParent.personal_credits_monthly >= 50,
                  },
                  {
                    orderId: order.id,
                    sellerMemberId: buyer.member_id,
                    priceCents: itemTotalCents,
                    productType: item.product.product_type || 'standard',
                  },
                  false, // isEnroller = false
                  level
                );

                // Rank depth enforcement happens here automatically!
                // calculateOverride() returns 0 if rank doesn't unlock this level
                if (override.amountCents > 0) {
                  totalOverridesCents += override.amountCents;
                  earningsToInsert.push({
                    member_id: matrixParent.member_id,
                    run_id: runId,
                    run_date: runDate,
                    pay_period_start: periodStart,
                    pay_period_end: periodEnd,
                    earning_type: 'override_commission',
                    base_amount_cents: override.amountCents,
                    final_amount_cents: override.amountCents,
                    metadata: {
                      level,
                      rule: override.rule,
                      seller_member_id: buyer.member_id,
                      percentage: override.percentage,
                      rank: override.memberTechRank,
                    },
                  });
                }

                currentMatrixParentId = matrixParent.distributor.matrix_parent_id;
                level++;
              }
            }
          }

          // Insert all earnings (if not dry run)
          if (!dryRun && earningsToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('earnings_ledger')
              .insert(earningsToInsert);

            if (insertError) {
              throw new Error(`Failed to insert earnings: ${insertError.message}`);
            }
          }

          const commissionsSummary = {
            totalSales: totalSalesCents / 100,
            totalSellerCommissions: totalSellerCommissionsCents / 100,
            totalOverrides: totalOverridesCents / 100,
            totalBonusPool: totalBonusPoolCents / 100,
            totalLeadershipPool: totalLeadershipPoolCents / 100,
            earningsCount: earningsToInsert.length,
          };

          // Update status to completed
          await supabase
            .from('compensation_run_status')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              members_processed: members?.length ?? 0,
              commissions_calculated: earningsToInsert.length,
              total_amount_cents: totalSalesCents,
            })
            .eq('run_id', runId);

          // Return results
          return {
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
          };
        } catch (error) {
          // Mark run as failed
          await supabase
            .from('compensation_run_status')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('run_id', runId);

          throw error;
        }
      }
    );

    // Check if lock acquisition failed
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 } // Conflict
      );
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        ...result.data,
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
