// ============================================================
// Business Cards — Rep Dashboard
// Order custom Apex business cards via Printful
// ============================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import BusinessCardOrder from '@/components/dashboard/BusinessCardOrder';

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Cards</h1>
        <p className="text-sm text-gray-500 mt-1">
          Order professional Apex-branded business cards printed and shipped directly to you.
        </p>
      </div>

      <BusinessCardOrder distributor={distributor} />
    </div>
  );
}
