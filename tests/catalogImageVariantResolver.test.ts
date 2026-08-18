import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWhatsAppOrdersCatalogPublishedContract } from '../src/components/constructor/modules/whatsappOrdersCatalogPublishedContract';
import {
  clearCatalogImageVariantCache,
  resolveCatalogImageUrl,
  resolveCatalogImageVariants
} from '../src/services/catalogImageVariantResolver';
import { fetchHostedPublicCatalogItem } from '../src/services/publicCatalogItems';
import { normalizeCatalogProductImageFields } from '../src/utils/productImage';

const firstAssetId = 'a1111111-1111-4111-8111-111111111111';
const secondAssetId = 'b2222222-2222-4222-8222-222222222222';
const assetIds = Array.from({ length: 101 }, (_, index) =>
  `${String(index + 1).padStart(8, '0')}-1111-4111-8111-111111111111`
);

test('normalizes stable asset references and retains only legacy-safe URLs', () => {
  const normalized = normalizeCatalogProductImageFields({
    primary_image_asset_id: firstAssetId,
    secondaryImageAssetId: secondAssetId,
    image_url: 'https://legacy.example/primary.jpg',
    image2Url: 'https://legacy.example/secondary.jpg'
  });

  assert.deepEqual(normalized, {
    primaryImageAssetId: firstAssetId,
    secondaryImageAssetId: secondAssetId,
    imageUrl: 'https://legacy.example/primary.jpg',
    image2Url: 'https://legacy.example/secondary.jpg'
  });
});

test('normalizes every supported camelCase and snake_case image field', () => {
  assert.deepEqual(normalizeCatalogProductImageFields({
    primaryImageAssetId: firstAssetId,
    secondary_image_asset_id: secondAssetId,
    imageUrl: 'https://legacy.example/primary.jpg',
    image2_url: 'https://legacy.example/secondary.jpg'
  }), {
    primaryImageAssetId: firstAssetId,
    secondaryImageAssetId: secondAssetId,
    imageUrl: 'https://legacy.example/primary.jpg',
    image2Url: 'https://legacy.example/secondary.jpg'
  });
});

test('published snapshot keeps asset IDs and strips signed URLs', () => {
  const contract = buildWhatsAppOrdersCatalogPublishedContract({
    config: {
      version: 2,
      scope: { mode: 'all' },
      order: { mode: 'alphabetical' },
      display: { defaultView: 'grid', productImageScale: 100 },
      visitorView: { allowViewSwitch: true }
    },
    categories: [],
    products: [{
      id: 'product-1',
      name: 'Café',
      primaryImageAssetId: firstAssetId,
      secondary_image_asset_id: secondAssetId,
      imageUrl: 'https://storage.example/image.jpg?X-Amz-Signature=temporary',
      image2_url: 'https://legacy.example/secondary.jpg'
    }]
  });

  assert.equal(contract.products[0].primaryImageAssetId, firstAssetId);
  assert.equal(contract.products[0].secondaryImageAssetId, secondAssetId);
  assert.equal(contract.products[0].imageUrl, undefined);
  assert.equal(contract.products[0].image2Url, 'https://legacy.example/secondary.jpg');
  assert.equal(JSON.stringify(contract).includes('X-Amz-Signature'), false);
});

test('published snapshots retain legacy data but exclude transport and storage internals', () => {
  const contract = buildWhatsAppOrdersCatalogPublishedContract({
    config: { version: 2, scope: { mode: 'all' }, order: { mode: 'alphabetical' }, display: { defaultView: 'list', productImageScale: 100 }, visitorView: { allowViewSwitch: false } },
    categories: [],
    products: [{
      id: 'legacy-product',
      name: 'Legacy',
      image_url: 'https://legacy.example/image.jpg',
      image2Url: 'https://legacy.example/second.jpg',
      expiresInSeconds: 300,
      provider: 'spaces',
      bucket: 'private',
      storageKey: 'projects/secret',
      source: 'source'
    }]
  });
  const product = contract.products[0] as Record<string, unknown>;
  assert.equal(product.imageUrl, 'https://legacy.example/image.jpg');
  assert.equal(product.image2Url, 'https://legacy.example/second.jpg');
  ['expiresInSeconds', 'provider', 'bucket', 'storageKey', 'source'].forEach((key) => assert.equal(key in product, false));
});

