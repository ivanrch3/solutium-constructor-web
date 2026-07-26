import type {
  WhatsAppOrdersCatalogConfigV2,
  WhatsAppOrdersCatalogOrder,
  WhatsAppOrdersCatalogScope
} from './whatsappOrdersCatalogConfig';

export const WHATSAPP_ORDERS_UNCATEGORIZED_CATEGORY_ID =
  '__whatsapp_orders_uncategorized__';
export const WHATSAPP_ORDERS_UNCATEGORIZED_CATEGORY_NAME = 'General';

export type WhatsAppOrdersCatalogCategoryRef = {
  id: string;
  name: string;
  slug?: string;
};

export type WhatsAppOrdersCatalogProductRef = {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
};

export type WhatsAppOrdersCatalogGroup<
  TCategory extends WhatsAppOrdersCatalogCategoryRef = WhatsAppOrdersCatalogCategoryRef,
  TProduct extends WhatsAppOrdersCatalogProductRef = WhatsAppOrdersCatalogProductRef
> = {
  category: TCategory;
  products: TProduct[];
};

export type WhatsAppOrdersCatalogCustomOrder = Extract<
  WhatsAppOrdersCatalogOrder,
  { mode: 'custom' }
>;

export type WhatsAppOrdersCatalogResolution = {
  groups: WhatsAppOrdersCatalogGroup[];
  reconciledCustomOrder?: WhatsAppOrdersCatalogCustomOrder;
};

export type WhatsAppOrdersCatalogItemScope = 'all' | 'selected';

export type WhatsAppOrdersCatalogItemSelection = {
  selectedItemIds: string[];
  effectiveItemIds: string[];
};

const DANGEROUS_OBJECT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const getOwnValue = (value: Record<string, unknown>, key: string): unknown =>
  Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined;

const normalizeNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

const createSafeRecord = (): Record<string, string[]> => Object.create(null) as Record<string, string[]>;

const uniqueIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const ids: string[] = [];
  value.forEach((candidate) => {
    const id = normalizeNonEmptyString(candidate);
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  });
  return ids;
};

const storedCategoryOrder = (
  storedOrder: Pick<WhatsAppOrdersCatalogCustomOrder, 'categoryOrder' | 'productOrderByCategory'> | null | undefined
): string[] =>
  isRecord(storedOrder) ? uniqueIds(getOwnValue(storedOrder, 'categoryOrder')) : [];

const storedProductOrder = (
  storedOrder: Pick<WhatsAppOrdersCatalogCustomOrder, 'categoryOrder' | 'productOrderByCategory'> | null | undefined,
  categoryId: string
): string[] => {
  if (!isRecord(storedOrder)) return [];
  const productOrderByCategory = getOwnValue(storedOrder, 'productOrderByCategory');
  if (!isRecord(productOrderByCategory) || DANGEROUS_OBJECT_KEYS.has(categoryId)) return [];
  return uniqueIds(getOwnValue(productOrderByCategory, categoryId));
};

const createUncategorizedCategory = (): WhatsAppOrdersCatalogCategoryRef => ({
  id: WHATSAPP_ORDERS_UNCATEGORIZED_CATEGORY_ID,
  name: WHATSAPP_ORDERS_UNCATEGORIZED_CATEGORY_NAME
});

export const getWhatsAppOrdersCatalogProductCategoryId = (value: unknown): string | undefined => {
  if (!isRecord(value)) return undefined;
  return normalizeNonEmptyString(getOwnValue(value, 'categoryId'))
    || normalizeNonEmptyString(getOwnValue(value, 'category_id'));
};

const categoryIdForProduct = (
  product: WhatsAppOrdersCatalogProductRef,
  categoryIds: ReadonlySet<string>
): string =>
  product.categoryId && categoryIds.has(product.categoryId)
    ? product.categoryId
    : WHATSAPP_ORDERS_UNCATEGORIZED_CATEGORY_ID;

/**
 * The reserved synthetic ID is never accepted as a real category. That keeps a
 * real category named "General" distinct from the fallback group.
 */
