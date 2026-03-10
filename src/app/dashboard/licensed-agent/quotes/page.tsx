// =============================================
// Get Quotes - Winflex SSO Integration
// Generate insurance quotes through Winflex platform
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import WinflexSSOButton from '@/components/licensed-agent/WinflexSSOButton';

export const metadata = {
  title: 'Get Quotes - Licensed Agent Tools',
  description: 'Generate insurance quotes via Winflex SSO',
};

export default async function GetQuotesPage() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor and check license status
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, is_licensed_agent')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  if (!distributor.is_licensed_agent) {
    redirect('/dashboard/licensed-agent');
  }

  return (
    <div className="p-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Get Quotes</h1>
        <p className="text-sm text-gray-600 mt-1">
          Generate life insurance quotes through the Winflex platform
        </p>
      </div>

      {/* Winflex SSO Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Winflex Quote Engine</h2>
              <p className="text-sm text-blue-100 mt-1">Secure single sign-on to Winflex</p>
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="text-xs font-semibold text-white">SSO Enabled</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* SSO Launch Button */}
          <div className="mb-6">
            <WinflexSSOButton />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Instant Quotes</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Get real-time quotes from multiple carriers with just a few clicks
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Secure SSO</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Single sign-on ensures secure access without managing multiple passwords
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Multi-Carrier Comparison</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Compare rates and coverage from leading insurance carriers side-by-side
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Quote History</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Access and manage all your previous quotes in one centralized location
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How Winflex SSO Works
            </h3>
            <ol className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-semibold text-xs">1</span>
                <span>Click the "Launch Winflex Quote Engine" button above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-semibold text-xs">2</span>
                <span>Winflex will open in a new window with automatic single sign-on</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-semibold text-xs">3</span>
                <span>If it&apos;s your first time, you may need to complete a quick registration (your info will be pre-filled)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-semibold text-xs">4</span>
                <span>Generate quotes from multiple carriers and save your work</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-semibold text-xs">5</span>
                <span>Return to this page anytime - you&apos;ll stay logged in to Winflex</span>
              </li>
            </ol>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-xs text-gray-600">
              For questions about Winflex SSO integration or quote generation, please contact your administrator or support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
