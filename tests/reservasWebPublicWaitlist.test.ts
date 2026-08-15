import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { joinPublicReservasWebWaitlist } from '../src/services/reservasWebPublicApi';

const input = { idempotencyKey: 'waitlist-key', quantity: 2, contactFirstName: 'Ana', contactLastName: 'Pérez', contactWhatsapp: '+506 8888 8888' };
test('waitlist client uses only the encoded public endpoint and safe payload', async () => {
  const original = globalThis.fetch; const requests: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => { requests.push({ url, init }); return new Response(JSON.stringify({ success: true, waitlist: { status: 'waiting', quantity: 2, createdAt: '2099-01-01T00:00:00Z' }, idempotentReplay: true }), { status: 201 }); }) as typeof fetch;
  try { const result = await joinPublicReservasWebWaitlist('public / id', input, undefined, 'https://app.example.test'); assert.equal(result.waitlist.status, 'waiting'); assert.equal(result.idempotentReplay, true); assert.equal(requests[0].url, 'https://app.example.test/api/public/reservas-web/activities/public%20%2F%20id/waitlist'); assert.deepEqual(JSON.parse(String(requests[0].init?.body)), input); assert.equal(requests[0].init?.credentials, 'omit'); assert.equal('Authorization' in (requests[0].init?.headers || {}), false); } finally { globalThis.fetch = original; }
});
test('waitlist UI uses only waitlist.enabled and has no hold, reservation, participant or storage behavior', () => {
  const api = fs.readFileSync(new URL('../src/services/reservasWebPublicApi.ts', import.meta.url), 'utf8'); const module = fs.readFileSync(new URL('../src/components/constructor/modules/PublicReservasWebModule.tsx', import.meta.url), 'utf8'); const form = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebWaitlistForm.tsx', import.meta.url), 'utf8');
  const sanitizer = api.slice(api.indexOf('const sanitizeActivity'), api.indexOf('export const joinPublicReservasWebWaitlist'));
  assert.match(api, /waitlist: \{ enabled: waitlist\.enabled === true \}/); assert.doesNotMatch(sanitizer, /waitlist:\s*\{\s*enabled:\s*(?:booking|capacity|[^\n]*soldOut|[^\n]*available)/); assert.match(module, /activity\.booking\.enabled \? <ReservasWebBookingStart/); assert.match(module, /activity\.waitlist\.enabled \? <ReservasWebWaitlistForm/); assert.doesNotMatch(form, /localStorage|sessionStorage|\/holds|\/reservations|participant|birthDate|identificationNumber|console\./i); assert.match(form, /CAPACITY_AVAILABLE/); assert.match(form, /onRefreshActivity\(\)/); assert.match(form, /IDEMPOTENCY_CONFLICT/); assert.match(form, /restartRequired \? 'Iniciar de nuevo' : 'Reintentar'/);
});
