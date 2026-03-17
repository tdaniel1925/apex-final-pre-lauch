// =============================================
// Admin SSN API - Reveal Full SSN
// POST /api/admin/distributors/:id/ssn/reveal
// CRITICAL: Audit logs every access
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { decryptSSN } from '@/lib/utils/ssn';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const adminContext = await requireAdmin();
    const { id: distributorId } = await params;

    const supabase = await createClient();

    // Fetch encrypted SSN
    const { data: taxInfo, error: fetchError } = await supabase
      .from('distributor_tax_info')
      .select('ssn_encrypted, ssn_last_4')
      .eq('distributor_id', distributorId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'Not found',
            message: 'No SSN on file for this distributor',
          },
          { status: 404 }
        );
      }

      console.error('[SSN Reveal] Error fetching encrypted SSN:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch SSN',
          message: fetchError.message,
        },
        { status: 500 }
      );
    }

    // Decrypt SSN
    const fullSSN = decryptSSN(taxInfo.ssn_encrypted);

    if (!fullSSN) {
      console.error('[SSN Reveal] Decryption failed for distributor:', distributorId);
      return NextResponse.json(
        {
          success: false,
          error: 'Decryption failed',
          message: 'Unable to decrypt SSN. Contact system administrator.',
        },
        { status: 500 }
      );
    }

    // CRITICAL: Log the reveal action with full context
    const { error: logError } = await supabase.from('ssn_access_log').insert({
      distributor_id: distributorId,
      admin_id: adminContext.admin.id,
      admin_user_id: adminContext.user.id,
      admin_email: adminContext.user.email || 'unknown',
      admin_name: `${adminContext.admin.first_name} ${adminContext.admin.last_name}`,
      action: 'reveal_full',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                  request.headers.get('x-real-ip') ||
                  'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    if (logError) {
      console.error('[SSN Reveal] Audit log failed:', logError);
      // Continue anyway - we still want to return the SSN
      // But log the failure for investigation
    }

    // Also log to console for server-side audit trail
    console.log(`[SECURITY AUDIT] SSN Revealed - Distributor: ${distributorId} | Admin: ${adminContext.admin.id} (${adminContext.user.email}) | IP: ${request.headers.get('x-forwarded-for') || 'unknown'} | Time: ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      data: {
        ssn: fullSSN,
        last4: taxInfo.ssn_last_4,
        audit: {
          logged: !logError,
          admin: adminContext.user.email,
          timestamp: new Date().toISOString(),
        },
      },
      message: 'SSN revealed and audit logged',
    });

  } catch (error: any) {
    console.error('[SSN Reveal] Unexpected error:', error);

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
