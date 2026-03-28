import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get distributor
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
  }

  // Check if journey exists
  const { data: journey, error: journeyError } = await supabase
    .from('onboarding_journey')
    .select('*')
    .eq('distributor_id', distributor.id)
    .single();

  // Get steps
  const { data: steps } = await supabase
    .from('journey_steps')
    .select('*')
    .eq('distributor_id', distributor.id)
    .order('step_number', { ascending: true });

  return NextResponse.json({
    distributor: {
      id: distributor.id,
      name: `${distributor.first_name} ${distributor.last_name}`,
    },
    journeyExists: !!journey,
    journeyError: journeyError?.message || null,
    journey: journey || null,
    stepsCount: steps?.length || 0,
    steps: steps || [],
  });
}
