// =============================================
// Matrix V2 Page - Hybrid Visual + Table View
// Fast, efficient matrix visualization
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import HybridMatrixView from '@/components/matrix/HybridMatrixView';

export const metadata = {
  title: 'Matrix - Apex Affinity Group',
  description: 'View your matrix structure with hybrid visual and table view',
};

export default async function MatrixV2Page() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor record
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  return <HybridMatrixView distributorId={distributor.id} />;
}
