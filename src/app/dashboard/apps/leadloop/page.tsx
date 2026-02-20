import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LeadLoopBoard from '@/components/apps/LeadLoopBoard';

export const metadata = {
  title: 'LeadLoop — Pipeline | Apex Affinity Group',
};

export default async function LeadLoopPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <LeadLoopBoard />;
}
