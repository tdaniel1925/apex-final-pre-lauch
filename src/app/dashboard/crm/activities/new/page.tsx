// =============================================
// Log New Activity Page
// Business Center Feature-Gated
// =============================================

import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import FeatureGate from '@/components/dashboard/FeatureGate';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';
import NewActivityForm from '@/components/crm/NewActivityForm';

export const metadata: Metadata = {
  title: 'Log Activity | CRM | Apex Affinity Group',
  description: 'Log a new customer activity',
};

export default async function NewActivityPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Check Business Center access
  const bcStatus = await checkBusinessCenterSubscription(currentUser.id);

  return (
    <FeatureGate
      featurePath="/dashboard/crm/activities/new"
      hasAccess={bcStatus.hasSubscription}
      daysWithout={bcStatus.daysWithout}
    >
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Log New Activity</h1>
            <p className="text-slate-600">Record a customer interaction</p>
          </div>

          <NewActivityForm distributorId={currentUser.id} />
        </div>
      </div>
    </FeatureGate>
  );
}
