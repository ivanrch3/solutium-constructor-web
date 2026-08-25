import assert from 'node:assert/strict';
import {
  FEATURES_VISUAL_DEFAULTS,
  IMAGE_SIZE_STYLES,
  resolveFeatureImageAspect,
  resolveFeatureImageSize,
  resolveFeatureObjectFit,
  resolveFeatureObjectPosition,
  resolveFeatureNumber
} from '../src/components/constructor/modules/featuresVisualControls';

assert.equal(FEATURES_VISUAL_DEFAULTS.image_size, 'medium');
assert.equal(FEATURES_VISUAL_DEFAULTS.image_aspect, '16:9');
assert.equal(FEATURES_VISUAL_DEFAULTS.icon_size, 24);
assert.equal(FEATURES_VISUAL_DEFAULTS.icon_container_size, 48);
assert.equal(FEATURES_VISUAL_DEFAULTS.media_gap, 24);
assert.equal(FEATURES_VISUAL_DEFAULTS.text_gap, 8);

assert.equal(resolveFeatureImageSize(undefined), 'medium');
assert.equal(resolveFeatureImageSize('not-a-size'), 'medium');
assert.equal(resolveFeatureImageSize('small'), 'small');
assert.equal(resolveFeatureImageAspect('square'), '1 / 1');
assert.equal(resolveFeatureImageAspect('not-an-aspect'), '16 / 9');
assert.equal(resolveFeatureImageAspect('auto'), undefined);
assert.equal(resolveFeatureObjectFit('contain'), 'contain');
assert.equal(resolveFeatureObjectFit(undefined), 'cover');
assert.equal(resolveFeatureObjectPosition('top'), 'top');
assert.equal(resolveFeatureObjectPosition(undefined), 'center');
assert.equal(IMAGE_SIZE_STYLES.small.maxHeight, 120);
assert.equal(IMAGE_SIZE_STYLES.medium.maxHeight, 180);
assert.equal(IMAGE_SIZE_STYLES.large.maxHeight, 260);
assert.equal(resolveFeatureNumber('80', 24, 0, 64), 64);
assert.equal(resolveFeatureNumber(undefined, 24, 0, 64), 24);

console.log('featuresVisualControls tests passed');
