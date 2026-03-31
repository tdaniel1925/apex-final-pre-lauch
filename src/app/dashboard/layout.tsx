// =============================================
// Dashboard Layout
// Includes sidebar navigation, AI chat, and Business Center nag
// =============================================

import Sidebar from '@/components/dashboard/Sidebar';
import BusinessCenterNag from '@/components/dashboard/BusinessCenterNag';
import { Toaster } from 'sonner';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user's licensed agent status server-side to avoid RLS 403 errors
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // CRITICAL: Redirect if not authenticated
  if (!user) {
    redirect('/login');
  }

  let isLicensedAgent = true; // Default true
  let distributorId: string | null = null;
  let businessCenterStatus: Awaited<ReturnType<typeof checkBusinessCenterSubscription>> | null = null;

  if (user) {
    const serviceClient = createServiceClient();
    const { data: distributor } = await serviceClient
      .from('distributors')
      .select('id, is_licensed_agent')
      .eq('auth_user_id', user.id)
      .single();

    if (distributor) {
      isLicensedAgent = distributor.is_licensed_agent ?? true;
      distributorId = distributor.id;

      // Check Business Center subscription status
      businessCenterStatus = await checkBusinessCenterSubscription(distributor.id);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Sidebar isLicensedAgent={isLicensedAgent} />
      <main className="flex-1 pt-14 md:pt-0 min-w-0">
        {/* Business Center Nag (Banner or Modal) */}
        {businessCenterStatus && businessCenterStatus.nagLevel !== 'none' && distributorId && (
          <BusinessCenterNag
            nagLevel={businessCenterStatus.nagLevel}
            daysWithout={businessCenterStatus.daysWithout}
            distributorId={distributorId}
          />
        )}
        {children}
      </main>
    </div>
  );
}
