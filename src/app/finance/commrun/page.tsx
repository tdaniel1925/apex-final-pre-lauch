'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface RepProjection {
  rep_id: string;
  rep_name: string;
  rank: string;
  personal_bv: number;
  team_bv: number;
  projected_payout: number;
  override_levels: number;
  carry_forward: boolean;
}

export default function CommRunPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [simMonth, setSimMonth] = useState('2025-03');
  const [projections, setProjections] = useState<RepProjection[]>([]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {router.push('/login'); return;}
      const { data: dist } = await supabase.from('distributors').select('role').eq('email', user.email).single();
      if (!dist || !['cfo', 'admin'].includes(dist.role)) {router.push('/dashboard'); return;}
      setLoading(false);
      loadProjections();
    }
    checkAuth();
  }, [router, supabase]);

  async function loadProjections() {
    // Mock data for demonstration - in production this would read from Supabase
    const mockData: RepProjection[] = [
      {rep_id: 'REP001', rep_name: 'John Smith', rank: 'PLATINUM', personal_bv: 250, team_bv: 35000, projected_payout: 2450.00, override_levels: 5, carry_forward: false},
      {rep_id: 'REP002', rep_name: 'Sarah Johnson', rank: 'GOLD', personal_bv: 200, team_bv: 15000, projected_payout: 1250.00, override_levels: 4, carry_forward: false},
      {rep_id: 'REP003', rep_name: 'Mike Davis', rank: 'SILVER', personal_bv: 150, team_bv: 3500, projected_payout: 480.00, override_levels: 3, carry_forward: false},
      {rep_id: 'REP004', rep_name: 'Emily Chen', rank: 'BRONZE', personal_bv: 100, team_bv: 800, projected_payout: 95.00, override_levels: 2, carry_forward: false},
      {rep_id: 'REP005', rep_name: 'Tom Wilson', rank: 'ASSOCIATE', personal_bv: 50, team_bv: 50, projected_payout: 22.50, override_levels: 1, carry_forward: true},
      {rep_id: 'REP006', rep_name: 'Lisa Anderson', rank: 'PLATINUM', personal_bv: 300, team_bv: 48000, projected_payout: 3200.00, override_levels: 5, carry_forward: false},
      {rep_id: 'REP007', rep_name: 'David Martinez', rank: 'GOLD', personal_bv: 220, team_bv: 12000, projected_payout: 1050.00, override_levels: 4, carry_forward: false},
      {rep_id: 'REP008', rep_name: 'Rachel Brown', rank: 'SILVER', personal_bv: 175, team_bv: 4200, projected_payout: 580.00, override_levels: 3, carry_forward: false},
    ];
    setProjections(mockData);
  }

  function exportToCSV() {
    const csv = 'Rep ID,Name,Rank,Personal BV,Team BV,Projected Payout,Override Levels,Carry Forward\n' +
      projections.map(p =>
        `${p.rep_id},${p.rep_name},${p.rank},${p.personal_bv},${p.team_bv},${p.projected_payout},${p.override_levels},${p.carry_forward ? 'Yes' : 'No'}`
      ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission_run_${simMonth}.csv`;
    a.click();
  }

  const totalPayout = projections.reduce((sum, p) => sum + p.projected_payout, 0);
  const carryForwardCount = projections.filter(p => p.carry_forward).length;
  const qualifiedCount = projections.filter(p => !p.carry_forward).length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-primary-800 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-primary-800 font-bold text-xl">A</div>
            <div><h1 className="font-heading text-lg font-bold">Apex Finance & Analytics Suite</h1><div className="text-xs text-primary-200 font-mono">INTERNAL USE ONLY • V 2.4.1</div></div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-[1920px] mx-auto">
          <Link href="/finance" className="text-xs font-semibold text-neutral-400 uppercase hover:text-primary-700">← Finance</Link>
          <h1 className="font-heading font-bold text-gray-900 text-2xl mt-1">Commission Run Pre-Simulation</h1>
          <p className="text-sm text-gray-500 mt-1">Simulate a commission run before execution - shows projected payouts for all reps</p>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Control Panel */}
        <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Simulation Month</label>
                <input
                  type="month"
                  value={simMonth}
                  onChange={(e) => setSimMonth(e.target.value)}
                  className="px-4 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 outline-none"
                />
              </div>
              <div className="pt-5">
                <button
                  onClick={loadProjections}
                  className="px-6 py-2 bg-primary-800 text-white text-sm font-bold rounded-small hover:bg-primary-700 transition-colors"
                >
                  Run Simulation
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Run Timing</div>
              <div className="text-sm font-bold text-gray-900">3rd Business Day of Following Month</div>
              <div className="text-xs text-neutral-500 mt-1">$25 minimum threshold</div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-large border border-neutral-200 p-5">
            <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Total Reps</div>
            <div className="text-3xl font-bold text-gray-900">{projections.length}</div>
          </div>
          <div className="bg-green-50 rounded-large border border-green-200 p-5">
            <div className="text-xs font-semibold text-green-700 uppercase mb-1">Qualified Payouts</div>
            <div className="text-3xl font-bold text-green-800">{qualifiedCount}</div>
          </div>
          <div className="bg-amber-50 rounded-large border border-amber-200 p-5">
            <div className="text-xs font-semibold text-amber-700 uppercase mb-1">Carry Forward</div>
            <div className="text-3xl font-bold text-amber-800">{carryForwardCount}</div>
            <div className="text-xs text-amber-600 mt-1">Below $25 min</div>
          </div>
          <div className="bg-primary-50 rounded-large border border-primary-200 p-5">
            <div className="text-xs font-semibold text-primary-700 uppercase mb-1">Total Payout</div>
            <div className="text-3xl font-bold text-primary-800">${totalPayout.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </div>
        </div>

        {/* Projections Table */}
        <div className="bg-white rounded-large shadow-custom border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="font-heading font-semibold text-gray-800 text-lg">Rep Projections</h2>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-small hover:bg-green-700 transition-colors"
            >
              Export to CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Rep ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Rank</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-neutral-500 uppercase tracking-wide">Personal BV</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-neutral-500 uppercase tracking-wide">Team BV</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-neutral-500 uppercase tracking-wide">Override Levels</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-neutral-500 uppercase tracking-wide">Projected Payout</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-neutral-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {projections.map((proj) => (
                  <tr key={proj.rep_id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-600">{proj.rep_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{proj.rep_name}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-small text-xs font-semibold">{proj.rank}</span></td>
                    <td className="px-4 py-3 text-right text-gray-700">{proj.personal_bv}</td>
                    <td className="px-4 py-3 text-right text-gray-700">${proj.team_bv.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center font-bold text-gray-800">{proj.override_levels}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">${proj.projected_payout.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      {proj.carry_forward ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-small text-xs font-semibold">Carry Forward</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-small text-xs font-semibold">Qualified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-large p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-blue-900 mb-1">Simulation Notes</div>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Prior-month rank governs commission rate</li>
                <li>• Payouts below $25 are carried forward to next month</li>
                <li>• Run is immutable once locked on 3rd business day</li>
                <li>• This simulation uses current BV data - actual run may vary</li>
              </ul>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
