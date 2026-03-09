// =============================================
// Exit Impersonate API
// Returns admin to their original account
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('impersonate_admin_id')?.value;

    if (!adminId) {
      return NextResponse.json(
        { error: 'Not currently impersonating' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current impersonated user
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Get admin auth_user_id
    const { data: adminDist } = await supabase
      .from('distributors')
      .select('auth_user_id, email, first_name, last_name')
      .eq('id', adminId)
      .single();

    if (!adminDist || !adminDist.auth_user_id) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 404 }
      );
    }

    // Log impersonation exit
    if (currentUser) {
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_user_id: adminDist.auth_user_id,
          action: 'impersonate_end',
          target_user_id: currentUser.id,
          metadata: {
            duration_seconds: 0, // Could calculate this if needed
          },
        });
    }

    // Generate new session for admin
    const serviceSupabase = createServiceClient();
    const { data: sessionData, error: sessionError } = await serviceSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: adminDist.email,
    });

    if (sessionError || !sessionData) {
      console.error('Error generating admin session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to restore admin session' },
        { status: 500 }
      );
    }

    // Extract tokens
    const url = new URL(sessionData.properties.action_link);
    const access_token = url.searchParams.get('access_token');
    const refresh_token = url.searchParams.get('refresh_token');

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: 'Failed to extract session tokens' },
        { status: 500 }
      );
    }

    // Set admin session
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (setSessionError) {
      console.error('Error setting admin session:', setSessionError);
      return NextResponse.json(
        { error: 'Failed to set admin session' },
        { status: 500 }
      );
    }

    // Clear the impersonation cookie
    cookieStore.delete('impersonate_admin_id');

    return NextResponse.json({
      success: true,
      message: 'Returned to admin account',
    });
  } catch (error) {
    console.error('Exit impersonate error:', error);
    return NextResponse.json(
      { error: 'Failed to exit impersonation' },
      { status: 500 }
    );
  }
}
