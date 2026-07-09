export interface SecureLaunchSessionPayload {
  publicRenderContext?: Record<string, any> | null;
  projectContact?: Record<string, any> | null;
  contractVersion?: string | null;
  launcher?: {
    appId?: string | null;
    appSlug?: string | null;
    mode?: string | null;
    siteId?: string | null;
    projectId?: string | null;
    satelliteId?: string | null;
    userId?: string | null;
    profileId?: string | null;
    userEmail?: string | null;
    email?: string | null;
    userName?: string | null;
    displayName?: string | null;
    fullName?: string | null;
    contractVersion?: string | null;
    allowedOrigin?: string | null;
    createdAt?: string | null;
    expiresAt?: string | null;
  } | null;
  uiTheme?: Record<string, any> | null;
  projectBranding?: Record<string, any> | null;
  access?: {
    launch_access_token?: string | null;
    expires_at?: string | null;
    contract_version?: string | null;
  } | null;
  projectContext?: {
    projectId?: string | null;
    userId?: string | null;
    profileId?: string | null;
    userEmail?: string | null;
    email?: string | null;
    userName?: string | null;
    displayName?: string | null;
    fullName?: string | null;
    role?: string | null;
    projectRole?: string | null;
    capabilities?: Record<string, any> | null;
  } | null;
}

export interface SecureLaunchSessionResult {
  success: boolean;
  payload?: SecureLaunchSessionPayload;
  error?: string;
  message?: string;
  httpStatus?: number;
  consumeAttemptId?: string;
  fromCache?: boolean;
}

const getHashSearchParams = () => {
  const hash = window.location.hash || '';
  if (!hash) return new URLSearchParams();

  const queryStart = hash.indexOf('?');
  if (queryStart >= 0) {
    return new URLSearchParams(hash.slice(queryStart + 1));
  }

  const normalized = hash.startsWith('#') ? hash.slice(1) : hash;
  return normalized.includes('=') ? new URLSearchParams(normalized) : new URLSearchParams();
};

export const getLaunchTokenFromUrl = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = getHashSearchParams();
  return queryParams.get('launch_token') || hashParams.get('launch_token') || null;
};

const LAUNCH_ACCESS_TOKEN_STORAGE_KEY = 'solutium_constructor_launch_access_token';
const LAUNCH_ACCESS_EXPIRES_AT_STORAGE_KEY = 'solutium_constructor_launch_access_expires_at';
const LAUNCH_PAYLOAD_STORAGE_KEY = 'solutium_constructor_launch_payload';

const readSessionStorage = (key: string) => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeSessionStorage = (key: string, value: string) => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage persistence is best-effort; window globals still cover this tab.
  }
};

const removeSessionStorage = (key: string) => {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // noop
  }
};

const sanitizeLaunchPayloadForStorage = (
  payload: SecureLaunchSessionPayload | null | undefined
): SecureLaunchSessionPayload | null => {
  if (!payload) return null;

  const { access: _access, ...rest } = payload;
  return {
    ...rest,
    access: {
      contract_version: payload.access?.contract_version || null
    }
  };
};

export const clearLaunchTokenFromUrl = () => {
  try {
    const url = new URL(window.location.href);
    let changed = false;

    if (url.searchParams.has('launch_token')) {
      url.searchParams.delete('launch_token');
      changed = true;
    }

    if (url.hash) {
      const hashValue = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
      const queryStart = hashValue.indexOf('?');

      if (queryStart >= 0) {
        const hashPath = hashValue.slice(0, queryStart);
        const hashParams = new URLSearchParams(hashValue.slice(queryStart + 1));
        if (hashParams.has('launch_token')) {
          hashParams.delete('launch_token');
          const nextHashQuery = hashParams.toString();
          url.hash = nextHashQuery ? `${hashPath}?${nextHashQuery}` : hashPath;
          changed = true;
        }
      } else if (hashValue.includes('=')) {
        const hashParams = new URLSearchParams(hashValue);
        if (hashParams.has('launch_token')) {
          hashParams.delete('launch_token');
          const nextHashQuery = hashParams.toString();
          url.hash = nextHashQuery ? `#${nextHashQuery}` : '';
          changed = true;
        }
      }
    }

    if (changed) {
      window.history.replaceState(window.history.state, document.title, url.toString());
    }
  } catch {
    // URL cleanup is best-effort; secure launch restoration does not depend on it.
  }
};

