// Temporary script to add retail checkout handler to webhook file
import * as fs from 'fs';
import * as path from 'path';

const webhookPath = path.join(process.cwd(), 'src/app/api/webhooks/stripe/route.ts');
let content = fs.readFileSync(webhookPath, 'utf-8');

// Check if already added
if (content.includes('async function handleRetailCheckout')) {
  console.log('✅ Retail checkout handler already exists');
  process.exit(0);
}

const retailHandler = `
async function handleRetailCheckout(session: Stripe.Checkout.Session) {
  const { metadata } = session;

  if (!metadata?.cart_session_id || !metadata?.rep_distributor_id) {
    console.error('Missing metadata for retail checkout');
    return;
  }

  try {
    const supabase = createServiceClient();

    // Get cart
    const { data: cart } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('session_id', metadata.cart_session_id)
      .single();

    if (!cart || !cart.items || cart.items.length === 0) {
      console.error('Cart not found or empty');
      return;
    }

    // Create customer record
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        email: session.customer_email || session.customer_details?.email || 'unknown@example.com',
        full_name: session.customer_details?.name || 'Customer',
        referred_by_distributor_id: metadata.rep_distributor_id,
      })
      .select()
      .single();

    if (customerError || !customer) {
      console.error('Failed to create customer:', customerError);
      return;
    }

    // Calculate total BV
    const totalBV = cart.items.reduce(
      (sum: number, item: any) => sum + (item.bv_cents * item.quantity),
      0
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        referred_by_distributor_id: metadata.rep_distributor_id,
        total_cents: session.amount_total || 0,
        total_bv: Math.round(totalBV / 100),
        is_personal_purchase: false,
        stripe_payment_intent_id: session.payment_intent as string,
        payment_method: 'card',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        fulfillment_status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Failed to create order:', orderError);
      return;
    }

    // Create order items and subscriptions
    for (const item of cart.items) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_cents: item.retail_price_cents,
        total_price_cents: item.retail_price_cents * item.quantity,
        bv_amount: Math.round(item.bv_cents / 100),
        product_name: item.product_name,
      });

      if (session.mode === 'subscription' && session.subscription) {
        await supabase.from('subscriptions').insert({
          customer_id: customer.id,
          product_id: item.product_id,
          quantity: item.quantity,
          current_price_cents: item.retail_price_cents,
          interval: 'monthly',
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          started_at: new Date().toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Update seller BV and create commission
    const sellerCommission = Math.round(totalBV * 0.60);
    const { data: sellerMember } = await supabase
      .from('members')
      .select('member_id, personal_bv_monthly')
      .eq('distributor_id', metadata.rep_distributor_id)
      .single();

    if (sellerMember) {
      await supabase
        .from('members')
        .update({
          personal_bv_monthly: (sellerMember.personal_bv_monthly || 0) + Math.round(totalBV / 100),
        })
        .eq('member_id', sellerMember.member_id);

      await supabase.from('earnings_ledger').insert({
        member_id: sellerMember.member_id,
        earning_type: 'commission',
        base_amount_cents: sellerCommission,
        final_amount_cents: sellerCommission,
        source_order_id: order.id,
        status: 'pending',
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
      });

      // L1 Override (30% of 40% override pool)
      const overridePool = Math.round(totalBV * 0.40);
      const l1Override = Math.round(overridePool * 0.30);

      const { data: sponsor } = await supabase
        .from('distributors')
        .select('sponsor_id')
        .eq('id', metadata.rep_distributor_id)
        .single();

      if (sponsor?.sponsor_id) {
        const { data: l1Member } = await supabase
          .from('members')
          .select('member_id, personal_bv_monthly')
          .eq('distributor_id', sponsor.sponsor_id)
          .single();

        if (l1Member && l1Member.personal_bv_monthly >= 50) {
          await supabase.from('earnings_ledger').insert({
            member_id: l1Member.member_id,
            earning_type: 'override',
            override_level: 1,
            override_percentage: 0.30,
            base_amount_cents: l1Override,
            final_amount_cents: l1Override,
            source_member_id: sellerMember.member_id,
            source_order_id: order.id,
            status: 'pending',
            period_month: new Date().getMonth() + 1,
            period_year: new Date().getFullYear(),
          });
        }
      }
    }

    // Clear cart
    await supabase
      .from('cart_sessions')
      .update({ items: [] })
      .eq('session_id', metadata.cart_session_id);

    console.log('✅ Retail order created:', order.id);
  } catch (error) {
    console.error('❌ Error handling retail checkout:', error);
  }
}
`;

// Append to end
content += retailHandler;

fs.writeFileSync(webhookPath, content, 'utf-8');
console.log('✅ Added retail checkout handler to webhook');
