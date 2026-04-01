import { notFound, redirect } from 'next/navigation';
import { validateDistributorSlug } from '@/lib/referral-tracking';

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

  // Redirect to the main products page
  // The referrer cookie was already set by middleware
  redirect('/products');
}
