'use client';

// ============================================================
// State Detail Modal
// Shows state details, ownership, leaderboard
// ============================================================

import { X, Trophy, Users, TrendingUp, Crown } from 'lucide-react';

interface StateOwner {
  id: string;
  name: string;
  photo_url?: string;
  gvp: number;
  dateClaimed?: string;
}

interface StateContributor {
  id: string;
  name: string;
  slug: string;
  photo_url?: string;
  gvp: number;
  rank: number;
}

interface StateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: {
    code: string;
    name: string;
    status: 'unclaimed' | 'claimed' | 'elite' | 'legacy';
    currentGVP: number;
    currentOwner?: StateOwner | null;
    firstOwner?: StateOwner | null;
    topContributors: StateContributor[];
  } | null;
}

export default function StateDetailModal({ isOpen, onClose, state }: StateDetailModalProps) {
  if (!isOpen || !state) return null;

  const progress = Math.min((state.currentGVP / 500) * 100, 100);
  const isUnclaimed = state.status === 'unclaimed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#2B4C7E] to-[#1a2c4e] p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-1">{state.name}</h2>
              <p className="text-blue-100 text-sm">
                {isUnclaimed ? 'Available to Claim' : `Owned by ${state.currentOwner?.name}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            {state.status === 'unclaimed' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                🔒 Unclaimed
              </span>
            )}
            {state.status === 'claimed' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 bg-opacity-30 rounded-full text-sm">
                <Crown className="w-4 h-4" /> Claimed
              </span>
            )}
            {state.status === 'elite' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 bg-opacity-30 rounded-full text-sm">
                ⭐ Elite Status
              </span>
            )}
            {state.status === 'legacy' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 bg-opacity-30 rounded-full text-sm">
                🏆 Legacy Status
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress to 500 GVP */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                {isUnclaimed ? 'Progress to Claim' : 'Total GVP Generated'}
              </span>
              <span className="text-sm font-bold text-[#2B4C7E]">
                {state.currentGVP.toLocaleString()} {isUnclaimed && '/ 500'}
              </span>
            </div>
            {isUnclaimed && (
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2B4C7E] to-[#4a6fa5] transition-all duration-500 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${progress}%` }}
                >
                  {progress > 15 && (
                    <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current Owner (if claimed) */}
          {!isUnclaimed && state.currentOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Current Owner (2026)
              </h3>
              <div className="flex items-center gap-3">
                {state.currentOwner.photo_url ? (
                  <img
                    src={state.currentOwner.photo_url}
                    alt={state.currentOwner.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {state.currentOwner.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-900">{state.currentOwner.name}</p>
                  <p className="text-sm text-slate-600">
                    {state.currentOwner.gvp.toLocaleString()} GVP
                    {state.currentOwner.dateClaimed && (
                      <span className="ml-2 text-xs text-slate-500">
                        Claimed {new Date(state.currentOwner.dateClaimed).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hall of Fame (First Owner) */}
          {state.firstOwner && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Hall of Fame - First Ever Claim
              </h3>
              <div className="flex items-center gap-3">
                {state.firstOwner.photo_url ? (
                  <img
                    src={state.firstOwner.photo_url}
                    alt={state.firstOwner.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold">
                    {state.firstOwner.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-900">{state.firstOwner.name}</p>
                  <p className="text-sm text-slate-600">
                    First to claim {state.name}
                    {state.firstOwner.dateClaimed && (
                      <span className="ml-2 text-xs text-slate-500">
                        {new Date(state.firstOwner.dateClaimed).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Contributors Leaderboard */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2B4C7E]" />
              {isUnclaimed ? 'Race to Claim' : 'Top Contributors'}
            </h3>
            <div className="space-y-2">
              {state.topContributors.length > 0 ? (
                state.topContributors.map((contributor, index) => (
                  <div
                    key={contributor.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-slate-400' :
                        index === 2 ? 'text-orange-600' :
                        'text-slate-600'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      {contributor.photo_url ? (
                        <img
                          src={contributor.photo_url}
                          alt={contributor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {contributor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{contributor.name}</p>
                        <p className="text-xs text-slate-500">@{contributor.slug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#2B4C7E]">
                        {contributor.gvp.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">GVP</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No contributors yet</p>
                  <p className="text-sm">Be the first to claim {state.name}!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
