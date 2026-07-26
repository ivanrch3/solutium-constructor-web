import { isWhatsAppOrdersCatalogView, type WhatsAppOrdersCatalogView } from './whatsappOrdersCatalogConfig';

type ViewPreferenceIdentity = {
  siteId?: string | null;
  publishedSiteId?: string | null;
  pageId?: string | null;
  host?: string | null;
  moduleId?: string | null;
};

const safeIdentityPart = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? encodeURIComponent(normalized) : null;
};

export const buildWhatsAppOrdersViewPreferenceKey = (identity: ViewPreferenceIdentity): string | null => {
  const moduleId = safeIdentityPart(identity.moduleId);
  if (!moduleId) return null;

  const siteId = safeIdentityPart(identity.siteId)
    || safeIdentityPart(identity.publishedSiteId);
  const host = safeIdentityPart(identity.host);
  const pageId = safeIdentityPart(identity.pageId);
  const siteIdentity = siteId || (host && pageId ? `${host}:${pageId}` : host);
  return siteIdentity ? `solutium:whatsapp-orders:view:${siteIdentity}:${moduleId}` : null;
};

export const readWhatsAppOrdersViewPreference = (key: string | null): WhatsAppOrdersCatalogView | null => {
  if (!key || typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(key);
    return isWhatsAppOrdersCatalogView(stored) ? stored : null;
  } catch {
    return null;
  }
};

export const writeWhatsAppOrdersViewPreference = (key: string | null, value: unknown): boolean => {
  if (!key || !isWhatsAppOrdersCatalogView(value) || typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};
