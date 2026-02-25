'use server';

// =============================================
// Auth Server Actions
// Handle authentication operations
// =============================================

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }

  // Clear all cached data
  revalidatePath('/', 'layout');

  redirect('/login');
}
