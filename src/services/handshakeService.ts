import { logDebug } from '../utils/debug';
import { initSupabase } from './supabaseClient';
import { getAppMadreBaseUrl, getLaunchTokenFromUrl } from './secureLaunchSession';

export interface HandshakePayload {
  projectId: string;
  supabase_url: string;
  supabase_anon_key: string;
  session_token: string;
  appId: string;
  site_id?: string;
  siteName?: string;
  [key: string]: any;
}

let motherWindow: any = window.opener || window.parent;
let isStable = false;

const CONFIG_EVENT_TYPES = ['SOLUTIUM_CONFIG', 'SOLUTIUM_CONFIG_RESPONSE', 'SOLUTIUM_SET_CONFIG'] as const;

const resolveMotherOrigin = () => {
  try {
    if (document.referrer) return new URL(document.referrer).origin;
  } catch {
    // noop
  }

  try {
    return new URL(getAppMadreBaseUrl()).origin;
  } catch {
    return window.location.origin;
  }
};

const extractConfigPayload = (message: any) =>
  message?.payload || message?.config || (message?.projectId || message?.satellite_id ? message : null);

export const syncSupabaseRuntimeConfig = (payload: any) => {
  const sessionToken = payload?.session_token || payload?.supabaseAccessToken || payload?.accessToken;
  const supabaseUrl = payload?.supabase_url;
  const supabaseAnonKey = payload?.supabase_anon_key;

  if (sessionToken) {
    sessionStorage.setItem('solutium_supabase_access_token', sessionToken);
  }
  if (supabaseUrl) {
    sessionStorage.setItem('solutium_supabase_url', supabaseUrl);
  }
  if (supabaseAnonKey) {
    sessionStorage.setItem('solutium_supabase_anon_key', supabaseAnonKey);
  }
};

/**
 * SIP v5.2: Protocolo de Arranque y Comunicación
 */
export const startHandshake = (onConfig: (payload: HandshakePayload) => void) => {
  logDebug('[SIP v5.2] Iniciando protocolo de arranque...');
  const hasSecureLaunchToken = Boolean(getLaunchTokenFromUrl());

  const processConfig = (payload: any) => {
    if (!payload) return;

    const config: HandshakePayload = {
      projectId: payload.projectId || payload.satellite_id,
      supabase_url: payload.supabase_url,
      supabase_anon_key: payload.supabase_anon_key,
      session_token: payload.session_token,
      appId: payload.appId || payload.app_id || '11111111-1111-1111-1111-111111111111',
      site_id: payload.site_id,
      siteName: payload.siteName,
    };

    syncSupabaseRuntimeConfig(payload);

    Object.keys(payload).forEach((key) => {
      if (!(key in config)) {
        (config as any)[key] = payload[key];
      }
    });

    onConfig(config);
  };

  const handleMessage = (event: MessageEvent) => {
    if (!event.data?.type) return;

    if (
      getLaunchTokenFromUrl() &&
      CONFIG_EVENT_TYPES.includes(event.data.type) &&
      event.origin !== resolveMotherOrigin()
    ) {
      logDebug('[SIP v5.2] Ignorando configuración legacy desde origin no autorizado.', {
        origin: event.origin
      });
      return;
    }

    if (event.source && event.source !== window) {
      motherWindow = event.source;
      isStable = true;
      logDebug('[SIP v5.2] Conexión estabilizada con la App Madre.');
    }

    if (!CONFIG_EVENT_TYPES.includes(event.data.type)) return;

    logDebug(`[SIP v5.2] Configuración recibida (${event.data.type}).`);
    logDebug('[CONSTRUCTOR_MESSAGE_RECEIVED_DEBUG]', {
      eventType: event.data.type,
      topLevelFirstSectionContent: event.data.sections?.[0]?.content,
      contentFirstSectionContent: event.data.content?.sections?.[0]?.content,
      configFirstSectionContent: event.data.config?.sections?.[0]?.content,
      fullFirstSection:
        event.data.sections?.[0] || event.data.content?.sections?.[0] || event.data.config?.sections?.[0],
    });

    const dataPayload = extractConfigPayload(event.data);
    if (!dataPayload) {
      logDebug('[SIP v5.2] Recibido mensaje SOLUTIUM_CONFIG pero el payload está vacío.');
      return;
    }

    processConfig(dataPayload);
    sendToMother({ type: 'SOLUTIUM_ACK', status: 'success' });
  };

  const setupMessageListener = () => {
    window.addEventListener('message', handleMessage);
  };

  const urlParams = new URLSearchParams(window.location.search);
  const configFromUrl = {
    supabase_url: urlParams.get('supabase_url'),
    supabase_anon_key: urlParams.get('supabase_anon_key'),
    session_token: urlParams.get('session_token'),
    projectId: urlParams.get('satellite_id'),
    appId: urlParams.get('app_id'),
    site_id: urlParams.get('site_id'),
    siteName: urlParams.get('site_name'),
  };

  if (!hasSecureLaunchToken && configFromUrl.supabase_url && configFromUrl.session_token) {
    logDebug('[SIP v5.2] Configuración recuperada desde URL.');
    processConfig(configFromUrl);
    setupMessageListener();
    return;
  }

  if (!hasSecureLaunchToken && window.name) {
    try {
      const data = JSON.parse(window.name);
      if (data.type === 'SOLUTIUM_DIRECT_INJECTION' || data.type === 'SOLUTIUM_CONFIG') {
        logDebug('[SIP v5.2] Configuración recuperada desde window.name.');
        processConfig(data.payload);
        setupMessageListener();
        return;
      }
    } catch {
      // noop
    }
  }

  logDebug('[SIP v5.2] Esperando configuración de la App Madre...');
  setupMessageListener();

  const requestConfig = () => {
    if (!isStable) {
      logDebug('[SIP v5.2] Solicitando configuración (SOLUTIUM_GET_CONFIG)...');
      sendToMother({ type: 'SOLUTIUM_GET_CONFIG' });
    }
  };

  requestConfig();
  window.setTimeout(requestConfig, 250);
  window.setTimeout(requestConfig, 900);
};

