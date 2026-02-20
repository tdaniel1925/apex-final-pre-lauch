// =============================================
// Training Subscription API
// Manage user training delivery preferences
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UpdateSubscriptionInput } from '@/types/training';

// GET /api/training/subscription - Get current user's subscription
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('training_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no subscription exists, return default
    if (error || !data) {
      return NextResponse.json({
        user_id: user.id,
        delivery_frequency: 'weekly',
        delivery_email: true,
        delivery_sms: false,
        delivery_in_app: true,
        preferred_time: null,
        timezone: 'America/New_York',
        is_active: false,
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/training/subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/training/subscription - Create or update subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateSubscriptionInput = await request.json();

    // Validate delivery_frequency
    if (body.delivery_frequency) {
      const validFrequencies = ['daily', 'weekly', 'on_demand'];
      if (!validFrequencies.includes(body.delivery_frequency)) {
        return NextResponse.json(
          {
            error: `delivery_frequency must be one of: ${validFrequencies.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate at least one delivery method is enabled
    if (
      body.delivery_email === false &&
      body.delivery_sms === false &&
      body.delivery_in_app === false
    ) {
      return NextResponse.json(
        { error: 'At least one delivery method must be enabled' },
        { status: 400 }
      );
    }

    // Check if subscription exists
    const { data: existing } = await supabase
      .from('training_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('training_subscriptions')
        .update({
          ...body,
          user_id: user.id, // Ensure user_id doesn't change
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('training_subscriptions')
        .insert({
          ...body,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in POST /api/training/subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/training/subscription - Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('training_subscriptions')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error unsubscribing:', error);
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in DELETE /api/training/subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
