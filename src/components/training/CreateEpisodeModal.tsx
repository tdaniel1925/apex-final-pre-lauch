'use client';

// =============================================
// Create/Edit Episode Modal
// Multi-step: Details → Script → Production → Generate
// =============================================

import { useState } from 'react';

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
  include_intro: boolean;
  include_outro: boolean;
  background_music_url: string | null;
  music_volume: number;
  total_listens: number;
  total_completions: number;
  created_at: string;
}

interface Props {
  episode: Episode | null;
  onClose: () => void;
  onSaved: () => void;
}

const VOICES = [
  { value: 'onyx', label: 'Onyx — Professional Male (Recommended)' },
  { value: 'echo', label: 'Echo — Warm Male' },
  { value: 'fable', label: 'Fable — Expressive Male' },
  { value: 'alloy', label: 'Alloy — Neutral' },
  { value: 'nova', label: 'Nova — Professional Female' },
  { value: 'shimmer', label: 'Shimmer — Warm Female' },
];

const CATEGORIES = [
  { value: 'fundamentals', label: '📚 Fundamentals' },
  { value: 'objection-handling', label: '🛡️ Objection Handling' },
  { value: 'closing', label: '🎯 Closing Techniques' },
  { value: 'products', label: '📋 Product Knowledge' },
  { value: 'leadership', label: '👥 Leadership' },
];

