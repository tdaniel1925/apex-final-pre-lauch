// =============================================
// Signup API Route
// POST /api/signup
// Creates new distributor with matrix placement
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { signupSchema } from '@/lib/validations/signup';
import { findMatrixPlacement } from '@/lib/matrix/placement';
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
 *   - company_name?: string
 *   - phone?: string
 *   - sponsor_slug?: string
 * 
 * Response:
 *   - distributor: Distributor object
 *   - message: Success message
 */
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

    // Step 6: Find matrix placement
    const placement = await findMatrixPlacement(sponsorId);

    // Step 7: Create distributor record (use service client to bypass RLS)
    const serviceClient = createServiceClient();
    const { data: distributor, error: distributorError } = await serviceClient
      .from('distributors')
      .insert({
        auth_user_id: authData.user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        slug: data.slug,
        company_name: data.company_name || null,
        phone: data.phone || null,
        sponsor_id: sponsorId,
        matrix_parent_id: placement.parent_id,
        matrix_position: placement.matrix_position,
        matrix_depth: placement.matrix_depth,
        is_master: false,
        profile_complete: false,
      })
      .select()
      .single();

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

    // Step 8: Return success
    return NextResponse.json(
      {
        success: true,
        data: {
          distributor: distributor as Distributor,
          matrix_placement: {
            parent_id: placement.parent_id,
            position: placement.matrix_position,
            depth: placement.matrix_depth,
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
