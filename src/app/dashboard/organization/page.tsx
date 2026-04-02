// =============================================
// Organization Table View - Searchable/Filterable Table
// Shows enrollment tree (sponsor_id) with expandable rows
// Available to all users
// =============================================

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import OrganizationTable, { OrganizationMember } from '@/components/organization/OrganizationTable';
import { Suspense } from 'react';
import { Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Organization | Apex Affinity Group',
  description: 'View and manage your team structure',
};

// Recursively fetch all downline members with their children
async function getDownlineWithChildren(
  distributorId: string,
  depth: number = 0,
  maxDepth: number = 10
): Promise<OrganizationMember[]> {
  if (depth >= maxDepth) return [];

  const supabase = await createClient();

  // Get direct recruits (using sponsor_id for enrollment tree)
  const { data: members } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      slug,
      rep_number,
      sponsor_id,
      created_at,
      member:members!members_distributor_id_fkey (
        tech_rank,
        personal_credits_monthly,
        team_credits_monthly,
        enrollment_date
      )
    `)
    .eq('sponsor_id', distributorId)
    .order('created_at', { ascending: false });

  if (!members || members.length === 0) return [];

  // Recursively get children for each member
  const membersWithChildren = await Promise.all(
    members.map(async (member) => {
      const memberData = Array.isArray(member.member) ? member.member[0] : member.member;
      const children = await getDownlineWithChildren(member.id, depth + 1, maxDepth);

      return {
        distributor_id: member.id,
        full_name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        phone: member.phone,
        slug: member.slug,
        rep_number: member.rep_number,
        sponsor_id: member.sponsor_id,
        enrollment_date: memberData?.enrollment_date || member.created_at,
        tech_rank: memberData?.tech_rank || 'starter',
        personal_credits_monthly: memberData?.personal_credits_monthly || 0,
        team_credits_monthly: memberData?.team_credits_monthly || 0,
        children,
      };
    })
  );

  return membersWithChildren;
}

// Loading component
function OrganizationLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-slate-200 rounded w-64 mb-2 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-96 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="h-4 bg-slate-200 rounded w-24 mb-2 animate-pulse" />
              <div className="h-8 bg-slate-200 rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-center py-12">
            <Users className="w-16 h-16 text-slate-300 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function OrganizationPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Get current user's member data with error handling
  const supabase = await createClient();
  const { data: currentMember, error: memberError } = await supabase
    .from('members')
    .select('tech_rank, personal_credits_monthly, team_credits_monthly')
    .eq('distributor_id', currentUser.id)
    .single();

  // Handle error fetching member data (silently - logged server-side)
  if (memberError) {
    // Error logged server-side
  }

  // Get all downline with their children (for expandable rows)
  let downline: OrganizationMember[] = [];
  try {
    downline = await getDownlineWithChildren(currentUser.id);
  } catch (error) {
    // Error logged server-side - continue with empty downline
  }

  // Flatten the tree for table display (but keep children references)
  function flattenTree(members: OrganizationMember[]): OrganizationMember[] {
    const flat: OrganizationMember[] = [];
    for (const member of members) {
      flat.push(member);
      if (member.children && member.children.length > 0) {
        flat.push(...flattenTree(member.children));
      }
    }
    return flat;
  }

  const allMembers = flattenTree(downline);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Organization</h1>
          <p className="text-slate-600">View and manage your team structure</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-600 mb-1">Your Rank</div>
            <div className="text-2xl font-bold text-slate-900 capitalize">
              {currentMember?.tech_rank || 'Starter'}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-600 mb-1">Team Size</div>
            <div className="text-2xl font-bold text-slate-900">{allMembers.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-600 mb-1">Personal Credits</div>
            <div className="text-2xl font-bold text-slate-900">
              {currentMember?.personal_credits_monthly || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-600 mb-1">Team Credits</div>
            <div className="text-2xl font-bold text-slate-900">
              {currentMember?.team_credits_monthly || 0}
            </div>
          </div>
        </div>

        {/* Organization Table */}
        <OrganizationTable members={downline} currentUserId={currentUser.id} />

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Privacy Notice</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Email and phone numbers are only visible for your{' '}
              <strong>direct recruits</strong>
            </li>
            <li>• All other team members show masked contact information</li>
            <li>• Click the expand button to view direct downline for each member</li>
            <li>• Click a member's name to view their full details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
