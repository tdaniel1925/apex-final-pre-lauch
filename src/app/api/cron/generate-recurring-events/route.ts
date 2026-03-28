// =====================================================
// Generate Recurring Events Cron Job
// Auto-generates future event instances for active recurring series
// Runs daily at 2 AM via Vercel Cron
// =====================================================

import { createServiceClient } from '@/lib/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Generate event instances for a recurring series
 */
async function generateEventInstances(
  supabase: any,
  recurringEvent: any,
  generateUntil: Date
) {
  const rule = recurringEvent.recurrence_rule;
  const lastGenerated = recurringEvent.last_generated_date
    ? new Date(recurringEvent.last_generated_date)
    : new Date(recurringEvent.start_date);

  const endDate = recurringEvent.end_date ? new Date(recurringEvent.end_date) : null;

  const eventInstances = [];
  let currentDate = new Date(lastGenerated);

  // Start from the next occurrence after last generated
  switch (rule.frequency) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + rule.interval);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + rule.interval * 7);
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + rule.interval);
      break;
  }

  // Generate instances
  let occurrences = 0;
  const maxOccurrences = rule.maxOccurrences || 100;

  while (currentDate <= generateUntil && occurrences < maxOccurrences) {
    // Check if we've passed the end date
    if (endDate && currentDate > endDate) break;

    // For weekly recurrence, check if current day matches daysOfWeek
    if (rule.frequency === 'weekly' && rule.daysOfWeek) {
      if (!rule.daysOfWeek.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
    }

    // Get event template from the series
    // We'll need to fetch the first event from this series to use as template
    const { data: templateEvent } = await supabase
      .from('company_events')
      .select('*')
      .eq('recurring_event_id', recurringEvent.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!templateEvent) {
      console.warn(`No template event found for recurring series ${recurringEvent.id}`);
      break;
    }

    // Create event instance
    const eventDateTime = new Date(currentDate);
    eventDateTime.setHours(12, 0, 0, 0); // Default to noon

    // Copy template but update date/time
    const { id, created_at, updated_at, recurrence_instance_date, ...template } = templateEvent;

    eventInstances.push({
      ...template,
      event_date_time: eventDateTime.toISOString(),
      event_end_time: new Date(
        eventDateTime.getTime() + template.event_duration_minutes * 60000
      ).toISOString(),
      recurrence_instance_date: currentDate.toISOString().split('T')[0],
    });

    occurrences++;

    // Move to next occurrence
    switch (rule.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + rule.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + rule.interval * 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + rule.interval);
        break;
    }
  }

  // Insert event instances
  if (eventInstances.length > 0) {
    const { data: createdEvents, error } = await supabase
      .from('company_events')
      .insert(eventInstances)
      .select('id');

    if (error) {
      throw error;
    }

    // Update recurring_event record
    await supabase
      .from('recurring_events')
      .update({
        last_generated_date: new Date().toISOString().split('T')[0],
        next_generation_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 30 days from now
        total_instances_created: recurringEvent.total_instances_created + eventInstances.length,
      })
      .eq('id', recurringEvent.id);

    return createdEvents;
  }

  return [];
}

export async function GET(request: NextRequest) {
  // Verify this is a Vercel cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('❌ [Recurring Events Cron] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🔄 [Recurring Events Cron] Starting recurring event generation...');

  const supabase = createServiceClient();

  try {
    // Find active recurring series that need event generation
    const today = new Date().toISOString().split('T')[0];

    const { data: seriesToGenerate, error: findError } = await supabase
      .from('recurring_events')
      .select('*')
      .eq('is_active', true)
      .or(`next_generation_date.is.null,next_generation_date.lte.${today}`);

    if (findError) {
      console.error('❌ [Recurring Events Cron] Error finding series:', findError);
      return NextResponse.json(
        { error: 'Database error', details: findError },
        { status: 500 }
      );
    }

    if (!seriesToGenerate || seriesToGenerate.length === 0) {
      console.log('✅ [Recurring Events Cron] No series need generation');
      return NextResponse.json({
        success: true,
        generated: 0,
        message: 'No recurring series need generation',
      });
    }

    console.log(
      `📋 [Recurring Events Cron] Found ${seriesToGenerate.length} series to process`
    );

    // Generate events for each series (90 days ahead)
    const generateUntil = new Date();
    generateUntil.setDate(generateUntil.getDate() + 90);

    let totalGenerated = 0;
    const results = [];

    for (const series of seriesToGenerate) {
      try {
        const createdEvents = await generateEventInstances(supabase, series, generateUntil);

        results.push({
          series_id: series.id,
          series_name: series.series_name,
          generated: createdEvents.length,
        });

        totalGenerated += createdEvents.length;

        console.log(
          `✅ [Recurring Events Cron] Generated ${createdEvents.length} events for "${series.series_name}"`
        );
      } catch (error) {
        console.error(
          `❌ [Recurring Events Cron] Error generating events for series ${series.id}:`,
          error
        );
        results.push({
          series_id: series.id,
          series_name: series.series_name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`✅ [Recurring Events Cron] Total events generated: ${totalGenerated}`);

    return NextResponse.json({
      success: true,
      total_generated: totalGenerated,
      series_processed: seriesToGenerate.length,
      results,
    });
  } catch (error) {
    console.error('❌ [Recurring Events Cron] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
