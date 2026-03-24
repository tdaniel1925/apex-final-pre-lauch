import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { distributorId, listType, personName, personPhone, personEmail, notes } = body;

    if (!distributorId || !listType || !personName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id')
      .eq('id', distributorId)
      .eq('auth_user_id', user.id)
      .single();

    if (!distributor) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Check if list already has 10 people
    const { count } = await supabase
      .from('journey_prospect_lists')
      .select('*', { count: 'exact', head: true })
      .eq('distributor_id', distributorId)
      .eq('list_type', listType);

    if (count && count >= 10) {
      return NextResponse.json(
        { success: false, error: 'List is already full (10 people max)' },
        { status: 400 }
      );
    }

    // Add person to list
    const { data: person, error } = await supabase
      .from('journey_prospect_lists')
      .insert({
        distributor_id: distributorId,
        list_type: listType,
        person_name: personName,
        person_phone: personPhone || null,
        person_email: personEmail || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      person,
    });
  } catch (error: any) {
    console.error('[Add to List] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
