import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  createDefaultWhatsAppOrdersCatalogConfig,
  normalizeWhatsAppOrdersCatalogConfig,
  normalizeWhatsAppOrdersProductImageScale,
  readWhatsAppOrdersCatalogConfig,
  setWhatsAppOrdersCatalogProductImageScale
} from '../src/components/constructor/modules/whatsappOrdersCatalogConfig';
import { buildWhatsAppOrdersCatalogPublishedContract } from '../src/components/constructor/modules/whatsappOrdersCatalogPublishedContract';

test('normalizes product image scale to the supported 50..100 range and step', () => {
  assert.equal(normalizeWhatsAppOrdersProductImageScale(undefined), 100);
  assert.equal(normalizeWhatsAppOrdersProductImageScale(null), 100);
  assert.equal(normalizeWhatsAppOrdersProductImageScale(Number.NaN), 100);
  assert.equal(normalizeWhatsAppOrdersProductImageScale('not-a-number'), 100);
  assert.equal(normalizeWhatsAppOrdersProductImageScale(50), 50);
  assert.equal(normalizeWhatsAppOrdersProductImageScale(75), 75);
  assert.equal(normalizeWhatsAppOrdersProductImageScale(100), 100);
  assert.equal(normalizeWhatsAppOrdersProductImageScale(20), 50);
  assert.equal(normalizeWhatsAppOrdersProductImageScale(120), 100);
  assert.equal(normalizeWhatsAppOrdersProductImageScale(72), 70);
  assert.equal(normalizeWhatsAppOrdersProductImageScale(73), 75);
});

test('keeps old V2 and legacy layout configurations backward compatible', () => {
  const oldV2 = normalizeWhatsAppOrdersCatalogConfig({
    version: 2,
    scope: { mode: 'all' },
    order: { mode: 'alphabetical' },
    display: { defaultView: 'list' },
    visitorView: { allowViewSwitch: true }
  });
  assert.equal(oldV2.display.productImageScale, 100);

  const legacy = readWhatsAppOrdersCatalogConfig(
    { module_global_layout: 'list' },
    'module'
  );
  assert.equal(legacy.display.defaultView, 'list');
  assert.equal(legacy.display.productImageScale, 100);
});

test('publishes productImageScale inside catalogConfig.display', () => {
  const config = setWhatsAppOrdersCatalogProductImageScale(
    createDefaultWhatsAppOrdersCatalogConfig(),
    75
  );
  const contract = buildWhatsAppOrdersCatalogPublishedContract({
    config,
    categories: [],
    products: []
  });

  assert.equal(contract.catalogConfig.display.productImageScale, 75);
  assert.equal(normalizeWhatsAppOrdersCatalogConfig(contract.catalogConfig).display.productImageScale, 75);
});

test('catalog render scales only the main product image and centers it in both layouts', () => {
  const source = fs.readFileSync(new URL('../src/components/constructor/modules/WhatsAppOrdersModule.tsx', import.meta.url), 'utf8');

  assert.match(source, /const productImageScale = catalogConfig\.display\.productImageScale/);
  assert.match(source, /aspect-\[4\/3\] w-full/);
  assert.match(source, /h-28 w-28 self-center sm:h-36 sm:w-44/);
  assert.match(source, /flex items-center justify-center/);
  assert.match(source, /className="h-full w-full object-contain object-center"\s+style=\{\{ width: `\$\{productImageScale\}%`, height: `\$\{productImageScale\}%` \}\}/);
  assert.equal((source.match(/productImageScale/g) || []).length, 4);
  assert.match(source, /cartImageUrl[\s\S]{0,300}className="h-full w-full object-cover"/);
  assert.match(source, /selectedProduct\.primaryImageAssetId[\s\S]{0,300}className="h-full w-full object-contain object-center"/);
});

test('catalog panel exposes one V2 multimedia range control', () => {
  const source = fs.readFileSync(new URL('../src/components/constructor/StructurePanel.tsx', import.meta.url), 'utf8');

  assert.match(source, /Tamaño de imagen/);
  assert.match(source, /Ajusta el tamaño de la imagen dentro de su área, sin modificar el tamaño de la tarjeta\./);
  assert.match(source, /min=\{50\}[\s\S]{0,100}max=\{100\}[\s\S]{0,100}step=\{5\}/);
  assert.match(source, /\{config\.display\.productImageScale\}%/);
  assert.match(source, /setWhatsAppOrdersCatalogProductImageScale\(config, productImageScale\)/);
  assert.doesNotMatch(source, /global_product_image_scale/);
});
