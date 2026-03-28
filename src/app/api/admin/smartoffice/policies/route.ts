/**
 * SmartOffice Policies API
 * GET /api/admin/smartoffice/policies
 * Returns paginated list of SmartOffice policies with agent info
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import type {
  PolicyWithAgent,
  PoliciesListParams,
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
    const carrier = searchParams.get('carrier') || '';
    const agentId = searchParams.get('agent_id') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const sortBy = searchParams.get('sortBy') || 'issue_date';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from('smartoffice_policies').select(
      `
        *,
        agent:smartoffice_agents!smartoffice_agent_id (
          smartoffice_id,
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
        `policy_number.ilike.%${search}%,product_name.ilike.%${search}%,carrier_name.ilike.%${search}%`
      );
    }

    if (carrier) {
      query = query.ilike('carrier_name', `%${carrier}%`);
    }

    if (agentId) {
      query = query.eq('smartoffice_agent_id', agentId);
    }

    if (dateFrom) {
      query = query.gte('issue_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('issue_date', dateTo);
    }

    // Get total count
    const { count: total } = await query;

    // Apply sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data: policies, error } = await query;

    if (error) {
      console.error('Error fetching policies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch policies' },
        { status: 500 }
      );
    }

    const response: PaginatedResponse<PolicyWithAgent> = {
      data: policies || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Policies API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
