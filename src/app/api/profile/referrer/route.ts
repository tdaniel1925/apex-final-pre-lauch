import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Get referrer ID from query params
    const { searchParams } = new URL(request.url);
    const referrerId = searchParams.get('id');

    if (!referrerId) {
      return NextResponse.json(
        { error: 'Referrer ID required' },
        { status: 400 }
      );
    }

    // Get referrer profile info
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', referrerId)
      .single();

    if (profileError || !profileData) {
      console.error('[API] Error fetching referrer profile:', profileError);
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      );
    }

    // Get referrer extended profile (for photo)
    const { data: extendedData } = await supabase
      .from('user_profile_extended')
      .select('profile_photo_url')
      .eq('user_id', referrerId)
      .single();

    // Get referrer's email from auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(referrerId);

    if (authError) {
      console.error('[API] Error fetching referrer auth data:', authError);
    }

    return NextResponse.json({
      id: profileData.user_id,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      email: authData?.user?.email || 'Not available',
      referral_code: profileData.referral_code,
      tier: profileData.tier,
      points: profileData.points,
      profile_photo_url: extendedData?.profile_photo_url || null,
    });
  } catch (error) {
    console.error('[API] Error fetching referrer info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
