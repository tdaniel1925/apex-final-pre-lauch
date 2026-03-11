'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface CommissionRun {
  id: string;
  run_date: string;
  period: string;
  status: 'pending' | 'processing' | 'complete' | 'locked' | 'failed';
  total_reps: number;
  total_payout: number;
  duration_seconds: number;
  triggered_by: string;
}

export default function CommissionEnginePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [runs, setRuns] = useState<CommissionRun[]>([
    { id: 'run-001', run_date: '2025-03-03', period: 'February 2025', status: 'complete', total_reps: 12847, total_payout: 524820, duration_seconds: 128, triggered_by: 'System (Auto)' },
    { id: 'run-002', run_date: '2025-02-03', period: 'January 2025', status: 'locked', total_reps: 12104, total_payout: 492103, duration_seconds: 132, triggered_by: 'System (Auto)' },
    { id: 'run-003', run_date: '2025-01-03', period: 'December 2024', status: 'locked', total_reps: 11847, total_payout: 478240, duration_seconds: 124, triggered_by: 'System (Auto)' },
    { id: 'run-004', run_date: '2024-12-03', period: 'November 2024', status: 'locked', total_reps: 11520, total_payout: 461890, duration_seconds: 119, triggered_by: 'James Whitfield (Admin)' },
  ]);

  const [currentRun, setCurrentRun] = useState<CommissionRun | null>(runs[0]);
  const [snapshotStatus, setSnapshotStatus] = useState<'available' | 'missing' | 'running'>('checking');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  async function checkBVSnapshot(month: string) {
    const { data } = await supabase
      .from('bv_snapshot_runs')
      .select('status')
      .eq('snapshot_month', month)
      .single();

    if (data?.status === 'complete') {
      setSnapshotStatus('available');
    } else if (data?.status === 'running') {
      setSnapshotStatus('running');
    } else {
      setSnapshotStatus('missing');
    }
  }

  async function runBVSnapshot() {
    setSnapshotStatus('running');
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/snapshot-monthly-bv`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }
    });
    const result = await response.json();
    if (result.success) {
      setSnapshotStatus('available');
      alert(`BV Snapshot complete: ${result.successful_snapshots} reps`);
    }
  }

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

  function getStatusColor(status: string) {
    if (status === 'complete') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'processing') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'pending') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'locked') return 'bg-slate-100 text-slate-700 border-slate-300';
    if (status === 'failed') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  }

  function getStatusIcon(status: string) {
    if (status === 'complete') return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    if (status === 'processing') return (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );
    if (status === 'pending') return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    if (status === 'locked') return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    );
    return null;
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
              <span className="text-xs font-semibold text-[#1B3A7D]">Commission Engine</span>
            </div>
            <h1 className="text-base font-bold text-[#0F2045] mt-0.5">Commission Engine Control</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Logs
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{background: 'linear-gradient(135deg, #1B3A7D 0%, #274693 100%)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Trigger New Run
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-neutral-50">
          {/* Current Run Status */}
          {currentRun && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#0F2045]">Current Run Status</h2>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(currentRun.status)}`}>
                  {getStatusIcon(currentRun.status)}
                  {currentRun.status.charAt(0).toUpperCase() + currentRun.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-neutral-200 bg-slate-50">
                  <p className="text-xs text-gray-500 mb-1">Period</p>
                  <p className="text-lg font-bold text-[#0F2045]">{currentRun.period}</p>
                </div>
                <div className="p-4 rounded-lg border border-neutral-200 bg-slate-50">
                  <p className="text-xs text-gray-500 mb-1">Total Reps Processed</p>
                  <p className="text-lg font-bold text-[#0F2045]">{currentRun.total_reps.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg border border-neutral-200 bg-slate-50">
                  <p className="text-xs text-gray-500 mb-1">Total Payout</p>
                  <p className="text-lg font-bold text-emerald-600">${currentRun.total_payout.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg border border-neutral-200 bg-slate-50">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="text-lg font-bold text-[#0F2045]">{currentRun.duration_seconds}s</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-blue-900 mb-1">Commission Run Notes</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Run triggered automatically on 3rd business day of the month</li>
                      <li>• Prior-month rank governs commission rate</li>
                      <li>• Payouts below $25 are carried forward to next month</li>
                      <li>• Run is immutable once locked (typically 24 hours after completion)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Run History */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-[#0F2045]">Run History</h2>
              <p className="text-xs text-gray-500 mt-1">Recent commission runs with status and payout information</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Run ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Run Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total Reps</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total Payout</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Triggered By</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {runs.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono font-semibold text-[#1B3A7D]">{run.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-[#0F2045]">{run.run_date}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-700">{run.period}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(run.status)}`} style={{fontSize: '9px'}}>
                            {getStatusIcon(run.status)}
                            {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-semibold text-[#0F2045]">{run.total_reps.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-bold text-emerald-600">${run.total_payout.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs text-gray-700">{run.duration_seconds}s</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-600">{run.triggered_by}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#1B3A7D] hover:text-[#0F2045] transition-colors"
                            style={{background: 'rgba(27,58,125,0.08)'}}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors bg-slate-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warning Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900 mb-1">Manual Run Warning</p>
                <p className="text-xs text-amber-800">
                  Manual commission runs should only be triggered by authorized administrators. Ensure all data is verified before triggering a run.
                  Once a run is complete and locked, it cannot be reversed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
