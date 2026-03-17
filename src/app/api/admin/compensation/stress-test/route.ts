// =============================================
// DEPRECATED: Old Stress Test API
// Date Deprecated: 2026-03-16
// Reason: Replaced by dual-ladder compensation system
// Phase: 1 (Remove Old System - Agent 1C)
// Note: Stress testing will be reimplemented with new schema in Phase 5
// =============================================

import { NextRequest, NextResponse } from 'next/server';

// Old imports - NO LONGER AVAILABLE (files moved to _OLD_BACKUP/)
// import { createServiceClient } from '@/lib/supabase/service';
// import { calculateWaterfall, calculateMargins, validateWaterfall } from '@/lib/compensation/waterfall';
// import { evaluateRank, validateRankEvaluation } from '@/lib/compensation/rank';
// import { PRODUCT_PRICES, COMP_PLAN_CONFIG } from '@/lib/compensation/config';
// import { getAdminUser } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'DEPRECATED: This endpoint has been removed',
      message: 'Stress testing will be reimplemented with dual-ladder system validation',
      deprecated_date: '2026-03-16',
      status: 'removed',
      action: 'New stress tests will be created in Phase 5 (Testing & Validation)',
      note: 'Will include dual-ladder specific tests (Tech + Insurance validation)',
    },
    { status: 501 } // 501 Not Implemented
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'DEPRECATED: This endpoint has been removed',
      message: 'Stress test results endpoint will be reimplemented',
      deprecated_date: '2026-03-16',
      status: 'removed',
      action: 'Will be available after Phase 5 completion',
    },
    { status: 501 } // 501 Not Implemented
  );
}
