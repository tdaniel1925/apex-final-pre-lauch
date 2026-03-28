/**
 * SmartOffice Policy Detail API
 * GET /api/admin/smartoffice/policies/[id]
 * Returns detailed policy information with commissions and agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { PolicyDetailData } from '@/lib/smartoffice/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient();
    const { id } = await params;

    // Fetch policy with agent info
    const { data: policy, error: policyError } = await supabase
      .from('smartoffice_policies')
      .select(
        `
        *,
        agent:smartoffice_agents!smartoffice_agent_id (
          smartoffice_id,
          first_name,
          last_name,
          email
        )
      `
      )
      .eq('smartoffice_id', id)
      .single();

    if (policyError || !policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    // Fetch commissions for this policy
    const { data: commissions, error: commissionsError } = await supabase
      .from('smartoffice_commissions')
      .select('*')
      .eq('policy_number', policy.policy_number)
      .order('payable_due_date', { ascending: false });

    if (commissionsError) {
      console.error('Error fetching commissions:', commissionsError);
    }

    // Fetch full agent details if available
    let agentDetails = null;
    if (policy.smartoffice_agent_id) {
      const { data: agent, error: agentError } = await supabase
        .from('smartoffice_agents')
        .select(
          `
          *,
          distributor:distributors!apex_agent_id (
            id,
            first_name,
            last_name,
            email
          )
        `
        )
        .eq('smartoffice_id', policy.smartoffice_agent_id)
        .single();

      if (!agentError && agent) {
        // Get policy count for agent
        const { count: policyCount } = await supabase
          .from('smartoffice_policies')
          .select('*', { count: 'exact', head: true })
          .eq('smartoffice_agent_id', agent.smartoffice_id);

        agentDetails = {
          ...agent,
          policy_count: policyCount || 0,
        };
      }
    }

    // Calculate commission stats
    const totalCommissions =
      commissions?.reduce((sum, c) => sum + (c.receivable || 0), 0) || 0;

    const response: PolicyDetailData = {
      policy,
      stats: {
        total_commissions: totalCommissions,
        commission_count: commissions?.length || 0,
      },
      commissions:
        commissions?.map((comm) => ({
          ...comm,
          policy: {
            policy_number: policy.policy_number,
            product_name: policy.product_name,
            carrier_name: policy.carrier_name,
            smartoffice_agent_id: policy.smartoffice_agent_id,
          },
          agent: policy.agent
            ? {
                first_name: policy.agent.first_name,
                last_name: policy.agent.last_name,
                email: policy.agent.email,
              }
            : null,
        })) || [],
      agent: agentDetails,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Policy detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
