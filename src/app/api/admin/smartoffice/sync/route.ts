/**
 * SmartOffice Sync API
 * POST /api/admin/smartoffice/sync
 * Triggers a full sync of agents and policies from SmartOffice
 */

import { NextResponse } from 'next/server';
import { SmartOfficeSyncService } from '@/lib/smartoffice/sync-service';

export async function POST() {
  try {
    const syncService = new SmartOfficeSyncService();
    const result = await syncService.fullSync('admin-manual');

    return NextResponse.json({
      success: true,
      agents: result.agents,
      policies: result.policies,
      commissions: result.commissions,
      duration_ms: result.duration_ms,
      log_id: result.log_id,
    });
  } catch (error) {
    console.error('SmartOffice sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      },
      { status: 500 }
    );
  }
}
