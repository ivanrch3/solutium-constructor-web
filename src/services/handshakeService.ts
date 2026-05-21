import { logDebug } from '../utils/debug';
import { initSupabase } from './supabaseClient';

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

/**
 * SIP v5.2: Protocolo de Arranque y Comunicación
 */
export const startHandshake = (
  onConfig: (payload: HandshakePayload) => void
) => {
  logDebug("🛠️ [SIP v5.2] Iniciando protocolo de arranque...");

  const processConfig = (payload: any) => {
    if (!payload) return;

    const config: HandshakePayload = {
      projectId: payload.projectId || payload.satellite_id,
      supabase_url: payload.supabase_url,
      supabase_anon_key: payload.supabase_anon_key,
      session_token: payload.session_token,
      appId: payload.appId || payload.app_id || '11111111-1111-1111-1111-111111111111',
      site_id: payload.site_id,
      siteName: payload.siteName
    };

    // SIP v6.3: Proactive storage sync for the auth provider
    if (payload.session_token) {
      sessionStorage.setItem('solutium_supabase_access_token', payload.session_token);
    }
    if (payload.supabaseAccessToken) {
      sessionStorage.setItem('solutium_supabase_access_token', payload.supabaseAccessToken);
    }

    // Copiar el resto de propiedades
    Object.keys(payload).forEach(key => {
      if (!(key in config)) {
        (config as any)[key] = payload[key];
      }
    });

    onConfig(config);
  };

  const setupMessageListener = () => {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type) {
        // Estabilizar conexión capturando la fuente
        if (event.source && event.source !== window) {
          motherWindow = event.source;
          isStable = true;
          logDebug("✅ [SIP v5.2] Conexión estabilizada con la App Madre.");
        }

        if (event.data.type === 'SOLUTIUM_CONFIG' || event.data.type === 'SOLUTIUM_CONFIG_RESPONSE' || event.data.type === 'SOLUTIUM_SET_CONFIG') {
          logDebug(`✅ [SIP v5.2] Configuración recibida (${event.data.type}).`);
          
          // LOG DE DIAGNÓSTICO SOLICITADO
          logDebug('[CONSTRUCTOR_MESSAGE_RECEIVED_DEBUG]', {
            eventType: event.data.type,
            topLevelFirstSectionContent: event.data.sections?.[0]?.content,
            contentFirstSectionContent: event.data.content?.sections?.[0]?.content,
            configFirstSectionContent: event.data.config?.sections?.[0]?.content,
            fullFirstSection: event.data.sections?.[0] || event.data.content?.sections?.[0] || event.data.config?.sections?.[0]
          });

          // SOP: Max robustness - check payload, config, or root if it looks like a config
          const dataPayload = event.data.payload || event.data.config || (event.data.projectId || event.data.satellite_id ? event.data : null);
          if (dataPayload) {
            processConfig(dataPayload);
            sendToMother({ type: 'SOLUTIUM_ACK', status: 'success' });
          } else {
            logDebug("⚠️ [SIP v5.2] Recibido mensaje SOLUTIUM_CONFIG pero el payload está vacío.");
          }
        }
      }
    });
  };

  const urlParams = new URLSearchParams(window.location.search);
  
  console.log('[CONSTRUCTOR_BOOT_START] ⚡️ startHandshake iniciado', {
    hasOpener: !!window.opener,
    hasParent: window.parent !== window,
    urlParams: Object.fromEntries(urlParams.entries()),
    isStable: isStable
  });

  // PRIORIDAD 1: URL (Fat URL) - Sobrevive a todo
  const configFromUrl = {
    supabase_url: urlParams.get('supabase_url'),
    supabase_anon_key: urlParams.get('supabase_anon_key'),
    session_token: urlParams.get('session_token'),
    projectId: urlParams.get('satellite_id'),
    appId: urlParams.get('app_id'),
    site_id: urlParams.get('site_id'),
    siteName: urlParams.get('site_name')
  };

  if (configFromUrl.supabase_url && configFromUrl.session_token) {
    console.log("🚀 [SIP v5.2] Configuración recuperada desde URL.", configFromUrl);
    processConfig(configFromUrl);
    setupMessageListener(); // Solo para escuchar futuras órdenes
    return;
  }

  // PRIORIDAD 2: window.name (Cajón persistente)
  if (window.name) {
    try {
      const data = JSON.parse(window.name);
      if (data.type === 'SOLUTIUM_DIRECT_INJECTION' || data.type === 'SOLUTIUM_CONFIG') {
        logDebug("📦 [SIP v5.2] Configuración recuperada desde window.name.");
        processConfig(data.payload);
        setupMessageListener();
        return;
      }
    } catch(e) {}
  }

  // PRIORIDAD 3: Escucha Pasiva (Esperar a la Madre) y Solicitud Proactiva
  logDebug("⏳ [SIP v5.2] Esperando configuración de la App Madre...");
  setupMessageListener();
  
  // Solicitar proactivamente si tardamos más de 500ms
  setTimeout(() => {
    if (!isStable) {
      logDebug("📡 [SIP v5.2] Solicitando configuración (SOLUTIUM_GET_CONFIG)...");
      sendToMother({ type: 'SOLUTIUM_GET_CONFIG' });
    }
  }, 500);
};

/**
 * SIP v5.2: Envío Robusto con Estabilización
 */
export const sendToMother = (typeOrMessage: any, payload?: any) => {
  if (motherWindow && motherWindow !== window) {
    const message = payload !== undefined 
      ? { type: typeOrMessage, payload } 
      : typeOrMessage;
      
      motherWindow.postMessage(message, '*');
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
      if (!eventType || !['SOLUTIUM_CONFIG', 'SOLUTIUM_CONFIG_RESPONSE', 'SOLUTIUM_SET_CONFIG'].includes(eventType)) {
        return;
      }

      const payload = event.data?.payload || event.data?.config || (event.data?.projectId || event.data?.satellite_id ? event.data : null);
      const supabaseUrl = payload?.supabase_url;
      const supabaseAnonKey = payload?.supabase_anon_key;
      const sessionToken = payload?.session_token || payload?.supabaseAccessToken || payload?.accessToken;

      if (!supabaseUrl || !supabaseAnonKey || !sessionToken) {
        return;
      }

      try {
        sessionStorage.setItem('solutium_supabase_access_token', sessionToken);
        localStorage.setItem('solutium_handshake_cache', JSON.stringify(payload));
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
