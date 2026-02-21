// =============================================
// Admin Service Budget API
// POST /api/admin/services/budget
// Set monthly budget for a service
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { setServiceBudget } from '@/lib/services/tracking';
import { adminRateLimit, checkRateLimit } from '@/lib/rate-limit';
import type { ServiceName } from '@/types/service-tracking';

export async function POST(request: NextRequest) {
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
    const body = await request.json();

    const { service, budgetUsd, alertThresholdPercent, month } = body;

    // Validate
    if (!service || !budgetUsd) {
      return NextResponse.json(
        { error: 'Missing required fields: service, budgetUsd' },
        { status: 400 }
      );
    }

    if (budgetUsd <= 0) {
      return NextResponse.json(
        { error: 'Budget must be greater than 0' },
        { status: 400 }
      );
    }

    if (
      alertThresholdPercent &&
      (alertThresholdPercent < 0 || alertThresholdPercent > 100)
    ) {
      return NextResponse.json(
        { error: 'Alert threshold must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Set budget
    await setServiceBudget({
      service: service as ServiceName,
      budgetUsd,
      alertThresholdPercent,
      month: month ? new Date(month) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Budget set for ${service}: $${budgetUsd}/month`,
    });
  } catch (error: any) {
    console.error('Error setting service budget:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set budget' },
      { status: 500 }
    );
  }
}
