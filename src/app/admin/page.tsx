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

// Enable caching for 30 seconds (shorter for admin due to more frequent updates)
export const revalidate = 30;

export default async function AdminDashboardPage() {
  const { admin } = await requireAdmin();
  const serviceClient = createServiceClient();

  // Calculate date ranges once
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  // OPTIMIZATION: Run all queries in parallel
  const [
    totalDistributorsResult,
    newTodayResult,
    newThisWeekResult,
    newThisMonthResult,
    maxDepthResult,
    avgDepthResult,
    recentDistributors,
    totalProspectsResult,
    newProspectsResult,
  ] = await Promise.all([
    // Get total distributors count
    serviceClient
      .from('distributors')
      .select('*', { count: 'exact', head: true }),

    // Get new signups today
    serviceClient
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),

    // Get new signups this week
    serviceClient
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString()),

    // Get new signups this month
    serviceClient
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthAgo.toISOString()),

    // Get max depth (excluding null values)
    serviceClient
      .from('distributors')
      .select('matrix_depth')
      .not('matrix_depth', 'is', null)
      .order('matrix_depth', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Get average depth
    serviceClient.rpc('avg_matrix_depth').maybeSingle(),

    // Get recent distributors (only needed fields)
    serviceClient
      .from('distributors')
      .select('id, first_name, last_name, email, slug, created_at, matrix_position, rep_number')
      .order('created_at', { ascending: false })
      .limit(10),

    // Get total prospects count
    serviceClient
      .from('prospects')
      .select('*', { count: 'exact', head: true }),

    // Get new prospects today
    serviceClient
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
  ]);

  // Process results
  const totalDistributors = totalDistributorsResult.count || 0;
  const activeDistributors = totalDistributors; // Will be updated in Stage 2
  const suspendedDistributors = 0;
  const newToday = newTodayResult.count || 0;
  const newThisWeek = newThisWeekResult.count || 0;
  const newThisMonth = newThisMonthResult.count || 0;
  const maxDepth = maxDepthResult.data?.matrix_depth || 0;
  const avgDepth = avgDepthResult.data ? Math.round(Number(avgDepthResult.data) * 10) / 10 : 0;
  const totalProspects = totalProspectsResult.count || 0;
  const newProspectsToday = newProspectsResult.count || 0;

  return (
    <div className="p-4">
      {/* Welcome Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Welcome back, {admin.first_name}! Here&apos;s your system overview.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
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
          title="Prospects"
          value={totalProspects || 0}
          subtitle={`${newProspectsToday || 0} signed up today`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          color="teal"
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
      <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Signups</h2>
          <p className="text-xs text-gray-600 mt-0.5">Latest 10 distributors</p>
        </div>

        {recentDistributors.data && recentDistributors.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Username
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Position
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentDistributors.data!.map((dist) => (
                  <tr key={dist.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">
                        {dist.first_name} {dist.last_name}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-500">{dist.email}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">@{dist.slug}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-semibold text-blue-600">
                        Rep #{dist.rep_number ?? 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {new Date(dist.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 text-sm">
            No distributors found
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <a
          href="/admin/distributors"
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Manage Distributors</h3>
              <p className="text-xs text-gray-600">View, edit, and manage users</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/prospects"
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Manage Prospects</h3>
              <p className="text-xs text-gray-600">View and manage signups</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/email-templates"
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Email Templates</h3>
              <p className="text-xs text-gray-600">Manage nurture campaigns</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/genealogy"
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">View Genealogy</h3>
              <p className="text-xs text-gray-600">Visualize network structure</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/reports"
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Generate Reports</h3>
              <p className="text-xs text-gray-600">View analytics and insights</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
