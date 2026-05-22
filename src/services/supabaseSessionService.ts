import { getSupabase, getSupabaseConfig } from './supabaseClient';
import { requestFreshSupabaseConfig } from './handshakeService';
import { logDebug } from '../utils/debug';

export type SupabaseSessionState = 'active' | 'refreshed' | 'missing_session' | 'expired_session';

export interface EnsureSupabaseSessionResult {
  state: SupabaseSessionState;
  source?: 'supabase_session' | 'stored_access_token' | 'mother_refresh';
  message?: string;
}

export class SupabaseSessionError extends Error {
  state: 'missing_session' | 'expired_session';

  constructor(state: 'missing_session' | 'expired_session', message?: string) {
    super(message || (state === 'missing_session' ? 'No active Supabase session is available.' : 'The Supabase session has expired.'));
    this.name = 'SupabaseSessionError';
    this.state = state;
  }
}

const EXPIRY_BUFFER_SECONDS = 90;

const decodeJwtPayload = (token: string | null): Record<string, any> | null => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const getTokenExpirySeconds = (token: string | null): number | null => {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  return typeof exp === 'number' ? exp : null;
};

const isTokenNearExpiry = (token: string | null, bufferSeconds: number = EXPIRY_BUFFER_SECONDS): boolean => {
  const expSeconds = getTokenExpirySeconds(token);
  if (!expSeconds) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return expSeconds <= nowSeconds + bufferSeconds;
};

const getStoredAccessToken = (): string | null => {
  try {
    const runtimeToken = (window as any).SOLUTIUM_SUPABASE_SESSION?.access_token;
    if (typeof runtimeToken === 'string' && runtimeToken) return runtimeToken;
  } catch {}

  try {
    const sessionToken =
      sessionStorage.getItem('solutium_supabase_access_token') ||
      sessionStorage.getItem('solutium_upload_token');
    if (sessionToken) return sessionToken;
  } catch {}

  try {
    const configToken = getSupabaseConfig()?.token;
    if (configToken) return configToken;
  } catch {}

  return null;
};

export const ensureActiveSupabaseSession = async (
  options: { forceRefresh?: boolean } = {}
): Promise<EnsureSupabaseSessionResult> => {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      state: 'missing_session',
      message: 'No se encontró un cliente activo de Supabase.'
    };
  }

  const forceRefresh = options.forceRefresh === true;

  try {
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session || null;
    const sessionToken = session?.access_token || null;
    const fallbackToken = getStoredAccessToken();
    const effectiveToken = sessionToken || fallbackToken;

    if (!forceRefresh && sessionToken && !isTokenNearExpiry(sessionToken)) {
      return { state: 'active', source: 'supabase_session' };
    }

    if (!forceRefresh && !sessionToken && effectiveToken && !isTokenNearExpiry(effectiveToken)) {
      return { state: 'active', source: 'stored_access_token' };
    }

    if (session?.refresh_token) {
      const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && refreshedData?.session?.access_token) {
        const refreshedToken = refreshedData.session.access_token;
        try {
          sessionStorage.setItem('solutium_supabase_access_token', refreshedToken);
          (window as any).SOLUTIUM_SUPABASE_SESSION = { access_token: refreshedToken };
        } catch {}

        logDebug('[SUPABASE_SESSION] Native refreshSession() completed successfully.');
        return { state: 'refreshed', source: 'supabase_session' };
      }
    }

    if (effectiveToken && !forceRefresh && error && !isTokenNearExpiry(effectiveToken)) {
      return { state: 'active', source: 'stored_access_token' };
    }

    const refreshedFromMother = await requestFreshSupabaseConfig();
    if (refreshedFromMother) {
      return { state: 'refreshed', source: 'mother_refresh' };
    }

    if (!effectiveToken) {
      return {
        state: 'missing_session',
        message: 'No hay una sesión disponible para autenticar con Supabase.'
      };
    }

    return {
      state: 'expired_session',
      message: 'La sesión de Supabase expiró y no se pudo renovar automáticamente.'
    };
  } catch (error: any) {
    const fallbackToken = getStoredAccessToken();

    if (!forceRefresh && fallbackToken && !isTokenNearExpiry(fallbackToken)) {
      return { state: 'active', source: 'stored_access_token' };
    }

    const refreshedFromMother = await requestFreshSupabaseConfig();
    if (refreshedFromMother) {
      return { state: 'refreshed', source: 'mother_refresh' };
    }

    return {
      state: fallbackToken ? 'expired_session' : 'missing_session',
      message: error?.message || 'No se pudo validar la sesión de Supabase.'
    };
  }
};

export const assertActiveSupabaseSession = async (
  options: { forceRefresh?: boolean } = {}
): Promise<EnsureSupabaseSessionResult> => {
  const result = await ensureActiveSupabaseSession(options);
  if (result.state === 'missing_session' || result.state === 'expired_session') {
    throw new SupabaseSessionError(result.state, result.message);
  }
  return result;
};
