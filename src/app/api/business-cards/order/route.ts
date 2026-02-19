// ============================================================
// POST /api/business-cards/order
// Submits a business card order to Printful + saves to DB
// ============================================================
// TODO: Before going live, upload your card design to Printful,
// then set PRINTFUL_VARIANT_ID_250, _500, _1000 in .env.local
// and set PRINTFUL_FRONT_FILE_URL / PRINTFUL_BACK_FILE_URL.
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

const PRINTFUL_API = 'https://api.printful.com';

// Variant IDs by quantity — fill in after uploading design to Printful
const VARIANT_IDS: Record<number, number | null> = {
  250:  null, // TODO: replace with your Printful variant ID
  500:  null,
  1000: null,
};

// Design file URLs — fill in after uploading to Printful or a CDN
const CARD_FRONT_URL = process.env.PRINTFUL_FRONT_FILE_URL ?? null;
const CARD_BACK_URL  = process.env.PRINTFUL_BACK_FILE_URL  ?? null;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceClient = createServiceClient();
    const { data: distributor } = await serviceClient
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
    if (!distributor) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });

    const body = await req.json();
    const {
      quantity,
      name_on_card,
      title_on_card,
      phone_on_card,
      email_on_card,
      website_on_card,
      ship_to_name,
      ship_address1,
      ship_address2,
      ship_city,
      ship_state,
      ship_zip,
    } = body;

    // Validate required fields
    if (!quantity || !name_on_card || !title_on_card || !phone_on_card || !email_on_card
      || !ship_to_name || !ship_address1 || !ship_city || !ship_state || !ship_zip) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save order to DB first
    const { data: order, error: dbError } = await serviceClient
      .from('business_card_orders')
      .insert({
        distributor_id:  distributor.id,
        quantity,
        name_on_card,
        title_on_card,
        phone_on_card,
        email_on_card,
        website_on_card,
        ship_to_name,
        ship_address1,
        ship_address2,
        ship_city,
        ship_state,
        ship_zip,
        status: 'submitted',
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
    }

    // Attempt Printful order if variant IDs and design files are configured
    const variantId = VARIANT_IDS[quantity as keyof typeof VARIANT_IDS];
    const apiKey    = process.env.PRINTFUL_API_KEY;

    if (variantId && CARD_FRONT_URL && apiKey) {
      try {
        const printfulPayload: Record<string, unknown> = {
          recipient: {
            name:         ship_to_name,
            address1:     ship_address1,
            address2:     ship_address2 ?? '',
            city:         ship_city,
            state_code:   ship_state,
            country_code: 'US',
            zip:          ship_zip,
          },
          items: [
            {
              variant_id: variantId,
              quantity,
              files: [
                { type: 'front', url: CARD_FRONT_URL },
                ...(CARD_BACK_URL ? [{ type: 'back', url: CARD_BACK_URL }] : []),
              ],
            },
          ],
        };

        const pfRes = await fetch(`${PRINTFUL_API}/orders`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(printfulPayload),
        });

        if (pfRes.ok) {
          const pfData = await pfRes.json();
          const pfOrderId = pfData?.result?.id?.toString();
          await serviceClient
            .from('business_card_orders')
            .update({ printful_order_id: pfOrderId, printful_order_status: 'draft', status: 'processing' })
            .eq('id', order.id);

          // Confirm the order so Printful starts production
          await fetch(`${PRINTFUL_API}/orders/${pfOrderId}/confirm`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}` },
          });
        } else {
          const errText = await pfRes.text();
          console.error('Printful error:', errText);
          // Order is saved in DB; will be retried or handled manually
        }
      } catch (pfErr) {
        console.error('Printful request failed:', pfErr);
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error('Business card order error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
