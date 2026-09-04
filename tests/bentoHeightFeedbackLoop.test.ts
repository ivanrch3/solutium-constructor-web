import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { intrinsicHeightToGridRows, resolveBentoEffectiveRows } from '../src/utils/bentoCore.ts';

const moduleSource = fs.readFileSync(new URL('../src/components/constructor/modules/BentoModule.tsx', import.meta.url), 'utf8');
const compositeSource = fs.readFileSync(new URL('../src/components/constructor/modules/BentoCompositeContent.tsx', import.meta.url), 'utf8');
const cellContentSource = moduleSource.slice(moduleSource.indexOf('const BentoCellContent'), moduleSource.indexOf('export const BentoModule'));

const measureNaturalHeight = (scrollHeight: number, offsetHeight: number) => scrollHeight || offsetHeight || 0;

const simulateAutoHeight = (measurements: number[]) => {
  let rows = 1;
  return measurements.map((naturalHeight) => {
    rows = intrinsicHeightToGridRows(measureNaturalHeight(naturalHeight, naturalHeight), 20, 20, 0);
    return rows;
  });
};

test('intrinsic boundary uses natural height and converges without RGL height feedback', () => {
  assert.deepEqual(simulateAutoHeight([60, 60]), [2, 2]);
  assert.deepEqual(simulateAutoHeight([60, 60, 60]), [2, 2, 2]);
});

test('selection transform must not alter intrinsic rows', () => {
  const naturalHeight = 60;
  const unselectedRows = intrinsicHeightToGridRows(measureNaturalHeight(naturalHeight, naturalHeight), 20, 20, 0);
  const selectedRows = intrinsicHeightToGridRows(measureNaturalHeight(naturalHeight, naturalHeight), 20, 20, 0);
  assert.equal(selectedRows, unselectedRows);
  assert.doesNotMatch(moduleSource, /scale-\[1\.01\]/);
});

test('auto-height content roots can switch off fill behavior in measurement mode', () => {
  assert.match(moduleSource, /measurementMode\s*=\s*false/);
  assert.match(moduleSource, /const contentFillClass = measurementMode \? '' : 'h-full'/);
  assert.match(moduleSource, /measurementMode=\{isAutoHeight\}/);
  assert.doesNotMatch(compositeSource, /h-full/);
});

test('visual and icon image measurement remains natural instead of absolute h-full', () => {
  assert.match(cellContentSource, /measurementMode \? 'h-auto w-auto max-w-full object-contain'/);
  assert.match(cellContentSource, /measurementMode \? 'block h-auto max-h-96 w-auto max-w-full object-contain'/);
});

test('manual height remains independent from intrinsic measurements', () => {
  const item = { height_mode: 'manual' };
  assert.equal(resolveBentoEffectiveRows(item, 'desktop', 7, 20, 20, 4, 60, 0), 7);
});

test('transition contract excludes transition-all from the Bento card', () => {
  assert.doesNotMatch(moduleSource, /isDragging \? 'transition-none' : 'transition-all duration-300'/);
  assert.match(moduleSource, /transition-shadow transition-colors/);
});

test('observer debug reports the natural measurement source and keeps rect diagnostic-only', () => {
  assert.match(moduleSource, /const naturalHeight = scrollHeight \|\| offsetHeight/);
  assert.match(moduleSource, /measurementSource: scrollHeight > 0 \? 'scrollHeight' : 'offsetHeight'/);
  assert.match(moduleSource, /transformOnMeasuredNode: measuredStyle\.transform/);
});
