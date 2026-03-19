'use server';

// =============================================
// Login Server Actions
// =============================================

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rememberMe = formData.get('rememberMe') === 'on';

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createClient();

  // Sign in with password
  // Note: Session duration is controlled by Supabase JWT settings (180 days)
  // The "Remember Me" checkbox is for UX clarity only - sessions persist automatically
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Invalid email or password' };
  }

  // Check if user is admin (use service client to bypass RLS)
  if (data.user) {
    const serviceClient = createServiceClient();

    // Check admins table first
    const { data: admin } = await serviceClient
      .from('admins')
      .select('id')
      .eq('auth_user_id', data.user.id)
      .single();

    // Revalidate to ensure session is recognized
    revalidatePath('/', 'layout');

    // Redirect admins to admin dashboard, distributors to user dashboard
    if (admin) {
      redirect('/admin');
    }
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
