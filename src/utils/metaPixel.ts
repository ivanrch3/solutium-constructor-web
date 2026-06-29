export const META_PIXEL_SCRIPT_SRC = 'https://connect.facebook.net/en_US/fbevents.js';
export const META_PIXEL_DEBUG_QUERY_PARAM = 'meta_pixel_debug';

const MIN_META_PIXEL_ID_LENGTH = 5;
const MAX_META_PIXEL_ID_LENGTH = 32;

export const normalizeMetaPixelId = (value: unknown): string => String(value ?? '').trim();

export const isValidMetaPixelId = (value: unknown): boolean => {
  const normalized = normalizeMetaPixelId(value);
  return /^\d+$/.test(normalized) && normalized.length >= MIN_META_PIXEL_ID_LENGTH && normalized.length <= MAX_META_PIXEL_ID_LENGTH;
};

export const getMetaPixelStatus = (enabled: unknown, pixelId: unknown) => {
  const normalizedPixelId = normalizeMetaPixelId(pixelId);
  const hasPixelId = normalizedPixelId.length > 0;
  const validPixelId = isValidMetaPixelId(normalizedPixelId);
  const active = Boolean(enabled) && validPixelId;

  return {
    normalizedPixelId,
    hasPixelId,
    validPixelId,
    active
  };
};

export const isMetaPixelDebugMode = (search: string): boolean => {
  if (typeof URLSearchParams === 'undefined') return false;
  const params = new URLSearchParams(search);
  return params.get(META_PIXEL_DEBUG_QUERY_PARAM) === 'true';
};

export const shouldInjectMetaPixel = (hostname: string): boolean => {
  const normalizedHost = String(hostname || '').toLowerCase();
  if (!normalizedHost) return false;
  if (normalizedHost === 'localhost' || normalizedHost === '127.0.0.1') return false;
  if (normalizedHost.endsWith('.ondigitalocean.app')) return false;
  return true;
};
