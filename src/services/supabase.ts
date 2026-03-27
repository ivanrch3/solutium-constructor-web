import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzysjtxnbzquufajtqgf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXNqdHhuYnpxdXVmYWp0cWdmIiwicm9sZSI6YmFub24iLCJpYXQiOjE3NzI3MzQzOTIsImV4cCI6MjA4ODMxMDM5Mn0.XR-SveroOoAXilYp_JVW2_yiZmrTjz4K1lxo2e_17_4';

const extractPayload = () => {
  const hash = window.location.hash;
  if (!hash.startsWith('#token=')) return null;
  
  try {
    const token = hash.replace('#token=', '');
    const parts = token.split('.');
    const payloadBase64 = parts.length > 1 ? parts[1] : parts[0];
    return JSON.parse(
      decodeURIComponent(
        Array.prototype.map.call(
          atob(payloadBase64.replace(/ /g, '+')),
          (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      )
    );
  } catch (error) {
    console.error('Error extracting payload:', error);
    return null;
  }
};

export const initialPayload = extractPayload();
const sessionToken = initialPayload?.sessionToken;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {})
    }
  }
});