test('published resolver batches, deduplicates, omits credentials, and preserves partial results', async () => {
  clearCatalogImageVariantCache();
  const originalFetch = globalThis.fetch;
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(url), init });
    const requestBody = JSON.parse(String(init?.body || '{}')) as { assetIds: string[]; variantKey: string };
    const urls = Object.fromEntries(requestBody.assetIds.slice(0, 1).map((assetId) => [assetId, `https://signed.example/${assetId}`]));
    return new Response(JSON.stringify({ success: true, variantKey: requestBody.variantKey, urls, expiresInSeconds: 300 }), { status: 200 });
  }) as typeof fetch;

  try {
    const result = await resolveCatalogImageVariants({
      context: { type: 'published', siteId: 'site-a' },
      variantKey: 'card',
      assetIds: [...assetIds, assetIds[0], 'gallery_1', '']
    });

    assert.equal(requests.length, 2);
    assert.equal(JSON.parse(String(requests[0].init?.body)).assetIds.length, 100);
    assert.equal(requests[0].init?.credentials, 'omit');
    assert.equal(requests[0].init?.headers && 'Authorization' in requests[0].init.headers, false);
    assert.match(requests[0].url, /\/api\/public\/published-sites\/site-a\/image-assets\/variant-urls$/);
    assert.equal(Object.keys(result.urlsByAssetId).length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('cache remains scoped by published site and falls back to legacy URLs', async () => {
  clearCatalogImageVariantCache();
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    calls += 1;
    const { assetIds: requestedAssetIds } = JSON.parse(String(init?.body || '{}')) as { assetIds: string[] };
    return new Response(JSON.stringify({ urls: { [requestedAssetIds[0]]: `https://signed.example/site-${calls}` }, expiresInSeconds: 300 }), { status: 200 });
  }) as typeof fetch;

  try {
    const siteA = await resolveCatalogImageVariants({ context: { type: 'published', siteId: 'site-a' }, variantKey: 'thumbnail', assetIds: [firstAssetId] });
    const siteB = await resolveCatalogImageVariants({ context: { type: 'published', siteId: 'site-b' }, variantKey: 'thumbnail', assetIds: [firstAssetId] });
    assert.equal(calls, 2);
    assert.notEqual(siteA.urlsByAssetId[firstAssetId], siteB.urlsByAssetId[firstAssetId]);
    assert.equal(resolveCatalogImageUrl({
      context: { type: 'published', siteId: 'site-a' },
      variantKey: 'thumbnail',
      assetId: firstAssetId,
      legacyUrl: 'https://legacy.example/image.jpg',
      urlsByAssetId: {}
    }), 'https://legacy.example/image.jpg');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('editor uses the private project endpoint and the stored secure-launch token', async () => {
  clearCatalogImageVariantCache();
  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = { SOLUTIUM_CONSTRUCTOR_LAUNCH_ACCESS: { token: 'launch-token', expiresAt: null } };
  let request: { url: string; init?: RequestInit } | null = null;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    request = { url: String(url), init };
    return new Response(JSON.stringify({ urls: { [firstAssetId]: 'https://signed.example/editor' }, expiresInSeconds: 300 }), { status: 200 });
  }) as typeof fetch;

  try {
    await resolveCatalogImageVariants({ context: { type: 'editor', projectId: 'project-canonical' }, variantKey: 'thumbnail', assetIds: [firstAssetId] });
    assert.match(request?.url || '', /\/api\/projects\/project-canonical\/image-assets\/variant-urls$/);
    assert.equal((request?.init?.headers as Record<string, string>).Authorization, 'Bearer launch-token');
    assert.deepEqual(JSON.parse(String(request?.init?.body)), { variantKey: 'thumbnail', assetIds: [firstAssetId] });
  } finally {
    globalThis.fetch = originalFetch;
    (globalThis as { window?: unknown }).window = originalWindow;
  }
});

test('cache is independent by project and variant and respects the TTL safety margin', async () => {
  clearCatalogImageVariantCache();
  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as { window?: unknown }).window;
  const originalNow = Date.now;
  let now = 1_000_000;
  let calls = 0;
  (Date as { now: () => number }).now = () => now;
  (globalThis as { window?: unknown }).window = { SOLUTIUM_CONSTRUCTOR_LAUNCH_ACCESS: { token: 'launch-token', expiresAt: null } };
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    calls += 1;
    const { assetIds: requestedAssetIds } = JSON.parse(String(init?.body)) as { assetIds: string[] };
    return new Response(JSON.stringify({ urls: { [requestedAssetIds[0]]: `https://signed.example/${calls}` }, expiresInSeconds: 20 }), { status: 200 });
  }) as typeof fetch;

  try {
    await resolveCatalogImageVariants({ context: { type: 'editor', projectId: 'project-a' }, variantKey: 'card', assetIds: [firstAssetId] });
    await resolveCatalogImageVariants({ context: { type: 'editor', projectId: 'project-a' }, variantKey: 'card', assetIds: [firstAssetId] });
    assert.equal(calls, 1);
    await resolveCatalogImageVariants({ context: { type: 'editor', projectId: 'project-a' }, variantKey: 'thumbnail', assetIds: [firstAssetId] });
    await resolveCatalogImageVariants({ context: { type: 'editor', projectId: 'project-b' }, variantKey: 'card', assetIds: [firstAssetId] });
    assert.equal(calls, 3);
    now += 6_000;
    await resolveCatalogImageVariants({ context: { type: 'editor', projectId: 'project-a' }, variantKey: 'card', assetIds: [firstAssetId] });
    assert.equal(calls, 4);
  } finally {
    globalThis.fetch = originalFetch;
    (globalThis as { window?: unknown }).window = originalWindow;
    (Date as { now: () => number }).now = originalNow;
  }
});

