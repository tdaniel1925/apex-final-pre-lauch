// =============================================
// Training Audio Player Component
// Professional audio player with playlist support
// =============================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, X, Minimize2, Maximize2 } from 'lucide-react';

interface AudioTrack {
  id: string;
  title: string;
  description: string;
  url: string;
}

// Training audio playlist - add more tracks here in the future
const TRAINING_PLAYLIST: AudioTrack[] = [
  {
    id: '20-20-conversation',
    title: 'How to Build Your Apex Business - The 20/20 Conversation',
    description: 'Essential training for building your business',
    url: '/training-audios/The 20_20 Conversation Training.mp3',
  },
  // Add more tracks here as they become available
  // {
  //   id: 'next-training',
  //   title: 'Next Training Topic',
  //   description: 'Description here',
  //   url: '/training-audios/next-training.mp3',
  // },
];

export default function TrainingAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRAINING_PLAYLIST[currentTrackIndex];

  useEffect(() => {
    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('training_audio_dismissed');
    if (dismissed === 'true') {
      setHidden(true);
    }

    // Check if user has minimized before
    const minimized = localStorage.getItem('training_audio_minimized');
    if (minimized === 'true') {
      setIsMinimized(true);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next track if available
      if (currentTrackIndex < TRAINING_PLAYLIST.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
        setIsPlaying(true);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = percentage * duration;
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    localStorage.setItem('training_audio_minimized', 'true');
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    localStorage.setItem('training_audio_minimized', 'false');
  };

  const handleClose = () => {
    setHidden(true);
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNeverShowAgain = () => {
    localStorage.setItem('training_audio_dismissed', 'true');
    setHidden(true);
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (hidden) return null;

  // Minimized Banner Mode - Sticky at top of dashboard
  if (isMinimized) {
    return (
      <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex-shrink-0 p-2 rounded-full bg-slate-700/50 hover:bg-slate-700 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentTrack.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              className="hidden md:block flex-1 h-1.5 bg-slate-700 rounded-full cursor-pointer overflow-hidden"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-white transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              type="button"
              onClick={handleMaximize}
              className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
              aria-label="Expand player"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
              aria-label="Close player"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} src={currentTrack.url} preload="metadata" />
      </div>
    );
  }

  // Full Player Mode - Next to CEO Video
  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-md max-w-sm">
      {/* Close and Minimize Buttons */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          type="button"
          onClick={handleMinimize}
          className="p-1 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition-colors"
          aria-label="Minimize player"
        >
          <Minimize2 className="w-4 h-4 text-white" />
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="p-1 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition-colors"
          aria-label="Close player"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Audio Player UI */}
      <div className="p-6 space-y-4">
        {/* Track Title */}
        <div>
          <h3 className="text-sm font-bold text-white leading-snug">
            {currentTrack.title}
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {currentTrack.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            className="w-full h-2 bg-slate-700 rounded-full cursor-pointer overflow-hidden"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-white to-slate-300 transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="group p-4 rounded-full bg-white hover:bg-slate-100 transition-all transform hover:scale-105"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-slate-900" />
            ) : (
              <Play className="w-6 h-6 text-slate-900" />
            )}
          </button>

          {/* Volume Control */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Playlist Info */}
        {TRAINING_PLAYLIST.length > 1 && (
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              Track {currentTrackIndex + 1} of {TRAINING_PLAYLIST.length}
            </p>
          </div>
        )}

        {/* Don't Show Again Link */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleNeverShowAgain}
            className="text-xs text-slate-400 hover:text-slate-300 underline w-full text-center"
          >
            Don't show again
          </button>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={currentTrack.url} preload="metadata" />
    </div>
  );
}
