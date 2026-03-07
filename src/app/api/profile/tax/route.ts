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

    // Get tax info
    const { data, error } = await supabase
      .from('user_tax_info')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[API] Error fetching tax info:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tax info' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || {});
  } catch (error) {
    console.error('[API] Error fetching tax info:', error);
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
      taxpayer_id_type,
      tax_id,
      legal_name,
      business_name,
      federal_tax_classification,
    } = body;

    // Extract last 4 digits of tax ID
    const tax_id_last4 = tax_id ? extractLast4Digits(tax_id) : null;

    // Upsert tax info (store only last 4 digits)
    const { error } = await supabase
      .from('user_tax_info')
      .upsert({
        user_id: user.id,
        taxpayer_id_type: taxpayer_id_type || null,
        tax_id_last4,
        legal_name: legal_name || null,
        business_name: business_name || null,
        federal_tax_classification: federal_tax_classification || 'individual',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('[API] Error updating tax info:', error);
      return NextResponse.json(
        { error: 'Failed to update tax info' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error updating tax info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
