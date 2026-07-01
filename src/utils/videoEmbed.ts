export type VideoProvider = 'youtube' | 'vimeo' | 'direct' | 'unknown';

const YOUTUBE_ID_PATTERN = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/i;

export const resolveVideoProviderFromUrl = (url?: string): VideoProvider => {
  const normalizedUrl = String(url || '').trim().toLowerCase();
  if (!normalizedUrl) return 'unknown';
  if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) return 'youtube';
  if (normalizedUrl.includes('vimeo.com')) return 'vimeo';
  return 'direct';
};

export const resolveVideoExternalId = (url?: string, provider?: VideoProvider): string | undefined => {
  const normalizedUrl = String(url || '').trim();
  if (!normalizedUrl) return undefined;

  if (provider === 'youtube') {
    const match = normalizedUrl.match(YOUTUBE_ID_PATTERN);
    return match && match[1]?.length === 11 ? match[1] : undefined;
  }

  if (provider === 'vimeo') {
    const candidate = normalizedUrl.split('/').filter(Boolean).pop()?.split('?')[0];
    return candidate || undefined;
  }

  return undefined;
};

type VideoEmbedOptions = {
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
  hoverToPlay?: boolean;
};

export const buildVideoEmbedUrl = (
  sourceUrl: string | undefined,
  options: VideoEmbedOptions = {}
): string | undefined => {
  const normalizedUrl = String(sourceUrl || '').trim();
  if (!normalizedUrl) return undefined;

  const provider = resolveVideoProviderFromUrl(normalizedUrl);
  const shouldAutoplay = Boolean(options.autoplay || options.hoverToPlay);
  const shouldLoop = Boolean(options.loop);
  const shouldShowControls = options.controls !== false;

  if (provider === 'youtube') {
    const videoId = resolveVideoExternalId(normalizedUrl, provider);
    if (!videoId) return normalizedUrl;

    const params = new URLSearchParams({
      autoplay: shouldAutoplay ? '1' : '0',
      controls: shouldShowControls ? '1' : '0',
      mute: shouldAutoplay ? '1' : '0',
      playsinline: '1',
      rel: '0',
    });

    if (shouldLoop) {
      params.set('loop', '1');
      params.set('playlist', videoId);
    } else {
      params.set('loop', '0');
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  if (provider === 'vimeo') {
    const videoId = resolveVideoExternalId(normalizedUrl, provider);
    if (!videoId) return normalizedUrl;

    const params = new URLSearchParams({
      autoplay: shouldAutoplay ? '1' : '0',
      loop: shouldLoop ? '1' : '0',
      muted: shouldAutoplay ? '1' : '0',
    });

    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  }

  return normalizedUrl;
};

export const getEmbedFrameReferrerPolicy = (
  provider: VideoProvider
): 'strict-origin-when-cross-origin' | undefined => {
  if (provider === 'youtube' || provider === 'vimeo') {
    return 'strict-origin-when-cross-origin';
  }

  return undefined;
};
