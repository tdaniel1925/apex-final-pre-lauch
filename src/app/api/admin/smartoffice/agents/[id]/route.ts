/**
 * SmartOffice Agent Detail API
 * GET /api/admin/smartoffice/agents/[id]
 * Returns detailed agent information with policies and commissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { AgentDetailData } from '@/lib/smartoffice/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const { id } = params;

    // Fetch agent with distributor info
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
      .eq('smartoffice_id', id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Fetch policies for this agent
    const { data: policies, error: policiesError } = await supabase
      .from('smartoffice_policies')
      .select('*')
      .eq('smartoffice_agent_id', id)
      .order('issue_date', { ascending: false });

    if (policiesError) {
      console.error('Error fetching policies:', policiesError);
    }

    // Fetch commissions for this agent's policies
    const policyNumbers =
      policies?.map((p) => p.policy_number).filter(Boolean) || [];

    let commissions: any[] = [];
    if (policyNumbers.length > 0) {
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('smartoffice_commissions')
        .select(
          `
          *,
          policy:smartoffice_policies!policy_number (
            policy_number,
            product_name,
            carrier_name,
            smartoffice_agent_id
          )
        `
        )
        .in('policy_number', policyNumbers)
        .order('payable_due_date', { ascending: false });

      if (commissionsError) {
        console.error('Error fetching commissions:', commissionsError);
      } else {
        commissions = commissionsData || [];
      }
    }

    // Calculate stats
    const totalPremium =
      policies?.reduce((sum, p) => sum + (p.annual_premium || 0), 0) || 0;

    const totalCommissionsEarned =
      commissions.reduce((sum, c) => sum + (c.receivable || 0), 0) || 0;

    const commissionsPaid =
      commissions
        .filter((c) => c.status === 'Paid')
        .reduce((sum, c) => sum + (c.paid_amount || 0), 0) || 0;

    const commissionsPending =
      commissions
        .filter((c) => c.status !== 'Paid')
        .reduce((sum, c) => sum + (c.receivable || 0), 0) || 0;

    const response: AgentDetailData = {
      agent: {
        ...agent,
        policy_count: policies?.length || 0,
        total_commissions: totalCommissionsEarned,
      },
      stats: {
        policies_count: policies?.length || 0,
        total_premium: totalPremium,
        total_commissions_earned: totalCommissionsEarned,
        commissions_paid: commissionsPaid,
        commissions_pending: commissionsPending,
      },
      policies: (policies || []).map((policy) => ({
        ...policy,
        agent: {
          smartoffice_id: agent.smartoffice_id,
          first_name: agent.first_name,
          last_name: agent.last_name,
          email: agent.email,
        },
      })),
      commissions: commissions.map((comm) => ({
        ...comm,
        agent: {
          first_name: agent.first_name,
          last_name: agent.last_name,
          email: agent.email,
        },
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Agent detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
