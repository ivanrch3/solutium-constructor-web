import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createPublicReservasWebHold, PublicReservasWebHoldError } from '../src/services/reservasWebPublicApi';
import { getHoldCountdownLabel } from '../src/components/constructor/modules/ReservasWebBookingStart';

test('public hold client posts the real contract with encoded identifier and no administrative credentials', async () => {
  const originalFetch = globalThis.fetch;
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    requests.push({ url, init });
    return new Response(JSON.stringify({ success: true, holdToken: 'ephemeral-token', expiresAt: '2099-08-20T14:03:00.000Z', quantity: 2, availableCapacity: 8, idempotentReplay: false }), { status: 201 });
  }) as typeof fetch;
  try {
    const result = await createPublicReservasWebHold('public / value', 2, 'attempt-key', undefined, 'https://app.example.test');
    assert.deepEqual(result, { holdToken: 'ephemeral-token', expiresAt: '2099-08-20T14:03:00.000Z', quantity: 2, availableCapacity: 8, idempotentReplay: false });
    assert.equal(requests[0].url, 'https://app.example.test/api/public/reservas-web/activities/public%20%2F%20value/holds');
    assert.equal(requests[0].init?.method, 'POST');
    assert.equal(requests[0].init?.credentials, 'omit');
    assert.deepEqual(JSON.parse(String(requests[0].init?.body)), { quantity: 2, idempotencyKey: 'attempt-key' });
    assert.equal('Authorization' in (requests[0].init?.headers || {}), false);
  } finally { globalThis.fetch = originalFetch; }
});

test('hold failures retain only public error codes and the expiry countdown follows backend expiresAt', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({ success: false, error: 'NO_CAPACITY' }), { status: 409 })) as typeof fetch;
  try {
    await assert.rejects(() => createPublicReservasWebHold('public-a', 2, 'attempt-key', undefined, 'https://app.example.test'), (error: unknown) => error instanceof PublicReservasWebHoldError && error.code === 'NO_CAPACITY');
  } finally { globalThis.fetch = originalFetch; }
  const now = Date.parse('2099-08-20T14:00:00.000Z');
  assert.equal(getHoldCountdownLabel('2099-08-20T14:03:00.000Z', now), '03:00');
  assert.equal(getHoldCountdownLabel('2099-08-20T14:00:00.000Z', now), null);
});

test('hold and reservation flow keeps tokens and PII only in memory', () => {
  const source = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingStart.tsx', import.meta.url), 'utf8');
  const api = fs.readFileSync(new URL('../src/services/reservasWebPublicApi.ts', import.meta.url), 'utf8');
  assert.match(source, /holdKey/);
  assert.match(source, /useState<PublicReservasWebHold/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|settingsValues|console\./i);
  assert.doesNotMatch(api, /Authorization|Bearer/i);
});
