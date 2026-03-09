import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get notification preferences
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[API] Error fetching notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    // If no preferences exist, return defaults
    if (!data) {
      return NextResponse.json({
        // Commissions & Payouts
        commission_credited_email: true,
        commission_credited_sms: true,
        commission_credited_push: true,
        commission_credited_inapp: true,
        payout_processed_email: true,
        payout_processed_sms: true,
        payout_processed_push: false,
        payout_processed_inapp: true,
        bonus_unlocked_email: true,
        bonus_unlocked_sms: true,
        bonus_unlocked_push: true,
        bonus_unlocked_inapp: true,
        // Team Activity
        new_recruit_email: true,
        new_recruit_sms: true,
        new_recruit_push: true,
        new_recruit_inapp: true,
        team_rankup_email: true,
        team_rankup_sms: false,
        team_rankup_push: true,
        team_rankup_inapp: true,
        team_inactive_email: true,
        team_inactive_sms: false,
        team_inactive_push: false,
        team_inactive_inapp: true,
        // Customers & Orders
        customer_order_email: true,
        customer_order_sms: false,
        customer_order_push: true,
        customer_order_inapp: true,
        autoship_renewal_email: true,
        autoship_renewal_sms: false,
        autoship_renewal_push: false,
        autoship_renewal_inapp: true,
        customer_cancellation_email: true,
        customer_cancellation_sms: true,
        customer_cancellation_push: true,
        customer_cancellation_inapp: true,
        // System & Security
        new_login_email: true,
        new_login_sms: true,
        new_login_push: true,
        new_login_inapp: true,
        corporate_announcements_email: true,
        corporate_announcements_sms: false,
        corporate_announcements_push: true,
        corporate_announcements_inapp: true,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Upsert notification preferences
    const { error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: user.id,
        ...body,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('[API] Error updating notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
