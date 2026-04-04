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
}

export const listenForHandshake = (
  onHandshake: (payload: HandshakePayload) => void
) => {
  console.log("[DIAGNOSTICO] Listener de handshake inicializado.");

  const validateAndProcess = (data: any) => {
    if (!data) return false;
    
    // Soporte para el formato inyectado o el formato plano
    const payload = (data.type === 'SOLUTIUM_DIRECT_INJECTION' || data.type === 'SOLUTIUM_CONFIG') ? data.payload : data;
    if (!payload) return false;

    const required = ['satellite_id', 'supabase_url', 'supabase_anon_key', 'session_token'];
    const missing = required.filter(field => !payload[field]);

    if (missing.length > 0) {
      console.warn("[DIAGNOSTICO] Payload incompleto en URL:", missing);
      return false;
    }

    console.log("[DIAGNOSTICO] Handshake válido detectado. Payload completo:", payload);
    onHandshake(payload as HandshakePayload);
    return true;
  };

  // ESTRATEGIA PRIORITARIA: Leer de la URL (Fat URL)
  const urlParams = new URLSearchParams(window.location.search);
  const urlPayload: any = {};
  
  urlParams.forEach((val, key) => {
    try {
      // Intenta parsear si es JSON (para objetos complejos como project o activeThemeData)
      urlPayload[key] = JSON.parse(val);
    } catch (e) {
      urlPayload[key] = val;
    }
  });

  if (Object.keys(urlPayload).length > 0) {
    console.log("[DIAGNOSTICO] Detectada Fat URL. Intentando validar...");
    if (validateAndProcess(urlPayload)) {
      return () => {}; // Handshake completado por URL
    }
  }

  // ESTRATEGIA DE RESPALDO: window.name e inyección postMessage
  if (window.name) {
    try {
      const nameData = JSON.parse(window.name);
      validateAndProcess(nameData);
    } catch (e) { /* No es JSON */ }
  }

  const handler = (event: MessageEvent) => {
    if (!event.data) return;
    validateAndProcess(event.data);
  };

  window.addEventListener('message', handler);
  
  return () => window.removeEventListener('message', handler);
};
