import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logDebug } from '../utils/debug';

let supabaseInstance: SupabaseClient | null = null;

export const initSupabase = (url: string, key: string, token: string) => {
  if (!url || !key) {
    console.error('[Supabase] Missing URL or Key for initialization');
    return null;
  }
  
  try {
    supabaseInstance = createClient(url, key, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    logDebug('[Supabase] Client initialized successfully');
  } catch (error) {
    console.error('[Supabase] Initialization failed:', error);
    supabaseInstance = null;
  }
  
  return supabaseInstance;
};

export const getSupabase = () => {
  return supabaseInstance;
};
