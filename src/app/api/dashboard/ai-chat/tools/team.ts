/**
 * Team-related tool implementations
 * - view_team_stats
 * - who_joined_recently
 * - view_team_member_details
 */

import { ToolContext, ToolResult } from '../utils/types';
import { logger } from '../utils/logger';

/**
 * Get team statistics
 */
export async function viewTeamStats(context: ToolContext): Promise<ToolResult> {
  try {
    const { distributor, supabase } = context;

    // Get total team count
    const { count: totalTeam } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('sponsor_id', distributor.id)
      .neq('status', 'deleted');

    // Get active team count
    const { count: activeTeam } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('sponsor_id', distributor.id)
      .eq('status', 'active');

    logger.info('Retrieved team stats', {
      distributorId: distributor.id,
      totalTeam,
      activeTeam,
    });

    return {
      success: true,
      data: {
        totalTeamMembers: totalTeam || 0,
        activeMembers: activeTeam || 0,
        inactiveMembers: (totalTeam || 0) - (activeTeam || 0),
      },
    };
  } catch (error) {
    logger.error('Error in viewTeamStats', error as Error, {
      distributorId: context.distributor.id,
    });
    return {
      success: false,
      error: 'Failed to fetch team statistics',
    };
  }
}

/**
 * Get recent team enrollments
 */
export async function whoJoinedRecently(
  context: ToolContext,
  args: { timeframe?: string }
): Promise<ToolResult> {
  try {
    const { distributor, supabase } = context;
    const timeframe = args.timeframe || 'week';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0); // All time
    }

    const { data: teamMembers } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, created_at, sponsor_id, status')
      .eq('sponsor_id', distributor.id)
      .neq('status', 'deleted')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    logger.info('Retrieved recent team joins', {
      distributorId: distributor.id,
      timeframe,
      count: teamMembers?.length || 0,
    });

    return {
      success: true,
      data: {
        timeframe,
        members: teamMembers || [],
        count: teamMembers?.length || 0,
      },
    };
  } catch (error) {
    logger.error('Error in whoJoinedRecently', error as Error, {
      distributorId: context.distributor.id,
      timeframe: args.timeframe,
    });
    return {
      success: false,
      error: 'Failed to fetch recent enrollments',
    };
  }
}

/**
 * Look up specific team member details
 */
export async function viewTeamMemberDetails(
  context: ToolContext,
  args: { searchName: string }
): Promise<ToolResult> {
  try {
    const { distributor, supabase } = context;
    const searchName = args.searchName.toLowerCase();

    // Search in direct downline
    const { data: teamMembers } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, phone, status, created_at')
      .eq('sponsor_id', distributor.id)
      .neq('status', 'deleted');

    if (!teamMembers || teamMembers.length === 0) {
      return {
        success: false,
        error: 'No team members found',
      };
    }

    // Search by name
    const matches = teamMembers.filter((member: any) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      return (
        fullName.includes(searchName) ||
        member.first_name.toLowerCase().includes(searchName) ||
        member.last_name.toLowerCase().includes(searchName)
      );
    });

    if (matches.length === 0) {
      return {
        success: false,
        error: `No team member found matching "${args.searchName}"`,
      };
    }

    // Get additional details for first match
    const member = matches[0];

    // Get their team count
    const { count: memberTeamCount } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('sponsor_id', member.id)
      .eq('status', 'active');

    logger.info('Retrieved team member details', {
      distributorId: distributor.id,
      memberId: member.id,
      searchName: args.searchName,
    });

    return {
      success: true,
      data: {
        member: {
          ...member,
          teamCount: memberTeamCount || 0,
        },
        totalMatches: matches.length,
      },
    };
  } catch (error) {
    logger.error('Error in viewTeamMemberDetails', error as Error, {
      distributorId: context.distributor.id,
      searchName: args.searchName,
    });
    return {
      success: false,
      error: 'Failed to find team member',
    };
  }
}
