// =============================================
// New Integration Page
// Create a new platform integration
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import IntegrationForm from '@/components/admin/IntegrationForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'New Integration - Admin - Apex Affinity Group',
  description: 'Add a new platform integration',
};

export default async function NewIntegrationPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/admin/integrations"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Integrations
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Add New Integration</h1>
          <p className="text-slate-600 mt-1">
            Configure a new external platform integration
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
          <IntegrationForm />
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Integration Setup Guide
          </h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>
              <strong>Platform Name:</strong> Use lowercase, no spaces (e.g., "jordyn", "agentpulse")
            </li>
            <li>
              <strong>API Credentials:</strong> Get these from your platform's API settings or developer console
            </li>
            <li>
              <strong>Webhook Secret:</strong> Generate a random secret if the platform supports webhook verification
            </li>
            <li>
              <strong>API Endpoint:</strong> The base URL for API calls (e.g., https://api.jordyn.app)
            </li>
            <li>
              <strong>After saving:</strong> Configure the webhook URL in your external platform's settings
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
