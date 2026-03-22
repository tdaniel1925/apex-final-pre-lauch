import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/dashboard/team
 *
 * Returns the user's direct enrollees (L1 team members)
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

    // Get L1 direct enrollees from distributors table (SINGLE SOURCE OF TRUTH)
    const { data: enrollees, error: teamError } = await supabase
      .from('distributors')
      .select(`
        id,
        first_name,
        last_name,
        email,
        slug,
        rep_number,
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
      .eq('sponsor_id', distributor.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (teamError) {
      console.error('Error fetching team:', teamError);
      return NextResponse.json(
        { error: 'Failed to fetch team data' },
        { status: 500 }
      );
    }

    // Transform enrollees to include member data
    const team = enrollees?.map(e => {
      const memberData = Array.isArray(e.member) ? e.member[0] : e.member;
      return {
        distributor_id: e.id,
        first_name: e.first_name,
        last_name: e.last_name,
        email: e.email,
        slug: e.slug,
        rep_number: e.rep_number,
        status: e.status,
        created_at: e.created_at,
        member_id: memberData?.member_id || null,
        tech_rank: memberData?.tech_rank || null,
        personal_credits_monthly: memberData?.personal_credits_monthly || 0,
        team_credits_monthly: memberData?.team_credits_monthly || 0,
        override_qualified: memberData?.override_qualified || false,
      };
    }) || [];

    // Calculate team stats
    const stats = {
      total_members: team.length,
      active_members: team.filter(m => m.tech_rank !== null).length,
      total_personal_credits: team.reduce((sum, m) => sum + (m.personal_credits_monthly || 0), 0),
      total_team_credits: team.reduce((sum, m) => sum + (m.team_credits_monthly || 0), 0),
      override_qualified_count: team.filter(m => m.override_qualified).length,
    };

    return NextResponse.json({
      success: true,
      distributor: {
        id: distributor.id,
        first_name: distributor.first_name,
        last_name: distributor.last_name,
        email: distributor.email,
      },
      team,
      stats,
    });

  } catch (error) {
    console.error('Error in /api/dashboard/team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
