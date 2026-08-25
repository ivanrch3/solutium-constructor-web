export const FEATURES_VISUAL_DEFAULTS = {
  image_size: 'medium',
  image_aspect: '16:9',
  image_fit: 'cover',
  image_position: 'center',
  media_align: 'left',
  icon_size: 24,
  icon_container_size: 48,
  icon_align: 'left',
  icon_position: 'top',
  media_gap: 24,
  text_gap: 8
} as const;

export type FeatureImageSize = keyof typeof IMAGE_SIZE_STYLES;

export const IMAGE_SIZE_STYLES = {
  small: { maxHeight: 120, width: 160 },
  medium: { maxHeight: 180, width: 240 },
  large: { maxHeight: 260, width: '100%' },
  full: { maxHeight: undefined, width: '100%' }
} as const;

export const IMAGE_ASPECT_RATIOS: Record<string, string | undefined> = {
  auto: undefined,
  square: '1 / 1',
  '4:3': '4 / 3',
  '16:9': '16 / 9',
  '3:2': '3 / 2'
};

export const IMAGE_OBJECT_FITS = ['cover', 'contain'] as const;
export const IMAGE_OBJECT_POSITIONS = ['center', 'top', 'bottom', 'left', 'right'] as const;

export const resolveFeatureImageSize = (value: unknown): FeatureImageSize =>
  value === 'small' || value === 'large' || value === 'full' ? value : 'medium';

export const resolveFeatureImageAspect = (value: unknown) => {
  if (value === 'auto') return undefined;
  return IMAGE_ASPECT_RATIOS[value as string] ?? IMAGE_ASPECT_RATIOS[FEATURES_VISUAL_DEFAULTS.image_aspect];
};

export const resolveFeatureObjectFit = (value: unknown): 'cover' | 'contain' =>
  value === 'contain' ? 'contain' : 'cover';

export const resolveFeatureObjectPosition = (value: unknown) =>
  IMAGE_OBJECT_POSITIONS.includes(value as any) ? value as string : FEATURES_VISUAL_DEFAULTS.image_position;

export const resolveFeatureNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};
