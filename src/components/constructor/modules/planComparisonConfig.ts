export const PLAN_COMPARISON_CONFIG_VERSION = 1 as const;

export type ComparisonCellType = 'included' | 'excluded' | 'not_applicable' | 'text';

export type ComparisonCellValue = {
  type: ComparisonCellType;
  text?: string;
};

export type ComparisonPlan = {
  id: string;
  name: string;
  description?: string;
  price?: string;
  secondaryPrice?: string;
  badge?: string;
  cta?: { label?: string; url?: string };
  featured: boolean;
  visible: boolean;
};

export type ComparisonFeature = {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  values: Record<string, ComparisonCellValue>;
};

export type ComparisonSection = {
  id: string;
  title: string;
  visible: boolean;
  collapsible: boolean;
  defaultExpanded: boolean;
  features: ComparisonFeature[];
};

export type PlanComparisonConfigV1 = {
  version: typeof PLAN_COMPARISON_CONFIG_VERSION;
  source: { mode: 'standalone' | 'pricing'; pricingModuleId?: string };
  snapshot?: { plans: ComparisonPlan[] };
  header: { eyebrow?: string; title?: string; description?: string };
  plans: ComparisonPlan[];
  sections: ComparisonSection[];
  bottomCta: { enabled: boolean };
};

const ID_PATTERN = /^[a-z][a-z0-9_]*_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createId = (prefix: string) => {
  const uuid = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 10);
  return `${prefix}_${uuid}`;
};

export const createPlanComparisonId = (prefix: 'plan' | 'section' | 'feature') => createId(prefix);

const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;

const normalizeId = (value: unknown, prefix: string) => {
  const candidate = text(value).trim();
  return ID_PATTERN.test(candidate) ? candidate : createId(prefix);
};

const normalizeCell = (value: unknown): ComparisonCellValue => {
  if (!value || typeof value !== 'object') return { type: 'not_applicable' };
  const raw = value as Record<string, unknown>;
  const type: ComparisonCellType = raw.type === 'included' || raw.type === 'excluded' || raw.type === 'text'
    ? raw.type
    : raw.type === 'not_applicable' ? 'not_applicable' : 'not_applicable';
  const cell: ComparisonCellValue = { type };
  const cellText = text(raw.text).trim();
  if (type === 'text' && cellText) cell.text = cellText;
  return cell;
};

export const normalizeComparisonPlan = (value: unknown, index = 0): ComparisonPlan => {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const cta = raw.cta && typeof raw.cta === 'object' ? raw.cta as Record<string, unknown> : {};
  return {
    id: normalizeId(raw.id, `plan_${index + 1}`),
    name: text(raw.name, `Plan ${String.fromCharCode(65 + index)}`).trim() || `Plan ${String.fromCharCode(65 + index)}`,
    description: text(raw.description).trim() || undefined,
    price: text(raw.price).trim() || undefined,
    secondaryPrice: text(raw.secondaryPrice).trim() || undefined,
    badge: text(raw.badge).trim() || undefined,
    cta: text(cta.label).trim() || text(cta.url).trim() ? {
      label: text(cta.label).trim() || undefined,
      url: text(cta.url).trim() || undefined
    } : undefined,
    featured: raw.featured === true,
    visible: raw.visible !== false
  };
};

export const normalizeComparisonFeature = (value: unknown, planIds: string[], index = 0): ComparisonFeature => {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const rawValues = raw.values && typeof raw.values === 'object' ? raw.values as Record<string, unknown> : {};
  const values: Record<string, ComparisonCellValue> = {};
  planIds.forEach((planId) => { values[planId] = normalizeCell(rawValues[planId]); });
  return {
    id: normalizeId(raw.id, `feature_${index + 1}`),
    name: text(raw.name, `Característica ${index + 1}`).trim() || `Característica ${index + 1}`,
    description: text(raw.description).trim() || undefined,
    visible: raw.visible !== false,
    values
  };
};

