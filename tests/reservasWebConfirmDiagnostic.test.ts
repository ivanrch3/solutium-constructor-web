import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReservasWebConfirmDiagnostic } from '../src/components/constructor/modules/ReservasWebBookingStart';
import type { PublicReservasWebActivity } from '../src/services/reservasWebPublicApi';

const activity: PublicReservasWebActivity = { publicId: 'public-a', title: 'Taller', shortDescription: null, longDescription: null, image: null, facilitator: null, modality: '', location: null, maps: null, sessions: [], timezone: 'America/Costa_Rica', pricing: { isFree: false, regularPrice: 100000, promotionalPrice: null, promotionEndsAt: null, effectivePrice: 100000, currency: 'CRC', paymentOptions: ['full', 'deposit'], depositAmountPerPerson: 25000, depositRefundable: false }, paymentMethods: ['card', 'sinpe'], booking: { enabled: true, closesAt: null, started: false, soldOut: false, waitlistAvailable: false }, waitlist: { enabled: false }, capacity: { visible: false }, countdownTarget: null };

test('confirm diagnostic records explicit early returns without PII', () => {
  const diagnostic = buildReservasWebConfirmDiagnostic({ activity, participantCount: 1, paymentMethod: 'card', paymentMode: 'full', holdValid: true, isDisabled: true, earlyReturnReason: 'payment_option_not_available', requestAttempted: false });
  assert.equal(diagnostic.earlyReturnReason, 'payment_option_not_available'); assert.equal(diagnostic.requestAttempted, false); assert.equal(diagnostic.perPersonPaymentAmount, 100000); assert.deepEqual(diagnostic.paymentOptions, ['full', 'deposit']);
  const serialized = JSON.stringify(diagnostic); assert.doesNotMatch(serialized, /Ana|Pérez|8888|holdToken|https?:\/\//i);
});

test('confirm diagnostic marks the reservation POST attempt and DEPOSIT amount', () => {
  const diagnostic = buildReservasWebConfirmDiagnostic({ activity, participantCount: 1, paymentMethod: 'sinpe', paymentMode: 'deposit', holdValid: true, isDisabled: false, earlyReturnReason: null, requestAttempted: true });
  assert.equal(diagnostic.requestAttempted, true); assert.equal(diagnostic.requiredAmount, 25000); assert.equal(diagnostic.perPersonPaymentAmount, 25000); assert.equal(diagnostic.selectedPaymentOptionFound, true);
});
