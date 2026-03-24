import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { distributorId, stepNumber } = body;

    if (!distributorId || !stepNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    // Check if step already completed
    const { data: existingStep } = await supabase
      .from('journey_steps')
      .select('is_completed, points_earned')
      .eq('distributor_id', distributorId)
      .eq('step_number', stepNumber)
      .single();

    if (existingStep?.is_completed) {
      return NextResponse.json({
        success: true,
        message: 'Step already completed',
        alreadyCompleted: true,
      });
    }

    // Complete the step using the database function
    const { error: completeError } = await supabase.rpc('complete_journey_step', {
      dist_id: distributorId,
      step_num: stepNumber,
    });

    if (completeError) throw completeError;

    // Get updated journey progress
    const { data: journey } = await supabase
      .from('onboarding_journey')
      .select('total_points, is_completed')
      .eq('distributor_id', distributorId)
      .single();

    // Check for milestone achievements
    const { data: milestones } = await supabase.rpc('check_milestones', {
      dist_id: distributorId,
    });

    // Record any new milestones
    if (milestones && milestones.length > 0) {
      const milestoneInserts = milestones.map((m: any) => ({
        distributor_id: distributorId,
        milestone_type: m.milestone_type,
      }));

      await supabase.from('journey_milestones').insert(milestoneInserts);
    }

    return NextResponse.json({
      success: true,
      pointsEarned: existingStep?.points_earned || 0,
      totalPoints: journey?.total_points || 0,
      journeyComplete: journey?.is_completed || false,
      newMilestones: milestones || [],
    });
  } catch (error: any) {
    console.error('[Complete Step] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
