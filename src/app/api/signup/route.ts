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
import { prepareSSNForStorage } from '@/lib/utils/ssn';
import { prepareEINForStorage } from '@/lib/utils/ein';
import { validateDateOfBirth } from '@/lib/utils/date-validation';
import { createReplicatedSites } from '@/lib/integrations/user-sync/service';
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
  let authUserId: string | null = null;
  let distributorId: string | null = null;

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

    // Step 5: Create auth user with email confirmation
    let authData: any;
    let authError: any;

    const signUpResult = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
      },
    });

    authData = signUpResult.data;
    authError = signUpResult.error;

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
          // Auth user exists but no distributor - orphaned account
          console.log('Orphaned auth user detected for email:', data.email);
          console.log('Attempting to complete the signup with existing auth user...');

          // Try to find the orphaned user
          const { data: { users } } = await serviceClient.auth.admin.listUsers();
          const orphanedUser = users?.find(u => u.email === data.email);

          if (orphanedUser) {
            // Found the orphaned user - complete the signup by creating distributor
            console.log('Found orphaned auth user:', orphanedUser.id);
            console.log('Completing signup by creating distributor record...');

            // Use the existing auth user ID and continue with the normal flow
            authUserId = orphanedUser.id;

            // Jump to distributor creation (we'll set authData to simulate successful auth)
            authData = { user: orphanedUser } as any;
          } else {
            // Not found in listUsers - likely soft-deleted (grace period)
            console.log('Orphaned auth user is soft-deleted (grace period active)');

            return NextResponse.json(
              {
                success: false,
                error: 'Account in grace period',
                message: 'This email was recently used. Please use a different email address or contact support.',
              } as ApiResponse,
              { status: 409 }
            );
          }
        }
      }

      // If we didn't recover by finding an orphaned user, return error
      if (!authData || !authData.user) {
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
    }

    // Track auth user for rollback
    authUserId = authData.user.id;

    // Step 5.5: Validate date of birth (for personal registrations)
    if (data.registration_type === 'personal' && data.date_of_birth) {
      const dobValidation = validateDateOfBirth(data.date_of_birth);
      if (!dobValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid date of birth',
            message: dobValidation.error || 'Please provide a valid date of birth',
          } as ApiResponse,
          { status: 400 }
        );
      }
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

    const { data: distributorRows, error: distributorError } = await serviceClient.rpc(
      'create_distributor_atomic',
      {
        p_auth_user_id: authData.user.id,
        p_first_name: data.first_name,
        p_last_name: data.last_name,
        p_email: data.email,
        p_slug: data.slug,
        p_company_name: data.company_name || null,
        p_phone: data.phone || '',
        p_sponsor_id: sponsorId,
        p_licensing_status: data.licensing_status,
        p_licensing_status_set_at: new Date().toISOString(),
        // New fields for business/personal registration
        p_registration_type: data.registration_type,
        p_business_type: data.registration_type === 'business' ? data.business_type : null,
        p_tax_id_type: data.registration_type === 'business' ? 'ein' : 'ssn',
        p_date_of_birth: data.registration_type === 'personal' && data.date_of_birth ? data.date_of_birth : null,
        p_dba_name: data.registration_type === 'business' && data.dba_name ? data.dba_name : null,
        p_business_website: data.registration_type === 'business' && data.business_website ? data.business_website : null,
        p_address_line1: data.address_line1,
        p_address_line2: data.address_line2 || null,
        p_city: data.city,
        p_state: data.state,
        p_zip: data.zip,
        p_bio: data.bio || null, // Bio for AI Voice Agent personalization
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
      console.log('[ROLLBACK] Distributor creation failed, deleting auth user:', authUserId);
      await serviceClient.auth.admin.deleteUser(authUserId!);
      authUserId = null; // Prevent double-rollback in catch block

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

    // Track distributor for rollback
    distributorId = distributor.id;

    // NOTE: Member record is already created by create_distributor_atomic RPC function
    // No need to create it again here (doing so causes duplicate key error)

    // Step 7.6: Store Tax ID (SSN or EIN) in tax_info table
    if (data.registration_type === 'personal' && data.ssn) {
      // Store SSN for personal registrations
      const ssnData = prepareSSNForStorage(data.ssn);

      if (!ssnData.valid) {
        // Rollback: Delete both auth user and distributor
        console.log('[ROLLBACK] Invalid SSN, deleting auth user and distributor');
        await serviceClient.auth.admin.deleteUser(authUserId!);
        await serviceClient
          .from('distributors')
          .delete()
          .eq('id', distributorId!);

        authUserId = null;
        distributorId = null;

        return NextResponse.json(
          {
            success: false,
            error: 'Invalid SSN',
            message: ssnData.error || 'Invalid Social Security Number',
          } as ApiResponse,
          { status: 400 }
        );
      }

      const { error: taxInfoError } = await serviceClient
        .from('distributor_tax_info')
        .insert({
          distributor_id: distributor.id,
          ssn_encrypted: ssnData.encrypted, // Column is still named ssn_encrypted (not tax_id yet)
          ssn_last_4: ssnData.last4,
          tax_id_type: 'ssn',
          created_by: authData.user.id,
        });

      if (taxInfoError) {
        console.error('Tax info creation error (SSN):', taxInfoError);

        // Rollback: Delete both auth user and distributor
        console.log('[ROLLBACK] Tax info creation failed, deleting auth user and distributor');
        await serviceClient.auth.admin.deleteUser(authUserId!);
        await serviceClient
          .from('distributors')
          .delete()
          .eq('id', distributorId!);

        authUserId = null;
        distributorId = null;

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to save tax information',
            message: 'Account creation failed. Please try again.',
          } as ApiResponse,
          { status: 500 }
        );
      }
    } else if (data.registration_type === 'business' && data.ein) {
      // Store EIN for business registrations
      const einData = prepareEINForStorage(data.ein);

      if (!einData.valid) {
        // Rollback: Delete both auth user and distributor
        console.log('[ROLLBACK] Invalid EIN, deleting auth user and distributor');
        await serviceClient.auth.admin.deleteUser(authUserId!);
        await serviceClient
          .from('distributors')
          .delete()
          .eq('id', distributorId!);

        authUserId = null;
        distributorId = null;

        return NextResponse.json(
          {
            success: false,
            error: 'Invalid EIN',
            message: einData.error || 'Invalid Employer Identification Number',
          } as ApiResponse,
          { status: 400 }
        );
      }

      const { error: taxInfoError } = await serviceClient
        .from('distributor_tax_info')
        .insert({
          distributor_id: distributor.id,
          ssn_encrypted: einData.encrypted, // Column is still named ssn_encrypted (stores both SSN and EIN)
          ssn_last_4: einData.last4, // Reusing same column for last 4 digits
          tax_id_type: 'ein',
          created_by: authData.user.id,
        });

      if (taxInfoError) {
        console.error('Tax info creation error (EIN):', taxInfoError);

        // Rollback: Delete both auth user and distributor
        console.log('[ROLLBACK] Tax info creation failed, deleting auth user and distributor');
        await serviceClient.auth.admin.deleteUser(authUserId!);
        await serviceClient
          .from('distributors')
          .delete()
          .eq('id', distributorId!);

        authUserId = null;
        distributorId = null;

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to save tax information',
            message: 'Account creation failed. Please try again.',
          } as ApiResponse,
          { status: 500 }
        );
      }
    }

    // Step 8: Enroll in email campaign and send welcome email
    const enrollResult = await enrollInCampaign(distributor as Distributor);

    if (!enrollResult.success) {
      // Log error but don't fail signup - email can be sent manually later
      console.error('Email campaign enrollment failed:', enrollResult.error);
    }

    // Step 8.5: Create replicated sites on external platforms
    // This runs asynchronously and errors are logged but don't fail signup
    try {
      console.log('[Signup] Creating replicated sites for distributor:', distributor.id);
      await createReplicatedSites(distributor.id);
    } catch (replicationError) {
      // Log error but don't fail signup - sites can be created manually later
      console.error('[Signup] Replicated site creation failed:', replicationError);
    }

    // Step 8.6: Provision AI phone number asynchronously
    // This runs in the background and errors are logged but don't fail signup
    let aiPhoneProvisioned = false;
    try {
      console.log('[Signup] Provisioning AI phone for distributor:', distributor.id);

      // Call provisioning API
      const provisionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/signup/provision-ai`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            distributorId: distributor.id,
            firstName: distributor.first_name,
            lastName: distributor.last_name,
            phone: distributor.phone || '',
            sponsorSlug: data.sponsor_slug,
          }),
        }
      );

      const provisionResult = await provisionResponse.json();

      if (provisionResult.success) {
        console.log('[Signup] AI phone provisioned successfully:', provisionResult.phoneNumber);
        aiPhoneProvisioned = true;
      } else {
        console.error('[Signup] AI phone provisioning failed:', provisionResult.error);
      }
    } catch (aiProvisionError) {
      // Log error but don't fail signup - AI can be provisioned manually later
      console.error('[Signup] AI phone provisioning error:', aiProvisionError);
    }

    // Step 9: Return success with redirect to welcome page if AI was provisioned
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
          aiPhoneProvisioned,
          redirectUrl: aiPhoneProvisioned
            ? `/signup/welcome?distributorId=${distributor.id}`
            : undefined,
        },
        message: 'Account created successfully! Welcome to Apex Affinity Group.',
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('[SIGNUP] Unexpected error in signup route:', error);
    console.error('[SIGNUP] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // CRITICAL: Rollback any partial data
    const serviceClient = createServiceClient();

    if (authUserId) {
      console.log('[ROLLBACK] Deleting auth user:', authUserId);
      try {
        await serviceClient.auth.admin.deleteUser(authUserId);
        console.log('[ROLLBACK] Successfully deleted auth user');
      } catch (rollbackError) {
        console.error('[ROLLBACK] Failed to delete auth user:', rollbackError);
      }
    }

    if (distributorId) {
      console.log('[ROLLBACK] Deleting distributor:', distributorId);
      try {
        await serviceClient.from('members').delete().eq('distributor_id', distributorId);
        await serviceClient.from('distributors').delete().eq('id', distributorId);
        await serviceClient.from('distributor_tax_info').delete().eq('distributor_id', distributorId);
        console.log('[ROLLBACK] Successfully deleted member, distributor and tax info');
      } catch (rollbackError) {
        console.error('[ROLLBACK] Failed to delete distributor:', rollbackError);
      }
    }

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
