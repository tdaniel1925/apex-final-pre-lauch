// =============================================
// SmartOffice CRM Integration Admin Page
// Manage SmartOffice sync, agents, and policies
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import SmartOfficeClient from '@/components/admin/SmartOfficeClient';

export const metadata = {
  title: 'SmartOffice Integration | Apex Back Office',
  description: 'Manage SmartOffice CRM integration, sync agents and policies',
};

export const revalidate = 30; // Cache for 30 seconds

export default async function SmartOfficePage() {
  // Require admin authentication
  await requireAdmin();

  const serviceClient = createServiceClient();

  // Fetch initial statistics server-side
  const [
    totalAgentsResult,
    mappedAgentsResult,
    totalPoliciesResult,
    lastSyncLogResult,
    configResult,
  ] = await Promise.all([
    // Get total agents count
    serviceClient
      .from('smartoffice_agents')
      .select('*', { count: 'exact', head: true }),

    // Get mapped agents count
    serviceClient
      .from('smartoffice_agents')
      .select('*', { count: 'exact', head: true })
      .not('apex_agent_id', 'is', null),

    // Get total policies count
    serviceClient
      .from('smartoffice_policies')
      .select('*', { count: 'exact', head: true }),

    // Get last successful sync log
    serviceClient
      .from('smartoffice_sync_logs')
      .select('completed_at')
      .eq('status', 'success')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Check if SmartOffice is configured
    serviceClient
      .from('smartoffice_sync_config')
      .select('is_active, api_url, sitename')
      .eq('is_active', true)
      .maybeSingle(),
  ]);

  const totalAgents = totalAgentsResult.count || 0;
  const mappedAgents = mappedAgentsResult.count || 0;
  const totalPolicies = totalPoliciesResult.count || 0;
  const lastSync = lastSyncLogResult.data?.completed_at || null;
  const isConfigured = !!configResult.data;

  const initialStats = {
    totalAgents,
    mappedAgents,
    unmappedAgents: totalAgents - mappedAgents,
    totalPolicies,
    totalCommissions: 0, // Could add commission count query if needed
    lastSync,
    nextSync: null, // Could calculate based on sync frequency
  };

  return (
    <SmartOfficeClient
      initialStats={initialStats}
      isConfigured={isConfigured}
    />
  );
}
