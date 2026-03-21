/**
 * SmartOffice Stats API
 * GET /api/admin/smartoffice/stats
 * Returns statistics about SmartOffice sync status
 */

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function GET() {
  try {
    const supabase = getServiceSupabase();

    // Get agent counts
    const { count: totalAgents } = await supabase
      .from('smartoffice_agents')
      .select('*', { count: 'exact', head: true });

    const { count: mappedAgents } = await supabase
      .from('smartoffice_agents')
      .select('*', { count: 'exact', head: true })
      .not('apex_agent_id', 'is', null);

    // Get policy count
    const { count: totalPolicies } = await supabase
      .from('smartoffice_policies')
      .select('*', { count: 'exact', head: true });

    // Get last sync time
    const { data: lastSyncLog } = await supabase
      .from('smartoffice_sync_logs')
      .select('completed_at')
      .eq('status', 'success')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      totalAgents: totalAgents || 0,
      mappedAgents: mappedAgents || 0,
      unmappedAgents: (totalAgents || 0) - (mappedAgents || 0),
      totalPolicies: totalPolicies || 0,
      lastSync: lastSyncLog?.completed_at || null,
    });
  } catch (error) {
    console.error('SmartOffice stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SmartOffice stats' },
      { status: 500 }
    );
  }
}
