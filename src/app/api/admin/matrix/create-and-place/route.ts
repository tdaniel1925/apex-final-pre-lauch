// =============================================
// Create and Place Rep API
// Admin-only route to create new distributor and place in matrix
// =============================================

import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { checkSlugAvailability } from '@/lib/utils/slug';
import { generateSlug } from '@/lib/utils/slug-client';
import { placeDistributor } from '@/lib/admin/matrix-manager';
import { enrollInCampaign } from '@/lib/email/campaign-service';
import type { Distributor } from '@/lib/types';

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, companyName, parentId } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !parentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Step 1: Check if email already exists
    const { data: existingEmail } = await serviceClient
      .from('distributors')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Step 2: Generate unique slug
    let slug = generateSlug(firstName, lastName);
    let slugAvailable = await checkSlugAvailability(slug);
    let attempt = 1;

    while (!slugAvailable && attempt < 10) {
      slug = `${generateSlug(firstName, lastName)}${attempt}`;
      slugAvailable = await checkSlugAvailability(slug);
      attempt++;
    }

    if (!slugAvailable) {
      return NextResponse.json(
        { success: false, error: 'Could not generate unique username' },
        { status: 500 }
      );
    }

    // Step 3: Check for and clean up any orphaned auth user with this email
    const { data: { users: existingAuthUsers } } = await serviceClient.auth.admin.listUsers();
    const orphanedAuthUser = existingAuthUsers.find(
      u => u.email?.toLowerCase() === email.toLowerCase().trim()
    );

    if (orphanedAuthUser) {
      console.log(`Found orphaned auth user for ${email}, cleaning up...`);
      await serviceClient.auth.admin.deleteUser(orphanedAuthUser.id);
    }

    // Step 4: Create auth user with temporary password
    // Admin will need to reset password or send welcome email with reset link
    const temporaryPassword = `Apex${Date.now()}!`;

    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email for admin-created accounts
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError);
      console.error('Auth error details:', JSON.stringify(authError, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create auth account: ${authError?.message || 'Unknown error'}`,
          details: authError
        },
        { status: 500 }
      );
    }

    // Step 5: Get next rep number (find max and add 1)
    const { data: maxRepData } = await serviceClient
      .from('distributors')
      .select('rep_number')
      .order('rep_number', { ascending: false })
      .limit(1)
      .single();

    const repNumber = (maxRepData?.rep_number || 0) + 1;

    // Step 5.5: Generate unique affiliate code (8-char uppercase random string)
    const generateAffiliateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let affiliateCode = generateAffiliateCode();

    // Ensure uniqueness
    let codeExists = true;
    let attempts = 0;
    while (codeExists && attempts < 10) {
      const { data: existing } = await serviceClient
        .from('distributors')
        .select('affiliate_code')
        .eq('affiliate_code', affiliateCode)
        .single();

      if (!existing) {
        codeExists = false;
      } else {
        affiliateCode = generateAffiliateCode();
        attempts++;
      }
    }

    // Step 6: Create distributor record (without matrix placement yet)
    const { data: distributor, error: distributorError } = await serviceClient
      .from('distributors')
      .insert({
        auth_user_id: authData.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        slug: slug,
        phone: phone?.trim() || null,
        company_name: companyName?.trim() || null,
        rep_number: repNumber,
        affiliate_code: affiliateCode,
        status: 'active',
        licensing_status: 'non_licensed', // Default, admin can change later
        licensing_status_set_at: new Date().toISOString(),
        // ACH/Banking fields (null by default, distributor fills in profile)
        bank_name: null,
        bank_routing_number: null,
        bank_account_number: null,
        bank_account_type: null,
        tax_id: null,
        tax_id_type: null,
        date_of_birth: null,
        ach_verified: false,
        ach_verified_at: null,
      })
      .select()
      .single();

    if (distributorError || !distributor) {
      console.error('Distributor creation error:', distributorError);
      console.error('Distributor error details:', JSON.stringify(distributorError, null, 2));

      // Rollback: Delete auth user
      await serviceClient.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        {
          success: false,
          error: `Failed to create distributor record: ${distributorError?.message || 'Unknown error'}`,
          details: distributorError
        },
        { status: 500 }
      );
    }

    // Step 7: Place distributor in matrix under specified parent
    const placementResult = await placeDistributor(distributor.id, parentId, admin.admin.id);

    if (!placementResult.success) {
      // Rollback: Delete distributor and auth user
      await serviceClient.from('distributors').delete().eq('id', distributor.id);
      await serviceClient.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { success: false, error: placementResult.error },
        { status: 500 }
      );
    }

    // Step 8: Enroll in email campaign with temporary password (optional, don't fail if this fails)
    const enrollResult = await enrollInCampaign(distributor as Distributor, {
      temporaryPassword,
    });

    if (!enrollResult.success) {
      console.error('Email campaign enrollment failed:', enrollResult.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Rep created and placed successfully',
      data: {
        distributor,
        temporaryPassword, // Return so admin can share with rep
      },
    });
  } catch (error) {
    console.error('Error in create-and-place API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
