import { NextResponse } from 'next/server';

export async function GET() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'NOT_SET';
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'NOT_SET';

  return NextResponse.json({
    secretKeyPrefix: stripeSecretKey.substring(0, 15),
    secretKeyMode: stripeSecretKey.startsWith('sk_live_') ? 'LIVE' : stripeSecretKey.startsWith('sk_test_') ? 'TEST' : 'UNKNOWN',
    publishableKeyPrefix: stripePublishableKey.substring(0, 15),
    publishableKeyMode: stripePublishableKey.startsWith('pk_live_') ? 'LIVE' : stripePublishableKey.startsWith('pk_test_') ? 'TEST' : 'UNKNOWN',
    nodeEnv: process.env.NODE_ENV,
  });
}
