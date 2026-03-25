import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/settings/invitation-restrictions
 * Get current invitation restriction setting
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin status
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get setting using service client
    const serviceClient = createServiceClient();
    const { data: setting, error } = await serviceClient
      .from('system_settings')
      .select('value')
      .eq('key', 'disable_invitation_restrictions')
      .single();

    if (error) {
      console.error('[Admin Settings] Error fetching setting:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch setting' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      disabled: setting?.value === 'true',
    });
  } catch (error: any) {
    console.error('[Admin Settings] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings/invitation-restrictions
 * Update invitation restriction setting
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin status
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { disabled } = body;

    if (typeof disabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid value: disabled must be boolean' },
        { status: 400 }
      );
    }

    // Update setting using service client
    const serviceClient = createServiceClient();
    const { error: updateError } = await serviceClient
      .from('system_settings')
      .update({
        value: disabled ? 'true' : 'false',
        updated_by: user.id,
      })
      .eq('key', 'disable_invitation_restrictions');

    if (updateError) {
      console.error('[Admin Settings] Error updating setting:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update setting' },
        { status: 500 }
      );
    }

    // Log the change
    console.log(
      `[Admin Settings] Invitation restrictions ${disabled ? 'disabled' : 'enabled'} by admin ${user.email}`
    );

    return NextResponse.json({
      success: true,
      message: `Invitation restrictions ${disabled ? 'disabled' : 'enabled'}`,
      disabled,
    });
  } catch (error: any) {
    console.error('[Admin Settings] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
