import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const panel = fs.readFileSync(new URL('../src/components/constructor/GlobalSettingsPanel.tsx', import.meta.url), 'utf8');
const constructor = fs.readFileSync(new URL('../src/components/constructor/WebConstructor.tsx', import.meta.url), 'utf8');

test('conversion UI exposes Pixel status, automatic PageView and four configurable events', () => {
  assert.match(panel, /Pixel de Meta/);
  assert.match(panel, /PageView siempre se registra/);
  for (const label of ['Lead', 'Contact', 'CompleteRegistration', 'ViewContent']) assert.match(panel, new RegExp(label));
  assert.match(panel, /No se registra tráfico dentro del Constructor/);
  assert.match(panel, /Solutium, App Solutium y Solutium Go utilizan Pixels administrados a nivel de plataforma/);
});

test('event settings persist through the rendering contract and remain safe for legacy sites', () => {
  for (const key of ['metaPixelTrackLead', 'metaPixelTrackContact', 'metaPixelTrackCompleteRegistration', 'metaPixelTrackViewContent']) {
    assert.match(constructor, new RegExp(key));
  }
  for (const key of ['meta_pixel_track_lead', 'meta_pixel_track_contact', 'meta_pixel_track_complete_registration', 'meta_pixel_track_view_content']) {
    assert.match(constructor, new RegExp(key));
  }
  assert.match(constructor, /activeTheme\?\.metaPixelTrackViewContent \?\? false/);
});
