'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface RankRequest {
  id: string;
  rep_name: string;
  rep_id: string;
  photo: string;
  current_rank: string;
  requested_rank: string;
  request_date: string;
  personal_bv: number;
  team_bv: number;
  downline_count: number;
  qualified_legs: number;
  status: 'pending' | 'approved' | 'denied';
  reviewed_by?: string;
  review_date?: string;
  review_reason?: string;
}

export default function RankApprovalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [requests, setRequests] = useState<RankRequest[]>([
    { id: 'req-001', rep_name: 'Marcus Thompson', rep_id: 'ASD-10291', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64', current_rank: 'Gold', requested_rank: 'Platinum', request_date: '2025-03-08', personal_bv: 250, team_bv: 35000, downline_count: 847, qualified_legs: 4, status: 'pending' },
    { id: 'req-002', rep_name: 'Sarah Jenkins', rep_id: 'ASD-48291', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64', current_rank: 'Silver', requested_rank: 'Gold', request_date: '2025-03-07', personal_bv: 200, team_bv: 15000, downline_count: 492, qualified_legs: 3, status: 'pending' },
    { id: 'req-003', rep_name: 'David Park', rep_id: 'ASD-55102', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64', current_rank: 'Bronze', requested_rank: 'Silver', request_date: '2025-03-06', personal_bv: 150, team_bv: 4200, downline_count: 218, qualified_legs: 2, status: 'pending' },
    { id: 'req-004', rep_name: 'Jennifer Caldwell', rep_id: 'ASD-20847', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64', current_rank: 'Silver', requested_rank: 'Gold', request_date: '2025-03-05', personal_bv: 220, team_bv: 12800, downline_count: 384, qualified_legs: 3, status: 'approved', reviewed_by: 'Alexandra Mitchell', review_date: '2025-03-06', review_reason: 'All qualifications met. Strong team performance.' },
    { id: 'req-005', rep_name: 'Robert Nguyen', rep_id: 'ASD-31029', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64', current_rank: 'Bronze', requested_rank: 'Silver', request_date: '2025-03-04', personal_bv: 120, team_bv: 2800, downline_count: 142, qualified_legs: 1, status: 'denied', reviewed_by: 'Alexandra Mitchell', review_date: '2025-03-05', review_reason: 'Insufficient qualified legs. Needs 2+ qualified legs with minimum 1000 BV each.' },
  ]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'denied'>('pending');

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

  function getRankColor(rank: string) {
    if (rank === 'Platinum') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (rank === 'Gold') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (rank === 'Silver') return 'bg-slate-100 text-slate-700 border-slate-200';
    if (rank === 'Bronze') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  }

  function getStatusBadge(status: string) {
    if (status === 'pending') return (
      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Pending
      </span>
    );
    if (status === 'approved') return (
      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Approved
      </span>
    );
    if (status === 'denied') return (
      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Denied
      </span>
    );
  }

  const filteredRequests = requests.filter(req =>
    filterStatus === 'all' ? true : req.status === filterStatus
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const deniedCount = requests.filter(r => r.status === 'denied').length;

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
              <span className="text-xs font-semibold text-[#1B3A7D]">Rank Approvals</span>
            </div>
            <h1 className="text-base font-bold text-[#0F2045] mt-0.5">Rank Upgrade Approval Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-neutral-50">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F2045]">{pendingCount}</p>
                  <p className="text-xs text-gray-500">Pending Approvals</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F2045]">{approvedCount}</p>
                  <p className="text-xs text-gray-500">Approved This Month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #C7181F 0%, #D9272F 100%)'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F2045]">{deniedCount}</p>
                  <p className="text-xs text-gray-500">Denied This Month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white border border-neutral-200 w-fit">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`text-xs font-semibold px-4 py-2 rounded-md transition-colors ${filterStatus === 'pending' ? 'bg-[#1B3A7D] text-white shadow-sm' : 'text-gray-600 hover:text-[#1B3A7D]'}`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`text-xs font-medium px-4 py-2 rounded-md transition-colors ${filterStatus === 'approved' ? 'bg-[#1B3A7D] text-white shadow-sm' : 'text-gray-600 hover:text-[#1B3A7D]'}`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilterStatus('denied')}
              className={`text-xs font-medium px-4 py-2 rounded-md transition-colors ${filterStatus === 'denied' ? 'bg-[#1B3A7D] text-white shadow-sm' : 'text-gray-600 hover:text-[#1B3A7D]'}`}
            >
              Denied ({deniedCount})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`text-xs font-medium px-4 py-2 rounded-md transition-colors ${filterStatus === 'all' ? 'bg-[#1B3A7D] text-white shadow-sm' : 'text-gray-600 hover:text-[#1B3A7D]'}`}
            >
              All ({requests.length})
            </button>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={request.photo}
                      alt={request.rep_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#1B3A7D]"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#0F2045]">{request.rep_name}</p>
                      <p className="text-xs text-gray-500">{request.rep_id} · Requested {request.request_date}</p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Current Rank:</span>
                      <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full border ${getRankColor(request.current_rank)}`}>
                        {request.current_rank}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <div className="text-sm">
                      <span className="text-gray-500">Requested:</span>
                      <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full border ${getRankColor(request.requested_rank)}`}>
                        {request.requested_rank}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-slate-50 border border-neutral-200">
                    <p className="text-xs text-gray-500 mb-1">Personal BV</p>
                    <p className="text-sm font-bold text-[#0F2045]">{request.personal_bv}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-neutral-200">
                    <p className="text-xs text-gray-500 mb-1">Team BV</p>
                    <p className="text-sm font-bold text-emerald-600">${request.team_bv.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-neutral-200">
                    <p className="text-xs text-gray-500 mb-1">Downline</p>
                    <p className="text-sm font-bold text-[#0F2045]">{request.downline_count}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-neutral-200">
                    <p className="text-xs text-gray-500 mb-1">Qualified Legs</p>
                    <p className="text-sm font-bold text-[#0F2045]">{request.qualified_legs}</p>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-4 border-t border-neutral-200">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-colors" style={{background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'}}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve Request
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#C7181F] hover:bg-[#D9272F] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Deny Request
                    </button>
                  </div>
                )}

                {request.status !== 'pending' && request.review_reason && (
                  <div className={`p-3 rounded-lg mt-4 ${request.status === 'approved' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-start gap-2">
                      <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${request.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className={`text-xs font-bold mb-1 ${request.status === 'approved' ? 'text-emerald-900' : 'text-red-900'}`}>
                          {request.status === 'approved' ? 'Approval' : 'Denial'} Reason
                        </p>
                        <p className={`text-xs ${request.status === 'approved' ? 'text-emerald-800' : 'text-red-800'}`}>
                          {request.review_reason}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Reviewed by {request.reviewed_by} on {request.review_date}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
