export interface HandshakePayload {
  satellite_id: string;
  supabase_url: string;
  supabase_anon_key: string;
  session_token: string;
  do_endpoint?: string;
  do_access_key?: string;
  do_secret_key?: string;
  do_bucket?: string;
}

export const listenForHandshake = (
  onHandshake: (payload: HandshakePayload) => void
) => {
  console.log("[DIAGNOSTICO] Listener de handshake inicializado.");

  const validateAndProcess = (data: any) => {
    if (!data) return false;
    
    // Soporte para el formato inyectado o el formato plano
    const payload = (data.type === 'SOLUTIUM_DIRECT_INJECTION') ? data.payload : data;
    if (!payload) return false;

    const required = ['satellite_id', 'supabase_url', 'supabase_anon_key', 'session_token'];
    const missing = required.filter(field => !payload[field]);

    if (missing.length > 0) return false;

    console.log("[DIAGNOSTICO] Handshake válido detectado. Procesando...");
    onHandshake(payload as HandshakePayload);
    return true;
  };

  // ESTRATEGIA 1: Revisar window.name (Inyección Directa)
  if (window.name) {
    try {
      const nameData = JSON.parse(window.name);
      validateAndProcess(nameData);
    } catch (e) { /* No es JSON, ignorar */ }
  }

  // ESTRATEGIA 2: Listener de mensajes postMessage
  const handler = (event: MessageEvent) => {
    if (!event.data) return;
    validateAndProcess(event.data);
  };

  window.addEventListener('message', handler);
  
  // Avisar a la Madre que estamos listos para recibir datos
  const signalReady = () => {
    const readyMsg = { type: 'SOLUTIUM_SATELLITE_READY', timestamp: Date.now() };
    if (window.opener) window.opener.postMessage(readyMsg, '*');
    else if (window.parent !== window) window.parent.postMessage(readyMsg, '*');
  };
  
  signalReady();
  const readyInterval = setInterval(signalReady, 2000); // Re-intentar cada 2s

  return () => {
    window.removeEventListener('message', handler);
    clearInterval(readyInterval);
  };
};
