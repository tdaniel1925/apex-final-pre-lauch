'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminCommandCenter() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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
            <h1 className="text-base font-bold text-[#0F2045]">Corporate Admin Command Center</h1>
            <p className="text-xs text-gray-500 mt-0.5">Real-time org snapshot · Last updated: <span className="text-emerald-600 font-semibold">Just now</span></p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.25)'}}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-xs font-semibold text-emerald-700">All Systems Operational</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export
            </button>
            <div className="relative">
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C7181F] text-white flex items-center justify-center font-bold" style={{fontSize: '9px'}}>7</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-neutral-50">
          {/* KPI Cards Row */}
          <section>
            <div className="grid grid-cols-5 gap-4">
              {/* Total Reps */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-5" style={{background: '#1B3A7D', transform: 'translate(25%,-25%)'}}></div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #1B3A7D 0%, #274693 100%)'}}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg> +4.2%</span>
                </div>
                <p className="text-2xl font-bold text-[#0F2045] mt-1">12,847</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Reps</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 rounded-full bg-neutral-100 flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-[#1B3A7D]" style={{width: '78%'}}></div>
                  </div>
                  <span className="text-xs text-gray-400">78%</span>
                </div>
              </div>

              {/* Licensed Reps */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-5" style={{background: '#059669', transform: 'translate(25%,-25%)'}}></div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'}}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg> +2.8%</span>
                </div>
                <p className="text-2xl font-bold text-[#0F2045] mt-1">8,214</p>
                <p className="text-xs text-gray-500 mt-0.5">Licensed Reps</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 rounded-full bg-emerald-100 flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{width: '63.9%'}}></div>
                  </div>
                  <span className="text-xs text-gray-400">63.9%</span>
                </div>
              </div>

              {/* Unlicensed Reps */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-5" style={{background: '#d97706', transform: 'translate(25%,-25%)'}}></div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'}}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-red-600 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" /></svg> -1.4%</span>
                </div>
                <p className="text-2xl font-bold text-[#0F2045] mt-1">4,633</p>
                <p className="text-xs text-gray-500 mt-0.5">Unlicensed Reps</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 rounded-full bg-amber-100 flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{width: '36.1%'}}></div>
                  </div>
                  <span className="text-xs text-gray-400">36.1%</span>
                </div>
              </div>

              {/* MRR */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-5" style={{background: '#D9272F', transform: 'translate(25%,-25%)'}}></div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #C7181F 0%, #D9272F 100%)'}}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg> +11.3%</span>
                </div>
                <p className="text-2xl font-bold text-[#0F2045] mt-1">$4.87M</p>
                <p className="text-xs text-gray-500 mt-0.5">Monthly Recurring Rev.</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 rounded-full bg-red-100 flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-[#D9272F]" style={{width: '87%'}}></div>
                  </div>
                  <span className="text-xs text-gray-400">87%</span>
                </div>
              </div>

              {/* Bonus Pool Balance */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-5" style={{background: '#7c3aed', transform: 'translate(25%,-25%)'}}></div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)'}}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg> +6.7%</span>
                </div>
                <p className="text-2xl font-bold text-[#0F2045] mt-1">$892K</p>
                <p className="text-xs text-gray-500 mt-0.5">Bonus Pool Balance</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 rounded-full bg-purple-100 flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500" style={{width: '54%'}}></div>
                  </div>
                  <span className="text-xs text-gray-400">54%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Placeholder for Middle Row */}
          <section>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 text-center">
              <p className="text-sm text-gray-500">Company-Wide Growth Chart & Pending Actions</p>
              <p className="text-xs text-gray-400 mt-2">(Placeholder - Full implementation in next iteration)</p>
            </div>
          </section>

          {/* Placeholder for Bottom Row */}
          <section>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 text-center">
              <p className="text-sm text-gray-500">Top Performers Leaderboard & System Health</p>
              <p className="text-xs text-gray-400 mt-2">(Placeholder - Full implementation in next iteration)</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
