// =============================================
// Sales History Page
// Display all product sales with filters and export
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import SalesTable from '@/components/dashboard/SalesTable';
import SalesFilters from '@/components/dashboard/SalesFilters';
import ExportButton from '@/components/dashboard/ExportButton';
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react';

export const metadata = {
  title: 'Sales History - Apex Affinity Group',
  description: 'View your product sales history and performance',
};

// Enable caching for 30 seconds
export const revalidate = 30;

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <div className="p-3 bg-slate-100 rounded-lg">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default async function SalesHistoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor data
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  // Parse filters from search params
  const page = parseInt((searchParams.page as string) || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const dateRange = (searchParams.dateRange as string) || 'all';
  const productType = (searchParams.product as string) || 'all';
  const status = (searchParams.status as string) || 'all';

  // Build query for sales
  let query = serviceClient
    .from('orders')
    .select(`
      id,
      order_number,
      total_cents,
      total_bv,
      payment_status,
      created_at,
      customer:customers!orders_customer_id_fkey(
        email,
        first_name,
        last_name
      ),
      order_items!inner(
        id,
        product_name,
        quantity,
        unit_price_cents,
        total_price_cents,
        bv_amount,
        product:products(
          slug,
          name
        )
      )
    `)
    .eq('distributor_id', distributor.id)
    .order('created_at', { ascending: false });

  // Apply date range filter
  if (dateRange !== 'all') {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '7':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90':
        startDate.setDate(now.getDate() - 90);
        break;
    }

    query = query.gte('created_at', startDate.toISOString());
  }

  // Apply payment status filter
  if (status !== 'all') {
    query = query.eq('payment_status', status);
  }

  // Get total count for pagination
  const { count: totalCount } = await serviceClient
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('distributor_id', distributor.id);

  // Execute query with pagination
  const { data: orders, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching sales:', error);
  }

  // Calculate summary statistics
  // Total sales this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthOrders } = await serviceClient
    .from('orders')
    .select('total_cents, payment_status')
    .eq('distributor_id', distributor.id)
    .eq('payment_status', 'paid')
    .gte('created_at', startOfMonth.toISOString());

  const totalThisMonth = (monthOrders || []).reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;

  // Total sales all time
  const { data: allOrders } = await serviceClient
    .from('orders')
    .select('total_cents, payment_status')
    .eq('distributor_id', distributor.id)
    .eq('payment_status', 'paid');

  const totalAllTime = (allOrders || []).reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;

  // Average sale amount
  const averageSale = allOrders && allOrders.length > 0 ? totalAllTime / allOrders.length : 0;

  // Total products sold
  const { data: allItems } = await serviceClient
    .from('order_items')
    .select('quantity, order_id')
    .in(
      'order_id',
      (allOrders || []).map((o) => {
        // Get order IDs - need to query orders table
        return null;
      }).filter(Boolean)
    );

  // Count total items across all paid orders
  const { data: itemsCount } = await serviceClient
    .from('order_items')
    .select('quantity, order:orders!inner(payment_status, distributor_id)')
    .eq('order.distributor_id', distributor.id)
    .eq('order.payment_status', 'paid');

  const totalProducts = (itemsCount || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Transform orders for display
  const salesData = (orders || []).map((order) => {
    // Handle customer data (may be null or array)
    const customerData = Array.isArray(order.customer) ? order.customer[0] : order.customer;
    const customerEmail = customerData?.email || 'N/A';

    // Get first order item for product info
    const firstItem = Array.isArray(order.order_items) ? order.order_items[0] : order.order_items;
    const productName = firstItem?.product_name || 'Unknown Product';

    return {
      id: order.id,
      order_number: order.order_number,
      date: order.created_at,
      product: productName,
      amount: order.total_cents / 100,
      customer_email: customerEmail,
      status: order.payment_status,
      bv_amount: order.total_bv,
      items: Array.isArray(order.order_items) ? order.order_items : [order.order_items],
    };
  });

  const totalPages = Math.ceil((totalCount || 0) / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sales History</h1>
            <p className="text-slate-600 mt-1">Track your product sales and performance</p>
          </div>
          <ExportButton data={salesData} filename="sales-history" type="sales" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Sales This Month"
            value={`$${totalThisMonth.toFixed(2)}`}
            icon={<DollarSign className="w-6 h-6 text-slate-700" />}
          />
          <StatCard
            title="Total Sales All Time"
            value={`$${totalAllTime.toFixed(2)}`}
            icon={<TrendingUp className="w-6 h-6 text-slate-700" />}
          />
          <StatCard
            title="Average Sale Amount"
            value={`$${averageSale.toFixed(2)}`}
            icon={<ShoppingCart className="w-6 h-6 text-slate-700" />}
          />
          <StatCard
            title="Total Products Sold"
            value={totalProducts.toString()}
            icon={<Package className="w-6 h-6 text-slate-700" />}
          />
        </div>

        {/* Filters */}
        <SalesFilters
          dateRange={dateRange}
          productType={productType}
          status={status}
        />

        {/* Sales Table */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Sales Transactions</h2>
            <p className="text-sm text-slate-600 mt-1">
              {totalCount || 0} total sales
            </p>
          </div>
          <SalesTable
            sales={salesData}
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
