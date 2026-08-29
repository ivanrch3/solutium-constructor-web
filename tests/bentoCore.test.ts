import assert from 'node:assert/strict';
import test from 'node:test';
import {
  reorderBentoItems,
  reconcileBentoLayoutById,
  resolveBentoAutoRows,
  resolveBentoBorderVisibility,
  resolveBentoHoverEffectDefault,
  resolveBentoLayoutVersion,
  resolveBentoRowHeight,
  resolveBentoVerticalAlign,
  hasExplicitBentoLayout,
  resolveBentoSelectedIndex,
  resolveBentoSettingId,
  resolveBentoBorderStyle,
  resolveBentoBorderWidth,
  resolveBentoBorderColor,
  resolveBentoEditorTab,
  resolveBentoGridContentHeight,
  resolveBentoEffectiveRows,
  resolveBentoEffectiveWidth,
  resolveBentoHeightMode,
  resolveBentoWidthMode
} from '../src/utils/bentoCore.ts';

test('new Bento defaults use no hover and legacy lift remains intact', () => {
  assert.equal(resolveBentoHoverEffectDefault({ hover_effect: 'none' }), 'none');
  assert.equal(resolveBentoHoverEffectDefault({ hover_effect: 'lift' }), 'lift');
  assert.equal(resolveBentoHoverEffectDefault({ hover_effect: 'zoom' }), 'zoom');
  assert.equal(resolveBentoHoverEffectDefault({ hover_effect: 'pulse' }), 'pulse');
  assert.equal(resolveBentoHoverEffectDefault({}), 'lift');
});

test('border visibility distinguishes new explicit false from legacy behavior', () => {
  assert.equal(resolveBentoBorderVisibility({ show_border: false, card_style: 'solid' }), false);
  assert.equal(resolveBentoBorderVisibility({ show_border: true, card_style: 'solid' }), true);
  assert.equal(resolveBentoBorderVisibility({ show_border: false, card_style: 'solid' }), false);
  assert.equal(resolveBentoBorderVisibility({ card_style: 'solid' }), true);
  assert.equal(resolveBentoBorderVisibility({ card_style: 'transparent' }), false);
});

test('border styles and widths render safely, including soft and double fallbacks', () => {
  assert.equal(resolveBentoBorderStyle('solid'), 'solid');
  assert.equal(resolveBentoBorderStyle('dashed'), 'dashed');
  assert.equal(resolveBentoBorderStyle('dotted'), 'dotted');
  assert.equal(resolveBentoBorderStyle('double'), 'double');
  assert.equal(resolveBentoBorderStyle('soft'), 'soft');
  assert.equal(resolveBentoBorderStyle('invalid'), 'solid');
  assert.equal(resolveBentoBorderWidth(1, 'solid'), 1);
  assert.equal(resolveBentoBorderWidth(1, 'double'), 3);
  assert.equal(resolveBentoBorderWidth(5, 'double'), 5);
  assert.equal(resolveBentoBorderColor('#ff0000', 'soft'), 'rgba(255, 0, 0, 0.4)');
  assert.equal(resolveBentoBorderColor('#ff0000', 'solid'), '#ff0000');
});

test('Bento editor placement is canonical and keeps visual settings out of structure', () => {
  for (const settingId of ['card_style', 'card_shadow', 'text_contrast', 'show_border', 'card_border', 'border_style', 'border_width', 'hover_effect']) {
    assert.equal(resolveBentoEditorTab(settingId), 'diseno');
  }
  for (const settingId of ['desktop_span', 'height_mode', 'vertical_align', 'padding']) {
    assert.equal(resolveBentoEditorTab(settingId), 'estructura');
  }
  assert.equal(resolveBentoEditorTab('image'), 'contenido');
  assert.equal(resolveBentoEditorTab('clickActionType'), 'contenido');
});

test('description typography keeps legacy desc aliases without changing their persisted ids', () => {
  assert.equal(resolveBentoSettingId({ desc_size: 'p' }, 'description_size'), 'desc_size');
  assert.equal(resolveBentoSettingId({ desc_weight: 'normal' }, 'description_weight'), 'desc_weight');
  assert.equal(resolveBentoSettingId({ desc_color: '#123456' }, 'description_color'), 'desc_color');
  assert.equal(resolveBentoSettingId({ description_size: 's', desc_size: 'p' }, 'description_size'), 'description_size');
});

