'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MatrixV2() {
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  // Mock data for demonstration
  const userData = {
    repNumber: 1247,
    level: 3,
    firstName: 'Sarah',
    lastName: 'Wilson',
    matrixParent: 'Michael Chen',
    totalDownline: 4,
    capacity: 5,
    sponsorPath: [
      { name: 'Master', slug: 'master' },
      { name: 'David Rodriguez', slug: 'drodriguez' },
      { name: 'Michael Chen', slug: 'mchen' }
    ],
    matrixChildren: [
      { id: 1, name: 'Jennifer Lee', position: 1, level: 4, downline: 3, status: 'active', joined: '2024-01-15' },
      { id: 2, name: 'Robert Taylor', position: 2, level: 4, downline: 5, status: 'active', joined: '2024-02-03' },
      { id: 3, name: 'Amanda White', position: 3, level: 4, downline: 2, status: 'active', joined: '2024-02-18' },
      { id: 4, name: 'James Brown', position: 4, level: 4, downline: 4, status: 'active', joined: '2024-03-05' }
    ]
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Chart) {
      const Chart = (window as any).Chart;

      // Matrix Growth Chart
      const ctx = (document.getElementById('matrixGrowthChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(16,185,129,0.2)');
        gradient.addColorStop(1, 'rgba(16,185,129,0)');

        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [{
              label: 'Team Growth',
              data: [1, 2, 4, 8, 12, 18],
              borderColor: '#10b981',
              backgroundColor: gradient,
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#10b981',
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
                padding: 12,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
                cornerRadius: 8
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#94a3b8' }
              },
              x: {
                grid: { display: false, drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#94a3b8' }
              }
            }
          }
        });
      }
    }
  }, []);

  const availableSlots = userData.capacity - userData.totalDownline;
  const fillPercentage = (userData.totalDownline / userData.capacity) * 100;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-neutral-50">
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
            <Link href="/matrix-v2" className="flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-small shadow-custom transition-all">
              <i className="ri-organization-chart"></i>
              <span className="font-medium">Matrix</span>
            </Link>
            <Link href="/genealogy-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-git-branch-line"></i>
              <span className="font-medium">Genealogy</span>
            </Link>
          </div>

          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Management</p>
            <Link href="/profile-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-user-settings-line"></i>
              <span className="font-medium">Profile &amp; Plan</span>
            </Link>
            <Link href="/reports-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-file-chart-line"></i>
              <span className="font-medium">Reports</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-primary-500 rounded-large p-5 text-white relative overflow-hidden shadow-custom">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-20 rounded-full"></div>
            <div className="relative z-10">
              <h4 className="font-heading font-bold text-lg mb-1">Build Your Team</h4>
              <p className="text-primary-50 text-sm mb-3 opacity-90">Share your referral link</p>
              <button className="w-full bg-white text-primary-600 font-bold py-2 rounded-small text-sm hover:bg-primary-50 transition-colors">Get Link</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold text-neutral-900">Matrix View</h1>
                <p className="text-sm text-neutral-500 mt-0.5">Your position in the 5×7 forced matrix</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                  <i className="ri-organization-chart mr-1.5"></i>
                  Level {userData.level} of 7
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6">
          {/* KPI Cards */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                  <i className="ri-hashtag"></i>
                </div>
                <span className="text-sm text-neutral-500">Your Rep #</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">#{userData.repNumber}</p>
              <p className="text-xs text-neutral-400 mt-1">Unique identifier</p>
            </div>

            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i className="ri-stack-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Your Level</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">{userData.level}</p>
              <p className="text-xs text-neutral-400 mt-1">of 7 levels</p>
            </div>

            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-secondary-50 text-secondary-600 flex items-center justify-center">
                  <i className="ri-team-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Direct Downline</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">{userData.totalDownline}</p>
              <p className="text-xs text-neutral-400 mt-1">{availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} available</p>
            </div>

            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <i className="ri-progress-3-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Capacity</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">{userData.totalDownline}/{userData.capacity}</p>
              <div className="mt-2 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${fillPercentage}%` }}></div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Matrix Parent Card */}
              <div className="bg-white rounded-large shadow-custom p-6">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ri-parent-line text-primary-500"></i>
                  <h2 className="font-heading text-base font-bold text-neutral-900">Matrix Parent</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-custom">
                    {userData.matrixParent.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Placed under</p>
                    <p className="font-semibold text-neutral-900">{userData.matrixParent}</p>
                  </div>
                </div>
              </div>

              {/* Sponsor Lineage */}
              <div className="bg-white rounded-large shadow-custom p-6">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ri-arrow-up-line text-secondary-500"></i>
                  <h2 className="font-heading text-base font-bold text-neutral-900">Sponsor Lineage</h2>
                </div>
                <div className="space-y-2">
                  {userData.sponsorPath.map((sponsor, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 text-xs font-bold">
                        {sponsor.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{sponsor.name}</p>
                        <p className="text-xs text-neutral-400">@{sponsor.slug}</p>
                      </div>
                      {index < userData.sponsorPath.length - 1 && (
                        <i className="ri-arrow-down-s-line text-neutral-300"></i>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-small border border-primary-100">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {userData.firstName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary-900">You</p>
                      <p className="text-xs text-primary-600">{userData.firstName} {userData.lastName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="bg-white rounded-large shadow-custom p-6">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ri-line-chart-line text-primary-500"></i>
                  <h2 className="font-heading text-base font-bold text-neutral-900">Team Growth</h2>
                </div>
                <div className="h-48">
                  <canvas id="matrixGrowthChart"></canvas>
                </div>
              </div>
            </div>

            {/* Right Column - Matrix Children */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-large shadow-custom p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <i className="ri-node-tree text-primary-500"></i>
                    <h2 className="font-heading text-base font-bold text-neutral-900">Your Direct Downline</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
                    {userData.totalDownline} / {userData.capacity} positions filled
                  </span>
                </div>

                {/* Matrix Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {userData.matrixChildren.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => setSelectedMember(selectedMember === child.id ? null : child.id)}
                      className={`p-4 border-2 rounded-large cursor-pointer transition-all hover:shadow-custom-hover ${
                        selectedMember === child.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 bg-white hover:border-primary-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-custom">
                            {child.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 text-sm">{child.name}</p>
                            <p className="text-xs text-neutral-500">Position {child.position}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                          Active
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-neutral-50 rounded">
                          <p className="text-xs text-neutral-500">Level</p>
                          <p className="text-sm font-bold text-neutral-900">{child.level}</p>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded">
                          <p className="text-xs text-neutral-500">Downline</p>
                          <p className="text-sm font-bold text-neutral-900">{child.downline}</p>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded">
                          <p className="text-xs text-neutral-500">Joined</p>
                          <p className="text-sm font-bold text-neutral-900">{new Date(child.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>

                      {selectedMember === child.id && (
                        <div className="mt-3 pt-3 border-t border-neutral-200">
                          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-small text-xs font-semibold hover:bg-primary-600 transition-colors">
                            <i className="ri-eye-line"></i>
                            View Their Matrix
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Empty Slots */}
                  {Array.from({ length: availableSlots }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="p-4 border-2 border-dashed border-neutral-200 rounded-large bg-neutral-50 flex flex-col items-center justify-center min-h-[140px]"
                    >
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center mb-2">
                        <i className="ri-add-line text-neutral-400 text-xl"></i>
                      </div>
                      <p className="text-xs text-neutral-400 text-center">Available Position</p>
                    </div>
                  ))}
                </div>

                {/* Help Text */}
                <div className="bg-primary-50 border border-primary-100 rounded-large p-4 flex items-start gap-3">
                  <i className="ri-lightbulb-line text-primary-600 text-xl shrink-0"></i>
                  <div>
                    <p className="text-xs font-semibold text-primary-900 mb-1">Matrix Navigation Tip</p>
                    <p className="text-xs text-primary-700">
                      Click on any team member above to drill down and view their matrix positions. You can navigate through all 7 levels of your organization this way!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
