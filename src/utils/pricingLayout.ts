export const resolvePricingColumnCount = (planCount: unknown): number => {
  const numericCount = typeof planCount === 'number' && Number.isFinite(planCount)
    ? Math.floor(planCount)
    : 0;

  return Math.max(1, Math.min(4, numericCount));
};

export const resolvePricingGridClass = (desktopColumns: number): string => {
  if (desktopColumns >= 4) return 'grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-4';
  if (desktopColumns === 3) return 'grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-3';
  if (desktopColumns === 2) return 'grid-cols-1 @md:grid-cols-2';
  return 'grid-cols-1';
};
