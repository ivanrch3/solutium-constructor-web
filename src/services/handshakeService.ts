export interface HandshakePayload {
  satellite_id: string;
  supabase_url: string;
  supabase_anon_key: string;
  session_token: string;
  do_endpoint?: string;
  do_access_key?: string;
  do_secret_key?: string;
  do_bucket?: string;
  fontFamily?: string;
  profile?: any;
  project?: any;
  activeThemeData?: any;
  favicon_url?: string;
  faviconUrl?: string;
  site_id?: string; // SIP v5.1: site_id provided by Mother
}

let motherWindow: any = window.opener || window.parent;

/**
 * SIP v5.1: Captura de Madre y Envío Robusto
 */
export const sendToMother = (message: any) => {
  if (motherWindow && motherWindow !== window) {
    motherWindow.postMessage(message, '*');
  } else {
    console.warn("[SIP v5.1] No se detectó ventana Madre estable. Intentando con window.opener...");
    if (window.opener) window.opener.postMessage(message, '*');
  }
};

export const listenForHandshake = (
  onHandshake: (payload: HandshakePayload) => void
) => {
  console.log("[SIP v5.1] Protocolo Handshake (Toc-Toc) inicializado.");

  const validateAndProcess = (data: any, source?: any) => {
    if (!data) return false;
    
    // Soporte para el formato inyectado o el formato plano
    const payload = (data.type === 'SOLUTIUM_DIRECT_INJECTION' || data.type === 'SOLUTIUM_CONFIG') ? data.payload : data;
    if (!payload) return false;

    const required = ['satellite_id', 'supabase_url', 'supabase_anon_key', 'session_token'];
    const missing = required.filter(field => !payload[field]);

    if (missing.length > 0) {
      // Si es un mensaje de configuración pero faltan campos, no lo procesamos como handshake completo
      if (data.type === 'SOLUTIUM_CONFIG') {
        console.warn("[SIP v5.1] SOLUTIUM_CONFIG recibido pero incompleto:", missing);
      }
      return false;
    }

    // CAPTURA CRÍTICA: Si viene de un evento message, capturamos el source como la Madre real
    if (source) {
      motherWindow = source;
      console.log("[SIP v5.1] CAPTURA CRÍTICA: Ventana Madre vinculada via event.source");
    }

    console.log("[SIP v5.1] Handshake válido detectado. Payload:", payload);
    onHandshake(payload as HandshakePayload);

    // Confirmar recepción (ACK)
    sendToMother({ type: 'SOLUTIUM_ACK', status: 'success' });
    
    return true;
  };

  // 1. ESTRATEGIA: Fat URL (Prioridad alta para carga rápida)
  const urlParams = new URLSearchParams(window.location.search);
  const urlPayload: any = {};
  urlParams.forEach((val, key) => {
    try { urlPayload[key] = JSON.parse(val); } catch (e) { urlPayload[key] = val; }
  });

  if (Object.keys(urlPayload).length > 0 && validateAndProcess(urlPayload)) {
    return () => {}; 
  }

  // 2. ESTRATEGIA: Zero-Latency window.name
  if (window.name) {
    try {
      const nameData = JSON.parse(window.name);
      if (validateAndProcess(nameData)) return () => {};
    } catch (e) { /* No es JSON */ }
  }

  // 3. ESTRATEGIA: Protocolo Toc-Toc (Polling)
  const tocTocInterval = setInterval(() => {
    console.log("[SIP v5.1] Toc-Toc... Enviando SOLUTIUM_GET_CONFIG");
    sendToMother({ type: 'SOLUTIUM_GET_CONFIG' });
  }, 2000);

  const handler = (event: MessageEvent) => {
    if (!event.data) return;
    
    if (event.data.type === 'SOLUTIUM_CONFIG') {
      clearInterval(tocTocInterval);
      validateAndProcess(event.data, event.source);
    }
  };

  window.addEventListener('message', handler);
  
  return () => {
    clearInterval(tocTocInterval);
    window.removeEventListener('message', handler);
  };
};
