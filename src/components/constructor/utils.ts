import { FONT_WEIGHTS, TYPOGRAPHY_SCALE } from '../../constants/typography';

export const parseNumSafe = (val: any, fallback: number = 0): number => {
  const parsed = typeof val === 'number' ? val : parseFloat(val);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const toSafePx = (val: any, fallback: number = 0): string => {
  return `${parseNumSafe(val, fallback)}px`;
};

export const toSafePct = (val: any, fallback: number = 0): string => {
  return `${parseNumSafe(val, fallback)}%`;
};

export const isSafeGradient = (gradient: any): boolean => {
  if (typeof gradient !== 'string') return false;
  return !gradient.includes('NaN') && !gradient.includes('undefined') && gradient.includes('gradient');
};

export const getThemeVal = (settingsValues: Record<string, any>, key: string, fallback: any): any => {
  return settingsValues[`global_theme_${key}`] ?? fallback;
};

export const getFontFamily = (settingsValues: Record<string, any>, type: 'sans' | 'heading'): string => {
  const fontKey = type === 'sans' ? 'font_sans' : 'font_heading';
  const defaultFont = type === 'sans' ? '"Inter", sans-serif' : '"Outfit", sans-serif';
  const font = settingsValues[`global_theme_${fontKey}`] ?? defaultFont;
  return font.includes(',') ? font : `"${font}", sans-serif`;
};

export const getBorderRadius = (settingsValues: Record<string, any>): string => {
  const radius = settingsValues['global_theme_radius'] ?? 12;
  return `${radius}px`;
};

export const isDarkColor = (color: string): boolean => {
  if (!color || typeof color !== 'string') return true;

  let r;
  let g;
  let b;

  if (color.startsWith('#')) {
    let hex = color.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((s) => s + s).join('');
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return false;
    r = parseInt(match[1]);
    g = parseInt(match[2]);
    b = parseInt(match[3]);
  } else {
    return false;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;

  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  return hsp < 155;
};

export const BUTTON_TYPOGRAPHY_LEVELS = ['t3', 'p', 's'] as const;

export type ButtonTypographySizeToken = typeof BUTTON_TYPOGRAPHY_LEVELS[number];

export const getButtonTypographyStyle = (
  sizeToken: string | undefined,
  weightToken: string | undefined
) => {
  const normalizedSize = BUTTON_TYPOGRAPHY_LEVELS.includes(sizeToken as ButtonTypographySizeToken)
    ? (sizeToken as keyof typeof TYPOGRAPHY_SCALE)
    : 's';
  const size = TYPOGRAPHY_SCALE[normalizedSize];
  const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.black;

  return {
    fontSize: `${size.fontSize}px`,
    lineHeight: size.lineHeight,
    fontWeight: weight.value
  };
};

export const getLegacyButtonTypographyStyle = (
  fontSizePx: number,
  fontWeight: number,
  lineHeight = 1.2
) => ({
  fontSize: `${fontSizePx}px`,
  lineHeight,
  fontWeight
});
