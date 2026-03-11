// =============================================
// Genealogy V4 - Shadcn/ui Modern Design
// Professional genealogy tree with shadcn components
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';
import DashboardClient from '@/components/dashboard/DashboardClient';
import Road500Banner from '@/components/dashboard/Road500Banner';
import GenealogyV4Client from '@/components/dashboard/GenealogyV4Client';

export const metadata = {
  title: 'Genealogy - Apex Affinity Group',
  description: 'Sponsor-based downline tree',
};

export const revalidate = 60;

export default async function GenealogyV4Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const serviceClient = createServiceClient();
  const { data: distributor, error } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (error || !distributor) redirect('/signup');

  const dist = distributor as Distributor;

  // Get direct referrals (sponsor children)
  const { data: directReferrals } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, matrix_depth, created_at, licensing_status, rep_number')
    .eq('sponsor_id', dist.id)
    .order('created_at', { ascending: false });

  const genealogyData = {
    distributor: dist,
    directReferrals: (directReferrals || []) as Distributor[],
  };

  return (
    <DashboardClient distributor={dist}>
      <Road500Banner />
      <GenealogyV4Client data={genealogyData} />
    </DashboardClient>
  );
}
