export type PricingMobilePlan = 'free' | 'pro';

export const PRICING_MOBILE_SWIPE_THRESHOLD = 72;
export const PRICING_MOBILE_SWIPE_VELOCITY_THRESHOLD = 500;

export type PricingConstructorViewport = 'desktop' | 'tablet' | 'mobile' | undefined;

export const resolvePricingIsMobile = ({
  constructorViewport,
  windowWidth
}: {
  constructorViewport?: PricingConstructorViewport;
  windowWidth?: number;
}) => {
  if (constructorViewport === 'mobile') return true;
  if (constructorViewport === 'desktop' || constructorViewport === 'tablet') return false;
  return typeof windowWidth === 'number' && windowWidth < 768;
};

export const normalizePricingPlansForRender = (value: unknown, fallback: unknown[] = []) => {
  const source = Array.isArray(value) ? value : fallback;

  return source.filter((plan): plan is Record<string, any> => {
    if (!plan || typeof plan !== 'object') return false;
    const candidate = plan as Record<string, any>;
    return candidate.visible !== false
      && candidate.hidden !== true
      && candidate.deleted !== true
      && candidate.isDeleted !== true
      && candidate.active !== false
      && candidate.is_active !== false;
  });
};

export const shouldUsePricingMobileSwitch = (planCount: number) => planCount === 2;

export const resolvePricingSwipePlan = ({
  currentPlan,
  offsetX,
  velocityX,
  threshold = PRICING_MOBILE_SWIPE_THRESHOLD,
  velocityThreshold = PRICING_MOBILE_SWIPE_VELOCITY_THRESHOLD
}: {
  currentPlan: PricingMobilePlan;
  offsetX: number;
  velocityX: number;
  threshold?: number;
  velocityThreshold?: number;
}): PricingMobilePlan => {
  if (currentPlan === 'free' && (offsetX <= -threshold || velocityX <= -velocityThreshold)) return 'pro';
  if (currentPlan === 'pro' && (offsetX >= threshold || velocityX >= velocityThreshold)) return 'free';
  return currentPlan;
};

export const resolvePricingMobilePlanIndex = (visiblePlan: PricingMobilePlan) => visiblePlan === 'pro' ? 1 : 0;

export const getPricingMobileToggleLabel = (
  visiblePlan: PricingMobilePlan,
  plans: Array<{ name?: unknown }>
) => {
  const targetIndex = resolvePricingMobilePlanIndex(visiblePlan) === 0 ? 1 : 0;
  const fallback = targetIndex === 1 ? 'Plan Pro' : 'Plan gratuito';
  const name = plans[targetIndex]?.name;
  return typeof name === 'string' && name.trim() ? name : fallback;
};
