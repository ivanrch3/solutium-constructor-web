import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type { RenderingContract } from '../src/types/schema';
import type { ReservasWebActivitySummary } from '../src/types/reservasWeb';
import { createDefaultReservasWebConfig, setReservasWebActivityIds } from '../src/components/constructor/modules/reservasWebConfig';
import {
  ReservasWebPublicationValidationError,
  serializeReservasWebContractForPublication,
  serializeReservasWebForPublication
} from '../src/components/constructor/modules/reservasWebPublishedContract';

const activity = (id: string, publicIdentifier: string | null = `public-${id}`): ReservasWebActivitySummary => ({
  id,
  publicIdentifier,
  catalogItemId: `catalog-${id}`,
  catalogItemName: `Cat\u00e1logo ${id}`,
  catalogItemImageUrl: 'https://example.test/image.jpg',
  title: `Actividad ${id}`,
  shortDescription: 'Resumen administrativo',
  facilitator: 'Facilitador',
  modality: 'Virtual',
  status: 'active',
  timezone: 'America/Costa_Rica',
  sessionsSummary: { count: 1, firstStartsAt: '2026-08-20T14:00:00.000Z', firstEndsAt: '2026-08-20T15:00:00.000Z' },
  totalCapacity: 10,
  isFree: false,
  regularPrice: 100,
  promotionalPrice: 80,
  promotionEndsAt: null,
  currency: 'USD',
  selectedWhatsAppChannelId: 'admin-channel',
  whatsappReadiness: 'ready'
});

const contractWith = (config: unknown): RenderingContract => ({
  theme: { primaryColor: '#000000', fontFamily: 'Inter' },
  sections: [
    { id: 'other', type: 'hero', tipo: 'hero', content: { title: 'Sin cambios' }, settings: { keep: true } },
    { id: 'reservas-a', type: 'reservas_web', tipo: 'reservas_web', content: {}, settings: { el_reservas_web_config: config } }
  ]
});

test('serializes administrative activity IDs into opaque public identifiers without mutating inputs', () => {
  const config = {
    ...setReservasWebActivityIds(createDefaultReservasWebConfig(), ['uuid-a', 'uuid-b']),
    display: { showPrice: false, showTotalCapacity: true, showAvailableCapacity: true, showCountdown: false },
    content: { reserveButtonLabel: 'Apartar cupo' },
    style: { surfaceColor: '#fff', borderColor: '#ddd', borderRadius: 8, padding: 24, ctaBackgroundColor: '#111', ctaTextColor: '#eee' }
  };
  const activities = [activity('uuid-a', 'public-A'), activity('uuid-b', 'public-B')];
  const configBefore = JSON.stringify(config);
  const activitiesBefore = JSON.stringify(activities);

  const snapshot = serializeReservasWebForPublication(config, activities);

  assert.deepEqual(snapshot.activities.publicActivityIdentifiers, ['public-A', 'public-B']);
  assert.deepEqual(snapshot.display, config.display);
  assert.deepEqual(snapshot.content, config.content);
  assert.deepEqual(snapshot.style, config.style);
  assert.equal('activityIds' in snapshot.activities, false);
  assert.equal(JSON.stringify(snapshot).includes('uuid-a'), false);
  for (const forbidden of ['catalogItemId', 'selectedWhatsAppChannelId', 'whatsappReadiness', 'privateVirtualUrl', 'sinpe', 'onvopay', 'contactWhatsapp', 'hash']) {
    assert.equal(JSON.stringify(snapshot).toLowerCase().includes(forbidden.toLowerCase()), false);
  }
  assert.equal(JSON.stringify(config), configBefore);
  assert.equal(JSON.stringify(activities), activitiesBefore);
});

