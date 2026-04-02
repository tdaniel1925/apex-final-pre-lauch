// =============================================
// CRM Dashboard - Main Overview Page
// Business Center Feature-Gated
// =============================================

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import FeatureGate from '@/components/dashboard/FeatureGate';
import Link from 'next/link';
import { Users, UserPlus, Phone, CheckSquare, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';

export const metadata: Metadata = {
  title: 'CRM | Apex Affinity Group',
  description: 'Customer Relationship Management',
};

// Fetch CRM stats
async function getCRMStats(distributorId: string) {
  const supabase = await createClient();

  // Get counts
  const [leadsResult, contactsResult, tasksResult, activitiesResult] = await Promise.all([
    supabase
      .from('crm_leads')
      .select('*', { count: 'exact', head: true })
      .eq('distributor_id', distributorId),
    supabase
      .from('crm_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('distributor_id', distributorId)
      .eq('status', 'active'),
    supabase
      .from('crm_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('distributor_id', distributorId)
      .in('status', ['pending', 'in_progress']),
    supabase
      .from('crm_activities')
      .select('*', { count: 'exact', head: true })
      .eq('distributor_id', distributorId),
  ]);

  // Get overdue tasks
  const now = new Date().toISOString();
  const { count: overdueTasks } = await supabase
    .from('crm_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('distributor_id', distributorId)
    .lt('due_date', now)
    .in('status', ['pending', 'in_progress']);

  // Get recent leads (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: recentLeads } = await supabase
    .from('crm_leads')
    .select('*', { count: 'exact', head: true })
    .eq('distributor_id', distributorId)
    .gte('created_at', sevenDaysAgo.toISOString());

  return {
    totalLeads: leadsResult.count || 0,
    activeContacts: contactsResult.count || 0,
    pendingTasks: tasksResult.count || 0,
    totalActivities: activitiesResult.count || 0,
    overdueTasks: overdueTasks || 0,
    recentLeads: recentLeads || 0,
  };
}

// Fetch upcoming tasks
async function getUpcomingTasks(distributorId: string) {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from('crm_tasks')
    .select('*')
    .eq('distributor_id', distributorId)
    .in('status', ['pending', 'in_progress'])
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(5);

  return tasks || [];
}

export default async function CRMDashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Check Business Center access
  const bcStatus = await checkBusinessCenterSubscription(currentUser.id);

  const stats = await getCRMStats(currentUser.id);
  const upcomingTasks = await getUpcomingTasks(currentUser.id);

  return (
    <FeatureGate
      featurePath="/dashboard/crm"
      hasAccess={bcStatus.hasSubscription}
      daysWithout={bcStatus.daysWithout}
    >
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">CRM Dashboard</h1>
            <p className="text-slate-600">Manage your leads, contacts, and customer relationships</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Leads */}
            <Link
              href="/dashboard/crm/leads"
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{stats.totalLeads}</div>
                  <div className="text-sm text-slate-600">Total Leads</div>
                </div>
              </div>
              {stats.recentLeads > 0 && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stats.recentLeads} new this week
                </div>
              )}
            </Link>

            {/* Active Contacts */}
            <Link
              href="/dashboard/crm/contacts"
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{stats.activeContacts}</div>
                  <div className="text-sm text-slate-600">Active Contacts</div>
                </div>
              </div>
            </Link>

            {/* Pending Tasks */}
            <Link
              href="/dashboard/crm/tasks"
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <CheckSquare className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{stats.pendingTasks}</div>
                  <div className="text-sm text-slate-600">Pending Tasks</div>
                </div>
              </div>
              {stats.overdueTasks > 0 && (
                <div className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {stats.overdueTasks} overdue
                </div>
              )}
            </Link>

            {/* Total Activities */}
            <Link
              href="/dashboard/crm/activities"
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{stats.totalActivities}</div>
                  <div className="text-sm text-slate-600">Activities Logged</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions + Upcoming Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/dashboard/crm/leads/new"
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Add Lead</span>
                </Link>
                <Link
                  href="/dashboard/crm/contacts/new"
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Add Contact</span>
                </Link>
                <Link
                  href="/dashboard/crm/tasks/new"
                  className="flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                >
                  <CheckSquare className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Create Task</span>
                </Link>
                <Link
                  href="/dashboard/crm/activities/new"
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Phone className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Log Activity</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Upcoming Tasks</h2>
                <Link href="/dashboard/crm/tasks" className="text-sm text-blue-600 hover:text-blue-700">
                  View all
                </Link>
              </div>

              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No upcoming tasks</p>
                  <Link
                    href="/dashboard/crm/tasks/new"
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                  >
                    Create your first task
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => {
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                    return (
                      <Link
                        key={task.id}
                        href={`/dashboard/crm/tasks/${task.id}`}
                        className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 text-sm">{task.title}</div>
                            {task.due_date && (
                              <div
                                className={`text-xs mt-1 ${
                                  isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'
                                }`}
                              >
                                {isOverdue && '⚠️ '}
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              task.priority === 'urgent'
                                ? 'bg-red-100 text-red-800'
                                : task.priority === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : task.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