export const normalizeCatalogCategories = (input: unknown): WhatsAppOrdersCatalogCategoryRef[] => {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  const categories: WhatsAppOrdersCatalogCategoryRef[] = [];

  input.forEach((candidate) => {
    if (!isRecord(candidate)) return;

    const id = normalizeNonEmptyString(getOwnValue(candidate, 'id'));
    const name = normalizeNonEmptyString(getOwnValue(candidate, 'name'));
    if (!id || !name || id === WHATSAPP_ORDERS_UNCATEGORIZED_CATEGORY_ID || seen.has(id)) return;

    const slug = normalizeNonEmptyString(getOwnValue(candidate, 'slug'));
    categories.push({ id, name, ...(slug ? { slug } : {}) });
    seen.add(id);
  });

  return categories;
};

export const normalizeCatalogProducts = (input: unknown): WhatsAppOrdersCatalogProductRef[] => {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  const products: WhatsAppOrdersCatalogProductRef[] = [];

  input.forEach((candidate) => {
    if (!isRecord(candidate)) return;

    const id = normalizeNonEmptyString(getOwnValue(candidate, 'id'));
    const name = normalizeNonEmptyString(getOwnValue(candidate, 'name'))
      || normalizeNonEmptyString(getOwnValue(candidate, 'title'));
    if (!id || !name || seen.has(id)) return;

    const categoryId = getWhatsAppOrdersCatalogProductCategoryId(candidate);
    const categoryName = normalizeNonEmptyString(getOwnValue(candidate, 'categoryName'))
      || normalizeNonEmptyString(getOwnValue(candidate, 'category'))
      || normalizeNonEmptyString(getOwnValue(candidate, 'categoria'));

    products.push({
      id,
      name,
      ...(categoryId ? { categoryId } : {}),
      ...(categoryName ? { categoryName } : {})
    });
    seen.add(id);
  });

  return products;
};

export const compareWhatsAppOrdersCatalogNames = (
  left: Pick<WhatsAppOrdersCatalogProductRef, 'id' | 'name'>,
  right: Pick<WhatsAppOrdersCatalogProductRef, 'id' | 'name'>
): number => {
  const semanticComparison = left.name.localeCompare(right.name, 'es', {
    sensitivity: 'base',
    numeric: true,
    ignorePunctuation: true
  });
  if (semanticComparison !== 0) return semanticComparison;

  const exactComparison = left.name.localeCompare(right.name, 'es', {
    sensitivity: 'variant',
    numeric: true,
    ignorePunctuation: false
  });
  if (exactComparison !== 0) return exactComparison;

  return left.id.localeCompare(right.id, 'es', { numeric: true });
};

export const groupProductsByCategory = (
  categories: readonly WhatsAppOrdersCatalogCategoryRef[],
  products: readonly WhatsAppOrdersCatalogProductRef[]
): WhatsAppOrdersCatalogGroup[] => {
  const validCategories = normalizeCatalogCategories(categories);
  const validProducts = normalizeCatalogProducts(products);
  const categoryIds = new Set(validCategories.map((category) => category.id));
  const groups = validCategories.map((category) => ({ category, products: [] as WhatsAppOrdersCatalogProductRef[] }));
  const groupByCategoryId = new Map(groups.map((group) => [group.category.id, group]));
  let uncategorizedGroup: WhatsAppOrdersCatalogGroup | undefined;

  validProducts.forEach((product) => {
    const categoryId = categoryIdForProduct(product, categoryIds);
    if (categoryId === WHATSAPP_ORDERS_UNCATEGORIZED_CATEGORY_ID && !uncategorizedGroup) {
      uncategorizedGroup = { category: createUncategorizedCategory(), products: [] };
      groupByCategoryId.set(categoryId, uncategorizedGroup);
      groups.push(uncategorizedGroup);
    }
    groupByCategoryId.get(categoryId)?.products.push(product);
  });

  return groups.map((group) => ({ category: { ...group.category }, products: [...group.products] }));
};

const normalizeCatalogItemScope = (selectionMode: unknown): WhatsAppOrdersCatalogItemScope => {
  const normalizedMode = typeof selectionMode === 'string' ? selectionMode.trim().toLowerCase() : '';
  return normalizedMode === 'manual' || normalizedMode === 'selected'
    ? 'selected'
    : 'all';
};

const uniqueProductIds = (value: unknown): string[] => uniqueIds(value);

/**
 * Resolves the product IDs available after the category scope has been
 * applied. The panel, editor preview and published runtime share this source
 * so a manual selection cannot drift from the rendered catalog.
 */
