// =============================================
// Admin Reports Page
// =============================================

import { requireAdmin } from '@/lib/auth/admin';

export const metadata = {
  title: 'Reports — Apex Admin',
};

export default async function ReportsPage() {
  await requireAdmin();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Analytics and performance insights</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Reports Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Detailed analytics and exportable reports are in development.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
          {[
            { label: 'Signup Reports', desc: 'New distributor trends over time' },
            { label: 'Training Reports', desc: 'Episode listens and completion rates' },
            { label: 'Network Reports', desc: 'Matrix growth and depth analysis' },
            { label: 'Commission Reports', desc: 'Payout summaries and projections' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-700">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
