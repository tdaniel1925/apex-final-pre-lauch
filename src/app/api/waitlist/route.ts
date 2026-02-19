// =============================================
// Waitlist API
// Captures pre-launch email signups
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const { email, sourceSlug } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase.from('waitlist').insert({
      email: email.trim().toLowerCase(),
      source_slug: sourceSlug || null,
    });

    if (error) {
      // Unique violation = already on the list
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'already_registered',
        });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: 'registered' });
  } catch (error: any) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data, count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, waitlist: data, total: count });
  } catch (error: any) {
    console.error('Waitlist fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}
