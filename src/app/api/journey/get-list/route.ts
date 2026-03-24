import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get('distributorId');
    const listType = searchParams.get('listType');

    if (!distributorId || !listType) {
      return NextResponse.json(
        { success: false, error: 'Missing parameters' },
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

    // Get list
    const { data: people, error } = await supabase
      .from('journey_prospect_lists')
      .select('*')
      .eq('distributor_id', distributorId)
      .eq('list_type', listType)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      people: people || [],
    });
  } catch (error: any) {
    console.error('[Get List] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
