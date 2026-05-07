import { getSupabase } from './supabaseClient';
import { logDebug } from '../utils/debug';

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
}

/**
 * Prioritizes tokens from different sources.
 * Returns a result object indicating the token and its source.
 */
export async function getUploadAuthToken(): Promise<TokenResult> {
  // 1. Supabase Runtime Session (Highest Priority A)
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && isJWT(session.access_token)) {
        return { token: session.access_token, source: 'supabase_session' };
      }
    }
  } catch (err) {
    // Log suppressed but tracked
  }

  // 2. URL Parameters (Explicit overrides)
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const queryParams = new URLSearchParams(window.location.search);
  
  const urlToken = hashParams.get('access_token') || hashParams.get('token') || 
                   queryParams.get('access_token') || queryParams.get('token') || queryParams.get('session_token');
                   
  if (isJWT(urlToken)) {
    return { token: urlToken, source: 'url_params' };
  }

  // 3. Session Storage (Handshake persistency)
  const ssToken = sessionStorage.getItem('solutium_supabase_access_token') || 
                  sessionStorage.getItem('solutium_upload_token');
  if (isJWT(ssToken)) {
    return { token: ssToken, source: 'session_storage' };
  }

  // 4. Handshake Cache (LocalStorage - Priority B)
  try {
    const savedHandshake = localStorage.getItem('solutium_handshake_cache');
    if (savedHandshake) {
      const payload = JSON.parse(savedHandshake);
      
      // Explicitly prioritize accessToken/supabaseAccessToken fields from handshake
      const hToken = payload.supabaseAccessToken || payload.accessToken || payload.session_token;
      if (isJWT(hToken)) {
        return { token: hToken, source: 'handshake_cache' };
      }
    }
  } catch (err) {}

  // 5. Window Global (Last resort)
  const globalToken = (window as any).SOLUTIUM_AUTH_TOKEN;
  if (isJWT(globalToken)) {
    return { token: globalToken, source: 'window_global' };
  }

  return { token: null, source: 'none' };
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
