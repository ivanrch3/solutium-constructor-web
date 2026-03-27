import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeToken(token: string) {
  try {
    // Decode URL encoding if present
    const decodedToken = decodeURIComponent(token);
    const parts = decodedToken.split('.');
    
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
    console.error('Error decoding token:', error);
    return null;
  }
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/(_[a-z])/g, group => group.toUpperCase().replace('_', ''))]: toCamelCase(obj[key]),
      }),
      {}
    );
  }
  return obj;
}

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)]: toSnakeCase(obj[key]),
      }),
      {}
    );
  }
  return obj;
}
