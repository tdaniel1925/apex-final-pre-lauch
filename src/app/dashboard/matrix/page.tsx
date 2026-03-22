// =============================================
// Rep Matrix Page - 5×7 Placement Matrix
// Interactive hierarchy canvas showing placement tree
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MatrixCanvasClient from './MatrixCanvasClient';

export const metadata = {
  title: 'Matrix - Apex Affinity Group',
  description: 'View your 5×7 placement matrix structure',
};

export default async function MatrixPage() {
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
    .select('id, matrix_depth')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  return <MatrixCanvasClient distributorId={distributor.id} />;
}
