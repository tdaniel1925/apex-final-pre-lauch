// =============================================
// Admin Commissions Page
// =============================================

import { requireAdmin } from '@/lib/auth/admin';

export const metadata = {
  title: 'Commissions — Apex Admin',
};

export default async function CommissionsPage() {
  await requireAdmin();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage distributor payouts</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Commissions Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Commission tracking, override calculations, and payout management are in development.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
          {[
            { label: 'Override Tracking', desc: 'Matrix-based commission overrides' },
            { label: 'Payout History', desc: 'Record of all distributor payouts' },
            { label: 'Pending Payouts', desc: 'Commissions awaiting processing' },
            { label: 'Payout Rules', desc: 'Configure commission percentages' },
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
