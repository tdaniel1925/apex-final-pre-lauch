// =============================================
// Forgot Password API Route
// POST /api/auth/forgot-password
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email required',
          message: 'Please provide your email address',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050'}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      // Don't reveal if email exists for security
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, you will receive a reset link',
        } as ApiResponse,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset email sent',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Request failed',
        message: 'Failed to process request. Please try again.',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
