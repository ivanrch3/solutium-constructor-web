import assert from 'node:assert/strict';
import test from 'node:test';
import { checkPublicReservasWebContact, createPublicReservasWebReservation } from '../src/services/reservasWebPublicApi';

const input = { holdToken: 'active-public-hold-token-abcdefghijklmnopqrstuvwxyz', idempotencyKey: 'reservation-attempt-key', contactFirstName: 'Ana', contactLastName: 'Pérez', contactWhatsapp: '+506 8888 8888', paymentMethod: 'card' as const, participants: [{ firstName: 'Ana', lastName: 'Pérez', sex: 'female' as const, age: 36, identificationNumber: 'ID-1' }] };
test('public reservation submit uses age and preserves a missing canonical per-person amount as null', async () => {
  const originalFetch = globalThis.fetch; const requests: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => { requests.push({ url, init }); return requests.length === 1 ? new Response(JSON.stringify({ success: true, hasExistingReservation: true })) : new Response(JSON.stringify({ success: true, reservation: { reservationReference: 'RW-123', status: 'pending_payment', quantity: 1, totalAmount: 20, requiredNow: 10, pendingBalance: 10, paymentMode: 'deposit', currency: 'USD', payment: { method: 'card' } } }), { status: 201 }); }) as typeof fetch;
  try { assert.equal(await checkPublicReservasWebContact('public / id', input.contactWhatsapp, undefined, 'https://app.example.test'), true); const result = await createPublicReservasWebReservation(input, undefined, 'https://app.example.test'); assert.equal(result.reservation.perPersonPaymentAmount, null); assert.deepEqual(JSON.parse(String(requests[1].init?.body)), input); } finally { globalThis.fetch = originalFetch; }
});
