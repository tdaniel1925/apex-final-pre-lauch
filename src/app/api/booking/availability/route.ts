// =============================================
// Booking Availability API
// Returns available time slots for a given date
// 9am-7pm CT, Mon-Fri, 60-minute sessions
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  // Check if date is a weekend
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return NextResponse.json({ slots: [] });
  }

  // Generate all possible time slots (9am - 7pm CT, 60-minute intervals)
  const allSlots = [
    '09:00:00',
    '10:00:00',
    '11:00:00',
    '12:00:00',
    '13:00:00',
    '14:00:00',
    '15:00:00',
    '16:00:00',
    '17:00:00',
    '18:00:00',
    '19:00:00', // 7pm
  ];

  try {
    const supabase = await createClient();

    // Get existing bookings for this date
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

    // Extract booked time slots
    const bookedTimes = new Set(
      bookings?.map((b) => b.scheduled_time) || []
    );

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
