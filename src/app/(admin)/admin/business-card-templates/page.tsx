// ============================================================
// Admin: Business Card Templates
// Manage template configurations
// ============================================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import TemplateManager from '@/components/admin/TemplateManager';

export const metadata = {
  title: 'Business Card Templates — Admin',
};

export default async function BusinessCardTemplatesPage() {
  await requireAdmin();

  const serviceClient = createServiceClient();

  // Fetch all templates
  const { data: templates } = await serviceClient
    .from('business_card_templates')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Business Card Templates
        </h1>
        <p className="text-gray-600">
          Manage template designs, colors, fonts, and layout configurations
        </p>
      </div>

      <TemplateManager templates={templates || []} />
    </div>
  );
}
