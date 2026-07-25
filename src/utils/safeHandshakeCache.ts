export const HANDSHAKE_CACHE_KEY = 'solutium_handshake_cache';

const HANDSHAKE_CACHE_VERSION = 2;
const HANDSHAKE_CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_HANDSHAKE_CACHE_BYTES = 4096;

type SafeHandshakeCacheEntry = {
  version: number;
  cachedAt: number;
  expiresAt: number;
  projectId?: string | null;
  siteId?: string | null;
  appId?: string | null;
  siteName?: string | null;
  mode?: string | null;
  source?: string | null;
};

type WriteHandshakeCacheResult = {
  saved: boolean;
  skipped: boolean;
  reason?: 'too_large' | 'storage_unavailable' | 'quota_exceeded' | 'invalid_payload';
  serializedBytes: number;
  entry: SafeHandshakeCacheEntry | null;
};

const warnedKeys = new Set<string>();

const warnOnce = (key: string, message: string, details?: Record<string, unknown>) => {
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);
  if (details) {
    console.warn(message, details);
  } else {
    console.warn(message);
  }
};

const getStorage = (): Storage | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};

const asText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
};

export const estimateSerializedSize = (value: unknown) => {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(serialized).length;
  }
  return serialized.length;
};

export const isQuotaExceededError = (error: unknown) => {
  const candidate = error as { name?: string; code?: number; message?: string } | null;
  const message = String(candidate?.message || '').toLowerCase();
  return (
    candidate?.name === 'QuotaExceededError' ||
    candidate?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    candidate?.code === 22 ||
    candidate?.code === 1014 ||
    message.includes('quotaexceedederror') ||
    message.includes('exceeded the quota') ||
    message.includes('quota')
  );
};

export const clearHandshakeCache = () => {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(HANDSHAKE_CACHE_KEY);
    return true;
  } catch {
    return false;
  }
};

export const buildSafeHandshakeCacheEntry = (payload: Record<string, any> | null | undefined): SafeHandshakeCacheEntry | null => {
  if (!payload || typeof payload !== 'object') return null;

  const cachedAt = Date.now();
  return {
    version: HANDSHAKE_CACHE_VERSION,
    cachedAt,
    expiresAt: cachedAt + HANDSHAKE_CACHE_TTL_MS,
    projectId: asText(payload.projectId || payload.project_id || payload.satellite_id),
    siteId: asText(payload.site_id || payload.siteId || payload.site?.id || payload.currentSite?.id),
    appId: asText(payload.appId || payload.app_id),
    siteName: asText(payload.siteName || payload.site_name || payload.site?.name),
    mode: asText(payload.mode || payload.launchMode),
    source: asText(payload.type || payload.source)
  };
};

export const readHandshakeCache = (): SafeHandshakeCacheEntry | null => {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(HANDSHAKE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    if (!parsed || parsed.version !== HANDSHAKE_CACHE_VERSION) {
      clearHandshakeCache();
      return null;
    }

    if (typeof parsed.expiresAt !== 'number' || parsed.expiresAt <= Date.now()) {
      clearHandshakeCache();
      return null;
    }

    return parsed;
  } catch {
    clearHandshakeCache();
    return null;
  }
};

export const writeHandshakeCache = (payload: Record<string, any> | null | undefined): WriteHandshakeCacheResult => {
  const entry = buildSafeHandshakeCacheEntry(payload);
  if (!entry) {
    return { saved: false, skipped: true, reason: 'invalid_payload', serializedBytes: 0, entry: null };
  }

  const serialized = JSON.stringify(entry);
  const serializedBytes = estimateSerializedSize(serialized);
  if (serializedBytes > MAX_HANDSHAKE_CACHE_BYTES) {
    clearHandshakeCache();
    warnOnce('handshake-cache-too-large', '[Handshake cache] Safe cache entry was not persisted because it is too large.', {
      serializedBytes,
      maxBytes: MAX_HANDSHAKE_CACHE_BYTES
    });
    return { saved: false, skipped: true, reason: 'too_large', serializedBytes, entry };
  }

  const storage = getStorage();
  if (!storage) {
    return { saved: false, skipped: true, reason: 'storage_unavailable', serializedBytes, entry };
  }

  try {
    storage.setItem(HANDSHAKE_CACHE_KEY, serialized);
    return { saved: true, skipped: false, serializedBytes, entry };
  } catch (error) {
    if (isQuotaExceededError(error)) {
      clearHandshakeCache();
      warnOnce('handshake-cache-quota', '[Handshake cache] localStorage quota exceeded. Continuing with in-memory handshake state.', {
        serializedBytes,
        maxBytes: MAX_HANDSHAKE_CACHE_BYTES
      });
      return { saved: false, skipped: true, reason: 'quota_exceeded', serializedBytes, entry };
    }
    return { saved: false, skipped: true, reason: 'storage_unavailable', serializedBytes, entry };
  }
};

export const warnHandshakePendingOnce = () => {
  warnOnce('supabase-handshake-pending', 'Supabase client not initialized. Waiting for handshake.');
};
