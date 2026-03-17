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

    // Get L1 direct enrollees
    // This will work after RLS policies are applied
    const { data: team, error: teamError } = await supabase
      .from('members')
      .select(`
        member_id,
        first_name,
        last_name,
        email,
        tech_rank,
        personal_credits_monthly,
        team_credits_monthly,
        override_qualified,
        created_at
      `)
      .eq('enroller_id', member.member_id)
      .order('created_at', { ascending: false });

    if (teamError) {
      console.error('Error fetching team:', teamError);
      return NextResponse.json(
        { error: 'Failed to fetch team data' },
        { status: 500 }
      );
    }

    // Calculate team stats
    const stats = {
      total_members: team?.length || 0,
      active_members: team?.filter(m => m.tech_rank !== null).length || 0,
      total_personal_credits: team?.reduce((sum, m) => sum + (m.personal_credits_monthly || 0), 0) || 0,
      total_team_credits: team?.reduce((sum, m) => sum + (m.team_credits_monthly || 0), 0) || 0,
      override_qualified_count: team?.filter(m => m.override_qualified).length || 0,
    };

    return NextResponse.json({
      success: true,
      member: {
        member_id: member.member_id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
      },
      team: team || [],
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
