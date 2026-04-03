// =============================================
// Add New Lead Page
// Business Center Feature-Gated
// =============================================

import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import FeatureGate from '@/components/dashboard/FeatureGate';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';
import NewLeadForm from '@/components/crm/NewLeadForm';

export const metadata: Metadata = {
  title: 'Add Lead | CRM | Apex Affinity Group',
  description: 'Add a new lead',
};

export default async function NewLeadPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Check Business Center access
  const bcStatus = await checkBusinessCenterSubscription(currentUser.id);

  return (
    <FeatureGate
      featurePath="/dashboard/crm/leads/new"
      hasAccess={bcStatus.hasSubscription}
      daysWithout={bcStatus.daysWithout}
    >
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Lead</h1>
            <p className="text-slate-600">Create a new lead in your CRM</p>
          </div>

          <NewLeadForm distributorId={currentUser.id} />
        </div>
      </div>
    </FeatureGate>
  );
}
