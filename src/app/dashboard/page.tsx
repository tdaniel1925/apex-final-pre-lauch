// =============================================
// Dashboard Page
// Main distributor dashboard
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import ReferralLink from '@/components/dashboard/ReferralLink';
import TeamStatisticsUser from '@/components/dashboard/TeamStatisticsUser';
import type { Distributor } from '@/lib/types';

export const metadata = {
  title: 'Dashboard - Apex Affinity Group',
  description: 'Distributor dashboard',
};

export default async function DashboardPage() {
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

  // Get matrix parent info
  let parentName = 'Direct under Master';
  if (dist.matrix_parent_id) {
    const { data: parent } = await serviceClient
      .from('distributors')
      .select('first_name, last_name, slug')
      .eq('id', dist.matrix_parent_id)
      .single();

    if (parent) {
      parentName = `${parent.first_name} ${parent.last_name}`;
    }
  }

  // Get sponsor info
  let sponsorName = 'None';
  if (dist.sponsor_id) {
    const { data: sponsor } = await serviceClient
      .from('distributors')
      .select('first_name, last_name, slug')
      .eq('id', dist.sponsor_id)
      .single();

    if (sponsor) {
      sponsorName = `${sponsor.first_name} ${sponsor.last_name}`;
    }
  }

  // Get direct referrals (full data for statistics)
  const { data: directReferrals } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('sponsor_id', dist.id)
    .order('created_at', { ascending: false });

  const recruits = (directReferrals || []) as Distributor[];
  const referralCount = recruits.length;

  // Get matrix children (full data for statistics)
  const { data: matrixChildrenData } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('matrix_parent_id', dist.id)
    .order('matrix_position', { ascending: true });

  const matrixChildren = (matrixChildrenData || []) as Distributor[];
  const childrenCount = matrixChildren.length;

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050'}/signup?ref=${dist.slug}`;

  return (
    <div className="p-4">
      {/* Welcome Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {dist.first_name}!
        </h1>
        <p className="text-sm text-gray-600 mt-1">@{dist.slug}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column - Stats */}
        <div className="lg:col-span-2 space-y-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Matrix Position */}
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Matrix Position</p>
                  <p className="text-2xl font-bold text-[#2B4C7E]">
                    #{dist.matrix_position}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#2B4C7E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Level {dist.matrix_depth}</p>
            </div>

            {/* Direct Referrals */}
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Direct Referrals</p>
                  <p className="text-2xl font-bold text-[#2B4C7E]">{referralCount || 0}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">People you invited</p>
            </div>

            {/* Matrix Children */}
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Matrix Children</p>
                  <p className="text-2xl font-bold text-[#2B4C7E]">{childrenCount || 0}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Capacity: {childrenCount || 0}/5</p>
            </div>

            {/* Level */}
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Your Level</p>
                  <p className="text-2xl font-bold text-[#2B4C7E]">{dist.matrix_depth}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">of 7 levels deep</p>
            </div>
          </div>

          {/* Matrix Info Card */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Matrix Placement</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Matrix Parent</p>
                <p className="text-sm font-semibold text-gray-900">{parentName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Sponsor</p>
                <p className="text-sm font-semibold text-gray-900">{sponsorName}</p>
              </div>
            </div>
          </div>

          {/* Referral Link Card */}
          <ReferralLink referralLink={referralLink} />
        </div>

        {/* Right Column - Team Statistics */}
        <div>
          <TeamStatisticsUser recruits={recruits} matrixChildren={matrixChildren} />
        </div>
      </div>
    </div>
  );
}
