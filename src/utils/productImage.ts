const asTrimmedString = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

export const resolveProductPrimaryImageUrl = (rawProduct: any): string => {
  if (!rawProduct || typeof rawProduct !== 'object') return '';

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
    if (normalized) return normalized;
  }

  return '';
};