test('publication preserves both canonical capacity display flags in either state', () => {
  const selected = setReservasWebActivityIds(createDefaultReservasWebConfig(), ['uuid-a']);
  const cases = [
    { key: 'showTotalCapacity' as const, value: true },
    { key: 'showTotalCapacity' as const, value: false },
    { key: 'showAvailableCapacity' as const, value: true },
    { key: 'showAvailableCapacity' as const, value: false }
  ];

  for (const { key, value } of cases) {
    const config = { ...selected, display: { ...selected.display, [key]: value } };
    const snapshot = serializeReservasWebForPublication(config, [activity('uuid-a', 'public-A')]);
    assert.equal(snapshot.display[key], value);
  }
});

test('rejects incomplete or archived public publication states without falling back to internal IDs', () => {
  const selected = setReservasWebActivityIds(createDefaultReservasWebConfig(), ['uuid-a']);
  const cases: Array<{ config: unknown; activities: ReservasWebActivitySummary[]; message: RegExp }> = [
    { config: createDefaultReservasWebConfig(), activities: [], message: /Selecciona una actividad/ },
    { config: selected, activities: [], message: /ya no est\u00e1 disponible/ },
    { config: selected, activities: [activity('uuid-a', null)], message: /referencia p\u00fablica v\u00e1lida/ },
    { config: selected, activities: [activity('uuid-a', '   ')], message: /referencia p\u00fablica v\u00e1lida/ },
    { config: selected, activities: [{ ...activity('uuid-a'), status: 'archived' }], message: /archivada/ }
  ];

  for (const entry of cases) {
    assert.throws(
      () => serializeReservasWebForPublication(entry.config, entry.activities),
      (error: unknown) => error instanceof ReservasWebPublicationValidationError && entry.message.test(error.message)
    );
  }
});

test('publication contract transforms only Reservas Web instances and retains no administrative selection IDs', () => {
  const configA = setReservasWebActivityIds(createDefaultReservasWebConfig(), ['uuid-a']);
  const configB = setReservasWebActivityIds(createDefaultReservasWebConfig(), ['uuid-b']);
  const contract: RenderingContract = {
    theme: { primaryColor: '#000000', fontFamily: 'Inter' },
    sections: [
      { id: 'reservas-a', type: 'reservas_web', tipo: 'reservas_web', content: {}, settings: { el_reservas_web_config: configA } },
      { id: 'reservas-b', type: 'reservas_web', tipo: 'reservas_web', content: {}, settings: { el_reservas_web_config: configB } },
      contractWith(configA).sections[0]
    ]
  };
  const before = JSON.stringify(contract);

  const published = serializeReservasWebContractForPublication(contract, [activity('uuid-a', 'public-A'), activity('uuid-b', 'public-B')]);

  assert.deepEqual(published.sections[0].settings?.el_reservas_web_config.activities.publicActivityIdentifiers, ['public-A']);
  assert.deepEqual(published.sections[1].settings?.el_reservas_web_config.activities.publicActivityIdentifiers, ['public-B']);
  assert.deepEqual(published.sections[2], contract.sections[2]);
  assert.equal(JSON.stringify(published).includes('uuid-a'), false);
  assert.equal(JSON.stringify(contract), before);
});

test('editor configuration and preview remain administrative while publish uses the separated snapshot', () => {
  const config = setReservasWebActivityIds(createDefaultReservasWebConfig(), ['uuid-a']);
  const previewSource = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebPreview.tsx', import.meta.url), 'utf8');
  const settingsSource = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebSettings.tsx', import.meta.url), 'utf8');
  const constructorSource = fs.readFileSync(new URL('../src/components/constructor/WebConstructor.tsx', import.meta.url), 'utf8');

  assert.deepEqual(config.activities.activityIds, ['uuid-a']);
  assert.match(previewSource, /activityIds/);
  assert.match(settingsSource, /activityIds/);
  assert.match(constructorSource, /contentDraft: activeState/);
  assert.match(constructorSource, /content: publishedContract/);
  assert.doesNotMatch(previewSource, /fetch\(|publicActivityIdentifiers/);
});
