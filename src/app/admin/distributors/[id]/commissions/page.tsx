// =============================================
// Admin Commission Detail Page
// View and analyze distributor commissions
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CommissionDetailView from '@/components/admin/CommissionDetailView';

export const metadata = {
  title: 'Commission Details - Admin Portal',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CommissionDetailPage({ params }: PageProps) {
  const adminContext = await requireAdmin();
  const supabase = await createClient();

  const { id } = await params;

  // Fetch distributor details
  const { data: distributor, error: distributorError } = await supabase
    .from('distributors')
    .select(`
      *,
      member:members!members_distributor_id_fkey (
        personal_credits_monthly,
        team_credits_monthly,
        tech_rank,
        insurance_rank
      )
    `)
    .eq('id', id)
    .single();

  if (distributorError || !distributor) {
    redirect('/admin/distributors');
  }

  return (
    <div className="p-4">
      <CommissionDetailView
        distributor={distributor}
        currentAdminRole={adminContext.admin.role}
      />
    </div>
  );
}
