// =============================================
// Forgot Password API Route
// Uses Supabase built-in password reset
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Use Supabase's built-in password reset
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent'
      });
    }

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
