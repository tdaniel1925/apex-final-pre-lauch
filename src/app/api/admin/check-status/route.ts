// =============================================
// Debug endpoint to check admin status
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        error: authError?.message || 'Not authenticated',
      });
    }

    // Get distributor data
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, email, first_name, last_name, is_admin, auth_user_id')
      .eq('auth_user_id', user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      auth_user_id: user.id,
      auth_email: user.email,
      distributor: distributor,
      distributor_error: distError?.message,
      is_admin: distributor?.is_admin || false,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check status',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
