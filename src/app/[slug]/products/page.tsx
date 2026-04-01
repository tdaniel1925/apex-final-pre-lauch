import { notFound, redirect } from 'next/navigation';
import { validateDistributorSlug, getDistributorIdBySlug } from '@/lib/referral-tracking';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ReferralProductsPage({ params }: PageProps) {
  const { slug } = await params;

  // Validate the distributor slug
  const isValid = await validateDistributorSlug(slug);

  if (!isValid) {
    // Invalid slug - redirect to main products page
    notFound();
  }

  // Get distributor info for URL params
  const supabase = await createClient();
  const { data: distributor } = await supabase
    .from('distributors')
    .select('first_name, last_name')
    .eq('slug', slug)
    .single();

  // Redirect to main products page with distributor info
  // The referrer cookie was already set by middleware
  if (distributor) {
    redirect(`/products?from=${encodeURIComponent(distributor.first_name + ' ' + distributor.last_name)}`);
  } else {
    redirect('/products');
  }
}
