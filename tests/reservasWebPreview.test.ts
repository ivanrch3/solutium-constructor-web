import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReservasWebActivitySummary } from '../src/types/reservasWeb';
import { ReservasWebPreview } from '../src/components/constructor/modules/ReservasWebPreview';
import { createDefaultReservasWebConfig, setReservasWebActivityIds } from '../src/components/constructor/modules/reservasWebConfig';

const createActivity = (overrides: Partial<ReservasWebActivitySummary> = {}): ReservasWebActivitySummary => ({
  id: 'activity-a', catalogItemId: 'catalog-a', catalogItemName: 'Curso base', catalogItemImageUrl: 'https://example.test/image.jpg', title: 'Actividad A', shortDescription: 'Descripción corta', facilitator: 'Ana', modality: 'Virtual', status: 'active', timezone: 'America/Costa_Rica', sessionsSummary: { count: 2, firstStartsAt: '2026-08-20T14:00:00.000Z', firstEndsAt: '2026-08-20T15:00:00.000Z' }, totalCapacity: 20, isFree: false, regularPrice: 100, promotionalPrice: 75, promotionEndsAt: '2099-08-20T00:00:00.000Z', currency: 'USD', selectedWhatsAppChannelId: 'channel-a', whatsappReadiness: 'ready', ...overrides
});

const render = (config = createDefaultReservasWebConfig(), activities: ReservasWebActivitySummary[] = []) =>
  renderToStaticMarkup(React.createElement(ReservasWebPreview, { moduleId: 'module-a', config, reservasWebActivities: activities }));

test('Reservas Web preview is structural, isolated, and does not mutate configuration', () => {
  const activity = createActivity();
  const selected = setReservasWebActivityIds(createDefaultReservasWebConfig(), [activity.id]);
  const before = JSON.stringify(selected);
  const selectedMarkup = render(selected, [activity]);
  const noPrice = render({ ...selected, display: { ...selected.display, showPrice: false } }, [activity]);
  const noCapacity = render({ ...selected, display: { ...selected.display, showTotalCapacity: false, showAvailableCapacity: false } }, [activity]);
  const noCountdown = render({ ...selected, display: { ...selected.display, showCountdown: false } }, [activity]);
  const customCta = render({ ...selected, content: { reserveButtonLabel: 'Apartar cupo' } }, [activity]);
  const source = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebPreview.tsx', import.meta.url), 'utf8');

  assert.match(render(), /Selecciona una actividad para configurar Reservas Web/);
  assert.match(selectedMarkup, /Actividad A/);
  assert.match(render(selected, [createActivity({ title: '', catalogItemName: 'Nombre catálogo' })]), /Nombre catálogo/);
  assert.match(selectedMarkup, /https:\/\/example\.test\/image\.jpg/);
  assert.match(selectedMarkup, /Descripción corta/);
  assert.match(selectedMarkup, /Ana/);
  assert.match(selectedMarkup, /Virtual/);
  assert.match(selectedMarkup, /Varias sesiones \(2\)/);
  assert.match(render(selected, [createActivity({ isFree: true, promotionalPrice: null })]), /Gratis/);
  assert.match(selectedMarkup, /100/);
  assert.doesNotMatch(noPrice, /Precio/);
  assert.doesNotMatch(noCapacity, /Capacidad total|Disponibilidad en tiempo real/);
  assert.doesNotMatch(noCountdown, /Vista previa de cuenta regresiva/);
  assert.match(customCta, /Apartar cupo/);
  assert.doesNotMatch(selectedMarkup, /No disponible para reservas/);
  for (const readiness of ['unavailable', 'selection_required', 'invalid_selection'] as const) assert.match(render(selected, [createActivity({ whatsappReadiness: readiness })]), /No disponible para reservas/);
  assert.match(render(selected, [createActivity({ status: 'archived', whatsappReadiness: 'ready' })]), /No disponible para reservas/);
  assert.match(render(setReservasWebActivityIds(createDefaultReservasWebConfig(), ['missing']), []), /La actividad seleccionada ya no está disponible/);
  assert.doesNotMatch(source, /fetch\(|POST|privateVirtualUrl|contactWhatsapp|identification|birthDate/);
  assert.equal(JSON.stringify(selected), before);
  assert.match(render(setReservasWebActivityIds(createDefaultReservasWebConfig(), ['activity-b']), [createActivity({ id: 'activity-b', title: 'Actividad B' })]), /Actividad B/);
});
