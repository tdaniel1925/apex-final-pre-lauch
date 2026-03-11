'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function SystemSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [settings, setSettings] = useState({
    commission_schedule_day: 3,
    payout_minimum_threshold: 25,
    rank_advancement_approval: true,
    auto_commission_run: true,
    email_notifications: true,
    platform_maintenance_mode: false,
  });

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
              <span className="text-xs font-semibold text-[#1B3A7D]">System Settings</span>
            </div>
            <h1 className="text-base font-bold text-[#0F2045] mt-0.5">System Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-neutral-50">
          {/* Commission Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-[#0F2045] mb-4">Commission Settings</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#0F2045] mb-2">Commission Run Schedule Day</label>
                <input
                  type="number"
                  value={settings.commission_schedule_day}
                  onChange={(e) => setSettings({...settings, commission_schedule_day: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:border-[#1B3A7D] outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Business day of the month for automatic commission run</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F2045] mb-2">Payout Minimum Threshold ($)</label>
                <input
                  type="number"
                  value={settings.payout_minimum_threshold}
                  onChange={(e) => setSettings({...settings, payout_minimum_threshold: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:border-[#1B3A7D] outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum amount required to issue payout (below this is carried forward)</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_commission_run}
                  onChange={(e) => setSettings({...settings, auto_commission_run: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <p className="text-sm font-semibold text-[#0F2045]">Automatic Commission Runs</p>
                  <p className="text-xs text-gray-500">Automatically trigger commission runs on the scheduled day</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.rank_advancement_approval}
                  onChange={(e) => setSettings({...settings, rank_advancement_approval: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <p className="text-sm font-semibold text-[#0F2045]">Require Rank Advancement Approval</p>
                  <p className="text-xs text-gray-500">All rank upgrades must be manually approved by admin</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-[#0F2045] mb-4">Notification Settings</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <p className="text-sm font-semibold text-[#0F2045]">Email Notifications</p>
                  <p className="text-xs text-gray-500">Send email notifications for important system events</p>
                </div>
              </label>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-[#0F2045] mb-4">System Status</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.platform_maintenance_mode}
                  onChange={(e) => setSettings({...settings, platform_maintenance_mode: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <p className="text-sm font-semibold text-[#C7181F]">Platform Maintenance Mode</p>
                  <p className="text-xs text-gray-500">Enable maintenance mode to prevent user access (admin access only)</p>
                </div>
              </label>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-[#0F2045] mb-4">System Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-neutral-200">
                <p className="text-xs text-gray-500 mb-1">Platform Version</p>
                <p className="text-sm font-bold text-[#0F2045]">v2.4.1</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-neutral-200">
                <p className="text-xs text-gray-500 mb-1">Environment</p>
                <p className="text-sm font-bold text-[#0F2045]">Production</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-neutral-200">
                <p className="text-xs text-gray-500 mb-1">Database Status</p>
                <p className="text-sm font-bold text-emerald-600">Connected</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-neutral-200">
                <p className="text-xs text-gray-500 mb-1">Last Backup</p>
                <p className="text-sm font-bold text-[#0F2045]">2025-03-11 02:00 UTC</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900 mb-1">Critical Settings Warning</p>
                <p className="text-xs text-amber-800">
                  Changes to commission settings, payout thresholds, and system status can significantly impact distributor compensation and platform operations.
                  Ensure all changes are reviewed and approved before saving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
