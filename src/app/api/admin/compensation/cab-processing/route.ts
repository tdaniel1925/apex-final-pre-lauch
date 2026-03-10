// API Endpoint: CAB Daily Processing
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { processCABTransitions } from '@/lib/compensation/cab-state-machine';

/**
 * Daily CAB Processing Job
 *
 * This endpoint should be called daily (via cron job) to:
 * 1. Check all PENDING CABs that reached day 60 → transition to EARNED
 * 2. Check subscriptions with expired recovery deadlines → VOID CABs
 *
 * POST /api/admin/compensation/cab-processing
 */
export async function POST(request: NextRequest) {
  try {
    const db = createServiceClient();

    // Process all CAB transitions
    const result = await processCABTransitions(db);

    return NextResponse.json({
      success: true,
      cabs_earned: result.earned,
      cabs_voided: result.voided,
      total_processed: result.earned + result.voided,
    });
  } catch (error: any) {
    console.error('CAB processing error:', error);
    return NextResponse.json(
      { error: error.message || 'CAB processing failed' },
      { status: 500 }
    );
  }
}

// GET: Retrieve CAB statistics
export async function GET(request: NextRequest) {
  try {
    const db = createServiceClient();

    // Count CABs by state
    const { data: pending } = await db
      .from('cab_records')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'PENDING');

    const { data: earned } = await db
      .from('cab_records')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'EARNED');

    const { data: voided } = await db
      .from('cab_records')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VOIDED');

    const { data: clawback } = await db
      .from('cab_records')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'CLAWBACK');

    // Calculate pending CABs approaching day 60
    const today = new Date();
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);

    const { data: approaching } = await db
      .from('cab_records')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'PENDING')
      .gte('release_eligible_date', today.toISOString())
      .lte('release_eligible_date', in30Days.toISOString());

    return NextResponse.json({
      success: true,
      stats: {
        pending: pending || 0,
        earned: earned || 0,
        voided: voided || 0,
        clawback: clawback || 0,
        approaching_release: approaching || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching CAB stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch CAB stats' },
      { status: 500 }
    );
  }
}
