/**
 * COMMISSION RUN EXPORT API
 *
 * Export commission run data as CSV for payment processing.
 *
 * GET /api/admin/commission-run/[id]/export
 *
 * Response: CSV file download
 *
 * Columns:
 * - Member ID
 * - Member Name
 * - Email
 * - Commission Type
 * - Amount
 * - Status
 * - Notes
 *
 * @module app/api/admin/commission-run/[id]/export
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// =============================================
// GET /api/admin/commission-run/[id]/export
// =============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const { id } = await params;

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

    // Only super admins and finance admins can export
    if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'FINANCE') {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin or Finance role required' },
        { status: 403 }
      );
    }

    // =============================================
    // 2. Get Commission Run Data
    // =============================================

    const runId = id;

    // Fetch all earnings for this run
    const { data: earnings, error: earningsError } = await supabase
      .from('earnings_ledger')
      .select(`
        earning_id,
        member_id,
        member_name,
        earning_type,
        source_member_name,
        source_product_name,
        override_level,
        override_percentage,
        member_tech_rank,
        final_amount_cents,
        status,
        notes,
        member:members!earnings_ledger_member_id_fkey (
          distributor:distributors!members_distributor_id_fkey (
            email
          )
        )
      `)
      .eq('run_id', runId)
      .order('member_name', { ascending: true });

    if (earningsError) {
      return NextResponse.json(
        { error: `Failed to fetch earnings: ${earningsError.message}` },
        { status: 500 }
      );
    }

    if (!earnings || earnings.length === 0) {
      return NextResponse.json(
        { error: 'No earnings found for this run' },
        { status: 404 }
      );
    }

    // =============================================
    // 3. Generate CSV
    // =============================================

    const csvRows: string[] = [];

    // Header row
    csvRows.push(
      [
        'Member ID',
        'Member Name',
        'Email',
        'Earning Type',
        'Source Member',
        'Source Product',
        'Override Level',
        'Override %',
        'Rank',
        'Amount',
        'Status',
        'Notes',
      ].join(',')
    );

    // Data rows
    for (const earning of earnings) {
      const member = Array.isArray(earning.member) ? earning.member[0] : earning.member;
      const distributor = member?.distributor;
      const email = Array.isArray(distributor) ? distributor[0]?.email : distributor?.email;

      const amount = (earning.final_amount_cents / 100).toFixed(2);
      const overrideLevel = earning.override_level || '';
      const overridePercentage = earning.override_percentage
        ? `${(earning.override_percentage * 100).toFixed(0)}%`
        : '';

      csvRows.push(
        [
          escapeCSV(earning.member_id),
          escapeCSV(earning.member_name),
          escapeCSV(email || ''),
          escapeCSV(earning.earning_type),
          escapeCSV(earning.source_member_name || ''),
          escapeCSV(earning.source_product_name || ''),
          escapeCSV(String(overrideLevel)),
          escapeCSV(overridePercentage),
          escapeCSV(earning.member_tech_rank || ''),
          amount,
          escapeCSV(earning.status),
          escapeCSV(earning.notes || ''),
        ].join(',')
      );
    }

    const csvContent = csvRows.join('\n');

    // =============================================
    // 4. Log Admin Action
    // =============================================

    await supabase.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'commission_run_exported',
      entity_type: 'commission_run',
      entity_id: runId,
      details: {
        earnings_count: earnings.length,
        export_format: 'csv',
      },
    });

    // =============================================
    // 5. Return CSV Response
    // =============================================

    const filename = `commission-run-${runId}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Commission export error:', error);

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
// HELPER FUNCTIONS
// =============================================

/**
 * Escape CSV field (handle commas, quotes, newlines)
 *
 * @param field - Field value to escape
 * @returns Escaped field value
 */
function escapeCSV(field: string): string {
  if (!field) return '';

  // If field contains comma, quote, or newline, wrap in quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // Escape existing quotes by doubling them
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}
