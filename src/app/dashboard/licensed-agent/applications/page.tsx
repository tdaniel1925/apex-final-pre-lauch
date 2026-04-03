// =============================================
// Submit Application - iGO Integration (iPipeline SAML SSO)
// Submit and track insurance applications via iPipeline iGO
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { IPipelineLauncher } from '@/components/integrations/IPipelineLauncher';

export const metadata = {
  title: 'Submit Application - Licensed Agent Tools',
  description: 'Submit and track insurance applications via iGO (iPipeline)',
};

export default async function SubmitApplicationPage() {
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
    .select('id, first_name, last_name, email, phone, is_licensed_agent')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  if (!distributor.is_licensed_agent) {
    redirect('/dashboard/licensed-agent');
  }

  // Prepare user data for iPipeline SSO
  const igoUser = {
    id: distributor.id,
    firstName: distributor.first_name,
    lastName: distributor.last_name,
    email: distributor.email,
    phone: distributor.phone,
  };

  return (
    <div className="p-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit Application</h1>
        <p className="text-sm text-gray-600 mt-1">
          Submit new insurance applications through the iGO platform (iPipeline)
        </p>
      </div>

      {/* iGO Integration Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 border-b border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">iGO Application Portal</h2>
              <p className="text-sm text-green-100 mt-1">Digital application submission system via iPipeline</p>
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="text-xs font-semibold text-white">SAML SSO Enabled</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Launch iGO Button */}
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">iGO Integration Active</span>
                      <br />
                      Click the button to launch iGO and submit applications digitally. Your profile will be automatically populated via secure SAML authentication.
                    </p>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <IPipelineLauncher
                  user={igoUser}
                  defaultProduct="igo"
                  variant="default"
                  size="lg"
                  buttonText="Launch iGO"
                />
              </div>
            </div>
          </div>

          {/* Application Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-sm font-semibold text-gray-900">Term Life</h3>
              </div>
              <p className="text-xs text-gray-500">Submit term life insurance applications with flexible coverage periods</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-2">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-sm font-semibold text-gray-900">Whole Life</h3>
              </div>
              <p className="text-xs text-gray-500">Permanent life insurance with cash value accumulation benefits</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 bg-orange-100 rounded-md p-2">
                  <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="ml-3 text-sm font-semibold text-gray-900">Universal Life</h3>
              </div>
              <p className="text-xs text-gray-500">Flexible premium permanent life insurance with investment options</p>
            </div>
          </div>
        </div>
      </div>

      {/* iPipeline Products Quick Access */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">iPipeline Tools</h2>
          <p className="text-xs text-gray-500 mt-1">Additional iPipeline products available to you</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">LifePipe</h3>
                <p className="text-xs text-gray-500 mt-1">Life insurance quoting and comparison tool</p>
              </div>
              <IPipelineLauncher
                user={igoUser}
                defaultProduct="lifepipe"
                variant="outline"
                size="sm"
                buttonText="Launch"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">XRAE</h3>
                <p className="text-xs text-gray-500 mt-1">Annuity illustration and sales tool</p>
              </div>
              <IPipelineLauncher
                user={igoUser}
                defaultProduct="xrae"
                variant="outline"
                size="sm"
                buttonText="Launch"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">FormsPipe</h3>
                <p className="text-xs text-gray-500 mt-1">Digital forms library and e-signature</p>
              </div>
              <IPipelineLauncher
                user={igoUser}
                defaultProduct="formspipe"
                variant="outline"
                size="sm"
                buttonText="Launch"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Product Information</h3>
                <p className="text-xs text-gray-500 mt-1">Carrier product details and rates</p>
              </div>
              <IPipelineLauncher
                user={igoUser}
                defaultProduct="productinfo"
                variant="outline"
                size="sm"
                buttonText="Launch"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
