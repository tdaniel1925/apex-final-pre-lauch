// ============================================================
// Business Cards — Rep Dashboard
// Professional card designer with live preview
// ============================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import BusinessCardDesigner from '@/components/dashboard/BusinessCardDesigner';
import Link from 'next/link';

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

  // Load active templates from database
  const { data: templates } = await serviceClient
    .from('business_card_templates')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div className="p-4 md:p-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Card Designer</h1>
        <p className="text-gray-600">
          Create professional Apex-branded business cards with our live designer
        </p>
      </div>

      <BusinessCardDesigner
        distributor={distributor}
        templates={templates || []}
      />
    </div>
  );
}
