// =============================================
// GET /api/apps/nurture/campaigns
// Returns all campaigns + emails for the user
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: campaigns, error } = await supabase
      .from('nurture_campaigns')
      .select('*, nurture_emails(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Campaigns fetch error:', error);
      throw new Error('Failed to load campaigns');
    }

    return NextResponse.json({ success: true, campaigns: campaigns ?? [] });
  } catch (err) {
    console.error('Nurture campaigns error:', err);
    return NextResponse.json({ error: 'Failed to load campaigns.' }, { status: 500 });
  }
}
