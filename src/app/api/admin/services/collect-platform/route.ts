// =============================================
// Admin Trigger Platform Usage Collection
// POST /api/admin/services/collect-platform
// Manually trigger platform usage collection
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { recordVercelUsage } from '@/lib/services/vercel-usage';
import { recordSupabaseUsage } from '@/lib/services/supabase-usage';
import { adminRateLimit, checkRateLimit } from '@/lib/rate-limit';

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
    const { date } = body;

    // Use specified date or yesterday
    const targetDate = date ? new Date(date) : new Date();
    if (!date) {
      targetDate.setDate(targetDate.getDate() - 1); // Yesterday by default
    }

    const results = {
      vercel: { success: false, error: null as string | null },
      supabase: { success: false, error: null as string | null },
    };

    // Collect Vercel usage
    try {
      await recordVercelUsage(targetDate);
      results.vercel.success = true;
    } catch (error: any) {
      console.error('Failed to collect Vercel usage:', error);
      results.vercel.error = error.message;
    }

    // Collect Supabase usage
    try {
      await recordSupabaseUsage(targetDate);
      results.supabase.success = true;
    } catch (error: any) {
      console.error('Failed to collect Supabase usage:', error);
      results.supabase.error = error.message;
    }

    return NextResponse.json({
      success: results.vercel.success && results.supabase.success,
      date: targetDate.toISOString().split('T')[0],
      results,
      message: 'Platform usage collection triggered',
    });
  } catch (error: any) {
    console.error('Error triggering platform usage collection:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to collect platform usage' },
      { status: 500 }
    );
  }
}
