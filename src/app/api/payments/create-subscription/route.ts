import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
// import { createPremiumSubscription } from '@/lib/square/subscriptions'; // TODO: Create Square integration

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distributorId, email, cardNonce } = body;

    if (!distributorId || !email || !cardNonce) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Create subscription in Square
    // const result = await createPremiumSubscription(distributorId, email, cardNonce);

    // Temporary response until Square integration is built
    return NextResponse.json({
      success: false,
      error: 'Payment integration not yet configured. Please contact support.',
    }, { status: 501 });
  } catch (error: any) {
    console.error('[Create Subscription] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
