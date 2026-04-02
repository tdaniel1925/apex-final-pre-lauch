import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const { newEmail, password } = await request.json();

    // Validation
    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'New email and password are required' },
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

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Check if new email is already in use
    const serviceClient = createServiceClient();
    const { data: existingUser } = await serviceClient.auth.admin.listUsers();

    const emailExists = existingUser?.users.some(
      (u) => u.email?.toLowerCase() === newEmail.toLowerCase() && u.id !== user.id
    );

    if (emailExists) {
      return NextResponse.json(
        { error: 'This email address is already in use' },
        { status: 400 }
      );
    }

    // Update email in Supabase Auth (no verification required)
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateError) {
      console.error('Error updating email:', updateError);
      return NextResponse.json(
        { error: 'Failed to update email. Please try again.' },
        { status: 500 }
      );
    }

    // Update email in distributors table
    const { error: distError } = await serviceClient
      .from('distributors')
      .update({ email: newEmail })
      .eq('auth_user_id', user.id);

    if (distError) {
      console.error('Error updating distributor email:', distError);
      // Continue anyway - auth email is the primary source
    }

    return NextResponse.json({
      success: true,
      message: 'Email address changed successfully',
      newEmail,
    });
  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