test('total and partial transport failures do not break legacy fallback', async () => {
  clearCatalogImageVariantCache();
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    calls += 1;
    const { assetIds: requestedAssetIds } = JSON.parse(String(init?.body)) as { assetIds: string[] };
    if (calls === 1) return new Response(JSON.stringify({ urls: { [requestedAssetIds[0]]: 'https://signed.example/partial' } }), { status: 200 });
    return new Response(null, { status: 500 });
  }) as typeof fetch;

  try {
    const partial = await resolveCatalogImageVariants({ context: { type: 'published', siteId: 'site-partial' }, variantKey: 'card', assetIds });
    assert.equal(Object.keys(partial.urlsByAssetId).length, 1);
    clearCatalogImageVariantCache();
    const failed = await resolveCatalogImageVariants({ context: { type: 'published', siteId: 'site-failed' }, variantKey: 'detail', assetIds: [firstAssetId] });
    assert.deepEqual(failed.urlsByAssetId, {});
    assert.equal(resolveCatalogImageUrl({ context: { type: 'published', siteId: 'site-failed' }, variantKey: 'detail', assetId: firstAssetId, legacyUrl: 'https://legacy.example/fallback.jpg', urlsByAssetId: failed.urlsByAssetId }), 'https://legacy.example/fallback.jpg');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('abort errors are propagated and invalid product IDs never request a variant', async () => {
  clearCatalogImageVariantCache();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new DOMException('Aborted', 'AbortError');
  }) as typeof fetch;
  try {
    await assert.rejects(
      resolveCatalogImageVariants({ context: { type: 'published', siteId: 'site-abort' }, variantKey: 'card', assetIds: [firstAssetId], signal: new AbortController().signal }),
      { name: 'AbortError' }
    );
    const noAssets = await resolveCatalogImageVariants({ context: { type: 'published', siteId: 'site-empty' }, variantKey: 'card', assetIds: ['gallery_1', '', 10] });
    assert.deepEqual(noAssets.urlsByAssetId, {});
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('public item route preserves stable asset IDs and legacy fallback fields', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as { window?: unknown }).window;
  const originalDocument = (globalThis as { document?: unknown }).document;
  (globalThis as { window?: unknown }).window = { location: { search: '', origin: 'https://published.example' } };
  (globalThis as { document?: unknown }).document = { referrer: '' };
  globalThis.fetch = (async () => new Response(JSON.stringify({ success: true, item: {
    id: 'item-1', name: 'Producto', primary_image_asset_id: firstAssetId, secondaryImageAssetId: secondAssetId,
    image_url: 'https://legacy.example/item.jpg', image2Url: 'https://legacy.example/item-2.jpg'
  } }), { status: 200 })) as typeof fetch;
  try {
    const item = await fetchHostedPublicCatalogItem({ categorySlug: 'bebidas', itemSlug: 'producto' });
    assert.equal(item?.primaryImageAssetId, firstAssetId);
    assert.equal(item?.secondaryImageAssetId, secondAssetId);
    assert.equal(item?.imageUrl, 'https://legacy.example/item.jpg');
    assert.equal(item?.image2Url, 'https://legacy.example/item-2.jpg');
  } finally {
    globalThis.fetch = originalFetch;
    (globalThis as { window?: unknown }).window = originalWindow;
    (globalThis as { document?: unknown }).document = originalDocument;
  }
});
