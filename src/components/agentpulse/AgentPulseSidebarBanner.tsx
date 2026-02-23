'use client';

// =============================================
// AgentPulse Sidebar Banner
// Small banner for sidebar announcing AgentPulse
// =============================================

import Link from 'next/link';

export default function AgentPulseSidebarBanner() {
  return (
    <Link
      href="/dashboard/agentpulse"
      className="block mx-3 mb-3 p-3 bg-gradient-to-br from-[#2B4C7E] to-[#1e3555] rounded-lg hover:from-[#1e3555] hover:to-[#2B4C7E] transition-all group"
    >
      <div className="flex items-start gap-2">
        <div className="text-lg">🚀</div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-xs mb-1 leading-tight">
            NEW: AgentPulse
          </div>
          <div className="text-blue-100 text-[10px] leading-tight mb-2">
            6 AI Marketing Tools
            <br />
            Coming Feb 28th
          </div>
          <div className="inline-block px-2 py-1 bg-white/20 text-white text-[10px] font-semibold rounded group-hover:bg-white/30 transition-colors">
            Preview →
          </div>
        </div>
      </div>
    </Link>
  );
}
