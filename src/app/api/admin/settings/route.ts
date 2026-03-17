// =============================================
// Admin Settings API - List All Settings
// GET /api/admin/settings
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin();

    const supabase = await createClient();

    // Fetch all settings
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (error) {
      console.error('[Settings API] Error fetching settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings', details: error.message },
        { status: 500 }
      );
    }

    // Group by category and mask secrets
    const groupedSettings: Record<string, any[]> = {};

    settings?.forEach((setting) => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = [];
      }

      // Mask encrypted/secret values
      const maskedSetting = {
        ...setting,
        value: setting.value_type === 'encrypted' || setting.is_secret
          ? '[ENCRYPTED]'
          : setting.value,
      };

      groupedSettings[setting.category].push(maskedSetting);
    });

    return NextResponse.json({
      success: true,
      settings: groupedSettings,
      total: settings?.length || 0,
    });

  } catch (error: any) {
    console.error('[Settings API] Unexpected error:', error);

    // Handle auth errors
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
