import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get('distributorId');

    if (!distributorId) {
      return NextResponse.json(
        { success: false, error: 'Missing distributorId' },
        { status: 400 }
      );
    }

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id, first_name')
      .eq('id', distributorId)
      .eq('auth_user_id', user.id)
      .single();

    if (!distributor) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Get or create journey
    let { data: journey } = await supabase
      .from('onboarding_journey')
      .select('*')
      .eq('distributor_id', distributorId)
      .single();

    // If no journey exists, initialize it
    if (!journey) {
      const { error: initError } = await supabase.rpc('initialize_journey', {
        dist_id: distributorId,
      });

      if (initError) throw initError;

      // Fetch newly created journey
      const { data: newJourney } = await supabase
        .from('onboarding_journey')
        .select('*')
        .eq('distributor_id', distributorId)
        .single();

      journey = newJourney;
    }

    // Get all steps
    const { data: steps } = await supabase
      .from('journey_steps')
      .select('*')
      .eq('distributor_id', distributorId)
      .order('step_number', { ascending: true });

    // Get next uncompleted step
    const nextStep = steps?.find(s => !s.is_completed);

    return NextResponse.json({
      success: true,
      progress: {
        totalPoints: journey?.total_points || 0,
        currentStep: journey?.current_step || 1,
        nextStepName: nextStep?.step_name || 'All steps complete!',
        isCompleted: journey?.is_completed || false,
        steps: steps || [],
      },
    });
  } catch (error: any) {
    console.error('[Journey Progress] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
