// =============================================
// Admin Reports Page
// Analytics and performance insights with REAL DATA
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import ReportsClient from '@/components/admin/ReportsClient';

export const metadata = {
  title: 'Reports — Apex Admin',
};

export const revalidate = 300; // Refresh every 5 minutes

export default async function ReportsPage() {
  await requireAdmin();

  const supabase = await createClient();

  // Fetch all distributors for analytics
  const { data: distributors, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, status, created_at, sponsor_id, matrix_depth')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching distributors:', error);
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h3>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return <ReportsClient distributors={distributors || []} />;
}
