// =============================================
// Team Page
// View direct referrals and team statistics
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';
import PersonalTeam from '@/components/dashboard/PersonalTeam';

export const metadata = {
  title: 'My Team - Apex Affinity Group',
  description: 'View your team members',
};

export default async function TeamPage() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  const dist = distributor as Distributor;

  // Get direct referrals
  const { data: directReferrals } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('sponsor_id', dist.id)
    .order('created_at', { ascending: false });

  const referrals = (directReferrals || []) as Distributor[];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
        <p className="text-sm text-gray-600 mt-1">
          People you&apos;ve personally referred to Apex Affinity Group
        </p>
      </div>

      <PersonalTeam recruits={referrals} />
    </div>
  );
}
