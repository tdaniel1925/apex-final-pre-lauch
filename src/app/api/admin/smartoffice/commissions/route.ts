/**
 * SmartOffice Commissions API
 * GET /api/admin/smartoffice/commissions
 * Returns paginated list of SmartOffice commissions with policy and agent info
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import type {
  CommissionWithDetails,
  CommissionsListParams,
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
    const agentId = searchParams.get('agent_id') || '';
    const policyNumber = searchParams.get('policy_number') || '';
    const status = searchParams.get('status') || 'all';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const sortBy = searchParams.get('sortBy') || 'payable_due_date';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query - note: commissions don't have direct agent relationship
    // We'll need to join through policies
    let query = supabase.from('smartoffice_commissions').select(
      `
        *,
        policy:smartoffice_policies!policy_number (
          policy_number,
          product_name,
          carrier_name,
          smartoffice_agent_id,
          agent:smartoffice_agents!smartoffice_agent_id (
            first_name,
            last_name,
            email
          )
        )
      `,
      { count: 'exact' }
    );

    // Apply filters
    if (search) {
      query = query.or(
        `policy_number.ilike.%${search}%,agent_role.ilike.%${search}%,smartoffice_id.ilike.%${search}%`
      );
    }

    if (policyNumber) {
      query = query.eq('policy_number', policyNumber);
    }

    if (status === 'paid') {
      query = query.eq('status', 'Paid');
    } else if (status === 'pending') {
      query = query.neq('status', 'Paid');
    }

    if (dateFrom) {
      query = query.gte('payable_due_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('payable_due_date', dateTo);
    }

    // Get total count
    const { count: total } = await query;

    // Apply sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data: commissions, error } = await query;

    if (error) {
      console.error('Error fetching commissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch commissions' },
        { status: 500 }
      );
    }

    // Filter by agent_id if provided (since it's nested in the join)
    let filteredCommissions = commissions || [];
    if (agentId) {
      filteredCommissions = filteredCommissions.filter(
        (c: any) => c.policy?.smartoffice_agent_id === agentId
      );
    }

    // Map to proper structure
    const commissionsWithDetails: CommissionWithDetails[] =
      filteredCommissions.map((comm: any) => ({
        ...comm,
        agent: comm.policy?.agent || null,
      }));

    const response: PaginatedResponse<CommissionWithDetails> = {
      data: commissionsWithDetails,
      pagination: {
        page,
        limit,
        total: agentId
          ? commissionsWithDetails.length
          : total || 0,
        totalPages: Math.ceil(
          (agentId ? commissionsWithDetails.length : total || 0) / limit
        ),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Commissions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
