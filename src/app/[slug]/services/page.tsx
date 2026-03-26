// =============================================
// Rep Services Page (With Add to Cart Buttons)
// URL: /{slug}/services
// Sets rep attribution cookie and shows purchase buttons
// =============================================

import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import ServicePageClient from '@/components/services/ServicePageClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: distributor } = await supabase
    .from('distributors')
    .select('first_name, last_name')
    .eq('slug', slug)
    .single();

  if (distributor) {
    return {
      title: `Services - ${distributor.first_name} ${distributor.last_name} | Apex`,
      description: `Explore AI-powered insurance tools with ${distributor.first_name} ${distributor.last_name}`,
    };
  }

  return {
    title: 'Services - Apex Affinity Group',
    description: 'AI-powered tools for insurance professionals',
  };
}

export default async function RepServicesPage({ params }: PageProps) {
  const { slug } = await params;

  // Reserved slugs
  const RESERVED_ROUTES: Record<string, string> = {
    api: '/api',
    admin: '/admin',
    dashboard: '/dashboard',
    login: '/login',
    signup: '/signup',
    join: '/signup',
    services: '/services', // Redirect to public page
  };

  if (RESERVED_ROUTES[slug.toLowerCase()]) {
    redirect(RESERVED_ROUTES[slug.toLowerCase()]);
  }

  const supabase = await createClient();

  // Look up distributor
  const { data: distributor, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, email, phone, status')
    .eq('slug', slug)
    .single();

  if (error || !distributor) {
    notFound();
  }

  // If distributor is suspended or deleted, show message
  if (distributor.status === 'suspended' || distributor.status === 'deleted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Available</h1>
          <p className="text-gray-600 mb-6">This distributor page is currently unavailable.</p>
          <a href="/services" className="text-[#2B4C7E] hover:underline">
            View services
          </a>
        </div>
      </div>
    );
  }

  // Set rep attribution cookie (30 days)
  const cookieStore = await cookies();
  cookieStore.set('rep_attribution', slug, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  // Get active products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  return (
    <ServicePageClient
      products={products || []}
      distributor={{
        id: distributor.id,
        name: `${distributor.first_name} ${distributor.last_name}`,
        slug: distributor.slug,
        email: distributor.email,
        phone: distributor.phone,
      }}
    />
  );
}
