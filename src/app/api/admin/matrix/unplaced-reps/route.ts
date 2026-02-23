// =============================================
// Get Unplaced Reps API
// Returns distributors not yet placed in matrix
// =============================================

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';

export async function GET() {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Get all distributors that don't have a matrix parent
    // (excluding the master account who is the root)
    const { data: unplacedReps, error } = await serviceClient
      .from('distributors')
      .select('*')
      .is('matrix_parent_id', null)
      .eq('is_master', false)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unplaced reps:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch unplaced reps' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reps: unplacedReps || [],
    });
  } catch (error) {
    console.error('Error in unplaced-reps API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
