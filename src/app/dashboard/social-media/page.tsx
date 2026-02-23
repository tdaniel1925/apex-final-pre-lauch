// ============================================================
// Social Media Hub — Distributor Dashboard
// Access pre-made content and download for social sharing
// ============================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import SocialMediaHub from '@/components/dashboard/SocialMediaHub';
import Link from 'next/link';

export const metadata = {
  title: 'Social Media Content — Apex Affinity Group',
};

export default async function SocialMediaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const serviceClient = createServiceClient();

  // Get distributor info
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, slug, city')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) redirect('/login');

  // Load active social content
  const { data: content } = await serviceClient
    .from('social_content')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

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

      <SocialMediaHub content={content || []} distributor={distributor} />
    </div>
  );
}
