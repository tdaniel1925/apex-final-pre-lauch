// =============================================
// Admin Impersonate API
// Allows admins to log in as any user
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current admin user
    const { data: { user: adminUser }, error: adminError } = await supabase.auth.getUser();
    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if current user is an admin
    const { data: adminData, error: adminCheckError } = await supabase
      .from('distributors')
      .select('role, is_admin')
      .eq('auth_user_id', adminUser.id)
      .single();

    console.log('[Impersonate] Admin check:', { adminData, adminCheckError, userId: adminUser.id });

    if (!adminData || (!adminData.is_admin && adminData.role !== 'admin')) {
      console.log('[Impersonate] Access denied - not admin');
      return NextResponse.json(
        { error: `Admin access required. Your role: ${adminData?.role}, is_admin: ${adminData?.is_admin}` },
        { status: 403 }
      );
    }

    // Get target user ID from request
    const { target_user_id } = await request.json();
    if (!target_user_id) {
      return NextResponse.json(
        { error: 'Target user ID required' },
        { status: 400 }
      );
    }

    // Get target distributor info
    const { data: targetDist } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, auth_user_id')
      .eq('id', target_user_id)
      .single();

    if (!targetDist || !targetDist.auth_user_id) {
      return NextResponse.json(
        { error: 'User not found or has no auth account' },
        { status: 404 }
      );
    }

    // Log impersonation event
    await supabase
      .from('admin_activity_logs')
      .insert({
        admin_user_id: adminUser.id,
        action: 'impersonate_start',
        target_user_id: targetDist.id,
        metadata: {
          target_email: targetDist.email,
          target_name: `${targetDist.first_name} ${targetDist.last_name}`,
        },
      });

    // Store the original admin user ID in a cookie
    const cookieStore = await cookies();
    cookieStore.set('impersonate_admin_id', adminUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Sign in as target user (using service role to bypass auth)
    const serviceSupabase = createServiceClient();
    const { data: sessionData, error: sessionError } = await serviceSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: targetDist.email,
    });

    if (sessionError || !sessionData) {
      console.error('Error generating magic link:', sessionError);
      return NextResponse.json(
        { error: 'Failed to generate session' },
        { status: 500 }
      );
    }

    // Extract the session tokens from the magic link
    const url = new URL(sessionData.properties.action_link);
    const access_token = url.searchParams.get('access_token');
    const refresh_token = url.searchParams.get('refresh_token');

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: 'Failed to extract session tokens' },
        { status: 500 }
      );
    }

    // Set the session using the tokens
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (setSessionError) {
      console.error('Error setting session:', setSessionError);
      return NextResponse.json(
        { error: 'Failed to set session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Now impersonating ${targetDist.first_name} ${targetDist.last_name}`,
    });
  } catch (error) {
    console.error('Impersonate error:', error);
    return NextResponse.json(
      { error: 'Failed to impersonate user' },
      { status: 500 }
    );
  }
}
