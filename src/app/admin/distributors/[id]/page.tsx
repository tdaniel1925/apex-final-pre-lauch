// =============================================
// Admin Distributor Detail/Edit Page
// View and manage individual distributor
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { getDistributorById } from '@/lib/admin/distributor-service';
import { redirect } from 'next/navigation';
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

  const { id } = await params;
  const distributor = await getDistributorById(id);

  if (!distributor) {
    redirect('/admin/distributors');
  }

  return (
    <div className="p-8">
      <DistributorDetailView distributor={distributor} />
    </div>
  );
}
