import { Page, PageSection, PublishedSite, WebBuilderSite } from '../types/schema';
import { getAppMadreBaseUrl, getStoredLaunchAccessSession } from './secureLaunchSession';

const EXPIRED_SESSION_MESSAGE = 'La sesión segura del Constructor ya no es válida. Por favor vuelve a lanzar el Constructor Web desde Solutium.';

export class SecureConstructorWriteError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'SecureConstructorWriteError';
    this.status = status;
    this.code = code;
  }
}

export const getSecureConstructorWriteSession = () => {
  const session = getStoredLaunchAccessSession();
  return {
    active: session.active,
    token: session.token,
    expiresAt: session.expiresAt
  };
};

export const hasActiveSecureConstructorWriteSession = () =>
  getSecureConstructorWriteSession().active;

const requestSecureConstructorWrite = async <T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> => {
  const session = getSecureConstructorWriteSession();
  if (!session.active || !session.token) {
    throw new SecureConstructorWriteError(EXPIRED_SESSION_MESSAGE, 401, 'LAUNCH_ACCESS_TOKEN_MISSING');
  }

  const response = await fetch(`${getAppMadreBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`
    },
    body: JSON.stringify(body)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    const status = response.status;
    const code = typeof result.error === 'string' ? result.error : `HTTP_${status}`;
    const message = status === 401 || status === 403
      ? EXPIRED_SESSION_MESSAGE
      : (typeof result.message === 'string' ? result.message : 'No se pudo guardar desde el Constructor.');
    throw new SecureConstructorWriteError(message, status, code);
  }

  return result as T;
};

export const saveSecureWebBuilderSiteDraft = async (
  site: Partial<WebBuilderSite>
): Promise<WebBuilderSite | null> => {
  const result = await requestSecureConstructorWrite<{ success: boolean; site?: WebBuilderSite }>(
    '/api/app-launcher/constructor/save-draft',
    { site }
  );
  return result.site || null;
};

export const upsertSecurePage = async (
  page: Partial<Page>
): Promise<Page | null> => {
  const result = await requestSecureConstructorWrite<{ success: boolean; page?: Page }>(
    '/api/app-launcher/constructor/upsert-page',
    { page }
  );
  return result.page || null;
};

export const upsertSecurePageSections = async (
  pageId: string,
  sections: Partial<PageSection>[]
): Promise<PageSection[]> => {
  const result = await requestSecureConstructorWrite<{ success: boolean; sections?: PageSection[] }>(
    '/api/app-launcher/constructor/upsert-page-sections',
    { pageId, sections }
  );
  return result.sections || [];
};

export const publishSecureWebBuilderSite = async (
  site: Partial<PublishedSite>
): Promise<PublishedSite | null> => {
  const result = await requestSecureConstructorWrite<{ success: boolean; site?: PublishedSite }>(
    '/api/app-launcher/constructor/publish',
    { site }
  );
  return result.site || null;
};

export const updateSecureSitePreview = async (
  siteId: string,
  previewData: {
    previewImageUrl: string;
    previewThumbnailUrl: string;
    previewImagePath?: string;
    previewImageHash?: string;
    previewImageUpdatedAt?: string;
  }
): Promise<boolean> => {
  const result = await requestSecureConstructorWrite<{ success: boolean }>(
    '/api/app-launcher/constructor/update-preview',
    { siteId, previewData }
  );
  return result.success === true;
};

export const getSecureConstructorWriteExpiredMessage = () => EXPIRED_SESSION_MESSAGE;

