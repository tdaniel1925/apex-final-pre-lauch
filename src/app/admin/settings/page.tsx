// =============================================
// Admin Settings Page
// =============================================

import { requireAdmin } from '@/lib/auth/admin';

export const metadata = {
  title: 'Settings — Apex Admin',
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">System configuration and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Settings Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          System-wide configuration options are in development.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
          {[
            { label: 'Branding', desc: 'Logo, colors, and site name' },
            { label: 'Email Config', desc: 'SMTP and sender settings' },
            { label: 'Matrix Rules', desc: 'Spillover and placement logic' },
            { label: 'API Keys', desc: 'Manage third-party integrations' },
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
