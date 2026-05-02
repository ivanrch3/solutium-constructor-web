import { getSupabase } from './supabaseClient';
import { logDebug } from '../utils/debug';

/**
 * Provee el token de autenticación para subidas de archivos (assets).
 * Soporta modo directo (Supabase) y modo satélite (App Madre).
 */
export async function getUploadAuthToken(): Promise<{ token: string | null; source: string }> {
  // 1. Intentar obtener el token de sessionStorage (Capturado previamente)
  const sessionToken = sessionStorage.getItem('solutium_upload_token');
  if (sessionToken) {
    return { token: sessionToken, source: 'session_storage' };
  }

  // 2. Intentar obtener el token de la sesión de Supabase (Modo Directo)
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { token: session.access_token, source: 'supabase_session' };
      }
    }
  } catch (err) {
    logDebug('[AuthTokenProvider] Error obteniendo sesión de Supabase:', err);
  }

  // 3. Intentar obtener el token del cache del handshake (Modo Satélite/App Madre)
  try {
    const savedHandshake = localStorage.getItem('solutium_handshake_cache');
    if (savedHandshake) {
      const payload = JSON.parse(savedHandshake);
      if (payload.session_token) {
        return { token: payload.session_token, source: 'handshake_cache' };
      }
    }
  } catch (err) {
    logDebug('[AuthTokenProvider] Error leyendo handshake cache:', err);
  }

  // 4. Intentar obtener del hash de la URL (#token=...)
  const hashStr = window.location.hash;
  if (hashStr && hashStr.startsWith('#token=')) {
    const token = hashStr.replace('#token=', '');
    if (token) {
      return { token, source: 'url_hash' };
    }
  }

  // 5. Intentar obtener de parámetros de búsqueda (?token= o ?session_token=)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenParam = urlParams.get('token') || urlParams.get('session_token');
  if (tokenParam) {
    return { token: tokenParam, source: 'url_param' };
  }

  // 6. Fallback Global (window.SOLUTIUM_AUTH_TOKEN)
  const globalToken = (window as any).SOLUTIUM_AUTH_TOKEN;
  if (globalToken) {
    return { token: globalToken, source: 'window_global' };
  }

  return { token: null, source: 'none' };
}

/**
 * Captura el token de la URL (hash o query) y lo guarda en sessionStorage
 * para accesos posteriores sin depender de la persistencia de la URL.
 */
export function captureAuthToken(): string | null {
  const hashStr = window.location.hash;
  let token: string | null = null;
  let source = '';

  if (hashStr && hashStr.startsWith('#token=')) {
    token = hashStr.replace('#token=', '');
    source = 'url_hash';
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token') || urlParams.get('session_token');
    source = 'url_param';
  }

  if (token) {
    logDebug(`[AuthTokenProvider] Token capturado desde ${source}:`, token.substring(0, 4) + '...');
    sessionStorage.setItem('solutium_upload_token', token);
    return token;
  }

  return null;
}
