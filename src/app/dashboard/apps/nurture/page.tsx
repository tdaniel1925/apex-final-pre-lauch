import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NurtureApp from '@/components/apps/NurtureApp';

export const metadata = {
  title: 'Nurture Campaigns | Apex Affinity Group',
};

export default async function NurturePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get agent's email for Reply-To display
  const { data: distributor } = await supabase
    .from('distributors')
    .select('email')
    .eq('auth_user_id', user.id)
    .single();

  const agentEmail = distributor?.email ?? user.email ?? 'theapex@theapexway.net';

  return <NurtureApp agentEmail={agentEmail} />;
}
