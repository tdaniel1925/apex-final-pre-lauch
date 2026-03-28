// =============================================
// Dashboard V3 - SmartViz Template Style
// Uses real distributor data with modern design
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';
import { getEnrolleeStats } from '@/lib/enrollees/enrollee-counter';
import DashboardClient from '@/components/dashboard/DashboardClient';
import Road500Banner from '@/components/dashboard/Road500Banner';
import DashboardV3Client from '@/components/dashboard/DashboardV3Client';

export const metadata = {
  title: 'Dashboard V3 - Apex Affinity Group',
  description: 'Modern distributor dashboard',
};

// Enable caching for 60 seconds
export const revalidate = 60;

export default async function DashboardV3Page() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor data (use service client to bypass RLS)
  const serviceClient = createServiceClient();

  // Fetch distributor first
  const { data: distributor, error } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (error || !distributor) {
    console.error('Error loading distributor:', error);
    redirect('/signup');
  }

  const dist = distributor as Distributor;

  // Run all queries in parallel
  const [parentData, sponsorData, directReferrals, matrixChildrenData, enrolleeStats, recentActivity] = await Promise.all([
    // Get matrix parent info
    dist.matrix_parent_id
      ? serviceClient
          .from('distributors')
          .select('first_name, last_name, slug')
          .eq('id', dist.matrix_parent_id)
          .single()
      : Promise.resolve({ data: null }),

    // Get sponsor info
    dist.sponsor_id
      ? serviceClient
          .from('distributors')
          .select('first_name, last_name, slug')
          .eq('id', dist.sponsor_id)
          .single()
      : Promise.resolve({ data: null }),

    // Get direct referrals
    serviceClient
      .from('distributors')
      .select('id, first_name, last_name, created_at, licensing_status, matrix_depth')
      .eq('sponsor_id', dist.id)
      .order('created_at', { ascending: false })
      .limit(10),

    // Get matrix children (ALLOWED: Matrix visualization uses matrix_parent_id)
    // This is correct - showing 5×7 forced matrix structure, not enrollment tree
    serviceClient
      .from('distributors')
      .select('id, first_name, last_name, created_at, licensing_status, matrix_position')
      .eq('matrix_parent_id', dist.id)
      .order('matrix_position', { ascending: true }),

    // Get enrollee statistics
    getEnrolleeStats(dist.id),

    // Get recent activity (last 5 direct referrals)
    serviceClient
      .from('distributors')
      .select('first_name, last_name, created_at')
      .eq('sponsor_id', dist.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Process data
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
      <DashboardV3Client data={dashboardData} />
    </DashboardClient>
  );
}
