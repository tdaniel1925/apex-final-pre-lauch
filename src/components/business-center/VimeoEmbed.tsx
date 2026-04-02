'use client';

interface VimeoEmbedProps {
  videoId: string;
  title: string;
}

export function VimeoEmbed({ videoId, title }: VimeoEmbedProps) {
  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`}
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title}
      />
    </div>
  );
}
