// =============================================
// Admin Activity Log Page
// =============================================

import { requireAdmin } from '@/lib/auth/admin';

export const metadata = {
  title: 'Activity Log — Apex Admin',
};

export default async function ActivityPage() {
  await requireAdmin();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-1">System-wide audit trail and user actions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Activity Log Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          A complete audit trail of all system actions is in development.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
          {[
            { label: 'Logins', desc: 'Distributor sign-in history' },
            { label: 'Profile Changes', desc: 'Updates to distributor profiles' },
            { label: 'Admin Actions', desc: 'All admin-level changes' },
            { label: 'Training Activity', desc: 'Episode plays and completions' },
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
