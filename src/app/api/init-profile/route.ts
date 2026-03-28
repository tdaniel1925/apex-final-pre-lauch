import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json({
      message: 'Profile already exists',
      profile_id: existingProfile.id
    });
  }

  // First, create/ensure user exists in users table (for foreign key)
  const { error: usersError } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      created_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
      ignoreDuplicates: false
    });

  if (usersError) {
    return NextResponse.json({
      error: 'Failed to create users table entry',
      details: usersError
    }, { status: 500 });
  }

  // Now create profile
  const { data: newProfile, error: createError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: user.id,
      tier: 'Free',
      points: 0,
    })
    .select()
    .single();

  if (createError) {
    return NextResponse.json({
      error: 'Failed to create profile',
      details: createError
    }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Profile created successfully',
    profile: newProfile
  });
}
