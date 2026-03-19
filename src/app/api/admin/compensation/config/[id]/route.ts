// =============================================
// DUAL-LADDER COMPENSATION CONFIG BY ID API
// =============================================
// Phase: 4 (Update APIs)
// Agent: 4
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser, hasAdminRole } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Get Specific Compensation Configuration by ID
 *
 * GET /api/admin/compensation/config/:id
 *
 * Returns a specific configuration entry by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createServiceClient();

    // Try to find in SaaS config first
    const { data: saasConfig, error: saasError } = await supabase
      .from('saas_comp_engine_config')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (saasError) {
      console.error('[Config GET by ID] SaaS query error:', saasError);
      return NextResponse.json(
        { success: false, error: 'Database query failed', details: saasError.message },
        { status: 500 }
      );
    }

    if (saasConfig) {
      return NextResponse.json({
        success: true,
        data: { ...saasConfig, engineType: 'saas' },
      });
    }

    // Try insurance config
    const { data: insuranceConfig, error: insuranceError } = await supabase
      .from('insurance_comp_engine_config')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (insuranceError) {
      console.error('[Config GET by ID] Insurance query error:', insuranceError);
      return NextResponse.json(
        { success: false, error: 'Database query failed', details: insuranceError.message },
        { status: 500 }
      );
    }

    if (insuranceConfig) {
      return NextResponse.json({
        success: true,
        data: { ...insuranceConfig, engineType: 'insurance' },
      });
    }

    // Not found in either table
    return NextResponse.json(
      { success: false, error: 'Configuration not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('[Config GET by ID] Error:', error);
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
 * Update Compensation Configuration by ID
 *
 * PUT /api/admin/compensation/config/:id
 *
 * Updates a specific configuration entry.
 *
 * Body:
 * {
 *   value: any (JSONB),
 *   effectiveDate?: string (ISO date)
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createServiceClient();

    // Parse request body
    const body = await request.json();
    const { value, effectiveDate } = body;

    if (value === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field',
          message: 'value is required',
        },
        { status: 400 }
      );
    }

    // Try to find in SaaS config first
    const { data: saasConfig, error: saasError } = await supabase
      .from('saas_comp_engine_config')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (saasError) {
      console.error('[Config PUT] SaaS query error:', saasError);
      return NextResponse.json(
        { success: false, error: 'Database query failed', details: saasError.message },
        { status: 500 }
      );
    }

    let tableName: string;
    let engineType: 'saas' | 'insurance';
    let oldValue: any;
    let configKey: string;

    if (saasConfig) {
      tableName = 'saas_comp_engine_config';
      engineType = 'saas';
      oldValue = saasConfig.value;
      configKey = saasConfig.key;
    } else {
      // Try insurance config
      const { data: insuranceConfig, error: insuranceError } = await supabase
        .from('insurance_comp_engine_config')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (insuranceError) {
        console.error('[Config PUT] Insurance query error:', insuranceError);
        return NextResponse.json(
          { success: false, error: 'Database query failed', details: insuranceError.message },
          { status: 500 }
        );
      }

      if (!insuranceConfig) {
        return NextResponse.json(
          { success: false, error: 'Configuration not found' },
          { status: 404 }
        );
      }

      tableName = 'insurance_comp_engine_config';
      engineType = 'insurance';
      oldValue = insuranceConfig.value;
      configKey = insuranceConfig.key;
    }

    // Update the configuration
    const updateData: any = {
      value,
    };

    if (effectiveDate) {
      updateData.effective_date = effectiveDate;
    }

    const { data: updatedConfig, error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Config PUT] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update configuration', details: updateError.message },
        { status: 500 }
      );
    }

    // Log the change
    const { error: logError } = await supabase.from('comp_engine_change_log').insert({
      engine_type: engineType,
      field_key: configKey,
      old_value: oldValue,
      new_value: value,
      changed_by: admin.user.id,
    });

    if (logError) {
      console.error('[Config PUT] Audit log error:', logError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    console.error('[Config PUT] Error:', error);
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
 * Delete Compensation Configuration by ID
 *
 * DELETE /api/admin/compensation/config/:id
 *
 * Deletes a specific configuration entry.
 * Only super admins can delete configuration.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Only super admins can delete configurations
    if (!hasAdminRole(admin.admin, 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = createServiceClient();

    // Try to find in SaaS config first
    const { data: saasConfig } = await supabase
      .from('saas_comp_engine_config')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    let tableName: string;
    let engineType: 'saas' | 'insurance';
    let configData: any;

    if (saasConfig) {
      tableName = 'saas_comp_engine_config';
      engineType = 'saas';
      configData = saasConfig;
    } else {
      // Try insurance config
      const { data: insuranceConfig } = await supabase
        .from('insurance_comp_engine_config')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!insuranceConfig) {
        return NextResponse.json(
          { success: false, error: 'Configuration not found' },
          { status: 404 }
        );
      }

      tableName = 'insurance_comp_engine_config';
      engineType = 'insurance';
      configData = insuranceConfig;
    }

    // Delete the configuration
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Config DELETE] Delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete configuration', details: deleteError.message },
        { status: 500 }
      );
    }

    // Log the deletion
    const { error: logError } = await supabase.from('comp_engine_change_log').insert({
      engine_type: engineType,
      field_key: configData.key,
      old_value: configData.value,
      new_value: null,
      changed_by: admin.user.id,
    });

    if (logError) {
      console.error('[Config DELETE] Audit log error:', logError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully',
    });
  } catch (error) {
    console.error('[Config DELETE] Error:', error);
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