export const getEffectiveVisibleItemIds = ({
  categories,
  products,
  config
}: {
  categories: unknown;
  products: unknown;
  config: WhatsAppOrdersCatalogConfigV2;
}): string[] => applyCatalogScope(
  groupProductsByCategory(normalizeCatalogCategories(categories), normalizeCatalogProducts(products)),
  config.scope
).flatMap((group) => group.products.map((product) => product.id));

export const initializeSelectedItemsFromVisibleCatalog = ({
  categories,
  products,
  config
}: {
  categories: unknown;
  products: unknown;
  config: WhatsAppOrdersCatalogConfigV2;
}): string[] => getEffectiveVisibleItemIds({ categories, products, config });

/**
 * Keeps a manual selection valid when category visibility changes. Newly
 * visible products begin selected, matching the "all except unchecked" model;
 * products outside the new scope are discarded without writing during render.
 */
export const reconcileSelectedItemsWithVisibleCatalog = ({
  selectedItemIds,
  previousVisibleItemIds,
  nextVisibleItemIds
}: {
  selectedItemIds: unknown;
  previousVisibleItemIds: unknown;
  nextVisibleItemIds: unknown;
}): string[] => {
  const selectedIds = uniqueProductIds(selectedItemIds);
  const previousVisibleIds = new Set(uniqueProductIds(previousVisibleItemIds));
  const nextVisibleIds = uniqueProductIds(nextVisibleItemIds);
  const nextVisibleIdSet = new Set(nextVisibleIds);
  const reconciledIds = selectedIds.filter((id) => nextVisibleIdSet.has(id));
  const includedIds = new Set(reconciledIds);

  nextVisibleIds.forEach((id) => {
    if (!previousVisibleIds.has(id) && !includedIds.has(id)) {
      reconciledIds.push(id);
      includedIds.add(id);
    }
  });

  return reconciledIds;
};

/**
 * An explicit empty array in a V2 selected mode means no products. Callers
 * enable the fallback only for legacy instances, whose former empty value
 * meant "all", keeping older sites visually stable.
 */
export const getEffectiveSelectedItemIds = ({
  selectionMode,
  selectedItemIds,
  availableProducts,
  allowLegacyEmptyFallback = false
}: {
  selectionMode: unknown;
  selectedItemIds: unknown;
  availableProducts: readonly WhatsAppOrdersCatalogProductRef[];
  allowLegacyEmptyFallback?: boolean;
}): WhatsAppOrdersCatalogItemSelection => {
  const availableIds = uniqueProductIds(availableProducts.map((product) => product.id));
  if (normalizeCatalogItemScope(selectionMode) === 'all') {
    return { selectedItemIds: uniqueProductIds(selectedItemIds), effectiveItemIds: availableIds };
  }

  const normalizedSelectedIds = uniqueProductIds(selectedItemIds);
  if (normalizedSelectedIds.length === 0 && allowLegacyEmptyFallback) {
    return { selectedItemIds: [], effectiveItemIds: availableIds };
  }

  const availableIdSet = new Set(availableIds);
  const effectiveItemIds = normalizedSelectedIds.filter((id) => availableIdSet.has(id));
  return { selectedItemIds: normalizedSelectedIds, effectiveItemIds };
};

export const resolveWhatsAppOrdersProductsForSelection = <T extends WhatsAppOrdersCatalogProductRef>({
  selectionMode,
  selectedItemIds,
  availableProducts,
  allowLegacyEmptyFallback = false
}: {
  selectionMode: unknown;
  selectedItemIds: unknown;
  availableProducts: readonly T[];
  allowLegacyEmptyFallback?: boolean;
}): T[] => {
  const resolution = getEffectiveSelectedItemIds({
    selectionMode,
    selectedItemIds,
    availableProducts,
    allowLegacyEmptyFallback
  });
  const effectiveIdSet = new Set(resolution.effectiveItemIds);
  return availableProducts.filter((product) => effectiveIdSet.has(product.id));
};

export const sortCatalogGroupsAlphabetically = (
  groups: readonly WhatsAppOrdersCatalogGroup[]
): WhatsAppOrdersCatalogGroup[] =>
  groups
    .map((group) => ({ category: { ...group.category }, products: [...group.products].sort(compareWhatsAppOrdersCatalogNames) }))
    .sort((left, right) => compareWhatsAppOrdersCatalogNames(left.category, right.category));

