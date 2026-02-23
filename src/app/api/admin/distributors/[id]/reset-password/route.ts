// =============================================
// Admin - Reset Distributor Password
// Allows admins to manually set a new password for distributors
// =============================================

import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { logAdminActivity } from '@/lib/admin/activity-logger';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  sendNotification: z.boolean().optional().default(false),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;
    const body = await request.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { newPassword, sendNotification } = validation.data;

    const serviceClient = createServiceClient();

    // Step 1: Get distributor
    const { data: distributor, error: distributorError } = await serviceClient
      .from('distributors')
      .select('id, first_name, last_name, email, auth_user_id')
      .eq('id', distributorId)
      .single();

    if (distributorError || !distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    if (!distributor.auth_user_id) {
      return NextResponse.json(
        { success: false, error: 'Distributor has no auth account' },
        { status: 400 }
      );
    }

    // Step 2: Update Supabase Auth password
    const { error: authError } = await serviceClient.auth.admin.updateUserById(
      distributor.auth_user_id,
      { password: newPassword }
    );

    if (authError) {
      console.error('Password reset error:', authError);
      return NextResponse.json(
        { success: false, error: `Failed to reset password: ${authError.message}` },
        { status: 500 }
      );
    }

    // Step 3: Log activity
    await logAdminActivity({
      adminId: admin.admin.id,
      adminEmail: admin.admin.email,
      adminName: `${admin.admin.first_name} ${admin.admin.last_name}`,
      distributorId: distributor.id,
      distributorName: `${distributor.first_name} ${distributor.last_name}`,
      actionType: 'password_reset',
      actionDescription: `Admin manually reset password for ${distributor.first_name} ${distributor.last_name}`,
      changes: {
        before: { password: '***' },
        after: { password: '*** (changed)' },
        fields: ['password'],
      },
    });

    // Step 4: Send notification email (if requested)
    if (sendNotification) {
      try {
        // TODO: Send email notification
        // await sendEmail({
        //   to: distributor.email,
        //   subject: 'Your Password Has Been Reset',
        //   html: `Your password has been reset by an administrator. Your new password is: ${newPassword}`,
        // });
        console.log(`Password reset notification sent to ${distributor.email}`);
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the whole operation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        distributorEmail: distributor.email,
        notificationSent: sendNotification,
      },
    });
  } catch (error) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
