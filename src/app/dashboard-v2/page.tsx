// =============================================
// Dashboard V2 - Template-styled Analytics Dashboard
// Matches SmartViz design system 100%
// =============================================

import Link from 'next/link';

export const metadata = {
  title: 'Dashboard V2 - Analytics Overview',
  description: 'Template-styled dashboard preview',
};

export default function DashboardV2() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* TOP NAVIGATION */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-small flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <Link href="/dashboard" className="font-heading font-bold text-xl text-neutral-900 tracking-tight">
              Apex Affinity
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <Link href="/dashboard-v2" className="text-sm font-semibold text-neutral-900 border-b-2 border-primary-500 pb-0.5">
              Dashboard V2
            </Link>
            <Link href="/profile-v2" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              Profile V2
            </Link>
            <Link href="/reports-v2" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              Reports V2
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-small text-sm font-semibold hover:bg-neutral-700 transition-colors shadow-custom">
              Back to Dashboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span className="text-xs font-semibold text-primary-700">Live Dashboard</span>
            </div>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-neutral-900 leading-tight mb-5 tracking-heading">
            Your Network,<br />
            <span className="text-primary-500">Beautifully Visualized</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            See your distributor network metrics, team performance, and commissions in real-time with this template-styled dashboard.
          </p>
        </div>
      </section>

      {/* MAIN DASHBOARD */}
      <section className="bg-gradient-to-b from-neutral-900 to-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl font-extrabold text-white mb-2 tracking-heading">
                Network Overview
              </h2>
              <p className="text-neutral-400 text-base">Real-time metrics from your distributor network</p>
            </div>
          </div>

          {/* Dashboard Frame */}
          <div className="bg-neutral-50 rounded-large overflow-hidden shadow-custom-hover">
            <div className="p-6">
              {/* Dashboard Header Row */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-heading font-extrabold text-neutral-900 text-xl tracking-heading">
                    Q4 2023 Performance
                  </h3>
                  <p className="text-neutral-500 text-xs mt-0.5">Updated 2 minutes ago</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-small">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-neutral-700">Oct – Dec 2023</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-small">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-primary-700">Live Sync</span>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Distributors */}
                <div className="bg-white rounded-large border border-neutral-200 p-5 shadow-custom hover:shadow-custom-hover transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-large bg-primary-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +24
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Total Distributors</p>
                  <p className="font-heading font-extrabold text-2xl text-neutral-900">1,248</p>
                  <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all duration-700" style={{ width: '76%' }}></div>
                  </div>
                  <p className="text-neutral-400 mt-1 text-[10px]">76% of growth target</p>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-large border border-neutral-200 p-5 shadow-custom hover:shadow-custom-hover transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-large bg-blue-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +15.2%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Monthly Revenue</p>
                  <p className="font-heading font-extrabold text-2xl text-neutral-900">$2.4M</p>
                  <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: '82%' }}></div>
                  </div>
                  <p className="text-neutral-400 mt-1 text-[10px]">82% of monthly target</p>
                </div>

                {/* Active Licenses */}
                <div className="bg-white rounded-large border border-neutral-200 p-5 shadow-custom hover:shadow-custom-hover transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-large bg-secondary-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +8
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Licensed Agents</p>
                  <p className="font-heading font-extrabold text-2xl text-neutral-900">342</p>
                  <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-400 rounded-full transition-all duration-700" style={{ width: '68%' }}></div>
                  </div>
                  <p className="text-neutral-400 mt-1 text-[10px]">27% of total network</p>
                </div>

                {/* Avg Performance */}
                <div className="bg-white rounded-large border border-neutral-200 p-5 shadow-custom hover:shadow-custom-hover transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-large bg-purple-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +4.2%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Avg. Performance</p>
                  <p className="font-heading font-extrabold text-2xl text-neutral-900">84.6%</p>
                  <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-neutral-400 mt-1 text-[10px]">Team performance score</p>
                </div>
              </div>

              {/* Placeholder for Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-large border border-neutral-200 p-6 shadow-custom">
                  <h4 className="font-heading font-bold text-neutral-900 text-sm mb-4">Monthly Growth Trend</h4>
                  <div className="h-48 flex items-center justify-center bg-neutral-50 rounded-large border border-neutral-200">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-neutral-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                      <p className="text-xs text-neutral-400">Chart placeholder</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-large border border-neutral-200 p-6 shadow-custom">
                  <h4 className="font-heading font-bold text-neutral-900 text-sm mb-4">Network Distribution</h4>
                  <div className="h-48 flex items-center justify-center bg-neutral-50 rounded-large border border-neutral-200">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-neutral-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                      <p className="text-xs text-neutral-400">Chart placeholder</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-large p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-lg mb-1">Ready to see your actual data?</h4>
                    <p className="text-primary-50 text-sm">This is a preview of the new dashboard design.</p>
                  </div>
                  <Link href="/dashboard" className="px-6 py-3 bg-white text-primary-600 rounded-small font-bold text-sm hover:bg-primary-50 transition-colors shadow-lg">
                    View Real Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
