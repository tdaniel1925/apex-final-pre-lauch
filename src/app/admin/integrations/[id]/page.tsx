// =============================================
// Integration Detail/Edit Page
// View and edit a specific integration
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { notFound } from 'next/navigation';
import IntegrationForm from '@/components/admin/IntegrationForm';
import { decrypt, maskCredential } from '@/lib/integrations/encryption';
import Link from 'next/link';
import { ArrowLeft, Globe, DollarSign, AlertCircle, Activity, Webhook } from 'lucide-react';

interface IntegrationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: 'Integration Details - Admin - Apex Affinity Group',
};

export const revalidate = 0; // Always fetch fresh data

export default async function IntegrationDetailPage({
  params,
}: IntegrationPageProps) {
  await requireAdmin();

  const { id } = await params;

  const serviceClient = createServiceClient();

  // Fetch integration with related data
  const { data: integration, error } = await serviceClient
    .from('integrations')
    .select(`
      *,
      replicated_sites:distributor_replicated_sites(
        count,
        site_status
      ),
      sales:external_sales(
        count,
        sale_amount.sum(),
        commission_amount.sum()
      ),
      recent_webhooks:integration_webhook_logs(
        id,
        webhook_event_type,
        processing_status,
        received_at,
        error_message
      )
    `)
    .eq('id', id)
    .order('received_at', {
      ascending: false,
      foreignTable: 'integration_webhook_logs'
    })
    .limit(10, { foreignTable: 'integration_webhook_logs' })
    .single();

  if (error || !integration) {
    console.error('Error loading integration:', error);
    notFound();
  }

  // Decrypt credentials for editing (but mask for display)
  let decryptedCredentials = {
    api_key: '',
    webhook_secret: '',
  };

  if (integration.api_key_encrypted) {
    try {
      decryptedCredentials.api_key = decrypt(integration.api_key_encrypted);
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
    }
  }

  if (integration.webhook_secret) {
    decryptedCredentials.webhook_secret = integration.webhook_secret;
  }

  // Calculate stats
  const totalSites = integration.replicated_sites?.[0]?.count || 0;
  const totalSales = integration.sales?.[0]?.count || 0;
  const totalRevenue = integration.sales?.[0]?.sum || 0;
  const totalCommissions = integration.sales?.[0]?.commission_amount?.sum || 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/admin/integrations"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Integrations
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {integration.display_name}
              </h1>
              <p className="text-slate-600 mt-1">{integration.platform_name}</p>
            </div>
            <div>
              {integration.is_enabled ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Disabled
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          {integration.notes && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">{integration.notes}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Globe className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Replicated Sites</p>
                <p className="text-2xl font-bold text-slate-900">{totalSites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Sales</p>
                <p className="text-2xl font-bold text-slate-900">{totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Commissions</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${totalCommissions.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Integration Settings
              </h2>
              <IntegrationForm
                integration={{
                  ...integration,
                  api_key: decryptedCredentials.api_key,
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Webhook URL */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhook URL
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">
                    Configure this URL in {integration.display_name}
                  </label>
                  <code className="block text-xs bg-slate-50 border border-slate-200 rounded p-3 break-all font-mono">
                    {process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'}
                    /api/webhooks/integrations/{integration.platform_name}
                  </code>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">
                    Webhook Secret
                  </label>
                  <code className="block text-xs bg-slate-50 border border-slate-200 rounded p-3 break-all font-mono">
                    {integration.webhook_secret
                      ? maskCredential(integration.webhook_secret)
                      : 'Not configured'}
                  </code>
                </div>
              </div>
            </div>

            {/* Recent Webhook Activity */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Webhooks
              </h3>
              <div className="space-y-2">
                {integration.recent_webhooks &&
                integration.recent_webhooks.length > 0 ? (
                  integration.recent_webhooks.map((webhook: any) => (
                    <div
                      key={webhook.id}
                      className="flex items-start justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {webhook.webhook_event_type}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(webhook.received_at).toLocaleString()}
                        </p>
                        {webhook.error_message && (
                          <p className="text-xs text-red-600 mt-1 truncate">
                            {webhook.error_message}
                          </p>
                        )}
                      </div>
                      <div className="ml-2">
                        {webhook.processing_status === 'success' ? (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        ) : webhook.processing_status === 'error' ? (
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                        ) : (
                          <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No webhook activity yet
                  </p>
                )}
              </div>
            </div>

            {/* Warning if enabled without credentials */}
            {integration.is_enabled && !integration.api_key_encrypted && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                      Missing Configuration
                    </h4>
                    <p className="text-sm text-yellow-800">
                      This integration is enabled but API credentials are not configured.
                      Add your API key to activate the connection.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
