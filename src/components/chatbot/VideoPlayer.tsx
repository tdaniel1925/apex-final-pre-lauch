'use client';

import { useState, useEffect } from 'react';
import { Play, CheckCircle, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  onComplete?: () => void;
  distributorId?: string;
  videoName?: string;
}

export default function VideoPlayer({ url, onComplete, distributorId, videoName }: VideoPlayerProps) {
  const [isWatched, setIsWatched] = useState(false);
  const [videoType, setVideoType] = useState<'youtube' | 'vimeo' | 'direct'>('direct');
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    // Parse URL and determine video type
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setVideoType('youtube');
      const videoId = extractYouTubeId(url);
      setEmbedUrl(`https://www.youtube.com/embed/${videoId}?enablejsapi=1`);
    } else if (url.includes('vimeo.com')) {
      setVideoType('vimeo');
      const videoId = extractVimeoId(url);
      setEmbedUrl(`https://player.vimeo.com/video/${videoId}`);
    } else {
      setVideoType('direct');
      setEmbedUrl(url);
    }
  }, [url]);

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const extractVimeoId = (url: string): string => {
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : '';
  };

  const handleVideoEnd = async () => {
    if (!isWatched) {
      setIsWatched(true);

      // Track completion in database
      if (distributorId && videoName) {
        await fetch('/api/journey/complete-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            distributorId,
            mediaType: 'video',
            mediaName: videoName,
          }),
        });
      }

      // Trigger callback
      onComplete?.();
    }
  };

  // For iframe players, we'll use message events to detect completion
  useEffect(() => {
    if (videoType === 'youtube') {
      const handleMessage = (event: MessageEvent) => {
        if (event.origin === 'https://www.youtube.com') {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'onStateChange' && data.info === 0) {
              // Video ended (state 0)
              handleVideoEnd();
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [videoType, isWatched]);

  // Don't render if embedUrl is empty
  if (!embedUrl) {
    return (
      <div className="my-4 rounded-lg overflow-hidden shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <p className="text-slate-600">Loading video...</p>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Video Container */}
      <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
        {videoType === 'youtube' || videoType === 'vimeo' ? (
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={embedUrl}
            controls
            className="absolute top-0 left-0 w-full h-full"
            onEnded={handleVideoEnd}
            onTimeUpdate={(e) => {
              // Mark as watched at 90% completion
              const video = e.currentTarget;
              if (video.currentTime / video.duration >= 0.9 && !isWatched) {
                handleVideoEnd();
              }
            }}
          />
        )}

        {/* Completion Overlay */}
        {isWatched && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-bold">Completed!</span>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="px-4 py-3 bg-white border-t border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {videoName || 'Training Video'}
              </p>
              {isWatched && (
                <p className="text-xs text-green-600 font-medium">
                  ✅ You've watched this video
                </p>
              )}
            </div>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
