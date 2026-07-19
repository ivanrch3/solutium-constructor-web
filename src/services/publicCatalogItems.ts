import { Product } from '../types/schema';

export type PublicCatalogItemRouteInput = {
  categorySlug: string;
  itemSlug: string;
};

type PublicCatalogItemResponse = {
  success?: boolean;
  item?: Record<string, any>;
};

const asString = (value: unknown) => typeof value === 'string' ? value.trim() : '';

const resolvePublishedBusinessOrigin = () => {
  const explicitHost = new URLSearchParams(window.location.search).get('catalog_host');
  if (explicitHost) {
    try {
      return new URL(explicitHost).origin;
    } catch {
      // Fall through to the bridge referrer.
    }
  }

  if (document.referrer) {
    try {
      return new URL(document.referrer).origin;
    } catch {
      // Fall through to the current origin.
    }
  }

  return window.location.origin;
};

const toProduct = (item: Record<string, any>): Product => ({
  ...item,
  id: asString(item.id),
  name: asString(item.name) || 'Producto',
  description: asString(item.description),
  price: typeof item.price === 'number' ? item.price : Number(item.price || 0),
  priceReference: typeof item.priceReference === 'number' ? item.priceReference : Number(item.priceReference || 0),
  category: asString(item.category?.name || item.category),
  sku: asString(item.sku),
  imageUrl: asString(item.imageUrl),
  image2Url: asString(item.image2Url),
  stock: typeof item.stock === 'number' ? item.stock : Number(item.stock || 0),
  appData: item.appData && typeof item.appData === 'object' ? item.appData : {}
});

export const fetchHostedPublicCatalogItem = async (
  input: PublicCatalogItemRouteInput,
  signal?: AbortSignal
): Promise<Product | null> => {
  const categorySlug = encodeURIComponent(input.categorySlug);
  const itemSlug = encodeURIComponent(input.itemSlug);
  const businessOrigin = resolvePublishedBusinessOrigin();
  const response = await fetch(`${businessOrigin}/api/public/catalog-host/${categorySlug}/${itemSlug}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`PUBLIC_CATALOG_ITEM_REQUEST_FAILED:${response.status}`);

  const payload = await response.json() as PublicCatalogItemResponse;
  if (!payload.success || !payload.item || typeof payload.item !== 'object') return null;

  return toProduct(payload.item);
};
