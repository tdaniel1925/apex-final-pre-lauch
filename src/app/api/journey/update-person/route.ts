import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, name, phone, email, notes } = body;

    if (!id || !name) {
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

    // Get person to verify ownership
    const { data: person } = await supabase
      .from('journey_prospect_lists')
      .select('distributor_id')
      .eq('id', id)
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

    // Update person
    const { error } = await supabase
      .from('journey_prospect_lists')
      .update({
        person_name: name,
        person_phone: phone || null,
        person_email: email || null,
        notes: notes || null,
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Person updated successfully',
    });
  } catch (error: any) {
    console.error('[Update Person] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
