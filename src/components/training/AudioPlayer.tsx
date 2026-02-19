'use client';

// =============================================
// Audio Player Component
// Custom player with progress tracking
// =============================================

import { useRef, useState, useEffect, useCallback } from 'react';

interface Props {
  src: string;
  episodeId: string;
  initialPosition: number;
  onProgressUpdate: (
    episodeId: string,
    currentPosition: number,
    durationSeconds: number,
    completed: boolean
  ) => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function AudioPlayer({ src, episodeId, initialPosition, onProgressUpdate }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speedIndex, setSpeedIndex] = useState(2); // default 1x
  const [loaded, setLoaded] = useState(false);

  // Set initial position once metadata loads
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => {
      setDuration(audio.duration);
      if (initialPosition > 0 && initialPosition < audio.duration) {
        audio.currentTime = initialPosition;
        setCurrentTime(initialPosition);
      }
      setLoaded(true);
    };

    audio.addEventListener('loadedmetadata', handleLoaded);
    return () => audio.removeEventListener('loadedmetadata', handleLoaded);
  }, [initialPosition]);

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[speedIndex];
    }
  }, [speedIndex]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);

    const pct = audio.currentTime / audio.duration;
    const completed = pct >= 0.9;
    onProgressUpdate(episodeId, Math.floor(audio.currentTime), Math.floor(audio.duration), completed);
  }, [episodeId, onProgressUpdate]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    const audio = audioRef.current;
    if (!audio) return;
    onProgressUpdate(episodeId, Math.floor(audio.duration), Math.floor(audio.duration), true);
  }, [episodeId, onProgressUpdate]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const seek = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const cycleSpeed = () => {
    setSpeedIndex((prev) => (prev + 1) % SPEEDS.length);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Progress Bar */}
      <div className="mb-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          disabled={!loaded}
          className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #2B4C7E ${progressPct}%, #e5e7eb ${progressPct}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left: speed */}
        <button
          onClick={cycleSpeed}
          className="text-xs font-semibold text-gray-500 hover:text-gray-700 w-10 text-left"
        >
          {SPEEDS[speedIndex]}x
        </button>

        {/* Center: skip back / play / skip forward */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => seek(-15)}
            className="text-gray-500 hover:text-gray-800 transition-colors"
            title="Back 15s"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              <text x="8" y="15" fontSize="5" fill="currentColor">15</text>
            </svg>
          </button>

          <button
            onClick={togglePlay}
            disabled={!loaded}
            className="w-10 h-10 rounded-full bg-[#2B4C7E] text-white flex items-center justify-center hover:bg-[#1e3555] transition-colors disabled:opacity-50"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button
            onClick={() => seek(15)}
            className="text-gray-500 hover:text-gray-800 transition-colors"
            title="Forward 15s"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z"/>
              <text x="8" y="15" fontSize="5" fill="currentColor">15</text>
            </svg>
          </button>
        </div>

        {/* Right: volume */}
        <div className="flex items-center gap-1.5 w-24">
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #9ca3af ${volume * 100}%, #e5e7eb ${volume * 100}%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
