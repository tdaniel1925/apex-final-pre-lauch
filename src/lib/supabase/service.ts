// =============================================
// Supabase Service Client
// Uses service role key - bypasses RLS
// Use ONLY for admin operations like matrix placement
// =============================================

import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with service role privileges
 *
 * WARNING: This bypasses Row Level Security!
 * Only use for trusted server-side operations.
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase service credentials. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
