import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculatePreviewAutoZoom,
  canUsePreviewAutoFocus,
  getCenteredPreviewScroll,
  isCurrentPreviewAutoFocusRequest,
  MAX_AUTO_ZOOM,
  MIN_AUTO_ZOOM,
  PREVIEW_AUTO_ZOOM_STORAGE_KEY,
  readPreviewAutoZoomPreference,
  shouldApplyPreviewAutoZoom,
  writePreviewAutoZoomPreference
} from '../src/utils/previewAutoFocus.ts';

test('auto zoom defaults to enabled and persists an explicit off preference', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => values.set(key, value)
  };
  assert.equal(readPreviewAutoZoomPreference(storage), true);
  writePreviewAutoZoomPreference(false, storage);
  assert.equal(values.get(PREVIEW_AUTO_ZOOM_STORAGE_KEY), 'false');
  assert.equal(readPreviewAutoZoomPreference(storage), false);
});

test('preference persists true and invalid values safely fall back to enabled', () => {
  const values = new Map<string, string>([[PREVIEW_AUTO_ZOOM_STORAGE_KEY, 'not-a-boolean']]);
  const storage = {
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => values.set(key, value)
  };
  assert.equal(readPreviewAutoZoomPreference(storage), true);
  writePreviewAutoZoomPreference(true, storage);
  assert.equal(readPreviewAutoZoomPreference(storage), true);
  assert.equal(readPreviewAutoZoomPreference({ getItem: () => { throw new Error('blocked'); } }), true);
  assert.doesNotThrow(() => writePreviewAutoZoomPreference(false, { setItem: () => { throw new Error('blocked'); } }));
});

test('auto zoom fits large targets and respects safe limits', () => {
  assert.equal(calculatePreviewAutoZoom({
    targetWidth: 1800,
    targetHeight: 1400,
    viewportWidth: 1000,
    viewportHeight: 700,
    currentZoom: 1,
    minZoom: MIN_AUTO_ZOOM,
    maxZoom: MAX_AUTO_ZOOM
  }), MIN_AUTO_ZOOM);
  assert.equal(calculatePreviewAutoZoom({
    targetWidth: 200,
    targetHeight: 160,
    viewportWidth: 1000,
    viewportHeight: 700,
    currentZoom: 1,
    minZoom: MIN_AUTO_ZOOM,
    maxZoom: MAX_AUTO_ZOOM
  }), MAX_AUTO_ZOOM);
});

test('auto zoom uses visual rect dimensions without applying scale twice', () => {
  // Logical target is 800px, current zoom is .75, so the measured DOM rect is 600px.
  assert.equal(calculatePreviewAutoZoom({
    targetWidth: 600,
    targetHeight: 300,
    viewportWidth: 900,
    viewportHeight: 600,
    currentZoom: 0.75,
    minZoom: MIN_AUTO_ZOOM,
    maxZoom: MAX_AUTO_ZOOM,
    padding: 48
  }), 1.01);
});

test('invalid dimensions never produce NaN or Infinity', () => {
  const invalidValues = [0, -1, Number.NaN, Number.POSITIVE_INFINITY];
  for (const value of invalidValues) {
    const result = calculatePreviewAutoZoom({
      targetWidth: value,
      targetHeight: 100,
      viewportWidth: 800,
      viewportHeight: 600,
      currentZoom: 1,
      minZoom: MIN_AUTO_ZOOM,
      maxZoom: MAX_AUTO_ZOOM
    });
    assert.equal(Number.isFinite(result), true);
    assert.equal(result, 1);
  }
  assert.equal(calculatePreviewAutoZoom({ targetWidth: 100, targetHeight: 100, viewportWidth: 0, viewportHeight: 600, currentZoom: 0.9, minZoom: MIN_AUTO_ZOOM, maxZoom: MAX_AUTO_ZOOM }), 0.9);
  assert.equal(calculatePreviewAutoZoom({ targetWidth: 100, targetHeight: 100, viewportWidth: 800, viewportHeight: Number.NaN, currentZoom: 0.9, minZoom: MIN_AUTO_ZOOM, maxZoom: MAX_AUTO_ZOOM }), 0.9);
});

test('resize policy only zooms out during observer tracking and ignores epsilon changes', () => {
  assert.equal(shouldApplyPreviewAutoZoom(0.8, 1, false), true);
  assert.equal(shouldApplyPreviewAutoZoom(1.1, 1, false), false);
  assert.equal(shouldApplyPreviewAutoZoom(1.002, 1, true), false);
  assert.equal(shouldApplyPreviewAutoZoom(1.1, 1, true), true);
});

test('autofocus eligibility is desktop-only and requests invalidate previous targets', () => {
  assert.equal(canUsePreviewAutoFocus(true, 'desktop'), true);
  assert.equal(canUsePreviewAutoFocus(true, 'tablet'), false);
  assert.equal(canUsePreviewAutoFocus(true, 'mobile'), false);
  assert.equal(canUsePreviewAutoFocus(false, 'desktop'), false);
  assert.equal(isCurrentPreviewAutoFocusRequest('b', 'b'), true);
  assert.equal(isCurrentPreviewAutoFocusRequest('a', 'b'), false);
});

test('centered scroll uses target and viewport coordinates', () => {
  assert.deepEqual(getCenteredPreviewScroll({
    scrollLeft: 100,
    scrollTop: 50,
    clientWidth: 800,
    clientHeight: 600,
    viewportLeft: 20,
    viewportTop: 30,
    targetLeft: 420,
    targetTop: 330,
    targetWidth: 200,
    targetHeight: 100
  }), { left: 200, top: 100 });
});

test('centered scroll clamps invalid or negative positions', () => {
  assert.deepEqual(getCenteredPreviewScroll({
    scrollLeft: Number.NaN,
    scrollTop: -100,
    clientWidth: 800,
    clientHeight: 600,
    viewportLeft: 20,
    viewportTop: 30,
    targetLeft: 0,
    targetTop: 0,
    targetWidth: 10,
    targetHeight: 10
  }), { left: 0, top: 0 });
});