export const isLaunchAccessExpired = (expiresAt?: string | null, bufferMs = 0) => {
  if (!expiresAt) return false;
  const expiresAtMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresAtMs)) return true;
  return expiresAtMs <= Date.now() + bufferMs;
};

export const clearStoredLaunchAccessSession = () => {
  removeSessionStorage(LAUNCH_ACCESS_TOKEN_STORAGE_KEY);
  removeSessionStorage(LAUNCH_ACCESS_EXPIRES_AT_STORAGE_KEY);
  removeSessionStorage(LAUNCH_PAYLOAD_STORAGE_KEY);
  try {
    delete (window as any).SOLUTIUM_CONSTRUCTOR_LAUNCH_ACCESS;
  } catch {
    // noop
  }
};

export const storeLaunchAccessSession = (payload: SecureLaunchSessionPayload | null | undefined) => {
  const token = payload?.access?.launch_access_token || null;
  const expiresAt = payload?.access?.expires_at || null;
  if (!token || isLaunchAccessExpired(expiresAt)) {
    clearStoredLaunchAccessSession();
    return;
  }

  writeSessionStorage(LAUNCH_ACCESS_TOKEN_STORAGE_KEY, token);
  if (expiresAt) {
    writeSessionStorage(LAUNCH_ACCESS_EXPIRES_AT_STORAGE_KEY, expiresAt);
  }

  const safePayload = sanitizeLaunchPayloadForStorage(payload);
  if (safePayload) {
    writeSessionStorage(LAUNCH_PAYLOAD_STORAGE_KEY, JSON.stringify(safePayload));
  }

  try {
    (window as any).SOLUTIUM_CONSTRUCTOR_LAUNCH_ACCESS = {
      token,
      expiresAt
    };
  } catch {
    // noop
  }
};

export const getStoredSecureLaunchPayload = (): SecureLaunchSessionPayload | null => {
  const storedSession = getStoredLaunchAccessSession();
  if (!storedSession.active || !storedSession.token) return null;

  try {
    const raw = readSessionStorage(LAUNCH_PAYLOAD_STORAGE_KEY);
    const payload = raw ? JSON.parse(raw) as SecureLaunchSessionPayload : null;
    if (!payload) return null;

    return {
      ...payload,
      access: {
        ...(payload.access || {}),
        launch_access_token: storedSession.token,
        expires_at: storedSession.expiresAt || null
      }
    };
  } catch {
    return null;
  }
};

export const getStoredLaunchAccessSession = () => {
  const runtimeSession = (() => {
    try {
      return (window as any).SOLUTIUM_CONSTRUCTOR_LAUNCH_ACCESS || null;
    } catch {
      return null;
    }
  })();

  const token =
    (typeof runtimeSession?.token === 'string' && runtimeSession.token) ||
    readSessionStorage(LAUNCH_ACCESS_TOKEN_STORAGE_KEY);
  const expiresAt =
    (typeof runtimeSession?.expiresAt === 'string' && runtimeSession.expiresAt) ||
    readSessionStorage(LAUNCH_ACCESS_EXPIRES_AT_STORAGE_KEY);

  if (!token) return { token: null, expiresAt: expiresAt || null, active: false };
  if (isLaunchAccessExpired(expiresAt)) {
    clearStoredLaunchAccessSession();
    return { token: null, expiresAt: expiresAt || null, active: false };
  }

  return {
    token,
    expiresAt: expiresAt || null,
    active: true
  };
};

let consumeAttemptSequence = 0;
const secureLaunchConsumeCache = new Map<string, Promise<SecureLaunchSessionResult>>();

const normalizeAppMadreBaseUrl = (value: string) => {
  const normalized = String(value || '').trim().replace(/\/+$/, '');
  return normalized.replace(/\/api$/i, '');
};

export const getAppMadreBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_APP_MADRE_API_URL ||
    import.meta.env.VITE_APP_MADRE_URL ||
    import.meta.env.VITE_API_BASE_URL;

  if (envUrl) {
    return normalizeAppMadreBaseUrl(envUrl);
  }

  const isLocalConstructor = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  return normalizeAppMadreBaseUrl(isLocalConstructor ? 'http://localhost:3000' : 'https://app.solutium.app');
};

