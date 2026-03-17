// =============================================
// DUAL-LADDER COMPENSATION CONFIG EXPORT API
// =============================================
// Phase: 4 (Update APIs)
// Agent: 4
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Export All Compensation Configuration
 *
 * GET /api/admin/compensation/config/export
 *
 * Exports all compensation configuration as a JSON file for backup/migration.
 *
 * Query params:
 * - engineType: 'saas' | 'insurance' | 'all' (optional, default 'all')
 * - format: 'json' | 'download' (optional, default 'json')
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const engineType = searchParams.get('engineType') || 'all';
    const format = searchParams.get('format') || 'json';

    const exportData: any = {
      exportDate: new Date().toISOString(),
      exportedBy: admin.user.email,
      version: '1.0',
      data: {},
    };

    // Export SaaS config
    if (engineType === 'all' || engineType === 'saas') {
      const { data: saasConfig, error: saasError } = await supabase
        .from('saas_comp_engine_config')
        .select('*')
        .order('key');

      if (saasError) {
        console.error('[Config Export] SaaS config error:', saasError);
        return NextResponse.json(
          { success: false, error: 'Failed to export SaaS configuration', details: saasError.message },
          { status: 500 }
        );
      }

      exportData.data.saas = saasConfig;
    }

    // Export insurance config
    if (engineType === 'all' || engineType === 'insurance') {
      const { data: insuranceConfig, error: insuranceError } = await supabase
        .from('insurance_comp_engine_config')
        .select('*')
        .order('key');

      if (insuranceError) {
        console.error('[Config Export] Insurance config error:', insuranceError);
        return NextResponse.json(
          { success: false, error: 'Failed to export insurance configuration', details: insuranceError.message },
          { status: 500 }
        );
      }

      exportData.data.insurance = insuranceConfig;
    }

    // Return as downloadable file if requested
    if (format === 'download') {
      const filename = `compensation-config-${engineType}-${Date.now()}.json`;
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Return as JSON response
    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error('[Config Export] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
