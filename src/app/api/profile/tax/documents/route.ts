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

    // Get tax documents (1099s)
    const { data, error } = await supabase
      .from('user_tax_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('tax_year', { ascending: false });

    if (error) {
      console.error('[API] Error fetching tax documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tax documents' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[API] Error fetching tax documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
