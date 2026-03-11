'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import RepSidebar from '@/components/rep/RepSidebar';

interface DashboardData {
  totalEarnings: number;
  personalBV: number;
  teamVolume: number;
  cabPending: number;
  rank: string;
  nextRank: string;
  rankProgress: number;
  directDownlineCount: number;
  announcements: Array<{
    id: string;
    title: string;
    preview: string;
    created_at: string;
  }>;
  recentActivity: Array<{
    type: string;
    message: string;
    detail: string;
    timestamp: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadDashboardData() {
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

      // Get current month commission data
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: commissions } = await supabase
        .from('commission_payouts')
        .select('*')
        .eq('distributor_id', profile.id)
        .gte('payout_date', `${currentMonth}-01`)
        .order('payout_date', { ascending: false });

      // Get latest 2 announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('id, title, content, created_at')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(2);

      // Count direct downline
      const { count: downlineCount } = await supabase
        .from('distributors')
        .select('*', { count: 'only', head: true })
        .eq('sponsor_id', profile.id);

      // Calculate totals
      const totalEarnings = commissions?.reduce((sum, c) => sum + (c.total_payout || 0), 0) || 0;
      const personalBV = profile.personal_bv_current_month || 0;
      const teamVolume = profile.team_bv_current_month || 0;
      const cabPending = commissions?.find(c => c.status === 'pending')?.cab_bonus || 0;

      // Mock recent activity (in production, fetch from activity log table)
      const recentActivity = [
        {
          type: 'enrollment',
          message: 'New Rep Enrolled',
          detail: 'A new rep joined your downline.',
          timestamp: '2 hours ago'
        },
        {
          type: 'order',
          message: 'New Customer Order',
          detail: 'Order from retail customer ($120).',
          timestamp: '5 hours ago'
        },
        {
          type: 'rank',
          message: 'Rank Advancement',
          detail: 'Your downline member hit Gold!',
          timestamp: '1 day ago'
        }
      ];

      setDashboardData({
        totalEarnings,
        personalBV,
        teamVolume,
        cabPending,
        rank: profile.rank || 'Associate',
        nextRank: getNextRank(profile.rank || 'Associate'),
        rankProgress: calculateRankProgress(teamVolume),
        directDownlineCount: downlineCount || 0,
        announcements: announcements?.map(a => ({
          id: a.id,
          title: a.title,
          preview: a.content?.slice(0, 100) + '...' || '',
          created_at: a.created_at
        })) || [],
        recentActivity
      });

      setLoading(false);
    }

    loadDashboardData();
  }, [supabase, router]);

  function getNextRank(currentRank: string): string {
    const ranks = ['Associate', 'Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = ranks.indexOf(currentRank);
    return currentIndex >= 0 && currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : 'Platinum';
  }

  function calculateRankProgress(teamBV: number): number {
    // Simplified: 50k GV needed for next rank
    return Math.min(Math.round((teamBV / 50000) * 100), 100);
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B3A7D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">No data available</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <RepSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F2045]">Dashboard Overview</h1>
              <p className="text-gray-500 text-sm mt-1">
                Welcome back! You&apos;re {dashboardData.rankProgress}% of the way to {dashboardData.nextRank}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-[#1B3A7D] hover:bg-gray-50 transition-colors border border-gray-200">
                <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-lg" style={{ background: '#1B3A7D' }}>
                <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Report
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Earnings Card */}
            <div className="bg-white rounded-2xl p-5 relative overflow-hidden group shadow-sm border border-gray-100">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-[#1B3A7D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#1B3A7D]" style={{ background: '#E8EAF2' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500">Total Earnings</span>
              </div>
              <h3 className="text-3xl font-bold text-[#0F2045]">${dashboardData.totalEarnings.toLocaleString()}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  This Month
                </span>
              </div>
            </div>

            {/* Personal BV Card */}
            <div className="bg-white rounded-2xl p-5 relative overflow-hidden group shadow-sm border border-gray-100">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-[#C7181F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#C7181F]" style={{ background: '#FBE8E9' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500">Personal BV</span>
              </div>
              <h3 className="text-3xl font-bold text-[#0F2045]">{dashboardData.personalBV} <span className="text-lg text-gray-400 font-normal">PV</span></h3>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Active
                </span>
                <span className="text-gray-400">Qualified</span>
              </div>
            </div>

            {/* Team Volume Card */}
            <div className="bg-white rounded-2xl p-5 relative overflow-hidden group shadow-sm border border-gray-100">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-[#1B3A7D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#1B3A7D]" style={{ background: '#E8EAF2' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500">Team Volume</span>
              </div>
              <h3 className="text-3xl font-bold text-[#0F2045]">{dashboardData.teamVolume.toLocaleString()} <span className="text-lg text-gray-400 font-normal">GV</span></h3>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                  {dashboardData.directDownlineCount} Direct
                </span>
              </div>
            </div>

            {/* CAB Pending Card */}
            <div className="bg-white rounded-2xl p-5 relative overflow-hidden group shadow-sm border border-gray-100">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-[#C7181F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#C7181F]" style={{ background: '#FBE8E9' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500">CAB Pending</span>
              </div>
              <h3 className="text-3xl font-bold text-[#0F2045]">${dashboardData.cabPending.toLocaleString()}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Next Payout
                </span>
              </div>
            </div>
          </div>

          {/* Lower Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Rank Progress & Quick Actions */}
            <div className="space-y-6">
              {/* Rank Progress */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0F2045]">Rank Progress</h3>
                    <p className="text-sm text-gray-500 mt-1">Next: <span className="text-[#C7181F] font-semibold">{dashboardData.nextRank}</span></p>
                  </div>
                  <span className="text-2xl font-bold text-[#1B3A7D]">{dashboardData.rankProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${dashboardData.rankProgress}%`,
                      background: 'linear-gradient(to right, #1B3A7D, #C7181F)'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Current: {dashboardData.rank}</span>
                  <span>Goal: 50k GV</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#0F2045] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-gray-50 transition-colors group border border-gray-100" style={{ background: '#E8EAF2' }}>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-[#1B3A7D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[#1B3A7D]">Enroll Rep</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-red-100 transition-colors group border border-gray-100" style={{ background: '#FBE8E9' }}>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-[#C7181F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[#C7181F]">Share Link</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-200 hover:border-[#1B3A7D] transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">Send Sample</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-200 hover:border-[#1B3A7D] transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">Schedule</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#0F2045]">Recent Activity</h3>
                <button className="text-xs text-[#1B3A7D] font-medium hover:underline">View All</button>
              </div>
              <div className="space-y-6 relative">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="relative flex gap-4">
                    <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center z-10 shrink-0 ${
                      activity.type === 'enrollment' ? 'bg-emerald-100' :
                      activity.type === 'order' ? 'bg-blue-100' :
                      'bg-red-100'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        activity.type === 'enrollment' ? 'text-emerald-600' :
                        activity.type === 'order' ? 'text-blue-600' :
                        'text-[#C7181F]'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {activity.type === 'enrollment' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                        {activity.type === 'order' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
                        {activity.type === 'rank' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />}
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.detail}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements Preview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#0F2045]">Latest News</h3>
                <button className="text-xs text-[#1B3A7D] font-medium hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {dashboardData.announcements.length > 0 ? (
                  dashboardData.announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 rounded-xl border border-gray-200 hover:border-[#1B3A7D] transition-colors cursor-pointer">
                      <h4 className="text-sm font-bold text-[#0F2045] mb-1">{announcement.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{announcement.preview}</p>
                      <span className="text-[10px] text-gray-400">
                        {new Date(announcement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No announcements available</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
