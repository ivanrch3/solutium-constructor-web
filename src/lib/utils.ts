import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeToken(token: string) {
  try {
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
