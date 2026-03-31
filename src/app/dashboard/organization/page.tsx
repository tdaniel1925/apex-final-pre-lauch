// =============================================
// Organization Tree View - Simple Tree for All Users
// Shows enrollment tree (sponsor_id) in a simple hierarchy
// Available to FREE and Business Center users
// =============================================

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { Users, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Organization | Apex Affinity Group',
  description: 'View your team organization',
};

// Fetch team members recursively
async function getTeamTree(distributorId: string, depth: number = 0, maxDepth: number = 5): Promise<any[]> {
  if (depth >= maxDepth) return [];

  const supabase = await createClient();

  // Get direct recruits (using sponsor_id for enrollment tree)
  const { data: members } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      created_at,
      member:members!members_distributor_id_fkey (
        tech_rank,
        personal_qv_monthly,
        team_qv_monthly
      )
    `)
    .eq('sponsor_id', distributorId)
    .order('created_at', { ascending: true });

  if (!members || members.length === 0) return [];

  // Recursively get children for each member
  const teamWithChildren = await Promise.all(
    members.map(async (member) => {
      const children = await getTeamTree(member.id, depth + 1, maxDepth);
      return {
        ...member,
        children,
        depth,
      };
    })
  );

  return teamWithChildren;
}

export default async function OrganizationPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Get current user's member data
  const supabase = await createClient();
  const { data: currentMember } = await supabase
    .from('members')
    .select('tech_rank, personal_qv_monthly, team_qv_monthly')
    .eq('distributor_id', currentUser.id)
    .single();

  // Get team tree
  const teamTree = await getTeamTree(currentUser.id);

  // Count total team members (recursive)
  function countMembers(tree: any[]): number {
    return tree.reduce((sum, member) => {
      return sum + 1 + countMembers(member.children || []);
    }, 0);
  }

  const totalTeamSize = countMembers(teamTree);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Organization</h1>
          <p className="text-slate-600">View your team structure and growth</p>
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
            <div className="text-2xl font-bold text-slate-900">{totalTeamSize}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-600 mb-1">Personal QV</div>
            <div className="text-2xl font-bold text-slate-900">
              {currentMember?.personal_qv_monthly || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-600 mb-1">Team QV</div>
            <div className="text-2xl font-bold text-slate-900">
              {currentMember?.team_qv_monthly || 0}
            </div>
          </div>
        </div>

        {/* Tree View */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Team (Enrollment Tree)
          </h2>

          {teamTree.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No team members yet</h3>
              <p className="text-slate-600">
                Start recruiting to build your organization
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <TreeNode
                member={{
                  id: currentUser.id,
                  first_name: currentUser.first_name || 'You',
                  last_name: currentUser.last_name || '',
                  member: [currentMember],
                  children: teamTree,
                  depth: -1,
                }}
                isRoot
              />
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">About This View</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• This shows your <strong>enrollment tree</strong> (people you personally recruited)</li>
            <li>• Limited to 5 levels deep for performance</li>
            <li>
              • For advanced genealogy with analytics, upgrade to{' '}
              <a href="/dashboard/genealogy" className="underline font-medium">
                Business Center
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Tree Node Component
function TreeNode({ member, isRoot = false }: { member: any; isRoot?: boolean }) {
  const memberData = Array.isArray(member.member) ? member.member[0] : member.member;
  const hasChildren = member.children && member.children.length > 0;
  const indent = member.depth >= 0 ? member.depth * 24 : 0;

  return (
    <div>
      <div
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          isRoot
            ? 'bg-blue-100 border-2 border-blue-300'
            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
        }`}
        style={{ marginLeft: `${indent}px` }}
      >
        {/* Connector */}
        {!isRoot && (
          <div className="flex items-center">
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        )}

        {/* Member Info */}
        <div className="flex-1">
          <div className="font-medium text-slate-900">
            {member.first_name} {member.last_name}
            {isRoot && <span className="ml-2 text-sm text-blue-600">(You)</span>}
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
            <span className="capitalize">
              Rank: <strong>{memberData?.tech_rank || 'Starter'}</strong>
            </span>
            <span>
              QV: <strong>{memberData?.personal_qv_monthly || 0}</strong>
            </span>
            {hasChildren && (
              <span className="text-blue-600">
                {member.children.length} direct recruit{member.children.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Member Count Badge */}
        {hasChildren && (
          <div className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold">
            {member.children.length}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && (
        <div className="mt-2 space-y-2">
          {member.children.map((child: any) => (
            <TreeNode key={child.id} member={child} />
          ))}
        </div>
      )}
    </div>
  );
}
