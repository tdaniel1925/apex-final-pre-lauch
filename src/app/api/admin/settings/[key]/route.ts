// =============================================
// Admin Settings API - Get/Update Single Setting
// GET /api/admin/settings/:key
// PUT /api/admin/settings/:key
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

interface RouteContext {
  params: Promise<{
    key: string;
  }>;
}

// GET single setting
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();

    const supabase = await createClient();
    const { key } = await context.params;

    const { data: setting, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Setting not found' },
          { status: 404 }
        );
      }
      console.error('[Settings API] Error fetching setting:', error);
      return NextResponse.json(
        { error: 'Failed to fetch setting', details: error.message },
        { status: 500 }
      );
    }

    // Mask encrypted/secret values
    if (setting.value_type === 'encrypted' || setting.is_secret) {
      setting.value = '[ENCRYPTED]';
    }

    return NextResponse.json({
      success: true,
      setting,
    });

  } catch (error: any) {
    console.error('[Settings API] Unexpected error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT update setting
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const adminContext = await requireAdmin();

    const supabase = await createClient();
    const { key } = await context.params;
    const body = await request.json();

    const { value } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      );
    }

    // Fetch current setting to get value_type
    const { data: currentSetting, error: fetchError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Setting not found' },
          { status: 404 }
        );
      }
      console.error('[Settings API] Error fetching setting:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch setting', details: fetchError.message },
        { status: 500 }
      );
    }

    // Validate value based on type
    let validatedValue = value;

    switch (currentSetting.value_type) {
      case 'number':
        validatedValue = String(Number(value));
        if (isNaN(Number(validatedValue))) {
          return NextResponse.json(
            { error: 'Invalid number value' },
            { status: 400 }
          );
        }
        break;

      case 'boolean':
        if (typeof value === 'boolean') {
          validatedValue = String(value);
        } else if (value === 'true' || value === 'false') {
          validatedValue = value;
        } else {
          return NextResponse.json(
            { error: 'Invalid boolean value' },
            { status: 400 }
          );
        }
        break;

      case 'json':
        try {
          JSON.parse(value);
          validatedValue = value;
        } catch {
          return NextResponse.json(
            { error: 'Invalid JSON value' },
            { status: 400 }
          );
        }
        break;

      case 'string':
      case 'encrypted':
      default:
        validatedValue = String(value);
        break;
    }

    // Skip update if value is "[ENCRYPTED]" placeholder (user didn't change it)
    if (validatedValue === '[ENCRYPTED]' && (currentSetting.value_type === 'encrypted' || currentSetting.is_secret)) {
      return NextResponse.json({
        success: true,
        message: 'Setting unchanged (encrypted value not modified)',
        setting: currentSetting,
      });
    }

    // Update setting
    const { data: updatedSetting, error: updateError } = await supabase
      .from('system_settings')
      .update({
        value: validatedValue,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)
      .select()
      .single();

    if (updateError) {
      console.error('[Settings API] Error updating setting:', updateError);
      return NextResponse.json(
        { error: 'Failed to update setting', details: updateError.message },
        { status: 500 }
      );
    }

    // Mask encrypted value in response
    if (updatedSetting.value_type === 'encrypted' || updatedSetting.is_secret) {
      updatedSetting.value = '[ENCRYPTED]';
    }

    return NextResponse.json({
      success: true,
      message: 'Setting updated successfully',
      setting: updatedSetting,
    });

  } catch (error: any) {
    console.error('[Settings API] Unexpected error:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
