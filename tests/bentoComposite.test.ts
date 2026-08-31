import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createBentoCompositeElements,
  normalizeBentoCompositeElements,
  estimateBentoCompositeHeight,
  normalizeBentoCompositeListItems,
  regenerateBentoCompositeListItemIds,
  reorderBentoCompositeListItems,
  regenerateBentoCompositeElementIds,
  reorderBentoCompositeElements,
  resolveBentoCompositeLayout,
  updateBentoCompositeElement,
  BENTO_BUTTON_SIZE_PRESETS,
  getBentoButtonSizePreset,
  resolveBentoButtonSize,
  resolveBentoCompositeTextAlign,
  BENTO_TITLE_ALLOWED_LEVELS,
  BENTO_SECONDARY_TEXT_ALLOWED_LEVELS,
  BENTO_EDITOR_TAB_ORDER,
  resolveBentoEditorItemLabel,
  shouldRenderBentoImagePlaceholder,
  resolveBentoCompositeContainerSizing,
} from '../src/utils/bentoComposite.ts';
import { intrinsicHeightToGridRows, resolveBentoEffectiveRows } from '../src/utils/bentoCore.ts';
import { resolveModuleDisplayLabel, resolveModuleEditorLabel } from '../src/utils/menuNavigation.ts';

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

test('composite root uses the full available width at every breakpoint', () => {
  for (const breakpoint of ['desktop', 'tablet', 'mobile'] as const) {
    assert.deepEqual(resolveBentoCompositeContainerSizing(breakpoint), { width: '100%', maxWidth: '100%', minWidth: 0 });
  }
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

test('button size presets control physical size and default legacy buttons to medium', () => {
  assert.equal(resolveBentoButtonSize(undefined), 'medium');
  assert.equal(resolveBentoButtonSize('invalid'), 'medium');
  assert.deepEqual(getBentoButtonSizePreset(undefined), BENTO_BUTTON_SIZE_PRESETS.medium);
  assert.ok(BENTO_BUTTON_SIZE_PRESETS.small.fontSize < BENTO_BUTTON_SIZE_PRESETS.medium.fontSize);
  assert.ok(BENTO_BUTTON_SIZE_PRESETS.large.paddingX > BENTO_BUTTON_SIZE_PRESETS.medium.paddingX);
  for (const key of ['fontSize', 'paddingX', 'paddingY', 'minHeight'] as const) {
    assert.ok(BENTO_BUTTON_SIZE_PRESETS.small[key] < BENTO_BUTTON_SIZE_PRESETS.medium[key]);
    assert.ok(BENTO_BUTTON_SIZE_PRESETS.medium[key] < BENTO_BUTTON_SIZE_PRESETS.large[key]);
  }
  assert.equal(BENTO_BUTTON_SIZE_PRESETS.medium.fontSize, 14);
  assert.equal(BENTO_BUTTON_SIZE_PRESETS.medium.paddingX, 32);
  assert.equal(BENTO_BUTTON_SIZE_PRESETS.medium.paddingY, 16);
  assert.equal(BENTO_BUTTON_SIZE_PRESETS.medium.minHeight, 50);
});

test('measured mobile content drives derived rows after reflow instead of a stale desktop height', () => {
  const item = { type: 'composite', height_mode: 'auto', padding: 16, border_width: 1 };
  const desktopRows = resolveBentoEffectiveRows(item, 'desktop', 2, 20, 20, 8, 120, 34);
  const mobileRows = resolveBentoEffectiveRows(item, 'mobile', 2, 20, 20, 4, 360, 34);
  assert.ok(mobileRows > desktopRows);
  assert.equal(mobileRows, intrinsicHeightToGridRows(360, 20, 20, 34));
});

test('legacy composite buttons preserve data while receiving medium rendering defaults', () => {
  const legacy = createBentoCompositeElements().find((element) => element.type === 'button_primary')!;
  const normalized = normalizeBentoCompositeElements([{ ...legacy, buttonSize: undefined, font_size: 's', font_weight: '900' }]);
  assert.equal(getBentoButtonSizePreset(normalized[0].buttonSize), BENTO_BUTTON_SIZE_PRESETS.medium);
  assert.equal(normalized[0].font_size, 's');
  assert.equal(normalized[0].font_weight, '900');
});

test('composite alignment maps to text alignment for all supported values', () => {
  assert.equal(resolveBentoCompositeTextAlign('start'), 'left');
  assert.equal(resolveBentoCompositeTextAlign('center'), 'center');
  assert.equal(resolveBentoCompositeTextAlign('end'), 'right');
});

test('composite typography levels follow title and secondary-text semantics', () => {
  assert.deepEqual(BENTO_TITLE_ALLOWED_LEVELS, ['t1', 't2', 't3']);
  assert.deepEqual(BENTO_SECONDARY_TEXT_ALLOWED_LEVELS, ['t3', 'p', 's']);
});

test('editor labels use custom metadata without changing element identity', () => {
  const item = { id: 'stable-cell-id', admin_label: 'Oferta principal', title: 'Título visible' };
  assert.equal(resolveBentoEditorItemLabel(item, 0), 'Oferta principal');
  assert.equal(resolveBentoEditorItemLabel({ id: item.id }, 2), 'Elemento 3');
  assert.equal(item.id, 'stable-cell-id');
});

test('composite editor follows the semantic tab order with content as default', () => {
  assert.deepEqual(BENTO_EDITOR_TAB_ORDER, ['contenido', 'estructura', 'diseno', 'mover']);
  assert.equal(BENTO_EDITOR_TAB_ORDER[0], 'contenido');
});

test('image placeholder is editor-only and requires an empty source', () => {
  assert.equal(shouldRenderBentoImagePlaceholder('', false), true);
  assert.equal(shouldRenderBentoImagePlaceholder(undefined, false), true);
  assert.equal(shouldRenderBentoImagePlaceholder('https://example.com/image.png', false), false);
  assert.equal(shouldRenderBentoImagePlaceholder('', true), false);
});

test('module editor labels remain separate from the public module name', () => {
  const module = { id: 'bento-1', type: 'bento', name: 'Diseño libre', editor_label: 'Beneficios' };
  assert.equal(resolveModuleEditorLabel(module), 'Beneficios');
  const reloaded = JSON.parse(JSON.stringify(module));
  assert.equal(reloaded.editor_label, 'Beneficios');
  assert.equal(module.name, 'Diseño libre');
  assert.equal(resolveModuleDisplayLabel(module), 'Diseño libre');
  assert.equal(module.id, 'bento-1');
});

test('duplicated module labels can receive a suffix without changing identity fields', () => {
  const source = { id: 'bento-1', type: 'bento', name: 'Diseño libre', editor_label: 'Beneficios' };
  const duplicate = { ...source, id: 'bento-2', editor_label: `${source.editor_label} copia` };
  assert.equal(duplicate.editor_label, 'Beneficios copia');
  assert.equal(duplicate.name, source.name);
  assert.notEqual(duplicate.id, source.id);
});