const consumeSecureLaunchSessionNetwork = async (
  launchToken: string,
  consumeAttemptId: string
): Promise<SecureLaunchSessionResult> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${getAppMadreBaseUrl()}/api/app-launcher/sessions/consume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        launch_token: launchToken
      }),
      signal: controller.signal
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.error || 'SECURE_LAUNCH_CONSUME_FAILED',
        message: result.message || 'La sesión segura del Constructor ya no es válida. Por favor vuelve a lanzar el Constructor Web desde Solutium.',
        httpStatus: response.status,
        consumeAttemptId
      };
    }

    return {
      success: true,
      httpStatus: response.status,
      consumeAttemptId,
      payload: {
        ...(result.payload || {}),
        contractVersion: result.contract_version || result.payload?.contractVersion || result.payload?.launcher?.contractVersion || null
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof DOMException && error.name === 'AbortError' ? 'SECURE_LAUNCH_CONSUME_TIMEOUT' : 'SECURE_LAUNCH_NETWORK_ERROR',
      message: error instanceof Error
        ? error.message
        : 'La sesión segura del Constructor ya no es válida. Por favor vuelve a lanzar el Constructor Web desde Solutium.',
      httpStatus: 0,
      consumeAttemptId
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const consumeSecureLaunchSession = async (
  launchToken: string
): Promise<SecureLaunchSessionResult> => {
  const existing = secureLaunchConsumeCache.get(launchToken);
  if (existing) {
    const result = await existing;
    return {
      ...result,
      fromCache: true
    };
  }

  const consumeAttemptId = `secure-launch-${++consumeAttemptSequence}`;
  const consumePromise = consumeSecureLaunchSessionNetwork(launchToken, consumeAttemptId);
  secureLaunchConsumeCache.set(launchToken, consumePromise);

  const result = await consumePromise;
  if (!result.success) {
    secureLaunchConsumeCache.delete(launchToken);
  } else {
    storeLaunchAccessSession(result.payload);
  }
  return result;
};

export interface ConstructorContextResult {
  success: boolean;
  projectId?: string;
  webBuilderSites?: any[];
  publishedSites?: any[];
  assets?: any[];
  products?: any[];
  catalogProducts?: any[];
  trustedLogos?: any[];
  customers?: any[];
  clients?: any[];
  projectContact?: Record<string, any> | null;
  projectBranding?: Record<string, any> | null;
  capabilities?: Record<string, any> | null;
  httpStatus?: number;
  error?: string;
  message?: string;
}

export const fetchConstructorContext = async ({
  appBaseUrl,
  launchAccessToken
}: {
  appBaseUrl?: string | null;
  launchAccessToken: string;
}): Promise<ConstructorContextResult> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);
  const baseUrl = normalizeAppMadreBaseUrl(appBaseUrl || getAppMadreBaseUrl());

  try {
    const response = await fetch(`${baseUrl}/api/app-launcher/constructor/context`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${launchAccessToken}`
      },
      signal: controller.signal
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) {
      return {
        success: false,
        httpStatus: response.status,
        error: result.error || 'CONSTRUCTOR_CONTEXT_LOAD_FAILED',
        message: result.message || `No se pudo cargar el contexto del Constructor (HTTP ${response.status}).`
      };
    }

    return {
      success: true,
      httpStatus: response.status,
      projectId: result.projectId,
      webBuilderSites: Array.isArray(result.webBuilderSites) ? result.webBuilderSites : [],
      publishedSites: Array.isArray(result.publishedSites) ? result.publishedSites : [],
      assets: Array.isArray(result.assets) ? result.assets : [],
      products: Array.isArray(result.products) ? result.products : [],
      catalogProducts: Array.isArray(result.catalogProducts) ? result.catalogProducts : [],
      trustedLogos: Array.isArray(result.trustedLogos) ? result.trustedLogos : [],
      customers: Array.isArray(result.customers) ? result.customers : [],
      clients: Array.isArray(result.clients) ? result.clients : [],
      projectContact: result.projectContact || null,
      projectBranding: result.projectBranding || null,
      capabilities: result.capabilities && typeof result.capabilities === 'object' ? result.capabilities : null
    };
  } catch (error) {
    return {
      success: false,
      httpStatus: 0,
      error: error instanceof DOMException && error.name === 'AbortError'
        ? 'CONSTRUCTOR_CONTEXT_TIMEOUT'
        : 'CONSTRUCTOR_CONTEXT_NETWORK_ERROR',
      message: error instanceof Error
        ? error.message
        : 'No se pudo cargar el contexto seguro del Constructor.'
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};
