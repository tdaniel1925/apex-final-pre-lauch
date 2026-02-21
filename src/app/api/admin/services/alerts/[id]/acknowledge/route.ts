// =============================================
// Admin Acknowledge Alert API
// POST /api/admin/services/alerts/[id]/acknowledge
// Mark a cost alert as acknowledged
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { acknowledgeAlert } from '@/lib/services/tracking';
import { adminRateLimit, checkRateLimit } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminContext = await getAdminUser();
  if (!adminContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit
  const rateLimitResponse = await checkRateLimit(
    adminRateLimit,
    adminContext.admin.id
  );
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;

    await acknowledgeAlert(id, adminContext.admin.id);

    return NextResponse.json({
      success: true,
      message: 'Alert acknowledged',
    });
  } catch (error: any) {
    console.error('Error acknowledging alert:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to acknowledge alert' },
      { status: 500 }
    );
  }
}
