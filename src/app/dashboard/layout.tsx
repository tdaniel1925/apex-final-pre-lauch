// =============================================
// Dashboard Layout
// Includes sidebar navigation and AI chat
// =============================================

import Sidebar from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user's licensed agent status server-side to avoid RLS 403 errors
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isLicensedAgent = true; // Default true

  if (user) {
    const serviceClient = createServiceClient();
    const { data: distributor } = await serviceClient
      .from('distributors')
      .select('is_licensed_agent')
      .eq('auth_user_id', user.id)
      .single();

    if (distributor) {
      isLicensedAgent = distributor.is_licensed_agent ?? true;
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Sidebar isLicensedAgent={isLicensedAgent} />
      <main className="flex-1 pt-14 md:pt-0 min-w-0">
        {children}
      </main>
    </div>
  );
}
