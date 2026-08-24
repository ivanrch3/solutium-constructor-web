import {
  normalizePlanComparisonConfig,
  type ComparisonPlan,
  type PlanComparisonConfigV1
} from './planComparisonConfig';

export const PRICING_PLANS_ELEMENT_ID = 'el_pricing_plans';
export const PRICING_PLANS_SETTING_ID = 'plans';

const PLAN_ID_PATTERN = /^plan_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PricingPlan = Record<string, any> & { id?: string };

export const createPricingPlanId = (): string => {
  const uuid = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 10);
  return `plan_${uuid}`;
};

export const isValidPricingPlanId = (value: unknown): value is string => (
  typeof value === 'string' && PLAN_ID_PATTERN.test(value.trim())
);

export const getPricingPlansSettingKey = (
  moduleId: string,
  settingsValues: Record<string, any> = {}
): string => {
  const canonicalKey = `${moduleId}_${PRICING_PLANS_ELEMENT_ID}_${PRICING_PLANS_SETTING_ID}`;
  return Object.prototype.hasOwnProperty.call(settingsValues, canonicalKey)
    ? canonicalKey
    : `${moduleId}_global_plans`;
};

export const normalizePricingPlans = (value: unknown): PricingPlan[] => {
  const source = Array.isArray(value) ? value : [];
  const usedIds = new Set<string>();

  return source.map((item) => {
    const plan = item && typeof item === 'object' ? { ...(item as PricingPlan) } : {};
    let id = isValidPricingPlanId(plan.id) && !usedIds.has(plan.id) ? plan.id : createPricingPlanId();
    while (usedIds.has(id)) id = createPricingPlanId();
    usedIds.add(id);
    return { ...plan, id };
  });
};

export const ensurePricingPlanIds = normalizePricingPlans;

export const duplicatePricingPlan = (value: unknown, index: number): PricingPlan[] => {
  const plans = normalizePricingPlans(value);
  if (index < 0 || index >= plans.length) return plans;
  const source = plans[index];
  const duplicate = { ...source, id: createPricingPlanId() };
  return [...plans.slice(0, index + 1), duplicate, ...plans.slice(index + 1)];
};

export const readPricingPlans = (
  moduleId: string,
  settingsValues: Record<string, any>
): { key: string; plans: PricingPlan[] } => {
  const key = getPricingPlansSettingKey(moduleId, settingsValues);
  return { key, plans: normalizePricingPlans(settingsValues[key]) };
};

const formatPricing = (value: unknown, currencySymbol: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const symbol = typeof currencySymbol === 'string' ? currencySymbol : '';
  return `${symbol}${String(value)}`;
};

export const resolvePricingPlansForComparison = (
  pricingPlans: unknown,
  options: { currencySymbol?: unknown; maxPlans?: number } = {}
): ComparisonPlan[] => {
  const normalized = normalizePricingPlans(pricingPlans);
  const maxPlans = options.maxPlans ?? 4;

  return normalized.slice(0, maxPlans).map((plan, index) => ({
    id: plan.id as string,
    name: typeof plan.name === 'string' && plan.name.trim() ? plan.name.trim() : `Plan ${String.fromCharCode(65 + index)}`,
    description: typeof plan.description === 'string' && plan.description.trim() ? plan.description.trim() : undefined,
    price: formatPricing(plan.monthlyPrice, options.currencySymbol),
    secondaryPrice: formatPricing(plan.yearlyPrice, options.currencySymbol),
    badge: typeof plan.badge === 'string' && plan.badge.trim() ? plan.badge.trim() : undefined,
    cta: typeof plan.cta === 'string' && plan.cta.trim()
      ? { label: plan.cta.trim(), url: typeof plan.cta_url === 'string' ? plan.cta_url : undefined }
      : undefined,
    featured: plan.highlight === true,
    visible: plan.visible !== false
  }));
};

export const reconcileLinkedPlanComparison = (
  configValue: unknown,
  pricingPlans: unknown,
  options: { currencySymbol?: unknown; pricingModuleId: string; maxPlans?: number }
): PlanComparisonConfigV1 => {
  const config = normalizePlanComparisonConfig(configValue);
  const resolvedPlans = resolvePricingPlansForComparison(pricingPlans, options);
  const previousValues = new Map<string, Record<string, any>>();

  config.sections.forEach((section) => section.features.forEach((feature) => {
    previousValues.set(feature.id, feature.values);
  }));

  const sections = config.sections.map((section) => ({
    ...section,
    features: section.features.map((feature) => {
      const values = previousValues.get(feature.id) || feature.values;
      return {
        ...feature,
        values: Object.fromEntries(resolvedPlans.map((plan) => [
          plan.id,
          values[plan.id] || { type: 'not_applicable' as const }
        ]))
      };
    })
  }));

  return normalizePlanComparisonConfig({
    ...config,
    source: { mode: 'pricing', pricingModuleId: options.pricingModuleId },
    plans: resolvedPlans,
    snapshot: { plans: resolvedPlans },
    sections
  });
};

export const unlinkPlanComparison = (configValue: unknown): PlanComparisonConfigV1 => {
  const config = normalizePlanComparisonConfig(configValue);
  const plans = config.snapshot?.plans?.length ? config.snapshot.plans : config.plans;
  return normalizePlanComparisonConfig({
    ...config,
    source: { mode: 'standalone' },
    plans,
    snapshot: undefined
  });
};

export const reconcileAllLinkedPlanComparisons = (state: {
  addedModules: Array<{ id: string; type: string }>;
  settingsValues: Record<string, any>;
}): Record<string, any> => {
  const nextSettings = { ...state.settingsValues };
  const pricingModules = state.addedModules.filter((module) => module.type === 'pricing');

  state.addedModules.filter((module) => module.type === 'plan_comparison').forEach((comparisonModule) => {
    const key = `${comparisonModule.id}_global_config`;
    const config = normalizePlanComparisonConfig(nextSettings[key]);
    if (config.source.mode !== 'pricing' || !config.source.pricingModuleId) return;

    const source = pricingModules.find((module) => module.id === config.source.pricingModuleId);
    if (!source) return;

    const pricing = readPricingPlans(source.id, nextSettings);
    if (pricing.plans.length < 2) return;
    const currencySymbol = nextSettings[`${source.id}_el_pricing_price_currency_symbol`] ?? '$';
    const reconciled = reconcileLinkedPlanComparison(config, pricing.plans, {
      pricingModuleId: source.id,
      currencySymbol
    });
    nextSettings[key] = reconciled;
  });

  return nextSettings;
};
