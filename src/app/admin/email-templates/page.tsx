// =============================================
// Email Templates Admin Page
// Manage email nurture campaign templates
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import EmailTemplatesManager from '@/components/admin/EmailTemplatesManager';

export const metadata = {
  title: 'Email Templates - Admin Portal',
  description: 'Manage email nurture campaign templates',
};

export default async function EmailTemplatesPage() {
  await requireAdmin();

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage nurture campaign email templates with AI-powered generation
        </p>
      </div>

      <EmailTemplatesManager />
    </div>
  );
}
