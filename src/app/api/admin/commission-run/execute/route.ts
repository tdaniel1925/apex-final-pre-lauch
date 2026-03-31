/**
 * COMMISSION RUN EXECUTION API
 *
 * Admin endpoint to trigger monthly commission calculation.
 *
 * POST /api/admin/commission-run/execute
 *
 * Body:
 * {
 *   "month": "2026-03",
 *   "dryRun": false
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "run_id": "RUN-2026-03",
 *   "totals": {
 *     "transactions_processed": 150,
 *     "total_sales_amount": 15000.00,
 *     "total_bv_amount": 7000.00,
 *     "total_commissions": 5000.00,
 *     "breakage_amount": 500.00,
 *     "distributors_paid": 50
 *   }
 * }
 *
 * @module app/api/admin/commission-run/execute
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { executeMonthlyCommissionRun } from '@/lib/commission-engine/monthly-run';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// =============================================
// POST /api/admin/commission-run/execute
// =============================================

export async function POST(request: NextRequest) {
  try {
    // =============================================
    // 1. Authenticate Admin
    // =============================================

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Only super admins and finance admins can run commissions
    if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'FINANCE') {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin or Finance role required' },
        { status: 403 }
      );
    }

    // =============================================
    // 2. Parse Request Body
    // =============================================

    const body = await request.json();
    const { month, dryRun = false } = body;

    if (!month) {
      return NextResponse.json(
        { error: 'Missing required field: month (format: YYYY-MM)' },
        { status: 400 }
      );
    }

    // Validate month format
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM (e.g., 2026-03)' },
        { status: 400 }
      );
    }

    console.log(`\n🔐 Admin Request: ${admin.role} (${user.email})`);
    console.log(`   Month: ${month}`);
    console.log(`   Dry Run: ${dryRun}`);

    // =============================================
    // 3. Check if Commission Run Already Exists
    // =============================================

    if (!dryRun) {
      const [year, monthNum] = month.split('-').map(Number);
      const periodEnd = new Date(year, monthNum, 0, 23, 59, 59, 999);

      const { data: existingRun } = await supabase
        .from('earnings_ledger')
        .select('run_id')
        .eq('run_date', periodEnd.toISOString().split('T')[0])
        .limit(1)
        .single();

      if (existingRun) {
        return NextResponse.json(
          {
            error: `Commission run for ${month} already exists`,
            run_id: existingRun.run_id,
          },
          { status: 409 }
        );
      }
    }

    // =============================================
    // 4. Execute Commission Run
    // =============================================

    const result = await executeMonthlyCommissionRun({
      month,
      dryRun,
    });

    if (result.status === 'failed') {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Commission run failed',
          run_id: result.run_id,
        },
        { status: 500 }
      );
    }

    // =============================================
    // 5. Log Admin Action
    // =============================================

    if (!dryRun) {
      await supabase.from('admin_activity_log').insert({
        admin_id: admin.id,
        action: 'commission_run_executed',
        entity_type: 'commission_run',
        entity_id: result.run_id,
        details: {
          month,
          transactions_processed: result.transactions_processed,
          total_commissions: result.total_seller_commissions + result.total_override_commissions,
          distributors_paid: result.distributors_paid,
        },
      });
    }

    // =============================================
    // 6. Return Success Response
    // =============================================

    return NextResponse.json({
      success: true,
      dry_run: dryRun,
      run_id: result.run_id,
      month: result.month,
      totals: {
        transactions_processed: result.transactions_processed,
        total_sales_amount: result.total_sales_amount,
        total_bv_amount: result.total_bv_amount,
        total_seller_commissions: result.total_seller_commissions,
        total_override_commissions: result.total_override_commissions,
        total_commissions: result.total_seller_commissions + result.total_override_commissions,
        total_rank_bonuses: result.total_rank_bonuses,
        total_bonus_pool: result.total_bonus_pool,
        total_leadership_pool: result.total_leadership_pool,
        breakage_amount: result.breakage_amount,
        distributors_paid: result.distributors_paid,
      },
      status: result.status,
    });

  } catch (error) {
    console.error('Commission run execution error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =============================================
// GET /api/admin/commission-run/execute
// =============================================

export async function GET(request: NextRequest) {
  try {
    // Return API documentation
    return NextResponse.json({
      endpoint: 'POST /api/admin/commission-run/execute',
      description: 'Execute monthly commission calculation',
      authentication: 'Required (Super Admin or Finance role)',
      body: {
        month: 'string (YYYY-MM format, e.g., 2026-03)',
        dryRun: 'boolean (optional, default: false)',
      },
      example: {
        month: '2026-03',
        dryRun: false,
      },
      response: {
        success: 'boolean',
        run_id: 'string',
        totals: {
          transactions_processed: 'number',
          total_sales_amount: 'number',
          total_bv_amount: 'number',
          total_commissions: 'number',
          breakage_amount: 'number',
          distributors_paid: 'number',
        },
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
