import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      street_address,
      city,
      state,
      zip_code,
      language,
      timezone,
    } = body;

    // Update user_profiles table (basic info)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        first_name,
        last_name,
        phone,
        city,
        state,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('[API] Error updating user_profiles:', profileError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Update or insert user_profile_extended table (extended info)
    const { error: extendedError } = await supabase
      .from('user_profile_extended')
      .upsert({
        user_id: user.id,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        street_address: street_address || null,
        zip_code: zip_code || null,
        language: language || 'en-US',
        timezone: timezone || 'America/Chicago',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (extendedError) {
      console.error('[API] Error updating user_profile_extended:', extendedError);
      return NextResponse.json(
        { error: 'Failed to update extended profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error updating personal info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
