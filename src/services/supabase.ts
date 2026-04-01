// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { migrationLogger } from '../lib/migrationLogger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  migrationLogger.error('SUPABASE_INIT', 'Faltan variables de entorno de Supabase');
}

// Singleton para evitar múltiples conexiones
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const initSupabase = (url: string, key: string, token?: string) => {
  migrationLogger.log('SUPABASE_INIT', 'initSupabase called but ignored, using env vars');
};

migrationLogger.success('SUPABASE_INIT', 'Cliente de Supabase inicializado correctamente');