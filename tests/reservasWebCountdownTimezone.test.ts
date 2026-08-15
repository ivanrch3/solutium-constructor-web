import assert from 'node:assert/strict';
import test from 'node:test';
import { getPublicReservasWebCountdown } from '../src/components/constructor/modules/PublicReservasWebModule';

test('calendar day in the activity timezone distinguishes tomorrow from today even below 24 hours', () => {
  const now = Date.parse('2026-08-15T18:00:00.000Z'); // 15 Aug 12:00 Costa Rica
  const tomorrow = '2026-08-16T11:37:00.000Z'; // 16 Aug 05:37 Costa Rica
  const label = getPublicReservasWebCountdown(tomorrow, now, 'America/Costa_Rica');
  assert.notEqual(label, 'El taller es hoy');
  assert.match(label || '', /h|min/);
  assert.equal(getPublicReservasWebCountdown('2026-08-16T00:00:00.000Z', now, 'America/Costa_Rica'), 'El taller es hoy');
});
