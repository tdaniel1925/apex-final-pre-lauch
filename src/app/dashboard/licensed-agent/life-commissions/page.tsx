// =============================================
// Life Insurance Commission Rates by Level - COMPLETE
// Shows ALL 35 life insurance products with search and filter
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import CommissionGrid from '@/components/licensed-agent/CommissionGrid';
import lifeData from '@/data/life-commissions.json';

export const metadata = {
  title: 'Life Insurance Commissions - Licensed Agent Tools',
  description: 'View all life insurance commission rates by agent level',
};

export default async function LifeCommissionsPage() {
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
  const { data: distributor} = await serviceClient
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

  const levels = ['Pre-Associate', 'Associate', 'Sr. Associate', 'Agent', 'Sr. Agent', 'MGA'];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Life Insurance Commission Rates</h1>
        <p className="text-sm text-gray-600 mt-2">
          Complete commission structure for all {lifeData.length} life insurance products
        </p>
      </div>

      {/* Commission Structure Overview */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 mb-6 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Agent Levels</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
          {levels.map((level, idx) => (
            <div key={level} className="bg-white p-3 rounded shadow-sm">
              <div className="font-bold text-green-600">{level}</div>
              <div className="text-xs text-gray-500 mt-1">Level {idx + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Searchable Commission Grid */}
      <CommissionGrid
        products={lifeData}
        levels={levels}
        type="life"
      />

      {/* Disclaimer */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Disclaimer:</span> Apex has made every reasonable effort to assure the accuracy of this information. However, we make no warranties or guarantees to the accuracy of this information. Apex is not responsible for outdated or inaccurate information. All managers viewing this information are responsible for verifying all information by whatever means necessary.
        </p>
      </div>

      {/* Download Section */}
      <div className="mt-4 text-center">
        <a
          href="/Apex Life Grid by levels (2).xlsx"
          download
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Excel Spreadsheet
        </a>
      </div>
    </div>
  );
}
