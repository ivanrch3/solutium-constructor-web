import assert from 'node:assert/strict';
import test from 'node:test';
import { getReservasWebFinalReadiness } from '../src/components/constructor/modules/ReservasWebActivityForm';
import { getReservasWebActivityReadinessMessage } from '../src/components/constructor/modules/ReservasWebSettings';

const activity = (status: string) => ({
  id: 'activity', catalogItemId: 'catalog', catalogItemName: 'Catálogo', catalogItemImageUrl: null, title: 'Actividad', shortDescription: null,
  facilitator: null, modality: 'presencial', status, archivedAt: null, bookable: true, readinessReasons: [], timezone: 'America/Costa_Rica',
  sessionsSummary: { count: 1, firstStartsAt: '2026-09-01T10:00:00Z', firstEndsAt: '2026-09-01T11:00:00Z' }, totalCapacity: 2,
  isFree: true, regularPrice: 0, promotionalPrice: null, promotionEndsAt: null, currency: 'CRC', selectedWhatsAppChannelId: null, whatsappReadiness: 'ready' as const
});

test('complete draft activity is ready to publish, not ready for reservations', () => {
  assert.equal(getReservasWebActivityReadinessMessage(activity('draft')), 'LISTA PARA PUBLICAR · No hay configuraciones pendientes.');
  assert.equal(getReservasWebFinalReadiness({ archivedAt: null, status: 'draft', readiness: { bookable: true, reasons: [], whatsapp: 'ready' } }).title, 'LISTA PARA PUBLICAR');
});

test('complete active activity is ready for reservations', () => {
  assert.equal(getReservasWebActivityReadinessMessage(activity('active')), 'LISTA PARA RESERVAS · No hay configuraciones pendientes.');
  assert.equal(getReservasWebFinalReadiness({ archivedAt: null, status: 'active', readiness: { bookable: true, reasons: [], whatsapp: 'ready' } }).title, 'LISTA PARA RESERVAS');
});
