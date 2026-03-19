// =============================================
// Dashboard Layout
// Includes sidebar navigation
// =============================================

import Sidebar from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Sidebar />
      <main className="flex-1 pt-14 md:pt-0 min-w-0">
        {children}
      </main>
    </div>
  );
}
