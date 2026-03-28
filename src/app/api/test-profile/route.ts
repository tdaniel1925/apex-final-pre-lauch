import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated', authError }, { status: 401 });
  }

  // Try to fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // Try to count all profiles (to see if table is accessible)
  const { count, error: countError } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    profileError,
    totalProfilesInTable: count,
    countError,
  });
}
