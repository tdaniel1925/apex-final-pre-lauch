'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: string;
  ip_address: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function CompliancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [logs, setLogs] = useState<AuditLog[]>([
    { id: 'log-001', timestamp: '2025-03-11 14:32:18', user: 'Alexandra Mitchell (Admin)', action: 'APPROVED_RANK_UPGRADE', entity_type: 'rank_request', entity_id: 'req-004', changes: 'Jennifer Caldwell: Silver → Gold', ip_address: '192.168.1.45', severity: 'medium' },
    { id: 'log-002', timestamp: '2025-03-11 14:28:45', user: 'Alexandra Mitchell (Admin)', action: 'DENIED_RANK_UPGRADE', entity_type: 'rank_request', entity_id: 'req-005', changes: 'Robert Nguyen: Bronze → Silver (insufficient legs)', ip_address: '192.168.1.45', severity: 'medium' },
    { id: 'log-003', timestamp: '2025-03-11 13:15:22', user: 'System (Auto)', action: 'COMMISSION_RUN_COMPLETED', entity_type: 'commission_run', entity_id: 'run-001', changes: 'February 2025: $524,820 total payout', ip_address: 'internal', severity: 'high' },
    { id: 'log-004', timestamp: '2025-03-11 12:08:11', user: 'James Whitfield (Admin)', action: 'SUSPENDED_ACCOUNT', entity_type: 'distributor', entity_id: 'ASD-61847', changes: 'Lisa Monroe account suspended', ip_address: '192.168.1.42', severity: 'critical' },
    { id: 'log-005', timestamp: '2025-03-11 10:42:33', user: 'David Noyes (CFO)', action: 'EXPORTED_PAYOUT_REPORT', entity_type: 'report', entity_id: 'february-2025', changes: 'Exported CSV for February 2025', ip_address: '192.168.1.58', severity: 'low' },
    { id: 'log-006', timestamp: '2025-03-11 09:15:47', user: 'System (Auto)', action: 'PRODUCT_PRICE_CHANGED', entity_type: 'product', entity_id: 'PULSEGUARD', changes: 'Member price: $49 → $59', ip_address: 'internal', severity: 'medium' },
    { id: 'log-007', timestamp: '2025-03-10 16:28:02', user: 'Alexandra Mitchell (Admin)', action: 'CREATED_TRAINING_CONTENT', entity_type: 'training', entity_id: 'train-005', changes: 'New content: PulseFlow 2.0 Announcement', ip_address: '192.168.1.45', severity: 'low' },
    { id: 'log-008', timestamp: '2025-03-10 14:55:19', user: 'James Whitfield (Admin)', action: 'MODIFIED_SYSTEM_SETTINGS', entity_type: 'settings', entity_id: 'commission-schedule', changes: 'Updated payout minimum threshold to $25', ip_address: '192.168.1.42', severity: 'high' },
  ]);

  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

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

  function getSeverityBadge(severity: string) {
    if (severity === 'critical') return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
        Critical
      </span>
    );
    if (severity === 'high') return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
        High
      </span>
    );
    if (severity === 'medium') return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
        Medium
      </span>
    );
    if (severity === 'low') return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
        Low
      </span>
    );
  }

  const filteredLogs = logs.filter(log =>
    severityFilter === 'all' ? true : log.severity === severityFilter
  );

  function exportToCSV() {
    const csv = 'Timestamp,User,Action,Entity Type,Entity ID,Changes,IP Address,Severity\n' +
      filteredLogs.map(log =>
        `${log.timestamp},"${log.user}",${log.action},${log.entity_type},${log.entity_id},"${log.changes}",${log.ip_address},${log.severity}`
      ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
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
              <span className="text-xs font-semibold text-[#1B3A7D]">Compliance</span>
            </div>
            <h1 className="text-base font-bold text-[#0F2045] mt-0.5">Compliance & Audit Trail</h1>
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
          {/* Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-semibold text-[#0F2045]">Severity:</label>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-50 border border-slate-200">
                <button
                  onClick={() => setSeverityFilter('all')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${severityFilter === 'all' ? 'bg-white text-[#1B3A7D] shadow-sm' : 'text-gray-600 hover:text-[#1B3A7D]'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setSeverityFilter('critical')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${severityFilter === 'critical' ? 'bg-white text-[#1B3A7D] shadow-sm' : 'text-gray-600 hover:text-[#1B3A7D]'}`}
                >
                  Critical
                </button>
                <button
                  onClick={() => setSeverityFilter('high')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${severityFilter === 'high' ? 'bg-white text-[#1B3A7D] shadow-sm' : 'text-gray-600 hover:text-[#1B3A7D]'}`}
                >
                  High
                </button>
                <button
                  onClick={() => setSeverityFilter('medium')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${severityFilter === 'medium' ? 'bg-white text-[#1B3A7D] shadow-sm' : 'text-gray-600 hover:text-[#1B3A7D]'}`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setSeverityFilter('low')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${severityFilter === 'low' ? 'bg-white text-[#1B3A7D] shadow-sm' : 'text-gray-600 hover:text-[#1B3A7D]'}`}
                >
                  Low
                </button>
              </div>
            </div>
          </div>

          {/* Audit Log */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-[#0F2045]">Audit Log</h2>
              <p className="text-xs text-gray-500 mt-1">Complete audit trail of all system actions and changes</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Changes</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono text-gray-700">{log.timestamp}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-[#0F2045]">{log.user}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-[#1B3A7D]">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500">{log.entity_type} · {log.entity_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-700">{log.changes}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono text-gray-600">{log.ip_address}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {getSeverityBadge(log.severity)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-900 mb-1">Compliance & Retention Policy</p>
                <p className="text-xs text-blue-800">
                  All audit logs are retained for 7 years in compliance with IRS and FTC requirements. Logs are immutable and cannot be deleted or modified.
                  All actions are tracked with timestamp, user, IP address, and detailed change information for complete accountability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
