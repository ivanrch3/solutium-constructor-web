import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReservasWebBookingResult } from '../src/components/constructor/modules/ReservasWebBookingStart';
import type { PublicReservasWebActivity, PublicReservasWebReservation } from '../src/services/reservasWebPublicApi';

const activity: PublicReservasWebActivity = { publicId: 'a', title: 'Taller', shortDescription: null, longDescription: null, image: null, facilitator: null, modality: 'virtual', location: null, maps: null, sessions: [], timezone: 'America/Costa_Rica', pricing: { isFree: false, regularPrice: 100000, promotionalPrice: null, promotionEndsAt: null, effectivePrice: 100000, currency: 'CRC', paymentOptions: ['deposit'], depositAmountPerPerson: 25000, depositRefundable: false }, paymentMethods: ['card'], booking: { enabled: false, closesAt: null, started: false, soldOut: false, waitlistAvailable: false }, waitlist: { enabled: false }, capacity: { visible: false }, countdownTarget: null };
const reservation = (perPersonPaymentAmount: number | null): PublicReservasWebReservation => ({ reservationReference: 'RW-1', status: 'pending_payment', confirmedAt: null, reservedAt: null, paymentDueAt: null, quantity: 2, totalAmount: 200000, requiredNow: 50000, pendingBalance: 150000, perPersonPaymentAmount, paymentMode: 'deposit', depositRefundable: false, currency: 'CRC', paymentUrl: 'https://pay.example', paymentReceiptWhatsapp: '+50688888888', payment: { method: 'card' } });

test('payment CTA uses the canonical per-person amount, avoids false zeroes, and precedes the 24-hour notice', () => {
  const markup = renderToStaticMarkup(React.createElement(ReservasWebBookingResult, { activity, reservation: reservation(25000) }));
  assert.match(markup, /enlace de pago corresponde a.*25[.\s,]*000.*pago 2 veces/); assert.match(markup, /Pagar reserva.*25[.\s,]*000.*por persona/); assert.ok(markup.indexOf('Pagar reserva') < markup.indexOf('24 horas'));
  const missing = renderToStaticMarkup(React.createElement(ReservasWebBookingResult, { activity, reservation: reservation(null) })); assert.doesNotMatch(missing, /Pagar reserva.*0[.\s,]*00/); assert.match(missing, /No fue posible determinar el monto por persona/);
});
