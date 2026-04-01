// src/lib/migrationLogger.ts
/**
 * Sistema de Logs para monitorear la migración de arquitectura
 */
export const migrationLogger = {
  log: (step: string, message: string, data?: any) => {
    console.log(`%c[MIGRACIÓN - ${step}]%c ${message}`, 'color: #6366f1; font-weight: bold;', 'color: inherit;', data || '');
  },
  error: (step: string, message: string, error?: any) => {
    console.error(`%c[MIGRACIÓN ERROR - ${step}]%c ${message}`, 'color: #ef4444; font-weight: bold;', 'color: inherit;', error || '');
  },
  success: (step: string, message: string) => {
    console.log(`%c[MIGRACIÓN ÉXITO - ${step}]%c ${message}`, 'color: #22c55e; font-weight: bold;', 'color: inherit;');
  }
};