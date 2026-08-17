import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReservasWebBookingResult } from '../src/components/constructor/modules/ReservasWebBookingStart';
import { PublicReservasWebActivityContent } from '../src/components/constructor/modules/PublicReservasWebModule';
import { createDefaultReservasWebConfig } from '../src/components/constructor/modules/reservasWebConfig';
import type { ReservasWebPublishedSnapshot } from '../src/components/constructor/modules/reservasWebPublishedContract';
import type { PublicReservasWebActivity, PublicReservasWebReservation } from '../src/services/reservasWebPublicApi';

const activity: PublicReservasWebActivity = { publicId: 'public-a', title: 'Taller', shortDescription: null, longDescription: null, image: null, facilitator: null, modality: '', location: null, maps: null, sessions: [], timezone: 'America/Costa_Rica', pricing: { isFree: false, regularPrice: 100000, promotionalPrice: null, promotionEndsAt: null, effectivePrice: 100000, currency: 'CRC', paymentOptions: ['full', 'deposit'], depositAmountPerPerson: 25000, depositRefundable: false }, paymentMethods: ['card', 'sinpe'], booking: { enabled: false, closesAt: null, started: false, soldOut: false, waitlistAvailable: false }, waitlist: { enabled: false }, capacity: { visible: true, total: 20, available: 9 }, countdownTarget: null };
const reservation = (overrides: Partial<PublicReservasWebReservation> = {}): PublicReservasWebReservation => ({ reservationReference: 'RW-123', status: 'pending_payment', confirmedAt: null, reservedAt: null, paymentDueAt: null, quantity: 1, totalAmount: 100000, requiredNow: 100000, pendingBalance: 0, perPersonPaymentAmount: 100000, paymentMode: 'full', depositRefundable: false, currency: 'CRC', paymentUrl: 'https://pay.example.test/full', paymentReceiptWhatsapp: '+50680000000', payment: { method: 'card' }, ...overrides });
const renderResult = (overrides: Partial<PublicReservasWebReservation> = {}) => renderToStaticMarkup(React.createElement(ReservasWebBookingResult, { activity, reservation: reservation(overrides) }));
const snapshot: ReservasWebPublishedSnapshot = { ...createDefaultReservasWebConfig(), activities: { publicActivityIdentifiers: ['public-a'] }, display: { showPrice: true, showTotalCapacity: true, showAvailableCapacity: true, showCountdown: true } };
const renderCard = (available: number, showAvailableCapacity = true) => renderToStaticMarkup(React.createElement(PublicReservasWebActivityContent, { moduleId: 'reservas-a', snapshot: { ...snapshot, display: { ...snapshot.display, showAvailableCapacity } }, activity: { ...activity, capacity: { visible: true, total: 20, available } } }));

test('FULL card confirmation keeps its CTA and hides a zero pending balance', () => {
  const markup = renderResult();
  assert.doesNotMatch(markup, /Saldo pendiente/); assert.match(markup, /Pagar total.*100[.\s,]*000.*por persona/); assert.match(markup, /href="https:\/\/pay\.example\.test\/full"/);
});

test('DEPOSIT continues to render its positive pending balance and payment CTA', () => {
  const markup = renderResult({ requiredNow: 25000, pendingBalance: 75000, perPersonPaymentAmount: 25000, paymentMode: 'deposit', paymentUrl: 'https://pay.example.test/deposit' });
  assert.match(markup, /Saldo pendiente:.*75[.\s,]*000/); assert.match(markup, /Pagar reserva.*25[.\s,]*000.*por persona/); assert.match(markup, /href="https:\/\/pay\.example\.test\/deposit"/);
});

test('FULL SINPE hides a zero pending balance and renders one combined instruction block', () => {
  const markup = renderResult({ payment: { method: 'sinpe', phone: '8888 1111', beneficiary: 'María Pérez' }, paymentReceiptWhatsapp: '+50680000000' });
  assert.doesNotMatch(markup, /Saldo pendiente/); assert.match(markup, /Por favor realizar el SINPE al número 8888 1111 a nombre de María Pérez, y enviar el comprobante del pago al WhatsApp \+50680000000\./); assert.doesNotMatch(markup, /SINPE:|Beneficiario:|Después de realizar el pago/);
  assert.equal(markup.match(/8888 1111/g)?.length, 1); assert.equal(markup.match(/María Pérez/g)?.length, 1); assert.equal(markup.match(/\+50680000000/g)?.length, 1);
});

test('numeric availability hides Cupos, while nonnumeric availability shows only Cupos and Limitados', () => {
  const numeric = renderCard(9); assert.match(numeric, /Disponibilidad.*Quedan 9 espacios/); assert.doesNotMatch(numeric, /<dt[^>]*>Cupos<\/dt>/);
  const nonnumeric = renderCard(11); assert.doesNotMatch(nonnumeric, /Disponibilidad|Quedan 11 espacios/); assert.match(nonnumeric, /<dt[^>]*>Cupos<\/dt><dd>Limitados<\/dd>/);
  const disabledNumeric = renderCard(9, false); assert.match(disabledNumeric, /<dt[^>]*>Cupos<\/dt><dd>Limitados<\/dd>/);
  assert.doesNotMatch(`${numeric}${nonnumeric}${disabledNumeric}`, /Cupo limitado|Cupos limitados/);
});
