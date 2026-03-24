import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RaceTo100ModalClient from '@/components/race-to-100/RaceTo100ModalClient';

export const metadata = {
  title: 'Race to 100 | Apex Affinity Group',
  description: 'Your gamified journey to your first sale',
};

export default async function RaceTo100Page() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get distributor info
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/dashboard');
  }

  // Fetch journey progress
  const { data: journeyProgress } = await supabase
    .from('onboarding_journey')
    .select('*')
    .eq('distributor_id', distributor.id)
    .single();

  // Fetch journey steps
  const { data: journeySteps } = await supabase
    .from('journey_steps')
    .select('*')
    .eq('distributor_id', distributor.id)
    .order('step_number', { ascending: true });

  // If journey doesn't exist, initialize it
  if (!journeyProgress) {
    await supabase.rpc('initialize_journey', {
      dist_id: distributor.id,
    });

    // Refetch after initialization
    const { data: newProgress } = await supabase
      .from('onboarding_journey')
      .select('*')
      .eq('distributor_id', distributor.id)
      .single();

    const { data: newSteps } = await supabase
      .from('journey_steps')
      .select('*')
      .eq('distributor_id', distributor.id)
      .order('step_number', { ascending: true });

    return (
      <div className="min-h-screen bg-slate-100">
        <RaceTo100ModalClient
          distributor={distributor}
          journeyProgress={newProgress || null}
          journeySteps={newSteps || []}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <RaceTo100ModalClient
        distributor={distributor}
        journeyProgress={journeyProgress}
        journeySteps={journeySteps || []}
      />
    </div>
  );
}