const categoryIdsFromGroups = (groups: readonly WhatsAppOrdersCatalogGroup[]): Set<string> =>
  new Set(groups.map((group) => group.category.id));

const idsForGroup = (group: WhatsAppOrdersCatalogGroup): Set<string> =>
  new Set(group.products.map((product) => product.id));

export const reconcileWhatsAppOrdersCustomOrder = (
  categories: readonly WhatsAppOrdersCatalogCategoryRef[],
  products: readonly WhatsAppOrdersCatalogProductRef[],
  storedOrder: Pick<WhatsAppOrdersCatalogCustomOrder, 'categoryOrder' | 'productOrderByCategory'> | null | undefined
): WhatsAppOrdersCatalogCustomOrder => {
  const groups = groupProductsByCategory(categories, products);
  const validCategoryIds = categoryIdsFromGroups(groups);
  const savedCategoryOrder = storedCategoryOrder(storedOrder);
  const categoryOrder = savedCategoryOrder.filter((id) => validCategoryIds.has(id));
  const includedCategories = new Set(categoryOrder);

  groups.forEach((group) => {
    if (!includedCategories.has(group.category.id)) {
      categoryOrder.push(group.category.id);
      includedCategories.add(group.category.id);
    }
  });

  const productOrderByCategory = createSafeRecord();
  categoryOrder.forEach((categoryId) => {
    const group = groups.find((candidate) => candidate.category.id === categoryId);
    if (!group) return;

    const currentProductIds = idsForGroup(group);
    const storedProductIds = storedProductOrder(storedOrder, categoryId);
    const orderedProductIds = storedProductIds.filter((id) => currentProductIds.has(id));
    const includedProducts = new Set(orderedProductIds);
    group.products.forEach((product) => {
      if (!includedProducts.has(product.id)) {
        orderedProductIds.push(product.id);
        includedProducts.add(product.id);
      }
    });
    productOrderByCategory[categoryId] = orderedProductIds;
  });

  return { mode: 'custom', categoryOrder, productOrderByCategory };
};

/**
 * Captures the currently visible alphabetical arrangement before switching to
 * custom mode. Scope is intentionally not applied here: custom order remains
 * a complete, instance-level ordering even when the catalog is filtered.
 */
export const createWhatsAppOrdersCatalogCustomOrderFromAlphabetical = (
  categories: readonly WhatsAppOrdersCatalogCategoryRef[],
  products: readonly WhatsAppOrdersCatalogProductRef[]
): WhatsAppOrdersCatalogCustomOrder => {
  const alphabeticalGroups = sortCatalogGroupsAlphabetically(
    groupProductsByCategory(categories, products)
  );
  const productOrderByCategory = createSafeRecord();

  alphabeticalGroups.forEach((group) => {
    productOrderByCategory[group.category.id] = group.products.map((product) => product.id);
  });

  return {
    mode: 'custom',
    categoryOrder: alphabeticalGroups.map((group) => group.category.id),
    productOrderByCategory
  };
};

const cloneProductOrderByCategory = (
  productOrderByCategory: Record<string, string[]>
): Record<string, string[]> => {
  const next = createSafeRecord();

  Object.keys(productOrderByCategory).forEach((categoryId) => {
    if (DANGEROUS_OBJECT_KEYS.has(categoryId)) return;
    const value = productOrderByCategory[categoryId];
    if (Array.isArray(value)) next[categoryId] = [...value];
  });

  return next;
};

const swapAtIndexes = <T>(items: readonly T[], firstIndex: number, secondIndex: number): T[] => {
  const nextItems = [...items];
  [nextItems[firstIndex], nextItems[secondIndex]] = [nextItems[secondIndex], nextItems[firstIndex]];
  return nextItems;
};

/**
 * Returns the original order for a no-op so callers can avoid persisting when
 * a boundary or an unknown category was requested.
 */
export const moveCategoryInCustomOrder = (
  order: WhatsAppOrdersCatalogCustomOrder,
  categoryId: string,
  direction: 'up' | 'down'
): WhatsAppOrdersCatalogCustomOrder => {
  if (DANGEROUS_OBJECT_KEYS.has(categoryId)) return order;

  const currentIndex = order.categoryOrder.indexOf(categoryId);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= order.categoryOrder.length) return order;

  return {
    mode: 'custom',
    categoryOrder: swapAtIndexes(order.categoryOrder, currentIndex, targetIndex),
    productOrderByCategory: cloneProductOrderByCategory(order.productOrderByCategory)
  };
};

