'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, CheckCircle } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
  audioName?: string;
  onComplete?: () => void;
  distributorId?: string;
}

export default function AudioPlayer({ url, audioName, onComplete, distributorId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const markComplete = async () => {
    if (!isCompleted) {
      setIsCompleted(true);

      // Track completion in database
      if (distributorId && audioName) {
        await fetch('/api/journey/complete-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            distributorId,
            mediaType: 'audio',
            mediaName: audioName,
          }),
        });
      }

      // Trigger callback
      onComplete?.();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Mark complete at 90%
      const progress = (audio.currentTime / audio.duration) * 100;
      if (progress >= 90 && !isCompleted) {
        markComplete();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      markComplete();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isCompleted]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="my-4 rounded-lg overflow-hidden shadow-lg border-2 border-purple-200 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 p-6">
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
          <Volume2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg leading-tight">
            {audioName || 'Audio Training'}
          </h4>
          {isCompleted && (
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-green-300 text-sm font-medium">Completed!</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar - Interactive */}
      <div className="mb-5">
        <div
          onClick={handleSeek}
          className="w-full h-3 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:bg-white/30 transition-colors backdrop-blur-sm"
        >
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-100 relative"
            style={{ width: `${progress}%` }}
          >
            {/* Animated pulse on playhead */}
            {isPlaying && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-white/80 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        {/* Restart Button */}
        <button
          onClick={restart}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 backdrop-blur-sm group"
          title="Restart"
        >
          <RotateCcw className="w-5 h-5 text-white group-hover:rotate-[-360deg] transition-transform duration-500" />
        </button>

        {/* Play/Pause Button - Main */}
        <button
          onClick={togglePlay}
          className="p-5 bg-white hover:bg-blue-50 rounded-full transition-all transform hover:scale-110 shadow-2xl group"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
          ) : (
            <Play className="w-8 h-8 text-blue-600 group-hover:text-blue-700 ml-1" />
          )}
        </button>

        {/* Speed Control */}
        <button
          onClick={() => {
            if (audioRef.current) {
              const speeds = [1, 1.25, 1.5, 1.75, 2];
              const currentSpeed = audioRef.current.playbackRate;
              const currentIndex = speeds.indexOf(currentSpeed);
              const nextIndex = (currentIndex + 1) % speeds.length;
              audioRef.current.playbackRate = speeds[nextIndex];
            }
          }}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
          title="Playback speed"
        >
          <span className="text-white font-bold text-sm">
            {audioRef.current?.playbackRate || 1}x
          </span>
        </button>
      </div>

      {/* Waveform Effect (decorative) */}
      {isPlaying && (
        <div className="flex items-center justify-center gap-1 mt-5 h-8">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-white/40 rounded-full animate-pulse"
              style={{
                height: `${20 + Math.random() * 80}%`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
