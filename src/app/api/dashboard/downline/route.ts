import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface Member {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  enroller_id: string | null;
  tech_rank: string | null;
  personal_credits_monthly: number;
  team_credits_monthly: number;
  override_qualified: boolean;
  created_at: string;
}

interface MemberNode extends Member {
  level: number;
  children: MemberNode[];
}

/**
 * GET /api/dashboard/downline
 *
 * Returns the user's entire downline tree (all levels)
 * Includes hierarchical structure with levels
 * Requires RLS policies to be in place for downline access
 */
export async function GET() {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's member record
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('member_id, first_name, last_name, email')
      .eq('distributor_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member record not found' },
        { status: 404 }
      );
    }

    // Get all members (RLS will filter to user's downline automatically)
    const { data: allMembers, error: membersError } = await supabase
      .from('members')
      .select(`
        member_id,
        first_name,
        last_name,
        email,
        enroller_id,
        tech_rank,
        personal_credits_monthly,
        team_credits_monthly,
        override_qualified,
        created_at
      `);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json(
        { error: 'Failed to fetch downline data' },
        { status: 500 }
      );
    }

    // Build hierarchical tree structure
    const buildTree = (enrollerId: string | null, level: number = 1): MemberNode[] => {
      if (!allMembers) return [];

      return allMembers
        .filter(m => m.enroller_id === enrollerId)
        .map(m => ({
          ...m,
          level,
          children: buildTree(m.member_id, level + 1),
        }))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    };

    const downlineTree = buildTree(member.member_id, 1);

    // Calculate comprehensive stats
    const calculateStats = (nodes: MemberNode[]): any => {
      let totalMembers = 0;
      let levelCounts: Record<number, number> = {};
      let totalPersonalCredits = 0;
      let totalTeamCredits = 0;
      let overrideQualified = 0;

      const traverse = (node: MemberNode) => {
        totalMembers++;
        levelCounts[node.level] = (levelCounts[node.level] || 0) + 1;
        totalPersonalCredits += node.personal_credits_monthly || 0;
        totalTeamCredits += node.team_credits_monthly || 0;
        if (node.override_qualified) overrideQualified++;

        node.children.forEach(traverse);
      };

      nodes.forEach(traverse);

      return {
        total_members: totalMembers,
        by_level: levelCounts,
        max_depth: Math.max(...Object.keys(levelCounts).map(Number), 0),
        total_personal_credits: totalPersonalCredits,
        total_team_credits: totalTeamCredits,
        override_qualified_count: overrideQualified,
      };
    };

    const stats = calculateStats(downlineTree);

    // Flatten tree for easier display (optional)
    const flattenTree = (nodes: MemberNode[]): Member[] => {
      const result: Member[] = [];
      const traverse = (node: MemberNode) => {
        const { children, level, ...memberData } = node;
        result.push(memberData);
        children.forEach(traverse);
      };
      nodes.forEach(traverse);
      return result;
    };

    const flatDownline = flattenTree(downlineTree);

    return NextResponse.json({
      success: true,
      member: {
        member_id: member.member_id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
      },
      downline: {
        tree: downlineTree,        // Hierarchical structure
        flat: flatDownline,         // Flat list
      },
      stats,
    });

  } catch (error) {
    console.error('Error in /api/dashboard/downline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
