// =====================================================
// Recurring Events Management Page
// Admin interface for creating and managing recurring event series
// =====================================================

import { requireAdmin } from '@/lib/auth/admin';
import { RecurringEventsList } from '@/components/admin/RecurringEventsList';

export default async function RecurringEventsPage() {
  await requireAdmin();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Recurring Events</h1>
          <p className="mt-2 text-slate-600">
            Create recurring event series that automatically generate future event instances
          </p>
        </div>

        <RecurringEventsList />
      </div>
    </div>
  );
}
