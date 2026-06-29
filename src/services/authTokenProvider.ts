import { getSupabase } from './supabaseClient';
import { logDebug } from '../utils/debug';
import { getStoredLaunchAccessSession } from './secureLaunchSession';
import { ensureActiveSupabaseSession } from './supabaseSessionService';

/**
 * [AUTH_TOKEN_PROVIDER_DEBUG] Centralized Token Provider
 * This service ensures we use valid Supabase Access Tokens (JWT)
 * to avoid 401 Unauthorized errors from App Madre.
 */

export const isJWT = (token: string | null): boolean => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3;
};

interface TokenResult {
  token: string | null;
  source: string;
  authType?: 'supabase' | 'launch' | 'none';
}

const getJwtTokenFromContext = async (): Promise<TokenResult> => {
  // 1. Supabase Runtime Session
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && isJWT(session.access_token)) {
        return { token: session.access_token, source: 'supabase_session', authType: 'supabase' };
      }
    }
  } catch {}

  // 2. URL Parameters
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const queryParams = new URLSearchParams(window.location.search);
  const urlToken = hashParams.get('access_token') || hashParams.get('token') ||
    queryParams.get('access_token') || queryParams.get('token') || queryParams.get('session_token');
  if (isJWT(urlToken)) {
    return { token: urlToken, source: 'url_params', authType: 'supabase' };
  }

  // 3. Session Storage
  const sessionStorageToken = sessionStorage.getItem('solutium_supabase_access_token') ||
    sessionStorage.getItem('solutium_upload_token');
  if (isJWT(sessionStorageToken)) {
    return { token: sessionStorageToken, source: 'session_storage', authType: 'supabase' };
  }

  // 4. Handshake cache
  try {
    const savedHandshake = localStorage.getItem('solutium_handshake_cache');
    if (savedHandshake) {
      const payload = JSON.parse(savedHandshake);
      const handshakeToken = payload.supabaseAccessToken || payload.accessToken || payload.session_token;
      if (isJWT(handshakeToken)) {
        return { token: handshakeToken, source: 'handshake_cache', authType: 'supabase' };
      }
    }
  } catch {}

  // 5. Window global
  const globalToken = (window as any).SOLUTIUM_AUTH_TOKEN;
  if (isJWT(globalToken)) {
    return { token: globalToken, source: 'window_global', authType: 'supabase' };
  }

  return { token: null, source: 'none', authType: 'none' };
};

/**
 * Prioritizes tokens from different sources.
 * Returns a result object indicating the token and its source.
 */
export async function getUploadAuthToken(): Promise<TokenResult> {
  const jwtResult = await getJwtTokenFromContext();
  if (jwtResult.token) {
    return jwtResult;
  }

  // 1b. Secure Constructor launch access token.
  // This is intentionally not a Supabase JWT; App Madre validates it on scoped
  // Constructor proxy endpoints such as Pexels search and preview generation.
  const secureLaunchSession = getStoredLaunchAccessSession();
  if (secureLaunchSession.active && secureLaunchSession.token) {
    return { token: secureLaunchSession.token, source: 'secure_constructor_launch', authType: 'launch' };
  }

  return { token: null, source: 'none', authType: 'none' };
}

export async function getSupabaseAuthToken(): Promise<TokenResult> {
  return getJwtTokenFromContext();
}

export async function getMotherApiAuthToken(options?: {
  allowLaunch?: boolean;
  forceRefreshSupabase?: boolean;
}): Promise<TokenResult> {
  if (options?.forceRefreshSupabase) {
    try {
      await ensureActiveSupabaseSession({ forceRefresh: false });
    } catch {
      // Ignore and continue with available credentials.
    }
  }

  const jwtResult = await getJwtTokenFromContext();
  if (jwtResult.token) {
    return jwtResult;
  }

  if (options?.allowLaunch) {
    const secureLaunchSession = getStoredLaunchAccessSession();
    if (secureLaunchSession.active && secureLaunchSession.token) {
      return {
        token: secureLaunchSession.token,
        source: 'secure_constructor_launch',
        authType: 'launch'
      };
    }
  }

  return { token: null, source: 'none', authType: 'none' };
}

/**
 * Capture token from current context and sync it
 */
export function captureAuthToken(): string | null {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const queryParams = new URLSearchParams(window.location.search);
  
  const token = hashParams.get('access_token') || hashParams.get('token') || 
                queryParams.get('access_token') || queryParams.get('token') || queryParams.get('session_token');

  if (token && isJWT(token)) {
    logDebug(`[AUTH_TOKEN_PROVIDER_DEBUG] Token captured and stored:`, token.substring(0, 10) + '...');
    sessionStorage.setItem('solutium_supabase_access_token', token);
    return token;
  }

  return null;
}
