import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeVideoContentMediaGap } from '../src/components/constructor/modules/VideoModule.tsx';
import { VIDEO_MODULE } from '../src/components/constructor/registry.tsx';

test('uses the current 40px spacing when content_media_gap is absent', () => {
  assert.equal(normalizeVideoContentMediaGap(undefined), 40);
  assert.equal(normalizeVideoContentMediaGap(null), 40);
});

test('accepts zero and configured intermediate spacing values', () => {
  assert.equal(normalizeVideoContentMediaGap(0), 0);
  assert.equal(normalizeVideoContentMediaGap(24), 24);
  assert.equal(normalizeVideoContentMediaGap('32'), 32);
});

test('clamps invalid gap values to the safe range', () => {
  assert.equal(normalizeVideoContentMediaGap(-12), 0);
  assert.equal(normalizeVideoContentMediaGap(96), 80);
  assert.equal(normalizeVideoContentMediaGap('invalid'), 40);
});

test('registers the global range with the expected persistence contract', () => {
  const setting = VIDEO_MODULE.globalSettings?.estilo?.find((item) => item.id === 'content_media_gap');

  assert.equal(setting?.type, 'range');
  assert.equal(setting?.defaultValue, 40);
  assert.equal(setting?.min, 0);
  assert.equal(setting?.max, 80);
  assert.equal(setting?.step, 4);
  assert.equal(setting?.unit, 'px');
});
