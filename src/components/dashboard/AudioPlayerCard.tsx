// =============================================
// Audio Player Card Component
// Compact audio player for dashboard
// =============================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Headphones } from 'lucide-react';

interface AudioTrack {
  id: string;
  title: string;
  url: string;
}

const TRAINING_PLAYLIST: AudioTrack[] = [
  {
    id: '20-20-conversation',
    title: 'How to Build Your Business',
    url: '/training-audios/The 20_20 Conversation Training.mp3',
  },
  {
    id: 'mastering-conversation',
    title: 'Mastering the Conversation',
    url: '/training-audios/Mastering the Conversation_ The Apex Way Podcast Episode (2).mp3',
  },
];

export default function AudioPlayerCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRAINING_PLAYLIST[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
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

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-md border border-slate-700 p-6 h-48 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/10 rounded-lg">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white">Training Audio</h3>
          <p className="text-xs text-slate-400 truncate">{currentTrack.title}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-white to-slate-300 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Play Button */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={togglePlay}
          className="p-3 rounded-full bg-white hover:bg-slate-100 transition-all transform hover:scale-105"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-slate-900" />
          ) : (
            <Play className="w-5 h-5 text-slate-900" />
          )}
        </button>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={currentTrack.url} preload="metadata" />
    </div>
  );
}
