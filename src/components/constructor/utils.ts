
/**
 * Pasa un valor a número de forma segura, garantizando que el resultado sea finito.
 * Si el valor no es un número válido, devuelve el valor predeterminado (fallback).
 */
export const parseNumSafe = (val: any, fallback: number = 0): number => {
  const parsed = typeof val === 'number' ? val : parseFloat(val);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Normaliza un valor para ser usado en propiedades CSS que requieren unidades.
 */
export const toSafePx = (val: any, fallback: number = 0): string => {
  return `${parseNumSafe(val, fallback)}px`;
};

export const toSafePct = (val: any, fallback: number = 0): string => {
  return `${parseNumSafe(val, fallback)}%`;
};

/**
 * Valida si un string de degradado es seguro para ser inyectado en el DOM.
 */
export const isSafeGradient = (gradient: any): boolean => {
  if (typeof gradient !== 'string') return false;
  return !gradient.includes('NaN') && !gradient.includes('undefined') && gradient.includes('gradient');
};

/**
 * Obtiene un valor del tema global de forma segura
 */
export const getThemeVal = (settingsValues: Record<string, any>, key: string, fallback: any): any => {
  return settingsValues[`global_theme_${key}`] ?? fallback;
};

/**
 * Obtiene la familia de fuente configurada en el tema
 */
export const getFontFamily = (settingsValues: Record<string, any>, type: 'sans' | 'heading'): string => {
  const fontKey = type === 'sans' ? 'font_sans' : 'font_heading';
  const defaultFont = type === 'sans' ? '"Inter", sans-serif' : '"Outfit", sans-serif';
  const font = settingsValues[`global_theme_${fontKey}`] ?? defaultFont;
  return font.includes(',') ? font : `"${font}", sans-serif`;
};

/**
 * Obtiene el radio de borde configurado en el tema
 */
export const getBorderRadius = (settingsValues: Record<string, any>): string => {
  const radius = settingsValues['global_theme_radius'] ?? 12;
  return `${radius}px`;
};
