// =============================================
// Override Chain API Route
// Fetch complete commission chain for a transaction
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin();

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const transactionId = searchParams.get('transaction_id');

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Fetch transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select(
        `
        *,
        distributor:distributors!transactions_distributor_id_fkey(
          first_name,
          last_name,
          email,
          slug
        )
      `
      )
      .eq('id', transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error('Error fetching transaction:', transactionError);
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Fetch all commissions for this transaction
    const { data: commissions, error: commissionsError } = await supabase
      .from('commission_ledger')
      .select(
        `
        *,
        distributor:distributors!commission_ledger_distributor_id_fkey(
          first_name,
          last_name,
          email,
          slug
        )
      `
      )
      .eq('transaction_id', transactionId)
      .order('override_level', { ascending: true, nullsFirst: true });

    if (commissionsError) {
      console.error('Error fetching commissions:', commissionsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch commission chain' },
        { status: 500 }
      );
    }

    // Calculate BV amount from transaction metadata
    // BV is stored in transaction metadata or can be calculated
    const bvAmount = transaction.metadata?.bv_amount || transaction.amount * 0.5; // Fallback calculation

    // Calculate override pool (40% of BV)
    const overridePool = bvAmount * 0.4;

    // Calculate total paid in commissions
    const totalPaid = commissions?.reduce((sum, c) => sum + c.amount, 0) || 0;

    // Calculate breakage (unpaid overrides)
    const sellerCommission =
      commissions?.find((c) => c.commission_type === 'seller_commission')?.amount || 0;
    const overridesPaid = totalPaid - sellerCommission;
    const breakage = Math.max(0, overridePool - overridesPaid);

    // Format chain entries
    const chain = commissions?.map((c) => ({
      id: c.id,
      distributor_id: c.distributor_id,
      distributor_name: c.distributor
        ? `${c.distributor.first_name} ${c.distributor.last_name}`
        : 'Unknown',
      distributor_slug: c.distributor?.slug || '',
      commission_type: c.commission_type,
      override_level: c.override_level,
      amount: c.amount,
      is_current: false, // Will be set by frontend based on selected commission
    })) || [];

    // Format transaction response
    const transactionResponse = {
      id: transaction.id,
      amount: transaction.amount,
      bv_amount: bvAmount,
      product_slug: transaction.product_slug,
      seller: transaction.distributor
        ? {
            first_name: transaction.distributor.first_name,
            last_name: transaction.distributor.last_name,
            slug: transaction.distributor.slug,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      transaction: transactionResponse,
      chain,
      overridePool,
      breakage,
    });
  } catch (error) {
    console.error('Error in override chain API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
