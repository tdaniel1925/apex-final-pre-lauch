// =============================================
// Prospects API - Public Sign-up Submissions
// POST: Create new prospect from sign-up form
// =============================================

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { z } from 'zod';

const prospectSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('United States'),
  howDidYouHear: z.string().optional(),
  signupEvent: z.string().optional(), // To track which event they signed up at
});

// POST /api/prospects
// Public endpoint for sign-up form submissions
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = prospectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const serviceClient = createServiceClient();

    // Check if email already exists
    const { data: existing } = await serviceClient
      .from('prospects')
      .select('id, status')
      .eq('email', data.email)
      .single();

    if (existing) {
      // If already exists, return success but with a note
      return NextResponse.json({
        success: true,
        message: 'Thank you for your interest! We already have your information and will be in touch soon.',
        alreadyExists: true,
      });
    }

    // Create new prospect
    const { data: prospect, error } = await serviceClient
      .from('prospects')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zipCode || null,
        country: data.country,
        how_did_you_hear: data.howDidYouHear || null,
        signup_event: data.signupEvent || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating prospect:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to submit sign-up. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for signing up! We will be in touch with you via email within 48 hours.',
      prospectId: prospect.id,
    });
  } catch (error) {
    console.error('Error in POST prospects API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
