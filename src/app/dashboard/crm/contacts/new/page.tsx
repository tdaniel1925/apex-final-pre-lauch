// =============================================
// Add New Contact Page
// Business Center Feature-Gated
// =============================================

import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import FeatureGate from '@/components/dashboard/FeatureGate';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';

export const metadata: Metadata = {
  title: 'Add Contact | CRM | Apex Affinity Group',
  description: 'Add a new contact',
};

export default async function NewContactPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Check Business Center access
  const bcStatus = await checkBusinessCenterSubscription(currentUser.id);

  return (
    <FeatureGate
      featurePath="/dashboard/crm/contacts/new"
      hasAccess={bcStatus.hasSubscription}
      daysWithout={bcStatus.daysWithout}
    >
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Contact</h1>
            <p className="text-slate-600">Create a new contact in your CRM</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h3>
              <p className="text-slate-600 mb-6">
                Contact creation form is under development
              </p>
              <a
                href="/dashboard/crm/contacts"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Back to Contacts
              </a>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
