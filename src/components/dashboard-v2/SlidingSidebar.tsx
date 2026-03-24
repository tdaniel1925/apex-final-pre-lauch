'use client';

// =============================================
// Sliding Sidebar Component
// Command center navigation with slide-in animation
// Apex blue gradient theme
// =============================================

import { useState } from 'react';
import Link from 'next/link';

interface SlidingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userRank: string;
  userAvatar?: string;
}

export default function SlidingSidebar({
  isOpen,
  onClose,
  userName,
  userRank,
  userAvatar,
}: SlidingSidebarProps) {
  const [recentChats] = useState([
    { id: 1, title: 'Rank Advancement Plan', preview: 'Analyzing your downline structure...', timestamp: 'Today' },
    { id: 2, title: 'Commission Breakdown', preview: 'Showing your earnings for...', timestamp: 'Today' },
    { id: 3, title: 'Team Performance', preview: 'Your top performers this month...', timestamp: 'Yesterday' },
    { id: 4, title: 'Meeting Setup', preview: 'Created registration page for...', timestamp: 'Yesterday' },
  ]);

  const navigationSections = [
    {
      title: 'Quick Actions',
      items: [
        { icon: '💬', label: 'Chat', href: '/dashboard-v2', active: true },
        { icon: '👥', label: 'Team Explorer', href: '/dashboard/team' },
        { icon: '📊', label: 'Performance', href: '/dashboard/performance' },
        { icon: '🎓', label: 'Training', href: '/dashboard/training' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
        { icon: '🔔', label: 'Notifications', href: '/dashboard/notifications' },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[280px] bg-white border-r border-gray-200
          flex flex-col z-50 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
        `}
      >
        {/* Gradient Header */}
        <div className="p-5 bg-gradient-to-br from-[#2c5aa0] via-[#1a4075] to-[#2c5aa0]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
                <span className="text-lg">⚡</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Apex<span className="text-[#4a90e2]">.ai</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <button className="w-full py-2.5 px-4 rounded-full bg-white/20 hover:bg-white/30 text-white font-medium border border-white/30 flex items-center justify-center gap-2 transition-all text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Strategy Chat</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-3 border-b border-gray-100">
          {navigationSections.map((section, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${
                        item.active
                          ? 'bg-[#e3f2fd] border border-[#2c5aa0]/20 text-[#2c5aa0]'
                          : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className="w-4 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Recent Chats
          </h3>
          <div className="space-y-1">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                <div className="font-medium truncate">{chat.title}</div>
                <div className="text-xs text-gray-400 truncate mt-0.5">{chat.preview}</div>
              </button>
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group border border-transparent hover:border-gray-200">
            <div className="relative">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2c5aa0] to-[#1a4075] flex items-center justify-center text-white font-bold text-sm">
                  {userName.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">{userName}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 font-medium">{userRank}</span>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
}
