import assert from 'node:assert/strict';
import test from 'node:test';
import {
  intrinsicHeightToGridRows,
  resolveBentoEffectiveRows,
  updateBentoIntrinsicSize,
  type BentoIntrinsicSizes
} from '../src/utils/bentoCore.ts';

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
  const unchanged = updateBentoIntrinsicSize(sizes, 'composite', 'mobile', 310.5);

  assert.equal(unchanged, sizes);
});

test('manual height remains user-controlled while intrinsic data is available', () => {
  const manualItem = { id: 'composite', height_mode: 'manual' };
  const rows = resolveBentoEffectiveRows(manualItem, 'mobile', 6, 20, 20, 4, 310);

  assert.equal(rows, 6);
});
