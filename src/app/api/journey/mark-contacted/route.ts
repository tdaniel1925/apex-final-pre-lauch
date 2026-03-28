import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { personId, contactResult } = body;

    if (!personId) {
      return NextResponse.json(
        { success: false, error: 'Missing personId' },
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

    // Get person to verify ownership
    const { data: person } = await supabase
      .from('journey_prospect_lists')
      .select('distributor_id')
      .eq('id', personId)
      .single();

    if (!person) {
      return NextResponse.json({ success: false, error: 'Person not found' }, { status: 404 });
    }

    // Verify ownership
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id')
      .eq('id', person.distributor_id)
      .eq('auth_user_id', user.id)
      .single();

    if (!distributor) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Mark as contacted
    const { error } = await supabase
      .from('journey_prospect_lists')
      .update({
        contacted: true,
        contact_result: contactResult || 'interested',
        contacted_at: new Date().toISOString(),
      })
      .eq('id', personId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Person marked as contacted',
    });
  } catch (error: any) {
    console.error('[Mark Contacted] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
