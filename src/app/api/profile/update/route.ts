// =============================================
// Profile Update API
// Updates distributor profile information
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse, Distributor } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    const data = await request.json();

    // Build update object with only provided fields
    const updateData: any = {};

    // Personal Information
    if (data.first_name) updateData.first_name = data.first_name;
    if (data.last_name) updateData.last_name = data.last_name;
    if (data.company_name !== undefined) updateData.company_name = data.company_name || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;

    // Address
    if (data.address_line1 !== undefined) updateData.address_line1 = data.address_line1 || null;
    if (data.address_line2 !== undefined) updateData.address_line2 = data.address_line2 || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.state !== undefined) updateData.state = data.state || null;
    if (data.zip !== undefined) updateData.zip = data.zip || null;

    // Banking/ACH Information
    if (data.bank_name !== undefined) updateData.bank_name = data.bank_name || null;
    if (data.bank_routing_number !== undefined) updateData.bank_routing_number = data.bank_routing_number || null;
    if (data.bank_account_number !== undefined) updateData.bank_account_number = data.bank_account_number || null;
    if (data.bank_account_type !== undefined) updateData.bank_account_type = data.bank_account_type || null;

    // Tax Information
    if (data.tax_id !== undefined) updateData.tax_id = data.tax_id || null;
    if (data.tax_id_type !== undefined) updateData.tax_id_type = data.tax_id_type || null;
    if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth || null;

    // Extended Profile
    if (data.bio !== undefined) updateData.bio = data.bio || null;
    if (data.social_links !== undefined) updateData.social_links = data.social_links || null;

    // Use service client to update and return updated data
    const serviceClient = createServiceClient();
    const { data: distributor, error } = await serviceClient
      .from('distributors')
      .update(updateData)
      .eq('auth_user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: distributor as Distributor,
      message: 'Profile updated successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' } as ApiResponse,
      { status: 500 }
    );
  }
}
