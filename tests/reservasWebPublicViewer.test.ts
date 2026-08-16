import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createDefaultReservasWebConfig } from '../src/components/constructor/modules/reservasWebConfig';
import type { ReservasWebPublishedSnapshot } from '../src/components/constructor/modules/reservasWebPublishedContract';
import { PublicReservasWebActivityContent, PublicReservasWebModule, getPublicReservasWebCountdown } from '../src/components/constructor/modules/PublicReservasWebModule';
import { getPrimaryPublicReservasWebActivityIdentifier, readReservasWebPublishedSnapshot } from '../src/components/constructor/modules/reservasWebPublicContract';
import { buildPublicReservasWebActivityUrl, getPublicReservasWebActivity, PublicReservasWebApiError, type PublicReservasWebActivity } from '../src/services/reservasWebPublicApi';

const snapshot: ReservasWebPublishedSnapshot = {
  ...createDefaultReservasWebConfig(),
  activities: { publicActivityIdentifiers: ['public-activity-A'] },
  content: { reserveButtonLabel: 'Apartar cupo' },
  display: { showPrice: true, showTotalCapacity: true, showAvailableCapacity: true, showCountdown: true }
};

const activity: PublicReservasWebActivity = {
  publicId: 'public-activity-A', title: 'Taller público', shortDescription: 'Descripción pública', longDescription: null, image: null, facilitator: 'Ana', modality: 'Híbrida', location: 'San José', maps: 'https://maps.example.test/location', sessions: [{ startsAt: '2099-08-20T14:00:00.000Z', endsAt: '2099-08-20T15:00:00.000Z', sequence: 1 }], timezone: 'America/Costa_Rica', pricing: { isFree: false, regularPrice: 100, promotionalPrice: null, promotionEndsAt: null, effectivePrice: 80, currency: 'USD', paymentMode: 'full', requiredAmount: 80, pendingBalance: 0, depositRefundable: null }, paymentMethods: ['sinpe', 'card'], booking: { enabled: true, closesAt: null, started: false, soldOut: false, waitlistAvailable: false }, waitlist: { enabled: false }, capacity: { visible: true, total: 12, available: 5 }, countdownTarget: '2099-08-20T14:00:00.000Z'
};

test('published contract only accepts public identifiers and never falls back to activityIds', () => {
  assert.equal(getPrimaryPublicReservasWebActivityIdentifier(snapshot), 'public-activity-A');
  assert.equal(getPrimaryPublicReservasWebActivityIdentifier({ ...snapshot, activities: { publicActivityIdentifiers: [] } }), null);
  assert.equal(readReservasWebPublishedSnapshot({ ...snapshot, activities: { activityIds: ['internal-uuid'] } }), null);
  assert.equal(getPrimaryPublicReservasWebActivityIdentifier(readReservasWebPublishedSnapshot({ activities: { activityIds: ['internal-uuid'] } })), null);
});

test('public client encodes the opaque identifier, omits credentials, and handles public outcomes', async () => {
  assert.equal(buildPublicReservasWebActivityUrl('value / ? #', 'https://app.example.test/'), 'https://app.example.test/api/public/reservas-web/activities/value%20%2F%20%3F%20%23');
  const originalFetch = globalThis.fetch;
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    requests.push({ url, init });
    return new Response(JSON.stringify({ success: true, activity }), { status: 200 });
  }) as typeof fetch;
  try {
    const result = await getPublicReservasWebActivity('public-activity-A', undefined, 'https://app.example.test');
    assert.equal(result?.title, 'Taller público');
    assert.equal(requests[0].init?.credentials, 'omit');
    assert.equal('Authorization' in (requests[0].init?.headers || {}), false);
    globalThis.fetch = (async () => new Response('{}', { status: 404 })) as typeof fetch;
    assert.equal(await getPublicReservasWebActivity('public-activity-A', undefined, 'https://app.example.test'), null);
    globalThis.fetch = (async () => new Response('{}', { status: 503 })) as typeof fetch;
    await assert.rejects(() => getPublicReservasWebActivity('public-activity-A', undefined, 'https://app.example.test'), PublicReservasWebApiError);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('public module renders only the live DTO, public display controls, and the booking CTA', () => {
  const markup = renderToStaticMarkup(React.createElement(PublicReservasWebActivityContent, { moduleId: 'reservas-a', snapshot, activity }));
  assert.match(markup, /Taller público|Taller p/);
  assert.match(markup, /Descripción pública|Descripci/);
  assert.match(markup, /Ana/);
  assert.match(markup, /Híbrida|H.brida/);
  assert.match(markup, /San José|San Jos/);
  assert.match(markup, /80/);
  assert.match(markup, /Capacidad total: 12/);
  assert.match(markup, /Cupos disponibles: 5/);
  assert.match(markup, /Apartar cupo/);
  assert.match(markup, /Apartar cupo/);
  assert.doesNotMatch(markup, /privateVirtualUrl|selectedWhatsAppChannelId|contactWhatsapp|SINPE|Onvopay/);
  assert.doesNotMatch(renderToStaticMarkup(React.createElement(PublicReservasWebActivityContent, { moduleId: 'reservas-a', snapshot: { ...snapshot, display: { ...snapshot.display, showPrice: false, showTotalCapacity: false, showAvailableCapacity: false, showCountdown: false } }, activity })), /Precio|Capacidad total|Cupos disponibles|Cuenta regresiva/);
  assert.match(renderToStaticMarkup(React.createElement(PublicReservasWebModule, { moduleId: 'legacy', snapshot: null, enabled: true })), /Esta actividad no está disponible|Esta actividad no est/);
});

test('countdown remains a presentation helper and Viewer stays public-read-only', () => {
  const now = Date.parse('2099-08-20T00:00:00.000Z');
  assert.match(getPublicReservasWebCountdown('2099-08-21T02:03:00.000Z', now) || '', /1 d 2 h 3 min/);
  assert.equal(getPublicReservasWebCountdown('2099-08-20T02:03:00.000Z', now), 'El taller es hoy');
  assert.equal(getPublicReservasWebCountdown('2099-08-19T02:03:00.000Z', now), null);
  const source = fs.readFileSync(new URL('../src/components/constructor/modules/PublicReservasWebModule.tsx', import.meta.url), 'utf8');
  const apiSource = fs.readFileSync(new URL('../src/services/reservasWebPublicApi.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /privateVirtualUrl|activityIds|POST|holds|reservations|whatsapp/i);
  assert.doesNotMatch(apiSource, /Authorization|Bearer/i);
});
