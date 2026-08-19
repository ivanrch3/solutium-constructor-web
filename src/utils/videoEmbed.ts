export type VideoProvider = 'youtube' | 'vimeo' | 'direct' | 'unknown';
export type VideoFormat = 'landscape' | 'portrait';
export type VideoAspectRatio = '16/9' | '9/16' | '4/3';
export type ResolvedVideoSource = {
  provider: VideoProvider;
  videoId?: string;
  embedUrl?: string;
  format: VideoFormat;
  aspectRatio: VideoAspectRatio;
};

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const getYouTubeUrl = (url: string): URL | undefined => {
  try {
    return new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(url) ? url : `https://${url}`);
  } catch {
    return undefined;
  }
};

const getYouTubeVideoId = (url: string): string | undefined => {
  const parsedUrl = getYouTubeUrl(url);
  if (!parsedUrl) return undefined;

  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
  const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
  let candidate: string | null = null;

  if (hostname === 'youtu.be') {
    candidate = pathSegments[0] || null;
  } else if (hostname === 'youtube.com') {
    if (pathSegments[0] === 'watch') {
      candidate = parsedUrl.searchParams.get('v');
    } else if (['embed', 'shorts', 'v'].includes(pathSegments[0])) {
      candidate = pathSegments[1] || null;
    } else if (pathSegments[0] === 'u') {
      candidate = pathSegments[2] || null;
    }
  }

  return candidate && YOUTUBE_ID_PATTERN.test(candidate) ? candidate : undefined;
};

const isYouTubeShortUrl = (url: string): boolean => {
  const parsedUrl = getYouTubeUrl(url);
  if (!parsedUrl) return false;

  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
  return hostname === 'youtube.com' && parsedUrl.pathname.split('/').filter(Boolean)[0] === 'shorts';
};

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
    return getYouTubeVideoId(normalizedUrl);
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

const buildYouTubeEmbedUrl = (videoId: string, options: VideoEmbedOptions): string => {
  const shouldAutoplay = Boolean(options.autoplay || options.hoverToPlay);
  const shouldLoop = Boolean(options.loop);
  const shouldShowControls = options.controls !== false;
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
};

export const resolveVideoSource = (
  sourceUrl: string | undefined,
  options: VideoEmbedOptions = {}
): ResolvedVideoSource => {
  const normalizedUrl = String(sourceUrl || '').trim();
  const provider = resolveVideoProviderFromUrl(normalizedUrl);
  const videoId = resolveVideoExternalId(normalizedUrl, provider);
  const isShort = provider === 'youtube' && Boolean(videoId) && isYouTubeShortUrl(normalizedUrl);

  if (provider === 'youtube') {
    return {
      provider,
      videoId,
      embedUrl: videoId ? buildYouTubeEmbedUrl(videoId, options) : normalizedUrl || undefined,
      format: isShort ? 'portrait' : 'landscape',
      aspectRatio: isShort ? '9/16' : '16/9',
    };
  }

  return {
    provider,
    videoId,
    embedUrl: buildVideoEmbedUrl(normalizedUrl, options),
    format: 'landscape',
    aspectRatio: '16/9',
  };
};

export const resolveVideoAspectRatio = (
  configuredRatio: unknown,
  detectedRatio: VideoAspectRatio
): VideoAspectRatio => {
  if (configuredRatio === '16/9' || configuredRatio === '9/16' || configuredRatio === '4/3') {
    return configuredRatio;
  }

  return detectedRatio;
};

export const getVideoAspectRatioCss = (ratio: VideoAspectRatio): string => {
  return ratio.replace('/', ' / ');
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
    return resolveVideoSource(normalizedUrl, options).embedUrl;
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
