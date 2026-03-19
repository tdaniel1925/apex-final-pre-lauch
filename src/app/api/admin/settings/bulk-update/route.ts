// =============================================
// Admin Settings API - Bulk Update
// POST /api/admin/settings/bulk-update
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

interface SettingUpdate {
  key: string;
  value: string;
}

export async function POST(request: NextRequest) {
  try {
    const adminContext = await requireAdmin();

    const supabase = await createClient();
    const body = await request.json();

    const { updates } = body as { updates: SettingUpdate[] };

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    // Validate all keys exist first
    const keys = updates.map(u => u.key);
    const { data: existingSettings, error: fetchError } = await supabase
      .from('system_settings')
      .select('key, value_type, is_secret')
      .in('key', keys);

    if (fetchError) {
      console.error('[Settings API] Error fetching settings:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch settings', details: fetchError.message },
        { status: 500 }
      );
    }

    const settingsMap = new Map(
      existingSettings?.map(s => [s.key, s]) || []
    );

    // Validate all updates
    const validatedUpdates: SettingUpdate[] = [];
    const errors: string[] = [];

    for (const update of updates) {
      const setting = settingsMap.get(update.key);

      if (!setting) {
        errors.push(`Setting not found: ${update.key}`);
        continue;
      }

      // Skip encrypted placeholders
      if (update.value === '[ENCRYPTED]' && (setting.value_type === 'encrypted' || setting.is_secret)) {
        continue;
      }

      // Validate value based on type
      let validatedValue = update.value;

      switch (setting.value_type) {
        case 'number':
          validatedValue = String(Number(update.value));
          if (isNaN(Number(validatedValue))) {
            errors.push(`Invalid number value for ${update.key}: ${update.value}`);
            continue;
          }
          break;

        case 'boolean':
          if (typeof update.value === 'boolean') {
            validatedValue = String(update.value);
          } else if (update.value === 'true' || update.value === 'false') {
            validatedValue = update.value;
          } else {
            errors.push(`Invalid boolean value for ${update.key}: ${update.value}`);
            continue;
          }
          break;

        case 'json':
          try {
            JSON.parse(update.value);
            validatedValue = update.value;
          } catch {
            errors.push(`Invalid JSON value for ${update.key}`);
            continue;
          }
          break;

        case 'string':
        case 'encrypted':
        default:
          validatedValue = String(update.value);
          break;
      }

      validatedUpdates.push({
        key: update.key,
        value: validatedValue,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    if (validatedUpdates.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No settings to update',
        updated: 0,
      });
    }

    // Update all settings
    const results = await Promise.all(
      validatedUpdates.map(async (update) => {
        const { error } = await supabase
          .from('system_settings')
          .update({
            value: update.value,
            updated_at: new Date().toISOString(),
          })
          .eq('key', update.key);

        return { key: update.key, success: !error, error };
      })
    );

    const failedUpdates = results.filter(r => !r.success);

    if (failedUpdates.length > 0) {
      console.error('[Settings API] Some updates failed:', failedUpdates);
      return NextResponse.json(
        {
          error: 'Some updates failed',
          updated: results.length - failedUpdates.length,
          failed: failedUpdates.length,
          details: failedUpdates,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} settings updated successfully`,
      updated: results.length,
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
