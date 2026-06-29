import { getSupabase, getSupabaseConfig, initSupabase } from './supabaseClient';
import { requestFreshSupabaseConfig } from './handshakeService';
import { logDebug } from '../utils/debug';

export type SupabaseSessionState = 'active' | 'refreshed' | 'missing_session' | 'expired_session';

export interface EnsureSupabaseSessionResult {
  state: SupabaseSessionState;
  source?: 'supabase_session' | 'stored_access_token' | 'mother_refresh';
  message?: string;
}

export interface ResolvedSupabaseUserIdentity {
  userId: string | null;
  source: 'supabase_session' | 'stored_access_token' | 'decoded_jwt' | 'missing';
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
const SUPABASE_BOOTSTRAP_WAIT_MS = 1500;
const SUPABASE_BOOTSTRAP_POLL_MS = 100;

interface SupabaseBootstrapConfig {
  url: string;
  key: string;
  token: string;
}

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

const readSessionStorageBootstrapConfig = (): SupabaseBootstrapConfig | null => {
  try {
    const url = sessionStorage.getItem('solutium_supabase_url');
    const key = sessionStorage.getItem('solutium_supabase_anon_key');
    const token = sessionStorage.getItem('solutium_supabase_access_token') || sessionStorage.getItem('solutium_upload_token');
    if (url && key && token) {
      return { url, key, token };
    }
  } catch {}

  return null;
};

const readHandshakeCacheBootstrapConfig = (): SupabaseBootstrapConfig | null => {
  try {
    const raw = localStorage.getItem('solutium_handshake_cache');
    if (!raw) return null;
    const payload = JSON.parse(raw);
    const url = payload?.supabase_url;
    const key = payload?.supabase_anon_key;
    const token = payload?.session_token || payload?.supabaseAccessToken || payload?.accessToken;
    if (url && key && token) {
      return { url, key, token };
    }
  } catch {}

  return null;
};

const readUrlBootstrapConfig = (): SupabaseBootstrapConfig | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('supabase_url');
    const key = params.get('supabase_anon_key');
    const token = params.get('session_token') || params.get('access_token') || params.get('token');
    if (url && key && token) {
      return { url, key, token };
    }
  } catch {}

  return null;
};

const readWindowNameBootstrapConfig = (): SupabaseBootstrapConfig | null => {
  try {
    if (!window.name) return null;
    const payload = JSON.parse(window.name);
    const source = payload?.payload || payload;
    const url = source?.supabase_url;
    const key = source?.supabase_anon_key;
    const token = source?.session_token || source?.supabaseAccessToken || source?.accessToken;
    if (url && key && token) {
      return { url, key, token };
    }
  } catch {}

  return null;
};

const resolveBootstrapConfig = (): SupabaseBootstrapConfig | null =>
  readSessionStorageBootstrapConfig() ||
  readHandshakeCacheBootstrapConfig() ||
  readUrlBootstrapConfig() ||
  readWindowNameBootstrapConfig();

const bootstrapSupabaseClientFromConfig = (config: SupabaseBootstrapConfig | null): boolean => {
  if (!config?.url || !config?.key || !config?.token) return false;

  try {
    sessionStorage.setItem('solutium_supabase_url', config.url);
    sessionStorage.setItem('solutium_supabase_anon_key', config.key);
    sessionStorage.setItem('solutium_supabase_access_token', config.token);
    (window as any).SOLUTIUM_SUPABASE_SESSION = { access_token: config.token };
  } catch {}

  return Boolean(initSupabase(config.url, config.key, config.token));
};

const ensureSupabaseClientReady = async (): Promise<boolean> => {
  if (getSupabase()) return true;

  const deadline = Date.now() + SUPABASE_BOOTSTRAP_WAIT_MS;
  while (Date.now() < deadline) {
    if (getSupabase()) return true;

    const bootstrapConfig = resolveBootstrapConfig();
    if (bootstrapSupabaseClientFromConfig(bootstrapConfig)) {
      return true;
    }

    await new Promise((resolve) => window.setTimeout(resolve, SUPABASE_BOOTSTRAP_POLL_MS));
  }

  const refreshedFromMother = await requestFreshSupabaseConfig();
  if (refreshedFromMother && getSupabase()) {
    return true;
  }

  const fallbackConfig = resolveBootstrapConfig();
  const bootstrapped = bootstrapSupabaseClientFromConfig(fallbackConfig);
  return bootstrapped;
};

export const resolveSupabaseUserIdentity = async (): Promise<ResolvedSupabaseUserIdentity> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { userId: null, source: 'missing' };
  }

  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user?.id) {
      return { userId: data.user.id, source: 'supabase_session' };
    }
  } catch {
    // continue to token-based recovery
  }

  const fallbackToken = getStoredAccessToken();
  if (!fallbackToken) {
    return { userId: null, source: 'missing' };
  }

  try {
    const getUserWithToken = (supabase.auth.getUser as any).bind(supabase.auth);
    const { data, error } = await getUserWithToken(fallbackToken);
    if (!error && data?.user?.id) {
      return { userId: data.user.id, source: 'stored_access_token' };
    }
  } catch {
    // continue to JWT decode fallback
  }

  const payload = decodeJwtPayload(fallbackToken);
  const userId = typeof payload?.sub === 'string' ? payload.sub : null;
  if (userId) {
    return { userId, source: 'decoded_jwt' };
  }

  return { userId: null, source: 'missing' };
};

export const ensureActiveSupabaseSession = async (
  options: { forceRefresh?: boolean } = {}
): Promise<EnsureSupabaseSessionResult> => {
  const supabaseReady = await ensureSupabaseClientReady();
  const supabase = getSupabase();
  if (!supabase) {
      return {
        state: 'missing_session',
      message: supabaseReady
        ? 'No se pudo recuperar un cliente usable de Supabase.'
        : 'No se encontró un cliente activo de Supabase.'
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
