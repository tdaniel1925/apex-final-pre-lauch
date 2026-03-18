/**
 * Comprehensive Profile Update API
 * Handles updates to name, address, phone, and company information
 * Email and banking changes use separate endpoints with additional security
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  personalInfoSchema,
  addressSchema,
  extractLast4,
} from '@/lib/validation/profile-schemas';
import {
  queueMultiPlatformSync,
  logProfileChange,
} from '@/lib/services/profile-sync-service';
import { z } from 'zod';

// Schema for safe profile updates (excludes email and banking)
const safeProfileUpdateSchema = z.object({
  // Personal info (excluding email)
  first_name: personalInfoSchema.shape.first_name.optional(),
  last_name: personalInfoSchema.shape.last_name.optional(),
  phone: personalInfoSchema.shape.phone.optional(),
  date_of_birth: personalInfoSchema.shape.date_of_birth.optional(),
  company_name: personalInfoSchema.shape.company_name.optional(),

  // Address
  address_line1: addressSchema.shape.address_line1.optional(),
  address_line2: addressSchema.shape.address_line2.optional(),
  city: addressSchema.shape.city.optional(),
  state: addressSchema.shape.state.optional(),
  zip: addressSchema.shape.zip.optional(),
});

type SafeProfileUpdate = z.infer<typeof safeProfileUpdateSchema>;

export async function PUT(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = safeProfileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // 3. Get current distributor data
    const serviceClient = createServiceClient();
    const { data: currentDistributor, error: fetchError } = await serviceClient
      .from('distributors')
      .select('id, auth_user_id, first_name, last_name, email, phone, company_name, address_line1, address_line2, city, state, zip, date_of_birth, is_licensed_agent')
      .eq('auth_user_id', user.id)
      .single();

    if (fetchError || !currentDistributor) {
      console.error('Failed to fetch distributor:', fetchError);
      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // 4. Determine what changed
    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};
    let hasNameChange = false;
    let hasAddressChange = false;
    let hasPhoneChange = false;

    for (const [key, value] of Object.entries(updates)) {
      const currentValue = currentDistributor[key as keyof typeof currentDistributor];
      if (currentValue !== value) {
        oldValues[key] = currentValue;
        newValues[key] = value;

        if (key === 'first_name' || key === 'last_name') {
          hasNameChange = true;
        } else if (['address_line1', 'address_line2', 'city', 'state', 'zip'].includes(key)) {
          hasAddressChange = true;
        } else if (key === 'phone') {
          hasPhoneChange = true;
        }
      }
    }

    // If nothing actually changed, return early
    if (Object.keys(newValues).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes detected',
        distributor: currentDistributor,
      });
    }

    // 5. Update distributors table
    const { data: updatedDistributor, error: updateError } = await serviceClient
      .from('distributors')
      .update(updates)
      .eq('id', currentDistributor.id)
      .select()
      .single();

    if (updateError || !updatedDistributor) {
      console.error('Failed to update distributor:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile - Database error' },
        { status: 500 }
      );
    }

    // 6. Update members table if name changed
    if (hasNameChange) {
      const newFirstName = updates.first_name ?? currentDistributor.first_name;
      const newLastName = updates.last_name ?? currentDistributor.last_name;
      const fullName = `${newFirstName} ${newLastName}`;

      const { error: memberUpdateError } = await serviceClient
        .from('members')
        .update({
          full_name: fullName,
          member_name: fullName,
        })
        .eq('distributor_id', currentDistributor.id);

      if (memberUpdateError) {
        console.error('Failed to update member name:', memberUpdateError);
        // Log error but don't fail the request (members table is denormalized)
      }
    }

    // 7. Determine change type for audit log
    let changeType: 'personal_info' | 'address' = 'personal_info';
    if (hasAddressChange && !hasNameChange && !hasPhoneChange) {
      changeType = 'address';
    }

    // 8. Log to audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await logProfileChange(
      currentDistributor.id,
      user.id,
      changeType,
      oldValues,
      newValues,
      hasNameChange ? 'medium' : 'low',
      'User updated profile via dashboard',
      ipAddress,
      userAgent
    );

    // 9. Queue external platform sync
    const syncData = {
      first_name: updatedDistributor.first_name,
      last_name: updatedDistributor.last_name,
      email: updatedDistributor.email, // Email doesn't change in this endpoint
      phone: updatedDistributor.phone,
      address_line1: updatedDistributor.address_line1,
      address_line2: updatedDistributor.address_line2,
      city: updatedDistributor.city,
      state: updatedDistributor.state,
      zip: updatedDistributor.zip,
      company_name: updatedDistributor.company_name,
    };

    // Determine which platforms need syncing
    let platformChangeType: 'name' | 'phone' | 'address' | 'all' = 'all';
    if (hasNameChange && !hasAddressChange && !hasPhoneChange) {
      platformChangeType = 'name';
    } else if (hasPhoneChange && !hasNameChange && !hasAddressChange) {
      platformChangeType = 'phone';
    } else if (hasAddressChange && !hasNameChange && !hasPhoneChange) {
      platformChangeType = 'address';
    }

    const syncResults = await queueMultiPlatformSync(
      currentDistributor.id,
      platformChangeType,
      syncData,
      currentDistributor.is_licensed_agent || false
    );

    // Log sync queue results (but don't fail if queueing fails)
    const failedSyncs = syncResults.filter(r => !r.success);
    if (failedSyncs.length > 0) {
      console.warn('Some platform syncs failed to queue:', failedSyncs);
    }

    // 10. Return success
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      distributor: updatedDistributor,
      changes: {
        updated: Object.keys(newValues),
        count: Object.keys(newValues).length,
      },
      sync: {
        queued: syncResults.filter(r => r.success).length,
        failed: failedSyncs.length,
        platforms: syncResults.map(r => r.platform),
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current profile data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const serviceClient = createServiceClient();
    const { data: distributor, error: fetchError } = await serviceClient
      .from('distributors')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        company_name,
        address_line1,
        address_line2,
        city,
        state,
        zip,
        date_of_birth,
        profile_photo_url,
        created_at,
        is_licensed_agent
      `)
      .eq('auth_user_id', user.id)
      .single();

    if (fetchError || !distributor) {
      console.error('Failed to fetch distributor:', fetchError);
      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Get recent changes from audit log
    const { data: recentChanges } = await serviceClient
      .from('profile_change_audit_log')
      .select('change_type, created_at, severity')
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      distributor,
      recentChanges: recentChanges || [],
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
