export interface SecureLaunchSessionPayload {
  launcher?: {
    appId?: string | null;
    appSlug?: string | null;
    mode?: string | null;
    siteId?: string | null;
    satelliteId?: string | null;
    allowedOrigin?: string | null;
    createdAt?: string | null;
    expiresAt?: string | null;
  } | null;
  uiTheme?: Record<string, any> | null;
  projectBranding?: Record<string, any> | null;
  projectContext?: {
    projectId?: string | null;
    userId?: string | null;
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

export const getAppMadreBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_APP_MADRE_API_URL ||
    import.meta.env.VITE_APP_MADRE_URL ||
    import.meta.env.VITE_API_BASE_URL;

  if (envUrl) {
    return String(envUrl).replace(/\/$/, '');
  }

  const isLocalConstructor = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  return isLocalConstructor ? 'http://localhost:3000' : 'https://solutium.app';
};

export const consumeSecureLaunchSession = async (
  launchToken: string
): Promise<SecureLaunchSessionResult> => {
  try {
    const response = await fetch(`${getAppMadreBaseUrl()}/api/app-launcher/sessions/consume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        launch_token: launchToken
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.error || 'SECURE_LAUNCH_CONSUME_FAILED',
        message: result.message || 'No se pudo iniciar la sesión segura del Constructor. Vuelva a abrirlo desde Solutium.'
      };
    }

    return {
      success: true,
      payload: result.payload
    };
  } catch (error) {
    return {
      success: false,
      error: 'SECURE_LAUNCH_NETWORK_ERROR',
      message: error instanceof Error
        ? error.message
        : 'No se pudo iniciar la sesión segura del Constructor. Vuelva a abrirlo desde Solutium.'
    };
  }
};
