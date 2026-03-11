// =============================================
// Matrix V4 - Shadcn/ui Modern Design
// Professional matrix view with shadcn components
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';
import DashboardClient from '@/components/dashboard/DashboardClient';
import Road500Banner from '@/components/dashboard/Road500Banner';
import MatrixV4Client from '@/components/dashboard/MatrixV4Client';

export const metadata = {
  title: 'Matrix View - Apex Affinity Group',
  description: '5×7 Matrix placement view',
};

export const revalidate = 60;

export default async function MatrixV4Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const serviceClient = createServiceClient();
  const { data: distributor, error } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (error || !distributor) redirect('/signup');

  const dist = distributor as Distributor;

  const [matrixParentData, sponsorData, matrixChildrenData] = await Promise.all([
    dist.matrix_parent_id
      ? serviceClient
          .from('distributors')
          .select('id, first_name, last_name, slug, matrix_depth, rep_number')
          .eq('id', dist.matrix_parent_id)
          .single()
      : Promise.resolve({ data: null }),

    dist.sponsor_id
      ? serviceClient
          .from('distributors')
          .select('first_name, last_name')
          .eq('id', dist.sponsor_id)
          .single()
      : Promise.resolve({ data: null }),

    serviceClient
      .from('distributors')
      .select('id, first_name, last_name, matrix_position, matrix_depth, created_at, licensing_status')
      .eq('matrix_parent_id', dist.id)
      .order('matrix_position', { ascending: true }),
  ]);

  const matrixParent = matrixParentData.data;
  const sponsor = sponsorData.data ? `${sponsorData.data.first_name} ${sponsorData.data.last_name}` : 'None';
  const matrixChildren = (matrixChildrenData.data || []) as Distributor[];

  const matrixData = {
    distributor: dist,
    matrixParent: matrixParent ? {
      name: `${matrixParent.first_name} ${matrixParent.last_name}`,
      repNumber: matrixParent.rep_number,
      level: matrixParent.matrix_depth,
    } : null,
    sponsor,
    matrixChildren,
  };

  return (
    <DashboardClient distributor={dist}>
      <Road500Banner />
      <MatrixV4Client data={matrixData} />
    </DashboardClient>
  );
}
