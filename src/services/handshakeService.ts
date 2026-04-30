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
  console.log("🛠️ [SIP v5.2] Iniciando protocolo de arranque...");

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
          console.log("✅ [SIP v5.2] Conexión estabilizada con la App Madre.");
        }

        if (event.data.type === 'SOLUTIUM_CONFIG' || event.data.type === 'SOLUTIUM_CONFIG_RESPONSE' || event.data.type === 'SOLUTIUM_SET_CONFIG') {
          console.log(`✅ [SIP v5.2] Configuración recibida (${event.data.type}).`);
          processConfig(event.data.payload || event.data.config);
          sendToMother({ type: 'SOLUTIUM_ACK', status: 'success' });
        }
      }
    });
  };

  const urlParams = new URLSearchParams(window.location.search);
  
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
    console.log("🚀 [SIP v5.2] Configuración recuperada desde URL.");
    processConfig(configFromUrl);
    setupMessageListener(); // Solo para escuchar futuras órdenes
    return;
  }

  // PRIORIDAD 2: window.name (Cajón persistente)
  if (window.name) {
    try {
      const data = JSON.parse(window.name);
      if (data.type === 'SOLUTIUM_DIRECT_INJECTION' || data.type === 'SOLUTIUM_CONFIG') {
        console.log("📦 [SIP v5.2] Configuración recuperada desde window.name.");
        processConfig(data.payload);
        setupMessageListener();
        return;
      }
    } catch(e) {}
  }

  // PRIORIDAD 3: Escucha Pasiva (Esperar a la Madre) y Solicitud Proactiva
  console.log("⏳ [SIP v5.2] Esperando configuración de la App Madre...");
  setupMessageListener();
  
  // Solicitar proactivamente si tardamos más de 500ms
  setTimeout(() => {
    if (!isStable) {
      console.log("📡 [SIP v5.2] Solicitando configuración (SOLUTIUM_GET_CONFIG)...");
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
