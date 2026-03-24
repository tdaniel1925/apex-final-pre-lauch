import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, created_at, is_licensed_agent')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Get team members count (people they enrolled)
    const { count: teamMembers } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('sponsor_id', distributor.id);

    // Get customers count (from members table if it exists)
    const { count: customers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('distributor_id', distributor.id)
      .eq('is_customer', true);

    // Get AI agent info
    const { data: aiAgent } = await supabase
      .from('ai_agents')
      .select('phone_number')
      .eq('distributor_id', distributor.id)
      .single();

    // Get Race to 100 journey progress
    const { data: journey } = await supabase
      .from('onboarding_journey')
      .select('total_points, is_completed')
      .eq('distributor_id', distributor.id)
      .single();

    return NextResponse.json({
      distributor,
      stats: {
        teamMembers: teamMembers || 0,
        customers: customers || 0,
      },
      aiAgent: aiAgent || null,
      journey: journey || null,
    });
  } catch (error) {
    console.error('Error loading user context:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
