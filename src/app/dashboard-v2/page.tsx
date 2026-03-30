'use client';

// =============================================
// Dashboard V2 - Direct Template Conversion
// Converted from SmartViz template HTML
// =============================================

import Link from 'next/link';
import { useEffect } from 'react';
import '../template-v2.css';

export default function DashboardV2() {
  useEffect(() => {
    // Wait for Chart.js to load
    if (typeof window !== 'undefined' && (window as any).Chart) {
      const Chart = (window as any).Chart;

      // Revenue Trend Chart
      const ctx1 = (document.getElementById('revTrendChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx1) {
        const gradRev = ctx1.createLinearGradient(0, 0, 0, 190);
        gradRev.addColorStop(0, 'rgba(16,185,129,0.18)');
        gradRev.addColorStop(1, 'rgba(16,185,129,0)');
        const gradExp = ctx1.createLinearGradient(0, 0, 0, 190);
        gradExp.addColorStop(0, 'rgba(249,115,22,0.15)');
        gradExp.addColorStop(1, 'rgba(249,115,22,0)');

        new Chart(ctx1, {
          type: 'line',
          data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            datasets: [
              {
                label: 'Revenue',
                data: [165,178,166,189,192,205,218,212,228,242,255,268],
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
                data: [95,102,98,108,110,115,120,118,124,130,136,142],
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
                cornerRadius: 8
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

      // Department Donut Chart
      const ctx2 = (document.getElementById('deptDonutChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx2) {
        new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: ['Engineering', 'Sales', 'Marketing', 'Other'],
            datasets: [{
              data: [40, 25, 20, 15],
              backgroundColor: ['#10b981', '#fb923c', '#60a5fa', '#c084fc'],
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
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

      // Department Bar Chart
      const ctx3 = (document.getElementById('deptBarChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx3) {
        new Chart(ctx3, {
          type: 'bar',
          data: {
            labels: ['Eng', 'Sales', 'Mktg', 'Ops', 'HR'],
            datasets: [
              {
                label: 'Q4',
                data: [4.2, 3.1, 2.4, 1.8, 1.2],
                backgroundColor: '#10b981',
                borderRadius: 6,
                barPercentage: 0.5
              },
              {
                label: 'Q3',
                data: [3.8, 2.9, 2.1, 1.6, 1.1],
                backgroundColor: '#e2e8f0',
                borderRadius: 6,
                barPercentage: 0.5
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
                callbacks: { label: (ctx: any) => '$' + ctx.raw + 'M' }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 10 }, color: '#94a3b8', callback: (v: any) => '$' + v + 'M' }
              },
              x: {
                grid: { display: false, drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 10 }, color: '#94a3b8' }
              }
            }
          }
        });
      }

      // Utilization Area Chart
      const ctx4 = (document.getElementById('utilizationChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx4) {
        const gradUtil = ctx4.createLinearGradient(0, 0, 0, 160);
        gradUtil.addColorStop(0, 'rgba(96,165,250,0.2)');
        gradUtil.addColorStop(1, 'rgba(96,165,250,0)');

        new Chart(ctx4, {
          type: 'line',
          data: {
            labels: ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'],
            datasets: [{
              label: 'Utilization',
              data: [72, 75, 80, 78, 82, 85, 79, 76, 81, 78, 74, 78],
              borderColor: '#60a5fa',
              backgroundColor: gradUtil,
              borderWidth: 2.5,
              tension: 0.4,
              fill: true,
              pointRadius: 2,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#60a5fa',
              pointBorderWidth: 2
            }]
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
                callbacks: { label: (ctx: any) => ctx.raw + '%' }
              }
            },
            scales: {
              y: {
                min: 60,
                max: 100,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 10 }, color: '#94a3b8', callback: (v: any) => v + '%' }
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
    }
  }, []);

  return (
    <>
      {/* TOP NAVIGATION */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 logo-mark rounded-small flex items-center justify-center text-white">
              <i className="ri-bar-chart-box-fill text-lg"></i>
            </div>
            <Link href="/dashboard" className="font-heading font-bold text-xl text-neutral-900 tracking-tight">Apex Affinity</Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="nav-link text-sm font-medium text-neutral-500">Home</Link>
            <Link href="/dashboard-v2" className="nav-link text-sm font-semibold text-neutral-900 border-b-2 border-primary-500 pb-0.5">Dashboard</Link>
            <Link href="/profile-v2" className="nav-link text-sm font-medium text-neutral-500">Profile</Link>
            <Link href="/reports-v2" className="nav-link text-sm font-medium text-neutral-500">Reports</Link>
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
            Your Data, Beautifully<br />
            <span className="text-primary-500">Visualized in Real Time</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            See exactly how this transforms your distributor network data into an interactive, insight-rich dashboard — charts, KPIs, and tables all auto-generated.
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
              <h2 className="font-heading text-3xl font-extrabold text-white mb-2" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>Network Dashboard Overview</h2>
              <p className="text-neutral-400 text-base">Full interactive view — auto-generated from your data</p>
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
                  <span className="text-primary-600 font-semibold" style={{fontSize:'9px'}}>LIVE</span>
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
                  <h3 className="font-heading font-extrabold text-neutral-900 text-xl" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>Network Overview</h3>
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
                    <div className="h-full bg-primary-500 rounded-full metric-bar" style={{width:'76%'}}></div>
                  </div>
                  <p className="text-neutral-400 mt-1" style={{fontSize:'10px'}}>76% of annual target</p>
                </div>
                <div className="kpi-card bg-white rounded-large border border-neutral-200 p-4 shadow-custom">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-large bg-blue-50 flex items-center justify-center">
                      <i className="ri-team-line text-blue-600"></i>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <i className="ri-arrow-up-line text-xs"></i>+12
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Total Enrollees</p>
                  <p className="font-heading font-extrabold text-2xl text-neutral-900">1,248</p>
                  <div className="mt-2 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full metric-bar" style={{width:'62%'}}></div>
                  </div>
                  <p className="text-neutral-400 mt-1" style={{fontSize:'10px'}}>Across 7 matrix levels</p>
                </div>
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
                    <div className="h-full bg-secondary-400 rounded-full metric-bar" style={{width:'27%'}}></div>
                  </div>
                  <p className="text-neutral-400 mt-1" style={{fontSize:'10px'}}>27% of total network</p>
                </div>
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
                    <div className="h-full bg-purple-500 rounded-full metric-bar" style={{width:'85%'}}></div>
                  </div>
                  <p className="text-neutral-400 mt-1" style={{fontSize:'10px'}}>Team performance score</p>
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
                    <canvas id="revTrendChart"></canvas>
                  </div>
                </div>

                {/* Department Donut */}
                <div className="bg-white rounded-large border border-neutral-200 p-5 shadow-custom">
                  <div className="mb-4">
                    <h4 className="font-heading font-bold text-neutral-900 text-sm">Network by Level</h4>
                    <p className="text-neutral-400 text-xs mt-0.5">Q4 2023 · Matrix depth</p>
                  </div>
                  <div className="h-36 w-full overflow-hidden flex items-center justify-center">
                    <canvas id="deptDonutChart"></canvas>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                        <span className="text-xs text-neutral-600">Level 1-2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">420</span>
                        <span className="text-xs text-neutral-400">40%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary-400"></span>
                        <span className="text-xs text-neutral-600">Level 3-4</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">312</span>
                        <span className="text-xs text-neutral-400">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span className="text-xs text-neutral-600">Level 5-6</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">250</span>
                        <span className="text-xs text-neutral-400">20%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        <span className="text-xs text-neutral-600">Level 7+</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">187</span>
                        <span className="text-xs text-neutral-400">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                {/* Bar Chart */}
                <div className="bg-white rounded-large border border-neutral-200 p-5 shadow-custom">
                  <div className="mb-4">
                    <h4 className="font-heading font-bold text-neutral-900 text-sm">Dept. Revenue Q4</h4>
                    <p className="text-neutral-400 text-xs mt-0.5">Compared to Q3</p>
                  </div>
                  <div className="h-40 w-full overflow-hidden">
                    <canvas id="deptBarChart"></canvas>
                  </div>
                </div>

                {/* Performance Scores */}
                <div className="bg-white rounded-large border border-neutral-200 p-5 shadow-custom">
                  <div className="mb-4">
                    <h4 className="font-heading font-bold text-neutral-900 text-sm">Performance Scores</h4>
                    <p className="text-neutral-400 text-xs mt-0.5">By department · Q4 2023</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-700">Engineering</span>
                        <span className="text-xs font-bold text-neutral-900">91%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full metric-bar" style={{width:'91%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-700">Sales</span>
                        <span className="text-xs font-bold text-neutral-900">87%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full metric-bar" style={{width:'87%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-700">Marketing</span>
                        <span className="text-xs font-bold text-neutral-900">82%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary-400 rounded-full metric-bar" style={{width:'82%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-700">Operations</span>
                        <span className="text-xs font-bold text-neutral-900">79%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full metric-bar" style={{width:'79%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-700">HR</span>
                        <span className="text-xs font-bold text-neutral-900">84%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full metric-bar" style={{width:'84%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Utilization Chart */}
                <div className="bg-white rounded-large border border-neutral-200 p-5 shadow-custom">
                  <div className="mb-4">
                    <h4 className="font-heading font-bold text-neutral-900 text-sm">Network Growth</h4>
                    <p className="text-neutral-400 text-xs mt-0.5">Weekly new distributors</p>
                  </div>
                  <div className="h-40 w-full overflow-hidden">
                    <canvas id="utilizationChart"></canvas>
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
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=facearea&facepad=2&q=80" alt="Sarah" className="w-8 h-8 rounded-full border border-neutral-200" />
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">Sarah Wilson</p>
                              <p className="text-xs text-neutral-400">REP-0042</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold">Level 2</span></td>
                        <td className="px-5 py-3 text-sm font-semibold text-neutral-800">$8,240</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-500 rounded-full" style={{width:'96%'}}></div>
                            </div>
                            <span className="text-xs font-bold text-primary-600">96%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500">Mar 15, 2022</td>
                        <td className="px-5 py-3"><span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">Active</span></td>
                      </tr>
                      <tr className="table-row transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=facearea&facepad=2&q=80" alt="James" className="w-8 h-8 rounded-full border border-neutral-200" />
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">James Carter</p>
                              <p className="text-xs text-neutral-400">REP-0018</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><span className="px-2 py-1 bg-secondary-50 text-secondary-700 rounded-full text-xs font-bold">Level 3</span></td>
                        <td className="px-5 py-3 text-sm font-semibold text-neutral-800">$7,650</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-secondary-400 rounded-full" style={{width:'89%'}}></div>
                            </div>
                            <span className="text-xs font-bold text-secondary-600">89%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500">Jul 22, 2021</td>
                        <td className="px-5 py-3"><span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">Active</span></td>
                      </tr>
                      <tr className="table-row transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=facearea&facepad=2&q=80" alt="Maya" className="w-8 h-8 rounded-full border border-neutral-200" />
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">Maya Patel</p>
                              <p className="text-xs text-neutral-400">REP-0067</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">Level 4</span></td>
                        <td className="px-5 py-3 text-sm font-semibold text-neutral-800">$6,920</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{width:'82%'}}></div>
                            </div>
                            <span className="text-xs font-bold text-blue-600">82%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500">Jan 10, 2021</td>
                        <td className="px-5 py-3"><span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">Active</span></td>
                      </tr>
                      <tr className="table-row transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=facearea&facepad=2&q=80" alt="Tom" className="w-8 h-8 rounded-full border border-neutral-200" />
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">Tom Nguyen</p>
                              <p className="text-xs text-neutral-400">REP-0091</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">Level 5</span></td>
                        <td className="px-5 py-3 text-sm font-semibold text-neutral-800">$5,800</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full" style={{width:'58%'}}></div>
                            </div>
                            <span className="text-xs font-bold text-yellow-600">58%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500">Sep 5, 2022</td>
                        <td className="px-5 py-3"><span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold">Review</span></td>
                      </tr>
                      <tr className="table-row transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=facearea&facepad=2&q=80" alt="Priya" className="w-8 h-8 rounded-full border border-neutral-200" />
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">Priya Sharma</p>
                              <p className="text-xs text-neutral-400">REP-0033</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold">Level 2</span></td>
                        <td className="px-5 py-3 text-sm font-semibold text-neutral-800">$7,240</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full" style={{width:'91%'}}></div>
                            </div>
                            <span className="text-xs font-bold text-teal-600">91%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500">Feb 28, 2020</td>
                        <td className="px-5 py-3"><span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50">
                  <p className="text-xs text-neutral-500">Showing 5 of 1,248 distributors · Sorted by performance desc.</p>
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
                <p className="text-neutral-400" style={{fontSize:'10px'}}>No manual setup needed</p>
              </div>
            </div>
            <div className="floating-badge bg-white rounded-large shadow-custom-hover border border-neutral-200 px-4 py-3 flex items-center gap-3" style={{animationDelay:'0.5s'}}>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="ri-refresh-line text-blue-600 text-sm"></i>
              </div>
              <div>
                <p className="font-heading font-bold text-neutral-900 text-xs">Live Sync</p>
                <p className="text-neutral-400" style={{fontSize:'10px'}}>Updates in real time</p>
              </div>
            </div>
            <div className="floating-badge bg-white rounded-large shadow-custom-hover border border-neutral-200 px-4 py-3 flex items-center gap-3" style={{animationDelay:'1s'}}>
              <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center">
                <i className="ri-share-line text-secondary-600 text-sm"></i>
              </div>
              <div>
                <p className="font-heading font-bold text-neutral-900 text-xs">One-click Share</p>
                <p className="text-neutral-400" style={{fontSize:'10px'}}>Secure shareable link</p>
              </div>
            </div>
            <div className="floating-badge bg-white rounded-large shadow-custom-hover border border-neutral-200 px-4 py-3 flex items-center gap-3" style={{animationDelay:'1.5s'}}>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <i className="ri-bar-chart-2-line text-purple-600 text-sm"></i>
              </div>
              <div>
                <p className="font-heading font-bold text-neutral-900 text-xs">12 Chart Types</p>
                <p className="text-neutral-400" style={{fontSize:'10px'}}>Fully customizable</p>
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
    </>
  );
}
