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
  return normalizeAppMadreBaseUrl(isLocalConstructor ? 'http://localhost:3000' : 'https://solutium.app');
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
        message: result.message || 'No se pudo iniciar la sesi�n segura del Constructor. Vuelva a abrirlo desde Solutium.',
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
        : 'No se pudo iniciar la sesi�n segura del Constructor. Vuelva a abrirlo desde Solutium.',
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
  }
  return result;
};

export interface ConstructorContextResult {
  success: boolean;
  projectId?: string;
  webBuilderSites?: any[];
  publishedSites?: any[];
  assets?: any[];
  projectContact?: Record<string, any> | null;
  projectBranding?: Record<string, any> | null;
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
      projectContact: result.projectContact || null,
      projectBranding: result.projectBranding || null
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