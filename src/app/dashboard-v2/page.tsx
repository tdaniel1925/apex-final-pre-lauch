// =============================================
// Dashboard V2 - Exact Template Match
// Matches SmartViz design system 100%
// =============================================

import Link from 'next/link';
import '../template-v2.css';

export const metadata = {
  title: 'Dashboard V2 - Analytics Overview',
  description: 'Template-styled dashboard preview',
};

export default function DashboardV2() {
  return (
    <div className="min-h-screen bg-white">
      {/* TOP NAVIGATION */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 logo-mark rounded-small flex items-center justify-center text-white">
              <i className="ri-bar-chart-box-fill text-lg"></i>
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
              <i className="ri-arrow-right-line text-xs"></i>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO INTRO SECTION */}
      <section className="bg-white py-20 max-h-[480px] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="badge-pill inline-flex items-center gap-2 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary-500 live-dot"></span>
              <span className="text-xs font-semibold text-primary-700">Live dashboard — powered by your network data</span>
            </div>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-neutral-900 leading-tight mb-5" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>
            Your Network, Beautifully<br />
            <span className="text-primary-500">Visualized in Real Time</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            See exactly how this template transforms your distributor network data into an interactive, insight-rich dashboard — KPIs, charts, and tables all auto-generated.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full">
              <i className="ri-team-line text-primary-600 text-sm"></i>
              <span className="text-sm font-semibold text-neutral-700">1,248 Distributors</span>
              <span className="text-neutral-300">·</span>
              <span className="text-xs text-neutral-500">Active network</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary-500 live-dot"></span>
              <span className="text-sm font-semibold text-primary-700">Auto-refreshed 2 min ago</span>
            </div>
          </div>
        </div>
      </section>

      {/* FULL DASHBOARD SCREENSHOT SECTION */}
      <section className="section-dark-gradient py-16 max-h-[1100px] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Label */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-heading text-3xl font-extrabold text-white mb-2" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>
                Network Dashboard Overview
              </h2>
              <p className="text-neutral-400 text-base">Full interactive view — auto-generated from your distributor data</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button className="tab-btn active px-4 py-2 rounded-small text-sm font-semibold transition-all">Overview</button>
              <button className="tab-btn px-4 py-2 rounded-small text-sm font-semibold transition-all">Performance</button>
              <button className="tab-btn px-4 py-2 rounded-small text-sm font-semibold transition-all">Growth</button>
              <button className="tab-btn px-4 py-2 rounded-small text-sm font-semibold transition-all">Licensing</button>
            </div>
          </div>

          {/* Dashboard Frame */}
          <div className="dashboard-frame rounded-large overflow-hidden glow-green">
            {/* Browser Chrome */}
            <div className="bg-neutral-100 border-b border-neutral-200 px-5 py-3 flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white rounded-small px-4 py-1.5 flex items-center gap-2 border border-neutral-200 max-w-sm mx-auto">
                <i className="ri-lock-line text-neutral-400 text-xs"></i>
                <span className="text-xs text-neutral-500">app.apexaffinity.io/dashboard</span>
                <span className="ml-auto flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 live-dot"></span>
                  <span className="text-primary-600 font-semibold" style={{fontSize: '9px'}}>LIVE</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-neutral-900 text-white rounded text-xs font-semibold flex items-center gap-1">
                  <i className="ri-share-line text-xs"></i>Share
                </button>
                <button className="px-3 py-1 bg-white border border-neutral-200 text-neutral-600 rounded text-xs font-semibold flex items-center gap-1">
                  <i className="ri-download-line text-xs"></i>Export
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="bg-background-50 p-5">
              {/* Dashboard Header Row */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading font-extrabold text-neutral-900 text-xl" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>
                    Network Overview
                  </h3>
                  <p className="text-neutral-500 text-xs mt-0.5">Q4 2023 · Real-time distributor metrics</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-small">
                    <i className="ri-calendar-line text-neutral-400 text-xs"></i>
                    <span className="text-xs font-semibold text-neutral-700">Oct – Dec 2023</span>
                    <i className="ri-arrow-down-s-line text-neutral-400 text-xs"></i>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-small">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 live-dot"></span>
                    <span className="text-xs font-semibold text-primary-700">Live Sync</span>
                  </div>
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {/* Total Revenue KPI */}
                <div className="kpi-card bg-white rounded-large border border-neutral-200 p-4 shadow-custom">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-large bg-primary-50 flex items-center justify-center">
                      <i className="ri-money-dollar-circle-line text-primary-600"></i>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <i className="ri-arrow-up-line text-xs"></i>+15.2%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Total Revenue</p>
                  <p className="font-heading font-extrabold text-2xl text-neutral-900">$2.4M</p>
                  <div className="mt-2 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full metric-bar" style={{width: '76%'}}></div>
                  </div>
                  <p className="text-neutral-400 mt-1" style={{fontSize: '10px'}}>76% of annual target</p>
                </div>

                {/* Total Distributors KPI */}
                <div className="kpi-card bg-white rounded-large border border-neutral-200 p-4 shadow-custom">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-large bg-blue-50 flex items-center justify-center">
                      <i className="ri-team-line text-blue-600"></i>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <i className="ri-arrow-up-line text-xs"></i>+12
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Total Distributors</p>
                  <p className="font-heading font-extrabold text-2xl text-neutral-900">1,248</p>
                  <div className="mt-2 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full metric-bar" style={{width: '62%'}}></div>
                  </div>
                  <p className="text-neutral-400 mt-1" style={{fontSize: '10px'}}>Across 7 matrix levels</p>
                </div>

                {/* Licensed Agents KPI */}
                <div className="kpi-card bg-white rounded-large border border-neutral-200 p-4 shadow-custom">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-large bg-secondary-50 flex items-center justify-center">
                      <i className="ri-award-line text-secondary-600"></i>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      <i className="ri-arrow-down-line text-xs"></i>-3.1%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Licensed Agents</p>
                  <p className="font-heading font-extrabold text-2xl text-neutral-900">342</p>
                  <div className="mt-2 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-400 rounded-full metric-bar" style={{width: '27%'}}></div>
                  </div>
                  <p className="text-neutral-400 mt-1" style={{fontSize: '10px'}}>27% of total network</p>
                </div>

                {/* Avg Performance KPI */}
                <div className="kpi-card bg-white rounded-large border border-neutral-200 p-4 shadow-custom">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-large bg-purple-50 flex items-center justify-center">
                      <i className="ri-star-line text-purple-600"></i>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <i className="ri-arrow-up-line text-xs"></i>+4.2%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Avg. Performance</p>
                  <p className="font-heading font-extrabold text-2xl text-neutral-900">84.6%</p>
                  <div className="mt-2 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full metric-bar" style={{width: '85%'}}></div>
                  </div>
                  <p className="text-neutral-400 mt-1" style={{fontSize: '10px'}}>Team performance score</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-large border border-neutral-200 p-5 shadow-custom">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-heading font-bold text-neutral-900 text-sm">Monthly Revenue Trend</h4>
                      <p className="text-neutral-400 text-xs mt-0.5">Jan – Dec 2023 · Commission data</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                        <span className="text-xs text-neutral-500">Revenue</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary-400"></span>
                        <span className="text-xs text-neutral-500">Expenses</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-48 w-full overflow-hidden">
                    {/* Chart Placeholder - would use Chart.js in production */}
                    <svg className="w-full h-full" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="revGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{stopColor: '#10b981', stopOpacity: 0.18}} />
                          <stop offset="100%" style={{stopColor: '#10b981', stopOpacity: 0}} />
                        </linearGradient>
                      </defs>
                      <path d="M 0 180 L 70 160 L 140 165 L 210 145 L 280 140 L 350 130 L 420 120 L 490 125 L 560 105 L 630 90 L 700 75 L 770 60 L 800 50"
                            stroke="#10b981" strokeWidth="3" fill="none" />
                      <path d="M 0 200 L 0 180 L 70 160 L 140 165 L 210 145 L 280 140 L 350 130 L 420 120 L 490 125 L 560 105 L 630 90 L 700 75 L 770 60 L 800 50 L 800 200 Z"
                            fill="url(#revGrad)" />
                    </svg>
                  </div>
                </div>

                {/* Department Donut */}
                <div className="bg-white rounded-large border border-neutral-200 p-5 shadow-custom">
                  <div className="mb-4">
                    <h4 className="font-heading font-bold text-neutral-900 text-sm">Network by Level</h4>
                    <p className="text-neutral-400 text-xs mt-0.5">Q4 2023 · Matrix depth</p>
                  </div>
                  <div className="h-36 w-full overflow-hidden flex items-center justify-center">
                    {/* Donut Chart Placeholder */}
                    <svg width="144" height="144" viewBox="0 0 144 144">
                      <circle cx="72" cy="72" r="60" fill="none" stroke="#10b981" strokeWidth="24"
                              strokeDasharray="150 400" transform="rotate(-90 72 72)"/>
                      <circle cx="72" cy="72" r="60" fill="none" stroke="#fb923c" strokeWidth="24"
                              strokeDasharray="90 400" strokeDashoffset="-150" transform="rotate(-90 72 72)"/>
                      <circle cx="72" cy="72" r="60" fill="none" stroke="#60a5fa" strokeWidth="24"
                              strokeDasharray="75 400" strokeDashoffset="-240" transform="rotate(-90 72 72)"/>
                      <circle cx="72" cy="72" r="60" fill="none" stroke="#c084fc" strokeWidth="24"
                              strokeDasharray="60 400" strokeDashoffset="-315" transform="rotate(-90 72 72)"/>
                    </svg>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                        <span className="text-xs text-neutral-600">Level 1-2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">420</span>
                        <span className="text-xs text-neutral-400">34%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary-400"></span>
                        <span className="text-xs text-neutral-600">Level 3-4</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">380</span>
                        <span className="text-xs text-neutral-400">30%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span className="text-xs text-neutral-600">Level 5-6</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">310</span>
                        <span className="text-xs text-neutral-400">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        <span className="text-xs text-neutral-600">Level 7+</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">138</span>
                        <span className="text-xs text-neutral-400">11%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table Section */}
              <div className="bg-white rounded-large border border-neutral-200 shadow-custom overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                  <div>
                    <h4 className="font-heading font-bold text-neutral-900 text-sm">Top Distributors</h4>
                    <p className="text-neutral-400 text-xs mt-0.5">Last 30 days · Sorted by performance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs"></i>
                      <input type="text" placeholder="Search distributors..." className="pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-small text-xs text-neutral-700 w-40 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-small text-xs font-semibold hover:bg-neutral-200 transition-colors">
                      <i className="ri-filter-line text-xs"></i>Filter
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-small text-xs font-semibold hover:bg-neutral-700 transition-colors">
                      <i className="ri-download-line text-xs"></i>Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                      <tr>
                        <th className="px-5 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Distributor</th>
                        <th className="px-5 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Level</th>
                        <th className="px-5 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Commission</th>
                        <th className="px-5 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Performance</th>
                        <th className="px-5 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Join Date</th>
                        <th className="px-5 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      <tr className="table-row transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs">
                              SW
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">Sarah Wilson</p>
                              <p className="text-xs text-neutral-400">REP-0042</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold">Level 2</span>
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-neutral-800">$8,240</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-500 rounded-full" style={{width: '96%'}}></div>
                            </div>
                            <span className="text-xs font-bold text-primary-600">96%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500">Mar 15, 2022</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">Active</span>
                        </td>
                      </tr>
                      <tr className="table-row transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                              JC
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">James Carter</p>
                              <p className="text-xs text-neutral-400">REP-0018</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-1 bg-secondary-50 text-secondary-700 rounded-full text-xs font-bold">Level 3</span>
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-neutral-800">$7,650</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-secondary-400 rounded-full" style={{width: '89%'}}></div>
                            </div>
                            <span className="text-xs font-bold text-secondary-600">89%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500">Jul 22, 2021</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">Active</span>
                        </td>
                      </tr>
                      <tr className="table-row transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                              MP
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">Maya Patel</p>
                              <p className="text-xs text-neutral-400">REP-0067</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">Level 4</span>
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-neutral-800">$6,920</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{width: '82%'}}></div>
                            </div>
                            <span className="text-xs font-bold text-blue-600">82%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500">Jan 10, 2022</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">Active</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50">
                  <p className="text-xs text-neutral-500">Showing 3 of 1,248 distributors · Sorted by performance desc.</p>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-neutral-200 rounded-small text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">Previous</button>
                    <button className="px-3 py-1.5 bg-neutral-900 text-white rounded-small text-xs font-semibold hover:bg-neutral-700 transition-colors">Next</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div className="floating-badge bg-white rounded-large shadow-custom-hover border border-neutral-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <i className="ri-magic-line text-primary-600 text-sm"></i>
              </div>
              <div>
                <p className="font-heading font-bold text-neutral-900 text-xs">Auto-generated</p>
                <p className="text-neutral-400" style={{fontSize: '10px'}}>No manual setup needed</p>
              </div>
            </div>
            <div className="floating-badge bg-white rounded-large shadow-custom-hover border border-neutral-200 px-4 py-3 flex items-center gap-3" style={{animationDelay: '0.5s'}}>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="ri-refresh-line text-blue-600 text-sm"></i>
              </div>
              <div>
                <p className="font-heading font-bold text-neutral-900 text-xs">Live Sync</p>
                <p className="text-neutral-400" style={{fontSize: '10px'}}>Updates in real time</p>
              </div>
            </div>
            <div className="floating-badge bg-white rounded-large shadow-custom-hover border border-neutral-200 px-4 py-3 flex items-center gap-3" style={{animationDelay: '1s'}}>
              <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center">
                <i className="ri-share-line text-secondary-600 text-sm"></i>
              </div>
              <div>
                <p className="font-heading font-bold text-neutral-900 text-xs">One-click Share</p>
                <p className="text-neutral-400" style={{fontSize: '10px'}}>Secure shareable link</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-neutral-900 py-16 max-h-[320px] overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 border border-primary-500/30 rounded-full mb-6">
            <i className="ri-rocket-line text-primary-400 text-sm"></i>
            <span className="text-xs font-semibold text-primary-300">Ready to see your real data like this?</span>
          </div>
          <h2 className="font-heading text-4xl font-extrabold text-white mb-4" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>
            This Could Be Your<br />Actual Dashboard
          </h2>
          <p className="text-neutral-400 text-lg mb-8">
            Click below to return to your real dashboard with your actual network data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary-500 text-white rounded-small text-base font-bold hover:bg-primary-600 transition-colors shadow-custom">
              <i className="ri-dashboard-line"></i>
              View Real Dashboard
            </Link>
            <Link href="/profile-v2" className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/10 text-white rounded-small text-base font-semibold border border-white/20 hover:bg-white/20 transition-colors">
              View Profile V2
              <i className="ri-arrow-right-line text-xs"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
