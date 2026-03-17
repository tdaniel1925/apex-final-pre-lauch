// =============================================
// DEPRECATED: Old CAB Processing API
// Date Deprecated: 2026-03-16
// Reason: Replaced by dual-ladder compensation system
// Phase: 1 (Remove Old System - Agent 1C)
// Note: CAB logic will be preserved but reimplemented in Phase 3
// =============================================

import { NextRequest, NextResponse } from 'next/server';

// Old imports - NO LONGER AVAILABLE (files moved to _OLD_BACKUP/)
// import { createServiceClient } from '@/lib/supabase/service';
// import { processCABTransitions } from '@/lib/compensation/cab-state-machine';
// import { getAdminUser } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'DEPRECATED: This endpoint has been removed',
      message: 'CAB processing will be reimplemented with dual-ladder system',
      deprecated_date: '2026-03-16',
      status: 'removed',
      action: 'CAB state machine logic will be preserved and updated in Phase 3',
      note: 'PENDING → EARNED → CLAWBACK flow remains the same',
    },
    { status: 501 } // 501 Not Implemented
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'DEPRECATED: This endpoint has been removed',
      message: 'CAB statistics endpoint will be reimplemented with new schema',
      deprecated_date: '2026-03-16',
      status: 'removed',
      action: 'Will be available after Phase 4 completion',
    },
    { status: 501 } // 501 Not Implemented
  );
}
