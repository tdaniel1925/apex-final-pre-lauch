'use server';

// =============================================
// Login Server Actions
// =============================================

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    const supabase = await createClient();

    // Sign in with password
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Login] Auth error:', error);
      return { error: 'Invalid email or password' };
    }

    if (!data.user) {
      return { error: 'Login failed. Please try again.' };
    }

    // Quick admin check (non-blocking)
    let isAdmin = false;
    try {
      const serviceClient = createServiceClient();
      const { data: admin } = await serviceClient
        .from('admins')
        .select('id')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();

      isAdmin = !!admin;
    } catch (err) {
      console.error('[Login] Admin check error:', err);
      // Continue anyway - default to user dashboard
    }

    // Revalidate cache
    revalidatePath('/', 'layout');

    // Redirect based on role
    redirect(isAdmin ? '/admin' : '/dashboard');
  } catch (error) {
    console.error('[Login] Unexpected error:', error);
    // If it's a redirect error, rethrow it (Next.js uses errors for redirects)
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
