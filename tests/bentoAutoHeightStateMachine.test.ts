import assert from 'node:assert/strict';
import test from 'node:test';
import {
  intrinsicHeightToGridRows,
  resolveBentoEffectiveRows,
  resolveBentoPadding,
  updateBentoIntrinsicSize,
  type BentoIntrinsicSizes
} from '../src/utils/bentoCore.ts';

test('padding axes normalize new values and preserve the legacy two-axis fallback', () => {
  assert.deepEqual(resolveBentoPadding({ padding: 18 }), {
    top: 18, right: 18, bottom: 18, left: 18, horizontal: 18, vertical: 18
  });
  assert.deepEqual(resolveBentoPadding({ padding: 18, horizontal_padding: 10, vertical_padding: 26 }), {
    top: 26, right: 10, bottom: 26, left: 10, horizontal: 10, vertical: 26
  });
});

test('legacy icon card padding remains independent from text padding', () => {
  assert.deepEqual(resolveBentoPadding({ type: 'icon', padding: 40, card_padding_top: 8, card_padding_bottom: 12, card_padding_left: 16, card_padding_right: 20 }), {
    top: 8, right: 20, bottom: 12, left: 16, horizontal: 18, vertical: 10
  });
});

test('auto height grows and shrinks from the latest intrinsic measurement', () => {
  const item = { id: 'composite', height_mode: 'auto' };
  const initialRows = resolveBentoEffectiveRows(item, 'desktop', 1, 20, 20, 20, 180, 20);
  const grownRows = resolveBentoEffectiveRows(item, 'desktop', initialRows, 20, 20, 20, 310, 20);
  const shrunkRows = resolveBentoEffectiveRows(item, 'desktop', grownRows, 20, 20, 20, 190, 20);

  assert.equal(initialRows, intrinsicHeightToGridRows(180, 20, 20, 20));
  assert.ok(grownRows > initialRows);
  assert.ok(shrunkRows < grownRows);
});

test('intrinsic measurements are isolated by item and breakpoint', () => {
  let sizes: BentoIntrinsicSizes = {};
  sizes = updateBentoIntrinsicSize(sizes, 'composite', 'desktop', 180);
  sizes = updateBentoIntrinsicSize(sizes, 'composite', 'mobile', 310);

  assert.deepEqual(sizes, {
    'composite:desktop': { height: 180 },
    'composite:mobile': { height: 310 }
  });
});

test('stable intrinsic measurements converge without another state write', () => {
  const sizes = { 'composite:mobile': { height: 310 } };
  const unchanged = updateBentoIntrinsicSize(sizes, 'composite', 'mobile', 310.05);

  assert.equal(unchanged, sizes);
});

test('manual height remains user-controlled while intrinsic data is available', () => {
  const manualItem = { id: 'composite', height_mode: 'manual' };
  const rows = resolveBentoEffectiveRows(manualItem, 'mobile', 6, 20, 20, 4, 310);

  assert.equal(rows, 6);
});

test('auto height ignores historical rows once natural content is measured', () => {
  const item = { id: 'composite', height_mode: 'auto' };
  const measuredRows = resolveBentoEffectiveRows(item, 'desktop', 99, 20, 20, 8, 80, 20);

  assert.equal(measuredRows, intrinsicHeightToGridRows(80, 20, 20, 20));
  assert.ok(measuredRows < 99);
});

test('auto height counts card padding and border exactly once', () => {
  const rows = intrinsicHeightToGridRows(100, 20, 20, 34);
  const expectedRows = Math.ceil((100 + 34 + 20) / (20 + 20));

  assert.equal(rows, expectedRows);
  assert.equal(intrinsicHeightToGridRows(100, 20, 20, 68), Math.ceil((100 + 68 + 20) / 40));
});

test('pixel to row conversion never under-allocates the RGL geometry', () => {
  const rowHeight = 20;
  const rowGap = 20;
  const required = 240.1;
  const rows = intrinsicHeightToGridRows(required, rowHeight, rowGap, 0);
  const rendered = rows * rowHeight + (rows - 1) * rowGap;
  assert.ok(rendered >= required);
  assert.equal(intrinsicHeightToGridRows(220, rowHeight, rowGap, 0), 6);
  assert.equal(intrinsicHeightToGridRows(220.1, rowHeight, rowGap, 0), 7);
});

test('grid rows round-trip deterministically and do not oscillate at a boundary', () => {
  for (const rows of [1, 2, 6, 12]) {
    const rendered = rows * 20 + (rows - 1) * 20;
    assert.equal(intrinsicHeightToGridRows(rendered, 20, 20, 0), rows);
  }
});

test('auto height has no derived layout writeback contract', () => {
  const item = { id: 'composite', height_mode: 'auto', layouts: { desktop: { h: 12 } } };
  const nextRows = resolveBentoEffectiveRows(item, 'desktop', item.layouts.desktop.h, 20, 20, 8, 80, 20);

  assert.equal(nextRows, 3);
  assert.equal(item.layouts.desktop.h, 12);
});
