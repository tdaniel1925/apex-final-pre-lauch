// =============================================
// Sign In API Route
// POST /api/auth/signin
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options);
          },
        },
      }
    );

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
