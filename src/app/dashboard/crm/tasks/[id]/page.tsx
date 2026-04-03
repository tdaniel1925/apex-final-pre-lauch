// =============================================
// Task Detail Page
// Business Center Feature-Gated
// =============================================

import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import FeatureGate from '@/components/dashboard/FeatureGate';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';
import ViewEditTaskForm from '@/components/crm/ViewEditTaskForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Task Details | CRM | Apex Affinity Group',
  description: 'View and edit task details',
};

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Check Business Center access
  const bcStatus = await checkBusinessCenterSubscription(currentUser.id);

  return (
    <FeatureGate
      featurePath="/dashboard/crm/tasks"
      hasAccess={bcStatus.hasSubscription}
      daysWithout={bcStatus.daysWithout}
    >
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href="/dashboard/crm/tasks"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tasks
            </Link>
          </div>

          <ViewEditTaskForm taskId={params.id} distributorId={currentUser.id} />
        </div>
      </div>
    </FeatureGate>
  );
}
