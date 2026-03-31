// =============================================
// Transaction Logging API
// POST /api/transactions/log
// Logs all financial transactions to database
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface TransactionLogRequest {
  distributor_id: string;
  transaction_type: 'product_sale' | 'subscription_payment' | 'commission_payment' | 'refund';
  amount: number;
  stripe_payment_intent_id?: string;
  stripe_subscription_id?: string;
  product_slug?: string;
  metadata?: Record<string, any>;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
}

export async function POST(request: NextRequest) {
  try {
    const body: TransactionLogRequest = await request.json();

    // Validate required fields
    if (!body.distributor_id || !body.transaction_type || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: distributor_id, transaction_type, and amount are required' },
        { status: 400 }
      );
    }

    // Validate transaction type
    const validTypes = ['product_sale', 'subscription_payment', 'commission_payment', 'refund'];
    if (!validTypes.includes(body.transaction_type)) {
      return NextResponse.json(
        { error: `Invalid transaction_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Create Supabase service client (needs admin access to write transactions)
    const supabase = createServiceClient();

    // Check for duplicate transaction (idempotency check)
    if (body.stripe_payment_intent_id) {
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('stripe_payment_intent_id', body.stripe_payment_intent_id)
        .eq('transaction_type', body.transaction_type)
        .maybeSingle();

      if (existing) {
        console.log('⚠️ Duplicate transaction detected - already logged:', existing.id);
        return NextResponse.json({
          success: true,
          transaction: existing,
          duplicate: true
        });
      }
    }

    // Insert transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        distributor_id: body.distributor_id,
        transaction_type: body.transaction_type,
        amount: body.amount,
        stripe_payment_intent_id: body.stripe_payment_intent_id,
        stripe_subscription_id: body.stripe_subscription_id,
        product_slug: body.product_slug,
        metadata: body.metadata || {},
        status: body.status || 'completed',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Transaction log error:', error);
      return NextResponse.json(
        { error: 'Failed to log transaction', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Transaction logged successfully:', {
      id: data.id,
      type: data.transaction_type,
      amount: data.amount,
      distributor_id: data.distributor_id,
    });

    return NextResponse.json({ success: true, transaction: data });
  } catch (error: any) {
    console.error('❌ Transaction log error:', error);
    return NextResponse.json(
      { error: 'Failed to log transaction', details: error.message },
      { status: 500 }
    );
  }
}
