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
  console.log("[DIAGNOSTICO] Listener de handshake inicializado y esperando mensajes...");

  const handler = (event: MessageEvent) => {
    console.log("[DIAGNOSTICO] Mensaje recibido en Satélite");
    console.log("[DIAGNOSTICO] Origen del mensaje (event.origin):", event.origin);
    console.log("[DIAGNOSTICO] Datos del mensaje (event.data):", event.data);

    const data = event.data;
    
    if (!data) {
      console.warn("[DIAGNOSTICO] El mensaje fue ignorado: event.data es null o undefined.");
      return;
    }

    // Validar qué campos faltan para dar un reporte exacto
    const missingFields = [];
    if (!data.satellite_id) missingFields.push('satellite_id');
    if (!data.supabase_url) missingFields.push('supabase_url');
    if (!data.supabase_anon_key) missingFields.push('supabase_anon_key');
    if (!data.session_token) missingFields.push('session_token');

    if (missingFields.length > 0) {
      // Es normal recibir mensajes de extensiones de React/Vite, así que solo logueamos como warning
      // si parece ser un intento de handshake pero está incompleto, o simplemente lo ignoramos.
      // Para diagnóstico profundo, logueamos todo.
      console.warn(`[DIAGNOSTICO] Mensaje ignorado. Faltan campos requeridos para el handshake: ${missingFields.join(', ')}`);
      return;
    }

    console.log("[DIAGNOSTICO] Handshake válido. Procesando payload...");
    onHandshake(data as HandshakePayload);
  };

  window.addEventListener('message', handler);
  
  return () => {
    console.log("[DIAGNOSTICO] Removiendo listener de handshake...");
    window.removeEventListener('message', handler);
  };
};
