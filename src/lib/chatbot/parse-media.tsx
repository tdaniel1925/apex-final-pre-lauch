import VideoPlayer from '@/components/chatbot/VideoPlayer';
import AudioPlayer from '@/components/chatbot/AudioPlayer';

export interface MediaItem {
  type: 'video' | 'audio';
  url: string;
  name?: string;
}

/**
 * Parse message content for [video:URL] and [audio:URL] syntax
 * Returns an array of text/media segments
 */
export function parseMediaContent(content: string, distributorId?: string) {
  const segments: Array<{
    type: 'text' | 'video' | 'audio';
    content: string;
    url?: string;
    name?: string;
  }> = [];

  // Regex patterns
  const videoPattern = /\[video:([^\]]+)\]/g;
  const audioPattern = /\[audio:([^\]]+)\]/g;

  let lastIndex = 0;
  const matches: Array<{ index: number; length: number; type: 'video' | 'audio'; url: string; name?: string }> = [];

  // Find all video matches
  let match;
  while ((match = videoPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'video',
      url: match[1],
      name: extractMediaName(match[1], 'video')
    });
  }

  // Find all audio matches
  while ((match = audioPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'audio',
      url: match[1],
      name: extractMediaName(match[1], 'audio')
    });
  }

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  // Build segments
  matches.forEach((match) => {
    // Add text before this match
    if (match.index > lastIndex) {
      const textContent = content.substring(lastIndex, match.index).trim();
      if (textContent) {
        segments.push({
          type: 'text',
          content: textContent,
        });
      }
    }

    // Add media segment
    segments.push({
      type: match.type,
      content: '',
      url: match.url,
      name: match.name,
    });

    lastIndex = match.index + match.length;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex).trim();
    if (textContent) {
      segments.push({
        type: 'text',
        content: textContent,
      });
    }
  }

  // If no media found, return the whole content as text
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: content,
    });
  }

  return segments;
}

/**
 * Extract a friendly name from the URL
 */
function extractMediaName(url: string, type: 'video' | 'audio'): string {
  try {
    // Try to get filename from URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || '';

    if (filename) {
      // Remove extension and clean up
      const name = filename.replace(/\.(mp4|mp3|wav|m4a|webm|ogg)$/i, '');
      return name
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  } catch (e) {
    // Invalid URL, just use default
  }

  return type === 'video' ? 'Training Video' : 'Audio Training';
}

/**
 * Check if content contains media
 */
export function containsMedia(content: string): boolean {
  return /\[(video|audio):[^\]]+\]/.test(content);
}

/**
 * Extract all media items from content
 */
export function extractMediaItems(content: string): MediaItem[] {
  const items: MediaItem[] = [];

  const videoPattern = /\[video:([^\]]+)\]/g;
  const audioPattern = /\[audio:([^\]]+)\]/g;

  let match;
  while ((match = videoPattern.exec(content)) !== null) {
    items.push({
      type: 'video',
      url: match[1],
      name: extractMediaName(match[1], 'video')
    });
  }

  while ((match = audioPattern.exec(content)) !== null) {
    items.push({
      type: 'audio',
      url: match[1],
      name: extractMediaName(match[1], 'audio')
    });
  }

  return items;
}
