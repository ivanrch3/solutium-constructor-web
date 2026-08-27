import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createBentoCompositeElements,
  estimateBentoCompositeHeight,
  normalizeBentoCompositeListItems,
  regenerateBentoCompositeListItemIds,
  reorderBentoCompositeListItems,
  regenerateBentoCompositeElementIds,
  reorderBentoCompositeElements,
  resolveBentoCompositeLayout,
  updateBentoCompositeElement,
} from '../src/utils/bentoComposite.ts';

test('composite defaults contain eight stable subelements', () => {
  const elements = createBentoCompositeElements();
  assert.equal(elements.length, 8);
  assert.equal(new Set(elements.map((element) => element.id)).size, 8);
  assert.deepEqual(elements.filter((element) => element.enabled).map((element) => element.type), ['title', 'description']);
});

test('enable and disable preserves nested content', () => {
  const original = createBentoCompositeElements();
  const image = original.find((element) => element.type === 'image')!;
  const disabled = updateBentoCompositeElement(original, image.id, { src: '/image.png', enabled: false });
  const enabled = updateBentoCompositeElement(disabled, image.id, { enabled: true });
  assert.equal(enabled.find((element) => element.id === image.id)?.src, '/image.png');
  assert.equal(enabled.find((element) => element.id === image.id)?.enabled, true);
});

test('internal reorder preserves IDs and values and rejects invalid moves', () => {
  const elements = createBentoCompositeElements();
  const moved = reorderBentoCompositeElements(elements, 4, 0);
  assert.equal(moved[0].id, elements[4].id);
  assert.deepEqual(new Set(moved.map((element) => element.id)), new Set(elements.map((element) => element.id)));
  assert.strictEqual(reorderBentoCompositeElements(elements, -1, 2), elements);
});

test('horizontal composition becomes vertical on mobile', () => {
  assert.equal(resolveBentoCompositeLayout('horizontal', 'desktop'), 'horizontal');
  assert.equal(resolveBentoCompositeLayout('horizontal', 'tablet'), 'horizontal');
  assert.equal(resolveBentoCompositeLayout('horizontal', 'mobile'), 'vertical');
});

test('composite auto height grows with content and uses the horizontal max', () => {
  const base = { padding: 16, composite_gap: 12, desktop_span: 10, mobile_span: 4, composite_layout: 'vertical', composite_elements: createBentoCompositeElements() };
  const shortHeight = estimateBentoCompositeHeight(base, 'desktop');
  const withList = updateBentoCompositeElement(base.composite_elements, base.composite_elements[5].id, { enabled: true, items: ['a', 'b', 'c', 'd'] });
  const listHeight = estimateBentoCompositeHeight({ ...base, composite_elements: withList }, 'desktop');
  assert.ok(listHeight > shortHeight);
  const horizontalHeight = estimateBentoCompositeHeight({ ...base, composite_layout: 'horizontal', composite_elements: withList }, 'desktop');
  const mobileHeight = estimateBentoCompositeHeight({ ...base, composite_layout: 'horizontal', composite_elements: withList }, 'mobile');
  assert.ok(horizontalHeight < mobileHeight);
  assert.ok(estimateBentoCompositeHeight({ ...base, composite_elements: [] }, 'desktop') >= 20);
});

test('duplicating nested elements regenerates IDs without changing content', () => {
  const original = createBentoCompositeElements();
  const duplicate = regenerateBentoCompositeElementIds(original, (type, index) => `copy_${type}_${index}`);
  assert.equal(duplicate[3].text, original[3].text);
  assert.notEqual(duplicate[3].id, original[3].id);
  assert.deepEqual(duplicate.map((element) => element.enabled), original.map((element) => element.enabled));
});

test('list items normalize legacy strings and support stable repeater operations', () => {
  const items = normalizeBentoCompositeListItems(['one', 'two']);
  assert.equal(items[0].text, 'one');
  const reordered = reorderBentoCompositeListItems(items, 1, 0);
  assert.deepEqual(reordered.map((item) => item.text), ['two', 'one']);
  const duplicated = regenerateBentoCompositeListItemIds(reordered, 'copy');
  assert.deepEqual(duplicated.map((item) => item.id), ['copy_1', 'copy_2']);
  assert.notEqual(duplicated[0].id, items[1].id);
});
