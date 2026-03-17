// =============================================
// Matrix Page - Rebuilt with Node-Based Flowchart
// Professional slate color scheme with level-based layout
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';
import MatrixWithModal from '@/components/matrix/MatrixWithModal';
import { calculateMatrixLevels, getMaxMatrixDepth } from '@/lib/matrix/level-calculator';
import type { MatrixNodeData } from '@/components/matrix/MatrixNodeCard';

export const metadata = {
  title: 'Matrix - Apex Affinity Group',
  description: 'View your matrix structure and team organization',
};

export default async function MatrixPage() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor with member data
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select(`
      *,
      member:members!members_distributor_id_fkey (
        member_id,
        personal_credits_monthly,
        tech_rank,
        override_qualified,
        team_credits_monthly
      )
    `)
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  const dist = distributor as Distributor & {
    member: {
      member_id: string;
      personal_credits_monthly: number;
      tech_rank: string;
      override_qualified: boolean;
      team_credits_monthly: number;
    } | null;
  };

  // If member record doesn't exist yet, show message
  if (!dist.member) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Matrix Not Available</h1>
            <p className="text-slate-400">
              Your member profile is being set up. Please check back shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get all downline members (anyone enrolled by this user or their downline)
  // We need to get ALL members first, then calculate levels recursively
  const { data: allMembers } = await serviceClient
    .from('members')
    .select(`
      member_id,
      full_name,
      enroller_id,
      tech_rank,
      personal_credits_monthly,
      override_qualified,
      distributor:distributors!members_distributor_id_fkey (
        id,
        rep_number,
        slug
      )
    `)
    .eq('status', 'active');

  // Calculate matrix levels
  const currentMemberId = dist.member.member_id;
  const members = allMembers || [];

  const levelMap = calculateMatrixLevels(
    currentMemberId,
    members as any[]
  );

  // Transform to MatrixNodeData format
  const nodesByLevel: Record<number, MatrixNodeData[]> = {};
  for (let level = 1; level <= 5; level++) {
    nodesByLevel[level] = (levelMap[level] || []).map((m: any) => ({
      member_id: m.member_id,
      distributor_id: m.distributor?.[0]?.id || '',
      full_name: m.full_name,
      rep_number: m.distributor?.[0]?.rep_number || null,
      tech_rank: m.tech_rank,
      personal_credits_monthly: m.personal_credits_monthly,
      override_qualified: m.override_qualified,
      slug: m.distributor?.[0]?.slug || null,
    }));
  }

  // Calculate totals
  const totalTeamSize = members.filter((m) => m.enroller_id === currentMemberId || levelMap[1]?.some((l1: any) => l1.member_id === m.member_id) || levelMap[2]?.some((l2: any) => l2.member_id === m.member_id) || levelMap[3]?.some((l3: any) => l3.member_id === m.member_id) || levelMap[4]?.some((l4: any) => l4.member_id === m.member_id) || levelMap[5]?.some((l5: any) => l5.member_id === m.member_id)).length;

  const activeMembers = members.filter((m) => {
    const isInDownline = m.enroller_id === currentMemberId ||
      levelMap[1]?.some((l1: any) => l1.member_id === m.member_id) ||
      levelMap[2]?.some((l2: any) => l2.member_id === m.member_id) ||
      levelMap[3]?.some((l3: any) => l3.member_id === m.member_id) ||
      levelMap[4]?.some((l4: any) => l4.member_id === m.member_id) ||
      levelMap[5]?.some((l5: any) => l5.member_id === m.member_id);
    return isInDownline && m.override_qualified;
  }).length;

  // Get override earnings this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: overrideEarnings } = await serviceClient
    .from('earnings_ledger')
    .select('amount_usd')
    .eq('member_id', currentMemberId)
    .eq('earning_type', 'override')
    .gte('created_at', startOfMonth.toISOString());

  const totalOverrideEarnings = (overrideEarnings || []).reduce(
    (sum, e) => sum + (e.amount_usd || 0),
    0
  );

  // Get max depth based on rank
  const maxRankDepth = getMaxMatrixDepth(dist.member.tech_rank);

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Matrix View</h1>
          <p className="text-slate-400">
            Your team organized by enrollment levels (1-{maxRankDepth} based on your {dist.member.tech_rank} rank)
          </p>
        </div>

        {/* Your Position Card */}
        <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
                <span className="text-white font-bold text-2xl">
                  {dist.first_name.charAt(0)}{dist.last_name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {dist.first_name} {dist.last_name}
                </h2>
                <p className="text-slate-400">Rep #{dist.rep_number || 'N/A'}</p>
              </div>
            </div>

            {/* Right: Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Current Rank */}
              <div className="bg-slate-900 rounded px-4 py-2">
                <p className="text-xs text-slate-400 mb-1">Tech Rank</p>
                <p className="text-lg font-bold text-white capitalize">
                  {dist.member.tech_rank}
                </p>
              </div>

              {/* Personal Credits */}
              <div className="bg-slate-900 rounded px-4 py-2">
                <p className="text-xs text-slate-400 mb-1">Personal Credits</p>
                <p className="text-lg font-bold text-white">
                  {dist.member.personal_credits_monthly}
                </p>
              </div>

              {/* Override Qualified */}
              <div className="bg-slate-900 rounded px-4 py-2">
                <p className="text-xs text-slate-400 mb-1">Override Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dist.member.override_qualified ? 'bg-green-500' : 'bg-slate-600'}`} />
                  <p className={`text-sm font-semibold ${dist.member.override_qualified ? 'text-green-400' : 'text-slate-500'}`}>
                    {dist.member.override_qualified ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {/* Team Credits */}
              <div className="bg-slate-900 rounded px-4 py-2">
                <p className="text-xs text-slate-400 mb-1">Team Credits</p>
                <p className="text-lg font-bold text-white">
                  {dist.member.team_credits_monthly}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Total Team Size</p>
            <p className="text-3xl font-bold text-white">{totalTeamSize}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Active Members</p>
            <p className="text-3xl font-bold text-green-400">{activeMembers}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Team Credits/Month</p>
            <p className="text-3xl font-bold text-white">{dist.member.team_credits_monthly}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Override Earnings (MTD)</p>
            <p className="text-3xl font-bold text-blue-400">
              ${totalOverrideEarnings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Matrix Levels */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Your Matrix Organization</h2>

          <MatrixWithModal
            nodesByLevel={nodesByLevel}
            maxRankDepth={maxRankDepth}
            totalTeamSize={totalTeamSize}
          />
        </div>

        {/* Help Text */}
        {totalTeamSize > 0 && (
          <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-slate-300">Tip:</span> Your matrix levels are based on the enrollment chain.
              Level 1 shows your direct enrollees, Level 2 shows their enrollees, and so on.
              Your current {dist.member.tech_rank} rank allows you to view up to {maxRankDepth} level{maxRankDepth > 1 ? 's' : ''}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