export const normalizeComparisonSection = (value: unknown, planIds: string[], index = 0): ComparisonSection => {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const features = Array.isArray(raw.features)
    ? raw.features.map((feature, featureIndex) => normalizeComparisonFeature(feature, planIds, featureIndex))
    : [];
  return {
    id: normalizeId(raw.id, `section_${index + 1}`),
    title: text(raw.title, `Sección ${index + 1}`).trim() || `Sección ${index + 1}`,
    visible: raw.visible !== false,
    collapsible: raw.collapsible !== false,
    defaultExpanded: raw.defaultExpanded !== false,
    features
  };
};

const ensureMinimumPlans = (plans: ComparisonPlan[]) => {
  const next = plans.slice(0, 4);
  while (next.length < 2) next.push(normalizeComparisonPlan(undefined, next.length));
  return next;
};

export const normalizePlanComparisonConfig = (value: unknown): PlanComparisonConfigV1 => {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const rawSource = raw.source && typeof raw.source === 'object' ? raw.source as Record<string, unknown> : {};
  const rawSnapshot = raw.snapshot && typeof raw.snapshot === 'object' ? raw.snapshot as Record<string, unknown> : undefined;
  const rawSnapshotPlans = rawSnapshot && Array.isArray(rawSnapshot.plans) ? rawSnapshot.plans : [];
  const rawPlans = Array.isArray(raw.plans) && raw.plans.length > 0
    ? raw.plans
    : rawSource.mode === 'pricing' ? rawSnapshotPlans : [];
  const plans = ensureMinimumPlans(rawPlans.map(normalizeComparisonPlan));
  const featuredIndex = plans.findIndex((plan) => plan.featured);
  const normalizedPlans = plans.map((plan, index) => ({ ...plan, featured: index === featuredIndex }));
  const planIds = normalizedPlans.map((plan) => plan.id);
  const rawHeader = raw.header && typeof raw.header === 'object' ? raw.header as Record<string, unknown> : {};
  const snapshotPlans = rawSnapshot && Array.isArray(rawSnapshot.plans)
    ? ensureMinimumPlans(rawSnapshot.plans.map(normalizeComparisonPlan))
    : undefined;
  return {
    version: PLAN_COMPARISON_CONFIG_VERSION,
    source: {
      mode: rawSource.mode === 'pricing' ? 'pricing' : 'standalone',
      ...(text(rawSource.pricingModuleId).trim() ? { pricingModuleId: text(rawSource.pricingModuleId).trim() } : {})
    },
    ...(snapshotPlans ? { snapshot: { plans: snapshotPlans } } : {}),
    header: {
      eyebrow: text(rawHeader.eyebrow).trim() || undefined,
      title: text(rawHeader.title).trim() || undefined,
      description: text(rawHeader.description).trim() || undefined
    },
    plans: normalizedPlans,
    sections: Array.isArray(raw.sections)
      ? raw.sections.map((section, index) => normalizeComparisonSection(section, planIds, index))
      : [],
    bottomCta: {
      enabled: raw.bottomCta && typeof raw.bottomCta === 'object'
        ? (raw.bottomCta as Record<string, unknown>).enabled === true
        : false
    }
  };
};

