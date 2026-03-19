// =============================================
// Matrix Node Card Component
// Professional slate-themed card for team members
// =============================================

'use client';

export interface MatrixNodeData {
  member_id: string;
  distributor_id: string;
  full_name: string;
  rep_number: number | null;
  tech_rank: string;
  personal_credits_monthly: number;
  override_qualified: boolean;
  slug: string | null;
}

interface MatrixNodeCardProps {
  node: MatrixNodeData;
  level: number;
  onClick?: () => void;
}

const RANK_COLORS: Record<string, string> = {
  starter: 'border-slate-400',
  bronze: 'border-amber-600',
  silver: 'border-slate-300',
  gold: 'border-yellow-500',
  platinum: 'border-slate-500',
  ruby: 'border-red-500',
  diamond: 'border-blue-400',
  crown: 'border-purple-500',
  elite: 'border-indigo-600',
};

const RANK_LABELS: Record<string, string> = {
  starter: 'Starter',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  ruby: 'Ruby',
  diamond: 'Diamond',
  crown: 'Crown',
  elite: 'Elite',
};

export default function MatrixNodeCard({ node, level, onClick }: MatrixNodeCardProps) {
  const initials = node.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const borderColor = RANK_COLORS[node.tech_rank] || 'border-slate-400';
  const rankLabel = RANK_LABELS[node.tech_rank] || 'Starter';

  return (
    <div
      className={`
        bg-slate-800 rounded-lg shadow-lg border-2 ${borderColor}
        p-4 min-w-[200px] max-w-[200px]
        hover:shadow-xl hover:scale-105 transition-all duration-200
        cursor-pointer
      `}
      onClick={onClick}
    >
      {/* Avatar Circle */}
      <div className="flex justify-center mb-3">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
          <span className="text-white font-bold text-lg">{initials}</span>
        </div>
      </div>

      {/* Name */}
      <h3 className="text-white font-semibold text-center text-sm mb-1 truncate">
        {node.full_name}
      </h3>

      {/* Rep Number */}
      <p className="text-slate-300 text-xs text-center mb-2">
        Rep #{node.rep_number || 'N/A'}
      </p>

      {/* Rank Badge */}
      <div className="flex justify-center mb-2">
        <span className={`
          px-3 py-1 rounded-full text-xs font-semibold
          ${borderColor.replace('border-', 'bg-')} bg-opacity-20
          ${borderColor.replace('border-', 'text-')}
        `}>
          {rankLabel}
        </span>
      </div>

      {/* Credits */}
      <div className="bg-slate-900 rounded px-2 py-1 mb-2">
        <p className="text-slate-200 text-xs text-center">
          {node.personal_credits_monthly} credits/mo
        </p>
      </div>

      {/* Override Qualified Status */}
      <div className="flex items-center justify-center gap-1">
        <div className={`w-2 h-2 rounded-full ${node.override_qualified ? 'bg-green-500' : 'bg-slate-600'}`} />
        <span className={`text-xs ${node.override_qualified ? 'text-green-400' : 'text-slate-300'}`}>
          {node.override_qualified ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
}
