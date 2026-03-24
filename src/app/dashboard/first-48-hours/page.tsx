import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import First48HoursClient from '@/components/first-48-hours/First48HoursClient';

export const metadata = {
  title: 'Your First 48 Hours | Apex Affinity Group',
  description: 'Hit the ground running! Complete these 7 critical steps in your first 48 hours.',
};

export default async function First48HoursPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get distributor info
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, created_at')
    .eq('auth_user_id', user.id)
    .single();

  if (distError || !distributor) {
    redirect('/dashboard/home');
  }

  // Check if they're within 48 hours of signup
  const signupDate = new Date(distributor.created_at);
  const now = new Date();
  const hoursSinceSignup = (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60);
  const isWithin48Hours = hoursSinceSignup <= 48;
  const hoursRemaining = Math.max(0, Math.ceil(48 - hoursSinceSignup));

  // Get first 48 hours progress
  const { data: progress } = await supabase
    .from('first_48_progress')
    .select('*')
    .eq('distributor_id', distributor.id)
    .single();

  // If no progress exists, create it
  if (!progress) {
    const { data: newProgress } = await supabase
      .from('first_48_progress')
      .insert({
        distributor_id: distributor.id,
        steps_completed: [],
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    return (
      <First48HoursClient
        distributor={distributor}
        progress={newProgress || { steps_completed: [] }}
        isWithin48Hours={isWithin48Hours}
        hoursRemaining={hoursRemaining}
      />
    );
  }

  return (
    <First48HoursClient
      distributor={distributor}
      progress={progress}
      isWithin48Hours={isWithin48Hours}
      hoursRemaining={hoursRemaining}
    />
  );
}
