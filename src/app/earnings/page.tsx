'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import RepSidebar from '@/components/rep/RepSidebar';

interface CurrentMonthData {
  personalBV: number;
  sellerCommission: number;
  overridePoolShare: number;
  cabBonus: number;
  pvbBonus: number;
  totalProjected: number;
}

interface HistoryEntry {
  id: string;
  date: string;
  total_payout: number;
  status: string;
  carried_forward: boolean;
}

export default function EarningsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [currentMonth, setCurrentMonth] = useState<CurrentMonthData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadEarningsData();
  }, []);

  async function loadEarningsData() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Get distributor profile
    const { data: profile } = await supabase
      .from('distributors')
      .select('*')
      .eq('email', user.email)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    // Get current month data (projected)
    const currentMonthStart = new Date().toISOString().slice(0, 7) + '-01';
    const { data: currentCommissions } = await supabase
      .from('commission_payouts')
      .select('*')
      .eq('distributor_id', profile.id)
      .gte('payout_date', currentMonthStart)
      .order('payout_date', { ascending: false })
      .limit(1);

    // Calculate current month totals
    const currentData: CurrentMonthData = {
      personalBV: profile.personal_bv_current_month || 0,
      sellerCommission: currentCommissions?.[0]?.seller_commission || 0,
      overridePoolShare: currentCommissions?.[0]?.override_pool_share || 0,
      cabBonus: currentCommissions?.[0]?.cab_bonus || 0,
      pvbBonus: currentCommissions?.[0]?.pvb_bonus || 0,
      totalProjected: 0
    };

    currentData.totalProjected =
      currentData.sellerCommission +
      currentData.overridePoolShare +
      currentData.cabBonus +
      currentData.pvbBonus;

    setCurrentMonth(currentData);

    // Get history
    const { data: historyData } = await supabase
      .from('commission_payouts')
      .select('id, payout_date, total_payout, status')
      .eq('distributor_id', profile.id)
      .lt('payout_date', currentMonthStart)
      .order('payout_date', { ascending: false })
      .limit(12);

    const formattedHistory: HistoryEntry[] = (historyData || []).map(entry => ({
      id: entry.id,
      date: entry.payout_date,
      total_payout: entry.total_payout || 0,
      status: entry.status || 'pending',
      carried_forward: (entry.total_payout || 0) < 25 && entry.status === 'carried'
    }));

    setHistory(formattedHistory);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B3A7D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading earnings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <RepSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F2045]">Commission Earnings</h1>
              <p className="text-gray-500 text-sm mt-1">Track your commission projections and payment history.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-[#1B3A7D] hover:bg-gray-50 transition-colors border border-gray-200">
                <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Report
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'current'
                  ? 'text-[#1B3A7D] border-b-2 border-[#1B3A7D]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Current Month (Projected)
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'history'
                  ? 'text-[#1B3A7D] border-b-2 border-[#1B3A7D]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment History
            </button>
          </div>

          {/* Current Month Tab */}
          {activeTab === 'current' && currentMonth && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal BV */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#1B3A7D]" style={{ background: '#E8EAF2' }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Personal BV</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F2045]">{currentMonth.personalBV} <span className="text-lg text-gray-400 font-normal">BV</span></h3>
                </div>

                {/* Seller Commission */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#1B3A7D]" style={{ background: '#E8EAF2' }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Seller Commission</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F2045]">${currentMonth.sellerCommission.toLocaleString()}</h3>
                </div>

                {/* Override Pool Share */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#C7181F]" style={{ background: '#FBE8E9' }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Override Pool</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F2045]">${currentMonth.overridePoolShare.toLocaleString()}</h3>
                </div>

                {/* CAB Bonus */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#1B3A7D]" style={{ background: '#E8EAF2' }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500">CAB Bonus</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F2045]">${currentMonth.cabBonus.toLocaleString()}</h3>
                </div>

                {/* PVB Bonus */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#C7181F]" style={{ background: '#FBE8E9' }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500">PVB Bonus</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F2045]">${currentMonth.pvbBonus.toLocaleString()}</h3>
                </div>

                {/* Total Projected */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border-2" style={{ borderColor: '#1B3A7D' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: '#1B3A7D' }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Total Projected</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#1B3A7D]">${currentMonth.totalProjected.toLocaleString()}</h3>
                  <p className="text-xs text-gray-500 mt-2">Projected payout for current month</p>
                </div>
              </div>

              {/* Carry Forward Notice */}
              {currentMonth.totalProjected < 25 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-800 mb-1">Carry Forward Notice</h4>
                    <p className="text-xs text-amber-700">
                      Your projected commission this month is under $25. Per company policy, commissions under $25 will be carried forward to the next month instead of being paid out.
                    </p>
                  </div>
                </div>
              )}

              {/* Breakdown Table */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#0F2045] mb-4">Commission Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Component</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Amount</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">Seller Commission</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-[#0F2045]">${currentMonth.sellerCommission.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {currentMonth.totalProjected > 0
                            ? ((currentMonth.sellerCommission / currentMonth.totalProjected) * 100).toFixed(1)
                            : 0}%
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">Override Pool Share</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-[#0F2045]">${currentMonth.overridePoolShare.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {currentMonth.totalProjected > 0
                            ? ((currentMonth.overridePoolShare / currentMonth.totalProjected) * 100).toFixed(1)
                            : 0}%
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">CAB Bonus</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-[#0F2045]">${currentMonth.cabBonus.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {currentMonth.totalProjected > 0
                            ? ((currentMonth.cabBonus / currentMonth.totalProjected) * 100).toFixed(1)
                            : 0}%
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">PVB Bonus</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-[#0F2045]">${currentMonth.pvbBonus.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {currentMonth.totalProjected > 0
                            ? ((currentMonth.pvbBonus / currentMonth.totalProjected) * 100).toFixed(1)
                            : 0}%
                        </td>
                      </tr>
                      <tr className="bg-gray-50 font-bold">
                        <td className="px-4 py-3 text-sm text-[#0F2045]">Total</td>
                        <td className="px-4 py-3 text-sm text-right text-[#1B3A7D]">${currentMonth.totalProjected.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-[#1B3A7D]">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#0F2045] mb-4">Payment History</h3>

              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Amount</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {history.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-[#0F2045]">
                            ${entry.total_payout.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {entry.carried_forward ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Carried Forward
                              </span>
                            ) : entry.status === 'paid' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-xs text-[#1B3A7D] font-medium hover:underline">View Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500">No payment history available yet</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
