// =============================================
// Team Page - Rebuild with Card-Based Layout
// View L1 direct enrollees with stats dashboard
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';
import TeamStatsHeader from '@/components/team/TeamStatsHeader';
import TeamMemberCard, { type TeamMemberData } from '@/components/team/TeamMemberCard';
import TeamWithModal from '@/components/team/TeamWithModal';

export const metadata = {
  title: 'My Team - Apex Affinity Group',
  description: 'View your team members and team statistics',
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

  // Get distributor with member record
  const serviceClient = createServiceClient();
  const { data: distributor, error: distError } = await serviceClient
    .from('distributors')
    .select(
      `
      *,
      member:members!members_distributor_id_fkey (
        member_id,
        tech_rank,
        personal_credits_monthly,
        team_credits_monthly
      )
    `
    )
    .eq('auth_user_id', user.id)
    .single();

  // If no distributor record, check if they're an admin
  if (distError || !distributor) {
    const adminUser = await getAdminUser();

    // If they're an admin, redirect to admin dashboard
    if (adminUser) {
      redirect('/admin');
    }

    // Otherwise, they need to complete signup
    redirect('/signup');
  }

  // If no member record exists yet, show empty state
  if (!distributor.member) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">My Team</h1>
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">Member record not found. Please contact support.</p>
        </div>
      </div>
    );
  }

  const currentDistributorId = distributor.id;

  // Debug logging
  console.log('[Team Page] Current distributor ID:', currentDistributorId);

  // Get all L1 direct enrollees from ENROLLMENT TREE (distributors.sponsor_id)
  // CRITICAL: Use distributors.sponsor_id NOT members.enroller_id!
  const { data: teamDistributors, error: teamError } = await serviceClient
    .from('distributors')
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      slug,
      rep_number,
      created_at,
      member:members!members_distributor_id_fkey (
        member_id,
        tech_rank,
        personal_credits_monthly,
        enrollment_date,
        override_qualified
      )
    `
    )
    .eq('sponsor_id', currentDistributorId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  console.log('[Team Page] Team distributors query result:', teamDistributors);
  console.log('[Team Page] Team distributors count:', teamDistributors?.length || 0);
  console.log('[Team Page] Team query error:', teamError);

  if (teamError) {
    console.error('[Team Page] Error fetching team distributors:', teamError);
  }

  const teamMembers = teamDistributors || [];

  // Get personal enrollee counts for each team member
  const membersWithStats: TeamMemberData[] = await Promise.all(
    teamMembers.map(async (dist) => {
      // Count how many people this distributor has personally enrolled (from enrollment tree)
      const { count } = await serviceClient
        .from('distributors')
        .select('*', { count: 'exact', head: true })
        .eq('sponsor_id', dist.id)
        .eq('status', 'active');

      // Extract member data (handle array vs object)
      const memberData = Array.isArray(dist.member) ? dist.member[0] : dist.member;

      return {
        memberId: memberData?.member_id || null,
        distributorId: dist.id,
        fullName: `${dist.first_name} ${dist.last_name}`,
        email: dist.email,
        slug: dist?.slug || '',
        repNumber: dist?.rep_number || null,
        slug: dist.slug,
        repNumber: dist.rep_number,
        techRank: memberData?.tech_rank || null,
        personalCreditsMonthly: memberData?.personal_credits_monthly || 0,
        personalEnrolleeCount: count || 0,
        enrollmentDate: memberData?.enrollment_date || dist.created_at,
        isActive: (memberData?.personal_credits_monthly || 0) >= 50,
        overrideQualified: memberData?.override_qualified || false,
      };
    })
  );

  // Calculate stats for header
  const totalPersonalEnrollees = membersWithStats.length;
  const activeThisMonth = membersWithStats.filter((m) => m.isActive).length;
  const totalTeamCredits = membersWithStats.reduce((sum, m) => sum + m.personalCreditsMonthly, 0);

  // Get L1 override earnings for this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: l1Overrides } = await serviceClient
    .from('earnings_ledger')
    .select('amount_usd')
    .eq('member_id', currentMemberId)
    .eq('earning_type', 'override')
    .eq('override_level', 1)
    .gte('created_at', startOfMonth.toISOString());

  const l1OverrideEarnings = l1Overrides
    ? l1Overrides.reduce((sum, earning) => sum + (earning.amount_usd || 0), 0)
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">My Team</h1>
        <p className="text-slate-600 mt-1">
          Your Level 1 direct enrollees and team performance
        </p>
      </div>

      {/* Stats Header */}
      <TeamStatsHeader
        totalPersonalEnrollees={totalPersonalEnrollees}
        activeThisMonth={activeThisMonth}
        totalTeamCredits={totalTeamCredits}
        l1OverrideEarnings={l1OverrideEarnings}
      />

      {/* Team Members Section */}
      <div className="team-list bg-white border border-slate-200 rounded-lg p-6 shadow-sm" data-testid="team-list">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
          <p className="text-sm text-slate-600 mt-1">
            {membersWithStats.length} direct enrollee{membersWithStats.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters Component (client-side) */}
        <TeamWithModal members={membersWithStats} />
      </div>
    </div>
  );
}