/**
 * SIP v5.2: Envío robusto con estabilización
 */
export const sendToMother = (typeOrMessage: any, payload?: any) => {
  if (motherWindow && motherWindow !== window) {
    const message = payload !== undefined ? { type: typeOrMessage, payload } : typeOrMessage;
    motherWindow.postMessage(message, resolveMotherOrigin());
  }
};

export const requestFreshSupabaseConfig = async (timeoutMs: number = 6000): Promise<boolean> => {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
      resolve(result);
    };

    const handleMessage = (event: MessageEvent) => {
      const eventType = event.data?.type;
      if (!eventType || !CONFIG_EVENT_TYPES.includes(eventType)) {
        return;
      }

      const hasSecureLaunchToken = Boolean(getLaunchTokenFromUrl());

      if (hasSecureLaunchToken && event.origin !== resolveMotherOrigin()) {
        logDebug('[SIP AUTH RECOVERY] Ignorando refresh desde origin no autorizado.', {
          origin: event.origin
        });
        return;
      }

      const payload = extractConfigPayload(event.data);
      const supabaseUrl = payload?.supabase_url;
      const supabaseAnonKey = payload?.supabase_anon_key;
      const sessionToken = payload?.session_token || payload?.supabaseAccessToken || payload?.accessToken;

      if (!supabaseUrl || !supabaseAnonKey || !sessionToken) {
        return;
      }

      try {
        syncSupabaseRuntimeConfig({
          session_token: sessionToken,
          supabase_url: supabaseUrl,
          supabase_anon_key: supabaseAnonKey
        });
        if (!hasSecureLaunchToken) {
          localStorage.setItem('solutium_handshake_cache', JSON.stringify(payload));
        }
        (window as any).SOLUTIUM_SUPABASE_SESSION = { access_token: sessionToken };
        initSupabase(supabaseUrl, supabaseAnonKey, sessionToken);
        logDebug('[SIP AUTH RECOVERY] Supabase config refreshed from App Madre.');
        finish(true);
      } catch (error) {
        console.error('[SIP AUTH RECOVERY] Failed to reinitialize Supabase after fresh config:', error);
        finish(false);
      }
    };

    const timer = window.setTimeout(() => {
      logDebug('[SIP AUTH RECOVERY] Timed out waiting for fresh Supabase config.');
      finish(false);
    }, timeoutMs);

    window.addEventListener('message', handleMessage);
    logDebug('[SIP AUTH RECOVERY] Requesting fresh Supabase config from App Madre...');
    sendToMother({ type: 'SOLUTIUM_GET_CONFIG' });
  });
};
