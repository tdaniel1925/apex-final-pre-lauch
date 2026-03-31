import { notFound, redirect } from 'next/navigation';
import { validateDistributorSlug, trackReferral } from '@/lib/referral-tracking';

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

  // Track the referral (sets cookie)
  const result = await trackReferral(slug);

  if (!result.success) {
    console.error('Failed to track referral:', result.error);
    notFound();
  }

  // Redirect to the main products page
  // The referrer cookie is now set and will be used during checkout
  redirect('/products');
}
