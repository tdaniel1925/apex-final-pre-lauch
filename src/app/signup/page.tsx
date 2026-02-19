// =============================================
// Signup Page
// Shows waitlist screen until launch date,
// then shows the real signup form
// =============================================

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import SignupForm from '@/components/forms/SignupForm';
import WaitlistScreen from '@/components/waitlist/WaitlistScreen';

// Monday February 23, 2026 at 9:00 PM Eastern = Feb 24 02:00 UTC
const LAUNCH_DATE = new Date('2026-02-24T02:00:00Z');

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

  // Show waitlist screen until launch date
  const isBeforeLaunch = new Date() < LAUNCH_DATE;

  if (isBeforeLaunch) {
    return (
      <WaitlistScreen sponsorSlug={sponsorSlug} sponsorName={sponsorName} />
    );
  }

  // After launch — show real signup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <img src="/apex-logo.png" alt="Apex Affinity Group" className="h-24 w-auto" />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Apex Affinity Group
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create your account and start building your insurance career with the premier
            marketing organization.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <SignupForm sponsorSlug={sponsorSlug} sponsorName={sponsorName} />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By joining, you agree to our{' '}
            <a href="/terms" className="text-[#2B4C7E] hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" className="text-[#2B4C7E] hover:underline">Privacy Policy</a>
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
        <div className="min-h-screen flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a2f50 0%, #2B4C7E 50%, #1a3a6b 100%)' }}
        >
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupContent {...props} />
    </Suspense>
  );
}
