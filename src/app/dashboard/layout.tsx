// =============================================
// Dashboard Layout
// Includes sidebar navigation
// =============================================

import Sidebar from '@/components/dashboard/Sidebar';
import ComingSoonBanner from '@/components/agentpulse/ComingSoonBanner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <ComingSoonBanner />
        {children}
      </main>
    </div>
  );
}
