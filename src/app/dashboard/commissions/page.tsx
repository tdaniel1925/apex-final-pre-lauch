// =============================================
// Commissions Page
// Display all commission earnings with breakdown and export
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import CommissionsTable from '@/components/dashboard/CommissionsTable';
import SalesFilters from '@/components/dashboard/SalesFilters';
import ExportButton from '@/components/dashboard/ExportButton';
import { DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Commissions - Apex Affinity Group',
  description: 'View your commission earnings and breakdowns',
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
        <div className="p-3 bg-slate-100 rounded-lg">{icon}</div>
        {trend && (
          <div
            className={`flex items-center text-sm font-medium ${
              trendUp ? 'text-green-600' : 'text-red-600'
            }`}
          >
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

// Commission type display names
const COMMISSION_TYPE_NAMES: Record<string, string> = {
  retail: 'Retail Commission',
  cab: 'Customer Acquisition Bonus',
  milestone: 'Customer Milestone',
  retention: 'Retention Bonus',
  matrix_l1: 'Level 1 Matrix',
  matrix_l2: 'Level 2 Matrix',
  matrix_l3: 'Level 3 Matrix',
  matrix_l4: 'Level 4 Matrix',
  matrix_l5: 'Level 5 Matrix',
  matrix_l6: 'Level 6 Matrix',
  matrix_l7: 'Level 7 Matrix',
  matching: 'Matching Bonus',
  override: 'Override Bonus',
  infinity: 'Infinity Bonus',
  fast_start: 'Fast Start Bonus',
  rank_advancement: 'Rank Bonus',
  car: 'Car Bonus',
  vacation: 'Vacation Bonus',
  infinity_pool: 'Infinity Pool',
};

export default async function CommissionsPage({
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
  const commissionType = (searchParams.type as string) || 'all';
  const paymentStatus = (searchParams.status as string) || 'all';

  // Aggregate commissions from all commission tables
  // We'll fetch from multiple tables and combine them
  const commissionData: any[] = [];

  // 1. Retail Commissions
  const { data: retailComms } = await serviceClient
    .from('commissions_retail')
    .select('*')
    .eq('distributor_id', distributor.id)
    .order('created_at', { ascending: false });

  (retailComms || []).forEach((comm) => {
    commissionData.push({
      id: comm.id,
      date: comm.created_at,
      type: 'retail',
      amount: comm.commission_amount_cents / 100,
      status: comm.status,
      month_year: comm.week_ending,
      from: null,
    });
  });

  // 2. Matrix Commissions (aggregated by month)
  const { data: matrixComms } = await serviceClient
    .from('commissions_matrix')
    .select('*')
    .eq('distributor_id', distributor.id)
    .order('created_at', { ascending: false });

  (matrixComms || []).forEach((comm) => {
    // Break down by level
    for (let level = 1; level <= 7; level++) {
      const levelAmount = comm[`level_${level}_commission_cents`] || 0;
      if (levelAmount > 0) {
        commissionData.push({
          id: `${comm.id}-L${level}`,
          date: comm.created_at,
          type: `matrix_l${level}`,
          amount: levelAmount / 100,
          status: comm.status,
          month_year: comm.month_year,
          from: null,
        });
      }
    }
  });

  // 3. Matching Bonuses
  const { data: matchingComms } = await serviceClient
    .from('commissions_matching')
    .select('*')
    .eq('distributor_id', distributor.id)
    .order('created_at', { ascending: false });

  (matchingComms || []).forEach((comm) => {
    if (comm.total_commission_cents > 0) {
      commissionData.push({
        id: comm.id,
        date: comm.created_at,
        type: 'matching',
        amount: comm.total_commission_cents / 100,
        status: comm.status,
        month_year: comm.month_year,
        from: null,
      });
    }
  });

  // 4. Rank Advancement Bonuses
  const { data: rankComms } = await serviceClient
    .from('commissions_rank_advancement')
    .select('*')
    .eq('distributor_id', distributor.id)
    .order('created_at', { ascending: false });

  (rankComms || []).forEach((comm) => {
    commissionData.push({
      id: comm.id,
      date: comm.created_at,
      type: 'rank_advancement',
      amount: comm.final_bonus_cents / 100,
      status: comm.status,
      month_year: comm.month_year,
      from: comm.rank_achieved,
    });
  });

  // 5. Infinity Pool
  const { data: poolComms } = await serviceClient
    .from('commissions_infinity_pool')
    .select('*')
    .eq('distributor_id', distributor.id)
    .order('created_at', { ascending: false });

  (poolComms || []).forEach((comm) => {
    commissionData.push({
      id: comm.id,
      date: comm.created_at,
      type: 'infinity_pool',
      amount: comm.total_commission_cents / 100,
      status: comm.status,
      month_year: comm.month_year,
      from: null,
    });
  });

  // Sort all commissions by date
  commissionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Apply filters
  let filteredData = [...commissionData];

  // Date range filter
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

    filteredData = filteredData.filter((c) => new Date(c.date) >= startDate);
  }

  // Commission type filter
  if (commissionType !== 'all') {
    filteredData = filteredData.filter((c) => c.type === commissionType);
  }

  // Payment status filter
  if (paymentStatus !== 'all') {
    filteredData = filteredData.filter((c) => c.status === paymentStatus);
  }

  // Pagination
  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginatedData = filteredData.slice(offset, offset + limit);

  // Calculate summary statistics
  // Total earned this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthEarnings = commissionData
    .filter((c) => new Date(c.date) >= startOfMonth && c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  // Total earned all time
  const allTimeEarnings = commissionData
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  // Pending commissions
  const pendingEarnings = commissionData
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  // Last payment date
  const lastPayment = commissionData
    .filter((c) => c.status === 'paid')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const lastPaymentDate = lastPayment
    ? new Date(lastPayment.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  // Commission breakdown by type for chart
  const commissionBreakdown: Record<string, number> = {};
  commissionData
    .filter((c) => c.status === 'paid')
    .forEach((c) => {
      const typeName = COMMISSION_TYPE_NAMES[c.type] || c.type;
      commissionBreakdown[typeName] = (commissionBreakdown[typeName] || 0) + c.amount;
    });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Commissions</h1>
            <p className="text-slate-600 mt-1">Track your commission earnings and breakdowns</p>
          </div>
          <ExportButton data={paginatedData} filename="commissions" type="commissions" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Earned This Month"
            value={`$${thisMonthEarnings.toFixed(2)}`}
            icon={<DollarSign className="w-6 h-6 text-slate-700" />}
          />
          <StatCard
            title="Total Earned All Time"
            value={`$${allTimeEarnings.toFixed(2)}`}
            icon={<TrendingUp className="w-6 h-6 text-slate-700" />}
          />
          <StatCard
            title="Pending Commissions"
            value={`$${pendingEarnings.toFixed(2)}`}
            icon={<Clock className="w-6 h-6 text-slate-700" />}
          />
          <StatCard
            title="Last Payment Date"
            value={lastPaymentDate}
            icon={<Calendar className="w-6 h-6 text-slate-700" />}
          />
        </div>

        {/* Commission Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Commission Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(commissionBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([type, amount]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-slate-700 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">{type}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    ${amount.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Filters */}
        <SalesFilters
          dateRange={dateRange}
          productType={commissionType}
          status={paymentStatus}
          filterType="commissions"
        />

        {/* Commissions Table */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Commission History</h2>
            <p className="text-sm text-slate-600 mt-1">{totalCount} total commissions</p>
          </div>
          <CommissionsTable
            commissions={paginatedData}
            currentPage={page}
            totalPages={totalPages}
            typeNames={COMMISSION_TYPE_NAMES}
          />
        </div>
      </div>
    </div>
  );
}
