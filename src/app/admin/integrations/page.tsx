// =============================================
// Admin Integrations Management Page
// Manage external platform integrations
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import Link from 'next/link';
import { Plus, Edit, CheckCircle, XCircle, AlertCircle, Globe, Webhook, DollarSign } from 'lucide-react';

export const metadata = {
  title: 'Platform Integrations - Admin - Apex Affinity Group',
  description: 'Manage external platform integrations',
};

export const revalidate = 0; // Always fetch fresh data

export default async function AdminIntegrationsPage() {
  await requireAdmin();

  const serviceClient = createServiceClient();

  // Fetch integrations with stats
  const { data: integrations, error } = await serviceClient
    .from('integrations')
    .select(`
      *,
      replicated_sites:distributor_replicated_sites(count),
      sales:external_sales(
        count,
        sale_amount.sum()
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading integrations:', error);
  }

  // Calculate stats
  const totalIntegrations = integrations?.length || 0;
  const enabledIntegrations = integrations?.filter(i => i.is_enabled).length || 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Platform Integrations</h1>
            <p className="text-slate-600 mt-1">
              Configure external platforms like jordyn.app and agentpulse.cloud
            </p>
          </div>
          <Link
            href="/admin/integrations/new"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Integration
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Globe className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Integrations</p>
                <p className="text-2xl font-bold text-slate-900">{totalIntegrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Enabled</p>
                <p className="text-2xl font-bold text-slate-900">{enabledIntegrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Disabled</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalIntegrations - enabledIntegrations}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations && integrations.length > 0 ? (
            integrations.map((integration: any) => (
              <div
                key={integration.id}
                className="bg-white rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header with Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {integration.display_name}
                      </h3>
                      <p className="text-sm text-slate-500">{integration.platform_name}</p>
                    </div>
                    {integration.is_enabled ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Disabled
                      </span>
                    )}
                  </div>

                  {/* API Endpoint */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-1">API Endpoint</p>
                    <p className="text-sm text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded truncate">
                      {integration.api_endpoint}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        Replicated Sites
                      </span>
                      {integration.supports_replicated_sites ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Webhook className="w-4 h-4" />
                        Sales Webhooks
                      </span>
                      {integration.supports_sales_webhooks ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Commission Tracking
                      </span>
                      {integration.supports_commission_tracking ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Sites</p>
                      <p className="text-lg font-bold text-slate-900">
                        {integration.replicated_sites?.[0]?.count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Sales</p>
                      <p className="text-lg font-bold text-slate-900">
                        {integration.sales?.[0]?.count || 0}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/integrations/${integration.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Manage
                    </Link>
                  </div>

                  {/* Warning if not configured */}
                  {integration.is_enabled && !integration.api_key_encrypted && (
                    <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800">
                        API credentials not configured
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-lg shadow-md border border-slate-200 p-12 text-center">
                <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No integrations yet
                </h3>
                <p className="text-slate-600 mb-4">
                  Add your first platform integration to get started
                </p>
                <Link
                  href="/admin/integrations/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Integration
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
