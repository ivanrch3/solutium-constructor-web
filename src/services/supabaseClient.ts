import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const initSupabase = (url: string, key: string, token: string) => {
  supabaseInstance = createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return supabaseInstance;
};

export const getSupabase = () => {
  return supabaseInstance;
};
