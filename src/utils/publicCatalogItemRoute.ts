export type PublicCatalogItemRoute = {
  categorySlug: string;
  itemSlug: string;
  source: 'query' | 'path';
};

export const normalizePublicCatalogSlug = (value: string | null | undefined) => {
  const normalized = decodeURIComponent(String(value || ''))
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized;
};

export const resolvePublicCatalogItemRoute = (location: Pick<Location, 'pathname' | 'search'>): PublicCatalogItemRoute | null => {
  const query = new URLSearchParams(location.search);
  if (query.get('catalog_view') === 'item') {
    const categorySlug = normalizePublicCatalogSlug(query.get('catalog_category'));
    const itemSlug = normalizePublicCatalogSlug(query.get('catalog_item'));
    return categorySlug && itemSlug ? { categorySlug, itemSlug, source: 'query' } : null;
  }

  const segments = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => normalizePublicCatalogSlug(segment));

  if (segments.length !== 2 || !segments[0] || !segments[1]) return null;

  return {
    categorySlug: segments[0],
    itemSlug: segments[1],
    source: 'path'
  };
};
