import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReservasWebActivitySummary } from '../src/types/reservasWeb';
import {
  formatReservasWebPrice,
  formatReservasWebSessionSummary,
  getReservasWebActivityReadinessMessage,
  getReservasWebWhatsAppReadinessMessage,
  ReservasWebSettings
} from '../src/components/constructor/modules/ReservasWebSettings';
import {
  createDefaultReservasWebConfig,
  getReservasWebConfigSettingKey,
  setReservasWebActivityIds
} from '../src/components/constructor/modules/reservasWebConfig';

const activity = (id: string, readiness: ReservasWebActivitySummary['whatsappReadiness'] = 'ready'): ReservasWebActivitySummary => ({
  id,
  catalogItemId: `catalog-${id}`,
  catalogItemName: `Catálogo ${id}`,
  catalogItemImageUrl: null,
  title: `Actividad ${id}`,
  shortDescription: null,
  facilitator: 'Facilitador',
  modality: 'Presencial',
  status: 'active',
  timezone: 'America/Costa_Rica',
  sessionsSummary: { count: 1, firstStartsAt: '2026-08-20T14:00:00.000Z', firstEndsAt: '2026-08-20T15:00:00.000Z' },
  totalCapacity: 12,
  isFree: false,
  regularPrice: 50,
  promotionalPrice: 40,
  promotionEndsAt: null,
  currency: 'USD',
  selectedWhatsAppChannelId: 'channel-1',
  whatsappReadiness: readiness
});

test('Reservas Web settings only persists one selected activity id and safely summarizes secure context', () => {
  const activityA = activity('A');
  const activityB = activity('B');
  const initial = createDefaultReservasWebConfig();
  const selectedA = setReservasWebActivityIds(initial, [activityA.id]);
  const selectedB = setReservasWebActivityIds(selectedA, [activityB.id]);
  const cleared = setReservasWebActivityIds(selectedB, []);
  const missing = setReservasWebActivityIds(initial, ['missing']);
  const instanceAKey = getReservasWebConfigSettingKey('module-a');
  const instanceBKey = getReservasWebConfigSettingKey('module-b');
  const secureContextSource = fs.readFileSync(new URL('../src/services/secureLaunchSession.ts', import.meta.url), 'utf8');
  const settingsSource = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebSettings.tsx', import.meta.url), 'utf8');

  assert.deepEqual(selectedA.activities.activityIds, ['A']);
  assert.deepEqual(selectedB.activities.activityIds, ['B']);
  assert.deepEqual(cleared.activities.activityIds, []);
  assert.deepEqual(missing.activities.activityIds, ['missing']);
  assert.notEqual(instanceAKey, instanceBKey);
  assert.equal(getReservasWebWhatsAppReadinessMessage('ready'), 'Canal Genius listo');
  assert.match(getReservasWebActivityReadinessMessage({ ...activityA, status: 'archived' }), /archivada/);
  assert.match(getReservasWebWhatsAppReadinessMessage('unavailable'), /conexión Genius activa/);
  assert.match(getReservasWebWhatsAppReadinessMessage('selection_required'), /varias conexiones Genius/);
  assert.match(getReservasWebWhatsAppReadinessMessage('invalid_selection'), /ya no está disponible/);
  assert.match(formatReservasWebSessionSummary(activityA), /2026|ago|20/i);
  assert.match(formatReservasWebSessionSummary({ ...activityA, sessionsSummary: { count: 1, firstStartsAt: '2026-08-17T17:00:00.000Z', firstEndsAt: null }, timezone: 'America/Costa_Rica' }), /11:00|11\.00/);
  assert.match(formatReservasWebPrice(activityA), /40/);
  const selectedMarkup = renderToStaticMarkup(React.createElement(ReservasWebSettings, {
    moduleId: 'module-a', settingsValues: { [instanceAKey]: selectedA }, reservasWebActivities: [activityA], onSettingChange: () => {}
  }));
  assert.match(selectedMarkup, /Catálogo A/);assert.match(selectedMarkup, /Editar actividad/);assert.match(selectedMarkup, /Archivar/);assert.doesNotMatch(selectedMarkup, /Cambiar actividad|Visualización|Texto del CTA|Guardar actividad|Cerrar/);
  assert.match(renderToStaticMarkup(React.createElement(ReservasWebSettings, {
    moduleId: 'module-a', settingsValues: { [instanceAKey]: missing }, reservasWebActivities: [], onSettingChange: () => {}
  })), /La actividad seleccionada ya no está disponible/);
  const emptyMarkup = renderToStaticMarkup(React.createElement(ReservasWebSettings, {
    moduleId: 'module-a', settingsValues: {}, reservasWebActivities: undefined, onSettingChange: () => {}
  }));
  assert.match(emptyMarkup, /No hay actividades configuradas para Reservas Web/);
  assert.doesNotMatch(emptyMarkup, /Visualización|Texto del CTA/);
  assert.match(renderToStaticMarkup(React.createElement(ReservasWebSettings, {
    moduleId: 'module-a', settingsValues: { [instanceAKey]: selectedA }, reservasWebActivities: [{ ...activityA, status: 'archived' }], onSettingChange: () => {}
  })), /Archivada/);
  assert.doesNotMatch(renderToStaticMarkup(React.createElement(ReservasWebSettings, {
    moduleId: 'module-a', settingsValues: {}, reservasWebActivities: [{ ...activityA, status: 'archived' }], onSettingChange: () => {}
  })), /Actividad A/);
  assert.match(secureContextSource, /reservasWebActivities: Array\.isArray\(result\.reservasWebActivities\) \? result\.reservasWebActivities : \[\]/);
  assert.match(secureContextSource, /reservasWebEligibleWhatsAppChannels: Array\.isArray\(result\.reservasWebEligibleWhatsAppChannels\) \? result\.reservasWebEligibleWhatsAppChannels : \[\]/);
  assert.doesNotMatch(JSON.stringify(selectedA), /catalogItem|sessionsSummary|whatsappReadiness|privateVirtualUrl|customerId/i);
  assert.equal('eligibleWhatsAppChannels' in selectedA, false);
  assert.equal('selectedWhatsappChannelId' in selectedA, false);
  assert.equal('phoneNumber' in selectedA, false);
  assert.equal('readiness' in selectedA, false);
  assert.equal('archivedAt' in selectedA, false);
  assert.doesNotMatch(settingsSource, /fetch\(|privateVirtualUrl|contactWhatsapp|identification|birthDate/i);
  assert.ok(settingsSource.indexOf('Selecciona una actividad') < settingsSource.indexOf('Crear actividad'));
  assert.match(settingsSource, /selectedActivity && !form/);
  assert.match(settingsSource, /archiveConfirmationInitiallyOpen/);
  assert.match(settingsSource, /flex flex-wrap gap-2/);
  assert.match(fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebActivityForm.tsx', import.meta.url), 'utf8'), /grid grid-cols-1 gap-2.*sm:grid-cols-3/);
  assert.doesNotMatch(settingsSource, />Cambiar actividad</);
  assert.doesNotMatch(settingsSource, /Crear actividad<\/button><button[^>]*>\{loadingDetail/);
  assert.match(settingsSource,/display=\{config\.display\}/);assert.match(settingsSource,/onReserveButtonLabelChange/);
  assert.doesNotMatch(settingsSource, /Color de fondo|Color de borde|Color CTA|Radio del borde|Espaciado interno/);
});
