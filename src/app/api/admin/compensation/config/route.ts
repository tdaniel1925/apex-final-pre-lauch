// =============================================
// DUAL-LADDER COMPENSATION CONFIG API
// =============================================
// Phase: 4 (Update APIs)
// Agent: 4
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Get Active Compensation Configuration
 *
 * GET /api/admin/compensation/config
 *
 * Returns the currently active compensation configuration
 * including tech ranks, waterfalls, and bonus programs.
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

    // Get all active SaaS compensation config
    const { data: saasConfig, error: saasError } = await supabase
      .from('saas_comp_engine_config')
      .select('*')
      .order('effective_date', { ascending: false });

    if (saasError) {
      console.error('[Config GET] SaaS config error:', saasError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch SaaS configuration', details: saasError.message },
        { status: 500 }
      );
    }

    // Get all insurance compensation config
    const { data: insuranceConfig, error: insuranceError } = await supabase
      .from('insurance_comp_engine_config')
      .select('*')
      .order('effective_date', { ascending: false });

    if (insuranceError) {
      console.error('[Config GET] Insurance config error:', insuranceError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch insurance configuration', details: insuranceError.message },
        { status: 500 }
      );
    }

    // Organize SaaS config by key
    const saasConfigMap = (saasConfig || []).reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    // Organize insurance config by key
    const insuranceConfigMap = (insuranceConfig || []).reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        saas: saasConfigMap,
        insurance: insuranceConfigMap,
      },
    });
  } catch (error) {
    console.error('[Config GET] Error:', error);
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

/**
 * Create New Compensation Configuration
 *
 * POST /api/admin/compensation/config
 *
 * Creates a new compensation configuration entry.
 *
 * Body:
 * {
 *   engineType: 'saas' | 'insurance',
 *   key: string,
 *   value: any (JSONB),
 *   effectiveDate?: string (ISO date)
 * }
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { engineType, key, value, effectiveDate } = body;

    // Validate required fields
    if (!engineType || !key || value === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'engineType, key, and value are required',
        },
        { status: 400 }
      );
    }

    // Validate engineType
    if (engineType !== 'saas' && engineType !== 'insurance') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid engineType',
          message: 'engineType must be "saas" or "insurance"',
        },
        { status: 400 }
      );
    }

    const tableName =
      engineType === 'saas'
        ? 'saas_comp_engine_config'
        : 'insurance_comp_engine_config';

    // Check if key already exists
    const { data: existing } = await supabase
      .from(tableName)
      .select('*')
      .eq('key', key)
      .single();

    // Get old value for audit log
    const oldValue = existing?.value || null;

    // Insert or update config
    const { data: configData, error: configError } = await supabase
      .from(tableName)
      .upsert(
        {
          key,
          value,
          effective_date: effectiveDate || new Date().toISOString(),
          created_by: admin.user.id,
        },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (configError) {
      console.error('[Config POST] Insert error:', configError);
      return NextResponse.json(
        { success: false, error: 'Failed to create configuration', details: configError.message },
        { status: 500 }
      );
    }

    // Log the change
    const { error: logError } = await supabase.from('comp_engine_change_log').insert({
      engine_type: engineType,
      field_key: key,
      old_value: oldValue,
      new_value: value,
      changed_by: admin.user.id,
    });

    if (logError) {
      console.error('[Config POST] Audit log error:', logError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json(
      {
        success: true,
        data: configData,
        message: existing ? 'Configuration updated successfully' : 'Configuration created successfully',
      },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    console.error('[Config POST] Error:', error);
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
