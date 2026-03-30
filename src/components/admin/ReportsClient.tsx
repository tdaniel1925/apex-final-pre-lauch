'use client';

// =============================================
// Reports Client Component
// Interactive analytics dashboard with charts
// =============================================

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface Distributor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  status: string;
  created_at: string;
  sponsor_id: string | null;
  matrix_depth: number | null;
}

interface ReportsClientProps {
  distributors: Distributor[];
}

export default function ReportsClient({ distributors }: ReportsClientProps) {
  const [selectedTab, setSelectedTab] = useState<'signups' | 'network' | 'status'>('signups');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  // Calculate signup metrics
  const signupMetrics = useMemo(() => {
    const now = new Date();
    const filtered = distributors.filter(d => {
      if (timeRange === 'all') return true;
      const createdDate = new Date(d.created_at);
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      return createdDate >= cutoff;
    });

    // Group by month
    const byMonth: Record<string, number> = {};
    filtered.forEach(d => {
      const month = new Date(d.created_at).toISOString().slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    // Group by week for 7d/30d view
    const byWeek: Record<string, number> = {};
    if (timeRange === '7d' || timeRange === '30d') {
      filtered.forEach(d => {
        const date = new Date(d.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const week = weekStart.toISOString().slice(0, 10);
        byWeek[week] = (byWeek[week] || 0) + 1;
      });
    }

    // Calculate growth rate
    const sortedMonths = Object.keys(byMonth).sort();
    let growthRate = 0;
    if (sortedMonths.length >= 2) {
      const lastMonth = byMonth[sortedMonths[sortedMonths.length - 1]];
      const prevMonth = byMonth[sortedMonths[sortedMonths.length - 2]];
      if (prevMonth > 0) {
        growthRate = ((lastMonth - prevMonth) / prevMonth) * 100;
      }
    }

    return {
      total: filtered.length,
      byMonth,
      byWeek,
      growthRate,
      avgPerMonth: filtered.length / Math.max(1, Object.keys(byMonth).length),
    };
  }, [distributors, timeRange]);

  // Calculate network metrics
  const networkMetrics = useMemo(() => {
    const withSponsors = distributors.filter(d => d.sponsor_id).length;
    const withoutSponsors = distributors.length - withSponsors;

    // Depth distribution
    const depthDist: Record<number, number> = {};
    distributors.forEach(d => {
      const depth = d.matrix_depth ?? 0;
      depthDist[depth] = (depthDist[depth] || 0) + 1;
    });

    const avgDepth = distributors.reduce((sum, d) => sum + (d.matrix_depth ?? 0), 0) / Math.max(1, distributors.length);
    const maxDepth = Math.max(...distributors.map(d => d.matrix_depth ?? 0));

    return {
      withSponsors,
      withoutSponsors,
      depthDist,
      avgDepth: avgDepth.toFixed(1),
      maxDepth,
    };
  }, [distributors]);

  // Calculate status metrics
  const statusMetrics = useMemo(() => {
    const byStatus: Record<string, number> = {};
    distributors.forEach(d => {
      const status = d.status.toLowerCase();
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    return byStatus;
  }, [distributors]);

  // Render signup chart (simple bar chart with CSS)
  const renderSignupChart = () => {
    const data = timeRange === '7d' || timeRange === '30d' ? signupMetrics.byWeek : signupMetrics.byMonth;
    const sortedKeys = Object.keys(data).sort();
    const maxValue = Math.max(...Object.values(data));

    if (sortedKeys.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No signup data for selected time range
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {sortedKeys.map(key => {
          const value = data[key];
          const percentage = (value / maxValue) * 100;
          const label = timeRange === '7d' || timeRange === '30d'
            ? `Week of ${new Date(key).toLocaleDateString()}`
            : new Date(key + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-32 text-sm text-gray-700 font-medium">{label}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-3">
                  <span className="text-sm font-semibold text-gray-700">{value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render network chart
  const renderNetworkChart = () => {
    const sortedDepths = Object.keys(networkMetrics.depthDist)
      .map(Number)
      .sort((a, b) => a - b);
    const maxValue = Math.max(...Object.values(networkMetrics.depthDist));

    return (
      <div className="space-y-3">
        {sortedDepths.map(depth => {
          const value = networkMetrics.depthDist[depth];
          const percentage = (value / maxValue) * 100;

          return (
            <div key={depth} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-700 font-medium">
                {depth === 0 ? 'Root' : `Level ${depth}`}
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-3">
                  <span className="text-sm font-semibold text-gray-700">{value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render status chart
  const renderStatusChart = () => {
    const sortedStatuses = Object.entries(statusMetrics).sort((a, b) => b[1] - a[1]);
    const total = distributors.length;

    return (
      <div className="space-y-3">
        {sortedStatuses.map(([status, count]) => {
          const percentage = (count / total) * 100;

          return (
            <div key={status} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-700 font-medium capitalize">{status}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    status === 'active' ? 'bg-green-500' :
                    status === 'suspended' ? 'bg-red-500' :
                    status === 'pending' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-sm font-semibold text-gray-700">{count}</span>
                  <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Network performance and growth insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
          <Button
            variant={timeRange === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('all')}
          >
            All Time
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Total Enrollees</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{distributors.length}</div>
          <div className="text-xs text-gray-500 mt-1">All time</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">In Time Range</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{signupMetrics.total}</div>
          <div className="text-xs text-gray-500 mt-1">
            {timeRange === 'all' ? 'All time' : `Last ${timeRange}`}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Growth Rate</div>
          <div className={`text-2xl font-bold mt-1 ${signupMetrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {signupMetrics.growthRate >= 0 ? '+' : ''}{signupMetrics.growthRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Month over month</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Avg Per Month</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {signupMetrics.avgPerMonth.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Signups per month</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setSelectedTab('signups')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'signups'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Signup Trends
          </button>
          <button
            onClick={() => setSelectedTab('network')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'network'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Network Analysis
          </button>
          <button
            onClick={() => setSelectedTab('status')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'status'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Status Breakdown
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {selectedTab === 'signups' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Signup Trends Over Time
            </h2>
            {renderSignupChart()}
          </div>
        )}

        {selectedTab === 'network' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Network Depth Distribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-700">Avg Depth</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {networkMetrics.avgDepth}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm font-medium text-green-700">Max Depth</div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  {networkMetrics.maxDepth}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm font-medium text-purple-700">With Sponsors</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">
                  {networkMetrics.withSponsors}
                </div>
              </div>
            </div>
            {renderNetworkChart()}
          </div>
        )}

        {selectedTab === 'status' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distributor Status Breakdown
            </h2>
            {renderStatusChart()}
          </div>
        )}
      </div>
    </div>
  );
}
