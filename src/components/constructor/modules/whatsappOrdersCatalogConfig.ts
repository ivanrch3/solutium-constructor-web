export const WHATSAPP_ORDERS_CATALOG_CONFIG_VERSION = 2;
export const WHATSAPP_ORDERS_CATALOG_CONFIG_SETTING = 'el_whatsapp_orders_catalog_config';
export const WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_DEFAULT = 100;
export const WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_MIN = 50;
export const WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_MAX = 100;
export const WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_STEP = 5;

export type WhatsAppOrdersCatalogScope =
  | { mode: 'all' }
  | {
      mode: 'selected';
      categoryIds: string[];
      categoryNameFallbacks?: Record<string, string>;
    };

export type WhatsAppOrdersCatalogOrder =
  | { mode: 'alphabetical' }
  | {
      mode: 'custom';
      categoryOrder: string[];
      productOrderByCategory: Record<string, string[]>;
    };

export type WhatsAppOrdersCatalogView = 'grid' | 'list';

export type WhatsAppOrdersCatalogDisplay = {
  defaultView: WhatsAppOrdersCatalogView;
  productImageScale: number;
};

export type WhatsAppOrdersVisitorView = {
  allowViewSwitch: boolean;
};

export type WhatsAppOrdersCatalogScopeCategory = {
  id: string;
  name: string;
};

export type WhatsAppOrdersCatalogConfigV2 = {
  version: typeof WHATSAPP_ORDERS_CATALOG_CONFIG_VERSION;
  scope: WhatsAppOrdersCatalogScope;
  order: WhatsAppOrdersCatalogOrder;
  display: WhatsAppOrdersCatalogDisplay;
  visitorView: WhatsAppOrdersVisitorView;
};

type LegacyWhatsAppOrdersCatalogConfig = {
  layout?: unknown;
};

const DANGEROUS_OBJECT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const normalizeNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized || null;
};

export const normalizeWhatsAppOrdersProductImageScale = (value: unknown): number => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_DEFAULT;
  }

  if (typeof value !== 'number' && typeof value !== 'string') {
    return WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_DEFAULT;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_DEFAULT;

  return Math.min(
    WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_MAX,
    Math.max(
      WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_MIN,
      Math.round(parsed / WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_STEP) * WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_STEP
    )
  );
};

const normalizeUniqueIdList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  const ids = new Set<string>();
  value.forEach((candidate) => {
    const id = normalizeNonEmptyString(candidate);
    if (id) ids.add(id);
  });
  return Array.from(ids);
};

const createEmptyProductOrder = (): Record<string, string[]> => Object.create(null) as Record<string, string[]>;

const getOwnValue = (value: Record<string, unknown>, key: string): unknown =>
  Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined;

export const getWhatsAppOrdersCatalogConfigSettingKey = (moduleId: string): string =>
  `${moduleId}_${WHATSAPP_ORDERS_CATALOG_CONFIG_SETTING}`;

export const hasWhatsAppOrdersCatalogConfig = (
  settingsValues: unknown,
  moduleId: string
): boolean =>
  isRecord(settingsValues)
  && Object.prototype.hasOwnProperty.call(
    settingsValues,
    getWhatsAppOrdersCatalogConfigSettingKey(moduleId)
  );

export const isPersistedWhatsAppOrdersCatalogConfig = (value: unknown): boolean =>
  isRecord(value) && value.version === WHATSAPP_ORDERS_CATALOG_CONFIG_VERSION;

export const isWhatsAppOrdersCatalogView = (value: unknown): value is WhatsAppOrdersCatalogView =>
  value === 'grid' || value === 'list';

export const resolveLegacyWhatsAppOrdersView = (
  legacy?: LegacyWhatsAppOrdersCatalogConfig
): WhatsAppOrdersCatalogView | null =>
  isWhatsAppOrdersCatalogView(legacy?.layout) ? legacy.layout : null;

