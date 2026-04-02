// =============================================
// Smart Post-Checkout Redirect
// Redirects to cal.com if onboarding required,
// otherwise shows success page
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  const serviceClient = createServiceClient();

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const productSlug = searchParams.get('product');

    if (!productSlug) {
      // No product slug, go to generic success page
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/products/success?session_id=${sessionId || ''}`
      );
    }

    // Check if product requires onboarding
    const { data: product } = await serviceClient
      .from('products')
      .select('slug, name, requires_onboarding, onboarding_duration_minutes')
      .eq('slug', productSlug)
      .eq('is_active', true)
      .single();

    if (!product) {
      // Product not found, go to generic success page
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/products/success?session_id=${sessionId || ''}`
      );
    }

    if (product.requires_onboarding) {
      // Redirect directly to cal.com booking page
      const calLink = 'https://cal.com/botmakers/apex-affinity-group-onboarding';

      // Add prefill parameters
      const calUrl = new URL(calLink);
      calUrl.searchParams.set('name', ''); // Customer will fill this in
      calUrl.searchParams.set('metadata[stripe_session_id]', sessionId || '');
      calUrl.searchParams.set('metadata[product]', product.name);
      calUrl.searchParams.set('duration', (product.onboarding_duration_minutes || 30).toString());

      return NextResponse.redirect(calUrl.toString());
    } else {
      // No onboarding required, show success page
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/products/success?session_id=${sessionId || ''}&product=${productSlug}`
      );
    }
  } catch (error: any) {
    console.error('Checkout redirect error:', error);

    // On error, fallback to success page
    const sessionId = new URL(request.url).searchParams.get('session_id');
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/products/success?session_id=${sessionId || ''}`
    );
  }
}
