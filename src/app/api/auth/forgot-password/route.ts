// =============================================
// Forgot Password API Route
// Send password reset email via Supabase Auth
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists (using service client to bypass RLS)
    const serviceClient = createServiceClient();
    const { data: distributor } = await serviceClient
      .from('distributors')
      .select('id, first_name, email, auth_user_id')
      .eq('email', email.toLowerCase())
      .single();

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!distributor || !distributor.auth_user_id) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent'
      });
    }

    // Generate password reset token using Supabase Auth
    // Supabase will send an email with a magic link that includes the token
    const supabase = await createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050'}/reset-password`,
    });

    if (resetError) {
      console.error('Error generating reset token:', resetError);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    // Supabase sends its own email with the magic link
    // The email will contain a link like: /reset-password#access_token=...&type=recovery
    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
