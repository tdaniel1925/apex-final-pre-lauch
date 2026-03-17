// =============================================
// Admin Product Mappings Bulk CSV Import Page
// Upload CSV to create multiple product mappings at once
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { BulkImportClient } from '@/components/admin/BulkImportClient';

export const metadata = {
  title: 'Import Product Mappings - Admin - Apex Affinity Group',
  description: 'Bulk import product mappings from CSV',
};

export default async function ProductMappingsImportPage() {
  await requireAdmin();

  const serviceClient = createServiceClient();

  // Fetch integrations for platform selection
  const { data: integrations, error } = await serviceClient
    .from('integrations')
    .select('id, platform_name, display_name, is_enabled')
    .eq('is_enabled', true)
    .order('display_name');

  if (error) {
    console.error('Error loading integrations:', error);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <BulkImportClient integrations={integrations || []} />
      </div>
    </div>
  );
}
