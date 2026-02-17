// =============================================
// Sign In API Route
// POST /api/auth/signin
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing credentials',
          message: 'Email and password are required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid email or password',
        } as ApiResponse,
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Signed in successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign in error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Sign in failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