export const createDefaultPlanComparisonConfig = (): PlanComparisonConfigV1 => {
  const planA = normalizeComparisonPlan({ id: createId('plan'), name: 'Plan A', description: 'Para comenzar', price: '$0', featured: false }, 0);
  const planB = normalizeComparisonPlan({ id: createId('plan'), name: 'Plan B', description: 'Para crecer', price: '$29', featured: true, badge: 'Recomendado' }, 1);
  const plans = [planA, planB];
  const sections = [
    {
      id: createId('section'), title: 'Funciones principales', features: [
        { id: createId('feature'), name: 'Característica básica', values: { [planA.id]: { type: 'included' }, [planB.id]: { type: 'included' } } },
        { id: createId('feature'), name: 'Capacidad', values: { [planA.id]: { type: 'text', text: 'Hasta 10' }, [planB.id]: { type: 'text', text: 'Ilimitada' } } },
        { id: createId('feature'), name: 'Integración', values: { [planA.id]: { type: 'not_applicable' }, [planB.id]: { type: 'included' } } }
      ]
    },
    {
      id: createId('section'), title: 'Soporte', features: [
        { id: createId('feature'), name: 'Soporte por correo', values: { [planA.id]: { type: 'included' }, [planB.id]: { type: 'included' } } },
        { id: createId('feature'), name: 'Atención prioritaria', values: { [planA.id]: { type: 'excluded' }, [planB.id]: { type: 'included' } } },
        { id: createId('feature'), name: 'Horario extendido', values: { [planA.id]: { type: 'not_applicable' }, [planB.id]: { type: 'text', text: '24/7' } } }
      ]
    }
  ].map((section) => ({ ...section, visible: true, collapsible: true, defaultExpanded: true }));
  return normalizePlanComparisonConfig({ version: 1, source: { mode: 'standalone' }, header: { eyebrow: 'Comparación', title: 'Elige el plan adecuado', description: 'Compara lo que incluye cada opción.' }, plans, sections, bottomCta: { enabled: true } });
};

export const readPlanComparisonConfig = (value: unknown): PlanComparisonConfigV1 => {
  if (typeof value === 'string') {
    try { return normalizePlanComparisonConfig(JSON.parse(value)); } catch { return createDefaultPlanComparisonConfig(); }
  }
  return normalizePlanComparisonConfig(value);
};

