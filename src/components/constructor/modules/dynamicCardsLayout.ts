export const DYNAMIC_CARDS_EXTERNAL_SPACING_DEFAULTS = {
  top: 0,
  bottom: 0
} as const;

export const resolveDynamicCardsExternalSpacing = (value: unknown, fallback: number) => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? Math.min(120, Math.max(0, parsed)) : fallback;
};
