const asTrimmedString = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const isSignedUrl = (value: string) => {
  try {
    const url = new URL(value);
    return ['X-Amz-Signature', 'X-Amz-Credential', 'token', 'signature'].some((key) => url.searchParams.has(key));
  } catch {
    return false;
  }
};

const firstSafeUrl = (...candidates: unknown[]) => {
  for (const candidate of candidates) {
    const value = asTrimmedString(candidate);
    if (value && !isSignedUrl(value)) return value;
  }
  return '';
};

export type CatalogProductImageFields = {
  primaryImageAssetId?: string;
  secondaryImageAssetId?: string;
  imageUrl: string;
  image2Url: string;
};

export const normalizeCatalogProductImageFields = (rawProduct: any): CatalogProductImageFields => {
  const raw = rawProduct && typeof rawProduct === 'object' ? rawProduct : {};
  const appData = raw.appData || raw.app_data || {};
  const primaryImageAssetId = asTrimmedString(raw.primaryImageAssetId || raw.primary_image_asset_id) || undefined;
  const secondaryImageAssetId = asTrimmedString(raw.secondaryImageAssetId || raw.secondary_image_asset_id) || undefined;

  return {
    ...(primaryImageAssetId ? { primaryImageAssetId } : {}),
    ...(secondaryImageAssetId ? { secondaryImageAssetId } : {}),
    imageUrl: firstSafeUrl(raw.imageUrl, raw.image_url, raw.thumbnailUrl, raw.thumbnail_url, raw.image, appData.imageUrl, appData.image_url),
    image2Url: firstSafeUrl(raw.image2Url, raw.image2_url, raw.hover_image, raw.second_image, appData.image2Url, appData.image2_url)
  };
};

export const resolveProductPrimaryImageUrl = (rawProduct: any): string => {
  if (!rawProduct || typeof rawProduct !== 'object') return '';

  const normalized = normalizeCatalogProductImageFields(rawProduct);
  if (normalized.imageUrl) return normalized.imageUrl;

  const appData = rawProduct.appData || rawProduct.app_data || {};
  const imageObject = rawProduct.image && typeof rawProduct.image === 'object' ? rawProduct.image : null;
  const mediaObject = rawProduct.media && typeof rawProduct.media === 'object' ? rawProduct.media : null;
  const assetObject = rawProduct.asset && typeof rawProduct.asset === 'object' ? rawProduct.asset : null;

  const candidates = [
    rawProduct.imageUrl,
    rawProduct.image_url,
    rawProduct.thumbnailUrl,
    rawProduct.thumbnail_url,
    rawProduct.featuredImage,
    rawProduct.featured_image,
    rawProduct.thumbnail,
    typeof rawProduct.image === 'string' ? rawProduct.image : '',
    rawProduct.photo,
    rawProduct.foto,
    rawProduct.img,
    imageObject?.url,
    mediaObject?.url,
    assetObject?.url,
    appData.imageUrl,
    appData.image_url,
    appData.image,
    appData.featuredImage,
    appData.featured_image,
    appData.thumbnailUrl,
    appData.thumbnail_url,
    appData.thumbnail
  ];

  for (const candidate of candidates) {
    const normalized = asTrimmedString(candidate);
    if (normalized && !isSignedUrl(normalized)) return normalized;
  }

  return '';
};
