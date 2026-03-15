import { createClient, SupabaseClient } from '@supabase/supabase-js';

let clientInstance: SupabaseClient | null = null;

// Función para inicializar dinámicamente con credenciales de la App Madre
export const initSupabase = (url: string, key: string) => {
  if (url && key) {
    clientInstance = createClient(url, key);
    console.log('Cliente de Supabase inicializado dinámicamente con credenciales de Solutium.');
  }
};

// Exportar un proxy para que las llamadas a supabase.from() funcionen
// y usen la instancia correcta
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    if (!clientInstance) {
      // No inicializar con placeholder, esperar a que la App Madre envíe la config
      console.warn('Supabase no ha sido inicializado. Esperando configuración de la App Madre...');
      return undefined;
    }
    const value = (clientInstance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(clientInstance);
    }
    return value;
  }
});
