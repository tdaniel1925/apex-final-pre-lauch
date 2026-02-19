// =============================================
// User Training Dashboard
// Browse and listen to training episodes
// =============================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TrainingDashboardClient from '@/components/training/TrainingDashboardClient';

export const metadata = {
  title: 'Sales Training — Apex Affinity Group',
};

export default async function TrainingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) redirect('/login');

  return <TrainingDashboardClient distributorId={distributor.id} firstName={distributor.first_name} />;
}
