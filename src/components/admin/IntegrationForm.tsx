'use client';

// =============================================
// Integration Form Component
// Reusable form for creating/editing integrations
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, TestTube, Eye, EyeOff, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { maskCredential } from '@/lib/integrations/encryption';

interface Integration {
  id?: string;
  platform_name: string;
  display_name: string;
  api_endpoint: string;
  api_key?: string;
  webhook_secret?: string;
  is_enabled: boolean;
  supports_replicated_sites: boolean;
  supports_sales_webhooks: boolean;
  supports_commission_tracking: boolean;
  auto_create_site_on_signup: boolean;
  notes?: string;
}

interface IntegrationFormProps {
  integration?: Partial<Integration>;
}

export default function IntegrationForm({ integration }: IntegrationFormProps) {
  const router = useRouter();
  const isEditing = !!integration?.id;

  // Form state
  const [formData, setFormData] = useState<Integration>({
    platform_name: integration?.platform_name || '',
    display_name: integration?.display_name || '',
    api_endpoint: integration?.api_endpoint || '',
    api_key: integration?.api_key || '',
    webhook_secret: integration?.webhook_secret || '',
    is_enabled: integration?.is_enabled ?? false,
    supports_replicated_sites: integration?.supports_replicated_sites ?? true,
    supports_sales_webhooks: integration?.supports_sales_webhooks ?? true,
    supports_commission_tracking: integration?.supports_commission_tracking ?? true,
    auto_create_site_on_signup: integration?.auto_create_site_on_signup ?? false,
    notes: integration?.notes || '',
  });

  // UI state
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const generateWebhookSecret = () => {
    // Generate a random 32-character secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, webhook_secret: secret }));
    setShowWebhookSecret(true);
  };

  const handleTestConnection = async () => {
    if (!formData.api_key || !formData.api_endpoint) {
      setTestResult({
        success: false,
        message: 'API key and endpoint are required to test connection',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/integrations/${integration?.id}/test-connection`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_endpoint: formData.api_endpoint,
            api_key: formData.api_key,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Connection successful!',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Network error - could not test connection',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/integrations/${integration.id}`
        : '/api/admin/integrations';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/integrations');
        router.refresh();
      } else {
        setError(data.error || 'Failed to save integration');
      }
    } catch (err) {
      setError('Network error - could not save integration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this integration? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/integrations/${integration?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/integrations');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete integration');
      }
    } catch (err) {
      setError('Network error - could not delete integration');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="platform_name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Platform Name *
          </label>
          <input
            type="text"
            id="platform_name"
            name="platform_name"
            value={formData.platform_name}
            onChange={handleChange}
            disabled={isEditing}
            required
            pattern="^[a-z0-9_]+$"
            placeholder="jordyn"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">
            Lowercase, no spaces (e.g., "jordyn", "agentpulse")
          </p>
        </div>

        <div>
          <label
            htmlFor="display_name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Display Name *
          </label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            value={formData.display_name}
            onChange={handleChange}
            required
            placeholder="Jordyn.app"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">
            User-friendly name shown in UI
          </p>
        </div>
      </div>

      {/* API Configuration */}
      <div>
        <label
          htmlFor="api_endpoint"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          API Endpoint *
        </label>
        <input
          type="url"
          id="api_endpoint"
          name="api_endpoint"
          value={formData.api_endpoint}
          onChange={handleChange}
          required
          placeholder="https://api.jordyn.app"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          Base URL for API calls
        </p>
      </div>

      {/* API Key */}
      <div>
        <label
          htmlFor="api_key"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          API Key
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            id="api_key"
            name="api_key"
            value={formData.api_key}
            onChange={handleChange}
            placeholder={isEditing && !showApiKey ? '••••••••••••••••' : 'Enter API key'}
            className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          API key for authenticating requests (stored encrypted)
        </p>
      </div>

      {/* Webhook Secret */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="webhook_secret"
            className="block text-sm font-medium text-slate-700"
          >
            Webhook Secret
          </label>
          <button
            type="button"
            onClick={generateWebhookSecret}
            className="text-xs text-slate-600 hover:text-slate-900 underline"
          >
            Generate Random
          </button>
        </div>
        <div className="relative">
          <input
            type={showWebhookSecret ? 'text' : 'password'}
            id="webhook_secret"
            name="webhook_secret"
            value={formData.webhook_secret}
            onChange={handleChange}
            placeholder={
              isEditing && !showWebhookSecret ? '••••••••••••••••' : 'Enter webhook secret'
            }
            className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowWebhookSecret(!showWebhookSecret)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {showWebhookSecret ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Secret for verifying webhook signatures
        </p>
      </div>

      {/* Feature Toggles */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Supported Features
        </h3>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="supports_replicated_sites"
            checked={formData.supports_replicated_sites}
            onChange={handleChange}
            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">Replicated Sites</p>
            <p className="text-xs text-slate-600">
              Platform supports creating replicated sites for distributors
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="supports_sales_webhooks"
            checked={formData.supports_sales_webhooks}
            onChange={handleChange}
            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">Sales Webhooks</p>
            <p className="text-xs text-slate-600">
              Platform sends webhooks for sales events
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="supports_commission_tracking"
            checked={formData.supports_commission_tracking}
            onChange={handleChange}
            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">Commission Tracking</p>
            <p className="text-xs text-slate-600">
              Platform supports tracking and calculating commissions
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="auto_create_site_on_signup"
            checked={formData.auto_create_site_on_signup}
            onChange={handleChange}
            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">
              Auto-Create Site on Signup
            </p>
            <p className="text-xs text-slate-600">
              Automatically provision replicated site when distributor signs up
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_enabled"
            checked={formData.is_enabled}
            onChange={handleChange}
            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">Enable Integration</p>
            <p className="text-xs text-slate-600">
              Enable this integration to start syncing data
            </p>
          </div>
        </label>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Optional notes about this integration..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
        />
      </div>

      {/* Test Connection Result */}
      {testResult && (
        <div
          className={`rounded-lg p-4 flex items-start gap-3 ${
            testResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {testResult.success ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {testResult.message}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Update' : 'Create'} Integration
              </>
            )}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>
          )}
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
