// =============================================
// Admin Dashboard Home
// Overview of key metrics and system status
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import StatCard from '@/components/admin/StatCard';

export const metadata = {
  title: 'Admin Dashboard - Apex Affinity Group',
};

export default async function AdminDashboardPage() {
  const { distributor } = await requireAdmin();
  const serviceClient = createServiceClient();

  // Get total distributors
  const { count: totalDistributors } = await serviceClient
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  // Active/suspended tracking will be added in Stage 2
  // For now, assume all distributors are active
  const activeDistributors = totalDistributors;
  const suspendedDistributors = 0;

  // Get new signups today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: newToday } = await serviceClient
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // Get new signups this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: newThisWeek } = await serviceClient
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  // Get new signups this month
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const { count: newThisMonth } = await serviceClient
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthAgo.toISOString());

  // Get matrix statistics
  const { data: matrixStats } = await serviceClient.rpc('get_matrix_stats').single();

  // Get max depth (excluding null values)
  const { data: maxDepthResult } = await serviceClient
    .from('distributors')
    .select('matrix_depth')
    .not('matrix_depth', 'is', null)
    .order('matrix_depth', { ascending: false })
    .limit(1)
    .single();

  const maxDepth = maxDepthResult?.matrix_depth || 0;

  // Get average depth
  const { data: avgDepthResult } = await serviceClient.rpc('avg_matrix_depth').single();
  const avgDepth = avgDepthResult ? Math.round(Number(avgDepthResult) * 10) / 10 : 0;

  // Get recent distributors
  const { data: recentDistributors } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, email, slug, created_at, matrix_position')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {distributor.first_name}! Here&apos;s your system overview.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Distributors"
          value={totalDistributors || 0}
          subtitle={`${activeDistributors || 0} active, ${suspendedDistributors || 0} suspended`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          color="blue"
        />

        <StatCard
          title="New Today"
          value={newToday || 0}
          subtitle={`${newThisWeek || 0} this week`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          }
          color="green"
        />

        <StatCard
          title="This Month"
          value={newThisMonth || 0}
          subtitle="New signups"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          color="purple"
        />

        <StatCard
          title="Matrix Depth"
          value={maxDepth}
          subtitle={`Average: ${avgDepth} levels`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
          color="orange"
        />
      </div>

      {/* Recent Distributors */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Signups</h2>
          <p className="text-sm text-gray-600 mt-1">Latest 10 distributors</p>
        </div>

        {recentDistributors && recentDistributors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentDistributors.map((dist) => (
                  <tr key={dist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {dist.first_name} {dist.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{dist.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">@{dist.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        #{dist.matrix_position}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(dist.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No distributors found
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/distributors"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Distributors</h3>
              <p className="text-sm text-gray-600">View, edit, and manage users</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/genealogy"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Genealogy</h3>
              <p className="text-sm text-gray-600">Visualize network structure</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/reports"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Generate Reports</h3>
              <p className="text-sm text-gray-600">View analytics and insights</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
