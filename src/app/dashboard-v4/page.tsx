// =============================================
// Dashboard V4 - Shadcn/ui Modern Design
// Professional SaaS-style dashboard
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';
import { getEnrolleeStats } from '@/lib/enrollees/enrollee-counter';
import DashboardClient from '@/components/dashboard/DashboardClient';
import Road500Banner from '@/components/dashboard/Road500Banner';
import DashboardV4Client from '@/components/dashboard/DashboardV4Client';

export const metadata = {
  title: 'Dashboard - Apex Affinity Group',
  description: 'Modern distributor dashboard',
};

export const revalidate = 60;

export default async function DashboardV4Page() {
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

  const [parentData, sponsorData, directReferrals, matrixChildrenData, enrolleeStats, recentActivity] = await Promise.all([
    dist.matrix_parent_id
      ? serviceClient
          .from('distributors')
          .select('first_name, last_name, slug')
          .eq('id', dist.matrix_parent_id)
          .single()
      : Promise.resolve({ data: null }),

    dist.sponsor_id
      ? serviceClient
          .from('distributors')
          .select('first_name, last_name, slug')
          .eq('id', dist.sponsor_id)
          .single()
      : Promise.resolve({ data: null }),

    serviceClient
      .from('distributors')
      .select('id, first_name, last_name, created_at, licensing_status, matrix_depth')
      .eq('sponsor_id', dist.id)
      .order('created_at', { ascending: false })
      .limit(10),

    serviceClient
      .from('distributors')
      .select('id, first_name, last_name, created_at, licensing_status, matrix_position')
      .eq('matrix_parent_id', dist.id)
      .order('matrix_position', { ascending: true }),

    getEnrolleeStats(dist.id),

    serviceClient
      .from('distributors')
      .select('first_name, last_name, created_at')
      .eq('sponsor_id', dist.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const parentName = parentData.data
    ? `${parentData.data.first_name} ${parentData.data.last_name}`
    : 'Master';

  const sponsorName = sponsorData.data
    ? `${sponsorData.data.first_name} ${sponsorData.data.last_name}`
    : 'None';

  const recruits = (directReferrals.data || []) as Distributor[];
  const matrixChildren = (matrixChildrenData.data || []) as Distributor[];
  const recentMembers = (recentActivity.data || []) as Array<{first_name: string; last_name: string; created_at: string}>;

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050'}/${dist.slug}`;

  const dashboardData = {
    distributor: dist,
    stats: {
      repNumber: dist.rep_number || 0,
      level: dist.matrix_depth,
      personalEnrollees: enrolleeStats.personalEnrollees || 0,
      organizationEnrollees: enrolleeStats.organizationEnrollees || 0,
      matrixChildren: matrixChildren.length,
      directReferrals: recruits.length,
    },
    placement: {
      matrixParent: parentName,
      sponsor: sponsorName,
    },
    referralLink,
    recentMembers,
    recruits,
    matrixChildren,
  };

  return (
    <DashboardClient distributor={dist}>
      <Road500Banner />
      <DashboardV4Client data={dashboardData} />
    </DashboardClient>
  );
}
