import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source() {
  return readFile(new URL('../src/components/constructor/modules/SpecialEventModule.tsx', import.meta.url), 'utf8');
}

test('public special-event cover is transparent and height-led from the desktop breakpoint', async () => {
  const component = await source();
  assert.match(component, /style=\{\{ background: 'transparent', color: text \}\}/);
  assert.match(component, /style=\{\{ background: 'transparent' \}\}/);
  assert.match(component, /object-contain object-center/);
  assert.match(component, /h-auto max-h-\[72svh\] w-full/);
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

test('mobile cover spacing and carousel width-fit rules remain scoped to the special-event media', async () => {
  const css = await readFile(new URL('../src/components/constructor/modules/SpecialEventModule.css', import.meta.url), 'utf8');
  assert.match(css, /img\[alt="Historia del evento"\][\s\S]*width: 100% !important[\s\S]*height: auto !important/);
  assert.match(css, /@media \(max-width: 767px\)/);
  assert.match(css, /padding-top: 0.5rem/);
  assert.match(css, /margin-top: 0.75rem/);
});
