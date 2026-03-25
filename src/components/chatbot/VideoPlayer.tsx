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

  const videoId = getYouTubeId(url);

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

  if (!videoId) {
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

  return (
    <div className="my-3">
      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden group hover:opacity-90 transition-opacity"
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
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
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
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
