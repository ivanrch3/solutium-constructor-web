import { Product } from '../types/schema';

const MANUAL_SELECTION_MODES = new Set([
  'manual',
  'selected',
  'selection',
  'featured',
  'custom'
]);

export const normalizeProductsSelectionMode = (selectionMode: unknown): string =>
  String(selectionMode || 'auto').trim().toLowerCase();

export const isManualProductsSelectionMode = (selectionMode: unknown): boolean =>
  MANUAL_SELECTION_MODES.has(normalizeProductsSelectionMode(selectionMode));

export const normalizeSelectedProductIds = (selectedIds: unknown): string[] =>
  Array.isArray(selectedIds)
    ? selectedIds.map((id) => String(id)).filter(Boolean)
    : [];

export const resolveProductsForSelection = <T extends Pick<Product, 'id'>>({
  selectionMode,
  selectedIds,
  availableProducts
}: {
  selectionMode: unknown;
  selectedIds: unknown;
  availableProducts: T[];
}): T[] => {
  const sourceProducts = Array.isArray(availableProducts)
    ? availableProducts.filter(Boolean)
    : [];

  if (!isManualProductsSelectionMode(selectionMode)) {
    return [...sourceProducts];
  }

  const normalizedSelectedIds = normalizeSelectedProductIds(selectedIds);
  if (normalizedSelectedIds.length === 0) {
    return [...sourceProducts];
  }

  const selectedIdSet = new Set(normalizedSelectedIds);
  return sourceProducts.filter((product) => selectedIdSet.has(String(product.id)));
};
