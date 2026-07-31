import { normalizeCatalogProductImageFields } from '../../../utils/productImage';
import type { WhatsAppOrdersCatalogConfigV2 } from './whatsappOrdersCatalogConfig';
import {
  applyCustomOrderToCatalogGroups,
  compareWhatsAppOrdersCatalogNames,
  groupProductsByCategory,
  getWhatsAppOrdersCatalogProductCategoryId,
  normalizeCatalogCategories,
  normalizeCatalogProducts,
  reconcileWhatsAppOrdersCustomOrder,
  sortCatalogGroupsAlphabetically,
  WHATSAPP_ORDERS_UNCATEGORIZED_CATEGORY_ID
} from './whatsappOrdersCatalogOrganizer';

export type WhatsAppOrdersCategorySnapshot = {
  id: string;
  name: string;
  slug?: string;
};

export type WhatsAppOrdersProductSnapshot = {
  id: string;
  name: string;
  shortDescription?: string;
  short_description?: string;
  detailedDescription?: string;
  detailed_description?: string;
  description?: string;
  price?: number;
  priceReference?: number;
  imageUrl?: string;
  image_url?: string;
  image2Url?: string;
  image2_url?: string;
  primaryImageAssetId?: string;
  secondaryImageAssetId?: string;
  category?: string;
  categoryId?: string;
  status?: string;
  stock?: number;
  appData?: unknown;
  optionGroups?: unknown;
  updatedAt?: string;
};

export type WhatsAppOrdersCatalogPublishedContract = {
  catalogConfig: WhatsAppOrdersCatalogConfigV2;
  categories: WhatsAppOrdersCategorySnapshot[];
  products: WhatsAppOrdersProductSnapshot[];
  items: WhatsAppOrdersProductSnapshot[];
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const stringValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

const numberValue = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return undefined;
  const parsed = Number(value.replace(/[^\d.,-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const createProductSnapshot = (product: unknown, index: number): WhatsAppOrdersProductSnapshot | null => {
  const raw = asRecord(product);
  if (!raw) return null;

  const id = stringValue(raw.id) || `published_whatsapp_order_product_${index + 1}`;
  const name = stringValue(raw.name) || stringValue(raw.title) || `Producto ${index + 1}`;
  const imageFields = normalizeCatalogProductImageFields(raw);
  const appData = raw.appData ?? raw.app_data;
  const appDataRecord = asRecord(appData);
  const optionGroups = raw.optionGroups ?? appDataRecord?.catalogOptionGroups;
  const categoryId = getWhatsAppOrdersCatalogProductCategoryId(raw);

  return {
    id,
    name,
    ...(stringValue(raw.shortDescription) || stringValue(raw.short_description)
      ? {
          shortDescription: stringValue(raw.shortDescription) || stringValue(raw.short_description),
          short_description: stringValue(raw.short_description) || stringValue(raw.shortDescription)
        }
      : {}),
    ...(stringValue(raw.detailedDescription) || stringValue(raw.detailed_description)
      ? {
          detailedDescription: stringValue(raw.detailedDescription) || stringValue(raw.detailed_description),
          detailed_description: stringValue(raw.detailed_description) || stringValue(raw.detailedDescription)
        }
      : {}),
    ...(stringValue(raw.description) ? { description: stringValue(raw.description) } : {}),
    ...(numberValue(raw.price) !== undefined ? { price: numberValue(raw.price) } : {}),
    ...(numberValue(raw.priceReference) !== undefined ? { priceReference: numberValue(raw.priceReference) } : {}),
    ...(imageFields.primaryImageAssetId ? { primaryImageAssetId: imageFields.primaryImageAssetId } : {}),
    ...(imageFields.secondaryImageAssetId ? { secondaryImageAssetId: imageFields.secondaryImageAssetId } : {}),
    ...(imageFields.imageUrl ? { imageUrl: imageFields.imageUrl, image_url: imageFields.imageUrl } : {}),
    ...(imageFields.image2Url ? { image2Url: imageFields.image2Url, image2_url: imageFields.image2Url } : {}),
    ...(stringValue(raw.category) || stringValue(raw.categoria) || stringValue(raw.categoryName)
      ? { category: stringValue(raw.category) || stringValue(raw.categoria) || stringValue(raw.categoryName) }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(stringValue(raw.status) ? { status: stringValue(raw.status) } : {}),
    ...(numberValue(raw.stock) !== undefined ? { stock: numberValue(raw.stock) } : {}),
    ...(appData !== undefined ? { appData } : {}),
    ...(optionGroups !== undefined ? { optionGroups } : {}),
    ...(stringValue(raw.updatedAt) || stringValue(raw.updated_at)
      ? { updatedAt: stringValue(raw.updatedAt) || stringValue(raw.updated_at) }
      : {})
  };
};

/**
 * Builds the frozen V2 payload without applying scope. Scope remains a runtime
 * concern so later configuration changes do not make the snapshot irreversible.
 */
export const buildWhatsAppOrdersCatalogPublishedContract = ({
  config,
  categories,
  products
}: {
  config: WhatsAppOrdersCatalogConfigV2;
  categories: unknown;
  products: unknown;
}): WhatsAppOrdersCatalogPublishedContract => {
  const categoryRefs = normalizeCatalogCategories(categories);
  const productSnapshots = Array.isArray(products)
    ? products.map(createProductSnapshot).filter((product): product is WhatsAppOrdersProductSnapshot => Boolean(product))
    : [];
  const productRefs = normalizeCatalogProducts(productSnapshots);
  const groups = groupProductsByCategory(categoryRefs, productRefs);
  const resolvedConfig = config.order.mode === 'custom'
    ? {
        ...config,
        order: reconcileWhatsAppOrdersCustomOrder(categoryRefs, productRefs, config.order)
      }
    : config;
  const orderedGroups = resolvedConfig.order.mode === 'custom'
    ? applyCustomOrderToCatalogGroups(groups, resolvedConfig.order)
    : sortCatalogGroupsAlphabetically(groups);
  const snapshotsById = new Map(productSnapshots.map((product) => [product.id, product]));
  const orderedProducts = orderedGroups.flatMap((group) =>
    group.products.flatMap((product) => {
      const snapshot = snapshotsById.get(product.id);
      return snapshot ? [{ ...snapshot }] : [];
    })
  );
  const orderedCategories = orderedGroups
    .filter((group) => group.category.id !== WHATSAPP_ORDERS_UNCATEGORIZED_CATEGORY_ID)
    .map((group) => ({ ...group.category }));

  return {
    catalogConfig: resolvedConfig,
    categories: orderedCategories,
    products: orderedProducts,
    items: orderedProducts.map((product) => ({ ...product }))
  };
};

/** Only category IDs already present in products are eligible for legacy fallback. */
export const deriveWhatsAppOrdersCatalogCategoriesFromProducts = (products: unknown): WhatsAppOrdersCategorySnapshot[] => {
  const normalizedProducts = normalizeCatalogProducts(products);
  const byId = new Map<string, WhatsAppOrdersCategorySnapshot>();

  normalizedProducts.forEach((product) => {
    if (!product.categoryId || byId.has(product.categoryId)) return;
    byId.set(product.categoryId, {
      id: product.categoryId,
      name: product.categoryName || 'Categoría'
    });
  });

  return [...byId.values()].sort(compareWhatsAppOrdersCatalogNames);
};
