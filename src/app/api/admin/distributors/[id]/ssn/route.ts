// =============================================
// Admin SSN API - View Last 4 Digits
// GET /api/admin/distributors/:id/ssn
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const adminContext = await requireAdmin();
    const { id: distributorId } = await params;

    const supabase = await createClient();

    // Fetch last 4 digits only
    const { data: taxInfo, error } = await supabase
      .from('distributor_tax_info')
      .select('ssn_last_4')
      .eq('distributor_id', distributorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: { last4: null },
          message: 'No SSN on file',
        });
      }

      console.error('[SSN API] Error fetching last 4:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch SSN',
          message: error.message,
        },
        { status: 500 }
      );
    }

    // Log access (view_last_4)
    await supabase.from('ssn_access_log').insert({
      distributor_id: distributorId,
      admin_id: adminContext.admin.id,
      admin_user_id: adminContext.user.id,
      admin_email: adminContext.user.email || 'unknown',
      admin_name: `${adminContext.admin.first_name} ${adminContext.admin.last_name}`,
      action: 'view_last_4',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                  request.headers.get('x-real-ip') ||
                  'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: {
        last4: taxInfo.ssn_last_4,
      },
    });

  } catch (error: any) {
    console.error('[SSN API] Unexpected error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Admin access required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
