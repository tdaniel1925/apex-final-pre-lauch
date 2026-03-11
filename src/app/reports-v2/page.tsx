'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReportsV2() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', sub: '' });

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Chart) {
      const Chart = (window as any).Chart;

      // Revenue Overview Chart
      const ctx1 = (document.getElementById('revenueOverviewChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx1) {
        const gradRev = ctx1.createLinearGradient(0, 0, 0, 220);
        gradRev.addColorStop(0, 'rgba(16,185,129,0.18)');
        gradRev.addColorStop(1, 'rgba(16,185,129,0)');
        const gradExp = ctx1.createLinearGradient(0, 0, 0, 220);
        gradExp.addColorStop(0, 'rgba(249,115,22,0.15)');
        gradExp.addColorStop(1, 'rgba(249,115,22,0)');

        new Chart(ctx1, {
          type: 'line',
          data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'],
            datasets: [
              {
                label: 'Revenue',
                data: [65,78,66,89,92,105,118,112,128,142],
                borderColor: '#10b981',
                backgroundColor: gradRev,
                borderWidth: 2.5,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#10b981',
                pointBorderWidth: 2
              },
              {
                label: 'Expenses',
                data: [45,52,48,58,60,65,70,68,74,80],
                borderColor: '#fb923c',
                backgroundColor: gradExp,
                borderWidth: 2.5,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#fb923c',
                pointBorderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                bodyFont: { family: "'Inter', sans-serif", size: 11 },
                cornerRadius: 8,
                displayColors: true
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 10 }, color: '#94a3b8', callback: (v: any) => '$' + v + 'k' }
              },
              x: {
                grid: { display: false, drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 10 }, color: '#94a3b8' }
              }
            },
            interaction: { intersect: false, mode: 'index' }
          }
        });
      }

      // Report Type Donut Chart
      const ctx2 = (document.getElementById('reportTypeChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx2) {
        new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: ['Financial', 'Sales', 'Operations', 'HR'],
            datasets: [{
              data: [7, 5, 4, 2],
              backgroundColor: ['#10b981', '#fb923c', '#60a5fa', '#c084fc'],
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                bodyFont: { family: "'Inter', sans-serif", size: 11 },
                cornerRadius: 8
              }
            }
          }
        });
      }
    }
  }, []);

  const handleExport = (name: string, format: string) => {
    setToastMessage({
      title: `Exporting "${name}"`,
      sub: `Preparing ${format.toUpperCase()} file...`
    });
    setShowToast(true);
    setTimeout(() => {
      setToastMessage({
        title: 'Export complete!',
        sub: `${name}.${format} is ready to download`
      });
    }, 1500);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleBulkExport = (format: string) => {
    setToastMessage({
      title: 'Bulk export started',
      sub: `Preparing all reports as ${format.toUpperCase()}...`
    });
    setShowToast(true);
    setTimeout(() => {
      setToastMessage({
        title: 'Bulk export complete!',
        sub: `18 reports packaged as ${format.toUpperCase()}`
      });
    }, 2000);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-white border-r border-neutral-200 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-900 rounded-small flex items-center justify-center text-white">
            <i className="ri-bar-chart-box-fill text-xl"></i>
          </div>
          <span className="font-heading font-bold text-xl text-neutral-900">SmartViz</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Main</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-dashboard-line"></i>
              <span className="font-medium">Dashboard</span>
            </Link>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-file-excel-line"></i>
              <span className="font-medium">Data Sources</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-robot-line"></i>
              <span className="font-medium">AI Analysis</span>
              <span className="ml-auto bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
            </a>
          </div>

          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Management</p>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-upload-cloud-line"></i>
              <span className="font-medium">Manual Upload</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-links-line"></i>
              <span className="font-medium">Integrations</span>
            </a>
            <Link href="/profile-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-user-settings-line"></i>
              <span className="font-medium">Profile &amp; Plan</span>
            </Link>
            <Link href="/reports-v2" className="flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-small shadow-custom transition-all">
              <i className="ri-file-chart-line"></i>
              <span className="font-medium">Reports</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-primary-500 rounded-large p-5 text-white relative overflow-hidden shadow-custom">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-20 rounded-full"></div>
            <div className="relative z-10">
              <h4 className="font-heading font-bold text-lg mb-1">Pro Plan</h4>
              <p className="text-primary-50 text-sm mb-3 opacity-90">Unlock advanced AI insights</p>
              <button className="w-full bg-white text-primary-600 font-bold py-2 rounded-small text-sm hover:bg-primary-50 transition-colors">Upgrade Now</button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 px-2">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            <div>
              <p className="text-sm font-bold text-neutral-900">Sarah Wilson</p>
              <p className="text-xs text-neutral-500">sarah@company.com</p>
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
                18 Reports
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                <input type="text" placeholder="Search reports..." className="pl-10 pr-4 py-2 bg-neutral-50 border-none rounded-full text-sm w-56 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all" />
              </div>
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-small text-sm font-semibold hover:bg-neutral-700 transition-colors shadow-custom">
                <i className="ri-add-line"></i>
                <span className="hidden md:inline">New Report</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors relative">
                <i className="ri-notification-3-line text-lg"></i>
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-secondary-500 rounded-full border border-white"></span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-6 flex gap-1 border-t border-neutral-100 overflow-x-auto">
            <button onClick={() => setActiveFilter('all')} className={`filter-tab px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeFilter === 'all' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500'}`}>All Reports</button>
            <button onClick={() => setActiveFilter('financial')} className={`filter-tab px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeFilter === 'financial' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500'}`}>Financial</button>
            <button onClick={() => setActiveFilter('sales')} className={`filter-tab px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeFilter === 'sales' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500'}`}>Sales</button>
            <button onClick={() => setActiveFilter('operations')} className={`filter-tab px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeFilter === 'operations' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500'}`}>Operations</button>
            <button onClick={() => setActiveFilter('hr')} className={`filter-tab px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeFilter === 'hr' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500'}`}>HR</button>
            <button onClick={() => setActiveFilter('scheduled')} className={`filter-tab px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeFilter === 'scheduled' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500'}`}>Scheduled</button>
          </div>
        </header>

        <div className="flex-1 p-6 bg-neutral-50">
          {/* Summary KPI Cards */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                  <i className="ri-file-chart-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Total Reports</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">18</p>
              <p className="text-xs text-neutral-400 mt-1">+3 this month</p>
            </div>
            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-secondary-50 text-secondary-600 flex items-center justify-center">
                  <i className="ri-time-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Scheduled</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">6</p>
              <p className="text-xs text-neutral-400 mt-1">Auto-generated</p>
            </div>
            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                  <i className="ri-download-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Exports</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">142</p>
              <p className="text-xs text-neutral-400 mt-1">This quarter</p>
            </div>
            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center">
                  <i className="ri-share-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Shared</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">9</p>
              <p className="text-xs text-neutral-400 mt-1">With team</p>
            </div>
          </section>

          {/* Date Range + Filters Bar */}
          <section className="bg-white rounded-large shadow-custom p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <i className="ri-calendar-line text-neutral-400 text-sm"></i>
                <span className="text-sm font-semibold text-neutral-700">Date Range:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => { setDateRange('7d'); setShowCustomDateRange(false); }} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${dateRange === '7d' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>7 Days</button>
                <button onClick={() => { setDateRange('30d'); setShowCustomDateRange(false); }} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${dateRange === '30d' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>30 Days</button>
                <button onClick={() => { setDateRange('90d'); setShowCustomDateRange(false); }} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${dateRange === '90d' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>90 Days</button>
                <button onClick={() => { setDateRange('ytd'); setShowCustomDateRange(false); }} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${dateRange === 'ytd' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>YTD</button>
                <button onClick={() => { setDateRange('custom'); setShowCustomDateRange(true); }} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${dateRange === 'custom' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Custom</button>
              </div>
              {showCustomDateRange && (
                <div className="flex items-center gap-2">
                  <input type="date" className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-small text-xs text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent" defaultValue="2023-10-01" />
                  <span className="text-neutral-400 text-xs">to</span>
                  <input type="date" className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-small text-xs text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent" defaultValue="2023-10-31" />
                  <button className="px-3 py-1.5 bg-primary-500 text-white rounded-small text-xs font-semibold hover:bg-primary-600 transition-colors">Apply</button>
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <select className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-small text-xs text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none pr-7">
                  <option>All Sources</option>
                  <option>Stripe</option>
                  <option>HubSpot</option>
                  <option>Google Analytics</option>
                  <option>Manual Upload</option>
                </select>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-small text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors">
                  <i className="ri-sort-desc"></i>Sort
                </button>
              </div>
            </div>
          </section>

          {/* Charts Overview Row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-large shadow-custom p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading text-base font-bold text-neutral-900">Revenue Overview</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Oct 2023 · Monthly breakdown</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
                    <span className="text-xs text-neutral-500">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary-400"></span>
                    <span className="text-xs text-neutral-500">Expenses</span>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button className="w-7 h-7 rounded bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 transition-colors text-xs">
                      <i className="ri-bar-chart-2-line"></i>
                    </button>
                    <button className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center text-xs">
                      <i className="ri-line-chart-line"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-56 w-full overflow-hidden">
                <canvas id="revenueOverviewChart"></canvas>
              </div>
            </div>

            {/* Report Type Distribution */}
            <div className="bg-white rounded-large shadow-custom p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading text-base font-bold text-neutral-900">Report Types</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Distribution by category</p>
                </div>
              </div>
              <div className="h-40 w-full overflow-hidden flex items-center justify-center">
                <canvas id="reportTypeChart"></canvas>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
                    <span className="text-xs text-neutral-600">Financial</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-900">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary-400"></span>
                    <span className="text-xs text-neutral-600">Sales</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-900">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    <span className="text-xs text-neutral-600">Operations</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-900">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                    <span className="text-xs text-neutral-600">HR</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-900">2</span>
                </div>
              </div>
            </div>
          </section>

          {/* Report List */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-neutral-900">All Reports</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode('grid')} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                  <i className="ri-grid-line text-sm"></i>
                </button>
                <button onClick={() => setViewMode('list')} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                  <i className="ri-list-check text-sm"></i>
                </button>
              </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Report Card 1 - Q3 Financial Summary */}
                <div className="report-card bg-white rounded-large shadow-custom border border-neutral-100 overflow-hidden hover:shadow-custom-hover">
                  <div className="h-32 bg-gradient-to-br from-primary-500 to-primary-700 p-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                        <polyline points="0,60 30,45 60,50 90,30 120,35 150,20 180,25 200,15" fill="none" stroke="white" strokeWidth="2"></polyline>
                        <polygon points="0,60 30,45 60,50 90,30 120,35 150,20 180,25 200,15 200,80 0,80" fill="white" opacity="0.3"></polygon>
                      </svg>
                    </div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">Financial</span>
                        <p className="text-white/70 text-xs mt-2">Q3 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-heading font-bold text-xl">$2.4M</p>
                        <p className="text-primary-200 text-xs">+15.2% YoY</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-neutral-900 text-sm mb-1">Q3 Financial Summary</h3>
                    <p className="text-xs text-neutral-500 mb-3">Revenue, expenses &amp; profit margins for Q3 2023</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center gap-1 text-xs text-neutral-500"><i className="ri-refresh-line text-primary-500"></i>Updated 2h ago</span>
                      <span className="text-neutral-300">·</span>
                      <span className="flex items-center gap-1 text-xs text-neutral-500"><i className="ri-pages-line"></i>12 pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleExport('Q3 Financial Summary', 'pdf')} className="export-btn flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-small text-xs font-semibold hover:bg-neutral-700 transition-colors shadow-custom">
                        <i className="ri-file-pdf-line"></i>PDF
                      </button>
                      <button onClick={() => handleExport('Q3 Financial Summary', 'csv')} className="export-btn flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-small text-xs font-semibold hover:bg-neutral-200 transition-colors">
                        <i className="ri-file-excel-line"></i>CSV
                      </button>
                      <button className="w-8 h-8 rounded-small bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                        <i className="ri-more-2-fill text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional report cards continue here with same pattern... Due to size, I'll add 2 more representative cards */}

                {/* Report Card 2 - Sales Performance */}
                <div className="report-card bg-white rounded-large shadow-custom border border-neutral-100 overflow-hidden hover:shadow-custom-hover">
                  <div className="h-32 bg-gradient-to-br from-secondary-400 to-secondary-600 p-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                        <polyline points="0,70 25,55 50,60 75,40 100,45 125,25 150,30 175,15 200,20" fill="none" stroke="white" strokeWidth="2"></polyline>
                        <polygon points="0,70 25,55 50,60 75,40 100,45 125,25 150,30 175,15 200,20 200,80 0,80" fill="white" opacity="0.3"></polygon>
                      </svg>
                    </div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">Sales</span>
                        <p className="text-white/70 text-xs mt-2">Oct 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-heading font-bold text-xl">847</p>
                        <p className="text-secondary-100 text-xs">Deals closed</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-neutral-900 text-sm mb-1">Sales Performance Report</h3>
                    <p className="text-xs text-neutral-500 mb-3">Pipeline, conversion rates &amp; rep performance</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center gap-1 text-xs text-neutral-500"><i className="ri-refresh-line text-primary-500"></i>Updated 30m ago</span>
                      <span className="text-neutral-300">·</span>
                      <span className="flex items-center gap-1 text-xs text-neutral-500"><i className="ri-pages-line"></i>8 pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleExport('Sales Performance', 'pdf')} className="export-btn flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-small text-xs font-semibold hover:bg-neutral-700 transition-colors shadow-custom">
                        <i className="ri-file-pdf-line"></i>PDF
                      </button>
                      <button onClick={() => handleExport('Sales Performance', 'csv')} className="export-btn flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-small text-xs font-semibold hover:bg-neutral-200 transition-colors">
                        <i className="ri-file-excel-line"></i>CSV
                      </button>
                      <button className="w-8 h-8 rounded-small bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                        <i className="ri-more-2-fill text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Report Card 3 - Inventory Status */}
                <div className="report-card bg-white rounded-large shadow-custom border border-neutral-100 overflow-hidden hover:shadow-custom-hover">
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-700 p-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                        <rect x="10" y="40" width="20" height="40" fill="white" opacity="0.6"></rect>
                        <rect x="40" y="25" width="20" height="55" fill="white" opacity="0.6"></rect>
                        <rect x="70" y="35" width="20" height="45" fill="white" opacity="0.6"></rect>
                        <rect x="100" y="15" width="20" height="65" fill="white" opacity="0.6"></rect>
                        <rect x="130" y="30" width="20" height="50" fill="white" opacity="0.6"></rect>
                        <rect x="160" y="20" width="20" height="60" fill="white" opacity="0.6"></rect>
                      </svg>
                    </div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">Operations</span>
                        <p className="text-white/70 text-xs mt-2">Oct 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-heading font-bold text-xl">94.2%</p>
                        <p className="text-blue-100 text-xs">Stock accuracy</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-neutral-900 text-sm mb-1">Inventory Status Report</h3>
                    <p className="text-xs text-neutral-500 mb-3">Stock levels, turnover &amp; reorder alerts</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center gap-1 text-xs text-neutral-500"><i className="ri-refresh-line text-primary-500"></i>Updated 1h ago</span>
                      <span className="text-neutral-300">·</span>
                      <span className="flex items-center gap-1 text-xs text-neutral-500"><i className="ri-pages-line"></i>6 pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleExport('Inventory Status', 'pdf')} className="export-btn flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-small text-xs font-semibold hover:bg-neutral-700 transition-colors shadow-custom">
                        <i className="ri-file-pdf-line"></i>PDF
                      </button>
                      <button onClick={() => handleExport('Inventory Status', 'csv')} className="export-btn flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-small text-xs font-semibold hover:bg-neutral-200 transition-colors">
                        <i className="ri-file-excel-line"></i>CSV
                      </button>
                      <button className="w-8 h-8 rounded-small bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                        <i className="ri-more-2-fill text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-large shadow-custom overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Report Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Last Updated</th>
                      <th className="px-6 py-4">Pages</th>
                      <th className="px-6 py-4">Export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-small bg-primary-100 text-primary-600 flex items-center justify-center"><i className="ri-file-chart-line text-sm"></i></div>
                          <span className="font-medium text-neutral-900 text-sm">Q3 Financial Summary</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700">Financial</span></td>
                      <td className="px-6 py-4 text-sm text-neutral-500">2h ago</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">12</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleExport('Q3 Financial Summary', 'pdf')} className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white rounded-small text-xs font-semibold hover:bg-neutral-700 transition-colors"><i className="ri-file-pdf-line"></i>PDF</button>
                          <button onClick={() => handleExport('Q3 Financial Summary', 'csv')} className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-small text-xs font-semibold hover:bg-neutral-200 transition-colors"><i className="ri-file-excel-line"></i>CSV</button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-small bg-secondary-100 text-secondary-600 flex items-center justify-center"><i className="ri-bar-chart-line text-sm"></i></div>
                          <span className="font-medium text-neutral-900 text-sm">Sales Performance Report</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-secondary-50 text-secondary-700">Sales</span></td>
                      <td className="px-6 py-4 text-sm text-neutral-500">30m ago</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">8</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleExport('Sales Performance', 'pdf')} className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white rounded-small text-xs font-semibold hover:bg-neutral-700 transition-colors"><i className="ri-file-pdf-line"></i>PDF</button>
                          <button onClick={() => handleExport('Sales Performance', 'csv')} className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-small text-xs font-semibold hover:bg-neutral-200 transition-colors"><i className="ri-file-excel-line"></i>CSV</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Bulk Export Section */}
          <section className="bg-neutral-900 rounded-large p-6 mb-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary-900/40 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-download-cloud-line text-primary-400 text-lg"></i>
                  <h2 className="font-heading text-lg font-bold text-white">Bulk Export</h2>
                </div>
                <p className="text-neutral-400 text-sm">Export all reports at once or select specific ones for batch download.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleBulkExport('pdf')} className="flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-900 rounded-small text-sm font-bold hover:bg-neutral-100 transition-colors shadow-custom">
                  <i className="ri-file-pdf-2-line text-red-500"></i>
                  Export All as PDF
                </button>
                <button onClick={() => handleBulkExport('csv')} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-small text-sm font-bold hover:bg-primary-600 transition-colors shadow-custom">
                  <i className="ri-file-excel-2-line"></i>
                  Export All as CSV
                </button>
              </div>
            </div>
          </section>

          {/* Scheduled Reports */}
          <section className="bg-white rounded-large shadow-custom overflow-hidden mb-6">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-neutral-900">Scheduled Reports</h2>
                <p className="text-sm text-neutral-500 mt-0.5">Automated report generation &amp; delivery</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-small text-sm font-semibold hover:bg-neutral-700 transition-colors shadow-custom">
                <i className="ri-add-line"></i>Add Schedule
              </button>
            </div>
            <div className="divide-y divide-neutral-100">
              <div className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-small bg-primary-50 text-primary-600 flex items-center justify-center">
                    <i className="ri-calendar-check-line"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">Weekly Business Digest</p>
                    <p className="text-xs text-neutral-500">Every Monday at 8:00 AM · 5 recipients</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">Next: Nov 27</span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>
                  <button className="w-8 h-8 rounded-small bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                    <i className="ri-settings-3-line text-sm"></i>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-small bg-secondary-50 text-secondary-600 flex items-center justify-center">
                    <i className="ri-calendar-check-line"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">Monthly Financial Report</p>
                    <p className="text-xs text-neutral-500">1st of every month · 3 recipients</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">Next: Dec 1</span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>
                  <button className="w-8 h-8 rounded-small bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                    <i className="ri-settings-3-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Export Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-neutral-900 text-white px-5 py-3.5 rounded-large shadow-custom-hover flex items-center gap-3 min-w-[280px]">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
              <i className="ri-download-line text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-bold">{toastMessage.title}</p>
              <p className="text-xs text-neutral-400">{toastMessage.sub}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="ml-auto text-neutral-400 hover:text-white transition-colors">
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-neutral-900/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-large shadow-custom-hover w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-xl font-bold text-neutral-900">Create New Report</h3>
                <p className="text-sm text-neutral-500 mt-0.5">Configure your report settings</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Report Name</label>
                <input type="text" placeholder="e.g. Q4 Financial Summary" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Report Type</label>
                <select className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all appearance-none">
                  <option>Financial</option>
                  <option>Sales</option>
                  <option>Operations</option>
                  <option>HR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Data Source</label>
                <select className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all appearance-none">
                  <option>All Sources</option>
                  <option>Stripe</option>
                  <option>HubSpot</option>
                  <option>Google Analytics</option>
                  <option>Manual Upload</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Start Date</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" defaultValue="2023-10-01" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">End Date</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" defaultValue="2023-10-31" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Export Format</label>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-small cursor-pointer hover:bg-neutral-100 transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-500" />
                    <i className="ri-file-pdf-line text-red-500"></i>
                    <span className="text-sm text-neutral-700 font-medium">PDF</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-small cursor-pointer hover:bg-neutral-100 transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-500" />
                    <i className="ri-file-excel-line text-green-600"></i>
                    <span className="text-sm text-neutral-700 font-medium">CSV</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 rounded-small text-sm font-semibold hover:bg-neutral-200 transition-colors">Cancel</button>
              <button onClick={() => { setShowCreateModal(false); handleExport('New Report', 'pdf'); }} className="flex-1 px-4 py-2.5 bg-neutral-900 text-white rounded-small text-sm font-semibold hover:bg-neutral-700 transition-colors shadow-custom">Generate Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
