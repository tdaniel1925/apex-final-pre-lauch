// =============================================
// Admin API: Change Distributor Email
// Updates email in both Supabase Auth and database
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { id: distributorId } = await params;
    const body = await request.json();
    const { newEmail } = body;

    // Validate input
    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json(
        { error: 'New email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get distributor to verify they exist
    const { data: distributor, error: distributorError } = await serviceClient
      .from('distributors')
      .select('auth_user_id, email')
      .eq('id', distributorId)
      .single();

    if (distributorError || !distributor) {
      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Check if email is already in use
    const { data: existingUser } = await serviceClient.auth.admin.listUsers();
    const emailExists = existingUser?.users.some(
      (user) => user.email?.toLowerCase() === newEmail.toLowerCase()
    );

    if (emailExists) {
      return NextResponse.json(
        { error: 'This email address is already in use' },
        { status: 400 }
      );
    }

    // Update email in Supabase Auth
    // This will send a verification email to the new address
    const { data: authData, error: authError } = await serviceClient.auth.admin.updateUserById(
      distributor.auth_user_id,
      {
        email: newEmail,
        email_confirm: false, // Require email verification
      }
    );

    if (authError) {
      console.error('Error updating auth email:', authError);
      return NextResponse.json(
        { error: 'Failed to update email in authentication system' },
        { status: 500 }
      );
    }

    // Update email in distributors table
    const { error: dbError } = await serviceClient
      .from('distributors')
      .update({ email: newEmail })
      .eq('id', distributorId);

    if (dbError) {
      console.error('Error updating distributor email:', dbError);
      // Try to rollback auth change
      await serviceClient.auth.admin.updateUserById(distributor.auth_user_id, {
        email: distributor.email,
      });
      return NextResponse.json(
        { error: 'Failed to update email in database' },
        { status: 500 }
      );
    }

    // Log the email change in activity log
    await serviceClient.from('distributor_activity_log').insert({
      distributor_id: distributorId,
      action: 'email_changed',
      details: {
        old_email: distributor.email,
        new_email: newEmail,
        changed_by_admin: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email updated successfully. User will receive a verification email.',
      newEmail,
    });
  } catch (error: any) {
    console.error('Error in change-email endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
