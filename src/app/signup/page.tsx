// =============================================
// Signup Page
// Handles distributor registration
// =============================================

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import SignupForm from '@/components/forms/SignupForm';

interface SignupPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export const metadata = {
  title: 'Join Apex Affinity Group',
  description: 'Join the premier insurance marketing organization',
};

async function SignupContent({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const sponsorSlug = params.ref;

  let sponsorName: string | undefined;

  // If referral link provided, look up sponsor
  if (sponsorSlug) {
    const supabase = await createClient();
    const { data: sponsor } = await supabase
      .from('distributors')
      .select('first_name, last_name')
      .eq('slug', sponsorSlug)
      .single();

    if (sponsor) {
      sponsorName = `${sponsor.first_name} ${sponsor.last_name}`;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/apex-logo.png"
            alt="Apex Affinity Group"
            className="h-24 w-auto"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Apex Affinity Group
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create your account and start building your insurance career with the premier
            marketing organization.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <SignupForm sponsorSlug={sponsorSlug} sponsorName={sponsorName} />
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By joining, you agree to our{' '}
            <a href="/terms" className="text-[#2B4C7E] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-[#2B4C7E] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function SignupPage(props: SignupPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2B4C7E] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupContent {...props} />
    </Suspense>
  );
}
