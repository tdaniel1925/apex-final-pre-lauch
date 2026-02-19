// =============================================
// Server-Side Auth Helpers
// Get current authenticated user/distributor
// =============================================

import { createClient } from '@/lib/supabase/server';

/**
 * Get current authenticated distributor from session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: distributor } = await supabase
    .from('distributors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  return distributor;
}
