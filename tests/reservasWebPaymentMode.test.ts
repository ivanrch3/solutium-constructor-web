import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildReservasWebConfirmDiagnostic, resolveReservasWebPaymentMode } from '../src/components/constructor/modules/ReservasWebBookingStart';
import type { PublicReservasWebActivity } from '../src/services/reservasWebPublicApi';

const activity: PublicReservasWebActivity = { publicId: 'public-a', title: 'Taller', shortDescription: null, longDescription: null, image: null, facilitator: null, modality: '', location: null, maps: null, sessions: [], timezone: 'America/Costa_Rica', pricing: { isFree: false, regularPrice: 100000, promotionalPrice: null, promotionEndsAt: null, effectivePrice: 100000, currency: 'CRC', paymentOptions: ['full', 'deposit'], depositAmountPerPerson: 25000, depositRefundable: false }, paymentMethods: ['card', 'sinpe'], booking: { enabled: true, closesAt: null, started: false, soldOut: false, waitlistAvailable: false }, waitlist: { enabled: false }, capacity: { visible: false }, countdownTarget: null };

test('payment mode initializes to full when full and deposit are available, and for only full', () => {
  assert.equal(resolveReservasWebPaymentMode(null, false, ['full', 'deposit']), 'full');
  assert.equal(resolveReservasWebPaymentMode(null, false, ['full']), 'full');
});

test('payment mode initializes to deposit when deposit is the only option', () => {
  assert.equal(resolveReservasWebPaymentMode(null, false, ['deposit']), 'deposit');
});

test('manual payment mode changes are retained while valid and invalid modes are revalidated', () => {
  assert.equal(resolveReservasWebPaymentMode('deposit', false, ['full', 'deposit']), 'deposit');
  assert.equal(resolveReservasWebPaymentMode('full', false, ['full', 'deposit']), 'full');
  assert.equal(resolveReservasWebPaymentMode('deposit', false, ['full']), 'full');
  assert.notEqual(resolveReservasWebPaymentMode(null, false, ['full', 'deposit']), null);
});

test('FULL with card or SINPE reaches the request attempt diagnostic and DEPOSIT remains valid', () => {
  for (const paymentMethod of ['card', 'sinpe'] as const) {
    const diagnostic = buildReservasWebConfirmDiagnostic({ activity, participantCount: 1, paymentMethod, paymentMode: 'full', holdValid: true, isDisabled: false, earlyReturnReason: null, requestAttempted: true });
    assert.equal(diagnostic.requestAttempted, true); assert.equal(diagnostic.paymentMode, 'full'); assert.equal(diagnostic.selectedPaymentOptionFound, true);
  }
  const deposit = buildReservasWebConfirmDiagnostic({ activity, participantCount: 1, paymentMethod: 'card', paymentMode: 'deposit', holdValid: true, isDisabled: false, earlyReturnReason: null, requestAttempted: true });
  assert.equal(deposit.requestAttempted, true); assert.equal(deposit.paymentMode, 'deposit');
});

test('payment mode radios use the canonical state without a visual fallback', () => {
  const source = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingStart.tsx', import.meta.url), 'utf8');
  assert.match(source, /const mode = paymentMode/); assert.match(source, /checked=\{mode === 'full'\}/); assert.match(source, /checked=\{mode === 'deposit'\}/); assert.doesNotMatch(source, /const mode = paymentMode \|\|/);
});
