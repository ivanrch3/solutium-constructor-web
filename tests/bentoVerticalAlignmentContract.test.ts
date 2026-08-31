import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/components/constructor/modules/BentoModule.tsx', import.meta.url), 'utf8');

test('RGL wrapper and card establish the full-height positioning chain', () => {
  assert.match(source, /className=\{`relative h-full /);
  assert.match(source, /className=\{`w-full h-full group flex flex-col/);
  assert.match(source, /data-bento-card="true"/);
  assert.match(source, /data-bento-positioning-area="true"/);
  assert.match(source, /flex-1 flex-col \$\{alignClass\}/);
});

test('intrinsic measurement target remains natural-height and is nested in positioning area', () => {
  const areaStart = source.indexOf('data-bento-positioning-area="true"');
  const measurementStart = source.lastIndexOf('data-bento-intrinsic-content');
  assert.ok(areaStart >= 0 && measurementStart > areaStart);
  const measurementWindow = source.slice(measurementStart, measurementStart + 260);
  assert.match(measurementWindow, /className="block w-full min-w-0 max-w-full shrink-0"/);
  assert.doesNotMatch(measurementWindow, /h-full|min-h-full|flex-1/);
});

test('vertical alignment maps to flex justify-content on the positioning area', () => {
  assert.match(source, /start: 'justify-start'/);
  assert.match(source, /center: 'justify-center'/);
  assert.match(source, /end: 'justify-end'/);
  assert.match(source, /data-bento-positioning-area="true"/);
});

test('only intrinsic content is observed and auto-height remains read-only', () => {
  assert.match(source, /querySelectorAll<HTMLElement>\('\[data-bento-intrinsic-content\]'\)/);
  assert.match(source, /observer\.observe\(target\)/);
  assert.doesNotMatch(source, /onSettingChange\([^;]+(?:height|rows|layout)/);
  assert.match(source, /Math\.max\(rectHeight, element\.scrollHeight \|\| 0\)/);
  assert.match(source, /BENTO_HEIGHT_MEASUREMENT/);
  assert.match(source, /BENTO_RUNTIME_LAYOUT/);
  assert.match(source, /OVERLAP_COUNT/);
  assert.match(source, /reason: intrinsicMeasurementReasonRef\.current/);
});

test('responsive width controls remain unchanged', () => {
  assert.match(source, /desktop_span/);
  assert.match(source, /tablet_span/);
  assert.match(source, /mobile_span/);
});
