// =============================================
// Admin Commission Run API
// Triggers monthly commission calculation
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/auth/admin';

// POST /api/admin/commissions/run
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { month_year } = body;

    if (!month_year) {
      return NextResponse.json(
        { error: 'month_year is required (format: YYYY-MM)' },
        { status: 400 }
      );
    }

    // Validate format
    if (!/^\d{4}-\d{2}$/.test(month_year)) {
      return NextResponse.json(
        { error: 'Invalid month_year format. Use YYYY-MM' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if commission run already exists for this month
    const { data: existing } = await supabase
      .from('bv_snapshots')
      .select('id')
      .eq('month_year', month_year)
      .eq('is_locked', true)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: `Commission run for ${month_year} has already been completed and locked` },
        { status: 400 }
      );
    }

    // Run the monthly commission calculation
    const { data: result, error } = await supabase.rpc('run_monthly_commissions', {
      p_month_year: month_year,
    });

    if (error) {
      console.error('Commission run error:', error);
      return NextResponse.json(
        { error: `Failed to run commissions: ${error.message}` },
        { status: 500 }
      );
    }

    // Create payout batch
    const { data: batchId, error: batchError } = await supabase.rpc('create_payout_batch', {
      p_month_year: month_year,
      p_payout_type: 'monthly',
    });

    if (batchError) {
      console.error('Payout batch creation error:', batchError);
      return NextResponse.json(
        { error: `Commissions calculated but failed to create payout batch: ${batchError.message}` },
        { status: 500 }
      );
    }

    // Update batch status to pending_review
    await supabase
      .from('payout_batches')
      .update({ status: 'pending_review' })
      .eq('id', batchId);

    return NextResponse.json({
      success: true,
      month_year,
      stats: result,
      payout_batch_id: batchId,
      message: 'Commission run completed successfully. Payout batch created and pending review.',
    });
  } catch (error: any) {
    console.error('Commission run error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
