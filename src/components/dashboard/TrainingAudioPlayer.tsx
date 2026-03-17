// =============================================
// Training Audio Player Component
// Professional audio player with playlist support
// =============================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';

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

  const handleClose = () => {
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

  // Thin Full-Width Player - Above Stats Cards
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg shadow-md border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between gap-6">
        {/* Left Section: Title & Play Button */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex-shrink-0 p-3 rounded-full bg-white hover:bg-slate-100 transition-all transform hover:scale-105"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-slate-900" />
            ) : (
              <Play className="w-5 h-5 text-slate-900" />
            )}
          </button>

          {/* Track Title */}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white leading-tight">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Training Audio
            </p>
          </div>
        </div>

        {/* Middle Section: Progress Bar & Time */}
        <div className="flex-1 flex items-center gap-4 min-w-0">
          {/* Time Display */}
          <div className="flex items-center gap-2 text-sm text-slate-300 flex-shrink-0">
            <span>{formatTime(currentTime)}</span>
            <span className="text-slate-500">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Progress Bar */}
          <div
            className="flex-1 h-2 bg-slate-700 rounded-full cursor-pointer overflow-hidden"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-white to-slate-300 transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>
        </div>

        {/* Right Section: Volume & Close */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Volume Control */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
            aria-label="Close player"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={currentTrack.url} preload="metadata" />
    </div>
  );
}
