// =============================================
// User Genealogy Page - COMPENSATION FOCUSED
// Enrollment tree with member ranks and credits
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import CompensationTreeView from '@/components/genealogy/CompensationTreeView';
import type { MemberNode } from '@/components/genealogy/TreeNodeCard';

export const metadata = {
  title: 'My Genealogy - Apex Affinity Group',
  description: 'View your enrollment tree and organization',
};

interface PageProps {
  searchParams: Promise<{
    depth?: string;
  }>;
}

/**
 * Recursively builds enrollment tree from members table
 * Uses enroller_id to construct the tree hierarchy
 */
async function buildEnrollmentTree(
  enrollerId: string,
  depth: number = 0,
  maxDepth: number = 10
): Promise<MemberNode[]> {
  if (depth >= maxDepth) return [];

  const serviceClient = createServiceClient();

  // Fetch all direct enrollees
  const { data: directEnrollees, error } = await serviceClient
    .from('members')
    .select(`
      member_id,
      email,
      full_name,
      enroller_id,
      tech_rank,
      highest_tech_rank,
      personal_credits_monthly,
      team_credits_monthly,
      enrollment_date,
      status,
      distributor:distributors!members_distributor_id_fkey (
        id,
        first_name,
        last_name,
        slug,
        rep_number,
        profile_photo_url
      )
    `)
    .eq('enroller_id', enrollerId)
    .eq('status', 'active')
    .order('enrollment_date', { ascending: true });

  if (error || !directEnrollees) {
    // Log error but don't expose to client
    return [];
  }

  // Build nodes recursively
  const nodes: MemberNode[] = [];
  for (const member of directEnrollees) {
    // Recursively fetch children
    const children = await buildEnrollmentTree(
      member.member_id,
      depth + 1,
      maxDepth
    );

    // Type assertion for distributor (it's an array from Supabase join)
    const distributor = Array.isArray(member.distributor)
      ? member.distributor[0]
      : member.distributor;

    nodes.push({
      member_id: member.member_id,
      full_name: member.full_name,
      email: member.email,
      tech_rank: member.tech_rank,
      personal_credits_monthly: member.personal_credits_monthly || 0,
      team_credits_monthly: member.team_credits_monthly || 0,
      enrollment_date: member.enrollment_date,
      status: member.status,
      distributor: distributor || {
        id: '',
        first_name: '',
        last_name: '',
        slug: '',
        rep_number: null,
        profile_photo_url: null,
      },
      children,
      depth,
      hasChildren: children.length > 0,
    });
  }

  return nodes;
}

/**
 * Calculate total organization credits recursively
 */
function calculateTotalOrgCredits(tree: MemberNode[]): number {
  return tree.reduce((sum, node) => {
    return (
      sum +
      node.personal_credits_monthly +
      calculateTotalOrgCredits(node.children)
    );
  }, 0);
}

/**
 * Count total organization size
 */
function countTotalMembers(tree: MemberNode[]): number {
  return tree.reduce((count, node) => {
    return count + 1 + countTotalMembers(node.children);
  }, 0);
}

export default async function UserGenealogyPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get current user's distributor and member data
  const serviceClient = createServiceClient();
  const { data: userData, error: userError } = await serviceClient
    .from('distributors')
    .select(`
      *,
      member:members!distributors_id_fkey (
        member_id,
        full_name,
        tech_rank,
        highest_tech_rank,
        personal_credits_monthly,
        team_credits_monthly,
        enrollment_date
      )
    `)
    .eq('auth_user_id', user.id)
    .single();

  if (userError || !userData) {
    // User data fetch failed - redirect to signup
    redirect('/signup');
  }

  // Extract member data (handle potential array from join)
  const memberData = Array.isArray(userData.member)
    ? userData.member[0]
    : userData.member;

  if (!memberData) {
    // User is distributor but not yet a member (no compensation record)
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-900 mb-2">
            Member Record Not Found
          </h2>
          <p className="text-yellow-800">
            Your compensation member record has not been created yet. Please
            contact support.
          </p>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const maxDepth = parseInt(params.depth || '10');

  // Build enrollment tree starting from this member
  const enrollmentTree = await buildEnrollmentTree(
    memberData.member_id,
    0,
    maxDepth
  );

  // Calculate organization stats
  const totalOrgSize = countTotalMembers(enrollmentTree);
  const totalOrgCredits = calculateTotalOrgCredits(enrollmentTree);

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          My Genealogy Tree
        </h1>
        <p className="text-sm text-slate-600">
          Your enrollment organization - members you've personally enrolled and
          their downline
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-300 mb-1">Your Position</p>
            <h2 className="text-2xl font-bold">
              {userData.first_name} {userData.last_name}
            </h2>
            <p className="text-sm text-slate-300 mt-1">@{userData.slug}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium uppercase">
                {memberData.tech_rank}
              </span>
              <span className="text-sm text-slate-300">
                Rep #{userData.rep_number || 'N/A'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-300">Personal Production</p>
            <p className="text-3xl font-bold">
              {memberData.personal_credits_monthly}
            </p>
            <p className="text-xs text-slate-300 mt-1">credits/month</p>
          </div>
        </div>
      </div>

      {/* Organization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-slate-600 mb-1">Total Organization Size</p>
          <p className="text-2xl font-bold text-slate-900">{totalOrgSize}</p>
          <p className="text-xs text-slate-500 mt-1">members</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-slate-600 mb-1">Organization Credits</p>
          <p className="text-2xl font-bold text-blue-600">{totalOrgCredits}</p>
          <p className="text-xs text-slate-500 mt-1">credits this month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-slate-600 mb-1">Direct Enrollees</p>
          <p className="text-2xl font-bold text-purple-600">
            {enrollmentTree.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">personally sponsored</p>
        </div>
      </div>

      {/* Empty State */}
      {enrollmentTree.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4 text-slate-300">👥</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Enrollees Yet
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            You haven't enrolled any members yet. Share your referral link to
            start building your organization!
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Your Referral Link
          </a>
        </div>
      ) : (
        <>
          {/* Tree View */}
          <CompensationTreeView tree={enrollmentTree} maxInitialDepth={3} />

          {/* Depth Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-700 mb-3 font-medium">
              Tree Depth Settings
            </p>
            <div className="flex gap-2 flex-wrap">
              {[5, 10, 15, 20].map((depthOption) => (
                <a
                  key={depthOption}
                  href={`/dashboard/genealogy?depth=${depthOption}`}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    maxDepth === depthOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {depthOption} Levels
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Currently showing up to {maxDepth} levels deep
            </p>
          </div>
        </>
      )}
    </div>
  );
}
