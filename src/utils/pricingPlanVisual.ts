export type PricingPlanVisualType = 'icon' | 'image';

export const resolveIconName = (value: unknown): string => {
  if (typeof value === 'string') return value.trim() || 'Check';
  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    for (const key of ['name', 'iconName', 'icon', 'value', 'id']) {
      if (typeof candidate[key] === 'string' && candidate[key].trim()) return candidate[key].trim();
    }
  }
  return 'Check';
};

export const resolvePricingPlanVisualType = (value: unknown): PricingPlanVisualType => value === 'image' ? 'image' : 'icon';

// SettingControl type='image' persists the uploaded or selected asset as a URL string.
export const resolvePricingImageSrc = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

export const resolvePricingImageAlt = (value: unknown, planName: unknown): string => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof planName === 'string' && planName.trim()) return planName.trim();
  return 'Imagen del plan';
};
