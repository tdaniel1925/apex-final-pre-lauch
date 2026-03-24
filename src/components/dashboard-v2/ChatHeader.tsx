'use client';

// =============================================
// Chat Header Component
// Sticky header with hamburger menu, title, and actions
// Apex blue gradient background
// =============================================

interface ChatHeaderProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  notificationCount?: number;
}

export default function ChatHeader({
  onMenuClick,
  title = 'Apex AI Command Center',
  subtitle = 'AI Assistant · Online',
  showNotifications = true,
  notificationCount = 0,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-30 px-4 lg:px-6 py-0 bg-gradient-to-br from-[#2c5aa0] via-[#1a4075] to-[#2c5aa0] shadow-lg">
      {/* Top Row */}
      <div className="flex items-center justify-between h-16">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              {title}
            </h2>
            <div className="text-xs text-white/70 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              {subtitle}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          {showNotifications && (
            <button className="relative w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center justify-center border border-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1a4075]">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}

          {/* Profile Avatar */}
          <button className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border-2 border-white/30 transition-colors overflow-hidden flex items-center justify-center text-white font-bold">
            <span className="text-sm">A</span>
          </button>
        </div>
      </div>
    </header>
  );
}
