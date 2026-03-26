import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzysjtxnbzquufajtqgf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXNqdHhuYnpxdXVmYWp0cWdmIiwicm9sZSI6YmFub24iLCJpYXQiOjE3NzI3MzQzOTIsImV4cCI6MjA4ODMxMDM5Mn0.XR-SveroOoAXilYp_JVW2_yiZmrTjz4K1lxo2e_17_4';

let supabaseInstance: any = null;

export const getSupabaseClient = (sessionToken?: string) => {
  if (!supabaseInstance || sessionToken) {
    const options = sessionToken 
      ? { global: { headers: { Authorization: `Bearer ${sessionToken}` } } }
      : {};
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, options);
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();
