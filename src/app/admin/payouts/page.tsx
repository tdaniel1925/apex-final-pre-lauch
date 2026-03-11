'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Payout {
  id: string;
  period: string;
  rep_id: string;
  rep_name: string;
  rank: string;
  personal_bv: number;
  team_bv: number;
  commission_amount: number;
  override_amount: number;
  total_payout: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  payment_date?: string;
}

export default function PayoutsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [payouts, setPayouts] = useState<Payout[]>([
    { id: 'pay-001', period: 'February 2025', rep_id: 'ASD-10291', rep_name: 'Marcus Thompson', rank: 'Platinum', personal_bv: 250, team_bv: 48291, commission_amount: 2100.00, override_amount: 350.00, total_payout: 2450.00, status: 'paid', payment_date: '2025-03-05' },
    { id: 'pay-002', period: 'February 2025', rep_id: 'ASD-20847', rep_name: 'Jennifer Caldwell', rank: 'Gold', personal_bv: 220, team_bv: 41820, commission_amount: 1050.00, override_amount: 200.00, total_payout: 1250.00, status: 'paid', payment_date: '2025-03-05' },
    { id: 'pay-003', period: 'February 2025', rep_id: 'ASD-48291', rep_name: 'Sarah Jenkins', rank: 'Silver', personal_bv: 175, team_bv: 31920, commission_amount: 450.00, override_amount: 30.00, total_payout: 480.00, status: 'paid', payment_date: '2025-03-05' },
    { id: 'pay-004', period: 'February 2025', rep_id: 'ASD-55102', rep_name: 'David Park', rank: 'Bronze', personal_bv: 150, team_bv: 8420, commission_amount: 85.00, override_amount: 10.00, total_payout: 95.00, status: 'paid', payment_date: '2025-03-05' },
    { id: 'pay-005', period: 'February 2025', rep_id: 'ASD-31029', rep_name: 'Robert Nguyen', rank: 'Associate', personal_bv: 50, team_bv: 1240, commission_amount: 15.00, override_amount: 0, total_payout: 15.00, status: 'pending' },
  ]);

  const [filterPeriod, setFilterPeriod] = useState('February 2025');

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {router.push('/login'); return;}
      const { data: dist } = await supabase.from('distributors').select('role').eq('email', user.email).single();
      if (!dist || dist.role !== 'admin') {router.push('/dashboard'); return;}
      setLoading(false);
    }
    checkAuth();
  }, [router, supabase]);

  function getStatusBadge(status: string) {
    if (status === 'paid') return (
      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Paid
      </span>
    );
    if (status === 'processing') return (
      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing
      </span>
    );
    if (status === 'pending') return (
      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Pending
      </span>
    );
    if (status === 'failed') return (
      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Failed
      </span>
    );
  }

  const filteredPayouts = payouts.filter(p => p.period === filterPeriod);
  const totalPayout = filteredPayouts.reduce((sum, p) => sum + p.total_payout, 0);
  const paidCount = filteredPayouts.filter(p => p.status === 'paid').length;
  const pendingCount = filteredPayouts.filter(p => p.status === 'pending').length;

  function exportToCSV() {
    const csv = 'Period,Rep ID,Rep Name,Rank,Personal BV,Team BV,Commission,Override,Total Payout,Status,Payment Date\n' +
      filteredPayouts.map(p =>
        `${p.period},${p.rep_id},${p.rep_name},${p.rank},${p.personal_bv},${p.team_bv},${p.commission_amount},${p.override_amount},${p.total_payout},${p.status},${p.payment_date || 'N/A'}`
      ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts_${filterPeriod.replace(' ', '_')}.csv`;
    a.click();
  }

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A7D]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{minHeight: '100vh'}}>
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top Bar */}
        <div className="px-6 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 bg-white border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <a href="/admin" className="text-xs text-gray-400 hover:text-[#1B3A7D] transition-colors">Command Center</a>
              <svg className="w-2 h-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-[#1B3A7D]">Payouts</span>
            </div>
            <h1 className="text-base font-bold text-[#0F2045] mt-0.5">Payout Report & Commission Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-neutral-50">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #1B3A7D 0%, #274693 100%)'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F2045]">${totalPayout.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                  <p className="text-xs text-gray-500">Total Payout</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F2045]">{paidCount}</p>
                  <p className="text-xs text-gray-500">Paid</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F2045]">{pendingCount}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-[#0F2045]">Period:</label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-[#1B3A7D] outline-none"
              >
                <option>February 2025</option>
                <option>January 2025</option>
                <option>December 2024</option>
                <option>November 2024</option>
              </select>
            </div>
          </div>

          {/* Payouts Table */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-[#0F2045]">Commission Payouts</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rep</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Personal BV</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Team BV</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Override</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total Payout</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-[#0F2045]">{payout.rep_name}</p>
                        <p className="text-xs text-gray-500">{payout.rep_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">{payout.rank}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs text-gray-700">{payout.personal_bv}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-semibold text-[#0F2045]">${payout.team_bv.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-semibold text-emerald-600">${payout.commission_amount.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-semibold text-blue-600">${payout.override_amount.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-bold text-[#0F2045]">${payout.total_payout.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {getStatusBadge(payout.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-600">{payout.payment_date || '—'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
