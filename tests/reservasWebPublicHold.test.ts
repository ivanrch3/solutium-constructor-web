import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createPublicReservasWebHold, PublicReservasWebHoldError } from '../src/services/reservasWebPublicApi';
import { getHoldCountdownLabel, isReservasWebHoldExpired } from '../src/components/constructor/modules/ReservasWebBookingStart';

test('public hold client consumes the real backend expiresAt contract', async () => {
  const originalFetch = globalThis.fetch; const requests: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => { requests.push({ url, init }); return new Response(JSON.stringify({ success: true, holdToken: 'ephemeral-token', expiresAt: '2099-08-20T14:03:00.000Z', quantity: 2, availableCapacity: 8, idempotentReplay: false }), { status: 201 }); }) as typeof fetch;
  try { const result = await createPublicReservasWebHold('public / value', 2, 'attempt-key', undefined, 'https://app.example.test'); assert.equal(result.expiresAt, '2099-08-20T14:03:00.000Z'); assert.equal(requests[0].init?.credentials, 'omit'); } finally { globalThis.fetch = originalFetch; }
});
test('expired holds are recognized from expiresAt and never renewed silently', async () => {
  const now = Date.parse('2099-08-20T14:00:00.000Z'); assert.equal(getHoldCountdownLabel('2099-08-20T14:03:00.000Z', now), '03:00'); assert.equal(isReservasWebHoldExpired('2099-08-20T14:00:00.000Z', now), true);
  const source = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingStart.tsx', import.meta.url), 'utf8'); assert.match(source, /hold_expired/); assert.match(source, /expiresAt/); assert.doesNotMatch(source, /localStorage|sessionStorage|setTimeout/i);
  const originalFetch = globalThis.fetch; globalThis.fetch = (async () => new Response(JSON.stringify({ success: false, error: 'NO_CAPACITY' }), { status: 409 })) as typeof fetch; try { await assert.rejects(() => createPublicReservasWebHold('public-a', 2, 'attempt-key', undefined, 'https://app.example.test'), PublicReservasWebHoldError); } finally { globalThis.fetch = originalFetch; }
});
