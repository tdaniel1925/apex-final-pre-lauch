'use client';

// =============================================
// Reports V2 - Template-styled Reports Dashboard
// Matches SmartViz design system 100%
// =============================================

import Link from 'next/link';
import { useState } from 'react';

export default function ReportsV2() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  const reports = [
    {
      id: 1,
      title: 'Monthly Commission Report',
      category: 'financial',
      date: '2023-10-31',
      status: 'completed',
      downloads: 24,
      icon: 'dollar'
    },
    {
      id: 2,
      title: 'Team Performance Summary',
      category: 'sales',
      date: '2023-10-28',
      status: 'completed',
      downloads: 18,
      icon: 'team'
    },
    {
      id: 3,
      title: 'Network Growth Analytics',
      category: 'operations',
      date: '2023-10-25',
      status: 'scheduled',
      downloads: 12,
      icon: 'chart'
    },
    {
      id: 4,
      title: 'Licensing Status Report',
      category: 'hr',
      date: '2023-10-20',
      status: 'completed',
      downloads: 31,
      icon: 'badge'
    },
    {
      id: 5,
      title: 'Quarterly Revenue Breakdown',
      category: 'financial',
      date: '2023-10-15',
      status: 'completed',
      downloads: 45,
      icon: 'dollar'
    },
    {
      id: 6,
      title: 'Distributor Activity Log',
      category: 'operations',
      date: '2023-10-10',
      status: 'scheduled',
      downloads: 8,
      icon: 'activity'
    },
  ];

  const filteredReports = activeFilter === 'all'
    ? reports
    : reports.filter(r => r.category === activeFilter || r.status === activeFilter);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-neutral-50">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-white border-r border-neutral-200 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3 border-b border-neutral-100">
          <div className="w-10 h-10 bg-neutral-900 rounded-small flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-heading font-bold text-xl text-neutral-900">Apex Affinity</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Main</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/dashboard-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span className="font-medium">Dashboard V2</span>
              <span className="ml-auto bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
            </Link>
          </div>

          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Management</p>
            <Link href="/profile-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile V2</span>
            </Link>
            <Link href="/reports-v2" className="flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-small shadow-custom transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Reports V2</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-primary-500 rounded-large p-5 text-white relative overflow-hidden shadow-custom">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-20 rounded-full"></div>
            <div className="relative z-10">
              <h4 className="font-heading font-bold text-lg mb-1">Advanced Reports</h4>
              <p className="text-primary-50 text-sm mb-3 opacity-90">Unlock detailed analytics</p>
              <button className="w-full bg-white text-primary-600 font-bold py-2 rounded-small text-sm hover:bg-primary-50 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
              JD
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">John Distributor</p>
              <p className="text-xs text-neutral-500">john@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-heading text-2xl font-bold text-neutral-900">Reports</h1>
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                {reports.length} Reports
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="px-4 py-2 bg-neutral-900 text-white rounded-small text-sm font-semibold hover:bg-neutral-700 transition-colors shadow-custom">
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-6 flex gap-1 border-t border-neutral-100 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                activeFilter === 'all'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setActiveFilter('financial')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                activeFilter === 'financial'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Financial
            </button>
            <button
              onClick={() => setActiveFilter('sales')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                activeFilter === 'sales'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setActiveFilter('operations')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                activeFilter === 'operations'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Operations
            </button>
            <button
              onClick={() => setActiveFilter('scheduled')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                activeFilter === 'scheduled'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Scheduled
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Summary KPI Cards */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm text-neutral-500">Total Reports</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">{reports.length}</p>
              <p className="text-xs text-neutral-400 mt-1">+3 this month</p>
            </div>

            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-secondary-50 text-secondary-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-neutral-500">Scheduled</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">
                {reports.filter(r => r.status === 'scheduled').length}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Auto-generated</p>
            </div>

            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <span className="text-sm text-neutral-500">Exports</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">142</p>
              <p className="text-xs text-neutral-400 mt-1">This quarter</p>
            </div>

            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <span className="text-sm text-neutral-500">Shared</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">9</p>
              <p className="text-xs text-neutral-400 mt-1">With team</p>
            </div>
          </section>

          {/* Date Range Filter */}
          <section className="bg-white rounded-large shadow-custom p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-neutral-700">Date Range:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['7d', '30d', '90d', 'ytd'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                      dateRange === range
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'YTD'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Reports List */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-large border border-neutral-200 p-5 shadow-custom hover:shadow-custom-hover transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-neutral-900 mb-1">{report.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-neutral-500">{report.date}</span>
                      <span className="text-neutral-300">•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        report.status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-xs text-neutral-500 capitalize">{report.category}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-large bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{report.downloads} downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-neutral-50 rounded-small transition-colors">
                      <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-neutral-50 rounded-small transition-colors">
                      <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-neutral-50 rounded-small transition-colors">
                      <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Empty State for Filtered Results */}
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-neutral-900 mb-1">No Reports Found</h3>
              <p className="text-sm text-neutral-500">Try changing your filters or date range</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
