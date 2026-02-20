import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PolicyPingDashboard from '@/components/apps/PolicyPingDashboard';

export const metadata = {
  title: 'PolicyPing — Retention Tracking | Apex Affinity Group',
};

export default async function PolicyPingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <PolicyPingDashboard />;
}
