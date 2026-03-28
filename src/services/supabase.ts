import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzysjtxnbzquufajtqgf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXNqdHhuYnpxdXVmYWp0cWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQzOTIsImV4cCI6MjA4ODMxMDM5Mn0.XR-SveroOoAXilYp_JVW2_yiZmrTjz4K1lxo2e_17_4';

// Singleton instance
let supabase: any = null;

export const initSupabase = (sessionToken?: string) => {
  if (supabase) return supabase;

  const options = sessionToken ? {
    global: {
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    }
  } : {};

  supabase = createClient(supabaseUrl, supabaseAnonKey, options);
  return supabase;
};

export const getSupabase = () => {
  if (!supabase) {
    // Fallback if not initialized with token
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
};
