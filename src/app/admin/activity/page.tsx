// =============================================
// Admin Activity Log Page
// Real-time system audit trail with REAL DATA
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import ActivityLogClient from '@/components/admin/ActivityLogClient';

export const metadata = {
  title: 'Activity Log — Apex Admin',
};

export const revalidate = 0; // Real-time updates
export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  await requireAdmin();

  const supabase = await createClient();

  // Fetch activity log entries
  const { data: activities, error } = await supabase
    .from('admin_activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Error fetching activity log:', error);
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Activity Log</h3>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return <ActivityLogClient activities={activities || []} />;
}