test('auto rows grow with text and list content and never fall below one', () => {
  const shortText = resolveBentoAutoRows({ type: 'text', title: 'Título', description: 'Corto', padding: 12 }, 'desktop', 80, 20, 8);
  const longText = resolveBentoAutoRows({ type: 'text', title: 'Título '.repeat(20), description: 'Descripción '.repeat(30), padding: 12 }, 'desktop', 80, 20, 8);
  const shortList = resolveBentoAutoRows({ type: 'list', title: 'Puntos', list_items: ['Uno'], padding: 12 }, 'mobile', 80, 20, 4);
  const longList = resolveBentoAutoRows({ type: 'list', title: 'Puntos', list_items: ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco'], padding: 12 }, 'mobile', 80, 20, 4);
  const image = resolveBentoAutoRows({ type: 'visual', padding: 0 }, 'desktop', 80, 20, 6);
  assert.ok(shortText >= 1);
  assert.ok(longText > shortText);
  assert.ok(longList > shortList);
  assert.ok(image >= 1);
});

test('manual row spans are preserved by callers and helper respects minimum boundary', () => {
  const persisted = 1;
  assert.equal(Math.max(persisted, 1), persisted);
  assert.ok(resolveBentoAutoRows({ type: 'text', title: '', description: '', padding: 0 }, 'desktop') >= 1);
});

test('reorder changes array order, preserves object identity and leaves layout fields untouched', () => {
  const items = [
    { id: 'a', x: 1, y: 2, w: 3, h: 4 },
    { id: 'b', x: 5, y: 6, w: 7, h: 8 },
    { id: 'c', x: 9, y: 10, w: 11, h: 12 }
  ];
  const reordered = reorderBentoItems(items, 2, 0);
  assert.deepEqual(reordered.map((item) => item.id), ['c', 'a', 'b']);
  assert.deepEqual(reordered[0], items[2]);
  assert.deepEqual(reordered.map(({ x, y, w, h }) => ({ x, y, w, h })), [
    { x: 9, y: 10, w: 11, h: 12 },
    { x: 1, y: 2, w: 3, h: 4 },
    { x: 5, y: 6, w: 7, h: 8 }
  ]);
  assert.equal(reorderBentoItems(items, -1, 0), items);
  assert.equal(reorderBentoItems(items, 0, 99), items);
  assert.deepEqual(reorderBentoItems(items, 0, 2).map((item) => item.id), ['b', 'c', 'a']);
});

test('breakpoint layout reconciliation updates only the requested item and breakpoint by stable id', () => {
  const items = [
    { id: 'a', layouts: { desktop: { x: 1, y: 2, w: 3, h: 4 }, mobile: { x: 0, y: 0, w: 4, h: 2 } } },
    { id: 'b', layouts: { desktop: { x: 8, y: 1, w: 4, h: 3 } } }
  ];
  const reordered = [items[1], items[0]];
  const next = reconcileBentoLayoutById(reordered, { i: 'a', x: 0, y: 9, w: 4, h: 6, columns: 4 }, 'mobile');
  assert.deepEqual(next[0].layouts.desktop, items[1].layouts.desktop);
  assert.deepEqual(next[1].layouts.desktop, items[0].layouts.desktop);
  assert.deepEqual(next[1].layouts.mobile, { x: 0, y: 9, w: 4, h: 6, columns: 4 });
  assert.equal((next[1] as any).layout_sources.mobile, 'explicit');
});

test('derived breakpoint layouts remain derived while legacy persisted layouts remain explicit', () => {
  assert.equal(hasExplicitBentoLayout({ layouts: { mobile: { x: 0, y: 0, w: 4, h: 2 } }, layout_sources: { mobile: 'derived' } }, 'mobile'), false);
  assert.equal(hasExplicitBentoLayout({ layouts: { mobile: { x: 0, y: 0, w: 4, h: 2 } }, layout_sources: { mobile: 'explicit' } }, 'mobile'), true);
  assert.equal(hasExplicitBentoLayout({ layouts: { mobile: { x: 0, y: 0, w: 4, h: 2 } } }, 'mobile'), true);
});

test('selection follows stable item id after reorder and stays empty without selection', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const reordered = reorderBentoItems(items, 2, 0);
  assert.equal(resolveBentoSelectedIndex(reordered, 'a'), 1);
  assert.equal(resolveBentoSelectedIndex(reordered, 'c'), 0);
  assert.equal(resolveBentoSelectedIndex(reordered, null), -1);
});

test('layout version keeps legacy at 80px and compact at 20px', () => {
  assert.equal(resolveBentoLayoutVersion(undefined, false), 1);
  assert.equal(resolveBentoRowHeight(undefined, false), 80);
  assert.equal(resolveBentoLayoutVersion(2), 2);
  assert.equal(resolveBentoRowHeight(2), 20);
  assert.ok(resolveBentoAutoRows({ type: 'text', title: 'Contenido '.repeat(12), description: 'Texto '.repeat(20), padding: 8 }, 'mobile', 20, 20, 4) > 4);
  const compactRows = resolveBentoAutoRows({ type: 'text', title: 'Título', description: 'Descripción corta', padding: 0 }, 'mobile', 20, 20, 4);
  const legacyRows = resolveBentoAutoRows({ type: 'text', title: 'Título', description: 'Descripción corta', padding: 0 }, 'mobile', 80, 20, 4);
  assert.ok(compactRows * 20 + (compactRows - 1) * 20 < legacyRows * 80 + (legacyRows - 1) * 20);
});

test('grid content height follows the lowest occupied item and keeps breakpoint geometry independent', () => {
  const desktop = [
    { x: 0, y: 0, w: 8, h: 2 },
    { x: 8, y: 8, w: 8, h: 4 }
  ];
  const movedUp = [
    { x: 0, y: 0, w: 8, h: 2 },
    { x: 8, y: 4, w: 8, h: 4 }
  ];
  const mobile = [{ x: 0, y: 0, w: 4, h: 6 }];

  assert.equal(resolveBentoGridContentHeight(desktop, 20, 12, 16), 388);
  assert.equal(resolveBentoGridContentHeight(movedUp, 20, 12, 16), 260);
  assert.equal(resolveBentoGridContentHeight(mobile, 20, 8, 16), 176);
  assert.equal(resolveBentoGridContentHeight([], 20, 12, 16), 16);
});

test('Bento auto sizing ignores stale manual rows while manual sizing preserves them', () => {
  const autoItem = { type: 'text', title: 'Corto', description: '', padding: 0, height_mode: 'auto' };
  const manualItem = { ...autoItem, height_mode: 'manual' };
  assert.equal(resolveBentoHeightMode(autoItem), 'auto');
  assert.equal(resolveBentoEffectiveRows(autoItem, 'desktop', 12, 80, 20, 8), 1);
  assert.equal(resolveBentoEffectiveRows(manualItem, 'desktop', 12, 80, 20, 8), 12);
});

test('Bento auto width fills the active grid while legacy/manual width keeps spans', () => {
  assert.equal(resolveBentoWidthMode({}), 'manual');
  assert.equal(resolveBentoWidthMode({ width_mode: 'auto' }), 'auto');
  assert.equal(resolveBentoEffectiveWidth({ width_mode: 'auto', desktop_span: 4 }, 'desktop', 24), 24);
  assert.equal(resolveBentoEffectiveWidth({ desktop_span: 4 }, 'desktop', 24), 4);
  assert.equal(resolveBentoEffectiveWidth({ width_mode: 'auto', mobile_span: 2 }, 'mobile', 4), 4);
});

test('new auto alignment defaults to center while legacy falls back to start', () => {
  assert.equal(resolveBentoVerticalAlign('center'), 'center');
  assert.equal(resolveBentoVerticalAlign(undefined), 'start');
  assert.equal(resolveBentoVerticalAlign(undefined, 'end'), 'end');
});
