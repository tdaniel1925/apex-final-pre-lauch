/**
 * SmartOffice Sync API
 * POST /api/admin/smartoffice/sync
 * Triggers a full sync of agents and policies from SmartOffice
 */

import { NextResponse } from 'next/server';
import { SmartOfficeSyncService } from '@/lib/smartoffice/sync-service';
import { requireAdmin } from '@/lib/auth/admin';

export async function POST() {
  try {
    // Require admin authentication
    await requireAdmin();

    console.log('[SmartOffice Sync] Starting manual sync...');
    const startTime = Date.now();

    const syncService = new SmartOfficeSyncService();
    const result = await syncService.fullSync('admin-manual');

    const duration = Date.now() - startTime;
    console.log(`[SmartOffice Sync] Completed in ${duration}ms`);
    console.log(`[SmartOffice Sync] Results:`, {
      agents: result.agents,
      policies: result.policies,
      commissions: result.commissions,
    });

    return NextResponse.json({
      success: true,
      agents: result.agents,
      policies: result.policies,
      commissions: result.commissions,
      duration_ms: result.duration_ms,
      log_id: result.log_id,
      message: `Successfully synced ${result.agents} agents, ${result.policies} policies, and ${result.commissions} commissions`,
    });
  } catch (error) {
    console.error('[SmartOffice Sync] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      },
      { status: 500 }
    );
  }
}
