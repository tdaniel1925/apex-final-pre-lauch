// ============================================================
// Social Media Content Library — Admin Dashboard
// Manage social media graphics and templates
// ============================================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import SocialContentManager from '@/components/admin/SocialContentManager';
import Link from 'next/link';

export const metadata = {
  title: 'Social Media Content — Admin',
};

export default async function SocialContentPage() {
  await requireAdmin();

  const serviceClient = createServiceClient();

  // Load all social content
  const { data: content } = await serviceClient
    .from('social_content')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 md:p-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Admin Dashboard
        </Link>
      </div>

      <SocialContentManager initialContent={content || []} />
    </div>
  );
}
