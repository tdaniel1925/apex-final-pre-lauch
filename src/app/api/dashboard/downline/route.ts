import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface Distributor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  rep_number: string | null;
  sponsor_id: string | null;
  status: string;
  created_at: string;
  member?: {
    member_id: string;
    tech_rank: string | null;
    personal_credits_monthly: number;
    team_credits_monthly: number;
    override_qualified: boolean;
  } | null;
}

interface DistributorNode extends Distributor {
  level: number;
  children: DistributorNode[];
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
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's distributor record
    const { data: distributor, error: distributorError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email')
      .eq('auth_user_id', user.id)
      .single();

    if (distributorError || !distributor) {
      return NextResponse.json(
        { error: 'Distributor record not found' },
        { status: 404 }
      );
    }

    // Get all distributors with member data (SINGLE SOURCE OF TRUTH)
    const { data: allDistributors, error: distributorsError } = await supabase
      .from('distributors')
      .select(`
        id,
        first_name,
        last_name,
        email,
        slug,
        rep_number,
        sponsor_id,
        status,
        created_at,
        member:members!members_distributor_id_fkey (
          member_id,
          tech_rank,
          personal_credits_monthly,
          team_credits_monthly,
          override_qualified
        )
      `)
      .eq('status', 'active');

    if (distributorsError) {
      console.error('Error fetching distributors:', distributorsError);
      return NextResponse.json(
        { error: 'Failed to fetch downline data' },
        { status: 500 }
      );
    }

    // Normalize member data (handle array vs object)
    const normalizedDistributors = allDistributors?.map(d => ({
      ...d,
      member: Array.isArray(d.member) ? d.member[0] : d.member,
    }));

    // Build hierarchical tree structure using sponsor_id
    const buildTree = (sponsorId: string | null, level: number = 1): DistributorNode[] => {
      if (!normalizedDistributors) return [];

      return normalizedDistributors
        .filter(d => d.sponsor_id === sponsorId)
        .map(d => ({
          ...d,
          level,
          children: buildTree(d.id, level + 1),
        }))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    };

    const downlineTree = buildTree(distributor.id, 1);

    // Calculate comprehensive stats
    const calculateStats = (nodes: DistributorNode[]): any => {
      let totalMembers = 0;
      let levelCounts: Record<number, number> = {};
      let totalPersonalCredits = 0;
      let totalTeamCredits = 0;
      let overrideQualified = 0;

      const traverse = (node: DistributorNode) => {
        totalMembers++;
        levelCounts[node.level] = (levelCounts[node.level] || 0) + 1;
        totalPersonalCredits += node.member?.personal_credits_monthly || 0;
        totalTeamCredits += node.member?.team_credits_monthly || 0;
        if (node.member?.override_qualified) overrideQualified++;

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
    const flattenTree = (nodes: DistributorNode[]): Distributor[] => {
      const result: Distributor[] = [];
      const traverse = (node: DistributorNode) => {
        const { children, level, ...distributorData } = node;
        result.push(distributorData);
        children.forEach(traverse);
      };
      nodes.forEach(traverse);
      return result;
    };

    const flatDownline = flattenTree(downlineTree);

    return NextResponse.json({
      success: true,
      distributor: {
        id: distributor.id,
        first_name: distributor.first_name,
        last_name: distributor.last_name,
        email: distributor.email,
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
