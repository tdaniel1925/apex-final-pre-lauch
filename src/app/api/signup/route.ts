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

    // Step 4: Look up sponsor if provided, otherwise use master distributor
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
    } else {
      // No sponsor provided - assign to master distributor (apex-vision)
      const { data: masterDistributor } = await supabase
        .from('distributors')
        .select('id')
        .eq('is_master', true)
        .single();

      if (masterDistributor) {
        sponsorId = masterDistributor.id;
        console.log('No sponsor provided - assigning to master distributor:', masterDistributor.id);
      }
    }

    // Step 5: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      // Handle case where auth user exists but no distributor (orphaned auth user)
      if (authError?.message?.includes('already registered') || authError?.code === 'user_already_exists') {
        // Try to find if distributor exists
        const { data: existingDist } = await supabase
          .from('distributors')
          .select('id')
          .eq('email', data.email)
          .single();

        if (!existingDist) {
          // Auth user exists but no distributor - orphaned account, clean it up
          console.log('Cleaning up orphaned auth user for email:', data.email);

          // Get the auth user ID to delete
          const { data: { users } } = await serviceClient.auth.admin.listUsers();
          const orphanedUser = users?.find(u => u.email === data.email);

          if (orphanedUser) {
            await serviceClient.auth.admin.deleteUser(orphanedUser.id);
            console.log('Deleted orphaned auth user, please try signing up again');
          }

          return NextResponse.json(
            {
              success: false,
              error: 'Account cleanup required',
              message: 'An incomplete signup was detected and cleaned up. Please try again.',
            } as ApiResponse,
            { status: 409 }
          );
        }
      }

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
    console.log('[SIGNUP] Calling create_distributor_atomic with params:', {
      auth_user_id: authData.user.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      slug: data.slug,
      sponsor_id: sponsorId,
    });

    const { data: distributorRows, error: distributorError} = await serviceClient.rpc(
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
        p_tax_id: data.tax_id,
        p_tax_id_type: data.tax_id_type,
        p_date_of_birth: data.date_of_birth,
      }
    );

    console.log('[SIGNUP] RPC response:', {
      hasData: !!distributorRows,
      hasError: !!distributorError,
      errorCode: distributorError?.code,
      errorMessage: distributorError?.message
    });

    const distributor = Array.isArray(distributorRows) ? distributorRows[0] : distributorRows;

    if (distributorError || !distributor) {
      console.error('Distributor creation error:', distributorError);
      console.error('Full error details:', JSON.stringify(distributorError, null, 2));
      console.error('Distributor data:', distributor);

      // Rollback: Delete auth user if distributor creation failed
      await serviceClient.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create distributor',
          message: `Account creation failed: ${distributorError?.message || 'Unknown error'}. Please try again.`,
          details: process.env.NODE_ENV === 'development' ? distributorError : undefined,
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Step 7b: Save agreement signature
    if (data.signature && data.agreed_to_terms) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        null;

      const { error: agreementError } = await serviceClient
        .from('distributor_agreements')
        .insert({
          distributor_id: distributor.id,
          agreement_type: 'distributor_agreement',
          agreement_version: '1.0',
          agreed_at: new Date().toISOString(),
          ip_address: ip,
          signature_text: data.signature,
        });

      if (agreementError) {
        console.error('Failed to save agreement signature:', agreementError);
        // Log error but don't fail signup - signature can be captured later
      }
    }

    // Step 8: Send email verification (REQUIRED before dashboard access)
    const { sendVerificationEmail } = await import('@/lib/email/send-verification');
    const verifyEmailResult = await sendVerificationEmail({
      distributorId: distributor.id,
      email: distributor.email,
      firstName: distributor.first_name,
      lastName: distributor.last_name,
    });

    if (!verifyEmailResult.success) {
      console.error('Verification email failed:', verifyEmailResult.error);
      // Continue with signup but warn user
    }

    // Step 8b: Send welcome email with login credentials
    const { sendWelcomeEmail } = await import('@/lib/email/send-welcome');
    const welcomeResult = await sendWelcomeEmail({
      id: distributor.id,
      first_name: distributor.first_name,
      last_name: distributor.last_name,
      email: distributor.email,
    });

    if (!welcomeResult.success) {
      // Log error but don't fail signup - email can be sent manually later
      console.error('Welcome email failed:', welcomeResult.error);
    }

    // Step 8c: Notify sponsor if this distributor has a sponsor
    if (sponsorId) {
      const { sendSponsorNotification } = await import('@/lib/email/send-sponsor-notification');
      const sponsorNotifyResult = await sendSponsorNotification({
        newDistributor: distributor as Distributor,
        sponsorId: sponsorId,
      });

      if (!sponsorNotifyResult.success) {
        // Log error but don't fail signup - notification is not critical
        console.error('Sponsor notification failed:', sponsorNotifyResult.error);
      }
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
    console.error('[SIGNUP] Unexpected error in signup route:', error);
    console.error('[SIGNUP] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: false,
        error: 'Signup failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined
        })
      } as ApiResponse,
      { status: 500 }
    );
  }
}
