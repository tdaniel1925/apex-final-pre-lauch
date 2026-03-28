'use client';

// =============================================
// Dashboard Switcher Component
// Toggle between Classic Dashboard and AI Command Center
// Glass effect with localStorage preference
// =============================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSwitcher() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isV2 = pathname?.includes('/dashboard-v2');

  useEffect(() => {
    setMounted(true);
    // Save current dashboard preference
    if (pathname) {
      localStorage.setItem('preferred-dashboard', isV2 ? 'v2' : 'classic');
    }
  }, [pathname, isV2]);

  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Link
        href={isV2 ? '/dashboard' : '/dashboard-v2'}
        className="
          group flex items-center gap-2 px-4 py-2 rounded-lg
          bg-white/90 dark:bg-gray-800/90 backdrop-blur-md
          border border-gray-200 dark:border-gray-700
          hover:bg-white dark:hover:bg-gray-800
          hover:border-gray-300 dark:hover:border-gray-600
          shadow-lg shadow-gray-200/50 dark:shadow-black/20
          transition-all duration-200
          text-gray-900 dark:text-white font-medium text-sm
        "
      >
        {isV2 ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden md:inline">Classic Dashboard</span>
            <span className="md:hidden">Classic</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="hidden md:inline">AI Command Center</span>
            <span className="md:hidden">AI Dashboard</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">
              NEW
            </span>
          </>
        )}
      </Link>
    </div>
  );
}
