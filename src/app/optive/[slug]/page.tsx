// =============================================
// Optive Template - Replicated Website
// EXACT copy of Optive Business Consulting template
// with flag video + distributor personalization
// =============================================

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Distributor } from '@/lib/types';
import OptiveReplicatedSite from '@/components/optive/OptiveReplicatedSite';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  // Reserved slugs
  const RESERVED_SLUGS = [
    'api', 'admin', 'dashboard', 'login', 'signup', 'join',
    'about', 'contact', 'terms', 'privacy', '_next', 'favicon.ico',
  ];

  if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
    return { title: 'Apex Affinity Group' };
  }

  const supabase = await createClient();
  const { data: distributor } = await supabase
    .from('distributors')
    .select('first_name, last_name, company_name')
    .eq('slug', slug)
    .single();

  if (distributor) {
    return {
      title: `Join ${distributor.first_name} ${distributor.last_name}'s Team - Apex Affinity Group`,
      description: `Build your insurance business with ${distributor.first_name} ${distributor.last_name}. Start earning immediately with ancillary products, then scale to full insurance sales.`,
    };
  }

  return {
    title: 'Join Apex Affinity Group',
    description: 'Build your insurance business with Apex Affinity Group',
  };
}

export default async function OptiveDistributorPage({ params }: PageProps) {
  const { slug } = await params;

  // Reserved routes - redirect
  const RESERVED_ROUTES: Record<string, string> = {
    api: '/api',
    admin: '/admin',
    dashboard: '/dashboard',
    login: '/login',
    signup: '/signup',
    join: '/signup',
  };

  if (RESERVED_ROUTES[slug.toLowerCase()]) {
    redirect(RESERVED_ROUTES[slug.toLowerCase()]);
  }

  // Look up distributor
  const supabase = await createClient();
  const { data: distributor, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('slug', slug)
    .single();

  // If not found, show 404
  if (error || !distributor) {
    notFound();
  }

  const dist = distributor as Distributor;

  // If suspended/deleted, show message
  if (dist.status === 'suspended' || dist.status === 'deleted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Available</h1>
          <p className="text-gray-600 mb-6">This distributor page is currently unavailable.</p>
          <a
            href="/signup"
            className="inline-block px-6 py-3 bg-[#2B4C7E] text-white rounded-lg hover:bg-[#1a2c4e]"
          >
            Join Apex Affinity Group
          </a>
        </div>
      </div>
    );
  }

  // Render Optive template
  return <OptiveReplicatedSite distributor={dist} />;
}
