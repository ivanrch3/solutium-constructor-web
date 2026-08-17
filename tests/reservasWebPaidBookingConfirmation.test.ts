import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReservasWebBookingResult } from '../src/components/constructor/modules/ReservasWebBookingStart';
import { PublicReservasWebActivityContent } from '../src/components/constructor/modules/PublicReservasWebModule';
import { createDefaultReservasWebConfig } from '../src/components/constructor/modules/reservasWebConfig';
import type { ReservasWebPublishedSnapshot } from '../src/components/constructor/modules/reservasWebPublishedContract';
import type { PublicReservasWebActivity, PublicReservasWebReservation } from '../src/services/reservasWebPublicApi';

const activity: PublicReservasWebActivity = { publicId: 'public-a', title: 'Taller', shortDescription: null, longDescription: null, image: 'https://images.example.test/header.jpg', facilitator: null, modality: '', location: null, maps: null, sessions: [], timezone: 'America/Costa_Rica', pricing: { isFree: false, regularPrice: 100000, promotionalPrice: null, promotionEndsAt: null, effectivePrice: 100000, currency: 'CRC', paymentMode: 'full', requiredAmount: 100000, pendingBalance: 0, depositRefundable: null }, paymentMethods: ['card'], booking: { enabled: false, closesAt: null, started: false, soldOut: false, waitlistAvailable: false }, waitlist: { enabled: false }, capacity: { visible: false }, countdownTarget: null };
const reservation = (overrides: Partial<PublicReservasWebReservation> = {}): PublicReservasWebReservation => ({ reservationReference: 'RW-123', status: 'pending_payment', confirmedAt: null, reservedAt: '2099-01-01T00:00:00.000Z', paymentDueAt: '2099-01-02T00:00:00.000Z', quantity: 1, totalAmount: 100000, requiredNow: 25000, pendingBalance: 75000, perPersonPaymentAmount: 25000, paymentMode: 'deposit', depositRefundable: false, currency: 'CRC', paymentUrl: 'https://pay.example.test/deposit', paymentReceiptWhatsapp: '+50688888888', payment: { method: 'card' }, ...overrides });

test('paid booking confirmation renders canonical settlement amounts and payment guidance', () => {
  const depositOne = renderToStaticMarkup(React.createElement(ReservasWebBookingResult, { activity, reservation: reservation() }));
  assert.match(depositOne, /Pago requerido ahora:.*25[.\s,]*000/);
  assert.doesNotMatch(depositOne, /Pago requerido ahora:.*100[.\s,]*000/);
  assert.match(depositOne, /Saldo pendiente:.*75[.\s,]*000/);
  assert.match(depositOne, /Pagar reserva.*25[.\s,]*000.*por persona/);
  assert.match(depositOne, /target="_blank"/);
  assert.match(depositOne, /rel="noopener noreferrer"/);
  assert.match(depositOne, /máximo de 24 horas/);
  assert.match(depositOne, /envía la imagen del comprobante al WhatsApp/);

  const depositThree = renderToStaticMarkup(React.createElement(ReservasWebBookingResult, { activity, reservation: reservation({ quantity: 3, totalAmount: 300000, requiredNow: 75000, pendingBalance: 225000 }) }));
  assert.match(depositThree, /Total:.*300[.\s,]*000/);
  assert.match(depositThree, /Pago requerido ahora:.*75[.\s,]*000/);
  assert.match(depositThree, /Saldo pendiente:.*225[.\s,]*000/);
  assert.match(depositThree, /Registraste 3 personas.*pago 3 veces/);

  const fullThree = renderToStaticMarkup(React.createElement(ReservasWebBookingResult, { activity, reservation: reservation({ quantity: 3, totalAmount: 300000, requiredNow: 300000, pendingBalance: 0, perPersonPaymentAmount: 100000, paymentMode: 'full', paymentUrl: 'https://pay.example.test/full' }) }));
  assert.match(fullThree, /Pagar total.*100[.\s,]*000.*por persona/);
  assert.match(fullThree, /href="https:\/\/pay\.example\.test\/full"/);
});

test('free confirmation has no Onvopay CTA and public header fills the card responsively', () => {
  const free = renderToStaticMarkup(React.createElement(ReservasWebBookingResult, { activity, reservation: reservation({ status: 'confirmed', paymentUrl: null, paymentReceiptWhatsapp: null, payment: { method: 'free' } }) }));
  assert.doesNotMatch(free, /Pagar reserva|Pagar total/);
  const snapshot: ReservasWebPublishedSnapshot = { ...createDefaultReservasWebConfig(), activities: { publicActivityIdentifiers: ['public-a'] } };
  const markup = renderToStaticMarkup(React.createElement(PublicReservasWebActivityContent, { moduleId: 'reservas-a', snapshot, activity }));
  assert.match(markup, /class="block w-full aspect-\[3\/1\] object-cover"/);
  assert.match(markup, /overflow-hidden/);
});
