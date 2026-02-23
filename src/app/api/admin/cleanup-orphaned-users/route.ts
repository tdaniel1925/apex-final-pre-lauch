// =============================================
// Cleanup Orphaned Auth Users
// Admin endpoint to remove auth users without distributor records
// =============================================

import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Step 1: Check if distributor exists for this email
    const { data: distributor } = await serviceClient
      .from('distributors')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (distributor) {
      return NextResponse.json({
        success: false,
        error: 'This email has a valid distributor record. Cannot delete.',
      });
    }

    // Step 2: Get auth user by email
    const { data: { users }, error: listError } = await serviceClient.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json(
        { success: false, error: 'Failed to list auth users' },
        { status: 500 }
      );
    }

    const authUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());

    if (!authUser) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned auth user found for this email',
      });
    }

    // Step 3: Delete the orphaned auth user
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(authUser.id);

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete orphaned auth user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Deleted orphaned auth user for ${email}`,
      deletedUserId: authUser.id,
    });
  } catch (error) {
    console.error('Error in cleanup-orphaned-users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check for orphaned users
export async function GET() {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Get all auth users
    const { data: { users }, error: listError } = await serviceClient.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json(
        { success: false, error: 'Failed to list auth users' },
        { status: 500 }
      );
    }

    // Get all distributors
    const { data: distributors } = await serviceClient
      .from('distributors')
      .select('auth_user_id, email');

    const distributorAuthIds = new Set(
      distributors?.map(d => d.auth_user_id).filter(Boolean) || []
    );

    // Find orphaned users (auth users without distributor records)
    const orphanedUsers = users.filter(user => !distributorAuthIds.has(user.id));

    return NextResponse.json({
      success: true,
      orphanedCount: orphanedUsers.length,
      orphanedUsers: orphanedUsers.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
      })),
    });
  } catch (error) {
    console.error('Error checking orphaned users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
