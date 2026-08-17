import assert from 'node:assert/strict';
import test from 'node:test';
import { checkPublicReservasWebContact, createPublicReservasWebReservation } from '../src/services/reservasWebPublicApi';

const input = { holdToken: 'active-public-hold-token-abcdefghijklmnopqrstuvwxyz', idempotencyKey: 'reservation-attempt-key', contactFirstName: 'Ana', contactLastName: 'Pérez', contactWhatsapp: '+506 8888 8888', paymentMethod: 'card' as const, participants: [{ firstName: 'Ana', lastName: 'Pérez', sex: 'female' as const, age: 36, identificationNumber: 'ID-1' }] };
test('public reservation submit uses age and preserves a missing canonical per-person amount as null', async () => {
  const originalFetch = globalThis.fetch; const requests: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => { requests.push({ url, init }); return requests.length === 1 ? new Response(JSON.stringify({ success: true, hasExistingReservation: true })) : new Response(JSON.stringify({ success: true, reservation: { reservationReference: 'RW-123', status: 'pending_payment', quantity: 1, totalAmount: 20, requiredNow: 10, pendingBalance: 10, paymentMode: 'deposit', currency: 'USD', payment: { method: 'card' } } }), { status: 201 }); }) as typeof fetch;
  try { assert.equal(await checkPublicReservasWebContact('public / id', input.contactWhatsapp, undefined, 'https://app.example.test'), true); const result = await createPublicReservasWebReservation(input, undefined, 'https://app.example.test'); assert.equal(result.reservation.perPersonPaymentAmount, null); assert.deepEqual(JSON.parse(String(requests[1].init?.body)), input); } finally { globalThis.fetch = originalFetch; }
});

test('public reservation DTO preserves canonical payment fields for DEPOSIT and FULL without recalculating them', async () => {
  const originalFetch = globalThis.fetch;
  const canonicalReservations = [
    { perPersonPaymentAmount: 25000, paymentUrl: 'https://pay.example.test/deposit', paymentReceiptWhatsapp: '+50680000001', paymentMode: 'deposit' },
    { perPersonPaymentAmount: 100000, paymentUrl: 'https://pay.example.test/full', paymentReceiptWhatsapp: '+50680000002', paymentMode: 'full' }
  ];
  let index = 0;
  globalThis.fetch = (async () => new Response(JSON.stringify({ success: true, reservation: { reservationReference: `RW-${index + 1}`, status: 'pending_payment', quantity: 1, totalAmount: 100000, requiredNow: canonicalReservations[index].perPersonPaymentAmount, pendingBalance: canonicalReservations[index].paymentMode === 'deposit' ? 75000 : 0, currency: 'CRC', payment: { method: 'card' }, ...canonicalReservations[index++] } }), { status: 201 })) as typeof fetch;
  try {
    const deposit = await createPublicReservasWebReservation({ ...input, paymentMode: 'deposit' }, undefined, 'https://app.example.test');
    const full = await createPublicReservasWebReservation({ ...input, paymentMode: 'full' }, undefined, 'https://app.example.test');
    assert.equal(deposit.reservation.perPersonPaymentAmount, 25000); assert.equal(deposit.reservation.paymentUrl, 'https://pay.example.test/deposit'); assert.equal(deposit.reservation.paymentReceiptWhatsapp, '+50680000001');
    assert.equal(full.reservation.perPersonPaymentAmount, 100000); assert.equal(full.reservation.paymentUrl, 'https://pay.example.test/full'); assert.equal(full.reservation.paymentReceiptWhatsapp, '+50680000002');
  } finally { globalThis.fetch = originalFetch; }
});
