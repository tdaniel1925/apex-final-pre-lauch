// =====================================================
// Event Cleanup Cron Job
// Auto-archives events 2 hours after they end
// Runs every hour via Vercel Cron
// =====================================================

import { createServiceClient } from '@/lib/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify this is a Vercel cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('❌ [Cleanup Cron] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🧹 [Cleanup Cron] Starting event cleanup...');

  const supabase = createServiceClient();

  try {
    // Calculate cutoff time: 2 hours ago
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 2);

    console.log(`🕐 [Cleanup Cron] Cutoff time: ${cutoffTime.toISOString()}`);

    // Find events that ended more than 2 hours ago and aren't already archived
    // Event end time = event_date_time + event_duration_minutes
    const { data: eventsToArchive, error: findError } = await supabase
      .from('company_events')
      .select('id, title, event_date_time, event_duration_minutes')
      .is('archived_at', null)
      .lte('event_date_time', cutoffTime.toISOString());

    if (findError) {
      console.error('❌ [Cleanup Cron] Error finding events:', findError);
      return NextResponse.json(
        { error: 'Database error', details: findError },
        { status: 500 }
      );
    }

    if (!eventsToArchive || eventsToArchive.length === 0) {
      console.log('✅ [Cleanup Cron] No events to archive');
      return NextResponse.json({
        success: true,
        archived: 0,
        message: 'No events to archive',
      });
    }

    // Filter events where end time + 2 hours < now
    const now = new Date();
    const eventsToArchiveFiltered = eventsToArchive.filter((event) => {
      const eventStart = new Date(event.event_date_time);
      const eventEnd = new Date(
        eventStart.getTime() + event.event_duration_minutes * 60000
      );
      const archiveTime = new Date(eventEnd.getTime() + 2 * 60 * 60000); // +2 hours

      return archiveTime <= now;
    });

    console.log(
      `📋 [Cleanup Cron] Found ${eventsToArchiveFiltered.length} events to archive`
    );

    if (eventsToArchiveFiltered.length === 0) {
      return NextResponse.json({
        success: true,
        archived: 0,
        message: 'No events past 2-hour threshold',
      });
    }

    // Archive the events (soft delete)
    const eventIds = eventsToArchiveFiltered.map((e) => e.id);
    const { data: archivedEvents, error: archiveError } = await supabase
      .from('company_events')
      .update({ archived_at: new Date().toISOString() })
      .in('id', eventIds)
      .select('id, title');

    if (archiveError) {
      console.error('❌ [Cleanup Cron] Error archiving events:', archiveError);
      return NextResponse.json(
        { error: 'Archive failed', details: archiveError },
        { status: 500 }
      );
    }

    console.log(
      `✅ [Cleanup Cron] Archived ${archivedEvents?.length || 0} events:`
    );
    archivedEvents?.forEach((event) => {
      console.log(`   - ${event.title} (${event.id})`);
    });

    return NextResponse.json({
      success: true,
      archived: archivedEvents?.length || 0,
      events: archivedEvents?.map((e) => ({ id: e.id, title: e.title })),
      message: `Successfully archived ${archivedEvents?.length || 0} events`,
    });
  } catch (error) {
    console.error('❌ [Cleanup Cron] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
