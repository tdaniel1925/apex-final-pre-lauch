'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="flex flex-col w-60 flex-shrink-0 text-white z-20" style={{minHeight: '100vh', background: 'linear-gradient(180deg, #1B3A7D 0%, #0F2045 100%)'}}>
      {/* Logo Header */}
      <div className="px-5 py-5 flex items-center gap-3" style={{borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #C7181F 0%, #D9272F 100%)'}}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white">ASCEND</span>
          <p className="text-xs" style={{fontSize: '10px', marginTop: '-2px', color: 'rgba(158,170,204,0.9)'}}>CORPORATE ADMIN</p>
        </div>
      </div>

      {/* Command Center Section */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{color: 'rgba(118,137,185,0.8)', fontSize: '10px'}}>Command Center</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            isActive('/admin')
              ? 'font-semibold text-white'
              : 'font-medium text-[rgba(158,170,204,0.9)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={isActive('/admin') ? {background: 'rgba(255,255,255,0.1)'} : {}}
        >
          <svg className="w-4" fill="none" stroke={isActive('/admin') ? '#E7767B' : 'rgba(118,137,185,0.7)'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Command Center</span>
        </Link>

        <Link
          href="/admin/reps"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            isActive('/admin/reps')
              ? 'font-semibold text-white'
              : 'font-medium text-[rgba(158,170,204,0.9)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={isActive('/admin/reps') ? {background: 'rgba(255,255,255,0.1)'} : {}}
        >
          <svg className="w-4" fill="none" stroke={isActive('/admin/reps') ? '#E7767B' : 'rgba(118,137,185,0.7)'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Rep Management</span>
        </Link>

        <Link
          href="/admin/org-tree"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            isActive('/admin/org-tree')
              ? 'font-semibold text-white'
              : 'font-medium text-[rgba(158,170,204,0.9)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={isActive('/admin/org-tree') ? {background: 'rgba(255,255,255,0.1)'} : {}}
        >
          <svg className="w-4" fill="none" stroke={isActive('/admin/org-tree') ? '#E7767B' : 'rgba(118,137,185,0.7)'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>Org Structure</span>
        </Link>

        <Link
          href="/admin/commission-engine"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            isActive('/admin/commission-engine')
              ? 'font-semibold text-white'
              : 'font-medium text-[rgba(158,170,204,0.9)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={isActive('/admin/commission-engine') ? {background: 'rgba(255,255,255,0.1)'} : {}}
        >
          <svg className="w-4" fill="none" stroke={isActive('/admin/commission-engine') ? '#E7767B' : 'rgba(118,137,185,0.7)'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>Commission Engine</span>
        </Link>

        <Link
          href="/admin/rank-approvals"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            isActive('/admin/rank-approvals')
              ? 'font-semibold text-white'
              : 'font-medium text-[rgba(158,170,204,0.9)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={isActive('/admin/rank-approvals') ? {background: 'rgba(255,255,255,0.1)'} : {}}
        >
          <svg className="w-4" fill="none" stroke={isActive('/admin/rank-approvals') ? '#E7767B' : 'rgba(118,137,185,0.7)'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span>Rank Approvals</span>
        </Link>

        <Link
          href="/admin/products"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            isActive('/admin/products')
              ? 'font-semibold text-white'
              : 'font-medium text-[rgba(158,170,204,0.9)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={isActive('/admin/products') ? {background: 'rgba(255,255,255,0.1)'} : {}}
        >
          <svg className="w-4" fill="none" stroke={isActive('/admin/products') ? '#E7767B' : 'rgba(118,137,185,0.7)'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Products</span>
        </Link>

        <Link
          href="/admin/training"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            isActive('/admin/training')
              ? 'font-semibold text-white'
              : 'font-medium text-[rgba(158,170,204,0.9)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={isActive('/admin/training') ? {background: 'rgba(255,255,255,0.1)'} : {}}
        >
          <svg className="w-4" fill="none" stroke={isActive('/admin/training') ? '#E7767B' : 'rgba(118,137,185,0.7)'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Training</span>
        </Link>

        <Link
          href="/admin/payouts"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            isActive('/admin/payouts')
              ? 'font-semibold text-white'
              : 'font-medium text-[rgba(158,170,204,0.9)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={isActive('/admin/payouts') ? {background: 'rgba(255,255,255,0.1)'} : {}}
        >
          <svg className="w-4" fill="none" stroke={isActive('/admin/payouts') ? '#E7767B' : 'rgba(118,137,185,0.7)'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Payouts</span>
        </Link>

        {/* Administration Section */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{color: 'rgba(118,137,185,0.8)', fontSize: '10px'}}>Administration</p>
        </div>

        <Link
          href="/admin/compliance"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            isActive('/admin/compliance')
              ? 'font-semibold text-white'
              : 'font-medium text-[rgba(158,170,204,0.9)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={isActive('/admin/compliance') ? {background: 'rgba(255,255,255,0.1)'} : {}}
        >
          <svg className="w-4" fill="none" stroke={isActive('/admin/compliance') ? '#E7767B' : 'rgba(118,137,185,0.7)'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Compliance</span>
        </Link>

        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            isActive('/admin/settings')
              ? 'font-semibold text-white'
              : 'font-medium text-[rgba(158,170,204,0.9)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={isActive('/admin/settings') ? {background: 'rgba(255,255,255,0.1)'} : {}}
        >
          <svg className="w-4" fill="none" stroke={isActive('/admin/settings') ? '#E7767B' : 'rgba(118,137,185,0.7)'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>System Settings</span>
        </Link>
      </nav>

      {/* User Profile */}
      <div className="p-3" style={{borderTop: '1px solid rgba(255,255,255,0.1)'}}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.05)'}}>
          <div className="w-9 h-9 rounded-full border-2 border-[#C7181F] bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
            JW
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">James Whitfield</p>
            <p className="text-xs truncate font-semibold" style={{color: '#E7767B', fontSize: '10px'}}>Corporate Admin</p>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
