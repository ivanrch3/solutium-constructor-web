import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type CatalogImageResolutionContext,
  type CatalogImageVariantKey,
  clearCatalogImageVariantCache,
  invalidateCatalogImageVariant,
  resolveCatalogImageVariants
} from '../services/catalogImageVariantResolver';

type CatalogImageProduct = { primaryImageAssetId?: string | null; secondaryImageAssetId?: string | null };

export function useCatalogProductImages(input: {
  products: CatalogImageProduct[];
  context: CatalogImageResolutionContext | null;
  variantKey: CatalogImageVariantKey;
}) {
  const [urlsByAssetId, setUrlsByAssetId] = useState<Record<string, string>>({});
  const generation = useRef(0);
  const previousContext = useRef<CatalogImageResolutionContext | null>(null);
  const previousContextKey = useRef('');
  const retries = useRef(new Set<string>());
  const assetSignature = input.products
    .flatMap((product) => [product.primaryImageAssetId, product.secondaryImageAssetId])
    .filter((assetId): assetId is string => Boolean(assetId))
    .join('|');
  const assetIds = useMemo(
    () => [...new Set(input.products.flatMap((product) => [product.primaryImageAssetId, product.secondaryImageAssetId]).filter((assetId): assetId is string => Boolean(assetId)))],
    [assetSignature]
  );
  const contextKey = input.context ? `${input.context.type}:${input.context.type === 'editor' ? input.context.projectId : input.context.siteId}` : '';

  useEffect(() => {
    const currentGeneration = ++generation.current;
    const controller = new AbortController();
    const didChangeContext = previousContext.current && previousContextKey.current !== contextKey;
    if (didChangeContext) clearCatalogImageVariantCache(previousContext.current);
    previousContext.current = input.context;
    previousContextKey.current = contextKey;
    if (didChangeContext) retries.current.clear();
    setUrlsByAssetId({});
    if (!input.context || !assetIds.length) return () => controller.abort();

    void resolveCatalogImageVariants({ context: input.context, variantKey: input.variantKey, assetIds, signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted && generation.current === currentGeneration) setUrlsByAssetId(result.urlsByAssetId);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [assetIds, contextKey, input.context, input.variantKey]);

  const retryAsset = async (assetId: string) => {
    if (!input.context || retries.current.has(assetId)) return;
    retries.current.add(assetId);
    invalidateCatalogImageVariant(input.context, input.variantKey, assetId);
    setUrlsByAssetId((current) => {
      const next = { ...current };
      delete next[assetId];
      return next;
    });
    const result = await resolveCatalogImageVariants({ context: input.context, variantKey: input.variantKey, assetIds: [assetId] });
    setUrlsByAssetId((current) => ({ ...current, ...result.urlsByAssetId }));
  };

  return { urlsByAssetId, retryAsset };
}
