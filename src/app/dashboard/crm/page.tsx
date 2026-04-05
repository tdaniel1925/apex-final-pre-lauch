// =============================================
// CRM Dashboard - Tabbed Interface
// Business Center Feature-Gated
// =============================================

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import FeatureGate from '@/components/dashboard/FeatureGate';
import CRMTabs from '@/components/crm/CRMTabs';
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

// Fetch all tasks for Tasks tab
async function getAllTasks(distributorId: string) {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from('crm_tasks')
    .select('*')
    .eq('distributor_id', distributorId)
    .order('due_date', { ascending: true, nullsFirst: false });

  return tasks || [];
}

// Fetch activities for Activities tab
async function getActivities(distributorId: string) {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from('crm_activities')
    .select('*')
    .eq('distributor_id', distributorId)
    .order('activity_date', { ascending: false })
    .limit(100);

  return activities || [];
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
  const allTasks = await getAllTasks(currentUser.id);
  const activities = await getActivities(currentUser.id);

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

          {/* Tabbed Interface */}
          <CRMTabs
            stats={stats}
            upcomingTasks={upcomingTasks}
            allTasks={allTasks}
            activities={activities}
          />
        </div>
      </div>
    </FeatureGate>
  );
}
