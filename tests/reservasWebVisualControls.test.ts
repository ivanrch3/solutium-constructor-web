import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReservasWebPreview } from '../src/components/constructor/modules/ReservasWebPreview';
import { createDefaultReservasWebConfig, normalizeReservasWebConfig, setReservasWebActivityIds } from '../src/components/constructor/modules/reservasWebConfig';
import type { ReservasWebActivitySummary } from '../src/types/reservasWeb';

const activity: ReservasWebActivitySummary = { id: 'activity-a', catalogItemId: 'catalog-a', catalogItemName: 'Catálogo', catalogItemImageUrl: null, title: 'Actividad', shortDescription: null, facilitator: null, modality: 'Virtual', status: 'active', timezone: null, sessionsSummary: { count: 1, firstStartsAt: null, firstEndsAt: null }, totalCapacity: 10, isFree: false, regularPrice: 25, promotionalPrice: null, promotionEndsAt: null, currency: 'USD', selectedWhatsAppChannelId: null, whatsappReadiness: 'ready' };
const render = (config: ReturnType<typeof createDefaultReservasWebConfig>) => renderToStaticMarkup(React.createElement(ReservasWebPreview, { moduleId: 'module-a', config, reservasWebActivities: [activity] }));

test('Reservas Web display controls remain instance-isolated while preview inherits the site theme', () => {
  const defaults = createDefaultReservasWebConfig();
  const selected = setReservasWebActivityIds(defaults, ['activity-a']);
  const moduleA = normalizeReservasWebConfig({ ...selected, display: { ...selected.display, showPrice: false, showTotalCapacity: true, showAvailableCapacity: true, showCountdown: false }, content: { reserveButtonLabel: 'Inscribirme' }, style: { surfaceColor: '#123456', borderColor: '#654321', borderRadius: 8, padding: 28, ctaBackgroundColor: '#111111', ctaTextColor: '#eeeeee' } });
  const moduleB = normalizeReservasWebConfig({ ...selected, content: { reserveButtonLabel: 'Reservar' } });
  const partial = normalizeReservasWebConfig({ activities: { activityIds: ['activity-a'] }, content: { reserveButtonLabel: '' }, style: { borderRadius: 90 } });
  const markup = render(moduleA);
  const settingsSource = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebSettings.tsx', import.meta.url), 'utf8');
  const previewSource = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebPreview.tsx', import.meta.url), 'utf8');

  assert.equal(defaults.display.showPrice, true);
  assert.doesNotMatch(markup, /Precio/);
  assert.match(markup, /Capacidad total: 10/);
  assert.match(markup, /Disponibilidad en tiempo real/);
  assert.doesNotMatch(markup, /Vista previa de cuenta regresiva/);
  assert.equal(defaults.content.reserveButtonLabel, 'Reservar');
  assert.match(markup, /Inscribirme/);
  assert.equal(partial.content.reserveButtonLabel, 'Reservar');
  assert.deepEqual(defaults.style, { surfaceColor: '', borderColor: '', borderRadius: 16, padding: 20, ctaBackgroundColor: '', ctaTextColor: '' });
  assert.doesNotMatch(markup, /#123456|#111111|rgb\(18, 52, 86\)|rgb\(17, 17, 17\)/);
  assert.equal(partial.style.borderRadius, 32);
  assert.deepEqual(partial.activities.activityIds, ['activity-a']);
  assert.equal(moduleA.display.showPrice, false);
  assert.equal(moduleB.display.showPrice, true);
  assert.equal(moduleA.content.reserveButtonLabel, 'Inscribirme');
  assert.equal(moduleB.content.reserveButtonLabel, 'Reservar');
  assert.doesNotMatch(JSON.stringify(moduleA), /reservasWebActivities|catalogItem|sessionsSummary|whatsappReadiness|privateVirtualUrl|customerId/i);
  assert.doesNotMatch(settingsSource, /fetch\(|POST|privateVirtualUrl|contactWhatsapp|identification|birthDate/);
  assert.doesNotMatch(previewSource, /fetch\(|POST|privateVirtualUrl|contactWhatsapp|identification|birthDate/);
  assert.doesNotMatch(previewSource, /style=\{\{/);
});
