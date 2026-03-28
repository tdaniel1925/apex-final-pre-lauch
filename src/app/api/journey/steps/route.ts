import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get('distributorId');

    if (!distributorId) {
      return NextResponse.json(
        { success: false, error: 'Distributor ID required' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify distributor belongs to user
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id')
      .eq('id', distributorId)
      .eq('auth_user_id', user.id)
      .single();

    if (!distributor) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch steps
    const { data: steps, error: stepsError } = await supabase
      .from('journey_steps')
      .select('*')
      .eq('distributor_id', distributorId)
      .order('step_number', { ascending: true });

    if (stepsError) {
      return NextResponse.json(
        { success: false, error: stepsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      steps: steps || [],
    });
  } catch (error: any) {
    console.error('Journey steps error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
