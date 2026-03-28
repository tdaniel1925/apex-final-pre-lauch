// =============================================
// Dashboard V3 Client - SmartViz Template Style
// Client component for interactive dashboard UI
// =============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Distributor } from '@/lib/types';

interface DashboardV3ClientProps {
  data: {
    distributor: Distributor;
    stats: {
      repNumber: number;
      level: number;
      personalEnrollees: number;
      organizationEnrollees: number;
      matrixChildren: number;
      directReferrals: number;
    };
    placement: {
      matrixParent: string;
      sponsor: string;
    };
    referralLink: string;
    recentMembers: Array<{ first_name: string; last_name: string; created_at: string }>;
    recruits: Distributor[];
    matrixChildren: Distributor[];
  };
}

export default function DashboardV3Client({ data }: DashboardV3ClientProps) {
  const [copied, setCopied] = useState(false);
  const { distributor, stats, placement, referralLink, recentMembers, recruits, matrixChildren } = data;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Initialize Chart.js for growth visualization
    if (typeof window !== 'undefined' && (window as any).Chart) {
      const Chart = (window as any).Chart;

      // Team Growth Chart
      const growthCtx = (document.getElementById('teamGrowthChart') as HTMLCanvasElement)?.getContext('2d');
      if (growthCtx) {
        const gradient = growthCtx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(16,185,129,0.2)');
        gradient.addColorStop(1, 'rgba(16,185,129,0)');

        new Chart(growthCtx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Personal Enrollees',
                data: [0, 2, 5, 8, 12, stats.personalEnrollees],
                borderColor: '#10b981',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#10b981',
                pointBorderWidth: 2,
              },
              {
                label: 'Organization Total',
                data: [0, 5, 15, 30, 50, stats.organizationEnrollees],
                borderColor: '#f97316',
                backgroundColor: 'rgba(249,115,22,0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#f97316',
                pointBorderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                  font: { family: "'Inter', sans-serif", size: 12 },
                  color: '#64748b',
                  usePointStyle: true,
                  padding: 15,
                },
              },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
                cornerRadius: 8,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#94a3b8' },
              },
              x: {
                grid: { display: false, drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#94a3b8' },
              },
            },
          },
        });
      }

      // Matrix Distribution Donut Chart
      const matrixCtx = (document.getElementById('matrixDistChart') as HTMLCanvasElement)?.getContext('2d');
      if (matrixCtx) {
        new Chart(matrixCtx, {
          type: 'doughnut',
          data: {
            labels: ['Filled', 'Available'],
            datasets: [
              {
                data: [stats.matrixChildren, Math.max(0, 5 - stats.matrixChildren)],
                backgroundColor: ['#10b981', '#f1f5f9'],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
                cornerRadius: 8,
              },
            },
          },
        });
      }
    }
  }, [stats]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-neutral-50">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-white border-r border-neutral-200 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-900 rounded-small flex items-center justify-center text-white">
            <i className="ri-dashboard-fill text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Dashboard</h1>
            <p className="text-xs text-neutral-500">Overview & Stats</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link
            href="/dashboard-v3"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-small transition-all"
          >
            <i className="ri-dashboard-line text-lg"></i>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/matrix-v2"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-small transition-all"
          >
            <i className="ri-organization-chart text-lg"></i>
            <span>Matrix</span>
          </Link>
          <Link
            href="/genealogy-v2"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-small transition-all"
          >
            <i className="ri-git-branch-line text-lg"></i>
            <span>Genealogy</span>
          </Link>
          <Link
            href="/profile-v2"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-small transition-all"
          >
            <i className="ri-user-line text-lg"></i>
            <span>Profile</span>
          </Link>
          <Link
            href="/reports-v2"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-small transition-all"
          >
            <i className="ri-file-chart-line text-lg"></i>
            <span>Reports</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-small">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {distributor.first_name?.[0]}
              {distributor.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {distributor.first_name} {distributor.last_name}
              </p>
              <p className="text-xs text-neutral-500">Rep #{stats.repNumber}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {distributor.first_name}!
          </h2>
          <p className="text-neutral-600">Here's what's happening with your business today.</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {/* Rep Number */}
          <div className="bg-white rounded-large p-6 border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-small flex items-center justify-center">
                <i className="ri-user-star-line text-2xl text-blue-600"></i>
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-600 mb-1">Rep Number</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.repNumber}</p>
          </div>

          {/* Level */}
          <div className="bg-white rounded-large p-6 border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-small flex items-center justify-center">
                <i className="ri-bar-chart-grouped-line text-2xl text-purple-600"></i>
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-600 mb-1">Matrix Level</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.level}</p>
          </div>

          {/* Personal Enrollees */}
          <div className="bg-white rounded-large p-6 border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-small flex items-center justify-center">
                <i className="ri-user-add-line text-2xl text-primary-600"></i>
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-600 mb-1">Personal Enrollees</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.personalEnrollees}</p>
          </div>

          {/* Organization Enrollees */}
          <div className="bg-white rounded-large p-6 border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-small flex items-center justify-center">
                <i className="ri-team-line text-2xl text-orange-600"></i>
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-600 mb-1">Organization Total</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.organizationEnrollees}</p>
          </div>

          {/* Matrix Children */}
          <div className="bg-white rounded-large p-6 border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-small flex items-center justify-center">
                <i className="ri-organization-chart text-2xl text-teal-600"></i>
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-600 mb-1">Matrix Position</p>
            <p className="text-3xl font-bold text-neutral-900">
              {stats.matrixChildren}/5
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Team Growth Chart */}
          <div className="lg:col-span-2 bg-white rounded-large p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Team Growth</h3>
                <p className="text-sm text-neutral-600">Personal vs. Organization enrollees</p>
              </div>
            </div>
            <div className="h-64">
              <canvas id="teamGrowthChart"></canvas>
            </div>
          </div>

          {/* Matrix Distribution */}
          <div className="bg-white rounded-large p-6 border border-neutral-200">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Matrix Position</h3>
              <p className="text-sm text-neutral-600">Direct downline capacity</p>
            </div>
            <div className="relative h-48 flex items-center justify-center mb-4">
              <canvas id="matrixDistChart"></canvas>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-neutral-900">{stats.matrixChildren}</p>
                <p className="text-sm text-neutral-600">of 5</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                  <span className="text-neutral-700">Filled</span>
                </div>
                <span className="font-semibold text-neutral-900">{stats.matrixChildren}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neutral-200 rounded-full"></div>
                  <span className="text-neutral-700">Available</span>
                </div>
                <span className="font-semibold text-neutral-900">{Math.max(0, 5 - stats.matrixChildren)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Placement Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Matrix Parent */}
          <div className="bg-white rounded-large p-6 border border-neutral-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                <i className="ri-parent-line text-2xl text-primary-600"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Matrix Parent</p>
                <p className="text-lg font-semibold text-neutral-900">{placement.matrixParent}</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600">
              Your position in the 5×7 forced matrix structure
            </p>
          </div>

          {/* Sponsor */}
          <div className="bg-white rounded-large p-6 border border-neutral-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <i className="ri-user-heart-line text-2xl text-orange-600"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Sponsor</p>
                <p className="text-lg font-semibold text-neutral-900">{placement.sponsor}</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600">
              The distributor who enrolled you into Apex
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-large p-6 mb-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Your Referral Link</h3>
              <p className="text-primary-50 text-sm">Share this link to grow your network</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-small flex items-center justify-center">
              <i className="ri-link text-2xl"></i>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-small p-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-transparent border-none outline-none text-white text-sm font-mono"
            />
            <button
              onClick={copyReferralLink}
              className="px-4 py-2 bg-white text-primary-600 rounded-small font-medium text-sm hover:bg-primary-50 transition-colors flex items-center gap-2"
            >
              <i className={copied ? 'ri-check-line' : 'ri-clipboard-line'}></i>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Recent Activity & Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Team Members */}
          <div className="bg-white rounded-large p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Team Members</h3>
              <Link
                href="/genealogy-v2"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View All
                <i className="ri-arrow-right-line"></i>
              </Link>
            </div>
            <div className="space-y-3">
              {recentMembers.length > 0 ? (
                recentMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-small hover:bg-neutral-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {member.first_name?.[0]}
                      {member.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-xs text-neutral-600">
                        Joined {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-600">
                  <i className="ri-user-add-line text-4xl mb-2 opacity-50"></i>
                  <p className="text-sm">No team members yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Direct Referrals Summary */}
          <div className="bg-white rounded-large p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Your Direct Referrals</h3>
              <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold">
                {stats.directReferrals} Total
              </span>
            </div>
            <div className="space-y-3">
              {recruits.length > 0 ? (
                recruits.slice(0, 5).map((recruit) => (
                  <div
                    key={recruit.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-small hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {recruit.first_name?.[0]}
                        {recruit.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {recruit.first_name} {recruit.last_name}
                        </p>
                        <p className="text-xs text-neutral-600">Level {recruit.matrix_depth}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recruit.licensing_status === 'licensed'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {recruit.licensing_status === 'licensed' ? 'Licensed' : 'Pending'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-600">
                  <i className="ri-user-follow-line text-4xl mb-2 opacity-50"></i>
                  <p className="text-sm">No direct referrals yet</p>
                  <p className="text-xs mt-1">Share your referral link to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
