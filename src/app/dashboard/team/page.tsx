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

  const currentMemberId = distributor.member.member_id;

  // Get all L1 direct enrollees
  const { data: teamMembers, error: teamError } = await serviceClient
    .from('members')
    .select(
      `
      member_id,
      distributor_id,
      full_name,
      email,
      tech_rank,
      personal_credits_monthly,
      enrollment_date,
      override_qualified,
      distributor:distributors!members_distributor_id_fkey (
        id,
        slug,
        rep_number
      )
    `
    )
    .eq('enroller_id', currentMemberId)
    .order('enrollment_date', { ascending: false });

  if (teamError) {
    // Error logged, continue with empty array
  }

  const members = teamMembers || [];

  // Get personal enrollee counts for each member
  const membersWithStats: TeamMemberData[] = await Promise.all(
    members.map(async (member) => {
      // Count how many people this member has personally enrolled
      const { count } = await serviceClient
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('enroller_id', member.member_id);

      // Supabase may return distributor as array or object depending on query
      const distArray = member.distributor as unknown as Array<{
        id: string;
        slug: string;
        rep_number: number;
      }>;
      const dist: { slug?: string; rep_number?: number | null } | undefined = Array.isArray(
        distArray
      )
        ? distArray[0]
        : (member.distributor as { slug?: string; rep_number?: number | null } | undefined);

      return {
        memberId: member.member_id,
        distributorId: member.distributor_id,
        fullName: member.full_name,
        email: member.email,
        slug: dist?.slug || '',
        repNumber: dist?.rep_number || null,
        techRank: member.tech_rank,
        personalCreditsMonthly: member.personal_credits_monthly,
        personalEnrolleeCount: count || 0,
        enrollmentDate: member.enrollment_date,
        isActive: member.personal_credits_monthly >= 50,
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
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
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
