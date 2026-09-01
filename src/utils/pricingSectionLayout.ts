import { parseNumSafe } from '../components/constructor/utils';

export const PRICING_PADDING_SETTING_ID = 'padding_y';
export const PRICING_DEFAULT_PADDING_Y = 40;
export const PRICING_LEGACY_PADDING_CLASS = 'py-12 @md:py-20 @lg:py-24';

export const getPricingPaddingPersistenceKey = (moduleId: string): string =>
  `${moduleId}_global_${PRICING_PADDING_SETTING_ID}`;

/**
 * Keeps the responsive spacing that predates the setting for legacy sections.
 * Once a value is explicitly present, it becomes the sole vertical source of truth.
 */
export const resolvePricingPaddingY = (value: unknown): number | undefined => {
  if (value === undefined) return undefined;
  return parseNumSafe(value, PRICING_DEFAULT_PADDING_Y);
};

export const getPricingSectionPaddingStyle = (value: unknown) => {
  const paddingY = resolvePricingPaddingY(value);
  return paddingY === undefined
    ? { className: PRICING_LEGACY_PADDING_CLASS, style: {} }
    : {
        className: '',
        style: {
          paddingTop: `${paddingY}px`,
          paddingBottom: `${paddingY}px`
        }
      };
};
