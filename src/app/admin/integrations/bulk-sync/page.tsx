// =============================================
// Bulk Sync Admin Tool
// Sync all distributors without replicated sites
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import BulkSyncClient from './BulkSyncClient';

export const metadata = {
  title: 'Bulk Sync Replicated Sites - Admin Portal',
};

export default async function BulkSyncPage() {
  await requireAdmin();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Sync Replicated Sites</h1>
        <p className="text-sm text-gray-600 mt-1">
          Create replicated sites for distributors who don't have them yet
        </p>
      </div>

      <BulkSyncClient />
    </div>
  );
}
