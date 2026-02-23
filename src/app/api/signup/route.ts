// =============================================
// Signup API Route
// POST /api/signup
// Creates new distributor with matrix placement
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { signupSchema } from '@/lib/validations/signup';
import { checkSlugAvailability } from '@/lib/utils/slug';
import { enrollInCampaign } from '@/lib/email/campaign-service';
import type { ApiResponse, Distributor } from '@/lib/types';

/**
 * POST /api/signup
 *
 * Creates a new distributor account
 *
 * Body:
 *   - first_name: string
 *   - last_name: string
 *   - email: string
 *   - password: string
 *   - slug: string
 *   - licensing_status: 'licensed' | 'non_licensed'
 *   - company_name?: string
 *   - phone?: string
 *   - sponsor_slug?: string
 *
 * Response:
 *   - distributor: Distributor object
 *   - message: Success message
 */
// Max signups per IP per window
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Step 1: Validate request body
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: validationResult.error.issues[0]?.message || 'Invalid input',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = await createClient();
    const serviceClient = createServiceClient();

    // Step 1b: Rate limiting — max 5 signups per IP per 15 minutes
    // DISABLED in development environment for testing
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!isDevelopment) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

      if (ip !== 'unknown') {
        const windowStart = new Date(
          Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
        ).toISOString();

        const { count: recentAttempts } = await serviceClient
          .from('signup_rate_limits')
          .select('*', { count: 'exact', head: true })
          .eq('ip_address', ip)
          .gte('created_at', windowStart);

        if ((recentAttempts || 0) >= RATE_LIMIT_MAX) {
          return NextResponse.json(
            {
              success: false,
              error: 'Too many requests',
              message: 'Too many signup attempts. Please try again in 15 minutes.',
            } as ApiResponse,
            { status: 429 }
          );
        }

        // Record this attempt
        await serviceClient
          .from('signup_rate_limits')
          .insert({ ip_address: ip });

        // Cleanup old entries (keep table lean)
        await serviceClient
          .from('signup_rate_limits')
          .delete()
          .lt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
      }
    }

    // Step 2: Check if email already exists
    const { data: existingEmail } = await supabase
      .from('distributors')
      .select('email')
      .eq('email', data.email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered',
          message: 'An account with this email already exists',
        } as ApiResponse,
        { status: 409 }
      );
    }

    // Step 3: Check if slug is available
    const slugAvailable = await checkSlugAvailability(data.slug);
    if (!slugAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username taken',
          message: 'This username is already taken. Please choose another.',
        } as ApiResponse,
        { status: 409 }
      );
    }

    // Step 4: Look up sponsor if provided
    let sponsorId: string | null = null;
    if (data.sponsor_slug) {
      const { data: sponsor } = await supabase
        .from('distributors')
        .select('id')
        .eq('slug', data.sponsor_slug)
        .single();

      if (!sponsor) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid referral',
            message: 'The referral link is invalid',
          } as ApiResponse,
          { status: 400 }
        );
      }

      sponsorId = sponsor.id;
    }

    // Step 5: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create account',
          message: authError?.message || 'Could not create user account',
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Step 6 + 7: Atomically find placement AND insert distributor in one
    // PostgreSQL transaction with advisory lock — eliminates race condition
    const { data: distributorRows, error: distributorError } = await serviceClient.rpc(
      'create_distributor_atomic',
      {
        p_auth_user_id: authData.user.id,
        p_first_name: data.first_name,
        p_last_name: data.last_name,
        p_email: data.email,
        p_slug: data.slug,
        p_company_name: data.company_name || null,
        p_phone: data.phone || null,
        p_sponsor_id: sponsorId,
        p_licensing_status: data.licensing_status,
        p_licensing_status_set_at: new Date().toISOString(),
      }
    );

    const distributor = Array.isArray(distributorRows) ? distributorRows[0] : distributorRows;

    if (distributorError || !distributor) {
      console.error('Distributor creation error:', distributorError);

      // Rollback: Delete auth user if distributor creation failed
      await serviceClient.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create distributor',
          message: 'Account creation failed. Please try again.',
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Step 8: Enroll in email campaign and send welcome email
    const enrollResult = await enrollInCampaign(distributor as Distributor);

    if (!enrollResult.success) {
      // Log error but don't fail signup - email can be sent manually later
      console.error('Email campaign enrollment failed:', enrollResult.error);
    }

    // Step 9: Return success
    return NextResponse.json(
      {
        success: true,
        data: {
          distributor: distributor as Distributor,
          matrix_placement: {
            parent_id: distributor.matrix_parent_id,
            position: distributor.matrix_position,
            depth: distributor.matrix_depth,
          },
        },
        message: 'Account created successfully! Welcome to Apex Affinity Group.',
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Signup failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
