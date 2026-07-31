import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mergeCurrentCatalogDescriptions,
  resolveCatalogProductDescriptions
} from '../src/utils/catalogProductDescription.ts';

test('uses short description on cards and detailed description in product detail', () => {
  const result = resolveCatalogProductDescriptions({
    shortDescription: 'Resumen comercial',
    description: 'Descripcion completa del producto'
  });

  assert.equal(result.cardDescription, 'Resumen comercial');
  assert.equal(result.detailDescription, 'Descripcion completa del producto');
});

test('keeps detailed-only and short-only products visible through fallbacks', () => {
  assert.equal(
    resolveCatalogProductDescriptions({ description: 'Solo detalle' }).cardDescription,
    'Solo detalle'
  );
  assert.equal(
    resolveCatalogProductDescriptions({ short_description: 'Solo resumen' }).detailDescription,
    'Solo resumen'
  );
});

test('does not create an empty description block for products without text', () => {
  const result = resolveCatalogProductDescriptions({ shortDescription: '   ', description: null });
  assert.equal(result.cardDescription, '');
  assert.equal(result.detailDescription, '');
});

test('reconciles a legacy published snapshot with current short and detailed descriptions only', () => {
  const snapshot: {
    id: string;
    description: string;
    shortDescription?: string;
    short_description?: string;
    price: number;
    selectedOptions: { id: string }[];
  } = {
    id: 'product-1',
    description: 'Detalle antiguo',
    price: 7000,
    selectedOptions: [{ id: 'keep-me' }]
  };
  const current = {
    id: 'product-1',
    short_description: 'Resumen actual',
    description: 'Detalle actual',
    price: 9000
  };

  const merged = mergeCurrentCatalogDescriptions(snapshot, current);

  assert.equal(merged.shortDescription, 'Resumen actual');
  assert.equal(merged.short_description, 'Resumen actual');
  assert.equal(merged.description, 'Detalle actual');
  assert.equal(merged.price, 7000);
  assert.deepEqual(merged.selectedOptions, [{ id: 'keep-me' }]);
});
