'use client';

// =============================================
// Admin Training Client
// Full training audio management interface
// =============================================

import { useState, useEffect } from 'react';
import CreateEpisodeModal from './CreateEpisodeModal';

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
  script: string | null;
  voice_model: string;
  status: string;
  is_featured: boolean;
  include_intro: boolean;
  include_outro: boolean;
  background_music_url: string | null;
  music_volume: number;
  total_listens: number;
  total_completions: number;
  created_at: string;
}

export default function AdminTrainingClient() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/training/episodes?admin=true');
      const data = await res.json();
      if (data.success) setEpisodes(data.episodes);
    } catch (e) {
      console.error('Failed to fetch episodes:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleStatus = async (episode: Episode) => {
    const newStatus = episode.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/training/episodes/${episode.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setEpisodes((prev) =>
          prev.map((e) => (e.id === episode.id ? { ...e, status: newStatus } : e))
        );
        showToast(`Episode ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      }
    } catch (e) {
      console.error('Toggle status error:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this episode? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/training/episodes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEpisodes((prev) => prev.filter((e) => e.id !== id));
        showToast('Episode deleted');
      }
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const handleSaved = () => {
    fetchEpisodes();
    setShowModal(false);
    setEditingEpisode(null);
    showToast('Episode saved successfully!');
  };

  const filteredEpisodes = episodes.filter((ep) => {
    if (statusFilter !== 'all' && ep.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && ep.category !== categoryFilter) return false;
    if (searchQuery && !ep.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: episodes.length,
    published: episodes.filter((e) => e.status === 'published').length,
    drafts: episodes.filter((e) => e.status === 'draft').length,
    totalListens: episodes.reduce((sum, e) => sum + e.total_listens, 0),
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const categories = [
    { value: 'fundamentals', label: 'Fundamentals', icon: '📚' },
    { value: 'objection-handling', label: 'Objection Handling', icon: '🛡️' },
    { value: 'closing', label: 'Closing Techniques', icon: '🎯' },
    { value: 'products', label: 'Product Knowledge', icon: '📋' },
    { value: 'leadership', label: 'Leadership', icon: '👥' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎙️ Training Audio Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage podcast-style training episodes</p>
        </div>
        <button
          onClick={() => { setEditingEpisode(null); setShowModal(true); }}
          className="bg-[#2B4C7E] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1e3555] transition-colors"
        >
          + Create New Episode
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Episodes', value: stats.total, icon: '🎙️' },
          { label: 'Published', value: stats.published, icon: '⚡' },
          { label: 'Drafts', value: stats.drafts, icon: '📝' },
          { label: 'Total Listens', value: stats.totalListens.toLocaleString(), icon: '🎧' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search episodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </select>
      </div>

      {/* Episode List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading episodes...</div>
      ) : filteredEpisodes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-5xl mb-3">🎙️</div>
          <p className="text-gray-500 mb-4">No episodes yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#2B4C7E] text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Create Your First Episode
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEpisodes.map((episode) => {
            const cat = categories.find((c) => c.value === episode.category);
            return (
              <div
                key={episode.id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-2xl">{cat?.icon || '🎙️'}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {episode.episode_number ? `E${episode.episode_number}: ` : ''}{episode.title}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          episode.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : episode.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {episode.status}
                      </span>
                      {episode.audio_url && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          🎵 Audio Ready
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                      <span>{cat?.label || 'Uncategorized'}</span>
                      <span>•</span>
                      <span>{formatDuration(episode.duration_seconds)}</span>
                      <span>•</span>
                      <span>{episode.total_listens} listens</span>
                      <span>•</span>
                      <span>{episode.total_completions} completions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {episode.audio_url && (
                    <audio
                      controls
                      src={episode.audio_url}
                      className="h-8"
                      style={{ width: '160px' }}
                    />
                  )}
                  <button
                    onClick={() => handleToggleStatus(episode)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                      episode.status === 'published'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {episode.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => { setEditingEpisode(episode); setShowModal(true); }}
                    className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(episode.id)}
                    className="text-xs px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <CreateEpisodeModal
          episode={editingEpisode}
          onClose={() => { setShowModal(false); setEditingEpisode(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
