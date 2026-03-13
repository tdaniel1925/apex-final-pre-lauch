'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import RepSidebar from '@/components/rep/RepSidebar';
import DashboardClient from '@/components/dashboard/DashboardClient';
import ReplicatedSiteBanner from '@/components/rep/ReplicatedSiteBanner';
import { checkProfileCompletion } from '@/lib/profile/check-completion';
import type { Distributor } from '@/lib/types';

interface DashboardData {
  totalEarnings: number;
  personalBV: number;
  teamVolume: number;
  orgVolume: number;
  cabPending: number;
  rank: string;
  nextRank: string;
  rankProgress: number;
  directDownlineCount: number;
  unreadNotifications: number;
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
  const [distributor, setDistributor] = useState<Distributor | null>(null);
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

      setDistributor(profile);

      // Get current month commission data
      const currentMonth = new Date().toISOString().slice(0, 7);

      const { data: commissionRuns } = await supabase
        .from('commission_runs')
        .select('id')
        .eq('period', currentMonth)
        .eq('status', 'complete')
        .order('completed_at', { ascending: false })
        .limit(1);

      let totalEarnings = 0;
      if (commissionRuns && commissionRuns.length > 0) {
        const { data: repTotals } = await supabase
          .from('commission_run_rep_totals')
          .select('final_payout')
          .eq('commission_run_id', commissionRuns[0].id)
          .eq('rep_id', profile.id)
          .single();

        totalEarnings = repTotals?.final_payout || 0;
      }

      // Get BV data
      const { data: bvCache } = await supabase
        .from('org_bv_cache')
        .select('personal_bv, team_bv, org_bv, direct_count')
        .eq('rep_id', profile.id)
        .single();

      const personalBV = bvCache?.personal_bv || 0;
      const teamVolume = bvCache?.team_bv || 0;
      const orgVolume = bvCache?.org_bv || 0;
      const directDownlineCount = bvCache?.direct_count || 0;

      // Get unread notifications count
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('read', false);

      // Get latest 2 announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('id, title, content, created_at')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(2);

