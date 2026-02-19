'use client';

// =============================================
// Training Dashboard Client
// User-facing training episode browser + player
// =============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import AudioPlayer from './AudioPlayer';

interface Episode {
  id: string;
  title: string;
  description: string | null;
  episode_number: number | null;
  season_number: number;
  category: string | null;
  audio_url: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  total_listens: number;
  total_completions: number;
}

interface Progress {
  episode_id: string;
  current_position_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
  listen_count: number;
  last_listened_at: string | null;
}

interface Props {
  distributorId: string;
  firstName: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All Episodes', icon: '🎙️' },
  { value: 'fundamentals', label: 'Fundamentals', icon: '📚' },
  { value: 'objection-handling', label: 'Objection Handling', icon: '🛡️' },
  { value: 'closing', label: 'Closing Techniques', icon: '🎯' },
  { value: 'products', label: 'Product Knowledge', icon: '📋' },
  { value: 'leadership', label: 'Leadership', icon: '👥' },
];

export default function TrainingDashboardClient({ distributorId, firstName }: Props) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const saveProgressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Promise.all([fetchEpisodes(), fetchProgress()]).finally(() => setLoading(false));
  }, []);

  const fetchEpisodes = async () => {
    try {
      const res = await fetch('/api/training/episodes');
      const data = await res.json();
      if (data.success) setEpisodes(data.episodes);
    } catch (e) {
      console.error('Failed to fetch episodes:', e);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/training/progress');
      const data = await res.json();
      if (data.success) {
        const progressMap: Record<string, Progress> = {};
        data.progress.forEach((p: Progress) => {
          progressMap[p.episode_id] = p;
        });
        setProgress(progressMap);
      }
    } catch (e) {
      console.error('Failed to fetch progress:', e);
    }
  };

  const handleProgressUpdate = useCallback(
    (episodeId: string, currentPosition: number, durationSeconds: number, completed: boolean) => {
      // Debounce progress saves
      if (saveProgressRef.current) clearTimeout(saveProgressRef.current);
      saveProgressRef.current = setTimeout(async () => {
        try {
          await fetch('/api/training/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ episodeId, currentPosition, durationSeconds, completed }),
          });
          setProgress((prev) => ({
            ...prev,
            [episodeId]: {
              ...prev[episodeId],
              episode_id: episodeId,
              current_position_seconds: currentPosition,
              duration_seconds: durationSeconds,
              completed,
              listen_count: (prev[episodeId]?.listen_count || 0),
              last_listened_at: new Date().toISOString(),
            },
          }));
        } catch (e) {
          console.error('Progress save error:', e);
        }
      }, 5000);
    },
    []
  );

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getProgressPct = (episode: Episode) => {
    const p = progress[episode.id];
    if (!p || !p.duration_seconds) return 0;
    return Math.round((p.current_position_seconds / p.duration_seconds) * 100);
  };

  const filteredEpisodes = activeCategory === 'all'
    ? episodes
    : episodes.filter((e) => e.category === activeCategory);

  // Find the last in-progress episode
  const continueEpisode = episodes.find((ep) => {
    const p = progress[ep.id];
    return p && !p.completed && p.current_position_seconds > 0;
  });

  const completedCount = episodes.filter((ep) => progress[ep.id]?.completed).length;
  const totalListenTime = Object.values(progress).reduce(
    (sum, p) => sum + p.current_position_seconds, 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading training content...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🎓 Sales Training Audio</h1>
        <p className="text-sm text-gray-500 mt-1">
          Professional training episodes, presented by Apex Affinity Group
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-[#2B4C7E]">{completedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Episodes Completed</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-[#2B4C7E]">{episodes.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Episodes</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-[#2B4C7E]">
            {Math.round(totalListenTime / 60)}m
          </div>
          <div className="text-xs text-gray-500 mt-1">Listen Time</div>
        </div>
      </div>

      {/* Continue Listening */}
      {continueEpisode && (
        <div className="bg-[#2B4C7E] text-white rounded-xl p-4 mb-6">
          <p className="text-xs font-medium text-blue-200 mb-1">Continue Listening</p>
          <p className="font-semibold text-sm mb-3">{continueEpisode.title}</p>
          <div className="w-full bg-white/20 rounded-full h-1.5 mb-3">
            <div
              className="bg-white rounded-full h-1.5 transition-all"
              style={{ width: `${getProgressPct(continueEpisode)}%` }}
            />
          </div>
          <button
            onClick={() => setCurrentEpisode(continueEpisode)}
            className="bg-white text-[#2B4C7E] text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
          >
            ▶ Resume ({getProgressPct(continueEpisode)}%)
          </button>
        </div>
      )}

      {/* Now Playing */}
      {currentEpisode && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 font-medium">NOW PLAYING</p>
              <p className="font-semibold text-gray-900 text-sm mt-0.5">{currentEpisode.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {currentEpisode.transcript && (
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-xs text-[#2B4C7E] underline"
                >
                  {showTranscript ? 'Hide' : 'View'} Transcript
                </button>
              )}
              <button
                onClick={() => setCurrentEpisode(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {currentEpisode.audio_url && (
            <AudioPlayer
              src={currentEpisode.audio_url}
              episodeId={currentEpisode.id}
              initialPosition={progress[currentEpisode.id]?.current_position_seconds || 0}
              onProgressUpdate={handleProgressUpdate}
            />
          )}

          {showTranscript && currentEpisode.transcript && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">TRANSCRIPT</h4>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentEpisode.transcript}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat.value
                ? 'bg-[#2B4C7E] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Episode List */}
      {filteredEpisodes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-4xl mb-3">🎙️</div>
          <p className="text-gray-500 text-sm">No episodes available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEpisodes.map((episode) => {
            const ep = progress[episode.id];
            const pct = getProgressPct(episode);
            const isCompleted = ep?.completed;
            const isPlaying = currentEpisode?.id === episode.id;

            return (
              <div
                key={episode.id}
                className={`bg-white rounded-lg border transition-all ${
                  isPlaying ? 'border-[#2B4C7E] shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Status Icon */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm ${
                      isCompleted
                        ? 'bg-[#2B4C7E] text-white'
                        : isPlaying
                        ? 'bg-blue-100 text-[#2B4C7E]'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : isPlaying ? '♪' : '▶'}
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {episode.episode_number ? `E${episode.episode_number}: ` : ''}
                        {episode.title}
                      </span>
                      {isCompleted && (
                        <span className="text-xs text-[#2B4C7E] font-medium shrink-0">Completed</span>
                      )}
                    </div>
                    {episode.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{episode.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {episode.duration_seconds && (
                        <span className="text-xs text-gray-400">{formatDuration(episode.duration_seconds)}</span>
                      )}
                      {ep && !isCompleted && pct > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-[#2B4C7E]">{pct}% complete</span>
                        </>
                      )}
                    </div>
                    {/* Progress bar */}
                    {pct > 0 && !isCompleted && (
                      <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5">
                        <div
                          className="bg-[#2B4C7E] rounded-full h-1 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {episode.audio_url && (
                      <button
                        onClick={() => setCurrentEpisode(episode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isPlaying
                            ? 'bg-[#2B4C7E] text-white'
                            : 'bg-[#2B4C7E]/10 text-[#2B4C7E] hover:bg-[#2B4C7E]/20'
                        }`}
                      >
                        {isPlaying ? '▶ Playing' : ep?.current_position_seconds ? '▶ Resume' : '▶ Play'}
                      </button>
                    )}
                    {episode.audio_url && (
                      <a
                        href={episode.audio_url}
                        download={`${episode.title}.mp3`}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                        title="Download"
                      >
                        ⬇
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
