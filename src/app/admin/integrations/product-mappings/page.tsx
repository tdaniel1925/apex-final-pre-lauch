// =============================================
// Admin Product Mappings Management Page
// Map external products to credits and commissions
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/auth/admin';
import { ProductMappingsClient } from '@/components/admin/ProductMappingsClient';
import { Package, DollarSign, CreditCard } from 'lucide-react';

export const metadata = {
  title: 'Product Mappings - Admin - Apex Affinity Group',
  description: 'Map external products to credits and commissions',
};

export default async function ProductMappingsPage() {
  await requireAdmin();

  const serviceClient = createServiceClient();

  // Fetch all product mappings with integration details
  const { data: mappings, error: mappingsError } = await serviceClient
    .from('integration_product_mappings')
    .select(`
      *,
      integration:integrations(
        id,
        platform_name,
        display_name,
        is_enabled
      )
    `)
    .order('created_at', { ascending: false });

  // Fetch all integrations for the filter dropdown
  const { data: integrations, error: integrationsError } = await serviceClient
    .from('integrations')
    .select('id, platform_name, display_name, is_enabled')
    .order('display_name', { ascending: true });

  if (mappingsError) {
    console.error('Error loading product mappings:', mappingsError);
  }

  if (integrationsError) {
    console.error('Error loading integrations:', integrationsError);
  }

  // Calculate statistics
  const stats = {
    total: mappings?.length || 0,
    active: mappings?.filter(m => m.is_active).length || 0,
    withCredits: mappings?.filter(m => (m.tech_credits || 0) + (m.insurance_credits || 0) > 0).length || 0,
    withCommission: mappings?.filter(m => (m.direct_commission_percentage || 0) > 0 || (m.override_commission_percentage || 0) > 0 || (m.fixed_commission_amount || 0) > 0).length || 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Product Mappings</h1>
          <p className="text-slate-600 mt-1">
            Map external products to credits and commission rules
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Package className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Mappings</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">With Credits</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.withCredits}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">With Commission</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.withCommission}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Component for Interactive Features */}
        <ProductMappingsClient
          initialMappings={mappings || []}
          integrations={integrations || []}
        />
      </div>
    </div>
  );
}
