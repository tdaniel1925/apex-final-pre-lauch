// ============================================================
// Business Cards — Rep Dashboard
// Professional card designer with live preview
// ============================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import BusinessCardDesigner from '@/components/dashboard/BusinessCardDesigner';

export const metadata = {
  title: 'Business Cards — Apex Affinity Group',
};

export default async function BusinessCardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, email, phone, slug')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) redirect('/login');

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Card Designer</h1>
        <p className="text-gray-600">
          Create professional Apex-branded business cards with our live designer
        </p>
      </div>

      <BusinessCardDesigner distributor={distributor} />
    </div>
  );
}
