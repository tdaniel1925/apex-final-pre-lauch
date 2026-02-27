// =============================================
// Reset Password API Route
// Verify token and update password
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { withRateLimit, passwordResetRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting temporarily disabled - Redis not configured
  // const rateLimitResponse = await withRateLimit(request, passwordResetRateLimit);
  // if (rateLimitResponse) return rateLimitResponse;

  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Verify token
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update password using Supabase Admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      resetToken.user_id,
      { password: password }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Verify token endpoint (GET request)
export async function GET(request: NextRequest) {
  // Rate limiting temporarily disabled - Redis not configured
  // const rateLimitResponse = await withRateLimit(request, passwordResetRateLimit);
  // if (rateLimitResponse) return rateLimitResponse;

  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if token exists and is valid
    const { data: resetToken, error } = await supabase
      .from('password_reset_tokens')
      .select('expires_at, used')
      .eq('token', token)
      .single();

    if (error || !resetToken) {
      return NextResponse.json(
        { valid: false, error: 'Invalid reset token' },
        { status: 200 }
      );
    }

    if (resetToken.used) {
      return NextResponse.json(
        { valid: false, error: 'This reset link has already been used' },
        { status: 200 }
      );
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Reset link has expired' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
