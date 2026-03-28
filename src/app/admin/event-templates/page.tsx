// =====================================================
// Event Templates Management Page
// Admin interface for creating and managing event templates
// =====================================================

import { requireAdmin } from '@/lib/auth/admin';
import { TemplatesList } from '@/components/admin/TemplatesList';

export default async function EventTemplatesPage() {
  await requireAdmin();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Event Templates</h1>
          <p className="mt-2 text-slate-600">
            Create reusable event templates to save time when creating similar events
          </p>
        </div>

        <TemplatesList />
      </div>
    </div>
  );
}
