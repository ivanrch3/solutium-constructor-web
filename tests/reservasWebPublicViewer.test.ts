import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createDefaultReservasWebConfig } from '../src/components/constructor/modules/reservasWebConfig';
import type { ReservasWebPublishedSnapshot } from '../src/components/constructor/modules/reservasWebPublishedContract';
import { PublicReservasWebActivityContent } from '../src/components/constructor/modules/PublicReservasWebModule';
import type { PublicReservasWebActivity } from '../src/services/reservasWebPublicApi';

const snapshot: ReservasWebPublishedSnapshot = { ...createDefaultReservasWebConfig(), activities: { publicActivityIdentifiers: ['public-activity-A'] }, content: { reserveButtonLabel: 'Apartar cupo' }, display: { showPrice: true, showTotalCapacity: true, showAvailableCapacity: true, showCountdown: true } };
const activity = (overrides: Partial<PublicReservasWebActivity> = {}): PublicReservasWebActivity => ({ publicId: 'public-activity-A', title: 'Taller público', shortDescription: null, longDescription: null, image: null, facilitator: null, modality: 'virtual', location: null, maps: null, sessions: [], timezone: 'America/Costa_Rica', pricing: { isFree: false, regularPrice: 100000, promotionalPrice: null, promotionEndsAt: null, effectivePrice: 100000, currency: 'CRC', paymentOptions: ['deposit'], depositAmountPerPerson: 25000, paymentMode: 'deposit', requiredAmount: 100000, pendingBalance: 0, depositRefundable: false }, paymentMethods: ['card'], booking: { enabled: true, closesAt: null, started: false, soldOut: false, waitlistAvailable: false }, waitlist: { enabled: false }, capacity: { visible: true, total: 20, available: 17 }, countdownTarget: null, ...overrides });
const render = (overrides: Partial<PublicReservasWebActivity> = {}) => renderToStaticMarkup(React.createElement(PublicReservasWebActivityContent, { moduleId: 'reservas-a', snapshot, activity: activity(overrides) }));

test('public deposit amount uses depositAmountPerPerson rather than regular price and does not expose the pending balance', () => { const markup = render(); assert.match(markup, /Pago requerido para reservar.*25[.\s,]*000.*por persona/); assert.doesNotMatch(markup, /Pago requerido para reservar.*100[.\s,]*000.*por persona/); assert.doesNotMatch(markup, /Saldo pendiente por persona/); });
test('public capacity never renders total and uses limited availability disclosure', () => { const aboveTen = render(); assert.match(aboveTen, /Cupo limitado/); assert.doesNotMatch(aboveTen, /Capacidad total|Quedan 17 espacios/); const ten = render({ capacity: { visible: true, total: 20, available: 10 } }); assert.match(ten, /Quedan 10 espacios/); const one = render({ capacity: { visible: true, total: 20, available: 1 } }); assert.match(one, /Queda 1 espacio/); });
test('presencial hides modality while virtual and hybrid retain it', () => { assert.doesNotMatch(render({ modality: 'presencial' }), /Modalidad|presencial/); assert.match(render({ modality: 'virtual' }), /Modalidad.*virtual/); assert.match(render({ modality: 'hybrid' }), /Modalidad.*hybrid/); });
