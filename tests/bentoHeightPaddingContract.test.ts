import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { intrinsicHeightToGridRows, resolveBentoEffectiveRows, resolveBentoPadding } from '../src/utils/bentoCore.ts';

const moduleSource = fs.readFileSync(new URL('../src/components/constructor/modules/BentoModule.tsx', import.meta.url), 'utf8');
const compositeSource = fs.readFileSync(new URL('../src/components/constructor/modules/BentoCompositeContent.tsx', import.meta.url), 'utf8');
const editorSource = fs.readFileSync(new URL('../src/components/constructor/BentoCellEditor.tsx', import.meta.url), 'utf8');

test('auto mode ignores vertical alignment for runtime positioning', () => {
  assert.match(moduleSource, /const isAutoHeight = resolveBentoHeightMode\(item\) === 'auto'/);
  assert.match(moduleSource, /const resolvedVerticalAlign = isAutoHeight \? 'start'/);
});

test('manual mode keeps top, center and bottom alignment available', () => {
  assert.match(moduleSource, /start: 'justify-start'/);
  assert.match(moduleSource, /center: 'justify-center'/);
  assert.match(moduleSource, /end: 'justify-end'/);
  assert.match(editorSource, /Disponible con altura manual/);
});

test('auto rows use intrinsic content plus vertical padding, never horizontal padding', () => {
  const item = { type: 'text', height_mode: 'auto', padding: 12, horizontal_padding: 80, vertical_padding: 6 };
  const rows = resolveBentoEffectiveRows(item, 'desktop', 99, 20, 20, 8, 100, resolveBentoPadding(item).top + resolveBentoPadding(item).bottom);
  assert.equal(rows, intrinsicHeightToGridRows(100, 20, 20, 12));
});

test('auto measurement contains image content and observes only intrinsic wrappers', () => {
  assert.match(moduleSource, /data-bento-intrinsic-content=/);
  assert.match(moduleSource, /querySelectorAll<HTMLElement>\('\[data-bento-intrinsic-content\]'\)/);
  assert.match(compositeSource, /className="block h-auto max-h-48 w-auto max-w-full object-contain"/);
});

test('auto height has grow, shrink and no historical max behavior', () => {
  const item = { type: 'composite', height_mode: 'auto', padding: 16 };
  const small = resolveBentoEffectiveRows(item, 'desktop', 40, 20, 20, 8, 80, 32);
  const large = resolveBentoEffectiveRows(item, 'desktop', small, 20, 20, 8, 360, 32);
  const shrunk = resolveBentoEffectiveRows(item, 'desktop', large, 20, 20, 8, 80, 32);
  assert.ok(large > small);
  assert.ok(shrunk < large);
  assert.equal(item.height_mode, 'auto');
  assert.doesNotMatch(moduleSource, /onSettingChange\([^;]+(?:height|rows|layout)/);
});

test('padding controls are explicit and responsive width controls remain present', () => {
  assert.match(editorSource, /horizontal_padding/);
  assert.match(editorSource, /vertical_padding/);
  assert.match(editorSource, /desktop_span/);
  assert.match(editorSource, /tablet_span/);
  assert.match(editorSource, /mobile_span/);
});
