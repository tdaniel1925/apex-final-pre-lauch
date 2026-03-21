/**
 * SmartOffice Reports API
 * GET /api/admin/smartoffice/reports
 * Returns dashboard statistics and aggregated data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { DashboardStats } from '@/lib/smartoffice/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Fetch all data in parallel
    const [
      agentsResult,
      mappedAgentsResult,
      policiesResult,
      commissionsResult,
      policiesByCarrierResult,
      unmappedAgentsResult,
    ] = await Promise.all([
      // Total agents
      supabase
        .from('smartoffice_agents')
        .select('*', { count: 'exact', head: true }),

      // Mapped agents
      supabase
        .from('smartoffice_agents')
        .select('*', { count: 'exact', head: true })
        .not('apex_agent_id', 'is', null),

      // All policies with premium data
      supabase.from('smartoffice_policies').select('annual_premium, carrier_name'),

      // All commissions
      supabase
        .from('smartoffice_commissions')
        .select('receivable, paid_amount, status, payable_due_date'),

      // Policies grouped by carrier
      supabase
        .from('smartoffice_policies')
        .select('carrier_name, annual_premium')
        .not('carrier_name', 'is', null),

      // Unmapped agents list
      supabase
        .from('smartoffice_agents')
        .select('smartoffice_id, first_name, last_name, email')
        .is('apex_agent_id', null)
        .limit(50),
    ]);

    // Calculate agent stats
    const totalAgents = agentsResult.count || 0;
    const mappedAgents = mappedAgentsResult.count || 0;
    const unmappedAgents = totalAgents - mappedAgents;

    // Assume active if status = 1 (based on schema)
    // We'll need to query separately for active/inactive counts
    const { count: activeAgents } = await supabase
      .from('smartoffice_agents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 1);

    const inactiveAgents = totalAgents - (activeAgents || 0);

    // Calculate policy stats
    const policies = policiesResult.data || [];
    const totalPolicies = policies.length;
    const totalPremium = policies.reduce(
      (sum, p) => sum + (p.annual_premium || 0),
      0
    );

    // Group policies by carrier
    const carrierMap = new Map<string, { count: number; premium: number }>();
    policies.forEach((policy) => {
      const carrier = policy.carrier_name || 'Unknown';
      const existing = carrierMap.get(carrier) || { count: 0, premium: 0 };
      carrierMap.set(carrier, {
        count: existing.count + 1,
        premium: existing.premium + (policy.annual_premium || 0),
      });
    });

    const policiesByCarrier = Array.from(carrierMap.entries())
      .map(([carrier, data]) => ({
        carrier,
        count: data.count,
        premium: data.premium,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 carriers

    // Calculate commission stats
    const commissions = commissionsResult.data || [];
    const totalCommissions = commissions.length;
    const paidCommissions = commissions.filter((c) => c.status === 'Paid').length;
    const pendingCommissions = totalCommissions - paidCommissions;
    const totalPaid = commissions
      .filter((c) => c.status === 'Paid')
      .reduce((sum, c) => sum + (c.paid_amount || 0), 0);
    const totalPending = commissions
      .filter((c) => c.status !== 'Paid')
      .reduce((sum, c) => sum + (c.receivable || 0), 0);

    // Commissions by month (last 12 months)
    const commissionsByMonth = calculateCommissionsByMonth(commissions);

    // Top agents by policies sold
    const { data: agentPolicyCounts } = await supabase.rpc(
      'get_smartoffice_agent_policy_counts'
    ).limit(10);

    // If RPC doesn't exist, calculate manually
    let topAgentsByPolicies: Array<{
      smartoffice_id: string;
      agent_name: string;
      policy_count: number;
    }> = [];

    if (!agentPolicyCounts) {
      // Manual calculation
      const { data: allAgents } = await supabase
        .from('smartoffice_agents')
        .select('smartoffice_id, first_name, last_name');

      const { data: allPolicies } = await supabase
        .from('smartoffice_policies')
        .select('smartoffice_agent_id');

      if (allAgents && allPolicies) {
        const agentPolicyMap = new Map<string, number>();
        allPolicies.forEach((policy) => {
          if (policy.smartoffice_agent_id) {
            agentPolicyMap.set(
              policy.smartoffice_agent_id,
              (agentPolicyMap.get(policy.smartoffice_agent_id) || 0) + 1
            );
          }
        });

        topAgentsByPolicies = allAgents
          .map((agent) => ({
            smartoffice_id: agent.smartoffice_id,
            agent_name: `${agent.first_name || ''} ${agent.last_name || ''}`.trim(),
            policy_count: agentPolicyMap.get(agent.smartoffice_id) || 0,
          }))
          .filter((a) => a.policy_count > 0)
          .sort((a, b) => b.policy_count - a.policy_count)
          .slice(0, 10);
      }
    }

    // Top agents by commissions earned
    // Calculate from commissions data joined with agents through policies
    const { data: policiesWithAgents } = await supabase
      .from('smartoffice_policies')
      .select('policy_number, smartoffice_agent_id');

    const { data: commissionsWithPolicy } = await supabase
      .from('smartoffice_commissions')
      .select('policy_number, receivable');

    let topAgentsByCommissions: Array<{
      smartoffice_id: string;
      agent_name: string;
      total_commissions: number;
    }> = [];

    if (policiesWithAgents && commissionsWithPolicy) {
      // Build map of policy_number to agent_id
      const policyAgentMap = new Map<string, string>();
      policiesWithAgents.forEach((p) => {
        if (p.policy_number && p.smartoffice_agent_id) {
          policyAgentMap.set(p.policy_number, p.smartoffice_agent_id);
        }
      });

      // Calculate commissions per agent
      const agentCommissionsMap = new Map<string, number>();
      commissionsWithPolicy.forEach((comm) => {
        if (comm.policy_number) {
          const agentId = policyAgentMap.get(comm.policy_number);
          if (agentId) {
            agentCommissionsMap.set(
              agentId,
              (agentCommissionsMap.get(agentId) || 0) + (comm.receivable || 0)
            );
          }
        }
      });

      // Get agent names
      const { data: allAgents } = await supabase
        .from('smartoffice_agents')
        .select('smartoffice_id, first_name, last_name')
        .in('smartoffice_id', Array.from(agentCommissionsMap.keys()));

      if (allAgents) {
        topAgentsByCommissions = allAgents
          .map((agent) => ({
            smartoffice_id: agent.smartoffice_id,
            agent_name: `${agent.first_name || ''} ${agent.last_name || ''}`.trim(),
            total_commissions: agentCommissionsMap.get(agent.smartoffice_id) || 0,
          }))
          .sort((a, b) => b.total_commissions - a.total_commissions)
          .slice(0, 10);
      }
    }

    const response: DashboardStats = {
      agents: {
        total: totalAgents,
        active: activeAgents || 0,
        inactive: inactiveAgents,
        mapped: mappedAgents,
        unmapped: unmappedAgents,
      },
      policies: {
        total: totalPolicies,
        totalPremium,
        byCarrier: policiesByCarrier,
      },
      commissions: {
        total: totalCommissions,
        paid: paidCommissions,
        pending: pendingCommissions,
        totalPaid,
        totalPending,
        byMonth: commissionsByMonth,
      },
      topAgents: {
        byPolicies: topAgentsByPolicies,
        byCommissions: topAgentsByCommissions,
      },
      unmappedAgents: (unmappedAgentsResult.data || []).map((agent) => ({
        smartoffice_id: agent.smartoffice_id,
        first_name: agent.first_name,
        last_name: agent.last_name,
        email: agent.email,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate commissions grouped by month for the last 12 months
 */
function calculateCommissionsByMonth(
  commissions: Array<{
    payable_due_date: string | null;
    receivable: number | null;
    status: string | null;
  }>
): Array<{ month: string; amount: number }> {
  const now = new Date();
  const monthsMap = new Map<string, number>();

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toISOString().slice(0, 7); // YYYY-MM
    monthsMap.set(key, 0);
  }

  // Aggregate commissions by month
  commissions.forEach((comm) => {
    if (comm.payable_due_date && comm.receivable) {
      const monthKey = comm.payable_due_date.slice(0, 7); // YYYY-MM
      if (monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, monthsMap.get(monthKey)! + comm.receivable);
      }
    }
  });

  return Array.from(monthsMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
