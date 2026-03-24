import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { distributorId, mediaType, mediaName } = body;

    if (!distributorId || !mediaType || !mediaName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this distributor account
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id')
      .eq('id', distributorId)
      .eq('auth_user_id', user.id)
      .single();

    if (!distributor) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Mark media as completed
    // For now, we'll just log it - full journey tracking table will be added next
    console.log(`[Media Completed] ${mediaType}: ${mediaName} by distributor ${distributorId}`);

    // TODO: Once journey_media_tracking table exists, insert/update here:
    // await supabase.from('journey_media_tracking').upsert({
    //   distributor_id: distributorId,
    //   media_type: mediaType,
    //   media_name: mediaName,
    //   completed: true,
    //   completed_at: new Date().toISOString(),
    // });

    return NextResponse.json({
      success: true,
      message: `${mediaType} completed successfully`,
    });
  } catch (error: any) {
    console.error('[Complete Media] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
