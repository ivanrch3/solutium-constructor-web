import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzysjtxnbzquufajtqgf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXNqdHhuYnpxdXVmYWp0cWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQzOTIsImV4cCI6MjA4ODMxMDM5Mn0.XR-SveroOoAXilYp_JVW2_yiZmrTjz4K1lxo2e_17_4';

const extractPayload = () => {
  const hash = window.location.hash;
  // Support both #token=... and #...&token=...
  const match = hash.match(/[#&]token=([^&]*)/);
  if (!match) return null;
  
  try {
    const token = decodeURIComponent(match[1]);
    const parts = token.split('.');
    
    // JWT: header.payload.signature (3 parts) -> index 1
    // Simple: payload (1 part) -> index 0
    let payloadBase64 = parts.length === 3 ? parts[1] : parts[0];
    
    // Protocol requirement: replace spaces with +
    payloadBase64 = payloadBase64.replace(/ /g, '+');
    
    // Fix URL-safe base64
    payloadBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    
    // Remove any character that is not in the base64 alphabet to prevent atob errors
    payloadBase64 = payloadBase64.replace(/[^A-Za-z0-9+/=]/g, '');

    // Add padding if missing
    while (payloadBase64.length % 4 !== 0) {
      payloadBase64 += '=';
    }

    const binaryString = atob(payloadBase64);
    return JSON.parse(
      decodeURIComponent(
        Array.prototype.map.call(
          binaryString,
          (c: any) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
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

// Use credentials from payload if provided by the App Madre, otherwise fallback to hardcoded ones
const finalUrl = initialPayload?.supabaseUrl || supabaseUrl;
const finalKey = initialPayload?.supabaseKey || supabaseAnonKey;

export const supabase = createClient(finalUrl, finalKey, {
  global: {
    headers: {
      'apikey': finalKey,
      ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {})
    }
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
