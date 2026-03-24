import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { distributorId, stepsCompleted } = await request.json();

    // Verify user owns this distributor
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id')
      .eq('id', distributorId)
      .eq('auth_user_id', user.id)
      .single();

    if (!distributor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Upsert progress
    const { data, error } = await supabase
      .from('first_48_progress')
      .upsert(
        {
          distributor_id: distributorId,
          steps_completed: stepsCompleted,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'distributor_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating progress:', error);
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, progress: data });
  } catch (error) {
    console.error('Error in POST /api/first-48-hours/update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
