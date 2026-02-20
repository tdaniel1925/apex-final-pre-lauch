import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PulseFollowDemo from '@/components/apps/PulseFollowDemo';

export const metadata = {
  title: 'PulseFollow — AI Follow-Up | Apex Affinity Group',
};

export default async function PulseFollowPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <PulseFollowDemo />;
}
