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
  assert.match(component, /el_special_event_details/);
  assert.match(component, /el_special_event_upload/);
  assert.match(component, /specialEventApi\.uploadPhotos/);
  assert.match(component, /specialEventApi\.getPhotos/);
});