/**
 * Products can only move inside their reconciled category. The original order
 * is returned for unknown IDs, invalid keys, and movement boundaries.
 */
export const moveProductInCustomOrder = (
  order: WhatsAppOrdersCatalogCustomOrder,
  categoryId: string,
  productId: string,
  direction: 'up' | 'down'
): WhatsAppOrdersCatalogCustomOrder => {
  if (DANGEROUS_OBJECT_KEYS.has(categoryId)) return order;
  if (!Object.prototype.hasOwnProperty.call(order.productOrderByCategory, categoryId)) return order;

  const categoryProducts = order.productOrderByCategory[categoryId];
  if (!Array.isArray(categoryProducts)) return order;

  const currentIndex = categoryProducts.indexOf(productId);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= categoryProducts.length) return order;

  const productOrderByCategory = cloneProductOrderByCategory(order.productOrderByCategory);
  productOrderByCategory[categoryId] = swapAtIndexes(categoryProducts, currentIndex, targetIndex);

  return {
    mode: 'custom',
    categoryOrder: [...order.categoryOrder],
    productOrderByCategory
  };
};

export const applyCustomOrderToCatalogGroups = (
  groups: readonly WhatsAppOrdersCatalogGroup[],
  reconciledOrder: Pick<WhatsAppOrdersCatalogCustomOrder, 'categoryOrder' | 'productOrderByCategory'>
): WhatsAppOrdersCatalogGroup[] => {
  const groupById = new Map(groups.map((group) => [group.category.id, group]));
  const orderedGroupIds = uniqueIds(reconciledOrder.categoryOrder);
  const includedGroupIds = new Set(orderedGroupIds);
  const finalGroupIds = [
    ...orderedGroupIds.filter((id) => groupById.has(id)),
    ...groups.map((group) => group.category.id).filter((id) => !includedGroupIds.has(id))
  ];

  return finalGroupIds.flatMap((categoryId) => {
    const group = groupById.get(categoryId);
    if (!group) return [];

    const productById = new Map(group.products.map((product) => [product.id, product]));
    const orderedProductIds = uniqueIds(reconciledOrder.productOrderByCategory?.[categoryId]);
    const includedProductIds = new Set(orderedProductIds);
    const finalProductIds = [
      ...orderedProductIds.filter((id) => productById.has(id)),
      ...group.products.map((product) => product.id).filter((id) => !includedProductIds.has(id))
    ];

    return [{
      category: { ...group.category },
      products: finalProductIds.flatMap((id) => {
        const product = productById.get(id);
        return product ? [{ ...product }] : [];
      })
    }];
  });
};

export const applyCatalogScope = (
  groups: readonly WhatsAppOrdersCatalogGroup[],
  scope: WhatsAppOrdersCatalogScope
): WhatsAppOrdersCatalogGroup[] => {
  if (scope.mode === 'all') {
    return groups.map((group) => ({ category: { ...group.category }, products: [...group.products] }));
  }

  const selectedCategoryIds = new Set(scope.categoryIds);
  return groups
    .filter((group) => selectedCategoryIds.has(group.category.id))
    .map((group) => ({ category: { ...group.category }, products: [...group.products] }));
};

export const resolveWhatsAppOrdersCatalog = ({
  categories,
  products,
  config
}: {
  categories: unknown;
  products: unknown;
  config: WhatsAppOrdersCatalogConfigV2;
}): WhatsAppOrdersCatalogResolution => {
  const normalizedCategories = normalizeCatalogCategories(categories);
  const normalizedProducts = normalizeCatalogProducts(products);
  const groupedCatalog = groupProductsByCategory(normalizedCategories, normalizedProducts);

  if (config.order.mode === 'alphabetical') {
    return {
      groups: applyCatalogScope(sortCatalogGroupsAlphabetically(groupedCatalog), config.scope)
    };
  }

  const reconciledCustomOrder = reconcileWhatsAppOrdersCustomOrder(
    normalizedCategories,
    normalizedProducts,
    config.order
  );
  return {
    groups: applyCatalogScope(applyCustomOrderToCatalogGroups(groupedCatalog, reconciledCustomOrder), config.scope),
    reconciledCustomOrder
  };
};
