// =============================================
// Dashboard Layout
// Includes sidebar navigation
// =============================================

import Sidebar from '@/components/dashboard/Sidebar';
import ComingSoonBanner from '@/components/agentpulse/ComingSoonBanner';
import Road500Banner from '@/components/dashboard/Road500Banner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 pt-14 md:pt-0 min-w-0">
        <ComingSoonBanner />
        <Road500Banner />
        {children}
      </main>
    </div>
  );
}
