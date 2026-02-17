'use server';

// =============================================
// Login Server Actions
// =============================================

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Invalid email or password' };
  }

  // Check if user is admin
  if (data.user) {
    const { data: distributor } = await supabase
      .from('distributors')
      .select('is_master')
      .eq('auth_user_id', data.user.id)
      .single();

    // Revalidate to ensure session is recognized
    revalidatePath('/', 'layout');

    // Redirect admins to admin dashboard, regular users to user dashboard
    if (distributor?.is_master) {
      redirect('/admin');
    }
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
