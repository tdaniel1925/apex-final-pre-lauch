/**
 * Admin Transaction Ledger API
 * Comprehensive view of all transactions with compensation plan metrics
 *
 * Metrics included:
 * - BV (Business Volume) - Production credits from product
 * - PV (Personal Volume) - Member's personal_credits_monthly
 * - GV (Group Volume) - Member's team_credits_monthly
 * - Breakage - Pending/estimated commissions not yet qualified
 * - Paid Commissions - Approved commissions from earnings_ledger
 * - Seller info - Who made the sale
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

interface LedgerFilters {
  dateRange?: string;
  productSlug?: string;
  distributorId?: string;
  transactionType?: string;
  page?: number;
  limit?: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    // Extract filters
    const filters: LedgerFilters = {
      dateRange: searchParams.get('dateRange') || '30',
      productSlug: searchParams.get('productSlug') || undefined,
      distributorId: searchParams.get('distributorId') || undefined,
      transactionType: searchParams.get('transactionType') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    // Build base query with comprehensive JOIN
    // IMPORTANT: Use distributors.sponsor_id for enrollment tree (Single Source of Truth)
    // JOIN with members table for live BV data (NOT cached fields)
    let query = supabase
      .from('transactions')
      .select(
        `
        id,
        created_at,
        amount_dollars,
        transaction_type,
        product_slug,
        metadata,
        stripe_payment_intent_id,
        distributor:distributors!transactions_distributor_id_fkey (
          id,
          first_name,
          last_name,
          email,
          slug,
          rep_number,
          sponsor:distributors!distributors_sponsor_id_fkey (
            id,
            first_name,
            last_name,
            email,
            rep_number
          ),
          member:members!members_distributor_id_fkey (
            member_id,
            personal_credits_monthly,
            team_credits_monthly,
            tech_rank,
            insurance_rank
          )
        ),
        order:orders!orders_transaction_id_fkey (
          id,
          total_bv,
          is_personal_purchase,
          customer:customers (
            full_name,
            email
          )
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Apply date filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange));
      query = query.gte('created_at', daysAgo.toISOString());
    }

    // Apply product filter
    if (filters.productSlug) {
      query = query.eq('product_slug', filters.productSlug);
    }

    // Apply distributor filter
    if (filters.distributorId) {
      query = query.eq('distributor_id', filters.distributorId);
    }

    // Apply transaction type filter
    if (filters.transactionType && filters.transactionType !== 'all') {
      query = query.eq('transaction_type', filters.transactionType);
    }

    // Pagination
    const offset = ((filters.page || 1) - 1) * (filters.limit || 50);
    query = query.range(offset, offset + (filters.limit || 50) - 1);

    const { data: transactions, error: transactionsError, count } = await query;

    if (transactionsError) {
      return NextResponse.json({ error: transactionsError.message }, { status: 500 });
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        ledgerData: [],
        totalCount: 0,
        page: filters.page || 1,
        limit: filters.limit || 50,
      });
    }

    // Get transaction IDs for estimated earnings and earnings ledger queries
    const transactionIds = transactions.map((t) => t.id);

    // Fetch estimated earnings (breakage/pending commissions)
    const { data: estimatedEarnings } = await supabase
      .from('estimated_earnings')
      .select('transaction_id, member_id, earning_type, estimated_amount_cents, current_qualification_status')
      .in('transaction_id', transactionIds);

    // Fetch paid commissions from earnings ledger
    const { data: paidCommissions } = await supabase
      .from('earnings_ledger')
      .select('source_order_id, member_id, earning_type, final_amount_cents, status')
      .in('source_order_id', transactions.map((t) => t.order?.[0]?.id).filter(Boolean));

    // Build comprehensive ledger data
    const ledgerData = transactions.map((transaction) => {
      const distributor = transaction.distributor?.[0];
      const member = distributor?.member?.[0];
      const order = transaction.order?.[0];
      const sponsor = distributor?.sponsor?.[0];

      // Calculate breakage (pending/estimated commissions)
      const transactionEstimates = estimatedEarnings?.filter(
        (e) => e.transaction_id === transaction.id && e.member_id === member?.member_id
      ) || [];

      const breakageCents = transactionEstimates
        .filter((e) => e.current_qualification_status === 'pending' || e.current_qualification_status === 'at_risk')
        .reduce((sum, e) => sum + (e.estimated_amount_cents || 0), 0);

      const disqualifiedCents = transactionEstimates
        .filter((e) => e.current_qualification_status === 'disqualified')
        .reduce((sum, e) => sum + (e.estimated_amount_cents || 0), 0);

      // Calculate paid commissions
      const orderPaidCommissions = paidCommissions?.filter(
        (p) => p.source_order_id === order?.id && p.member_id === member?.member_id
      ) || [];

      const paidCommissionsCents = orderPaidCommissions
        .filter((p) => p.status === 'paid' || p.status === 'approved')
        .reduce((sum, p) => sum + (p.final_amount_cents || 0), 0);

      return {
        // Transaction details
        transactionId: transaction.id,
        createdAt: transaction.created_at,
        amount: transaction.amount_dollars || 0,
        transactionType: transaction.transaction_type,
        productSlug: transaction.product_slug,
        stripePaymentIntentId: transaction.stripe_payment_intent_id,

        // Seller info
        sellerId: distributor?.id,
        sellerName: distributor ? `${distributor.first_name} ${distributor.last_name}` : 'Unknown',
        sellerEmail: distributor?.email,
        sellerRepNumber: distributor?.rep_number,

        // Sponsor info (uses distributors.sponsor_id - enrollment tree)
        sponsorId: sponsor?.id,
        sponsorName: sponsor ? `${sponsor.first_name} ${sponsor.last_name}` : 'None',
        sponsorRepNumber: sponsor?.rep_number,

        // BV Metrics
        bv: order?.total_bv || 0, // BV credited from this sale
        pv: member?.personal_credits_monthly || 0, // Current Personal Volume
        gv: member?.team_credits_monthly || 0, // Current Group Volume

        // Rank
        techRank: member?.tech_rank || 'starter',
        insuranceRank: member?.insurance_rank || 'pre_associate',

        // Purchase type
        isPersonalPurchase: order?.is_personal_purchase ?? null,
        customerName: order?.customer?.[0]?.full_name,
        customerEmail: order?.customer?.[0]?.email,

        // Commission metrics (in dollars)
        breakage: breakageCents / 100, // Pending commissions
        disqualified: disqualifiedCents / 100, // Disqualified commissions
        paidCommissions: paidCommissionsCents / 100, // Paid commissions

        // Metadata
        metadata: transaction.metadata,
      };
    });

    // Calculate summary stats
    const totalBV = ledgerData.reduce((sum, row) => sum + row.bv, 0);
    const totalBreakage = ledgerData.reduce((sum, row) => sum + row.breakage, 0);
    const totalPaid = ledgerData.reduce((sum, row) => sum + row.paidCommissions, 0);
    const totalSales = ledgerData.reduce((sum, row) => sum + row.amount, 0);

    return NextResponse.json({
      ledgerData,
      totalCount: count || 0,
      page: filters.page || 1,
      limit: filters.limit || 50,
      summary: {
        totalBV,
        totalBreakage,
        totalPaid,
        totalSales,
        transactionCount: ledgerData.length,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ledger data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
