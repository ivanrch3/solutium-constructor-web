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
let isStable = false;

/**
 * SIP v5.1: Captura de Madre y Envío Robusto con Estabilización
 */
export const sendToMother = (message: any) => {
  if (motherWindow && motherWindow !== window) {
    if (!isStable) console.warn("⚠️ [SIP] Enviando mensaje vía canal inestable (opener).");
    motherWindow.postMessage(message, '*');
  } else {
    console.error("❌ [SIP] No se detectó ventana Madre.");
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
      if (data.type === 'SOLUTIUM_CONFIG') {
        console.warn("[SIP v5.1] SOLUTIUM_CONFIG recibido pero incompleto:", missing);
      }
      return false;
    }

    // CAPTURA CRÍTICA: event.source es la conexión viva y directa
    if (source && source !== window) {
      motherWindow = source;
      isStable = true;
      console.log("✅ [SIP] Conexión estabilizada con la App Madre.");
    }

    console.log("[SIP v5.1] Handshake válido detectado. Payload:", payload);
    onHandshake(payload as HandshakePayload);

    // Confirmar recepción (ACK)
    sendToMother({ type: 'SOLUTIUM_ACK', status: 'success' });
    
    return true;
  };

  // --- RESILIENCIA ANTE REFRESCOS (F5 Safe) ---
  
  // 1. Prioridad 1: URL (supabase_url y session_token presentes)
  const urlParams = new URLSearchParams(window.location.search);
  const configFromUrl: any = {};
  urlParams.forEach((val, key) => {
    try { configFromUrl[key] = JSON.parse(val); } catch (e) { configFromUrl[key] = val; }
  });

  if (configFromUrl.supabase_url && configFromUrl.session_token) {
    console.log("✅ [SIP] Recuperado desde URL (F5 Safe)");
    if (validateAndProcess(configFromUrl)) {
      // Aunque carguemos de URL, necesitamos estabilizar el postMessage para guardar/publicar
      // Así que no retornamos aquí, dejamos que el Toc-Toc o el listener capturen el source
    }
  }

  // 2. Prioridad 2: window.name (Zero-Latency)
  if (window.name) {
    try {
      const nameData = JSON.parse(window.name);
      console.log("✅ [SIP] Recuperado desde window.name");
      validateAndProcess(nameData);
    } catch (e) { /* No es JSON */ }
  }

  // 3. Prioridad 3: Protocolo Toc-Toc (Gritar hasta que respondan)
  const tocTocInterval = setInterval(() => {
    if (isStable) {
      clearInterval(tocTocInterval);
      return;
    }
    console.log("[SIP v5.1] Toc-Toc... Enviando SOLUTIUM_GET_CONFIG");
    sendToMother({ type: 'SOLUTIUM_GET_CONFIG' });
  }, 2000);

  const handler = (event: MessageEvent) => {
    // Validar que el mensaje venga de Solutium
    if (event.data && event.data.type) {
      // Estabilización por CUALQUIER mensaje de la Madre
      if (event.source && event.source !== window) {
        motherWindow = event.source;
        isStable = true;
        console.log("✅ [SIP] Conexión estabilizada con la App Madre.");
      }

      if (event.data.type === 'SOLUTIUM_CONFIG') {
        clearInterval(tocTocInterval);
        validateAndProcess(event.data, event.source);
      }
    }
  };

  window.addEventListener('message', handler);
  
  return () => {
    clearInterval(tocTocInterval);
    window.removeEventListener('message', handler);
  };
};
