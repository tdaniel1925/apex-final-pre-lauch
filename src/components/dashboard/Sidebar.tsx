'use client';

// =============================================
// Dashboard Sidebar Navigation
// Desktop: fixed left sidebar
// Mobile: top bar + slide-in drawer
// Supports collapsible submenus for Licensed Agent Tools
// =============================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/client';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  submenu?: {
    name: string;
    href: string;
    icon?: React.ReactNode;
  }[];
  requiresLicense?: boolean;
}

interface NavSection {
  section: string;
  sectionTitle?: string;
  items: NavItem[];
}

interface SidebarProps {
  isLicensedAgent?: boolean;
}

export default function Sidebar({ isLicensedAgent = true }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // Auto-expand menu if current path matches
  useEffect(() => {
    if (pathname.startsWith('/dashboard/licensed-agent')) {
      setExpandedMenu('Licensed Agent Tools');
    }
  }, [pathname]);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      setIsSigningOut(false);
    }
  };

  const navigation: NavSection[] = [
    // SECTION 1: DASHBOARD
    {
      section: 'main',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
      ],
    },

    // SECTION 2: TEAM & GROWTH
    {
      section: 'team',
      sectionTitle: 'Team & Growth',
      items: [
        {
          name: 'Lead Autopilot',
          href: '/dashboard/autopilot',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
        {
          name: 'Race to 100',
          href: '/dashboard/race-to-100',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          ),
        },
        {
          name: 'Meeting Reservations',
          href: '/dashboard/autopilot?tab=meetings',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
          href: '/dashboard/matrix-v2',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
        {
          name: 'Genealogy',
          href: '/dashboard/genealogy',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          ),
        },
      ],
    },

    // SECTION 3: STORE
    {
      section: 'store',
      sectionTitle: 'Store',
      items: [
        {
          name: 'Service Store',
          href: '/dashboard/store',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          ),
        },
      ],
    },

    // SECTION 4: COMPENSATION
    {
      section: 'compensation',
      sectionTitle: 'Comp. Plan Details',
      items: [
        {
          name: 'Overview',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          submenu: [
            { name: 'Overview', href: '/dashboard/compensation' },
            { name: 'Tech Ladder', href: '/dashboard/compensation/tech-ladder' },
            { name: 'Insurance Ladder', href: '/dashboard/compensation/insurance-ladder' },
            { name: 'Products & Credits', href: '/dashboard/compensation/products' },
            { name: 'Commissions', href: '/dashboard/compensation/commissions' },
            { name: 'Overrides', href: '/dashboard/compensation/overrides' },
            { name: 'Rank Bonuses', href: '/dashboard/compensation/rank-bonuses' },
            { name: 'Bonus Pool', href: '/dashboard/compensation/bonus-pool' },
            { name: 'Leadership Pool', href: '/dashboard/compensation/leadership-pool' },
            { name: 'Calculator', href: '/dashboard/compensation/calculator' },
            { name: 'Glossary', href: '/dashboard/compensation/glossary' },
          ],
        },
      ],
    },

    // SECTION 5: APPS & TOOLS - REMOVED PER USER REQUEST (APFR)
    // {
    //   section: 'apps',
    //   sectionTitle: 'Apps & Tools',
    //   items: [
    //     {
    //       name: 'Apps',
    //       icon: (
    //         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    //         </svg>
    //       ),
    //       submenu: [
    //         {
    //           name: 'Nurture Campaigns',
    //           href: '/dashboard/apps/nurture',
    //           icon: (
    //             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    //             </svg>
    //           ),
    //         },
    //         { name: 'LeadLoop', href: '/dashboard/apps/leadloop' },
    //         { name: 'PolicyPing', href: '/dashboard/apps/policyping' },
    //         { name: 'PulseFollow', href: '/dashboard/apps/pulsefollow' },
    //       ],
    //     },
    //   ],
    // },

    // SECTION 6: LICENSED AGENT TOOLS
    {
      section: 'licensed',
      sectionTitle: 'Licensed Agent Tools',
      items: [
        {
          name: 'Licensed Agent Tools',
          requiresLicense: true,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          submenu: [
            {
              name: 'Dashboard',
              href: '/dashboard/licensed-agent',
              icon: (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
                </svg>
              ),
            },
            {
              name: 'Get Quotes',
              href: '/dashboard/licensed-agent/quotes',
              icon: (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              name: 'Submit Application',
              href: '/dashboard/licensed-agent/applications',
              icon: (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              name: 'My Licenses',
              href: '/dashboard/licensed-agent/licenses',
              icon: (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              ),
            },
            {
              name: 'Training & CE',
              href: '/dashboard/licensed-agent/training',
              icon: (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
            },
            {
              name: 'Compliance',
              href: '/dashboard/licensed-agent/compliance',
              icon: (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              name: 'Marketing Materials',
              href: '/dashboard/licensed-agent/marketing',
              icon: (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
            },
          ],
        },
      ],
    },

    // SECTION 6: RESOURCES
    {
      section: 'resources',
      sectionTitle: 'Resources',
      items: [
        {
          name: 'Training',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ),
          submenu: [
            {
              name: 'Overview',
              href: '/dashboard/training',
              icon: (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              name: 'Videos',
              href: '/dashboard/training/videos',
              icon: (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ),
            },
          ],
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
          name: 'Claim the States!',
          href: '/dashboard/claim-the-states',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          ),
        },
      ],
    },

    // SECTION 7: DOWNLOADS
    {
      section: 'downloads',
      sectionTitle: 'Downloads',
      items: [
        {
          name: 'Downloads',
          href: '/dashboard/downloads',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          ),
        },
      ],
    },

    // SECTION 8: ACCOUNT
    {
      section: 'account',
      sectionTitle: 'Account',
      items: [
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
          name: 'Settings',
          href: '/dashboard/settings',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          name: 'Support',
          href: '/dashboard/support',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-0.5">
          {navigation.map((section) => (
            <div key={section.section}>
              {section.sectionTitle && (
                <div className="mt-4 mb-2 px-3 first:mt-0">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.sectionTitle}
                  </h4>
                </div>
              )}
              {section.items.map((item) => {
                const hasSubmenu = !!item.submenu;
                const isExpanded = expandedMenu === item.name;
                const isDisabled = item.requiresLicense && !isLicensedAgent;

                if (hasSubmenu) {
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => !isDisabled && toggleSubmenu(item.name)}
                        disabled={isDisabled}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                          isDisabled
                            ? 'text-gray-600 cursor-not-allowed opacity-50'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                        title={isDisabled ? 'Licensed agents only' : undefined}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4">{item.icon}</div>
                          <span className="font-medium text-xs">{item.name}</span>
                        </div>
                        {!isDisabled && (
                          <svg
                            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                      {isExpanded && !isDisabled && (
                        <div className="ml-4 mt-0.5 space-y-0.5">
                          {item.submenu?.map((subItem) => {
                            const isActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={onNavigate}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                                  isActive
                                    ? 'bg-[#2B4C7E] text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                              >
                                {subItem.icon && <div className="w-3.5 h-3.5">{subItem.icon}</div>}
                                <span className="font-medium text-xs">{subItem.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
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
            </div>
          ))}
        </nav>
      </div>

      {/* Sticky Sign Out Button */}
      <div className="flex-shrink-0 pt-3 border-t border-gray-800 bg-gray-900">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium text-xs">{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
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
