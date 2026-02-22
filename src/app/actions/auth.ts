'use server';

// =============================================
// Auth Server Actions
// Handle authentication operations
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
