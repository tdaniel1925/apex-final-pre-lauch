// =============================================
// Approve Payout Batch API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

// POST /api/admin/payouts/[id]/approve
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await requireAdmin();
    const supabase = createServiceClient();

    // Get batch details
    const { data: batch, error: batchError } = await supabase
      .from('payout_batches')
      .select('*')
      .eq('id', params.id)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (batch.status !== 'pending_review' && batch.status !== 'draft') {
      return NextResponse.json(
        { error: `Cannot approve batch with status: ${batch.status}` },
        { status: 400 }
      );
    }

    // Get admin ID from admins table
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();

    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    // Update batch status
    const { error: updateError } = await supabase
      .from('payout_batches')
      .update({
        status: 'approved',
        approved_by: admin?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error approving batch:', updateError);
      return NextResponse.json({ error: 'Failed to approve batch' }, { status: 500 });
    }

    // Update all commission records to approved
    const commissionTables = [
      'commissions_retail',
      'commissions_cab',
      'commissions_customer_milestone',
      'commissions_retention',
      'commissions_matrix',
      'commissions_matching',
      'commissions_override',
      'commissions_infinity',
      'commissions_fast_start',
      'commissions_rank_advancement',
      'commissions_car',
      'commissions_vacation',
      'commissions_infinity_pool',
    ];

    for (const table of commissionTables) {
      await supabase
        .from(table)
        .update({ status: 'approved' })
        .eq('status', 'pending')
        .or(`month_year.eq.${batch.month_year},week_ending.gte.${batch.month_year}-01`);
    }

    return NextResponse.json({
      success: true,
      message: 'Payout batch approved successfully',
    });
  } catch (error: any) {
    console.error('Approve batch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