const normalizeScope = (value: unknown): WhatsAppOrdersCatalogScope => {
  if (!isRecord(value)) return { mode: 'all' };

  // Legacy snapshots used one category. Normalize only in memory so opening an
  // existing site never writes or broadens its catalog selection.
  if (value.mode === 'category') {
    const categoryId = normalizeNonEmptyString(value.categoryId);
    if (!categoryId) return { mode: 'all' };
    const categoryNameFallback = normalizeNonEmptyString(value.categoryNameFallback);
    return {
      mode: 'selected',
      categoryIds: [categoryId],
      ...(categoryNameFallback ? { categoryNameFallbacks: { [categoryId]: categoryNameFallback } } : {})
    };
  }

  if (value.mode !== 'selected') return { mode: 'all' };
  const categoryIds = normalizeUniqueIdList(value.categoryIds);
  const rawFallbacks = isRecord(value.categoryNameFallbacks) ? value.categoryNameFallbacks : null;
  const categoryNameFallbacks = Object.fromEntries(
    categoryIds.flatMap((categoryId) => {
      const fallback = rawFallbacks ? normalizeNonEmptyString(rawFallbacks[categoryId]) : null;
      return fallback ? [[categoryId, fallback]] : [];
    })
  );

  return {
    mode: 'selected',
    categoryIds,
    ...(Object.keys(categoryNameFallbacks).length > 0 ? { categoryNameFallbacks } : {})
  };
};

const normalizeProductOrderByCategory = (value: unknown): Record<string, string[]> => {
  const result = createEmptyProductOrder();
  if (!isRecord(value)) return result;

  Object.keys(value).forEach((rawCategoryId) => {
    if (DANGEROUS_OBJECT_KEYS.has(rawCategoryId)) return;
    const categoryId = normalizeNonEmptyString(rawCategoryId);
    if (!categoryId || !Array.isArray(value[rawCategoryId])) return;
    result[categoryId] = normalizeUniqueIdList(value[rawCategoryId]);
  });

  return result;
};

const normalizeOrder = (value: unknown): WhatsAppOrdersCatalogOrder => {
  if (!isRecord(value) || value.mode !== 'custom') return { mode: 'alphabetical' };

  return {
    mode: 'custom',
    categoryOrder: normalizeUniqueIdList(value.categoryOrder),
    productOrderByCategory: normalizeProductOrderByCategory(value.productOrderByCategory)
  };
};

export const createDefaultWhatsAppOrdersCatalogConfig = (): WhatsAppOrdersCatalogConfigV2 => ({
  version: WHATSAPP_ORDERS_CATALOG_CONFIG_VERSION,
  scope: { mode: 'all' },
  order: { mode: 'alphabetical' },
  display: { defaultView: 'grid', productImageScale: WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_DEFAULT },
  visitorView: { allowViewSwitch: false }
});

export const DEFAULT_WHATSAPP_ORDERS_CATALOG_CONFIG: Readonly<WhatsAppOrdersCatalogConfigV2> = Object.freeze({
  version: WHATSAPP_ORDERS_CATALOG_CONFIG_VERSION,
  scope: Object.freeze({ mode: 'all' }),
  order: Object.freeze({ mode: 'alphabetical' }),
  display: Object.freeze({ defaultView: 'grid', productImageScale: WHATSAPP_ORDERS_PRODUCT_IMAGE_SCALE_DEFAULT }),
  visitorView: Object.freeze({ allowViewSwitch: false })
}) as Readonly<WhatsAppOrdersCatalogConfigV2>;

export const normalizeWhatsAppOrdersCatalogConfig = (
  input: unknown,
  legacy?: LegacyWhatsAppOrdersCatalogConfig
): WhatsAppOrdersCatalogConfigV2 => {
  const source = isRecord(input) ? input : null;
  const display = isRecord(source?.display) ? source.display : null;
  const visitorView = isRecord(source?.visitorView) ? source.visitorView : null;
  const explicitView = display?.defaultView;

  return {
    version: WHATSAPP_ORDERS_CATALOG_CONFIG_VERSION,
    scope: normalizeScope(source?.scope),
    order: normalizeOrder(source?.order),
    display: {
      defaultView: isWhatsAppOrdersCatalogView(explicitView)
        ? explicitView
        : resolveLegacyWhatsAppOrdersView(legacy) || 'grid',
      productImageScale: normalizeWhatsAppOrdersProductImageScale(display?.productImageScale)
    },
    visitorView: {
      allowViewSwitch: typeof visitorView?.allowViewSwitch === 'boolean'
        ? visitorView.allowViewSwitch
        : false
    }
  };
};

/**
 * Reads the instance-scoped configuration without migrating legacy instances.
 * The legacy layout is a visual fallback only until V2 is explicitly written.
 */
export const readWhatsAppOrdersCatalogConfig = (
  settingsValues: unknown,
  moduleId: string,
  legacy?: LegacyWhatsAppOrdersCatalogConfig
): WhatsAppOrdersCatalogConfigV2 => {
  const settings = isRecord(settingsValues) ? settingsValues : null;
  const storedConfig = settings
    ? getOwnValue(settings, getWhatsAppOrdersCatalogConfigSettingKey(moduleId))
    : undefined;
  const storedLegacyLayout = settings
    ? getOwnValue(settings, `${moduleId}_global_layout`)
    : undefined;

  return normalizeWhatsAppOrdersCatalogConfig(storedConfig, {
    layout: legacy?.layout ?? storedLegacyLayout
  });
};

