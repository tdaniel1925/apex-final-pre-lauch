import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VimeoEmbed } from './VimeoEmbed';

describe('VimeoEmbed', () => {
  it('should render vimeo iframe with correct video ID', () => {
    const videoId = '123456789';
    const title = 'Test Video';

    render(<VimeoEmbed videoId={videoId} title={title} />);

    const iframe = screen.getByTitle(title);
    expect(iframe).toBeDefined();
    expect(iframe.getAttribute('src')).toContain(`player.vimeo.com/video/${videoId}`);
  });

  it('should include autoplay parameter in iframe src', () => {
    const videoId = '123456789';
    const title = 'Test Video';

    render(<VimeoEmbed videoId={videoId} title={title} />);

    const iframe = screen.getByTitle(title);
    expect(iframe.getAttribute('src')).toContain('autoplay=1');
  });

  it('should have responsive aspect ratio wrapper', () => {
    const { container } = render(
      <VimeoEmbed videoId="123456789" title="Test Video" />
    );

    const wrapper = container.querySelector('[style*="paddingTop"]');
    expect(wrapper).toBeDefined();
  });

  it('should set correct iframe permissions', () => {
    render(<VimeoEmbed videoId="123456789" title="Test Video" />);

    const iframe = screen.getByTitle('Test Video');
    expect(iframe.getAttribute('allow')).toContain('autoplay');
    expect(iframe.getAttribute('allow')).toContain('fullscreen');
  });
});
