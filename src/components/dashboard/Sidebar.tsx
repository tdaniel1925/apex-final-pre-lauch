'use client';

// =============================================
// Dashboard Sidebar Navigation
// Desktop: fixed left sidebar
// Mobile: top bar + slide-in drawer
// =============================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from '@/app/actions/auth';
import AgentPulseSidebarBanner from '@/components/agentpulse/AgentPulseSidebarBanner';

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'My Team',
      href: '/dashboard/team',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: 'Matrix',
      href: '/dashboard/matrix',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Compensation Plan',
      href: '/dashboard/compensation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'Training',
      href: '/dashboard/training',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      name: 'Business Cards',
      href: '/dashboard/business-cards',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      name: 'Social Media',
      href: '/dashboard/social-media',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-[#2B4C7E] text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="w-4 h-4">{item.icon}</div>
                <span className="font-medium text-xs">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Apps Section */}
        <div className="mt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-1.5">Apps</p>
          <nav className="space-y-0.5">
          <Link
            href="/dashboard/apps/leadloop"
            onClick={onNavigate}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              pathname.startsWith('/dashboard/apps/leadloop')
                ? 'bg-[#2B4C7E] text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="w-4 h-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <span className="font-medium text-xs">LeadLoop</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">Demo</span>
          </Link>
          <Link
            href="/dashboard/apps/pulsefollow"
            onClick={onNavigate}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              pathname.startsWith('/dashboard/apps/pulsefollow')
                ? 'bg-[#2B4C7E] text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="w-4 h-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="font-medium text-xs">PulseFollow</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">AI</span>
          </Link>
          <Link
            href="/dashboard/apps/policyping"
            onClick={onNavigate}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              pathname.startsWith('/dashboard/apps/policyping')
                ? 'bg-[#2B4C7E] text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="w-4 h-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="font-medium text-xs">PolicyPing</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">Demo</span>
          </Link>
          <Link
            href="/dashboard/apps/nurture"
            onClick={onNavigate}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              pathname.startsWith('/dashboard/apps/nurture')
                ? 'bg-[#2B4C7E] text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="w-4 h-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium text-xs">Nurture</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-bold">AI</span>
          </Link>
        </nav>
        </div>
      </div>

      {/* AgentPulse Banner */}
      <AgentPulseSidebarBanner />

      {/* Sticky Sign Out Button */}
      <div className="flex-shrink-0 pt-3 border-t border-gray-800 bg-gray-900">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium text-xs">Sign Out</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex w-52 bg-gray-900 text-white min-h-screen flex-col shrink-0">
        <div className="p-3">
          <img src="/apex-logo-white.png" alt="Apex Affinity Group" className="h-14 w-auto mx-auto mb-4" />
        </div>
        <div className="flex flex-col flex-1 px-3 pb-3 overflow-hidden">
          <NavLinks />
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-gray-900 flex items-center justify-between px-4 shadow-lg">
        <img src="/apex-logo-white.png" alt="Apex Affinity Group" className="h-8 w-auto" />
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-1.5 rounded-md hover:bg-gray-800 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ===== MOBILE DRAWER OVERLAY ===== */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-64 bg-gray-900 text-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-3 mb-4">
              <img src="/apex-logo-white.png" alt="Apex Affinity Group" className="h-10 w-auto" />
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col flex-1 px-3 pb-3 overflow-hidden">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
