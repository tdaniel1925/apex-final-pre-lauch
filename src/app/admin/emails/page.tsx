import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import EmailManagementSystem from '@/components/admin/EmailManagementSystem';

export const metadata: Metadata = {
  title: 'Email Management | Admin',
  description: 'Send and customize emails to distributors',
};

export default async function AdminEmailsPage() {
  const adminContext = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Send emails to distributors and customize email templates with AI assistance
          </p>
        </div>

        {/* Main Component */}
        <EmailManagementSystem adminId={adminContext.admin.id} />
      </div>
    </div>
  );
}