/**
 * V2 takes precedence only after it has been explicitly persisted for this
 * module. Until then, legacy instances continue to render their layout value.
 */
export const resolveEffectiveWhatsAppOrdersCatalogView = (
  settingsValues: unknown,
  moduleId: string,
  legacy?: LegacyWhatsAppOrdersCatalogConfig
): WhatsAppOrdersCatalogView => {
  const config = readWhatsAppOrdersCatalogConfig(settingsValues, moduleId, legacy);
  if (hasWhatsAppOrdersCatalogConfig(settingsValues, moduleId)) {
    return config.display.defaultView;
  }

  return resolveLegacyWhatsAppOrdersView(legacy) || config.display.defaultView;
};

export const resolveWhatsAppOrdersPreviewCatalogView = (
  defaultView: WhatsAppOrdersCatalogView,
  allowViewSwitch: boolean,
  temporaryView: unknown
): WhatsAppOrdersCatalogView =>
  allowViewSwitch && isWhatsAppOrdersCatalogView(temporaryView)
    ? temporaryView
    : defaultView;

/**
 * Returns a new settings map with only this module instance's V2 key updated.
 * Existing and forward-compatible settings remain untouched.
 */
export const writeWhatsAppOrdersCatalogConfig = (
  settingsValues: Record<string, unknown>,
  moduleId: string,
  config: unknown
): Record<string, unknown> => ({
  ...settingsValues,
  [getWhatsAppOrdersCatalogConfigSettingKey(moduleId)]: normalizeWhatsAppOrdersCatalogConfig(config)
});

/**
 * Applies an explicit user scope choice while retaining all other V2 sections.
 * A missing category deliberately resolves to `all` instead of persisting an
 * invalid category scope.
 */
export const setWhatsAppOrdersCatalogScope = (
  config: unknown,
  categories: readonly WhatsAppOrdersCatalogScopeCategory[] | null
): WhatsAppOrdersCatalogConfigV2 => {
  const normalizedConfig = normalizeWhatsAppOrdersCatalogConfig(config);
  if (!categories) {
    return { ...normalizedConfig, scope: { mode: 'all' } };
  }

  const categoryIds: string[] = [];
  const categoryNameFallbacks: Record<string, string> = {};
  const seen = new Set<string>();

  categories.forEach((category) => {
    const categoryId = normalizeNonEmptyString(category.id);
    if (!categoryId || seen.has(categoryId)) return;
    seen.add(categoryId);
    categoryIds.push(categoryId);
    const categoryNameFallback = normalizeNonEmptyString(category.name);
    if (categoryNameFallback) categoryNameFallbacks[categoryId] = categoryNameFallback;
  });

  return {
    ...normalizedConfig,
    scope: {
      mode: 'selected',
      categoryIds,
      ...(Object.keys(categoryNameFallbacks).length > 0 ? { categoryNameFallbacks } : {})
    }
  };
};

export const setWhatsAppOrdersCatalogDefaultView = (
  config: unknown,
  defaultView: unknown
): WhatsAppOrdersCatalogConfigV2 => {
  const normalizedConfig = normalizeWhatsAppOrdersCatalogConfig(config);
  if (!isWhatsAppOrdersCatalogView(defaultView)) return normalizedConfig;

  return {
    ...normalizedConfig,
    display: { ...normalizedConfig.display, defaultView }
  };
};

export const setWhatsAppOrdersCatalogAllowViewSwitch = (
  config: unknown,
  allowViewSwitch: unknown
): WhatsAppOrdersCatalogConfigV2 => {
  const normalizedConfig = normalizeWhatsAppOrdersCatalogConfig(config);
  if (typeof allowViewSwitch !== 'boolean') return normalizedConfig;

  return {
    ...normalizedConfig,
    visitorView: { allowViewSwitch }
  };
};

export const setWhatsAppOrdersCatalogProductImageScale = (
  config: unknown,
  productImageScale: unknown
): WhatsAppOrdersCatalogConfigV2 => {
  const normalizedConfig = normalizeWhatsAppOrdersCatalogConfig(config);

  return {
    ...normalizedConfig,
    display: {
      ...normalizedConfig.display,
      productImageScale: normalizeWhatsAppOrdersProductImageScale(productImageScale)
    }
  };
};
