import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeToken(token: string) {
  try {
    const payloadBase64 = token.split('.')[0];
    const decoded = JSON.parse(
      decodeURIComponent(
        Array.prototype.map.call(
          atob(payloadBase64.replace(/ /g, '+')),
          (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      )
    );
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
