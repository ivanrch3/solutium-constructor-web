// src/services/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { migrationLogger } from '../lib/migrationLogger';

// Variable para mantener la instancia activa
let supabaseInstance: SupabaseClient | null = null;

/**
 * Función para obtener o inicializar el cliente de Supabase dinámicamente.
 * Si se pasan credenciales, se crea una nueva instancia.
 */
export const getSupabaseClient = (url?: string, key?: string, token?: string) => {
  // Si ya existe una instancia y no se pasan nuevas credenciales, devolvemos la existente
  if (supabaseInstance && !url && !key) return supabaseInstance;

  // Usar credenciales dinámicas o fallback a las variables de entorno
  const finalUrl = url || import.meta.env.VITE_SUPABASE_URL;
  const finalKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!finalUrl || !finalKey) {
    migrationLogger.error('SUPABASE_INIT', 'Faltan credenciales de Supabase');
    throw new Error('Supabase credentials missing');
  }

  // Si se pasa un token de sesión, lo inyectamos en los headers
  const options = token ? { 
    auth: { persistSession: false, autoRefreshToken: false }, 
    global: { headers: { Authorization: `Bearer ${token}` } } 
  } : {};
  
  supabaseInstance = createClient(finalUrl, finalKey, options);
  
  migrationLogger.success('SUPABASE_INIT', 'Cliente de Supabase inicializado dinámicamente');
  return supabaseInstance;
};

// Exportar una instancia por defecto para mantener compatibilidad con el código actual
// que importa 'supabase' directamente.
export const supabase = getSupabaseClient();