export const reorderItem = <T,>(items: T[], index: number, direction: 'up' | 'down'): T[] => {
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export const addComparisonPlan = (config: PlanComparisonConfigV1): PlanComparisonConfigV1 => {
  if (config.plans.length >= 4) return config;
  const plan = normalizeComparisonPlan({ id: createPlanComparisonId('plan'), name: `Plan ${String.fromCharCode(65 + config.plans.length)}`, visible: true, featured: false }, config.plans.length);
  const sections = config.sections.map((section) => ({
    ...section,
    features: section.features.map((feature) => ({ ...feature, values: { ...feature.values, [plan.id]: { type: 'not_applicable' as const } } }))
  }));
  return normalizePlanComparisonConfig({ ...config, plans: [...config.plans, plan], sections });
};

export const removeComparisonPlan = (config: PlanComparisonConfigV1, planId: string): PlanComparisonConfigV1 => {
  if (config.plans.length <= 2) return config;
  const plans = config.plans.filter((plan) => plan.id !== planId);
  const sections = config.sections.map((section) => ({
    ...section,
    features: section.features.map((feature) => {
      const values = { ...feature.values };
      delete values[planId];
      return { ...feature, values };
    })
  }));
  return normalizePlanComparisonConfig({ ...config, plans, sections });
};

export const duplicateComparisonPlan = (config: PlanComparisonConfigV1, planId: string): PlanComparisonConfigV1 => {
  if (config.plans.length >= 4) return config;
  const index = config.plans.findIndex((plan) => plan.id === planId);
  if (index < 0) return config;
  const source = config.plans[index];
  const duplicate = { ...source, id: createPlanComparisonId('plan'), featured: false, cta: source.cta ? { ...source.cta } : undefined };
  const sections = config.sections.map((section) => ({
    ...section,
    features: section.features.map((feature) => ({ ...feature, values: { ...feature.values, [duplicate.id]: feature.values[planId] ? { ...feature.values[planId] } : { type: 'not_applicable' as const } } }))
  }));
  const plans = [...config.plans.slice(0, index + 1), duplicate, ...config.plans.slice(index + 1)];
  return normalizePlanComparisonConfig({ ...config, plans, sections });
};

export const setComparisonPlanFeatured = (config: PlanComparisonConfigV1, planId: string, featured: boolean): PlanComparisonConfigV1 => normalizePlanComparisonConfig({
  ...config,
  plans: config.plans.map((plan) => ({ ...plan, featured: featured ? plan.id === planId : plan.id === planId ? false : plan.featured }))
});

export const addComparisonSection = (config: PlanComparisonConfigV1): PlanComparisonConfigV1 => normalizePlanComparisonConfig({
  ...config,
  sections: [...config.sections, { id: createPlanComparisonId('section'), title: `Sección ${config.sections.length + 1}`, visible: true, collapsible: true, defaultExpanded: true, features: [] }]
});

export const removeComparisonSection = (config: PlanComparisonConfigV1, sectionId: string): PlanComparisonConfigV1 => normalizePlanComparisonConfig({
  ...config,
  sections: config.sections.filter((section) => section.id !== sectionId)
});

export const duplicateComparisonSection = (config: PlanComparisonConfigV1, sectionId: string): PlanComparisonConfigV1 => {
  const index = config.sections.findIndex((section) => section.id === sectionId);
  if (index < 0) return config;
  const source = config.sections[index];
  const duplicateId = createPlanComparisonId('section');
  const duplicate = {
    ...source,
    id: duplicateId,
    title: `${source.title} (copia)`,
    features: source.features.map((feature, featureIndex) => ({ ...feature, id: createPlanComparisonId('feature'), values: Object.fromEntries(Object.entries(feature.values).map(([planId, cell]) => [planId, { ...cell }])) }))
  };
  return normalizePlanComparisonConfig({ ...config, sections: [...config.sections.slice(0, index + 1), duplicate, ...config.sections.slice(index + 1)] });
};

export const addComparisonFeature = (config: PlanComparisonConfigV1, sectionId: string): PlanComparisonConfigV1 => normalizePlanComparisonConfig({
  ...config,
  sections: config.sections.map((section) => section.id !== sectionId ? section : {
    ...section,
    features: [...section.features, { id: createPlanComparisonId('feature'), name: `Característica ${section.features.length + 1}`, visible: true, values: Object.fromEntries(config.plans.map((plan) => [plan.id, { type: 'not_applicable' as const }])) }]
  })
});

export const removeComparisonFeature = (config: PlanComparisonConfigV1, sectionId: string, featureId: string): PlanComparisonConfigV1 => normalizePlanComparisonConfig({
  ...config,
  sections: config.sections.map((section) => section.id !== sectionId ? section : { ...section, features: section.features.filter((feature) => feature.id !== featureId) })
});

export const duplicateComparisonFeature = (config: PlanComparisonConfigV1, sectionId: string, featureId: string): PlanComparisonConfigV1 => normalizePlanComparisonConfig({
  ...config,
  sections: config.sections.map((section) => {
    if (section.id !== sectionId) return section;
    const index = section.features.findIndex((feature) => feature.id === featureId);
    if (index < 0) return section;
    const source = section.features[index];
    const duplicate = { ...source, id: createPlanComparisonId('feature'), name: `${source.name} (copia)`, values: Object.fromEntries(Object.entries(source.values).map(([planId, cell]) => [planId, { ...cell }])) };
    return { ...section, features: [...section.features.slice(0, index + 1), duplicate, ...section.features.slice(index + 1)] };
  })
});

export const sortFeaturesAlphabetically = (config: PlanComparisonConfigV1, sectionId: string): PlanComparisonConfigV1 => normalizePlanComparisonConfig({
  ...config,
  sections: config.sections.map((section) => section.id !== sectionId ? section : { ...section, features: [...section.features].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })) })
});

export const updateComparisonCell = (config: PlanComparisonConfigV1, sectionId: string, featureId: string, planId: string, value: ComparisonCellValue): PlanComparisonConfigV1 => normalizePlanComparisonConfig({
  ...config,
  sections: config.sections.map((section) => section.id !== sectionId ? section : {
    ...section,
    features: section.features.map((feature) => feature.id !== featureId ? feature : { ...feature, values: { ...feature.values, [planId]: value.type === 'text' ? { type: 'text' as const, text: value.text || '' } : { type: value.type } } })
  })
});
