const fs = require('fs');

const content = `'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/actions/auth';
import { useState } from 'react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [teamOpen, setTeamOpen] = useState(true);
  const [compOpen, setCompOpen] = useState(true);
  const [marketingOpen, setMarketingOpen] = useState(true);
  const [trainingOpen, setTrainingOpen] = useState(true);

  const ChevronIcon = ({ isOpen }) => (
    <svg className={\`w-3 h-3 transition-transform \${isOpen ? 'rotate-90' : ''}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <aside className="w-52 bg-gray-900 text-white h-screen sticky top-0 flex flex-col">
      <div className="flex-shrink-0 p-3">
        <div className="text-center mb-2">
          <img src="/apex-logo-white.png" alt="Apex Affinity Group" className="h-12 w-auto mx-auto mb-1" />
        </div>
        <div className="bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full text-center">ADMIN PORTAL</div>
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        <nav className="space-y-1">
          <Link href="/admin" className={\`flex items-center gap-2 px-3 py-2 rounded-md transition-colors \${pathname === '/admin' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}\`}>
            <div className="w-4 h-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-medium text-xs">Dashboard</span>
          </Link>
          
          <div className="mt-4">
            <button onClick={() => setTeamOpen(!teamOpen)} className="flex items-center gap-2 w-full px-3 py-1.5 text-gray-400 hover:text-white transition-colors">
              <ChevronIcon isOpen={teamOpen} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Team</span>
            </button>
            {teamOpen && (
              <div className="mt-0.5 space-y-0.5">
                <Link href="/admin/distributors" className={\`flex items-center gap-2 px-3 py-2 rounded-md transition-colors \${pathname === '/admin/distributors' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}\`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span className="font-medium text-xs">Distributors</span>
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <button onClick={() => setCompOpen(!compOpen)} className="flex items-center gap-2 w-full px-3 py-1.5 text-gray-400 hover:text-white transition-colors">
              <ChevronIcon isOpen={compOpen} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Compensation</span>
            </button>
            {compOpen && (
              <div className="mt-0.5 space-y-0.5">
                <Link href="/admin/commissions" className={\`flex items-center gap-2 px-3 py-2 rounded-md transition-colors \${pathname === '/admin/commissions' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}\`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-medium text-xs">Commission Engine</span>
                </Link>
                <Link href="/admin/products" className={\`flex items-center gap-2 px-3 py-2 rounded-md transition-colors \${pathname === '/admin/products' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}\`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  <span className="font-medium text-xs">Products Catalog</span>
                </Link>
                <Link href="/test-waterfall" className={\`flex items-center gap-2 px-3 py-2 rounded-md transition-colors \${pathname === '/test-waterfall' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}\`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  <span className="font-medium text-xs flex-1">Waterfall Calculator</span>
                  <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
      
      <div className="flex-shrink-0 p-3 border-t border-gray-800 bg-gray-900">
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors mb-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="font-medium text-xs">User Dashboard</span>
        </Link>
        <form action={signOut}>
          <button type="submit" className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors w-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="font-medium text-xs">Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
`;

fs.writeFileSync('src/components/admin/AdminSidebar.tsx', content, 'utf8');
console.log('Sidebar updated successfully!');
