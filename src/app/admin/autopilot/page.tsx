// =====================================================
// Admin Autopilot Overview
// Simple interface for back office to understand and monitor Autopilot usage
// =====================================================

import { requireAdmin } from '@/lib/auth/admin';
import { AutopilotOverview } from '@/components/admin/AutopilotOverview';

export default async function AdminAutopilotPage() {
  await requireAdmin();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Apex Lead Autopilot</h1>
          <p className="mt-2 text-slate-600">
            AI-powered prospecting system for distributors
          </p>
        </div>

        <AutopilotOverview />
      </div>
    </div>
  );
}
