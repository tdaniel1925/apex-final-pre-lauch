// ============================================================
// Admin: Business Card Templates
// Manage template configurations
// ============================================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import TemplateManager from '@/components/admin/TemplateManager';
import Link from 'next/link';

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
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Admin Dashboard
        </Link>
      </div>

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
