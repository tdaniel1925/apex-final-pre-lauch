'use client';

// =============================================
// Team Member Card Component
// Shows team member with avatar, name, rank, stats
// Action buttons: View Profile, Message, Call
// =============================================

interface TeamMemberCardProps {
  memberId: string;
  name: string;
  rank: string;
  avatar?: string;
  stats: {
    personalBV: number;
    teamSize: number;
    monthlyEarnings: number;
  };
  onViewProfile: (memberId: string) => void;
  onMessage: (memberId: string) => void;
  onCall?: (memberId: string) => void;
}

export default function TeamMemberCard({
  memberId,
  name,
  rank,
  avatar,
  stats,
  onViewProfile,
  onMessage,
  onCall,
}: TeamMemberCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Avatar + Name + Rank */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-14 h-14 rounded-full border-2 border-[#2c5aa0]/20 object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2c5aa0] to-[#1a4075] flex items-center justify-center text-white font-bold text-lg">
              {name.charAt(0)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 truncate">{name}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-medium text-[#2c5aa0] bg-[#e3f2fd] px-2 py-0.5 rounded-full">
              {rank}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500">Personal BV</p>
          <p className="text-sm font-bold text-gray-900">{stats.personalBV}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500">Team</p>
          <p className="text-sm font-bold text-gray-900">{stats.teamSize}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500">Earnings</p>
          <p className="text-sm font-bold text-gray-900">
            ${(stats.monthlyEarnings / 100).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewProfile(memberId)}
          className="flex-1 px-3 py-2 rounded-lg bg-[#2c5aa0] hover:bg-[#1a4075] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </button>
        <button
          onClick={() => onMessage(memberId)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Message
        </button>
        {onCall && (
          <button
            onClick={() => onCall(memberId)}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