      // Get recent notifications as activity
      const { data: recentNotifications } = await supabase
        .from('notifications')
        .select('type, title, message, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false})
        .limit(4);

      const cabPending = 0;

      const recentActivity = recentNotifications?.map(n => {
        const timeAgo = getTimeAgo(new Date(n.created_at));
        return {
          type: n.type || 'info',
          message: n.title,
          detail: n.message,
          timestamp: timeAgo
        };
      }) || [];

      setDashboardData({
        totalEarnings,
        personalBV,
        teamVolume,
        orgVolume,
        cabPending,
        rank: profile.rank || 'Associate',
        nextRank: getNextRank(profile.rank || 'Associate'),
        rankProgress: calculateRankProgress(teamVolume),
        directDownlineCount,
        unreadNotifications: unreadCount || 0,
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
    return Math.min(Math.round((teamBV / 50000) * 100), 100);
  }

  function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  if (loading) {
    return (
      <div className="flex h-screen" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B3A7D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#0F2045]">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[#0F2045]">No data available</p>
        </main>
      </div>
    );
  }

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
  };

  return (
    <DashboardClient distributor={distributor!}>
      <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
        <RepSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative h-full">
          {/* Replicated Site Banner */}
          {distributor?.slug && <ReplicatedSiteBanner slug={distributor.slug} />}

          <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#0F2045' }}>Dashboard Overview</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Welcome back, {distributor?.first_name}! You&apos;re {dashboardData.rankProgress}% of the way to {dashboardData.nextRank}.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/80 transition-colors" style={glassStyle}>
                  <svg className="w-4 h-4 inline-block mr-2 text-[#1B3A7D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {/* Earnings Card */}
              <div className="rounded-2xl p-5 relative overflow-hidden group" style={glassStyle}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-16 h-16 text-[#1B3A7D]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#1B3A7D]" style={{ background: '#E8EAF2' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total Earnings</span>
                </div>
                <h3 className="text-3xl font-bold" style={{ color: '#0F2045' }}>${dashboardData.totalEarnings.toLocaleString()}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    12.5%
                  </span>
                  <span className="text-gray-400">vs last month</span>
                </div>
              </div>

              {/* Personal BV Card */}
              <div className="rounded-2xl p-5 relative overflow-hidden group" style={glassStyle}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-16 h-16 text-[#C7181F]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#C7181F]" style={{ background: '#FBE8E9' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Personal BV</span>
                </div>
                <h3 className="text-3xl font-bold" style={{ color: '#0F2045' }}>{dashboardData.personalBV} <span className="text-lg text-gray-400 font-normal">PV</span></h3>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Active
                  </span>
                  <span className="text-gray-400">Qualified</span>
                </div>
              </div>

              {/* Team Volume Card */}
              <div className="rounded-2xl p-5 relative overflow-hidden group" style={glassStyle}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-16 h-16 text-[#1B3A7D]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#1B3A7D]" style={{ background: '#E8EAF2' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Team Volume</span>
                </div>
                <h3 className="text-3xl font-bold" style={{ color: '#0F2045' }}>{dashboardData.teamVolume.toLocaleString()} <span className="text-lg text-gray-400 font-normal">GV</span></h3>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    8.2%
                  </span>
                  <span className="text-gray-400">vs last month</span>
                </div>
              </div>

              {/* CAB Pending Card */}
              <div className="rounded-2xl p-5 relative overflow-hidden group" style={glassStyle}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-16 h-16 text-[#C7181F]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#C7181F]" style={{ background: '#FBE8E9' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">CAB Pending</span>
                </div>
                <h3 className="text-3xl font-bold" style={{ color: '#0F2045' }}>${dashboardData.cabPending.toLocaleString()}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    3 Days
                  </span>
                  <span className="text-gray-400">until payout</span>
                </div>
              </div>
            </div>

            {/* Lower Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Rank Progress & Quick Actions */}
              <div className="space-y-6">
                {/* Rank Progress */}
                <div className="rounded-2xl p-6" style={glassStyle}>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: '#0F2045' }}>Rank Progress</h3>
                      <p className="text-sm text-gray-500 mt-1">Next: <span className="font-semibold" style={{ color: '#C7181F' }}>{dashboardData.nextRank}</span></p>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: '#1B3A7D' }}>{dashboardData.rankProgress}%</span>
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
                <div className="rounded-2xl p-6" style={glassStyle}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#0F2045' }}>Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-gray-50 transition-colors group" style={{ background: '#E8EAF2' }}>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-[#1B3A7D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#1B3A7D' }}>Enroll Rep</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-red-100 transition-colors group" style={{ background: '#FBE8E9' }}>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-[#C7181F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#C7181F' }}>Share Link</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-100 hover:border-[#1B3A7D] transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">Send Sample</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-100 hover:border-[#1B3A7D] transition-colors group">
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
              <div className="rounded-2xl p-6" style={glassStyle}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold" style={{ color: '#0F2045' }}>Recent Activity</h3>
                  <button className="text-xs font-medium hover:underline" style={{ color: '#1B3A7D' }}>View All</button>
                </div>
                <div className="space-y-6 relative">
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                  {dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="relative flex gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center z-10 shrink-0 ${
                        index === 0 ? 'bg-emerald-100' :
                        index === 1 ? 'bg-blue-100' :
                        index === 2 ? 'bg-red-100' :
                        'bg-purple-100'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          index === 0 ? 'text-emerald-600' :
                          index === 1 ? 'text-blue-600' :
                          index === 2 ? 'text-[#C7181F]' :
                          'text-purple-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                          {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
                          {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />}
                          {index === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />}
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

              {/* Leaderboard / Latest News */}
              <div className="rounded-2xl p-6" style={glassStyle}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold" style={{ color: '#0F2045' }}>Top Performers</h3>
                  <button className="text-xs font-medium hover:underline" style={{ color: '#1B3A7D' }}>This Month</button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/40 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center font-bold" style={{ color: '#C7181F' }}>1</div>
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#0F2045' }}>Top Rep</p>
                        <p className="text-[10px] text-gray-400">Diamond</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#1B3A7D' }}>$18.5k</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/40 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center font-bold text-gray-500">2</div>
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#0F2045' }}>Second Place</p>
                        <p className="text-[10px] text-gray-400">Platinum</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#1B3A7D' }}>$14.2k</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/40 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center font-bold text-gray-500">3</div>
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#0F2045' }}>Third Place</p>
                        <p className="text-[10px] text-gray-400">Gold</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#1B3A7D' }}>$11.8k</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </DashboardClient>
  );
}
