import { getStoredLaunchAccessSession } from './secureLaunchSession';

export type CatalogImageVariantKey = 'thumbnail' | 'card' | 'detail';
export type CatalogImageResolutionContext =
  | { type: 'editor'; projectId: string }
  | { type: 'published'; siteId: string };

export type CatalogImageVariantResolution = {
  urlsByAssetId: Record<string, string>;
  expiresInSeconds: number;
};

const MAX_BATCH_SIZE = 100;
const DEFAULT_TTL_SECONDS = 300;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const cache = new Map<string, { url: string; expiresAt: number; retryCount: number }>();

const isAssetId = (value: unknown): value is string => typeof value === 'string' && UUID_PATTERN.test(value.trim());
const apiBaseUrl = () => String(import.meta.env?.VITE_APP_MADRE_API_URL || import.meta.env?.VITE_API_BASE_URL || 'https://app.solutium.app').replace(/\/$/, '');
const cacheKey = (context: CatalogImageResolutionContext, variantKey: CatalogImageVariantKey, assetId: string) =>
  `${context.type}:${context.type === 'editor' ? context.projectId : context.siteId}:${variantKey}:${assetId}`;

const normalizeAssetIds = (assetIds: unknown[]) => [...new Set(assetIds.filter(isAssetId).map((assetId) => assetId.trim()))];

export const isSignedCatalogImageUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value) return false;
  try {
    const url = new URL(value);
    return ['X-Amz-Signature', 'X-Amz-Credential', 'token', 'signature'].some((key) => url.searchParams.has(key));
  } catch {
    return false;
  }
};

export const sanitizePersistedCatalogImageUrl = (value: unknown) =>
  isSignedCatalogImageUrl(value) ? '' : (typeof value === 'string' ? value.trim() : '');

export const clearCatalogImageVariantCache = (context?: CatalogImageResolutionContext) => {
  if (!context) return cache.clear();
  const prefix = `${context.type}:${context.type === 'editor' ? context.projectId : context.siteId}:`;
  for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key);
};

export const invalidateCatalogImageVariant = (context: CatalogImageResolutionContext, variantKey: CatalogImageVariantKey, assetId: string) => {
  cache.delete(cacheKey(context, variantKey, assetId));
};

export async function resolveCatalogImageVariants(input: {
  context: CatalogImageResolutionContext;
  variantKey: CatalogImageVariantKey;
  assetIds: unknown[];
  signal?: AbortSignal;
}): Promise<CatalogImageVariantResolution> {
  const assetIds = normalizeAssetIds(input.assetIds);
  if (!assetIds.length) return { urlsByAssetId: {}, expiresInSeconds: DEFAULT_TTL_SECONDS };

  const now = Date.now();
  const urlsByAssetId: Record<string, string> = {};
  let shortestTtlSeconds = DEFAULT_TTL_SECONDS;
  const unresolved = assetIds.filter((assetId) => {
    const entry = cache.get(cacheKey(input.context, input.variantKey, assetId));
    if (!entry || entry.expiresAt <= now + 15_000) return true;
    urlsByAssetId[assetId] = entry.url;
    return false;
  });

  for (let offset = 0; offset < unresolved.length; offset += MAX_BATCH_SIZE) {
    const batch = unresolved.slice(offset, offset + MAX_BATCH_SIZE);
    const endpoint = input.context.type === 'editor'
      ? `${apiBaseUrl()}/api/projects/${encodeURIComponent(input.context.projectId)}/image-assets/variant-urls`
      : `${apiBaseUrl()}/api/public/published-sites/${encodeURIComponent(input.context.siteId)}/image-assets/variant-urls`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (input.context.type === 'editor') {
      const token = getStoredLaunchAccessSession().token;
      if (!token) continue;
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ variantKey: input.variantKey, assetIds: batch }),
        signal: input.signal,
        credentials: 'omit'
      });
      if (!response.ok) continue;
      const payload = await response.json().catch(() => null) as { urls?: Record<string, unknown>; expiresInSeconds?: number; expiresIn?: number } | null;
      const ttlSeconds = Number(payload?.expiresInSeconds ?? payload?.expiresIn ?? DEFAULT_TTL_SECONDS) || DEFAULT_TTL_SECONDS;
      shortestTtlSeconds = Math.min(shortestTtlSeconds, ttlSeconds);
      const expiresAt = Date.now() + Math.max(1, ttlSeconds) * 1000;
      for (const [assetId, url] of Object.entries(payload?.urls || {})) {
        if (batch.includes(assetId) && typeof url === 'string' && url) {
          urlsByAssetId[assetId] = url;
          cache.set(cacheKey(input.context, input.variantKey, assetId), { url, expiresAt, retryCount: 0 });
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
    }
  }

  return { urlsByAssetId, expiresInSeconds: shortestTtlSeconds };
}

export const resolveCatalogImageUrl = (input: {
  context: CatalogImageResolutionContext;
  variantKey: CatalogImageVariantKey;
  assetId?: string | null;
  legacyUrl?: string | null;
  urlsByAssetId: Record<string, string>;
}) => (input.assetId ? input.urlsByAssetId[input.assetId] || input.legacyUrl || '' : input.legacyUrl || '');
