// =============================================
// Booking Availability API
// Returns available time slots for a given date
// 9am-6pm CT, Mon-Sat, 30-minute sessions with 15-min buffer
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBookedSlots, isCalendarConfigured } from '@/lib/google-calendar/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json(
      { error: 'Date parameter required' },
      { status: 400 }
    );
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json(
      { error: 'Invalid date format. Use YYYY-MM-DD' },
      { status: 400 }
    );
  }

  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();

  // Check if date is Sunday (0) - Saturdays (6) are now allowed
  if (dayOfWeek === 0) {
    return NextResponse.json({ slots: [] });
  }

  // Check if date is in the past or within 24 hours
  const now = new Date();
  const minBookingDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  if (dateObj < minBookingDate) {
    return NextResponse.json({ slots: [] });
  }

  // Generate all possible time slots (9am - 6pm CT, 30-minute intervals with 15-min buffer)
  // This creates slots at: 9:00, 9:45, 10:30, 11:15, 12:00, 12:45, 1:30, 2:15, 3:00, 3:45, 4:30, 5:15
  const allSlots = [
    '09:00:00',
    '09:45:00',
    '10:30:00',
    '11:15:00',
    '12:00:00',
    '12:45:00',
    '13:30:00',
    '14:15:00',
    '15:00:00',
    '15:45:00',
    '16:30:00',
    '17:15:00', // Last slot starts at 5:15pm, ends at 5:45pm
  ];

  try {
    const supabase = await createClient();

    // Get existing bookings from database for this date
    const { data: bookings, error } = await supabase
      .from('onboarding_sessions')
      .select('scheduled_time')
      .eq('scheduled_date', date)
      .in('status', ['scheduled', 'confirmed']); // Don't block cancelled/completed slots

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to load availability' },
        { status: 500 }
      );
    }

    // Extract booked time slots from database
    const bookedTimes = new Set(
      bookings?.map((b) => b.scheduled_time) || []
    );

    // Also check Google Calendar if configured
    if (isCalendarConfigured()) {
      try {
        const startOfDay = new Date(date + 'T00:00:00');
        const endOfDay = new Date(date + 'T23:59:59');
        const calendarSlots = await getBookedSlots(startOfDay, endOfDay);

        // Add Google Calendar booked times to our set
        calendarSlots.forEach((slot) => {
          const time = slot.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Chicago',
          });
          bookedTimes.add(time);
        });
      } catch (error) {
        // Log error but don't fail - fallback to database-only availability
        console.error('Error checking Google Calendar availability:', error);
      }
    }

    // Filter out booked slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.has(slot)
    );

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error('Error in availability API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
