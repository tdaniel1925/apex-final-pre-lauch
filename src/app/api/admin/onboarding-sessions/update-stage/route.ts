import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const { session_id, fulfillment_stage } = await request.json();

    if (!session_id || !fulfillment_stage) {
      return NextResponse.json(
        { error: 'session_id and fulfillment_stage are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: distributor } = await supabase
      .from('distributors')
      .select('is_admin, is_master')
      .eq('user_id', user.id)
      .single();

    if (!distributor?.is_admin && !distributor?.is_master) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update fulfillment stage
    const { error } = await supabase
      .from('onboarding_sessions')
      .update({ fulfillment_stage })
      .eq('id', session_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating fulfillment stage:', error);
    return NextResponse.json(
      { error: 'Failed to update fulfillment stage' },
      { status: 500 }
    );
  }
}
