import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractLast4Digits } from '@/lib/profile/validation';

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

    // Get payment info
    const { data, error } = await supabase
      .from('user_payment_info')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[API] Error fetching payment info:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment info' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || {});
  } catch (error) {
    console.error('[API] Error fetching payment info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      payment_method,
      bank_name,
      account_type,
      routing_number,
      account_number,
      account_holder_name,
      minimum_payout_threshold,
      payout_schedule,
    } = body;

    // Extract last 4 digits of sensitive data
    const routing_number_last4 = routing_number ? extractLast4Digits(routing_number) : null;
    const account_number_last4 = account_number ? extractLast4Digits(account_number) : null;

    // Upsert payment info (store only last 4 digits)
    const { error } = await supabase
      .from('user_payment_info')
      .upsert({
        user_id: user.id,
        payment_method,
        bank_name: bank_name || null,
        account_type: account_type || null,
        routing_number_last4,
        account_number_last4,
        account_holder_name: account_holder_name || null,
        minimum_payout_threshold: minimum_payout_threshold || 50,
        payout_schedule: payout_schedule || 'weekly',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('[API] Error updating payment info:', error);
      return NextResponse.json(
        { error: 'Failed to update payment info' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error updating payment info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
