/**
 * SmartOffice Agents API
 * GET /api/admin/smartoffice/agents
 * Returns paginated list of SmartOffice agents with stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import type {
  AgentWithStats,
  AgentsListParams,
  PaginatedResponse,
} from '@/lib/smartoffice/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const mapped = searchParams.get('mapped') || 'all';
    const sortBy = searchParams.get('sortBy') || 'synced_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from('smartoffice_agents').select(
      `
        *,
        distributor:distributors!apex_agent_id (
          id,
          first_name,
          last_name,
          email
        )
      `,
      { count: 'exact' }
    );

    // Apply filters
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,smartoffice_id.ilike.%${search}%`
      );
    }

    if (status === 'active') {
      query = query.eq('status', 1);
    } else if (status === 'inactive') {
      query = query.neq('status', 1);
    }

    if (mapped === 'yes') {
      query = query.not('apex_agent_id', 'is', null);
    } else if (mapped === 'no') {
      query = query.is('apex_agent_id', null);
    }

    // Get total count
    const { count: total } = await query;

    // Apply sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data: agents, error } = await query;

    if (error) {
      console.error('Error fetching agents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    // Get policy counts and commissions for each agent
    const agentsWithStats: AgentWithStats[] = await Promise.all(
      (agents || []).map(async (agent) => {
        // Get policy count
        const { count: policyCount } = await supabase
          .from('smartoffice_policies')
          .select('*', { count: 'exact', head: true })
          .eq('smartoffice_agent_id', agent.smartoffice_id);

        // Get total commissions
        const { data: commissions } = await supabase
          .from('smartoffice_commissions')
          .select('receivable')
          .eq('policy_number', agent.smartoffice_id);

        const totalCommissions =
          commissions?.reduce((sum, c) => sum + (c.receivable || 0), 0) || 0;

        return {
          ...agent,
          policy_count: policyCount || 0,
          total_commissions: totalCommissions,
        };
      })
    );

    const response: PaginatedResponse<AgentWithStats> = {
      data: agentsWithStats,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Agents API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
