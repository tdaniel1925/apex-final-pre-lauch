// =============================================
// Marketing Materials
// Approved marketing assets and resources for licensed agents
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Marketing Materials - Licensed Agent Tools',
  description: 'Access approved marketing materials and resources',
};

export default async function MarketingMaterialsPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Marketing Materials</h1>
        <p className="text-sm text-gray-600 mt-1">
          Access compliance-approved marketing assets and resources for your business
        </p>
      </div>

      {/* Compliance Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Compliance Reminder</h3>
            <div className="mt-1 text-sm text-yellow-700">
              <p>All marketing materials provided have been pre-approved for compliance. Any modifications to these materials must be reviewed and approved before use.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Material Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Brochures & Flyers */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="ml-2 text-sm font-semibold text-white">Brochures & Flyers</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600 mb-3">Print-ready product brochures and marketing flyers</p>
            <p className="text-sm font-semibold text-blue-600">-- items available</p>
          </div>
        </div>

        {/* Digital Assets */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="ml-2 text-sm font-semibold text-white">Digital Assets</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600 mb-3">Social media graphics, email templates, and web banners</p>
            <p className="text-sm font-semibold text-purple-600">-- items available</p>
          </div>
        </div>

        {/* Presentations */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <h3 className="ml-2 text-sm font-semibold text-white">Presentations</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600 mb-3">PowerPoint decks and client presentation materials</p>
            <p className="text-sm font-semibold text-green-600">-- items available</p>
          </div>
        </div>

        {/* Video Content */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="ml-2 text-sm font-semibold text-white">Video Content</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600 mb-3">Product explainer videos and testimonials</p>
            <p className="text-sm font-semibold text-red-600">-- items available</p>
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="ml-2 text-sm font-semibold text-white">Email Templates</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600 mb-3">Pre-written email campaigns and follow-up sequences</p>
            <p className="text-sm font-semibold text-yellow-600">-- items available</p>
          </div>
        </div>

        {/* Sales Scripts */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="ml-2 text-sm font-semibold text-white">Sales Scripts</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600 mb-3">Proven conversation starters and objection handlers</p>
            <p className="text-sm font-semibold text-indigo-600">-- items available</p>
          </div>
        </div>
      </div>

      {/* Asset Library */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Asset Library</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search materials..."
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-sm font-medium">Marketing Asset Library Coming Soon</p>
            <p className="text-xs text-gray-400 mt-1 mb-6">Access hundreds of compliance-approved marketing materials to grow your business</p>
            <div className="max-w-md mx-auto text-left">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">What You'll Get:</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Downloadable PDFs, images, and videos
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Customizable templates with your branding
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Social media post templates and scheduling
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Usage tracking and analytics
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Regular updates with new content
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
