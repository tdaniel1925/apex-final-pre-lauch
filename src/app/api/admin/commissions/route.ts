// =============================================
// Admin Commissions API Route
// Fetch commission data with filters and export
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

    // Get query parameters
    const distributorId = searchParams.get('distributor_id');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const dateRange = searchParams.get('date_range') || 'all';
    const commissionType = searchParams.get('commission_type') || 'all';
    const paymentStatus = searchParams.get('payment_status') || 'all';
    const commissionMonth = searchParams.get('commission_month') || 'all';
    const exportFormat = searchParams.get('export');

    if (!distributorId) {
      return NextResponse.json(
        { success: false, error: 'Distributor ID is required' },
        { status: 400 }
      );
    }

    // Build base query
    let query = supabase
      .from('commission_ledger')
      .select(
        `
        *,
        seller:distributors!commission_ledger_seller_id_fkey(first_name, last_name, email, slug),
        transaction:transactions(id, product_slug, amount)
      `,
        { count: 'exact' }
      )
      .eq('distributor_id', distributorId);

    // Apply filters
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query.gte('created_at', startDate.toISOString());
    }

    if (commissionType !== 'all') {
      query = query.eq('commission_type', commissionType);
    }

    if (paymentStatus !== 'all') {
      const isPaid = paymentStatus === 'paid';
      query = query.eq('paid', isPaid);
    }

    if (commissionMonth !== 'all') {
      query = query.eq('commission_month', commissionMonth);
    }

    // Handle CSV export
    if (exportFormat === 'csv') {
      const { data: allCommissions } = await query.order('created_at', {
        ascending: false,
      });

      if (!allCommissions) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch commissions' },
          { status: 500 }
        );
      }

      // Generate CSV
      const csv = generateCSV(allCommissions);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="commissions-${distributorId}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Execute query with pagination
    const { data: commissions, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching commissions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch commissions' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summaryQuery = supabase
      .from('commission_ledger')
      .select('amount, paid, paid_at, created_at, commission_type')
      .eq('distributor_id', distributorId);

    const { data: allCommissions } = await summaryQuery;

    const summary = calculateSummary(allCommissions || []);

    // Calculate breakdown by commission type
    const breakdown = calculateBreakdown(allCommissions || []);

    return NextResponse.json({
      success: true,
      commissions: commissions || [],
      summary,
      breakdown,
      totalCount: count || 0,
    });
  } catch (error) {
    console.error('Error in commissions API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate summary statistics
function calculateSummary(
  commissions: Array<{
    amount: number;
    paid: boolean;
    paid_at: string | null;
    created_at: string;
    commission_type: string;
  }>
) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalAllTime = commissions.reduce((sum, c) => sum + c.amount, 0);

  const thisMonth = commissions.filter((c) => new Date(c.created_at) >= startOfMonth);
  const totalThisMonth = thisMonth.reduce((sum, c) => sum + c.amount, 0);

  const pending = commissions.filter((c) => !c.paid);
  const totalPending = pending.reduce((sum, c) => sum + c.amount, 0);

  const paid = commissions.filter((c) => c.paid && c.paid_at);
  const lastPaymentDate = paid.length > 0
    ? paid.sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime())[0]
        .paid_at
    : null;

  return {
    totalAllTime,
    totalThisMonth,
    totalPending,
    lastPaymentDate,
  };
}

// Helper function to calculate breakdown by commission type
function calculateBreakdown(
  commissions: Array<{
    commission_type: string;
    amount: number;
  }>
) {
  return commissions.reduce((acc, c) => {
    const type = c.commission_type;
    acc[type] = (acc[type] || 0) + c.amount;
    return acc;
  }, {} as Record<string, number>);
}

// Helper function to generate CSV
function generateCSV(
  commissions: Array<{
    id: string;
    commission_type: string;
    amount: number;
    bv_amount: number | null;
    paid: boolean;
    paid_at: string | null;
    commission_month: string | null;
    created_at: string;
    override_level: number | null;
    seller?: {
      first_name: string;
      last_name: string;
      email: string;
    };
    transaction?: {
      id: string;
      product_slug: string;
      amount: number;
    };
  }>
) {
  const headers = [
    'Date',
    'Commission Type',
    'Override Level',
    'Seller Name',
    'Seller Email',
    'Amount',
    'BV Amount',
    'Status',
    'Commission Month',
    'Product',
    'Transaction Amount',
    'Transaction ID',
  ];

  const rows = commissions.map((c) => [
    new Date(c.created_at).toLocaleDateString(),
    c.commission_type,
    c.override_level || '',
    c.seller ? `${c.seller.first_name} ${c.seller.last_name}` : '',
    c.seller?.email || '',
    c.amount.toFixed(2),
    c.bv_amount?.toFixed(2) || '',
    c.paid ? 'Paid' : 'Pending',
    c.commission_month || '',
    c.transaction?.product_slug || '',
    c.transaction?.amount.toFixed(2) || '',
    c.transaction?.id || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return csvContent;
}
