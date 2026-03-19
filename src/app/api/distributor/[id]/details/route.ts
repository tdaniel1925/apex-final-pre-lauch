import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/distributor/[id]/details
 *
 * Returns comprehensive details for a specific distributor
 * Used in the distributor details modal
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: distributorId } = await params;

    // Get distributor details with member data
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select(`
        id,
        first_name,
        last_name,
        email,
        slug,
        rep_number,
        status,
        matrix_depth,
        matrix_position,
        matrix_parent_id,
        sponsor_id,
        created_at,
        member:members!members_distributor_id_fkey (
          member_id,
          tech_rank,
          personal_credits_monthly,
          team_credits_monthly,
          override_qualified
        )
      `)
      .eq('id', distributorId)
      .single();

    if (distError || !distributor) {
      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Get sponsor info
    let sponsor = null;
    if (distributor.sponsor_id) {
      const { data: sponsorData } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, slug, rep_number')
        .eq('id', distributor.sponsor_id)
        .single();

      if (sponsorData) {
        sponsor = {
          id: sponsorData.id,
          name: `${sponsorData.first_name} ${sponsorData.last_name}`,
          slug: sponsorData.slug,
          rep_number: sponsorData.rep_number,
        };
      }
    }

    // Get matrix parent info
    let matrixParent = null;
    if (distributor.matrix_parent_id) {
      const { data: parentData } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, slug, rep_number, matrix_depth')
        .eq('id', distributor.matrix_parent_id)
        .single();

      if (parentData) {
        matrixParent = {
          id: parentData.id,
          name: `${parentData.first_name} ${parentData.last_name}`,
          slug: parentData.slug,
          rep_number: parentData.rep_number,
          matrix_depth: parentData.matrix_depth,
        };
      }
    }

    // Get matrix children count
    const { data: matrixChildren } = await supabase
      .from('distributors')
      .select('id')
      .eq('matrix_parent_id', distributorId);

    // Get L1 enrollees count (if member exists)
    let l1Count = 0;
    let totalDownlineCount = 0;

    if (distributor.member && distributor.member[0]) {
      const memberId = distributor.member[0].member_id;

      // L1 direct enrollees
      const { data: l1Enrollees } = await supabase
        .from('members')
        .select('member_id')
        .eq('enroller_id', memberId);

      l1Count = l1Enrollees?.length || 0;

      // Total downline (recursive)
      const { data: allMembers } = await supabase
        .from('members')
        .select('member_id, enroller_id');

      if (allMembers) {
        const getDownlineCount = (enrollerId: string): number => {
          let count = 0;
          const queue = [enrollerId];
          const visited = new Set<string>();

          while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);

            const children = allMembers.filter(m => m.enroller_id === currentId);
            count += children.length;
            children.forEach(child => queue.push(child.member_id));
          }

          return count;
        };

        totalDownlineCount = getDownlineCount(memberId);
      }
    }

    // Build response
    const response = {
      success: true,
      distributor: {
        id: distributor.id,
        first_name: distributor.first_name,
        last_name: distributor.last_name,
        full_name: `${distributor.first_name} ${distributor.last_name}`,
        email: distributor.email,
        slug: distributor.slug,
        rep_number: distributor.rep_number,
        status: distributor.status,
        created_at: distributor.created_at,
      },
      matrix: {
        depth: distributor.matrix_depth,
        position: distributor.matrix_position,
        parent: matrixParent,
        children_count: matrixChildren?.length || 0,
      },
      sponsor,
      member: distributor.member && distributor.member[0] ? {
        tech_rank: distributor.member[0].tech_rank,
        personal_credits_monthly: distributor.member[0].personal_credits_monthly,
        team_credits_monthly: distributor.member[0].team_credits_monthly,
        override_qualified: distributor.member[0].override_qualified,
      } : null,
      team: {
        l1_count: l1Count,
        total_downline: totalDownlineCount,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in /api/distributor/[id]/details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
