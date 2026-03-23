'use client';

// =============================================
// Quick Action Bar Component
// Horizontal scrolling action pills below header
// Apex blue accent when active
// =============================================

import { useState } from 'react';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  action: () => void;
}

interface QuickActionBarProps {
  onActionClick?: (actionId: string) => void;
}

export default function QuickActionBar({ onActionClick }: QuickActionBarProps) {
  const [activeAction, setActiveAction] = useState<string>('team');

  const actions: QuickAction[] = [
    { id: 'team', icon: '👥', label: 'Team', action: () => {} },
    { id: 'earnings', icon: '💰', label: 'Earnings', action: () => {} },
    { id: 'stats', icon: '📊', label: 'Stats', action: () => {} },
    { id: 'events', icon: '📅', label: 'Events', action: () => {} },
    { id: 'messages', icon: '📧', label: 'Messages', action: () => {} },
    { id: 'matrix', icon: '🌳', label: 'Matrix', action: () => {} },
    { id: 'training', icon: '🎓', label: 'Training', action: () => {} },
    { id: 'compliance', icon: '✅', label: 'Compliance', action: () => {} },
  ];

  const handleActionClick = (actionId: string) => {
    setActiveAction(actionId);
    if (onActionClick) {
      onActionClick(actionId);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#2c5aa0] via-[#1a4075] to-[#2c5aa0] px-4 lg:px-6 pb-3">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-white/60 text-xs font-medium whitespace-nowrap mr-1 flex-shrink-0">
          Quick:
        </span>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            className={`
              quick-action-pill whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium
              flex items-center gap-1.5 flex-shrink-0 transition-all
              ${
                activeAction === action.id
                  ? 'bg-white text-[#2c5aa0] shadow-lg'
                  : 'bg-white/20 hover:bg-white/30 text-white border border-white/25'
              }
            `}
          >
            <span className="text-sm">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .quick-action-pill:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
