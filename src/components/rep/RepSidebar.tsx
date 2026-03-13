'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface RepData {
  name: string;
  rank: string;
  photo?: string;
}

export default function RepSidebar() {
  const pathname = usePathname();
  const [repData, setRepData] = useState<RepData | null>(null);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    async function loadRepData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: dist, error } = await supabase
            .from('distributors')
            .select('first_name, last_name, rank, photo_url')
            .eq('email', user.email)
            .single();

          if (error) {
            console.error('Error loading rep data:', error);
            // Set fallback data so it doesn't stay on "Loading..."
            setRepData({
              name: 'User',
              rank: 'Associate',
            });
            return;
          }

          if (dist) {
            setRepData({
              name: `${dist.first_name} ${dist.last_name}`,
              rank: dist.rank || 'Associate',
              photo: dist.photo_url
            });
          }
        } else {
          // No user, set fallback
          setRepData({
            name: 'User',
            rank: 'Associate',
          });
        }
      } catch (error) {
        console.error('Error in loadRepData:', error);
        setRepData({
          name: 'User',
          rank: 'Associate',
        });
      }
    }
    loadRepData();
  }, [supabase]);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/dashboard', icon: 'grid-2', label: 'Dashboard' },
    { path: '/today', icon: 'clipboard-check', label: 'What Do I Do Today?' },
    { path: '/org-tree', icon: 'users', label: 'My Team' },
    { path: '/earnings', icon: 'wallet', label: 'Commissions' },
    { path: '/customers', icon: 'user-group', label: 'Customers' },
    { path: '/products', icon: 'store', label: 'Shop' },
    { path: '/email-marketing', icon: 'email', label: 'Email Marketing' },
    { path: '/training', icon: 'graduation-cap', label: 'Training' },
    { path: '/announcements', icon: 'megaphone', label: 'Announcements' },
    { path: '/communications', icon: 'chat', label: 'Communications' },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-64 text-white z-20 h-screen overflow-hidden border-r flex-shrink-0"
      style={{
        background: 'rgba(27, 58, 125, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Logo Header */}
      <div className="p-6 flex items-center justify-center border-b border-white/10">
        <img
          src="/apex-logo-white.png"
          alt="Apex Affinity Group"
          className="h-12 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.path)
                ? 'bg-white/10 text-white shadow-sm border border-white/5'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              {item.icon === 'grid-2' && <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 6v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />}
              {item.icon === 'clipboard-check' && <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z M7.707 11.293a1 1 0 011.414 0L10 12.172l2.879-2.879a1 1 0 111.414 1.414l-3.586 3.586a1 1 0 01-1.414 0l-1.586-1.586a1 1 0 010-1.414z" />}
              {item.icon === 'users' && <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />}
              {item.icon === 'wallet' && <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z M4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1z M9 12a1 1 0 100 2h1a1 1 0 100-2H9z" />}
              {item.icon === 'user-group' && <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />}
              {item.icon === 'store' && <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />}
              {item.icon === 'email' && <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />}
              {item.icon === 'graduation-cap' && <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />}
              {item.icon === 'megaphone' && <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />}
              {item.icon === 'chat' && <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />}
            </svg>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
          {repData?.photo ? (
            <img src={repData.photo} alt="Profile" className="w-10 h-10 rounded-full border-2 object-cover" style={{borderColor: '#C7181F'}} />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 bg-gray-700 flex items-center justify-center text-white font-bold" style={{borderColor: '#C7181F'}}>
              {repData?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{repData?.name || 'Loading...'}</p>
            <p className="text-xs text-gray-400 truncate">{repData?.rank || 'Associate'}</p>
          </div>
          <Link href="/profile" className="text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
}