export default function CreateEpisodeModal({ episode, onClose, onSaved }: Props) {
  const isEditing = !!episode;
  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'production' | 'generate'>('details');

  // Form state
  const [title, setTitle] = useState(episode?.title || '');
  const [description, setDescription] = useState(episode?.description || '');
  const [episodeNumber, setEpisodeNumber] = useState(episode?.episode_number?.toString() || '');
  const [seasonNumber, setSeasonNumber] = useState(episode?.season_number?.toString() || '1');
  const [category, setCategory] = useState(episode?.category || 'fundamentals');
  const [script, setScript] = useState(episode?.script || '');
  const [voice, setVoice] = useState(episode?.voice_model || 'onyx');
  const [includeIntro, setIncludeIntro] = useState(episode?.include_intro ?? true);
  const [includeOutro, setIncludeOutro] = useState(episode?.include_outro ?? true);
  const [musicVolume, setMusicVolume] = useState(episode?.music_volume ?? 20);
  const [musicMood, setMusicMood] = useState<string>('professional');
  const [enableMusic, setEnableMusic] = useState(true);
  const [introText, setIntroText] = useState(`Apex Affinity Group presents: ${title || 'this training episode'}`);
  const [outroText, setOutroText] = useState('This has been an Apex Affinity Group training. Learn more at ReachTheApex.net');
  const [audioUrl, setAudioUrl] = useState(episode?.audio_url || '');
  const [duration, setDuration] = useState(episode?.duration_seconds || 0);

  // Generation state
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptDuration, setScriptDuration] = useState('5');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Audio generation state
  const [introAudioUrl, setIntroAudioUrl] = useState('');
  const [mainAudioUrl, setMainAudioUrl] = useState('');
  const [outroAudioUrl, setOutroAudioUrl] = useState('');

  const handleGenerateScript = async () => {
    if (!scriptTopic || !title) {
      setError('Enter episode title and topic first');
      return;
    }
    setGeneratingScript(true);
    setError('');
    try {
      const res = await fetch('/api/training/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: scriptTopic,
          episodeTitle: title,
          duration: parseInt(scriptDuration),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScript(data.script);
        setActiveTab('production');
      } else {
        setError(data.error || 'Failed to generate script');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate script');
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleGenerateFullAudio = async () => {
    if (!script) {
      setError('Generate or write a script first');
      return;
    }
    if (!title) {
      setError('Episode title is required');
      return;
    }

    setGeneratingAudio(true);
    setError('');

    // First save episode to get an ID
    const savedEpisodeId = isEditing ? episode.id : await saveEpisodeDraft();
    if (!savedEpisodeId) {
      setGeneratingAudio(false);
      return;
    }

    try {
      let generatedIntroUrl = '';
      let generatedMainUrl = '';
      let generatedOutroUrl = '';

      // Step 1: Generate intro audio
      if (includeIntro) {
        setGeneratingStep('Generating intro...');
        const introRes = await fetch('/api/training/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `Apex Affinity Group presents: ${title}`,
            voice,
            type: 'intro',
            episodeId: savedEpisodeId,
          }),
        });
        const introData = await introRes.json();
        if (!introData.success) throw new Error(introData.error);
        generatedIntroUrl = introData.audioUrl;
        setIntroAudioUrl(generatedIntroUrl);
      }

      // Step 2: Generate main content audio (longest step)
      setGeneratingStep('Generating main content (this takes a moment)...');
      const mainRes = await fetch('/api/training/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: script,
          voice,
          type: 'main',
          episodeId: savedEpisodeId,
        }),
      });
      const mainData = await mainRes.json();
      if (!mainData.success) throw new Error(mainData.error);
      generatedMainUrl = mainData.audioUrl;
      setMainAudioUrl(generatedMainUrl);

      // Step 3: Generate outro audio
      if (includeOutro) {
        setGeneratingStep('Generating outro...');
        const outroRes = await fetch('/api/training/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: outroText,
            voice,
            type: 'outro',
            episodeId: savedEpisodeId,
          }),
        });
        const outroData = await outroRes.json();
        if (!outroData.success) throw new Error(outroData.error);
        generatedOutroUrl = outroData.audioUrl;
        setOutroAudioUrl(generatedOutroUrl);
      }

      // Step 4: Auto-generate background music
      let generatedMusicUrl: string | null = null;
      if (enableMusic && musicVolume > 0) {
        setGeneratingStep('Generating background music...');
        // Estimate duration from script word count (~140 words/min) + intro/outro overhead
        const estimatedSpeechSeconds = Math.ceil((script.split(' ').length / 140) * 60) + 30;
        // Cap at 300s (Mubert max), loop will handle longer episodes
        const musicDuration = Math.min(estimatedSpeechSeconds, 300);
        try {
          const musicRes = await fetch('/api/training/generate-music', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mood: musicMood, duration: musicDuration }),
          });
          const musicData = await musicRes.json();
          if (musicData.success) {
            generatedMusicUrl = musicData.musicUrl;
          } else {
            console.warn('Music generation failed, continuing without music:', musicData.error);
          }
        } catch (e) {
          console.warn('Music generation failed, continuing without music:', e);
        }
      }

      // Step 5: Mix all audio together
      setGeneratingStep('Mixing audio...');
      const mixRes = await fetch('/api/training/mix-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          introUrl: generatedIntroUrl || null,
          mainUrl: generatedMainUrl,
          outroUrl: generatedOutroUrl || null,
          musicUrl: generatedMusicUrl,
          musicVolume,
          episodeId: savedEpisodeId,
        }),
      });
      const mixData = await mixRes.json();
      if (!mixData.success) throw new Error(mixData.error);

      setAudioUrl(mixData.audioUrl);
      setDuration(mixData.duration);
      setGeneratingStep('');

      // Update episode with audio URL and duration
      await fetch(`/api/training/episodes/${savedEpisodeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_url: mixData.audioUrl,
          duration_seconds: mixData.duration,
          script,
          transcript: script,
        }),
      });

    } catch (e: any) {
      console.error('Audio generation error:', e);
      setError(e.message || 'Failed to generate audio');
      setGeneratingStep('');
    } finally {
      setGeneratingAudio(false);
    }
  };

  const saveEpisodeDraft = async (): Promise<string | null> => {
    try {
      const body = {
        title,
        description,
        episode_number: episodeNumber ? parseInt(episodeNumber) : null,
        season_number: parseInt(seasonNumber) || 1,
        category,
        script,
        voice_model: voice,
        status: 'draft',
        include_intro: includeIntro,
        include_outro: includeOutro,
        music_volume: musicVolume,
      };

      const url = isEditing ? `/api/training/episodes/${episode.id}` : '/api/training/episodes';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) return data.episode.id;
      setError(data.error || 'Failed to save episode');
      return null;
    } catch (e: any) {
      setError(e.message || 'Failed to save episode');
      return null;
    }
  };

  const handleSave = async (publish = false) => {
    if (!title) {
      setError('Title is required');
      setActiveTab('details');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const body = {
        title,
        description,
        episode_number: episodeNumber ? parseInt(episodeNumber) : null,
        season_number: parseInt(seasonNumber) || 1,
        category,
        script,
        voice_model: voice,
        status: publish ? 'published' : 'draft',
        include_intro: includeIntro,
        include_outro: includeOutro,
        music_volume: musicVolume,
        audio_url: audioUrl || null,
        duration_seconds: duration || null,
        transcript: script,
      };

      const url = isEditing ? `/api/training/episodes/${episode.id}` : '/api/training/episodes';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'details', label: '1. Details' },
    { id: 'content', label: '2. Content' },
    { id: 'production', label: '3. Production' },
    { id: 'generate', label: '4. Generate' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 text-lg">
            🎙️ {isEditing ? 'Edit Episode' : 'Create New Episode'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#2B4C7E] text-[#2B4C7E]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* Tab 1: Details */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Episode Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIntroText(`Apex Affinity Group presents: ${e.target.value}`);
                  }}
                  placeholder="e.g., Handling the Price Objection"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Episode #</label>
                  <input
                    type="number"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(e.target.value)}
                    placeholder="e.g., 1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Season #</label>
                  <input
                    type="number"
                    value={seasonNumber}
                    onChange={(e) => setSeasonNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what agents will learn..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => setActiveTab('content')}
                className="bg-[#2B4C7E] text-white px-4 py-2 rounded-lg text-sm font-medium w-full"
              >
                Next: Content →
              </button>
            </div>
          )}

          {/* Tab 2: Content */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Option A:</strong> Let AI generate a script from a topic prompt<br />
                <strong>Option B:</strong> Write or paste your own script below
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-sm text-gray-800">🤖 AI Generate Script</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Prompt</label>
                  <textarea
                    value={scriptTopic}
                    onChange={(e) => setScriptTopic(e.target.value)}
                    placeholder="e.g., How to handle when a prospect says 'It's too expensive' — include specific rebuttals and closing techniques"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Duration (min)</label>
                    <select
                      value={scriptDuration}
                      onChange={(e) => setScriptDuration(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {['2', '3', '5', '7', '10'].map((d) => (
                        <option key={d} value={d}>{d} minutes</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateScript}
                    disabled={generatingScript || !scriptTopic || !title}
                    className="bg-[#2B4C7E] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 mt-5"
                  >
                    {generatingScript ? '⏳ Generating...' : '✨ Generate Script'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Script</label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Your training script will appear here, or write your own..."
                  rows={12}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-xs"
                />
                {script && (
                  <p className="text-xs text-gray-500 mt-1">
                    ~{Math.round(script.split(' ').length / 150)} min read • {script.split(' ').length} words
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveTab('production')}
                className="bg-[#2B4C7E] text-white px-4 py-2 rounded-lg text-sm font-medium w-full"
              >
                Next: Production Settings →
              </button>
            </div>
          )}

          {/* Tab 3: Production Settings */}
          {activeTab === 'production' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voice</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {VOICES.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeIntro"
                    checked={includeIntro}
                    onChange={(e) => setIncludeIntro(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="includeIntro" className="text-sm font-medium text-gray-700">Include Intro</label>
                </div>
                {includeIntro && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Intro Script</label>
                    <input
                      type="text"
                      value={introText}
                      onChange={(e) => setIntroText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeOutro"
                    checked={includeOutro}
                    onChange={(e) => setIncludeOutro(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="includeOutro" className="text-sm font-medium text-gray-700">Include Outro</label>
                </div>
                {includeOutro && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Outro Script</label>
                    <input
                      type="text"
                      value={outroText}
                      onChange={(e) => setOutroText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Background Music</label>
                  <button
                    type="button"
                    onClick={() => setEnableMusic((v) => !v)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      enableMusic ? 'bg-[#2B4C7E]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        enableMusic ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                {enableMusic && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Music Mood</label>
                      <select
                        value={musicMood}
                        onChange={(e) => setMusicMood(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="professional">🎼 Professional — Corporate / Business</option>
                        <option value="motivational">🚀 Motivational — Inspiring / Uplifting</option>
                        <option value="calm">🌊 Calm — Ambient / Relaxing</option>
                        <option value="energetic">⚡ Energetic — Upbeat / Dynamic</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">
                        AI will generate music perfectly timed to your episode — no files to upload.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Volume: {musicVolume}%</label>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                        className="w-full accent-[#2B4C7E]"
                      />
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setActiveTab('generate')}
                className="bg-[#2B4C7E] text-white px-4 py-2 rounded-lg text-sm font-medium w-full"
              >
                Next: Preview & Generate →
              </button>
            </div>
          )}

          {/* Tab 4: Generate Audio */}
          {activeTab === 'generate' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-sm text-gray-800">Episode Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Title:</span> {title || '—'}</div>
                  <div><span className="text-gray-500">Category:</span> {CATEGORIES.find(c => c.value === category)?.label || '—'}</div>
                  <div><span className="text-gray-500">Voice:</span> {VOICES.find(v => v.value === voice)?.label.split('—')[0] || '—'}</div>
                  <div><span className="text-gray-500">Script:</span> {script ? `${script.split(' ').length} words` : 'None'}</div>
                  <div><span className="text-gray-500">Intro:</span> {includeIntro ? '✅ Yes' : '❌ No'}</div>
                  <div><span className="text-gray-500">Outro:</span> {includeOutro ? '✅ Yes' : '❌ No'}</div>
                  <div>
                    <span className="text-gray-500">Music:</span>{' '}
                    {enableMusic ? `🎵 ${musicMood} (${musicVolume}%)` : '❌ None'}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              {!audioUrl ? (
                <button
                  onClick={handleGenerateFullAudio}
                  disabled={generatingAudio || !script || !title}
                  className="w-full bg-[#2B4C7E] text-white py-3 rounded-lg font-medium text-sm disabled:opacity-50"
                >
                  {generatingAudio ? (
                    <span>⏳ {generatingStep || 'Generating...'}</span>
                  ) : (
                    '🎙️ Generate Full Episode Audio'
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    ✅ Audio generated successfully! ({Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')} min)
                  </div>
                  <audio controls src={audioUrl} className="w-full" />
                  <button
                    onClick={handleGenerateFullAudio}
                    disabled={generatingAudio}
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    🔄 Regenerate Audio
                  </button>
                </div>
              )}

              {/* Individual track previews */}
              {(introAudioUrl || mainAudioUrl || outroAudioUrl) && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Individual Tracks</h3>
                  {introAudioUrl && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Intro</p>
                      <audio controls src={introAudioUrl} className="w-full h-8" />
                    </div>
                  )}
                  {mainAudioUrl && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Main Content</p>
                      <audio controls src={mainAudioUrl} className="w-full h-8" />
                    </div>
                  )}
                  {outroAudioUrl && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Outro</p>
                      <audio controls src={outroAudioUrl} className="w-full h-8" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 text-sm bg-[#2B4C7E] text-white rounded-lg font-medium hover:bg-[#1e3555] disabled:opacity-50"
          >
            {saving ? 'Publishing...' : '⚡ Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
