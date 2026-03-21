// =============================================
// SmartOffice v2 - Complete Rewrite
// Modern UI matching admin design patterns
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import SmartOfficeV2Client from '@/components/admin/SmartOfficeV2Client';

export const metadata = {
  title: 'SmartOffice CRM | Apex Back Office',
  description: 'SmartOffice CRM integration - sync agents, policies, and commissions',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SmartOfficeV2Page() {
  await requireAdmin();

  const serviceClient = createServiceClient();

  // Fetch initial data in parallel
  const [
    agentsResult,
    mappedAgentsResult,
    policiesResult,
    commissionsResult,
    lastSyncResult,
    configResult,
  ] = await Promise.all([
    serviceClient
      .from('smartoffice_agents')
      .select('*', { count: 'exact', head: true }),

    serviceClient
      .from('smartoffice_agents')
      .select('*', { count: 'exact', head: true })
      .not('apex_agent_id', 'is', null),

    serviceClient
      .from('smartoffice_policies')
      .select('*', { count: 'exact', head: true }),

    serviceClient
      .from('smartoffice_commissions')
      .select('*', { count: 'exact', head: true }),

    serviceClient
      .from('smartoffice_sync_logs')
      .select('completed_at, status, agents_synced, policies_synced')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    serviceClient
      .from('smartoffice_sync_config')
      .select('is_active, api_url, sitename, username, sync_frequency_hours')
      .eq('is_active', true)
      .maybeSingle(),
  ]);

  const stats = {
    totalAgents: agentsResult.count || 0,
    mappedAgents: mappedAgentsResult.count || 0,
    unmappedAgents: (agentsResult.count || 0) - (mappedAgentsResult.count || 0),
    totalPolicies: policiesResult.count || 0,
    totalCommissions: commissionsResult.count || 0,
    lastSync: lastSyncResult.data,
  };

  const config = configResult.data;
  const isConfigured = !!config && config.is_active;

  return (
    <div className="p-8">
      <SmartOfficeV2Client
        initialStats={stats}
        isConfigured={isConfigured}
        config={config}
      />
    </div>
  );
}
