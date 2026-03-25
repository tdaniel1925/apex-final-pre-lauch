'use client';

import { useState } from 'react';
import { Play, CheckCircle } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  distributorId: string;
  videoName: string;
  onComplete?: () => void;
}

/**
 * VideoPlayer component for embedding videos in chat messages
 * Supports YouTube URLs and tracks completion
 */
export default function VideoPlayer({ url, distributorId, videoName, onComplete }: VideoPlayerProps) {
  const [hasWatched, setHasWatched] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract YouTube video ID
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Extract Vimeo video ID
  const getVimeoId = (url: string): string | null => {
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const youtubeId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);
  const isLocalVideo = url.startsWith('/') || url.startsWith('./');

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const markAsWatched = () => {
    if (!hasWatched) {
      setHasWatched(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration > 0) {
      const percentWatched = (video.currentTime / video.duration) * 100;
      if (percentWatched >= 90 && !hasWatched) {
        markAsWatched();
      }
    }
  };

  // Local MP4 video player
  if (isLocalVideo) {
    return (
      <div className="my-3">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
          <video
            controls
            className="w-full h-full"
            onTimeUpdate={handleVideoProgress}
            onEnded={markAsWatched}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {hasWatched && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Video watched!</span>
          </div>
        )}
      </div>
    );
  }

  // Vimeo video player
  if (vimeoId) {
    return (
      <div className="my-3">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden group hover:opacity-90 transition-opacity"
          >
            <div className="absolute inset-0 flex items-center justify-center bg-[#00adef]/10">
              <div className="w-16 h-16 bg-[#00adef] rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-lg font-semibold drop-shadow-lg">
                {videoName || 'Click to Play Video'}
              </p>
            </div>
          </button>
        ) : (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              onLoad={() => {
                // Mark as watched after 10 seconds
                setTimeout(markAsWatched, 10000);
              }}
            />
          </div>
        )}

        {hasWatched && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Video watched!</span>
          </div>
        )}
      </div>
    );
  }

  // YouTube video player
  if (youtubeId) {
    return (
      <div className="my-3">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden group hover:opacity-90 transition-opacity"
          >
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt={videoName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          </button>
        ) : (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              onLoad={() => {
                // Mark as watched after 10 seconds
                setTimeout(markAsWatched, 10000);
              }}
            />
          </div>
        )}

        {hasWatched && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Video watched!</span>
          </div>
        )}
      </div>
    );
  }

  // External link fallback (non-YouTube, non-Vimeo, non-local)
  return (
    <div className="my-3 p-4 bg-slate-100 border border-slate-300 rounded-lg">
      <p className="text-sm text-slate-600">
        🎥 <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {videoName || 'Watch Video'}
        </a>
      </p>
    </div>
  );
}
