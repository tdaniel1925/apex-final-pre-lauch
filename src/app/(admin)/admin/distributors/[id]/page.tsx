// =============================================
// Admin - Distributor Detail Page
// Comprehensive view of a single distributor
// =============================================

import { requireAdmin, getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { notFound } from 'next/navigation';
import DistributorDetailView from '@/components/admin/DistributorDetailView';

export const metadata = {
  title: 'Distributor Details - Admin Portal',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DistributorDetailPage({ params }: PageProps) {
  await requireAdmin();

  // Get admin user for role
  const adminUser = await getAdminUser();
  if (!adminUser) {
    notFound();
  }

  const { id } = await params;
  const serviceClient = createServiceClient();

  // Fetch distributor
  const { data: distributor, error } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !distributor) {
    notFound();
  }

  return (
    <DistributorDetailView
      distributor={distributor}
      currentAdminRole={adminUser.admin.role}
    />
  );
}
