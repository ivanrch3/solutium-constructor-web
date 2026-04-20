
export type TypographySizeToken = 't1' | 't2' | 't3' | 'p' | 's';
export type FontWeightToken = 'light' | 'normal' | 'semibold' | 'extrabold' | 'black';
export type TextAlignToken = 'left' | 'center' | 'right' | 'justify';

export interface TypographyScaleValue {
  fontSize: number;
  lineHeight: number;
  label: string;
}

export const TYPOGRAPHY_SCALE: Record<TypographySizeToken, TypographyScaleValue> = {
  t1: { fontSize: 48, lineHeight: 1.1, label: 'Título 1 (Display)' },
  t2: { fontSize: 32, lineHeight: 1.2, label: 'Título 2 (Sección)' },
  t3: { fontSize: 20, lineHeight: 1.3, label: 'Título 3 (Subtítulo)' },
  p: { fontSize: 16, lineHeight: 1.6, label: 'Cuerpo (Párrafo)' },
  s: { fontSize: 13, lineHeight: 1.5, label: 'Pequeño (Caption)' },
};

export const FONT_WEIGHTS: Record<FontWeightToken, { value: number, label: string }> = {
  light: { value: 300, label: 'Light' },
  normal: { value: 400, label: 'Normal' },
  semibold: { value: 600, label: 'Semi Bold' },
  extrabold: { value: 800, label: 'Extra Bold' },
  black: { value: 900, label: 'Black' },
};

export const TEXT_ALIGNMENTS: Record<TextAlignToken, { label: string }> = {
  left: { label: 'Izquierda' },
  center: { label: 'Centro' },
  right: { label: 'Derecha' },
  justify: { label: 'Justificado' },
};
