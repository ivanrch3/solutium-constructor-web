import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source() {
  return readFile(new URL('../src/components/constructor/modules/SpecialEventModule.tsx', import.meta.url), 'utf8');
}

test('public special-event cover is transparent, compact on mobile, and height-led from the desktop breakpoint', async () => {
  const component = await source();
  assert.match(component, /style=\{\{ background: 'transparent', color: text \}\}/);
  assert.match(component, /special-event-hero-media/);
  assert.match(component, /object-contain object-center/);
  assert.match(component, /min-h-\[180px\][\s\S]*sm:min-h-\[360px\]/);
  assert.match(component, /h-auto max-h-\[55svh\] w-full/);
  assert.match(component, /md:h-\[clamp\(26rem,62vh,44rem\)\] md:max-w-full md:w-auto/);
});

test('public special-event details are intentionally not rendered while their settings remain intact', async () => {
  const component = await source();
  assert.match(component, /const renderPublicEventDetails = false/);
  assert.match(component, /\{renderPublicEventDetails && <div/);
  assert.equal(component.includes('el_special_event_details'), false);
  assert.match(component, /el_special_event_upload/);
  assert.match(component, /specialEventApi\.uploadPhotos/);
  assert.match(component, /specialEventApi\.getPhotos/);
});

test('continuous carousel uses duplicated rendering, measured distance, and animation controls', async () => {
  const component = await source();
  assert.match(component, /carouselMode[\s\S]*'manual'/);
  assert.match(component, /carouselSpeed[\s\S]*4/);
  assert.match(component, /new ResizeObserver\(measure\)/);
  assert.match(component, /cycleWidth \/ speedToPixelsPerSecond\(speed\)/);
  assert.match(component, /renderedImages\('first'\)[\s\S]*renderedImages\('second'\)/);
  assert.match(component, /onPointerEnter[\s\S]*onPointerDown[\s\S]*onPointerUp/);
  assert.match(component, /prefers-reduced-motion: reduce/);
  assert.match(component, /if \(!manual \|\| !autoplay \|\| images\.length < 2\) return/);
  assert.match(component, /const manual = mode !== 'continuous' \|\| reducedMotion/);
});

test('carousel CSS scopes continuous animation and prevents horizontal overflow', async () => {
  const css = await readFile(new URL('../src/components/constructor/modules/SpecialEventModule.css', import.meta.url), 'utf8');
  assert.match(css, /\.special-event-module \{ overflow-x: clip/);
  assert.match(css, /animation: special-event-train/);
  assert.match(css, /animation-play-state: paused/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('lightbox zoom and pan are local and reset before closing', async () => {
  const component = await source();
  const css = await readFile(new URL('../src/components/constructor/modules/SpecialEventModule.css', import.meta.url), 'utf8');
  assert.match(component, /resetSpecialEventLightboxGesture[\s\S]*scale: 1[\s\S]*translateX: 0[\s\S]*translateY: 0/);
  assert.match(component, /const close = \(\) => \{ resetGesture\(\); onClose\(\); \}/);
  assert.match(css, /\.special-event-lightbox-gesture[\s\S]*touch-action: none/);
  assert.match(component, /document\.body\.style\.overflow = previousOverflow/);
  assert.doesNotMatch(component, /document\.(documentElement|body)\.style\.zoom/);
  assert.doesNotMatch(component, /meta.*viewport/);
});
