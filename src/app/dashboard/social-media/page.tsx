// ============================================================
// Social Media Hub — Distributor Dashboard
// Quick share section, marketing materials, and referral tools
// ============================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import Link from 'next/link';
import SocialShareCard from '@/components/dashboard/SocialShareCard';
import ReferralLinkGenerator from '@/components/dashboard/ReferralLinkGenerator';

export const metadata = {
  title: 'Social Media Tools — Apex Affinity Group',
};

// Pre-made social post templates
const SOCIAL_POST_TEMPLATES = [
  {
    id: 'welcome',
    title: 'Welcome Post',
    category: 'introduction',
    text: "Excited to announce I've joined Apex Affinity Group! I'm helping families and businesses protect what matters most with cutting-edge identity protection and data recovery solutions. Let's connect if you want to learn more about our Pulse products!",
    platforms: ['facebook', 'linkedin', 'twitter'],
  },
  {
    id: 'product-intro',
    title: 'Product Introduction',
    category: 'product',
    text: "Did you know that identity theft affects millions every year? That's why I'm proud to offer Pulse products from Apex Affinity Group - comprehensive protection for your digital life. From credit monitoring to data recovery, we've got you covered. Ask me how!",
    platforms: ['facebook', 'linkedin', 'instagram'],
  },
  {
    id: 'opportunity',
    title: 'Business Opportunity',
    category: 'recruiting',
    text: "Looking for a flexible way to earn income while helping people? I'm building a team with Apex Affinity Group. Our dual-ladder compensation plan rewards both sales and leadership. If you're motivated and people-focused, let's talk!",
    platforms: ['facebook', 'linkedin'],
  },
  {
    id: 'testimonial',
    title: 'Customer Success Story',
    category: 'testimonial',
    text: "Just helped another family secure their digital identity with PulseGuard! It's incredible to see the peace of mind our products provide. If you're concerned about identity theft, data breaches, or losing important files, reach out - I can help!",
    platforms: ['facebook', 'instagram', 'twitter'],
  },
];

// Marketing materials available for download
const MARKETING_MATERIALS = [
  {
    id: 'product-brochure',
    title: 'Product Brochure',
    description: 'Complete overview of all Pulse products with features and pricing',
    type: 'PDF',
    url: '#', // Placeholder
  },
  {
    id: 'comp-plan-overview',
    title: 'Compensation Plan Overview',
    description: 'Visual guide to the dual-ladder compensation structure',
    type: 'PDF',
    url: '#', // Placeholder
  },
  {
    id: 'business-presentation',
    title: 'Business Opportunity Presentation',
    description: 'Professional slides for recruiting presentations',
    type: 'PDF',
    url: '#', // Placeholder
  },
  {
    id: 'product-comparison',
    title: 'Product Comparison Chart',
    description: 'Side-by-side comparison of PulseGuard, PulseFlow, PulseDrive, and PulseCommand',
    type: 'PDF',
    url: '#', // Placeholder
  },
];

export default async function SocialMediaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const serviceClient = createServiceClient();

  // Get distributor info
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, slug, city, email')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) redirect('/login');

  // Generate referral link
  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://reachtheapex.net'}/${distributor.slug}`;
  const distributorName = `${distributor.first_name} ${distributor.last_name}`;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Social Media Tools</h1>
        <p className="text-slate-600">
          Pre-made content, marketing materials, and referral tools to grow your business
        </p>
      </div>

      {/* Quick Share Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Quick Share Posts</h2>
            <p className="text-sm text-slate-600 mt-1">
              Copy and customize these templates for your social media
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_POST_TEMPLATES.map((template) => (
            <SocialShareCard
              key={template.id}
              template={template}
              distributorName={distributorName}
              referralLink={referralLink}
            />
          ))}
        </div>
      </section>

      {/* Referral Link Generator */}
      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Your Referral Link</h2>
          <p className="text-sm text-slate-600 mt-1">
            Share your unique link to track signups and sales
          </p>
        </div>

        <ReferralLinkGenerator
          baseLink={referralLink}
          distributorSlug={distributor.slug}
          distributorName={distributorName}
        />
      </section>

      {/* Marketing Materials */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Marketing Materials</h2>
          <p className="text-sm text-slate-600 mt-1">
            Professional PDFs and resources for your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MARKETING_MATERIALS.map((material) => (
            <div
              key={material.id}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Document Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {material.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {material.description}
                      </p>
                    </div>
                    <span className="ml-4 px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                      {material.type}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </button>
                    <button className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Usage Tips */}
      <div className="mt-10 bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Best Practices</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-700">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Posting Strategy</h4>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Post 3-5 times per week for consistent engagement</li>
              <li>Mix content types (educational, personal stories, CTAs)</li>
              <li>Customize templates with your own voice and experience</li>
              <li>Always include your referral link in posts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Engagement Tips</h4>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Respond to comments within 24 hours</li>
              <li>Ask questions to encourage conversation</li>
              <li>Share authentic customer success stories</li>
              <li>Use relevant hashtags (3-5 per post maximum)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
