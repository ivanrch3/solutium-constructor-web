import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewer = fs.readFileSync(new URL('../src/components/Viewer.tsx', import.meta.url), 'utf8');

test('published embeds use the explicit embedded_published contract and skip iframe pixel ownership', () => {
  assert.match(viewer, /queryParams\.get\('embedded_published'\) === 'true'/);
  assert.match(viewer, /isPublishedViewer && !isEmbeddedPublished && metaPixel\.active/);
});

test('direct published legacy Viewer keeps pixel ownership and previews remain excluded', () => {
  assert.match(viewer, /const isPublishedViewer = !isConstructorMode && !!site\.siteId/);
  assert.match(viewer, /queryParams\.get\('mode'\) === 'constructor'/);
  assert.match(viewer, /isMetaPixelDebugMode\(window\.location\.search\)/);
});
